/*
	Quantum Circuit Emulator

	Petar Korponaić <petar.korponaic@gmail.com>

	November 2016
*/

if(typeof require == "undefined") {
	require = function(s) { console.log(s + " is required."); };
}

var math = math || require("mathjs");


var randomString = function(len) {
	len = len || 17;

	var text = "";
	// var first char to be letter
	var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be numbers
	charset += "0123456789";
	for(var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
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
}

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

var basicGates = {
	x: [
		[0, 1], [1, 0]
	],
	y: [
		[0, math.multiply(-1, math.i) ], 
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
		[1 / math.sqrt(2),  0 - (1 / math.sqrt(2)) ], 
		[1 / math.sqrt(2),  1 / math.sqrt(2) ]
	],
	s: [
		[1, 0], [0, math.pow(math.e, math.multiply(math.i, math.PI / 2))]
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
	swap: [
		[1, 0, 0, 0],
		[0, 0, 1, 0],
		[0, 1, 0, 0],
		[0, 0, 0, 1]
	],
	srswap: [
		[1, 0, 0, 0],
		[0, math.multiply(0.5, math.add(1, math.i)), math.multiply(0.5, math.subtract(1, math.i)), 0],
		[0, math.multiply(0.5, math.subtract(1, math.i)), math.multiply(0.5, math.add(1, math.i)), 0],
		[0, 0, 0, 1]
	]
};

basicGates.cx = makeControlled(basicGates.x);
basicGates.cy = makeControlled(basicGates.y);
basicGates.cz = makeControlled(basicGates.z);
basicGates.ch = makeControlled(basicGates.h);
basicGates.csrn = makeControlled(basicGates.srn);
basicGates.cs = makeControlled(basicGates.s);
basicGates.cr2 = makeControlled(basicGates.r2);
basicGates.cr4 = makeControlled(basicGates.r4);
basicGates.cr8 = makeControlled(basicGates.r8);

var QuantumCircuit = function(numQubits) {
	this.init();
}

QuantumCircuit.prototype.init = function(numQubits) {
	this.numQubits = numQubits || 1;
	this.customGates = {};
	this.clear();
}

QuantumCircuit.prototype.numAmplitudes = function() {
	return math.pow(2, this.numQubits);
}

QuantumCircuit.prototype.resetState = function() {
	this.state = [];
	this.resetTransform();
}

QuantumCircuit.prototype.initState = function() {
	this.resetState();
	this.state.push(math.complex(1, 0));
	var numAmplitudes = this.numAmplitudes();
	for(var i = 1; i < numAmplitudes; i++) {
		this.state.push(math.complex(0, 0));
	}
	this.initTransform();
}

QuantumCircuit.prototype.resetTransform = function() {
	this.T = [];
}

QuantumCircuit.prototype.initTransform = function() {
	this.resetTransform();
	var n = math.pow(2, this.numQubits);
	for(var i = 0; i < n; i++) {
		this.T[i] = [];
		for(var j = 0; j < n; j++) {
			this.T[i][j] = 0;
		}
	}
}

QuantumCircuit.prototype.clear = function() {
	this.gates = [];
	for(var i = 0; i < this.numQubits; i++) {
		this.gates.push([]);
	}
	this.resetState();
}

QuantumCircuit.prototype.numCols = function() {
	return this.gates.length ? this.gates[0].length : 0;
}

QuantumCircuit.prototype.addGate = function(gateName, column, wires) {
	var wireList = [];
	if(Array.isArray(wires)) {
		for(var i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
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
			name: gateName.toLowerCase(),
			connector: connector
		}

		this.gates[wire][column] = gate;
	}
}

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
}

QuantumCircuit.prototype.createTransform = function(U, qubits) {
	this.initTransform();

	var _qubits = [];
	qubits = qubits.slice(0);
	for (var i = 0; i < qubits.length; i++) {
		qubits[i] = (this.numQubits - 1) - qubits[i];
	}
	qubits.reverse();
	for (var i = 0; i < this.numQubits; i++) {
		if (qubits.indexOf(i) == -1) {
			_qubits.push(i);
		}
	}

	var n = math.pow(2, this.numQubits);
	var i = n;
	while (i--) {
		var j = n;
		while (j--) {
			var bitsEqual = true;
			var k = _qubits.length;
			while (k--) {
				if ((i & (1 << _qubits[k])) != (j & (1 << _qubits[k]))) {
					bitsEqual = false;
					break;
				}
			}
			if (bitsEqual) {
				var istar = 0, jstar = 0;
				k = qubits.length;
				while (k--) {
					var q = qubits[k];
					istar |= ((i & (1 << q)) >> q) << k;
					jstar |= ((j & (1 << q)) >> q) << k;
				}
				this.T[i][j] = U[istar][jstar];
			}
		}
	}
}

QuantumCircuit.prototype.applyGate = function(gateName, wires) {
	var gate = basicGates[gateName.toLowerCase()];
	if(!gate) {
		console.log("Unknown gate \"" + gateName + "\".");
		return;
	}
	this.createTransform(gate, wires);
	this.state = math.multiply(this.T, this.state);
}

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
			if(gate && gate.connector == 0 && !basicGates[gate.name]) {
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
}

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
}

QuantumCircuit.prototype.load = function(obj) {
	this.numQubits = obj.numQubits || 1;
	this.clear();
	this.gates = JSON.parse(JSON.stringify(obj.gates));
	this.customGates = JSON.parse(JSON.stringify(obj.customGates));
}

QuantumCircuit.prototype.registerGate = function(name, obj) {
	this.customGates[name] = obj;
}

QuantumCircuit.prototype.getGateAt = function(column, wire) {
	if(!this.gates[wire]) {
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
}

QuantumCircuit.prototype.run = function(initialValues) {
	this.initState();

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
				this.applyGate(gate.name, gate.wires);
			}
		}
	}
}

QuantumCircuit.prototype.stateAsString = function() {
	function formatComplex(complex) {
		var re = math.round(complex.re, 8);
		var im = math.round(complex.im, 8);
		return re + (im >= 0 ? "+" : "-") + math.abs(im) + "i";
	}

	var s = "";
	var numAmplitudes = this.numAmplitudes();
	for(var i = 0; i < numAmplitudes; i++) {
		if(i) { s += "\n"; }
		var m = math.round(math.pow(math.abs(this.state[i]), 2) * 100, 2);
		var bin = i.toString(2);
		while(bin.length < this.numQubits) {
			bin = "0" + bin;
		}
		s += formatComplex(this.state[i]) + "|" + bin + "> " + m + "%";
	}
	return s;
}

QuantumCircuit.prototype.print = function() {
	console.log(this.stateAsString());
}


// Export for npm
if(typeof module != "undefined" && module.exports) {
	module.exports = QuantumCircuit;
}
