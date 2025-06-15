/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

var antlr4 = require('antlr4/index');
var QASMLexer = require('./QASMLexer');
var QASMParser = require('./QASMParser').QASMParser;
var QASMListener = require('./QASMListener').QASMListener;

var ErrorListener = function(errors) {
  antlr4.error.ErrorListener.call(this);
  this.errors = errors;
  return this;
};

ErrorListener.prototype = Object.create(antlr4.error.ErrorListener.prototype);
ErrorListener.prototype.constructor = ErrorListener;
ErrorListener.prototype.syntaxError = function(rec, sym, line, col, msg, e) {
  this.errors.push({
  	line: line,
  	col: col,
  	msg: msg
  });
};

var QCQASMListener = function(circuit, compatibilityMode) {
    this.circuit = circuit;
    this.qregMap = {};
    this.condition = {};
    this.compatibilityMode = compatibilityMode;

    QASMListener.call(this); // inherit default listener
    return this;
};

var QASMImport = function(circuit, input, errorCallback, compatibilityMode) {
	var chars = new antlr4.InputStream(input);
	var lexer = new QASMLexer.QASMLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new QASMParser(tokens);
	parser.buildParseTrees = true;

	parser.removeErrorListeners();
	var errors = [];
	var errorListener = new ErrorListener(errors);
	parser.addErrorListener(errorListener);

	var tree = parser.mainprog();   
	var QASM = new QCQASMListener(circuit, compatibilityMode);
	antlr4.tree.ParseTreeWalker.DEFAULT.walk(QASM, tree);
	if(errorCallback) {
		errorCallback(errors);
	}
};

 
// inherit default listener
QCQASMListener.prototype = Object.create(QASMListener.prototype);
QCQASMListener.prototype.constructor = QCQASMListener;


QCQASMListener.prototype.numQbit = function() {
	var num = 0;
	for(var reg in this.qregMap) {
		num += this.qregMap[reg];
	}
	return num;
};

QCQASMListener.prototype.qregBase = function(qreg) {
	var base = 0;
	for(var reg in this.qregMap) {
		if(reg == qreg) {
			return base;
		}
		base += this.qregMap[reg];
	}
	return base;
};

QCQASMListener.prototype.qregLen = function(reg) {
	return this.qregMap[reg] || 0;
};


// Enter a parse tree produced by QASMParser#mainprog.
QCQASMListener.prototype.enterMainprog = function(ctx) {
};

// Exit a parse tree produced by QASMParser#mainprog.
QCQASMListener.prototype.exitMainprog = function(ctx) {
};


