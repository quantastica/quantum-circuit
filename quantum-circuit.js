/*
	Quantum Circuit Emulator

	Petar Korponaić <petar.korponaic@gmail.com>

	November 2016
*/

var randomString = function(len) {
	len = len || 17;

	let text = "";
	// let first char to be letter
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be numbers
	charset += "0123456789";
	for(var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};

var zeroesMatrix = function(n) {
	let matrix = [];
	for(var i = 0; i < n; i++) {
		matrix[i] = [];
		for(var j = 0; j < n; j++) {
			matrix[i][j] = 0;
		}
	}
	return matrix;
}

var identityMatrix = function(n) {
	let matrix = [];
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

class QuantumCircuit {
	constructor(numQubits = 1) {
		this.init();
	}

	init(numQubits = 1) {
		this.numQubits = numQubits || 1;
		this.customGates = {};
		this.clear();
	}

	numAmplitudes() {
		return math.pow(2, this.numQubits);
	}

	resetState() {
		this.state = [];
		this.resetTransform();
	}

	initState() {
		this.resetState();
		this.state.push(math.complex(1, 0));
		let numAmplitudes = this.numAmplitudes();
		for(let i = 1; i < numAmplitudes; i++) {
			this.state.push(math.complex(0, 0));
		}
		this.initTransform();
	}

	resetTransform() {
		this.T = [];
	}

	initTransform() {
		this.resetTransform();
		let n = math.pow(2, this.numQubits);
		for(var i = 0; i < n; i++) {
			this.T[i] = [];
			for(var j = 0; j < n; j++) {
				this.T[i][j] = 0;
			}
		}
	}

	clear() {
		this.gates = [];
		for(let i = 0; i < this.numQubits; i++) {
			this.gates.push([]);
		}
		this.resetState();
	}

	numCols() {
		return this.gates.length ? this.gates[0].length : 0;
	}

	addGate(gateName, column, wires) {
		let wireList = [];
		if(Array.isArray(wires)) {
			for(let i = 0; i < wires.length; i++) {
				wireList.push(wires[i]);
			}
		} else {
			wireList.push(wires);
		}

		let numConnectors = wireList.length;
		let id = randomString();
		for(let connector = 0; connector < numConnectors; connector++) {
			let wire = wireList[connector];

			if((wire + 1) > this.numQubits) {
				this.numQubits = wire + 1;
			}

			while(this.gates.length < this.numQubits) {
				this.gates.push([]);
			}

			let numCols = this.numCols();
			if((column + 1) > numCols) {
				numCols = column + 1;
			}

			for(let i = 0; i < this.gates.length; i++) {
				while(this.gates[i].length < numCols) {
					this.gates[i].push(null);
				}
			}

			let gate = {
				id: id,
				name: gateName.toLowerCase(),
				connector: connector
			}

			this.gates[wire][column] = gate;
		}
	}

	removeGate(column, wire) {
		if(!this.gates[wire]) {
			return;
		}

		let gate = this.gates[wire][column];
		if(!gate) {
			return;
		}

		let id = gate.id;

		let numWires = this.gates[0].length;
		for(let wire = 0; wire < numWires; wire++) {
			if(this.gates[wire][column].id == id) {
				this.gates[wire][column] = null;
			}
		}
	}

	createTransform(U, qubits) {
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

	applyGate(gateName, wires) {
		let gate = basicGates[gateName.toLowerCase()];
		if(!gate) {
			console.log("Unknown gate \"" + gateName + "\".");
			return;
		}
		this.createTransform(gate, wires);
		this.state = math.multiply(this.T, this.state);
	}

	decompose(obj) {
		if(!obj.gates.length) {
			return obj;
		}

		function injectArray(a1, a2, pos) {
			return a1.slice( 0, pos ).concat( a2 ).concat( a1.slice( pos ) );
		}

		for(let column = 0; column < obj.gates[0].length; column++) {
			for(let wire = 0; wire < obj.numQubits; wire++) {
				let gate = obj.gates[wire][column];
				if(gate && gate.connector == 0 && !basicGates[gate.name]) {
					let tmp = new QuantumCircuit();
					let custom = obj.customGates[gate.name];
					if(custom) {
						tmp.load(custom);
						let decomposed = tmp.save(true);
						let empty = [];
						for(let i = 0; i < decomposed.gates[0].length - 1; i++) {
							empty.push(null);
						}
						// shift columns right
						for(let w = 0; w < obj.numQubits; w++) {
							let g = obj.gates[w][column];
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

	save(decompose) {
		let data = {
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

	load(obj) {
		this.numQubits = obj.numQubits || 1;
		this.clear();
		this.gates = JSON.parse(JSON.stringify(obj.gates));
		this.customGates = JSON.parse(JSON.stringify(obj.customGates));
	}

	registerGate(name, obj) {
		this.customGates[name] = obj;
	}

	getGateAt(column, wire) {
		if(!this.gates[wire]) {
			return null;
		}

		let gate = JSON.parse(JSON.stringify(this.gates[wire][column]));
		if(!gate) {
			return null;
		}
		gate.wires = [];

		let id = gate.id;
		let numWires = this.gates.length;
		for(let wire = 0; wire < numWires; wire++) {
			let g = this.gates[wire][column];
			if(g && g.id == id) {
				gate.wires[g.connector] = wire;
			}
		}
		return gate;
	}

	run(initialValues) {
		this.initState();

		if(initialValues) {
			for(let wire = 0; wire < this.numQubits; wire++) {
				if(initialValues[wire]) {
					this.applyGate("x", [wire]);
				}
			}
		}

		let decomposed = new QuantumCircuit();
		decomposed.load(this.save(true));

		let numCols = decomposed.numCols();
		for(let column = 0; column < numCols; column++) {
			for(let wire = 0; wire < this.numQubits; wire++) {
				let gate = decomposed.getGateAt(column, wire);
				if(gate && gate.connector == 0) {
					this.applyGate(gate.name, gate.wires);
				}
			}
		}
	}

	stateAsString() {
		function formatComplex(complex) {
			let re = math.round(complex.re, 8);
			let im = math.round(complex.im, 8);
			return re + (im >= 0 ? "+" : "-") + math.abs(im) + "i";
		}

		let s = "";
		let numAmplitudes = this.numAmplitudes();
		for(let i = 0; i < numAmplitudes; i++) {
			if(i) { s += "\n"; }
			let m = math.round(math.pow(math.abs(this.state[i]), 2) * 100, 2);
			let bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}
			s += formatComplex(this.state[i]) + "|" + bin + "> " + m + "%";
		}
		return s;
	}

	print() {
		console.log(this.stateAsString());
	}
};

