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
circuit.addGate("rx", -1, 0, {
    params: {
        theta: "pi/2"
    }
});
circuit.addGate("ry", -1, 0, {
    params: {
        theta: "pi/2"
    }
});
circuit.addGate("rz", -1, 0, {
    params: {
        phi: "pi/2"
    }
});
circuit.addGate("u1", -1, 0, {
    params: {
        lambda: "pi/2"
    }
});
circuit.addGate("u2", -1, 0, {
    params: {
        phi: "pi/2",
        lambda: "pi/2"
    }
});
circuit.addGate("u3", -1, 0, {
    params: {
        theta: "pi/2",
        phi: "pi/2",
        lambda: "pi/2"
    }
});
circuit.addGate("s", -1, 0);
circuit.addGate("t", -1, 0);
circuit.addGate("sdg", -1, 0);
circuit.addGate("tdg", -1, 0);
circuit.addGate("swap", -1, [0, 1]);
circuit.addGate("srswap", -1, [0, 1]);
circuit.addGate("cx", -1, [0, 1]);
circuit.addGate("cz", -1, [0, 1]);
circuit.addGate("ms", -1, [0, 1], {
    params: {
        theta: "pi/2"
    }
});
circuit.addGate("cr2", -1, [0, 1]);
circuit.addGate("cr4", -1, [0, 1]);
circuit.addGate("cr8", -1, [0, 1]);
circuit.addGate("crz", -1, [0, 1], {
    params: {
        phi: "pi/2"
    }
});
circuit.addGate("cu1", -1, [0, 1], {
    params: {
        lambda: "pi/2"
    }
});
circuit.addGate("cu2", -1, [0, 1], {
    params: {
        phi: "pi/2",
        lambda: "pi/2"
    }
});
circuit.addGate("cu3", -1, [0, 1], {
    params: {
        theta: "pi/2",
        phi: "pi/2",
        lambda: "pi/2"
    }
});
circuit.addGate("cs", -1, [0, 1]);
circuit.addGate("ct", -1, [0, 1]);
circuit.addGate("csdg", -1, [0, 1]);
circuit.addGate("ctdg", -1, [0, 1]);
circuit.addGate("ccx", -1, [0, 1, 2]);
circuit.addGate("cswap", -1, [0, 1, 2]);
circuit.addMeasure(0, "c", 3);

circuit.run();

console.log("");
console.log(circuit.exportCirq());