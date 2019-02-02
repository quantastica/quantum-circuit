var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circuit = new QuantumCircuit();

circuit.addGate("id", -1, 0);
circuit.addGate("x", -1, 0);
circuit.addGate("y", -1, 0);
circuit.addGate("z", -1, 0);
circuit.addGate("h", -1, 0);
circuit.addGate("srn", -1, 0);
circuit.addGate("r2", -1, 0);
circuit.addGate("r4", -1, 0);
circuit.addGate("r8", -1, 0);
circuit.addGate("rx", -1, 0, {params: {theta: "pi/2"}});
circuit.addGate("ry", -1, 0, {params: {theta: "pi/2"}});
circuit.addGate("rz", -1, 0, {params: {phi: "pi/2"}});
circuit.addGate("u1", -1, 0, {params: {lambda: "pi/2"}});
circuit.addGate("u2", -1, 0, {params: {phi: "pi/2", lambda: "pi/4"}});
circuit.addGate("u3", -1, 0, {params: {theta: "pi/2", phi: "pi/4", lambda: "pi/8"}});
circuit.addGate("s", -1, 0);
circuit.addGate("t", -1, 0);
circuit.addGate("sdg", -1, 0);
circuit.addGate("tdg", -1, 0);
circuit.addGate("swap", -1, [0, 1]);
circuit.addGate("srswap", -1, [0, 1]);
circuit.addGate("cx", -1, [0, 1]);
circuit.addGate("measure", -1, 0, {creg: {name: "c", bit: 0}});
circuit.addMeasure(0, "c", 1);

circuit.run();

//console.log("");
//console.log(circuit.exportPyquil());

//console.log("");
//console.log(circuit.exportQiskit());

console.log("");
console.log(circuit.exportCirq());