// Enter a parse tree produced by QASMParser#statement.
QCQASMListener.prototype.enterStatement = function(ctx) {
	var self = this;

	// condition
	var name = ctx.getChildCount() ? ctx.getChild(0).getText() : "";

	if(name == "if") {
		this.condition = {
			creg: ctx.ID().getText(),
			value: parseInt(ctx.INT().getText())
		}
	}

	if(name == "barrier") {
		var idlist = ctx.anylist() ? ctx.anylist().idlist() : null;
		var mixedlist = ctx.anylist() ? ctx.anylist().mixedlist() : null;

		if(idlist) {
			//
			// arguments are entire registers
			//   example: cx q,r;
			//
			var wires = [];
			var regCount = idlist.ID().length;
			for(var regIndex = 0; regIndex < regCount; regIndex++) {
				var regName = idlist.ID()[regIndex].getText();
				var numBits = self.qregLen(regName);
				for(var bit = 0; bit < numBits; bit++) {
					var wire = bit + self.qregBase(regName);
					wires.push(wire);
				}
			}
			var destCol = self.circuit.lastNonEmptyPlace(wires, false);
			destCol += 1;
			wires.map(function(destWire) {
				self.circuit.addGate(name, destCol, destWire);
			});
		}

		// arguments are qbits or mixed
		if(mixedlist) {
			if(mixedlist.ID().length != mixedlist.INT().length) {
				// 
				// TODO: mixed qbits and entire registers
				//       example: cx q,r[0];
				//
			} else {
				//
				// qbits, for example: cx q[0],r[0];
				//
				var args = [];
				var count = mixedlist.ID().length;
				for(var i = 0; i < count; i++) {
					args.push({ reg: mixedlist.ID()[i].getText(), bit: parseInt(mixedlist.INT()[i].getText()) });
				}

				var wires = [];
				args.map(function(a) {
					wires.push(a.bit + self.qregBase(a.reg));
				});
				self.circuit.addGate(name, -1, wires, {});
			}
		}
	}

	// subroutine (gate declaration)
	if(ctx.gatedecl()) {
		var gatedecl = ctx.gatedecl();
		var args = [];
		var params = [];

		var ccount = gatedecl.getChildCount();
		if(ccount > 2 && gatedecl.getChild(2).ID) {
			// no params
			args = gatedecl.getChild(2).ID();
		} else {
			if(ccount > 3 && gatedecl.getChild(3).ID) {
				params = gatedecl.getChild(3).ID();
			}
			if(ccount > 5 && gatedecl.getChild(5).ID) {
				// no params
				args = gatedecl.getChild(5).ID();
			}
		}

		var proto = Object.getPrototypeOf(this.circuit);
		var customGate = new proto.constructor(args.length);
		var customGateName = gatedecl.ID().getText();
		var customGateRegs = [];

		args.map(function(reg) {
			customGateRegs.push(reg.getText());
		});

		params.map(function(par) {
			var parName = par.getText();
			customGate.params.push(parName);
		});

		if(ctx.goplist()) {
			var goplist = ctx.goplist();

			goplist.children.forEach(function(child, childIndex) {
				if (child instanceof QASMParser.UopContext) {
					// This child is a 'uop' operation
					var uop = child;

					var gateName = uop.ID() ? uop.ID().getText() : "";
					if(gateName) {
						var idlist = uop.anylist() ? uop.anylist().idlist() : null;
						var mixedlist = uop.anylist() ? uop.anylist().mixedlist() : null;
						var explist = uop.explist();


						switch(gateName) {
							case "CX": gateName = "cx"; break;
							case "U": gateName = "u3"; break;
						}

						if(!self.circuit.basicGates[gateName] && !self.circuit.customGates[gateName]) {
							// find gate by qasm name
							for(var tmpName in self.circuit.basicGates) {
								var tmpDef = self.circuit.basicGates[tmpName];
								if(tmpDef.exportInfo && tmpDef.exportInfo.qasm && tmpDef.exportInfo.qasm.name && tmpDef.exportInfo.qasm.name == gateName) {
									gateName = tmpName;
									break;
								}
								// newer versions of qiskit exports to qasm with gate names undefined by qasm 2.0 definition...
								if(tmpDef.exportInfo && tmpDef.exportInfo.qiskit && tmpDef.exportInfo.qiskit.name && tmpDef.exportInfo.qiskit.name == gateName) {
									gateName = tmpName;
									break;
								}
							}
						}


						var params = {};
						if(explist && explist.exp()) {
							var gateDef = self.circuit.basicGates[gateName];
							if(!gateDef) {
								gateDef = self.circuit.customGates[gateName];
							}

							if(gateDef) {
								var paramList = explist.exp();
								var paramDef = gateDef.params || [];
								paramList.map(function(paramItem, paramIndex) {
									var paramValue = paramItem.getText();
									var paramName = paramDef.length >= paramIndex ? paramDef[paramIndex] : "";
									if(paramName) {
										params[paramName] = paramValue;
									}
								});
							}
						}

						var options = { params: params };


						var wires = [];

						if(idlist) {
							var count = idlist.ID().length;
							for(var i = 0; i < count; i++) {
								wires.push(customGateRegs.indexOf(idlist.ID()[i].getText()));
							}
						}

						if(mixedlist) {
							// ?
						}

						var external = self.circuit.customGates[gateName];
						if(external) {
							customGate.registerGate(gateName, JSON.parse(JSON.stringify(external)));
						}

						customGate.addGate(gateName, -1, wires, options);
					}



				} else {
					var gateName = child.getText ? child.getText() : "";
					if(gateName) {
						switch(gateName) {
							case "barrier": {
								if(goplist.children.length > childIndex + 1) {
									idlist = goplist.children[childIndex + 1];
									if(idlist && idlist.ID) {
										var wires = [];

										if(idlist) {
											var count = idlist.ID().length;
											for(var i = 0; i < count; i++) {
												wires.push(customGateRegs.indexOf(idlist.ID()[i].getText()));
											}

											var options = { params: {} };
											customGate.addGate(gateName, -1, wires, options);
										}
									}
								}
							}; break;
						}
					}
				}
			});
		}

		this.circuit.registerGate(customGateName, customGate.save(false));
	}
};

// Exit a parse tree produced by QASMParser#statement.
QCQASMListener.prototype.exitStatement = function(ctx) {
};


