const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "";

input += "// quantum Fourier transform\n";
input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";
input += "qreg q[4];\n";
input += "creg c[4];\n";
input += "x q[0]; \n";
input += "x q[2];\n";
input += "barrier q;\n";
input += "h q[0];\n";
input += "cu1(pi/2) q[1],q[0];\n";
input += "h q[1];\n";
input += "cu1(pi/4) q[2],q[0];\n";
input += "cu1(pi/2) q[2],q[1];\n";
input += "h q[2];\n";
input += "cu1(pi/8) q[3],q[0];\n";
input += "cu1(pi/4) q[3],q[1];\n";
input += "cu1(pi/2) q[3],q[2];\n";
input += "h q[3];\n";
input += "measure q -> c;\n";



var qft = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

qft.importQASM(input);

console.log("");
console.log(qft.exportQASM("4-bit QFT"));

console.log("");
console.log(qft.exportPyquil("4-bit QFT"));

console.log("");
console.log("Calculating...");

qft.run();

console.log("");
console.log("Time: " + qft.stats.duration + " ms");

console.log("");
console.log("Final amplitudes:");
qft.print(true);

console.log("");
console.log("Angles:");
console.log(qft.angles());

console.log("");
console.log("Probabilities:");
console.log(qft.probabilities());

console.log("");
console.log("Measured:");
console.log(qft.measureAll());
