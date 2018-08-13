var QuantumCircuit = require("../../lib/quantum-circuit.js");

console.log("Qubits\tTime ms");

for(var qubits = 2; qubits <= 30; qubits++) {
	var circ = new QuantumCircuit(qubits);

	for(var i = 0; i < circ.numQubits; i++) {
		circ.addGate("h", 0, i);
	}

	circ.run();

	console.log(qubits + "\t" + circ.stats.duration);
}
