/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

import { QASMLexer } from "./QASMLexer.js";
import { QASMParser } from "./QASMParser.js";
import { QASMListener } from "./QASMListener.js";
import {
	CommonTokenStream,
	ErrorListener,
	InputStream,
	ParseTreeWalker,
} from "antlr4";

const ErrorListenerQ = function (errors) {
	ErrorListener.call(this);
	this.errors = errors;
	return this;
};

ErrorListenerQ.prototype = Object.create(ErrorListenerQ.prototype);
ErrorListenerQ.prototype.constructor = ErrorListener;
ErrorListenerQ.prototype.syntaxError = function (rec, sym, line, col, msg, e) {
	this.errors.push({
		line: line,
		col: col,
		msg: msg,
	});
};

class QCQASMListener extends QASMListener {
	constructor(circuit, compatibilityMode) {
		super();
		this.circuit = circuit;
		this.qregMap = {};
		this.condition = {};
		this.compatibilityMode = compatibilityMode;
	}

	numQbit = function () {
		let num = 0;
		for (const reg in this.qregMap) {
			num += this.qregMap[reg];
		}
		return num;
	};

	qregBase = function (qreg) {
		let base = 0;
		for (const reg in this.qregMap) {
			if (reg === qreg) {
				return base;
			}
			base += this.qregMap[reg];
		}
		return base;
	};

	qregLen = function (reg) {
		return this.qregMap[reg] || 0;
	};

	// Enter a parse tree produced by QASMParser#mainprog.
	enterMainprog = function (ctx) {};

	// Exit a parse tree produced by QASMParser#mainprog.
	exitMainprog = function (ctx) {};

	// Enter a parse tree produced by QASMParser#statement.
	enterStatement = function (ctx) {
		const self = this;

		// condition
		const name = ctx.getChildCount() ? ctx.getChild(0).getText() : "";
		if (name === "if") {
			this.condition = {
				creg: ctx.ID().getText(),
				value: parseInt(ctx.INT().getText()),
			};
		}

		// subroutine (gate declaration)
		if (ctx.gatedecl()) {
			const gatedecl = ctx.gatedecl();
			let args = [];
			let params = [];

			const ccount = gatedecl.getChildCount();
			if (ccount > 2 && gatedecl.getChild(2).ID) {
				// no params
				args = gatedecl.getChild(2).ID();
			} else {
				if (ccount > 3 && gatedecl.getChild(3).ID) {
					params = gatedecl.getChild(3).ID();
				}
				if (ccount > 5 && gatedecl.getChild(5).ID) {
					// no params
					args = gatedecl.getChild(5).ID();
				}
			}

			const proto = Object.getPrototypeOf(this.circuit);
			const customGate = new proto.constructor(args.length);
			const customGateName = gatedecl.ID().getText();
			const customGateRegs = [];

			args.map(function (reg) {
				customGateRegs.push(reg.getText());
			});

			params.map(function (par) {
				const parName = par.getText();
				customGate.params.push(parName);
			});

			if (ctx.goplist()) {
				const goplist = ctx.goplist();
				goplist.uop().map(function (uop) {
					let gateName = uop.ID() ? uop.ID().getText() : "";
					if (gateName) {
						const idlist = uop.anylist() ? uop.anylist().idlist() : null;
						const mixedlist = uop.anylist() ? uop.anylist().mixedlist() : null;
						const explist = uop.explist();

						switch (gateName) {
							case "CX":
								gateName = "cx";
								break;
							case "U":
								gateName = "u3";
								break;
						}

						if (
							!self.circuit.basicGates[gateName] &&
							!self.circuit.customGates[gateName]
						) {
							// find gate by qasm name
							for (const tmpName in self.circuit.basicGates) {
								const tmpDef = self.circuit.basicGates[tmpName];
								if (
									tmpDef.exportInfo &&
									tmpDef.exportInfo.qasm &&
									tmpDef.exportInfo.qasm.name &&
									tmpDef.exportInfo.qasm.name === gateName
								) {
									gateName = tmpName;
									break;
								}
								// newer versions of qiskit exports to qasm with gate names undefined by qasm 2.0 definition...
								if (
									tmpDef.exportInfo &&
									tmpDef.exportInfo.qiskit &&
									tmpDef.exportInfo.qiskit.name &&
									tmpDef.exportInfo.qiskit.name === gateName
								) {
									gateName = tmpName;
									break;
								}
							}
						}

						const params = {};
						if (explist && explist.exp()) {
							let gateDef = self.circuit.basicGates[gateName];
							if (!gateDef) {
								gateDef = self.circuit.customGates[gateName];
							}

							if (gateDef) {
								const paramList = explist.exp();
								const paramDef = gateDef.params || [];
								paramList.map(function (paramItem, paramIndex) {
									const paramValue = paramItem.getText();
									const paramName =
										paramDef.length >= paramIndex ? paramDef[paramIndex] : "";
									if (paramName) {
										params[paramName] = paramValue;
									}
								});
							}
						}

						const options = { params: params };

						const wires = [];

						if (idlist) {
							const count = idlist.ID().length;
							for (let i = 0; i < count; i++) {
								wires.push(customGateRegs.indexOf(idlist.ID()[i].getText()));
							}
						}

						if (mixedlist) {
							// ?
						}

						/*
                                                        if(!self.compatibilityMode) {
                                                            switch(gateName) {
                                                                case "rz": {
                                                                    gateName = "u1";
                                                                    if(options && options.params && options.params.phi) {
                                                                        options.params.lambda = options.params.phi;
                                                                        delete options.params.phi;
                                                                    }
                                                                }; break;
                                                            }
                                                        }
                                    */
						const external = self.circuit.customGates[gateName];
						if (external) {
							customGate.registerGate(
								gateName,
								JSON.parse(JSON.stringify(external)),
							);
						}

						customGate.addGate(gateName, -1, wires, options);
					}
				});
			}

			this.circuit.registerGate(customGateName, customGate.save(false));
		}
	};

