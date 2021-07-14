var QuantumCircuit = require("../lib/quantum-circuit.js");

var circuit = new QuantumCircuit();

console.log(JSON.stringify(circuit.basicGates, null, "\t"));
