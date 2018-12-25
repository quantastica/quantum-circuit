const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "\n";
input += "// quantum ripple-carry adder\n";
input += "// 8-bit adder made out of 2 4-bit adders from adder.qasm\n";
input += "// Cuccaro et al, quant-ph/0410184\n";
input += "OPENQASM 2.0;\n";
input += "include \"qelib1.inc\";\n";

input += "gate majority a,b,c\n";
input += "{\n";
input += "  cx c,b;\n"; 
input += "  cx c,a;\n"; 
input += "  ccx a,b,c;\n"; 
input += "}\n";
input += "gate unmaj a,b,c\n";
input += "{\n";
input += "  ccx a,b,c;\n";
input += "  cx c,a;\n"; 
input += "  cx a,b;\n"; 
input += "}\n";

input += "// add a to b, storing result in b\n";
input += "gate add4 a0,a1,a2,a3,b0,b1,b2,b3,cin,cout\n";
input += "{\n";
input += "  majority cin,b0,a0;\n";
input += "  majority a0,b1,a1;\n";
input += "  majority a1,b2,a2;\n";
input += "  majority a2,b3,a3;\n";
input += "  cx a3,cout;\n";
input += "  unmaj a2,b3,a3;\n";
input += "  unmaj a1,b2,a2;\n";
input += "  unmaj a0,b1,a1;\n";
input += "  unmaj cin,b0,a0;\n";
input += "}\n";

input += "// add two 8-bit numbers by calling the 4-bit ripple-carry adder\n";
input += "qreg carry[2];\n";
input += "qreg a[8];\n";
input += "qreg b[8];\n";
input += "creg ans[8];\n";
input += "creg carryout[1];\n";
input += "// set input states\n";
input += "x a[0];\n"; // a = 00000001
input += "x b;\n";
input += "x b[6];\n"; // b = 10111111

input += "// output should be 11000000 0\n";
input += "add4 a[0],a[1],a[2],a[3],b[0],b[1],b[2],b[3],carry[0],carry[1];\n";
input += "add4 a[4],a[5],a[6],a[7],b[4],b[5],b[6],b[7],carry[1],carry[0];\n";

input += "measure b[0] -> ans[0];\n";
input += "measure b[1] -> ans[1];\n";
input += "measure b[2] -> ans[2];\n";
input += "measure b[3] -> ans[3];\n";
input += "measure b[4] -> ans[4];\n";
input += "measure b[5] -> ans[5];\n";
input += "measure b[6] -> ans[6];\n";
input += "measure b[7] -> ans[7];\n";
input += "measure carry[0] -> carryout[0];\n";

var adder = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

adder.importQASM(input);

console.log("");
console.log("Calculating...");

adder.run(null, { partitioning: false });

var answer = adder.getCregValue("ans");
console.log("");
console.log("Answer:", answer, " (" + answer.toString(2) + ")");

console.log("");
console.log("Qubits: " + adder.numQubits);
console.log("Gates: " + adder.numGates(false) + " (" + adder.numGates(true) + " decomposed)");
console.log("Time: " + adder.stats.duration + " ms");

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