	// Exit a parse tree produced by QASMParser#statement.
	exitStatement = function (ctx) {};

	// Enter a parse tree produced by QASMParser#version.
	enterVersion = function (ctx) {};

	// Exit a parse tree produced by QASMParser#version.
	exitVersion = function (ctx) {};

	// Enter a parse tree produced by QASMParser#decl.
	enterDecl = function (ctx) {
		switch (ctx.getChild(0).getText()) {
			case "qreg":
				this.qregMap[ctx.getChild(1).getText()] = parseInt(
					ctx.getChild(3).getText(),
				);
				break;
			case "creg":
				this.circuit.createCreg(
					ctx.getChild(1).getText(),
					parseInt(ctx.getChild(3).getText()),
				);
				break;
		}
	};

	// Exit a parse tree produced by QASMParser#decl.
	exitDecl = function (ctx) {};

	// Enter a parse tree produced by QASMParser#gatedecl.
	enterGatedecl = function (ctx) {};

	// Exit a parse tree produced by QASMParser#gatedecl.
	exitGatedecl = function (ctx) {};

	// Enter a parse tree produced by QASMParser#goplist.
	enterGoplist = function (ctx) {};

	// Exit a parse tree produced by QASMParser#goplist.
	exitGoplist = function (ctx) {};

