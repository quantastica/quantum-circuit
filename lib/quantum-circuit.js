/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

var math = require("mathjs");

var QASMImport = require("./qasm_import/QASMImport.js");


var randomString = function(len) {
	len = len || 17;

	var text = "";
	// let first char to be letter
	var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be letters and numbers
	charset += "0123456789";
	for(var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};

var formatComplex2 = function(re, im) {
	var re = math.round(re, 8);
	var im = math.round(im, 8);
	return re.toFixed(8) + (im >= 0 ? "+" : "-") + math.abs(im).toFixed(8) + "i";
};

var formatComplex = function(complex) {
	return formatComplex2(complex.re, complex.im);
};


var zeroesMatrix = function(n) {
	var matrix = [];
	for(var i = 0; i < n; i++) {
		matrix[i] = [];
		for(var j = 0; j < n; j++) {
			matrix[i][j] = 0;
		}
	}
	return matrix;
};

var identityMatrix = function(n) {
	var matrix = [];
	for(var i = 0; i < n; i++) {
		matrix[i] = [];
		for(var j = 0; j < n; j++) {
			matrix[i][j] = j == i ? 1 : 0;
		}
	}
	return matrix;
};


var makeControlled = function(U) {
	var m = U.length;
	var C = identityMatrix(m * 2);
	for (var i = 0; i < m; i++) {
		for (var j = 0; j < m; j++) {
			C[i + m][j + m] = U[i][j];
		}
	}
	return C;
};

//
// 1-qubit gates
//
var basicGates = {
	x: [
		[0, 1], 
		[1, 0]
	],
	y: [
		[0, math.multiply(-1, math.i)],
		[math.i, 0]
	],
	z: [
		[1,  0], 
		[0, -1]
	],
	h: [
		[1 / math.sqrt(2),  1 / math.sqrt(2)], 
		[1 / math.sqrt(2), 0 - (1 / math.sqrt(2))]
	],
	srn: [
		[1 / math.sqrt(2),  -1 / math.sqrt(2) ],
		[-1 / math.sqrt(2),  1 / math.sqrt(2) ]
	],

	r2: [
		[1, 0], 
		[0, math.pow(math.e, math.multiply(math.i, math.PI / 2))]
	],
	r4: [
		[1, 0],
		[0, math.pow(math.e, math.multiply(math.i, math.PI / 4))]
	],
	r8: [
		[1, 0], 
		[0, math.pow(math.e, math.multiply(math.i, math.PI / 8))]
	],

	u1: [
		[1, 0], 
		[0, "pow(e, multiply(i, a))"]
	],

	s: [
		[1, 0],
		[0, math.pow(math.e, math.multiply(math.i, math.PI / 2))]
	],
	t: [
		[1, 0],
		[0, math.pow(math.e, math.multiply(math.i, math.PI / 4))]
	],

	sdg: [
		[1, 0],
		[0, math.pow(math.e, math.multiply(math.i, (-1 * math.PI) / 2))]
	],

	tdg: [
		[1, 0],
		[0, math.pow(math.e, math.multiply(math.i, (-1 * math.PI) / 4))]
	]
};

//
// 2-qubit gates
//

basicGates.swap = [
	[1, 0, 0, 0],
	[0, 0, 1, 0],
	[0, 1, 0, 0],
	[0, 0, 0, 1]
];

basicGates.srswap = [
	[1, 0, 0, 0],
	[0, math.multiply(0.5, math.add(1, math.i)), math.multiply(0.5, math.subtract(1, math.i)), 0],
	[0, math.multiply(0.5, math.subtract(1, math.i)), math.multiply(0.5, math.add(1, math.i)), 0],
	[0, 0, 0, 1]
];

basicGates.cx = makeControlled(basicGates.x);
basicGates.cy = makeControlled(basicGates.y);
basicGates.cz = makeControlled(basicGates.z);
basicGates.ch = makeControlled(basicGates.h);
basicGates.csrn = makeControlled(basicGates.srn);
basicGates.cr2 = makeControlled(basicGates.r2);
basicGates.cr4 = makeControlled(basicGates.r4);
basicGates.cr8 = makeControlled(basicGates.r8);
basicGates.cu1 = makeControlled(basicGates.u1);
basicGates.cs = makeControlled(basicGates.s);
basicGates.ct = makeControlled(basicGates.t);
basicGates.csdg = makeControlled(basicGates.sdg);
basicGates.ctdg = makeControlled(basicGates.tdg);

//
// 3-qubit gates
//
basicGates.ccx = makeControlled(basicGates.cx);
basicGates.cswap = makeControlled(basicGates.swap);
basicGates.csrswap = makeControlled(basicGates.srswap);


var drawingInfo = {
	x: { connectors: ["not"], label: "X" },
	y: { connectors: ["box"], label: "Y" },
	z: { connectors: ["box"], label: "Z" },
	h: { connectors: ["box"], label: "H" },
	srn: { connectors: ["box"], label: "" },
	r2: { connectors: ["box"], label: "R2" },
	r4: { connectors: ["box"], label: "R4" },
	r8: { connectors: ["box"], label: "R8;" },
	u1: { connectors: ["box"], label: "U1" },
	s: { connectors: ["box"], label: "S" },
	t: { connectors: ["box"], label: "T" },
	sdg: { connectors: ["box"], label: "-S" },
	tdg: { connectors: ["box"], label: "-T" },

	swap: { connectors: ["x", "x"], label: "" },
	srswap: { connectors: ["box", "box"], label: "" },
	cx: { connectors: ["dot", "not"], label: "X" },
	cy: { connectors: ["dot", "box"], label: "Y" },
	cz: { connectors: ["dot", "box"], label: "Z" },
	ch: { connectors: ["dot", "box"], label: "H" },
	csrn: { connectors: ["dot", "box"], label: "" },
	cr2: { connectors: ["dot", "box"], label: "R2" },
	cr4: { connectors: ["dot", "box"], label: "R4" },
	cr8: { connectors: ["dot", "box"], label: "R8" },
	cu1: { connectors: ["dot", "box"], label: "CU1" },
	cs: { connectors: ["dot", "box"], label: "S" },
	ct: { connectors: ["dot", "box"], label: "T" },
	csdg: { connectors: ["dot", "box"], label: "-S" },
	ctdg: { connectors: ["dot", "box"], label: "-T" },

	cswap: { connectors: ["dot", "x", "x"], label: "" },
	csrswap: { connectors: ["dot", "box", "box"], label: "" },

	measure: { connectors: ["box"], label: "" }
};


var QuantumCircuit = function(numQubits) {
	this.init(numQubits);
};

QuantumCircuit.prototype.init = function(numQubits) {
	this.numQubits = numQubits || 1;
	this.customGates = {};
	this.cregs = {};
	this.clear();
};

QuantumCircuit.prototype.clear = function() {
	this.gates = [];
	for(var i = 0; i < this.numQubits; i++) {
		this.gates.push([]);
	}
	this.resetState();
};

QuantumCircuit.prototype.resetState = function() {
	// reset state
	this.state = {};
	this.stateBits = 0;

	// reset cregs
	for(var creg in this.cregs) {
		var len = this.cregs[creg].length || 0;
		this.cregs[creg] = [];
		for(var i = 0; i < len; i++) {
			this.cregs[creg].push(0);
		}
	}

	this.stats = {};
};

QuantumCircuit.prototype.initState = function() {
	this.resetState();
	this.state["0"] = math.complex(1, 0);
	this.stateBits = 0;
};

QuantumCircuit.prototype.numAmplitudes = function() {
	return math.pow(2, this.numQubits);
};

QuantumCircuit.prototype.numCols = function() {
	return this.gates.length ? this.gates[0].length : 0;
};

QuantumCircuit.prototype.isEmptyCell = function(col, wire) {
	if(this.gates[wire] && this.gates[wire][col]) {
		return false;
	}

	for(var w = 0; w < this.numQubits; w++) {
		var gate = this.getGateAt(col, w);
		if(gate && Math.min.apply(null, gate.wires) < wire && Math.max.apply(null, gate.wires) > wire) {
			return false;
		}
	}

	return true;
};

QuantumCircuit.prototype.lastNonEmptyCol = function(wire) {
	if(wire >= this.numQubits) {
		return -1;
	}
	var col = this.numCols() - 1;
	while(this.isEmptyCell(col, wire) && col >= 0) {
		col--;
	}
	return col;
};

QuantumCircuit.prototype.lastNonEmptyPlace = function(wires) {
	var self = this;
	var col = this.numCols();
	var allEmpty = true;
	while(allEmpty && col--) {
		wires.map(function(wire) {
			if(!self.isEmptyCell(col, wire)) {
				allEmpty = false;
			}
		});
	}

	return col;
};


QuantumCircuit.prototype.addGate = function(gateName, column, wires, options) {
	var wireList = [];
	if(Array.isArray(wires)) {
		for(var i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
	}

	if(column < 0) {
		column = this.lastNonEmptyPlace(wireList) + 1;
	}

	var numConnectors = wireList.length;
	var id = randomString();
	for(var connector = 0; connector < numConnectors; connector++) {
		var wire = wireList[connector];

		if((wire + 1) > this.numQubits) {
			this.numQubits = wire + 1;
		}

		while(this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		var numCols = this.numCols();
		if((column + 1) > numCols) {
			numCols = column + 1;
		}

		for(var i = 0; i < this.gates.length; i++) {
			while(this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}

		var gate = {
			id: id,
			name: gateName,
			connector: connector
		}

		if(options) {
			gate.options = options;
		}

		this.gates[wire][column] = gate;
	}
};

QuantumCircuit.prototype.removeGate = function(column, wire) {
	if(!this.gates[wire]) {
		return;
	}

	var gate = this.gates[wire][column];
	if(!gate) {
		return;
	}

	var id = gate.id;

	var numWires = this.gates[0].length;
	for(var wire = 0; wire < numWires; wire++) {
		if(this.gates[wire][column].id == id) {
			this.gates[wire][column] = null;
		}
	}
};

QuantumCircuit.prototype.addMeasure = function(wire, creg, cbit) {
	this.addGate("measure", -1, wire, { creg: { name: creg, bit: cbit } });
};


//
// Ugly but efficient :)
// 
// TODO: 
//   - clean up and add comments
//   - Parallelize/Use GPU

QuantumCircuit.prototype.applyTransform = function(U, qubits) {
	// clone list of wires to itself (remove reference to original array)
	qubits = qubits.slice(0);

	// convert index from 0-based to end-based
	for(var i = 0; i < qubits.length; i++) {
		qubits[i] = (this.numQubits - 1) - qubits[i];
	}
	// reverse order
	qubits.reverse();

	//
	// "incMap" and "fixMap" are instructions about bit-wise operations used to calculate row and column index of destination transform matrix elements
	//
	var incMap = [];
	var fixMap = [];
	var usedCount = 0;
	var unusedCount = 0;
	for(var i = 0; i < this.numQubits; i++) {
		if(qubits.indexOf(i) < 0) {
			incMap.push({ 
				and: 1 << incMap.length,
				or: 1 << i
			});
			unusedCount++;
		} else {
			fixMap.push({ 
				rowAnd: 1 << (fixMap.length + qubits.length), 
				colAnd: 1 << fixMap.length, 
				or: 1 << qubits[fixMap.length]
			});
			usedCount++;
		}
	}

	//
	// "uflat" is flatten transform matrix, only non-zero elements
	//
	uflat = {};
	var unum = 0;
	var uindex = 0;
	U.map(function(urow) {
		urow.map(function(uval) {
			if(uval) {
				var rowOr = 0;
				var colOr = 0;

				var fix = usedCount;
				while(fix--) {
					var fmap = fixMap[fix];
					if(uindex & fmap.rowAnd) {
						rowOr |= fmap.or;
					}
					if(uindex & fmap.colAnd) {
						colOr |= fmap.or;
					}
				}

				uflat[unum] = {
					uval: uval,
					rowOr: rowOr,
					colOr: colOr
				};
				unum++;
			}
			uindex++;
		});
	});

	//
	// main loop
	//
	// current state is multiplied and stored into newState
	var newState = {};
	var newStateBits = 0;
	var incCount = (1 << unusedCount);
	while(incCount--) {
		var row = 0;

		var inc = unusedCount;
		while(inc--) {
			if(incCount & incMap[inc].and) {
				row |= incMap[inc].or;
			}
		}

		if((this.stateBits & row) == row) {
			var ucount = unum;
			while(ucount--) {
				var u = uflat[ucount];

				var i = row | u.rowOr;
				var j = row | u.colOr;

				var state = this.state[j];

				if(state && (state.re || state.im)) {
					newState[i] = math.add(newState[i] || math.complex(0, 0), math.multiply(u.uval, state));
					newStateBits |= i;
				}
			}			
		}
	}

	// replace current state with new state
	this.state = newState;
	this.stateBits = newStateBits;
};

QuantumCircuit.prototype.applyGate = function(gateName, wires, options) {
	if(gateName == "measure") {
		if(!options.creg) {
			throw "Error: \"measure\" gate requires destination.";
		}
		this.measure(wires[0], options.creg.name, options.creg.bit);
		return;
	}

	var gate = basicGates[gateName];
	if(!gate) {
		console.log("Unknown gate \"" + gateName + "\".");
		return;
	}


	var rawGate = this.getRawGate(gate, options);

	this.applyTransform(rawGate, wires);
};

QuantumCircuit.prototype.getRawGate = function(gate, options) {
	var rawGate = [];
	gate.map(function(row) {
		var rawGateRow = [];
		row.map(function(item) {
			if(typeof item == "string") {
				var params = options ? options.params || [] : [];

				var node = math.parse(item);
				var varList = [];
				node.filter(function(node) {
					if(node.isSymbolNode) {
						// avoid math.js constants
						if(typeof math[node.name] == "undefined" || typeof math[node.name] == "function") {
							varList.push(node.name);
						}
					}
				});
				varList.sort();

				var vars = {};
				varList.map(function(varName, varIndex) {
					vars[varName] = params.length > varIndex ? math.eval(params[varIndex]) : null;
				});

				var ev = math.eval(item, vars);
				rawGateRow.push(ev);
			} else {
				rawGateRow.push(item);
			}
		});
		rawGate.push(rawGateRow);
	});
	return rawGate;
};

QuantumCircuit.prototype.decompose = function(obj) {
	if(!obj.gates.length) {
		return obj;
	}

	function injectArray(a1, a2, pos) {
		return a1.slice( 0, pos ).concat( a2 ).concat( a1.slice( pos ) );
	}

	for(var column = 0; column < obj.gates[0].length; column++) {
		for(var wire = 0; wire < obj.numQubits; wire++) {
			var gate = obj.gates[wire][column];
			if(gate && gate.connector == 0 && !(basicGates[gate.name] || gate.name == "measure")) {
				var tmp = new QuantumCircuit();
				var custom = obj.customGates[gate.name];
				if(custom) {
					tmp.load(custom);
					var decomposed = tmp.save(true);
					var empty = [];
					for(var i = 0; i < decomposed.gates[0].length - 1; i++) {
						empty.push(null);
					}
					// shift columns right
					for(var w = 0; w < obj.numQubits; w++) {
						var g = obj.gates[w][column];
						if(g && g.id == gate.id) {
							obj.gates[w].splice(column, 1);
							obj.gates[w] = injectArray(obj.gates[w], decomposed.gates[g.connector], column);
						} else {
							obj.gates[w] = injectArray(obj.gates[w], empty, column + 1);
						}
					}
				}
			}
		}
	}

	obj.customGates = [];

	return obj;
};

QuantumCircuit.prototype.save = function(decompose) {
	var data = {
		numQubits: this.numQubits,
		gates: JSON.parse(JSON.stringify(this.gates)),
		customGates: JSON.parse(JSON.stringify(this.customGates))
	}

	if(decompose) {
		return this.decompose(data);
	} else {
		return data;			
	}
};

QuantumCircuit.prototype.load = function(obj) {
	this.numQubits = obj.numQubits || 1;
	this.clear();
	this.gates = JSON.parse(JSON.stringify(obj.gates));
	this.customGates = JSON.parse(JSON.stringify(obj.customGates));
};

QuantumCircuit.prototype.registerGate = function(name, obj) {
	this.customGates[name] = obj;
};

QuantumCircuit.prototype.getGateAt = function(column, wire) {
	if(!this.gates[wire] || !this.gates[wire][column]) {
		return null;
	}

	var gate = JSON.parse(JSON.stringify(this.gates[wire][column]));
	if(!gate) {
		return null;
	}
	gate.wires = [];

	var id = gate.id;
	var numWires = this.gates.length;
	for(var wire = 0; wire < numWires; wire++) {
		var g = this.gates[wire][column];
		if(g && g.id == id) {
			gate.wires[g.connector] = wire;
		}
	}
	return gate;
};

QuantumCircuit.prototype.exportQASM = function(comment, decompose, exportAsGateName) {
	var circuit = null;

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var qasm = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 2 && cline[0] != "/" && cline[1] != "/") {
				qasm += "// ";
			}
			qasm += cline;
			qasm += "\n";
		});
	}

	if(exportAsGateName) {
		qasm += "gate " + exportAsGateName;
		for(var i = 0; i < circuit.numQubits; i++) {
			if(i == 0) {
				qasm += " ";
			}
			if(i > 0) {
				qasm += ",";
			}
			qasm += String.fromCharCode(97 + i);
		}
		qasm += "\n{\n";
	} else {
		qasm += "OPENQASM 2.0;\n";
		qasm += "include \"qelib1.inc\";\n";
		qasm += "qreg q[" + circuit.numQubits + "];\n";

		if(!decompose) {
			for(var customGateName in this.customGates) {
				var customGate = this.customGates[customGateName];
				var customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				qasm += customCircuit.exportQASM("", true, customGateName);
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(exportAsGateName) {
					qasm += "  ";
				}

				qasm += gate.name;

				if(gate.options && gate.options.params) {
					var paramCount = gate.options.params.length;
					qasm += " (";
					for(var p = 0; p < paramCount; p++) {
						qasm += gate.options.params[p];
					}
					qasm += ")";
				} 

				for(var w = 0; w < gate.wires.length; w++) {
					if(w > 0) {
						qasm += ",";
					}
					if(exportAsGateName) {
						qasm += " " + String.fromCharCode(97 + gate.wires[w]);
					} else {
						qasm += " q[" + gate.wires[w] + "]";
					}
				}

				if(gate.name == "measure" && gate.options && gate.options.creg) {
					qasm += " -> ";
					qasm += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
				}

				qasm += ";\n";
			}
		}
	}

	if(exportAsGateName) {
		qasm += "}\n\n";
	}

	return qasm;
};


