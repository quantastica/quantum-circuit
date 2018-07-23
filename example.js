var QuantumCircuit = require("./quantum-circuit.js");


var circuit = new QuantumCircuit();

circuit.addGate("h",  0, 1);
circuit.addGate("cx",  1, [1, 0]);

console.log(circuit.exportQASM("Bell state"));

circuit.run();

console.log("Final amplitudes:");

circuit.print();
