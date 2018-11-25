const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "";
input += "// Name of Experiment: pea_3*pi/8 v3\n";

input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";


input += "qreg q[5];\n";
input += "creg c[4];\n";
input += "gate cu1fixed (a) c,t {\n";
input += "    u1 (-1*a) t;\n";
input += "    cx c,t;\n";
input += "    u1 (a) t;\n";
input += "    cx c,t;\n";
input += "}\n";

input += "gate cu c,t {\n";
input += "    cu1fixed (3*pi/8) c,t;\n";
input += "}\n";

input += "h q[0];\n";
input += "h q[1];\n";
input += "h q[2];\n";
input += "h q[3];\n";
input += "cu q[3],q[4];\n";
input += "cu q[2],q[4];\n";
input += "cu q[2],q[4];\n";
input += "cu q[1],q[4];\n";
input += "cu q[1],q[4];\n";
input += "cu q[1],q[4];\n";
input += "cu q[1],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "cu q[0],q[4];\n";
input += "h q[0];\n";
input += "cu1(-1*pi/2) q[0],q[1];\n";
input += "h q[1];\n";
input += "cu1(-1*pi/4) q[0],q[2];\n";
input += "cu1(-1*pi/2) q[1],q[2];\n";
input += "h q[2];\n";
input += "cu1(-1*pi/8) q[0],q[3];\n";
input += "cu1(-1*pi/4) q[1],q[3];\n";
input += "cu1(-1*pi/2) q[2],q[3];\n";
input += "h q[3];\n";
input += "measure q[0] -> c[0];\n";
input += "measure q[1] -> c[1];\n";
input += "measure q[2] -> c[2];\n";
input += "measure q[3] -> c[3];\n";

var circuit = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

circuit.importQASM(input);

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