QuantumCircuit.prototype.importQASM = function(input) {
	this.init();
	QASMImport(this, input);
};


QuantumCircuit.prototype.exportQuirk = function(decompose) {
	var circuit = null;

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var quirk = {
		cols: [],
		gates: []
	};

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		var quirkColumn = [];
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);

			if(!gate || gate.name == "measure") {
				quirkColumn.push(1);
			} else {
				var basicGate = basicGates[gate.name];
				if(basicGate) {
					var quirkName = "";

					// one-qubit gate
					if(basicGate.length == 2) {
						switch(gate.name) {
							case "x": quirkName = "X"; break;
							case "y": quirkName = "Y"; break;
							case "z": quirkName = "Z"; break;
							case "h": quirkName = "H"; break;
							case "r2": quirkName = "Z^½"; break;
							case "r4": quirkName = "Z^¼"; break;
							case "r8": quirkName = "Z^⅛"; break;
							case "s": quirkName = "Z^½"; break;
							case "t": quirkName = "Z^¼"; break;
							case "sdg": quirkName = "Z^-½"; break;
							case "tdg": quirkName = "Z^-¼"; break;
						}
					}
					// two-qubit gate
					if(basicGate.length == 4) {
						switch(gate.name) {
							case "cx": quirkName = "X"; break;
							case "cy": quirkName = "Y"; break;
							case "cz": quirkName = "Z"; break;
							case "ch": quirkName = "H"; break;
							case "cr2": quirkName = "Z^½"; break;
							case "cr4": quirkName = "Z^¼"; break;
							case "cr8": quirkName = "Z^⅛"; break;
							case "cs": quirkName = "Z^½"; break;
							case "ct": quirkName = "Z^¼"; break;
							case "csdg": quirkName = "Z^-½"; break;
							case "ctdg": quirkName = "Z^-¼"; break;
							case "swap": quirkName = "Swap"; break;
						}

						// known gate, but this is control bit
						if(quirkName && (gate.name == "swap" && gate.connector < gate.wires.length - 2) || (gate.name != "swap" && gate.connector < gate.wires.length - 1)) {
							quirkName = "•";
						}
					}

					// three-qubit gate
					if(basicGate.length == 8) {
						switch(gate.name) {
							case "ccx": quirkName = "X"; break;
							case "cswap": quirkName = "Swap"; break;
						}

						// known gate, but this is control bit
						if(quirkName && (gate.name == "swap" && gate.connector < gate.wires.length - 2) || (gate.name != "swap" && gate.connector < gate.wires.length - 1)) {
							quirkName = "•";
						}
					}

					if(quirkName) {
						// add gate to column
						quirkColumn.push(quirkName);
					}

					// Not directly supported by quirk
					if(!quirkName) {
						if(gate.connector == 0) {
							quirkName = "~" + gate.name;

							var alreadyDefined = quirk.gates.find(function(gt) {
								return gt.id == quirkName;
							});

							if(!alreadyDefined) {

								var matrix = "";
								matrix += "{";
								basicGate.map(function(row, rowIndex) {
									if(rowIndex > 0) {
										matrix += ",";
									}
									matrix += "{";
									row.map(function(col, colIndex) {
										if(colIndex > 0) {
											matrix += ",";
										}
										matrix += col;
									});
									matrix += "}";
								});
								matrix += "}";

								quirk.gates.push({
									id: quirkName,
									matrix: matrix
								});
							}
							quirkColumn.push(quirkName);
						} else {
							quirkColumn.push(1);
						}
					}
				} else {
					if(gate.connector == 0) {
						quirkColumn.push("~" + gate.name);
					} else {
						quirkColumn.push(1);
					}
				}
			}
		}
		quirk.cols.push(quirkColumn);
	}

	// user defined gates
	if(!decompose) {
		for(var customGateName in circuit.customGates) {
			var customGate = circuit.customGates[customGateName];
			var customCircuit = new QuantumCircuit();
			customCircuit.load(customGate);
			quirk.gates.push({
				id: "~" + customGateName,
				circuit: customCircuit.exportQuirk(true)
			});
		}
	}

	return quirk;
};


