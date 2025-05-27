const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = `
	OPENQASM 2.0;
	include "qelib1.inc";
	qreg q[3];
	creg c0[1];
	creg c1[1];
	rx (pi/4) q[0]; // this message will be teleported from qubit 0 to qubit 2
	h q[1];
	cx q[1], q[2];
	cx q[0], q[1];
	h q[0];
	measure q[1] -> c1[0];
	if(c1==1) x q[2];
	measure q[0] -> c0[0];
	if(c0==1) z q[2];
`;

var circuit = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

circuit.importQASM(input);

console.log("");
console.log(circuit.exportQASM("Teleportation"));

console.log("");
console.log(circuit.exportPyquil("Teleportation"));

console.log("");
console.log("Teleporting...");

circuit.run();

console.log("");
console.log("Time: " + circuit.stats.duration + " ms");

console.log("");
console.log("Final amplitudes:");
circuit.print(true);

console.log("");
console.log("Angles:");
console.log(circuit.angles());

console.log("");
console.log("Probabilities:");
console.log(circuit.probabilities());

console.log("");
console.log("Measured (single-shot)");
console.log(circuit.measureAll());

console.log("");
console.log("Counts (1000 shots)");
console.log(circuit.measureAllMultishot(1000));