// Enter a parse tree produced by QASMParser#version.
QCQASMListener.prototype.enterVersion = function(ctx) {
};

// Exit a parse tree produced by QASMParser#version.
QCQASMListener.prototype.exitVersion = function(ctx) {
};


// Enter a parse tree produced by QASMParser#decl.
QCQASMListener.prototype.enterDecl = function(ctx) {
	switch(ctx.getChild(0).getText()) {
		case "qreg": this.qregMap[ctx.getChild(1).getText()] = parseInt(ctx.getChild(3).getText()); break;
		case "creg": this.circuit.createCreg(ctx.getChild(1).getText(), parseInt(ctx.getChild(3).getText())); break;
	}	
};

// Exit a parse tree produced by QASMParser#decl.
QCQASMListener.prototype.exitDecl = function(ctx) {
};


// Enter a parse tree produced by QASMParser#gatedecl.
QCQASMListener.prototype.enterGatedecl = function(ctx) {
};

// Exit a parse tree produced by QASMParser#gatedecl.
QCQASMListener.prototype.exitGatedecl = function(ctx) {
};


// Enter a parse tree produced by QASMParser#goplist.
QCQASMListener.prototype.enterGoplist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#goplist.
QCQASMListener.prototype.exitGoplist = function(ctx) {
};

// Enter a parse tree produced by QASMParser#qop.
QCQASMListener.prototype.enterQop = function(ctx) {
	var self = this;
	var condition = JSON.parse(JSON.stringify(this.condition));
	this.condition = {};

	var name = ctx.getChildCount() ? ctx.getChild(0).getText() : "";

	if(name == "reset") {
		var qreg = "";
		var qbit = -1;
		var count = ctx.argument().length;
		for(var i = 0; i < count; i++) {
			var arg = ctx.argument()[i];
			if(i == 0) {
				qreg = arg.ID().getText();
				qbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
			}
		}

		if(qreg) {
			var numBits = self.qregLen(qreg);
			if(qbit < 0) {
				//
				// argument is entire register
				//
				for(var x = 0; x < numBits; x++) {
					self.circuit.addGate("reset", -1, x + self.qregBase(qreg), { condition: condition || {} } );
				}

			} else {
				//
				// both arguments are single bits
				//
				self.circuit.addGate("reset", -1, qbit + self.qregBase(qreg), { condition: condition || {} } );
			}
		}
	}

	if(name == "measure") {
		var qreg = "";
		var qbit = -1;
		var creg = "";
		var cbit = -1;
		var count = ctx.argument().length;
		for(var i = 0; i < count; i++) {
			var arg = ctx.argument()[i];
			if(i == 0) {
				qreg = arg.ID().getText();
				qbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
			}
			if(i == 1) {
				creg = arg.ID().getText();
				cbit = arg.INT() ? parseInt(arg.INT().getText()) : -1;
			}
		}

		if(qreg && creg) {
			var numBits = self.qregLen(qreg);
			if(qbit < 0 && cbit < 0) {
				//
				// both arguments are entire registers
				//
				for(var x = 0; x < numBits; x++) {
					self.circuit.addGate("measure", -1, x + self.qregBase(qreg), { creg: { name: creg, bit: x }, condition: condition || {} } );
				}

			} else {
				if(qbit >= 0 && cbit >= 0) {
					//
					// both arguments are single bits
					//
					self.circuit.addGate("measure", -1, qbit + self.qregBase(qreg), { creg: { name: creg, bit: cbit }, condition: condition || {} } );
				} else {
					if(qbit >= 0 && cbit < 0) {
						//
						// qbit is single, creg is entire register
						//
						for(var x = 0; x < numBits; x++) {
							self.circuit.addGate("measure", -1, qbit + self.qregBase(qreg), { creg: { name: creg, bit: x }, condition: condition || {} } );
						}						
					} else {
						//
						// qbit is entire register, creg is single bit
						//
						for(var x = 0; x < numBits; x++) {
							self.circuit.addGate("measure", -1, x + self.qregBase(qreg), { creg: { name: creg, bit: cbit }, condition: condition || {} } );
						}						

					}
				}
			}
		}
	}

	var uop = ctx.uop();
	if(uop && uop.ID()) {
		var gateName = uop.ID().getText();
		var idlist = uop.anylist() ? uop.anylist().idlist() : null;
		var mixedlist = uop.anylist() ? uop.anylist().mixedlist() : null;
		var explist = uop.explist();

		switch(gateName) {
			case "CX": gateName = "cx"; break;
			case "U": gateName = "u3"; break;
		}

		if(!self.circuit.basicGates[gateName] && !self.circuit.customGates[gateName]) {
			// find gate by qasm name
			for(var tmpName in self.circuit.basicGates) {
				var tmpDef = self.circuit.basicGates[tmpName];
				if(tmpDef.exportInfo && tmpDef.exportInfo.qasm && tmpDef.exportInfo.qasm.name && tmpDef.exportInfo.qasm.name == gateName) {
					gateName = tmpName;
					break;
				}
				// newer versions of qiskit exports to qasm with gate names undefined by qasm 2.0 definition...
				if(tmpDef.exportInfo && tmpDef.exportInfo.qiskit && tmpDef.exportInfo.qiskit.name && tmpDef.exportInfo.qiskit.name == gateName) {
					gateName = tmpName;
					break;
				}
			}
		}

		var params = {};
		if(explist && explist.exp()) {
			var gateDef = self.circuit.basicGates[gateName];
			if(!gateDef) {
				gateDef = self.circuit.customGates[gateName];
			}
			if(gateDef) {
				var paramList = explist.exp();
				var paramDef = gateDef.params || [];
				paramList.map(function(paramItem, paramIndex) {
					var paramValue = paramItem.getText();
					var paramName = paramDef.length >= paramIndex ? paramDef[paramIndex] : "";
					if(paramName) {
						params[paramName] = paramValue;
					}
				});
			}
		}

		var options = { params: params, condition: condition || {} };

		if(idlist) {
			//
			// arguments are entire registers
			//   example: cx q,r;
			//
			var numBits = self.qregLen(idlist.ID()[0].getText());
			for(var x = 0; x < numBits; x++) {
				var args = [];
				var count = idlist.ID().length;
				for(var i = 0; i < count; i++) {
					args.push({ reg: idlist.ID()[i].getText(), bit: x });
				}

				var wires = [];
				args.map(function(a) {
					wires.push(a.bit + self.qregBase(a.reg));
				});

				self.circuit.addGate(gateName, -1, wires, options);
			}
		}

		// arguments are qbits or mixed
		if(mixedlist) {
			if(mixedlist.ID().length != mixedlist.INT().length) {
				// 
				// TODO: mixed qbits and entire registers
				//       example: cx q,r[0];
				//
			} else {
				//
				// qbits, for example: cx q[0],r[0];
				//
				var args = [];
				var count = mixedlist.ID().length;
				for(var i = 0; i < count; i++) {
					args.push({ reg: mixedlist.ID()[i].getText(), bit: parseInt(mixedlist.INT()[i].getText()) });
				}

				var wires = [];
				args.map(function(a) {
					wires.push(a.bit + self.qregBase(a.reg));
				});

				self.circuit.addGate(gateName, -1, wires, options);
			}
		}
	}
};