QuantumCircuit.prototype.exportSVG = function(embedded) {
	var cellWidth = 40;
	var cellHeight = 40;
	var hSpacing = 20;
	var vSpacing = 20;
	var blackboxPaddingX = 2;
	var blackboxPaddingY = 2;
	var wireColor = "black";
	var wireWidth = 1;
	var dotRadius = 5;

	var numRows = this.numQubits;
	var numCols = this.numCols();

	var totalWidth = ((cellWidth + hSpacing) * numCols) + hSpacing;
	var totalHeight = ((cellHeight + vSpacing) * numRows) + vSpacing;


	function drawGate(gate, colIndex, rowIndex) {
		var dinfo = drawingInfo[gate.name];
		var blackbox = false;
		if(!dinfo) {
			if(gate.wires.length == 1) {
				dinfo = { connectors: ["box"] };
			} else {
				dinfo = { connectors: [] };
				blackbox = true;
			}
		}
		while(dinfo.connectors.length < gate.wires.length) {
			dinfo.connectors.push("box");
		}

		var topWire = Math.min.apply(null, gate.wires);
		var bottomWire = Math.max.apply(null, gate.wires);

		var svg = "";
		svg += "<g class=\"qc-gate-group\">";
		if(blackbox) {
			var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) - blackboxPaddingX;
			var gateY = (((cellHeight + vSpacing) * topWire) + vSpacing) - blackboxPaddingY;
			var gateWidth = cellWidth + (2 * blackboxPaddingX);
			var gateHeight = ((((cellHeight + vSpacing) * bottomWire) + vSpacing + cellHeight) - gateY) + blackboxPaddingY;

			svg += "<rect class=\"qc-gate-blackbox\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"black\" fill=\"transparent\" stroke-width=\"1\" />";
		}

		// link
		if(topWire != bottomWire && !blackbox) {
			var linkX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (cellWidth / 2);
			var linkY1 = (((cellHeight + vSpacing) * topWire) + vSpacing) + (cellHeight / 2);
			var linkY2 = (((cellHeight + vSpacing) * bottomWire) + vSpacing) + (cellHeight / 2);

			svg += "<line class=\"qc-gate-x\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"black\" stroke-width=\"1\" />";
		}

		// connectors
		gate.wires.map(function(wire, connector) {

			switch(dinfo.connectors[connector]) {
				case "box": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = ((cellWidth + hSpacing) * colIndex) + hSpacing;
					var gateY = ((cellHeight + vSpacing) * wire) + vSpacing;

					svg += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"black\" fill=\"white\" stroke-width=\"1\" />";
					svg += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" alignment-baseline=\"middle\" text-anchor=\"middle\">" + (dinfo.label || gate.name) + "</text>";
				}; break;

				case "not": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = ((cellWidth + hSpacing) * colIndex) + hSpacing;
					var gateY = ((cellHeight + vSpacing) * wire) + vSpacing;
					var centerX = gateX + (gateWidth / 2);
					var centerY = gateY + (gateHeight / 2);

					svg += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"black\" fill=\"white\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-not-line\" x1=\"" + centerX + "\" x2=\"" + centerX + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"black\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-not-line\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + centerY +"\" y2=\"" + centerY + "\" stroke=\"black\" stroke-width=\"1\" />";
				}; break;

				case "x": {
					var gateWidth = cellWidth / 2;
					var gateHeight = cellWidth / 2;
					var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (gateWidth / 2);
					var gateY = (((cellHeight + vSpacing) * wire) + vSpacing) + (gateHeight / 2);

					svg += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"black\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + (gateY + gateHeight) +"\" y2=\"" + gateY + "\" stroke=\"black\" stroke-width=\"1\" />";
				}; break;

				case "dot": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (gateWidth / 2);
					var gateY = (((cellHeight + vSpacing) * wire) + vSpacing) + (gateHeight / 2);

					svg += "<circle class=\"qc-gate-dot\" cx=\"" + gateX + "\" cy=\"" + gateY + "\" r=\"" + dotRadius + "\" stroke=\"black\" fill=\"black\" stroke-width=\"1\" />";
				}; break;
			}
		});

		svg += "</g>";

		return svg;
	}

	var svg = "";
	if(!embedded) {
		svg += "<?xml version=\"1.0\"?>";
		svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
	}

	svg += "<svg class=\"qc-circuit\" width=\"" + totalWidth + "\" height=\"" + totalHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

	for(var wire = 0; wire < numRows; wire++) {
		var wireY = ((cellHeight + vSpacing) * wire) + (hSpacing + (cellHeight / 2));
		svg += "<line class=\"qc-wire\" x1=\"0\" x2=\"" + totalWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + wireColor + "\" stroke-width=\"" + wireWidth + "\" />";
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				svg += drawGate(gate, column, wire);
			}
		}
	}
	svg += "</svg>";

	return svg;
};


