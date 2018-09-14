var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circ = new QuantumCircuit();

circ.addGate("x", -1, 0);
circ.addGate("x", -1, 1);


circ.addGate("h", -1, 0);
circ.addGate("cx", -1, [0, 1]);

circ.run();

console.log("Q0: " + circ.measure(0));
console.log("Q1: " + circ.measure(1));

console.log("");
console.log("Final amplitudes:");

circ.print(true);
