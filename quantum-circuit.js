/*
	Quantum Circuit Emulator

	Original code by Petar Korponaić <petar.korponaic@gmail.com>

	November 2016
*/

var gates = {
	x:   [[0, 1], [1, 0]],
	y:   [[0, math.multiply(-1, math.i) ], [math.i, 0]],
	z:   [[1,  0], [0, -1]],
	h:   [[1 / math.sqrt(2),  1 / math.sqrt(2)], [ 1 / math.sqrt(2), 0 - (1 / math.sqrt(2))]],
	srn: [[1 / math.sqrt(2),  0 - (1 / math.sqrt(2)) ], [1 / math.sqrt(2),  1 / math.sqrt(2) ]],
	s:   [[1, 0], [0, math.pow(math.e, math.multiply(math.i, math.PI / 2))]],
	r2:  [[1, 0], [0, math.pow(math.e, math.multiply(math.i, math.PI / 2))]],
	r4:  [[1, 0], [0, math.pow(math.e, math.multiply(math.i, math.PI / 4))]],
	r8:  [[1, 0], [0, math.pow(math.e, math.multiply(math.i, math.PI / 8))]]
};


class QuantumCircuit {
	constructor(numQubits = 1) {
		this.resize(numQubits);
	}

	numAmplitudes() {
		return math.pow(2, this.numQubits);
	}

	resize(numQubits = 1) {
		this.numQubits = numQubits;
		this.resetState();
	}

	resetState() {
		this.state = [];
		this.state.push(math.complex(1, 0));
		let numAmplitudes = this.numAmplitudes();
		for(let i = 1; i < numAmplitudes; i++) {
			this.state.push(math.complex(0, 0));
		}
		this.resetTransform();
	}

	resetTransform() {
		this.T = [];
		let n = math.pow(2, this.numQubits);
		for(var i = 0; i < n; i++) {
			this.T[i] = [];
			for(var j = 0; j < n; j++) {
				this.T[i][j] = 0;
			}
		}
	}

	createTransform(U, qubits) {
		this.resetTransform();

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

	applyGate(gateName, wire) {
		let gate = gates[gateName.toLowerCase()];
		if(!gate) {
			console.log("Unknown gate \"" + gateName + "\".");
			return;
		}
		this.createTransform(gate, [wire]);
		this.state = math.multiply(this.T, this.state);
	}

	asString() {
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
		console.log(this.asString());
	}

};