// Exit a parse tree produced by QASMParser#qop.
QCQASMListener.prototype.exitQop = function(ctx) {
};


// Enter a parse tree produced by QASMParser#uop.
QCQASMListener.prototype.enterUop = function(ctx) {
};

// Exit a parse tree produced by QASMParser#uop.
QCQASMListener.prototype.exitUop = function(ctx) {
};


// Enter a parse tree produced by QASMParser#anylist.
QCQASMListener.prototype.enterAnylist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#anylist.
QCQASMListener.prototype.exitAnylist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#idlist.
QCQASMListener.prototype.enterIdlist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#idlist.
QCQASMListener.prototype.exitIdlist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#mixedlist.
QCQASMListener.prototype.enterMixedlist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#mixedlist.
QCQASMListener.prototype.exitMixedlist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#argument.
QCQASMListener.prototype.enterArgument = function(ctx) {
};

// Exit a parse tree produced by QASMParser#argument.
QCQASMListener.prototype.exitArgument = function(ctx) {
};


// Enter a parse tree produced by QASMParser#explist.
QCQASMListener.prototype.enterExplist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#explist.
QCQASMListener.prototype.exitExplist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#exp.
QCQASMListener.prototype.enterExp = function(ctx) {
};

// Exit a parse tree produced by QASMParser#exp.
QCQASMListener.prototype.exitExp = function(ctx) {
};


// Enter a parse tree produced by QASMParser#unaryop.
QCQASMListener.prototype.enterUnaryop = function(ctx) {
};

// Exit a parse tree produced by QASMParser#unaryop.
QCQASMListener.prototype.exitUnaryop = function(ctx) {
};

module.exports = QASMImport;
