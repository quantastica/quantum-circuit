var QuantumCircuit = require("../lib/quantum-circuit.js");

console.log("Qubits\tTime ms\tMemory MB");

for(var qubits = 2; qubits <= 25; qubits++) {

	var circ = new QuantumCircuit(qubits);

	for(var i = 0; i < circ.numQubits; i++) {
		circ.addGate("h", 0, i);
	}

	circ.run();

	var heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;

	console.log(qubits + "\t" + circ.stats.duration + "\t" + heapUsedMB.toFixed(2));
}