	// Enter a parse tree produced by QASMParser#qop.
	enterQop = function (ctx) {
		const self = this;
		const condition = JSON.parse(JSON.stringify(this.condition));
		this.condition = {};

		const name = ctx.getChildCount() ? ctx.getChild(0).getText() : "";

		if (name === "reset") {
			let qreg = "";
			let qbit = -1;
			const count = ctx.argument().length;
			for (let i = 0; i < count; i++) {
				const arg = ctx.argument()[i];
				if (i === 0) {
					qreg = arg.ID().getText();
					qbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
				}
			}

			if (qreg) {
				const numBits = self.qregLen(qreg);
				if (qbit < 0) {
					//
					// argument is entire register
					//
					for (let x = 0; x < numBits; x++) {
						self.circuit.addGate("reset", -1, x + self.qregBase(qreg), {
							condition: condition || {},
						});
					}
				} else {
					//
					// both arguments are single bits
					//
					self.circuit.addGate("reset", -1, qbit + self.qregBase(qreg), {
						condition: condition || {},
					});
				}
			}
		}

		if (name === "measure") {
			let qreg = "";
			let qbit = -1;
			let creg = "";
			let cbit = -1;
			const count = ctx.argument().length;
			for (let i = 0; i < count; i++) {
				const arg = ctx.argument()[i];
				if (i === 0) {
					qreg = arg.ID().getText();
					qbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
				}
				if (i === 1) {
					creg = arg.ID().getText();
					cbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
				}
			}

			if (qreg && creg) {
				const numBits = self.qregLen(qreg);
				if (qbit < 0 && cbit < 0) {
					//
					// both arguments are entire registers
					//
					for (let x = 0; x < numBits; x++) {
						self.circuit.addGate("measure", -1, x + self.qregBase(qreg), {
							creg: { name: creg, bit: x },
							condition: condition || {},
						});
					}
				} else {
					if (qbit >= 0 && cbit >= 0) {
						//
						// both arguments are single bits
						//
						self.circuit.addGate("measure", -1, qbit + self.qregBase(qreg), {
							creg: { name: creg, bit: cbit },
							condition: condition || {},
						});
					} else {
						if (qbit >= 0 && cbit < 0) {
							//
							// qbit is single, creg is entire register
							//
							for (let x = 0; x < numBits; x++) {
								self.circuit.addGate(
									"measure",
									-1,
									qbit + self.qregBase(qreg),
									{ creg: { name: creg, bit: x }, condition: condition || {} },
								);
							}
						} else {
							//
							// qbit is entire register, creg is single bit
							//
							for (let x = 0; x < numBits; x++) {
								self.circuit.addGate("measure", -1, x + self.qregBase(qreg), {
									creg: { name: creg, bit: cbit },
									condition: condition || {},
								});
							}
						}
					}
				}
			}
		}

		const uop = ctx.uop();
		if (uop && uop.ID()) {
			let gateName = uop.ID().getText();
			const idlist = uop.anylist() ? uop.anylist().idlist() : null;
			const mixedlist = uop.anylist() ? uop.anylist().mixedlist() : null;
			const explist = uop.explist();

			switch (gateName) {
				case "CX":
					gateName = "cx";
					break;
				case "U":
					gateName = "u3";
					break;
			}

			if (
				!self.circuit.basicGates[gateName] &&
				!self.circuit.customGates[gateName]
			) {
				// find gate by qasm name
				for (const tmpName in self.circuit.basicGates) {
					const tmpDef = self.circuit.basicGates[tmpName];
					if (
						tmpDef.exportInfo &&
						tmpDef.exportInfo.qasm &&
						tmpDef.exportInfo.qasm.name &&
						tmpDef.exportInfo.qasm.name === gateName
					) {
						gateName = tmpName;
						break;
					}
					// newer versions of qiskit exports to qasm with gate names undefined by qasm 2.0 definition...
					if (
						tmpDef.exportInfo &&
						tmpDef.exportInfo.qiskit &&
						tmpDef.exportInfo.qiskit.name &&
						tmpDef.exportInfo.qiskit.name === gateName
					) {
						gateName = tmpName;
						break;
					}
				}
			}

			const params = {};
			if (explist && explist.exp()) {
				let gateDef = self.circuit.basicGates[gateName];
				if (!gateDef) {
					gateDef = self.circuit.customGates[gateName];
				}
				if (gateDef) {
					const paramList = explist.exp();
					const paramDef = gateDef.params || [];
					paramList.map(function (paramItem, paramIndex) {
						const paramValue = paramItem.getText();
						const paramName =
							paramDef.length >= paramIndex ? paramDef[paramIndex] : "";
						if (paramName) {
							params[paramName] = paramValue;
						}
					});
				}
			}

			const options = { params: params, condition: condition || {} };

			if (idlist) {
				//
				// arguments are entire registers
				//   example: cx q,r;
				//
				const numBits = self.qregLen(idlist.ID()[0].getText());
				for (let x = 0; x < numBits; x++) {
					const args = [];
					const count = idlist.ID().length;
					for (let i = 0; i < count; i++) {
						args.push({ reg: idlist.ID()[i].getText(), bit: x });
					}

					const wires = [];
					args.map(function (a) {
						wires.push(a.bit + self.qregBase(a.reg));
					});
					/*
                                              if(!self.compatibilityMode) {
                                                  switch(gateName) {
                                                      case "rz": {
                                                          gateName = "u1";
                                                          if(options && options.params && options.params.phi) {
                                                              options.params.lambda = options.params.phi;
                                                              delete options.params.phi;
                                                          }
                                                      }; break;
                                                  }
                                              }
                              */
					self.circuit.addGate(gateName, -1, wires, options);
				}
			}

			// arguments are qbits or mixed
			if (mixedlist) {
				if (mixedlist.ID().length !== mixedlist.INT().length) {
					//
					// TODO: mixed qbits and entire registers
					//       example: cx q,r[0];
					//
				} else {
					//
					// qbits, for example: cx q[0],r[0];
					//
					const args = [];
					const count = mixedlist.ID().length;
					for (let i = 0; i < count; i++) {
						args.push({
							reg: mixedlist.ID()[i].getText(),
							bit: parseInt(mixedlist.INT()[i].getText()),
						});
					}

					const wires = [];
					args.map(function (a) {
						wires.push(a.bit + self.qregBase(a.reg));
					});
					/*
                                              if(!self.compatibilityMode) {
                                                  switch(gateName) {
                                                      case "rz": {
                                                          gateName = "u1";
                                                          if(options && options.params && options.params.phi) {
                                                              options.params.lambda = options.params.phi;
                                                              delete options.params.phi;
                                                          }
                                                      }; break;
                                                  }
                                              }
                              */
					self.circuit.addGate(gateName, -1, wires, options);
				}
			}
		}
	};

