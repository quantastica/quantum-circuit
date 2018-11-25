const QuantumCircuit = require("../../lib/quantum-circuit.js");

var input = "";
input += "// quantum ripple-carry adder from Cuccaro et al, quant-ph/0410184\n";
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

input += "qreg cin[1];\n";
input += "qreg a[4];\n";
input += "qreg b[4];\n";
input += "qreg cout[1];\n";
input += "creg ans[5];\n";

input += "// set input states\n";
input += "x a[0]; // a = 0001\n";
input += "x b; // b = 1111\n";

input += "// add a to b, storing result in b\n";
input += "majority cin[0],b[0],a[0];\n";
input += "majority a[0],b[1],a[1];\n";
input += "majority a[1],b[2],a[2];\n";
input += "majority a[2],b[3],a[3];\n";
input += "cx a[3],cout[0];\n";
input += "unmaj a[2],b[3],a[3];\n";
input += "unmaj a[1],b[2],a[2];\n";
input += "unmaj a[0],b[1],a[1];\n";
input += "unmaj cin[0],b[0],a[0];\n";

input += "measure b[0] -> ans[0];\n";
input += "measure b[1] -> ans[1];\n";
input += "measure b[2] -> ans[2];\n";
input += "measure b[3] -> ans[3];\n";
input += "measure cout[0] -> ans[4];\n";

var adder = new QuantumCircuit();

console.log("");
console.log("Importing QASM...");

adder.importQASM(input);

console.log("");
console.log(adder.exportQASM("Sum two numbers"));

console.log("");
console.log(adder.exportPyquil("Sum two numbers"));

//console.log("");
//console.log(JSON.stringify(adder.exportRaw(), null, '\t'));

console.log("");
console.log("Calculating...");

adder.run();

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
