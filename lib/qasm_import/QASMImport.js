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
var QASMParser = require('./QASMParser');
var QASMListener = require('./QASMListener').QASMListener;

var QCQASMListener = function(circuit) {
    this.circuit = circuit;
    this.qregMap = {};

    QASMListener.call(this); // inherit default listener
    return this;
};

var QASMImport = function(circuit, input) {
	var chars = new antlr4.InputStream(input);
	var lexer = new QASMLexer.QASMLexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new QASMParser.QASMParser(tokens);
	parser.buildParseTrees = true;   
	var tree = parser.mainprog();   
	var QASM = new QCQASMListener(circuit);
	antlr4.tree.ParseTreeWalker.DEFAULT.walk(QASM, tree);
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

	// subroutine (gate declaration)
	if(ctx.gatedecl()) {
		var gatedecl = ctx.gatedecl();
		var args = gatedecl.getChild(2).ID();
		var customGate = Object.create(Object.getPrototypeOf(this.circuit));
		customGate.init(args.length);
		var customGateName = gatedecl.ID().getText();
		var customGateRegs = [];

		args.map(function(reg) {
			customGateRegs.push(reg.getText());
		});

		if(ctx.goplist()) {
			var goplist = ctx.goplist();

			goplist.uop().map(function(uop) {
				var idlist = uop.anylist().idlist();
				var mixedlist = uop.anylist().mixedlist();

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

				var gateName = uop.ID().getText();
				switch(gateName) {
					case "CX": gateName = "cx"; break;
				}

				var external = self.circuit.customGates[gateName];
				if(external) {
					customGate.registerGate(gateName, JSON.parse(JSON.stringify(external)));
				}

				customGate.addGate(gateName, -1, wires);
			});
		}

		var customDecomposed = customGate.save(true);
		this.circuit.registerGate(customGateName, customDecomposed);
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

	var name = ctx.getChildCount() ? ctx.getChild(0).getText() : "";
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
					this.circuit.addGate("measure", -1, x + self.qregBase(qreg), { creg: { name: creg, bit: x } } );
				}
			} else {
				if(qbit >= 0 && cbit >= 0) {
					//
					// both arguments are single bits
					//
					this.circuit.addGate("measure", -1, qbit + self.qregBase(qreg), { creg: { name: creg, bit: cbit } } );
				} else {
					if(qbit >= 0 && cbit < 0) {
						//
						// qbit is single, creg is entire register
						//
						for(var x = 0; x < numBits; x++) {
							this.circuit.addGate("measure", -1, qbit + self.qregBase(qreg), { creg: { name: creg, bit: x } } );
						}						
					} else {
						//
						// qbit is entire register, creg is single bit (nonsense!)
						//
						for(var x = 0; x < numBits; x++) {
							this.circuit.addGate("measure", -1, x + self.qregBase(qreg), { creg: { name: creg, bit: cbit } } );
						}						

					}
				}
			}
		}
	}

	var uop = ctx.uop();
	if(uop) {
		var idlist = uop.anylist().idlist();
		var mixedlist = uop.anylist().mixedlist();
		var explist = uop.explist();

		var params = [];
		if(explist) {
			var paramCount = explist.getChildCount();
			for(var i = 0; i < paramCount; i++) {
				params.push(explist.getChild(i).getText());
			}
		}

		var options = {};
		if(params && params.length) {
			options.params = params;
		}

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

				var gateName = uop.ID().getText();
				switch(gateName) {
					case "CX": gateName = "cx"; break;
				}

				this.circuit.addGate(gateName, -1, wires, options);
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

				var gateName = uop.ID().getText();
				switch(gateName) {
					case "CX": gateName = "cx"; break;
				}

				this.circuit.addGate(gateName, -1, wires, options);
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
