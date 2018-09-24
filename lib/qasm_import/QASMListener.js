// Generated from QASM.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by QASMParser.
function QASMListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

QASMListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
QASMListener.prototype.constructor = QASMListener;

// Enter a parse tree produced by QASMParser#mainprog.
QASMListener.prototype.enterMainprog = function(ctx) {
};

// Exit a parse tree produced by QASMParser#mainprog.
QASMListener.prototype.exitMainprog = function(ctx) {
};


// Enter a parse tree produced by QASMParser#statement.
QASMListener.prototype.enterStatement = function(ctx) {
};

// Exit a parse tree produced by QASMParser#statement.
QASMListener.prototype.exitStatement = function(ctx) {
};


// Enter a parse tree produced by QASMParser#version.
QASMListener.prototype.enterVersion = function(ctx) {
};

// Exit a parse tree produced by QASMParser#version.
QASMListener.prototype.exitVersion = function(ctx) {
};


// Enter a parse tree produced by QASMParser#include.
QASMListener.prototype.enterInclude = function(ctx) {
};

// Exit a parse tree produced by QASMParser#include.
QASMListener.prototype.exitInclude = function(ctx) {
};


// Enter a parse tree produced by QASMParser#filename.
QASMListener.prototype.enterFilename = function(ctx) {
};

// Exit a parse tree produced by QASMParser#filename.
QASMListener.prototype.exitFilename = function(ctx) {
};


// Enter a parse tree produced by QASMParser#decl.
QASMListener.prototype.enterDecl = function(ctx) {
};

// Exit a parse tree produced by QASMParser#decl.
QASMListener.prototype.exitDecl = function(ctx) {
};


// Enter a parse tree produced by QASMParser#gatedecl.
QASMListener.prototype.enterGatedecl = function(ctx) {
};

// Exit a parse tree produced by QASMParser#gatedecl.
QASMListener.prototype.exitGatedecl = function(ctx) {
};


// Enter a parse tree produced by QASMParser#goplist.
QASMListener.prototype.enterGoplist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#goplist.
QASMListener.prototype.exitGoplist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#qop.
QASMListener.prototype.enterQop = function(ctx) {
};

// Exit a parse tree produced by QASMParser#qop.
QASMListener.prototype.exitQop = function(ctx) {
};


// Enter a parse tree produced by QASMParser#uop.
QASMListener.prototype.enterUop = function(ctx) {
};

// Exit a parse tree produced by QASMParser#uop.
QASMListener.prototype.exitUop = function(ctx) {
};


// Enter a parse tree produced by QASMParser#anylist.
QASMListener.prototype.enterAnylist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#anylist.
QASMListener.prototype.exitAnylist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#idlist.
QASMListener.prototype.enterIdlist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#idlist.
QASMListener.prototype.exitIdlist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#mixedlist.
QASMListener.prototype.enterMixedlist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#mixedlist.
QASMListener.prototype.exitMixedlist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#argument.
QASMListener.prototype.enterArgument = function(ctx) {
};

// Exit a parse tree produced by QASMParser#argument.
QASMListener.prototype.exitArgument = function(ctx) {
};


// Enter a parse tree produced by QASMParser#explist.
QASMListener.prototype.enterExplist = function(ctx) {
};

// Exit a parse tree produced by QASMParser#explist.
QASMListener.prototype.exitExplist = function(ctx) {
};


// Enter a parse tree produced by QASMParser#exp.
QASMListener.prototype.enterExp = function(ctx) {
};

// Exit a parse tree produced by QASMParser#exp.
QASMListener.prototype.exitExp = function(ctx) {
};


// Enter a parse tree produced by QASMParser#unaryop.
QASMListener.prototype.enterUnaryop = function(ctx) {
};

// Exit a parse tree produced by QASMParser#unaryop.
QASMListener.prototype.exitUnaryop = function(ctx) {
};



exports.QASMListener = QASMListener;