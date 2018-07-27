const QuantumCircuit = require("../../src/quantum-circuit.js");

var input = "";
input += "// Sum two numbers\n";
input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";
input += "qreg q[10];\n";
input += "creg c[5];\n";
input += "gate majority a,b,c\n";
input += "{\n";
input += "  cx c, b;\n";
input += "  cx c, a;\n";
input += "  ccx a, b, c;\n";
input += "}\n";

input += "gate unmaj a,b,c\n";
input += "{\n";
input += "  ccx a, b, c;\n";
input += "  cx c, a;\n";
input += "  cx a, b;\n";
input += "}\n";

input += "majority q[0], q[5], q[1];\n";
input += "majority q[1], q[6], q[2];\n";
input += "majority q[2], q[7], q[3];\n";
input += "majority q[3], q[8], q[4];\n";
input += "cx q[4], q[9];\n";
input += "unmaj q[3], q[8], q[4];\n";
input += "unmaj q[2], q[7], q[3];\n";
input += "unmaj q[1], q[6], q[2];\n";
input += "unmaj q[0], q[5], q[1];\n";

input += "measure q[0] -> c[0];\n";


var adder = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

adder.importQASM(input);

console.log("");
console.log("Calculating 7 + 3 = ...");

adder.run([0,  1, 1, 1, 0,    1, 1, 0, 0,   0]);

console.log("");
console.log("Final amplitudes:");

adder.print(true);

console.log("(Result of addition is stored in last 5 bits)");
