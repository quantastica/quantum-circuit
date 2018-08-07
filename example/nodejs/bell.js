var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circ = new QuantumCircuit();

circ.addGate("h", 0, 0);
circ.addGate("cx", 1, [0, 1]);

circ.run();

console.log("Q0: " + circ.measure(0));
console.log("Q1: " + circ.measure(1));
