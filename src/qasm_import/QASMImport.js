var antlr4 = require('antlr4/index');
var QASMLexer = require('./QASMLexer');
var QASMParser = require('./QASMParser');
var QASMListener = require('./QASMListener').QASMListener;

var QCQASMListener = function(circuit) {
    this.circuit = circuit;
    this.qregMap = {};
    this.customGate = null;
    this.customGateName = "";
	this.customGateRegs = [];

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
		this.customGate = Object.create(Object.getPrototypeOf(this.circuit));
		this.customGate.init(args.length);
		this.customGateName = gatedecl.ID().getText();
		this.customGateRegs = [];

		args.map(function(reg) {
			self.customGateRegs.push(reg.getText());
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
						wires.push(self.customGateRegs.indexOf(idlist.ID()[i].getText()));
					}
				}

				if(mixedlist) {
					// ?
				}

				self.customGate.addGate(uop.ID().getText(), -1, wires);
			});
		}

		this.circuit.registerGate(this.customGateName, this.customGate.save(true));
		this.customGate = null;
		this.customGateName = "";
		this.customGateRegs = [];
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
	this.qregMap[ctx.getChild(1).getText()] = parseInt(ctx.getChild(3).getText());
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

	var uop = ctx.uop();
	if(uop) {
		var idlist = uop.anylist().idlist();
		var mixedlist = uop.anylist().mixedlist();

		var args = [];

		if(idlist) {
			// TODO: arguments are entire registers
		}

		if(mixedlist) {
			var count = mixedlist.ID().length;
			for(var i = 0; i < count; i++) {
				args.push({ reg: mixedlist.ID()[i].getText(), bit: parseInt(mixedlist.INT()[i].getText()) });
			}
		}

		var wires = [];
		args.map(function(a) {
			wires.push(a.bit + self.qregBase(a.reg));
		});

		this.circuit.addGate(uop.ID().getText(), -1, wires);
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

exports.QASMImport = QASMImport;
