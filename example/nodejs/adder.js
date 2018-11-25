//
// Adder: sums two 4-bit numbers
//   Input: first number in qubits 1, 2, 3, 4. Second number in qubits 5, 6, 7, 8
//   Output: qubits 5, 6, 7, 8, 9
//

var QuantumCircuit = require("../../lib/quantum-circuit.js");


var majority = new QuantumCircuit();
majority.addGate("cx", 0, [2, 1]);
majority.addGate("cx", 1, [2, 0]);
majority.addGate("ccx", 2, [0, 1, 2]);

var unmaj = new QuantumCircuit();
unmaj.addGate("ccx", 0, [0, 1, 2]);
unmaj.addGate("cx", 1, [2, 0]);
unmaj.addGate("cx", 2, [0, 1]);

var adder = new QuantumCircuit();
adder.registerGate("majority", majority.save());
adder.registerGate("unmaj", unmaj.save());

adder.addGate("majority", 0, [0, 5, 1]);
adder.addGate("majority", 1, [1, 6, 2]);
adder.addGate("majority", 2, [2, 7, 3]);
adder.addGate("majority", 3, [3, 8, 4]);
adder.addGate("cx",       4, [4, 9]);
adder.addGate("unmaj",    5, [3, 8, 4]);
adder.addGate("unmaj",    6, [2, 7, 3]);
adder.addGate("unmaj",    7, [1, 6, 2]);
adder.addGate("unmaj",    8, [0, 5, 1]);

adder.addMeasure(5, "ans", 0);
adder.addMeasure(6, "ans", 1);
adder.addMeasure(7, "ans", 2);
adder.addMeasure(8, "ans", 3);
adder.addMeasure(9, "ans", 4);

console.log("");
console.log("Calculating...");

adder.run([0,  1, 0, 0, 0,    1, 1, 1, 1,   0]);


console.log("");
console.log("Answer:", adder.getCregValue("ans"));


console.log("");
console.log("Final amplitudes:");
adder.print(true);

console.log("");
console.log("Angles:");
console.log(adder.angles());

console.log("");
console.log("Probabilities:");
console.log(adder.probabilities());

console.log("");
console.log("Measured:");
console.log(adder.measureAll());

