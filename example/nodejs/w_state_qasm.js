const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "";
input += "// Name of Experiment: W-state v1\n";

input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";

input += "qreg q[3];\n";
input += "creg c[3];\n";

input += "gate cH a,b {\n";
input += "  h b;\n";
input += "  sdg b;\n";
input += "  cx a,b;\n";
input += "  h b;\n";
input += "  t b;\n";
input += "  cx a,b;\n";
input += "  t b;\n";
input += "  h b;\n";
input += "  s b;\n";
input += "  x b;\n";
input += "  s a;\n";
input += "}\n";

input += "u3(1.91063,0,0) q[0];\n";
input += "cH q[0],q[1];\n";
input += "ccx q[0],q[1],q[2];\n";
input += "x q[0];\n";
input += "x q[1];\n";
input += "cx q[0],q[1];\n";
input += "measure q[0] -> c[0];\n";
input += "measure q[1] -> c[1];\n";
input += "measure q[2] -> c[2];\n";

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
