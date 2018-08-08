var QuantumCircuit = require("../../lib/quantum-circuit.js");

console.log("Qubits\tTime ms");

for(var qubits = 2; qubits <= 30; qubits++) {
	var circ = new QuantumCircuit();

	circ.addGate("h", 0, 0);
	circ.addGate("cx", 1, [0, qubits - 1]);

	circ.run();

	console.log(qubits + "\t" + circ.stats.duration);
}