QuantumCircuit.prototype.run = function(initialValues) {
	this.initState();

	this.stats.start = new Date();

	if(initialValues) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			if(initialValues[wire]) {
				this.applyGate("x", [wire]);
			}
		}
	}

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	var numCols = decomposed.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = decomposed.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				this.applyGate(gate.name, gate.wires, gate.options);
			}
		}
	}

	this.stats.end = new Date();
	this.stats.duration = this.stats.end - this.stats.start;
};

QuantumCircuit.prototype.test = function(name, gates, expectedState) {

	console.log("TEST: " + name);

	this.clear();

	if(!gates || !gates.length) {
		console.log("Invalid input");
		return false;
	}

	for(var i = 0; i < gates.length; i++) {
		var gate = gates[i];
		if(!gate || !gate.length || gate.length < 3) {
			console.log("Invalid input");
			return false;
		}
		this.addGate(gate[0], gate[1], gate[2]);
	}

	this.run();

	var numRes = this.numAmplitudes();
	if(numRes > expectedState.length) {
		console.log("Warning: expected state is incomplette.");
		numRes = expectedState.length;
	}

	var gotError = false;
	for(var i = 0; i < numRes; i++) {
		var expected = expectedState[i];
		var state = this.state[i] || math.complex(0, 0);

		if(math.round(expected[0], 5) != math.round(state.re, 5) || math.round(expected[1], 5) != math.round(state.im, 5)) {
			if(!gotError) {
				gotError = true;
				console.log("ERROR");
			}

			var bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}

			console.log("|" + bin + "> Expected: " + formatComplex2(expected[0], expected[1]) + " Got: " + formatComplex(state));
		}
	}

	console.log(gotError ? "Didn't pass." : "Passed.");
	console.log("");

	return !gotError;
};

