var QuantumCircuit = require("./quantum-circuit.js");

// Adder: sums two 4-bit numbers
//   Input: first number in qubits 1, 2, 3, 4. Second number in qubits 5, 6, 7, 8
//   Output: qubits 5, 6, 7, 8, 9

var majority = new QuantumCircuit();
majority.addGate("cx", 0, [2, 1]);
majority.addGate("cx", 1, [2, 0]);
majority.addGate("ccx", 2, [0, 1, 2]);

var unmaj = new QuantumCircuit();
unmaj.addGate("ccx", 0, [0, 1, 2]);
unmaj.addGate("cx", 1, [2, 0]);
unmaj.addGate("cx", 2, [0, 1]);

var circuit = new QuantumCircuit();
circuit.registerGate("majority", majority.save());
circuit.registerGate("unmaj", unmaj.save());

circuit.addGate("majority", 0, [0, 5, 1]);
circuit.addGate("majority", 1, [1, 6, 2]);
circuit.addGate("majority", 2, [2, 7, 3]);
circuit.addGate("majority", 3, [3, 8, 4]);
circuit.addGate("cx", 		4, [4, 9]);
circuit.addGate("unmaj",    5, [3, 8, 4]);
circuit.addGate("unmaj",    6, [2, 7, 3]);
circuit.addGate("unmaj",    7, [1, 6, 2]);
circuit.addGate("unmaj",    8, [0, 5, 1]);

console.log(circuit.exportQASM("Sum two numbers"));

circuit.run([0,  1, 1, 1, 0,    1, 1, 0, 0,   0]);

console.log("Final amplitudes:");

circuit.print(true);

console.log("(Result of addition is stored in last 5 bits)");
