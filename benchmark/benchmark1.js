var QuantumCircuit = require("../lib/quantum-circuit.js");

console.log("Qubits\tTime ms\tMemory MB");

for(var qubits = 2; qubits <= 25; qubits++) {

	var circ = new QuantumCircuit();

	circ.addGate("h", 0, 0);
	circ.addGate("cx", 1, [0, qubits - 1]);

	circ.run();

	var heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;

	console.log(qubits + "\t" + circ.stats.duration + "\t" + heapUsedMB.toFixed(2));
}