QuantumCircuit.prototype.stateAsString = function(onlyPossible) {

	var numAmplitudes = this.numAmplitudes();
	if(!this.state) {
		return "Error: circuit is not initialized. Please call initState() or run() method.";
	}

	var s = "";
	var count = 0;
	for(var i = 0; i < numAmplitudes; i++) {
		var state = this.state[i] || math.complex(0, 0);
		var m = math.round(math.pow(math.abs(state), 2) * 100, 2);
		if(!onlyPossible || m) {
			if(count) { s += "\n"; }
			var bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}
			s += formatComplex(state) + "|" + bin + "> " + m + "%";
			count++;
		}
	}
	return s;
};

QuantumCircuit.prototype.print = function(onlyPossible) {
	console.log(this.stateAsString(onlyPossible));
};


QuantumCircuit.prototype.createCreg = function(creg, len) {
	this.cregs[creg] = [];

	// extend register
	while(this.cregs[creg].length <= (len || 1)) {
		this.cregs[creg].push(0);
	}
};

QuantumCircuit.prototype.setCregBit = function(creg, cbit, value) {
	// see if cbit is integer
	var bit = parseInt(cbit);
	if(isNaN(bit)) {
		throw "Error: invalid \"cbit\" argument to \"setCregBit\" method: expected \"integer\" got \"" + typeof cbit + "\".";
	}

	// create register if does not exist
	if(!this.cregs[creg]) {
		this.cregs[creg] = [];
	}

	// extend register if needed
	while(bit >= this.cregs[creg].length) {
		this.cregs[creg].push(0);
	}

	// set bit
	this.cregs[creg][bit] = value ? 1 : 0;
};

