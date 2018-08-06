var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circ = new QuantumCircuit(3);

circ.addGate("h", 0, 0);
circ.addGate("cx", 1, [0, 24]);

console.log("Run...");
console.log(new Date());

circ.run();

console.log("Measure...");
console.log(new Date());

console.log("Q0: " + circ.measure(0));
console.log("Q1: " + circ.measure(24));
