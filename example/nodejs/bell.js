var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circ = new QuantumCircuit();

circ.addGate("h", -1, 0);
circ.addGate("cx", -1, [0, 1]);

circ.run();

console.log("");
console.log(circ.exportQASM());

console.log("");
console.log(circ.exportPyquil());

//console.log("");
//console.log(JSON.stringify(circ.exportRaw(), null, '\t'));

console.log("");
console.log("Final amplitudes:");
circ.print(true);

console.log("");
console.log("Angles:");
console.log(circ.angles());

console.log("");
console.log("Probabilities:");
console.log(circ.probabilities());

console.log("");
console.log("Measured:");
console.log(circ.measureAll());