	// Exit a parse tree produced by QASMParser#qop.
	exitQop = function (ctx) {};

	// Enter a parse tree produced by QASMParser#uop.
	enterUop = function (ctx) {};

	// Exit a parse tree produced by QASMParser#uop.
	exitUop = function (ctx) {};

	// Enter a parse tree produced by QASMParser#anylist.
	enterAnylist = function (ctx) {};

	// Exit a parse tree produced by QASMParser#anylist.
	exitAnylist = function (ctx) {};

	// Enter a parse tree produced by QASMParser#idlist.
	enterIdlist = function (ctx) {};

	// Exit a parse tree produced by QASMParser#idlist.
	exitIdlist = function (ctx) {};

	// Enter a parse tree produced by QASMParser#mixedlist.
	enterMixedlist = function (ctx) {};

	// Exit a parse tree produced by QASMParser#mixedlist.
	exitMixedlist = function (ctx) {};

	// Enter a parse tree produced by QASMParser#argument.
	enterArgument = function (ctx) {};

	// Exit a parse tree produced by QASMParser#argument.
	exitArgument = function (ctx) {};

	// Enter a parse tree produced by QASMParser#explist.
	enterExplist = function (ctx) {};

	// Exit a parse tree produced by QASMParser#explist.
	exitExplist = function (ctx) {};

	// Enter a parse tree produced by QASMParser#exp.
	enterExp = function (ctx) {};

	// Exit a parse tree produced by QASMParser#exp.
	exitExp = function (ctx) {};

	// Enter a parse tree produced by QASMParser#unaryop.
	enterUnaryop = function (ctx) {};

	// Exit a parse tree produced by QASMParser#unaryop.
	exitUnaryop = function (ctx) {};
}

export const QASMImport = function QASMImport(
	circuit,
	input,
	errorCallback,
	compatibilityMode,
) {
	const chars = new InputStream(input);
	const lexer = new QASMLexer(chars);
	const tokens = new CommonTokenStream(lexer);
	const parser = new QASMParser(tokens);
	parser.buildParseTrees = true;

	parser.removeErrorListeners();
	const errors = [];
	const errorListener = new ErrorListener(errors);
	parser.addErrorListener(errorListener);

	const tree = parser.mainprog();
	const QASM = new QCQASMListener(circuit, compatibilityMode);
	ParseTreeWalker.DEFAULT.walk(QASM, tree);
	if (errorCallback) {
		errorCallback(errors);
	}
};
