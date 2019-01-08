//
// Quantum Fourier Transform
//

var QuantumCircuit = require("../lib/quantum-circuit.js");

console.log("Qubits\tTime ms\tMemory MB");

for(var qubits = 2; qubits <= 25; qubits++) {

	var circ = new QuantumCircuit(qubits);

	for(var i = 0; i < qubits; i++) {
		circ.addGate("h", -1, i);
		var rcount = 0;
		for(var x = i + 1; x < qubits; x++) {
			rcount++;
			circ.addGate("cu1", -1, [x, i], { 
				params: { 
					lambda: "pi/" + (1 << rcount) 
				}
			});
		}
	}

	for(var i = 0; i < Math.floor(qubits / 2); i++) {
		circ.addGate("swap", -1, [i, (qubits - i) - 1]);
	}

	circ.run();

	var heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;

	console.log(qubits + "\t" + circ.stats.duration + "\t" + heapUsedMB.toFixed(2));
}

/*
console.log("Qubits\tTime ms\tMemory MB");

for(var qubits = 2; qubits <= 25; qubits++) {

	var circ = new QuantumCircuit(qubits);

	var lastQubit = qubits - 1;
	for(var i = lastQubit; i >= 0; i--) {
		circ.addGate("h", -1, i);

		if(i > 0) {
			w = i - 1;
			for(var x = lastQubit; x > w; x--) {
				circ.addGate("cu1", -1, [w, x], {
					params: { 
						lambda: "pi/" + (1 << (x - w))
					}
				});			
			}			
		}
	}

	for(var i = 0; i < Math.floor(qubits / 2); i++) {
		circ.addGate("swap", -1, [i, (qubits - i) - 1]);
	}

	circ.run(null, { partitioning: false });

	var heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;

	console.log(qubits + "\t" + circ.stats.duration + "\t" + heapUsedMB.toFixed(2));
}
*/
