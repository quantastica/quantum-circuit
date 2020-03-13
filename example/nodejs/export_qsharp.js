var QuantumCircuit = require("../../lib/quantum-circuit.js");

const circuit = new QuantumCircuit();

circuit.createCreg("c1", 1);

// circuit.appendGate("id", 0, {});
// circuit.appendGate("x", 0, {});
// circuit.appendGate("y", 0, {});
// circuit.appendGate("z", 0, {});
// circuit.appendGate("h", 0, {});
// circuit.appendGate("srn", 0, {});
// circuit.appendGate("r2", 0, {});
// circuit.appendGate("r4", 0, {});
// circuit.appendGate("r8", 0, {});
// circuit.appendGate("rx", 0, {"params":{"theta":"pi/3"}});
// circuit.appendGate("ry", 0, {"params":{"theta":"pi/3"}});
// circuit.appendGate("rz", 0, {"params":{"phi":"pi/3"}});
// circuit.appendGate("u1", 0, {"params":{"lambda":"pi/3"}});
// circuit.appendGate("u2", 0, {"params":{"phi":"pi/3","lambda":"pi/3"}});
// circuit.appendGate("u3", 0, {"params":{"theta":"pi/3","phi":"pi/3","lambda":"pi/3"}});
// circuit.appendGate("s", 0, {});
// circuit.appendGate("t", 0, {});
// circuit.appendGate("sdg", 0, {});
// circuit.appendGate("tdg", 0, {});
// circuit.appendGate("swap", [0,1], {});
// circuit.appendGate("srswap", [0,1], {});
// circuit.appendGate("iswap", [0,1], {});
// circuit.appendGate("xy", [0,1], {"params":{"phi":"pi/2"}});
// circuit.appendGate("cx", [0,1], {});
// circuit.appendGate("cy", [0,1], {});
// circuit.appendGate("cz", [0,1], {});
// circuit.appendGate("ch", [0,1], {});
// circuit.appendGate("csrn", [0,1], { 
//     condition: { 
//         creg: "c1",
//         value: 7
//     }
// });
// circuit.appendGate("ms", [0,1], {"params":{"theta":"pi/3"}});
// circuit.appendGate("yy", [0,1], {"params":{"theta":"pi/3"}});
// circuit.appendGate("cr2", [0,1], {});
// circuit.appendGate("cr4", [0,1], {});
// circuit.appendGate("cr8", [0,1], {});
// circuit.appendGate("crx", [0,1], {"params":{"theta":"pi/3"}});
// circuit.appendGate("cry", [0,1], {"params":{"theta":"pi/3"}});
// circuit.appendGate("crz", [0,1], {"params":{"phi":"pi/3"}});
// circuit.appendGate("cu1", [0,1], {"params":{"lambda":"pi/3"}});
// circuit.appendGate("cu2", [0,1], {"params":{"phi":"pi/3","la`mbda":"pi/3"}});
// circuit.appendGate("cu3", [0,1], {"params":{"theta":"pi/3","phi":"pi/3","lambda":"pi/3"}});
// circuit.appendGate("cs", [0,1], {});
// circuit.appendGate("ct", [0,1], {});
// circuit.appendGate("csdg", [0,1], {});
// circuit.appendGate("ctdg", [0,1], {});
// circuit.appendGate("ccx", [0,1,2], {});
// circuit.appendGate("cswap", [0,1,2], {});
circuit.appendGate("csrswap", [0,1,2], {});
// circuit.appendGate("reset", 0, {});
circuit.addMeasure(0, "c1", 0);

// circuit.run();

// console.log(circuit.exportQiskit());

// var input = `
//     OPENQASM 2.0;
//     include "qelib1.inc";
//     qreg q[2];
//     gate sub1 a, b
//     {
//         xy a, b;
//     }

//     sub1 q[0], q[1];
// `;

// console.log("");
// console.log("Importing QASM...");

// circuit.importQASM(input);

console.log("");
console.log(circuit.exportCirq());
// console.log(circuit.exportQASM())