QuantumCircuit.prototype.getCregBit = function(creg, cbit) {
	if(!this.cregs[creg]) {
		throw "Error: \"getCregBit\": unknown register \"" + creg + "\".";
	}

	var bit = parseInt(cbit);
	if(isNaN(bit) || bit >= this.cregs[creg].length) {
		throw "Error: \"getCregBit\": bit \"" + cbit + "\" not found.";
	}
	return this.cregs[creg][bit];
};

QuantumCircuit.prototype.getCregValue = function(creg, cbit) {
	if(!this.cregs[creg]) {
		throw "Error: \"getCregBit\": unknown register \"" + creg + "\".";
	}

	var len = this.cregs[creg].length;
	var value = 0;
	for(var i = 0; i < len; i++) {
		if(this.cregs[creg][i]) {
			value += math.pow(2, i);
		}
	}
	return value;
};

QuantumCircuit.prototype.measure = function(wire, creg, cbit) {
	var bit = math.pow(2, (this.numQubits - 1) - wire);
	var chance = 0;
	for(var is in this.state) {
		var i = parseInt(is);
		if(i & bit) {
			var state = this.state[is];
			if(state.re || state.im) {
				chance += math.pow(math.abs(state), 2);
			}
		}
	}

	var chance = math.round(chance, 5);

	if(creg && typeof cbit != "undefined") {
		// 0.5 == 0 or 0.5 == 1 !? Random?
		if(chance == 0.5) {
			this.setCregBit(creg, cbit, Math.round(Math.random()));
		} else {
			this.setCregBit(creg, cbit, chance > 0.5);
		}
	}

	return chance;
};

module.exports = QuantumCircuit;
