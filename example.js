var QuantumCircuit = require("./quantum-circuit.js");


var circuit = new QuantumCircuit();

circuit.addGate("h",  0, 1 );
//circuit.addGate("x",  0, 1 );
circuit.addGate("cx",  1, [0, 1] );

console.log(circuit.exportQASM("example"));

//circuit.addGate("tdg",  0, 0);
//circuit.addGate("h",  0, 1);
//circuit.addGate("h",  0, 2);


circuit.run();

circuit.print();
