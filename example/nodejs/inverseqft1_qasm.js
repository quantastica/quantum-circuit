const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "";

input += "// QFT and measure, version 1";
input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";
input += "qreg q[4];\n";
input += "creg c[4];\n";
input += "h q;\n";
input += "barrier q;\n";
input += "h q[0];\n";
input += "measure q[0] -> c[0];\n";
input += "if(c==1) u1(pi/2) q[1];\n";
input += "h q[1];\n";
input += "measure q[1] -> c[1];\n";
input += "if(c==1) u1(pi/4) q[2];\n";
input += "if(c==2) u1(pi/2) q[2];\n";
input += "if(c==3) u1(pi/2+pi/4) q[2];\n";
input += "h q[2];\n";
input += "measure q[2] -> c[2];\n";
input += "if(c==1) u1(pi/8) q[3];\n";
input += "if(c==2) u1(pi/4) q[3];\n";
input += "if(c==3) u1(pi/4+pi/8) q[3];\n";
input += "if(c==4) u1(pi/2) q[3];\n";
input += "if(c==5) u1(pi/2+pi/8) q[3];\n";
input += "if(c==6) u1(pi/2+pi/4) q[3];\n";
input += "if(c==7) u1(pi/2+pi/4+pi/8) q[3];\n";
input += "h q[3];\n";
input += "measure q[3] -> c[3];\n";

var circuit = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

circuit.importQASM(input);

console.log("");
console.log(circuit.exportQASM());

//console.log("");
//console.log(JSON.stringify(circuit.exportRaw(), null, '\t'));

console.log("");
console.log("Calculating...");

circuit.run();

console.log("");
console.log("Final amplitudes:");
circuit.print(true);

console.log("");
console.log("Angles:");
console.log(circuit.angles());

console.log("");
console.log("Probabilities:");
console.log(circuit.probabilities());

console.log("");
console.log("Measured:");
console.log(circuit.measureAll());
