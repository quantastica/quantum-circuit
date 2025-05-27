var QuantumCircuit = require("../../lib/quantum-circuit.js");

var circ = new QuantumCircuit();

circ.addGate("h", -1, 0);
circ.addMeasure(0, "c", 0);
circ.addGate("x", -1, 1, { 
    condition: { 
        creg: "c",
        value: 1
    }
});

circ.run();

console.log("");
console.log(circ.exportQASM());

console.log("");
console.log(circ.exportPyquil());

//console.log("");
//console.log(JSON.stringify(circ.exportRaw(), null, '\t'));

console.log("");
console.log("Final amplitudes:");
circ.print(true);

console.log("");
console.log("Angles:");
console.log(circ.angles());

console.log("");
console.log("Probabilities:");
console.log(circ.probabilities());

console.log("");
console.log("Measured (single-shot)");
console.log(circ.measureAll());

console.log("");
console.log("Counts (1000 shots)");
console.log(circ.measureAllMultishot(1000));

