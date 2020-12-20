/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

var QuantumCircuit = require("../lib/quantum-circuit.js");
var math = require("mathjs");

var assert = require("assert");

var circuit = new QuantumCircuit();

var checkBasicGates = function() {
	for(var gateName in circuit.basicGates) {
		var gate = circuit.basicGates[gateName];

		// if gate has matrix
		if(gate.matrix && gate.matrix.length) {

			// gate params
			var params = {};
			if(gate.params && gate.params.length) {
				gate.params.map(function(paramName) {
					params[paramName] = Math.PI / 3;
				});
			}

			// calculate matrix with params
			var matrix = JSON.parse(JSON.stringify(gate.matrix));
			matrix.map(function(row, rowIndex) {
				row.map(function(value, colIndex) {
					matrix[rowIndex][colIndex] = math.evaluate(value, params);
				});
			});

			it("\"" + gateName + "\" should be unitary", function() {
				assert(circuit.isUnitaryMatrix(matrix));
			});
		}
	}
	return true;
};

var checkImportExportQASM = function() {
	for(var gateName in circuit.basicGates) {
		var gate = circuit.basicGates[gateName];

		
		if(gate.matrix && gate.matrix.length) {
			var wires = [];
			for(var i = 0; i < Math.log2(gate.matrix.length); i++){
				wires.push(i);
			}

			var params = {};
			if(gate.params && gate.params.length) {
				gate.params.map(function(paramName) {
					params[paramName] = Math.PI / 5;
				});
			}

			var circ = new QuantumCircuit();

			circ.appendGate(gateName, wires, { params: params });

			var M1 = circ.circuitMatrix();
			circ.importQASM(circ.exportToQASM({ compatibilityMode: true }));
			var M2 = circ.circuitMatrix();

			it("Circuit for " + gateName + " from exportQASM should be same as original circuit", function() {
				assert(Math.round(circ.matrixDiff(M1, M2), 7) == 0);
			});
		}
	}
	return true;
};

var checkImportExportQuil = function() {
	for(var gateName in circuit.basicGates) {
		var gate = circuit.basicGates[gateName];
		
		if(gate.matrix && gate.matrix.length) {
			var wires = [];
			for(var i = 0; i < Math.log2(gate.matrix.length); i++){
				wires.push(i);
			}

			var params = {};
			if(gate.params && gate.params.length) {
				gate.params.map(function(paramName) {
					params[paramName] = Math.PI / 5;
				});
			}

			var circ = new QuantumCircuit();

			circ.appendGate(gateName, wires, { params: params });

			var M1 = circ.circuitMatrix();
			circ.importQuil(circ.exportQuil());
			var M2 = circ.circuitMatrix();

			it("Circuit for " + gateName + " from exportQuil should be same as original circuit", function() {
				assert(Math.round(circ.matrixDiff(M1, M2), 7) == 0);
			});
		}
	}
	return true;
};

var circuits = {

	"X": {
		circuit: [
			["x",  0, 0]
		],
		state: [
		[0, 0],
		[1, 0]
		]
	},

	"Y": {
		circuit: [
			["y",  0, 0]
		],
		state: [
			[0, 0],
			[0, 1]
		]
	},

	"Z": {
		circuit: [
			["z",  0, 0]
		],
		state: [
			[1, 0],
			[0, 0]
		]
	},

	"H": {
		circuit: [
			["h",  0, 0]
		],
		state: [
			[0.70710678, 0],
			[0.70710678, 0]
		]
	},

	"SRN": {
		circuit: [
			["srn",  0, 0]
		],
		state: [
			[0.5, 0.5],
			[0.5, -0.5]
		]
	},

	"X-R2": {
		circuit: [
			["x",   0, 0],
			["r2",  1, 0]
		],
		state: [
			[0, 0],
			[0, 1]
		]
	},

	"X-R4": {
		circuit: [
			["x",   0, 0],
			["r4",  1, 0]
		], state: [
			[0, 0],
			[0.70710678, 0.70710678]
		]
	},

	"X-R8": {
		circuit: [
			["x",   0, 0],
			["r8",  1, 0]
		], state: [
			[0, 0],
			[0.92387953, 0.38268343]
		]
	},

	"Bell": {
		circuit: [
			["h",  0, 0],
			["cx", 1, [0, 1]]
		],
		state: [
			[0.70710678, 0],
			[0,          0],
			[0,          0],
			[0.70710678, 0]
		]
	}
};

var testCircuit = function(name, gates, expectedState) {
	circuit.clear();

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
		circuit.addGate(gate[0], gate[1], gate[2]);
	}

	circuit.run();

	var numRes = circuit.numAmplitudes();
	if(numRes > expectedState.length) {
		console.log("Warning: expected state provided to test is incomplette.");
		numRes = expectedState.length;
	}

	var gotError = false;
	for(var i = 0; i < numRes; i++) {
		var expected = expectedState[i];
		var state = circuit.state[i] || math.complex(0, 0);

		if(math.round(expected[0], 7) != math.round(state.re, 7) || math.round(expected[1], 7) != math.round(state.im, 7)) {
			if(!gotError) {
				gotError = true;
				console.log("ERROR");
			}

			var bin = i.toString(2);
			while(bin.length < circuit.numQubits) {
				bin = "0" + bin;
			}

			console.log("|" + bin + "> Expected: " + formatComplex2(expected[0], expected[1]) + " Got: " + formatComplex(state));
		}
	}

	return !gotError;
};

var testCircuits = function() {
	for(var name in circuits) {
		var circ = circuits[name];

		it("\"" + name + "\" output state should be correct", function() {
			assert(testCircuit(name, circ.circuit, circ.state));
		});
	}
	return true;
};


describe("Check if all gate matrices are unitary", function() {
	checkBasicGates();
});

describe("Check if import from and export to QASM works properly", function() {
	checkImportExportQASM();
});

describe("Check if import from and export to QUIL works properly", function() {
	checkImportExportQuil();
});

describe("Run circuits and check output", function() {
	testCircuits();
});
