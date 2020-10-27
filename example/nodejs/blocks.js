var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circuit = new QuantumCircuit();

var qasm = `
OPENQASM 2.0;
include "qelib1.inc";
qreg q[5];
h q[0];
cu1 (pi / 2) q[0], q[1];
cu1 (pi / 4) q[0], q[2];
cu1 (pi / 8) q[0], q[3];
cu1 (pi / 16) q[0], q[4];
h q[1];
cu1 (pi / 2) q[1], q[2];
cu1 (pi / 4) q[1], q[3];
cu1 (pi / 8) q[1], q[4];
h q[2];
cu1 (pi / 2) q[2], q[3];
cu1 (pi / 4) q[2], q[4];
h q[3];
cu1 (pi / 2) q[3], q[4];
h q[4];
swap q[0], q[4];
swap q[1], q[3];
measure q[0]->c[0];
measure q[1]->c[1];
measure q[2]->c[2];
measure q[3]->c[3];
`;

circuit.importQASM(qasm);

circuit.splitIntoBlocks(2);

console.log(circuit.exportQASM());
