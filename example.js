var QuantumCircuit = require("./quantum-circuit.js");


var circuit = new QuantumCircuit();


circuit.addGate("r2",  0, 0 );
circuit.addGate("r2",  0, 1 );
circuit.addGate("cs",  1, [0, 1] );

circuit.run();

circuit.print();
