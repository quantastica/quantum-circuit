Quantum Circuit Simulator
=========================

Quantum circuit simulator implemented in javascript. Can run in browser or at server (node.js). No UI - you can use it in your program to run quantum simulations. Circuit can be imported from and exported to [OpenQASM](https://github.com/Qiskit/openqasm).


Using in browser
----------------

Simply include [quantum-circuit.min.js](dist/quantum-circuit.min.js) into your html page:

```html
<!doctype html>
<html>
    <head>
        <title>Quantum Circuit Simulator Example</title>
    </head>

    <body>
        <script type="text/javascript" src="quantum-circuit.min.js"></script>

        <script type="text/javascript">
            // Your code here
        </script>
    </body>
</html>
```

See [example.html](./example/browser/example.html) for more info.

Using at server with node.js
----------------------------

Install <a href="https://www.npmjs.com/package/quantum-circuit">quantum-circuit</a> npm module:

```bash
npm install --save quantum-circuit
```

And then import it into your program:

```javascript
var QuantumCircuit = require("quantum-circuit");

// Your code here

```

Getting started
===============

Create circuit
--------------

Create instance of `QuantumCircuit` class passing number of qubits (wires) to constructor:

```javascript
var circuit = new QuantumCircuit(3);
```
*Note: number of qubits is optional argument - circuit will expand automatically if you add gates to non-existing wires*

Add single-qubit gates
----------------------

Call `addGate` method passing gate name, column index and qubit (wire) index:

```javascript
circuit.addGate(gateName, column, wire);
```

For example, to add Hadamard gate as a first gate (column 0) at second qubit (wire 1) type:

```javascript
circuit.addGate("h", 0, 1);
```

Result is:

```
                  
         Column 0 
                  
Wire 0 ----...----
                  
          |---|   
Wire 1 ---| H |---
          |---|   
                  
```

*Note: if `column` is negative integer then gate will be added to the end of the wire*


Add multi-qubit gates
---------------------

Call `addGate` method passing gate name, column index and array of connected qubits (wires):

```javascript
circuit.addGate(gateName, column, arrayOfWires);
```

For example, to add CNOT as a second gate (column 1) controlled by second qubit (wire 1) at third qubit as target (wire 2) do:

```javascript
circuit.addGate("cx", 1, [1, 2]);
```

```
                                
         Column 0    Column 1   
                               
Wire 0 ----...---------...-----
                               
                               
Wire 1 ----...----------o------
                        |      
                     |-----|   
Wire 2 ----...-------| CX  |---
                     |-----|   
                               
```

*Note: if `column` is negative integer then gate will be added to the end*


Implemented gates
-----------------

**Single-qubit gates**

- `h`   Hadamard gate
- `x`   Pauli X (PI rotation over X-axis) aka "NOT" gate
- `y`   Pauli Y (PI rotation over Y-axis)
- `z`   Pauli Z (PI rotation over Z-axis)
- `r2`  PI/2 rotation over Z-axis aka "Phase PI/2"
- `r4`  PI/4 rotation over Z-axis aka "Phase PI/4"
- `r8`  PI/8 rotation over Z-axis aka "Phase PI/8"
- `s`   PI/2 rotation over Z-axis (synonym for `r2`)
- `t`   PI/4 rotation over Z-axis (synonym for `r4`)
- `sdg` (-PI/2) rotation over Z-axis
- `tdg` (-PI/4) rotation over Z-axis
- `srn` Square root of NOT

**Two-qubit gates**

- `swap` Swap
- `srswap` Square root of Swap
- `ch`   Controlled Hadamard gate
- `cx`   Controlled Pauli X (PI rotation over X-axis) aka "CNOT" gate
- `cy`   Controlled Pauli Y (PI rotation over Y-axis)
- `cz`   Controlled Pauli Z (PI rotation over Z-axis)
- `cr2`  Controlled PI/2 rotation over Z-axis aka "Phase PI/2"
- `cr4`  Controlled PI/4 rotation over Z-axis aka "Phase PI/4"
- `cr8`  Controlled PI/8 rotation over Z-axis aka "Phase PI/8"
- `cs`   Controlled PI/2 rotation over Z-axis (synonym for `cr2`)
- `ct`   Controlled PI/4 rotation over Z-axis (synonym for `cr4`)
- `csdg` Controlled (-PI/2) rotation over Z-axis
- `ctdg` Controlled (-PI/4) rotation over Z-axis
- `csrn` Controlled Square root of NOT

**Three-qubit gates**

- `ccx` Toffoli aka "CCNOT" gate
- `cswap` Controlled Swap aka Fredkin gate
- `csrswap` Controlled Square root of Swap



Run circuit
-----------

Simply call `run` method.

```javascript
circuit.run();
```

Initial state
-------------

By default, initial state of each qubit is `|0>`. You can pass initial values as array of bool (`true` or `false`) or integers (`0` or `1`). This will set first two qubits to `|1>` and evaluate circuit:

```javascript
circuit.run([1, 1]);
```

View/print final amplitudes
---------------------------

You can get state as string with method `stateAsString(onlyPossible)`:

```javascript
var s = circuit.stateAsString(false);
```

If you want only possible values (only values with probability > 0) then pass `true`:
```javascript
var s = circuit.stateAsString(true);
```


Or, you can print state to javascript console with method `print(onlyPossible)`:

```javascript
circuit.print(false);
```

If you want to print only possible values (only values with probability > 0) then pass `true`:
```javascript
var s = circuit.print(true);
```


Export/Import circuit
---------------------

You can export circuit by calling `save` method:

```javascript
var obj = circuit.save();

// now do something with obj, save to file or whatever...

```

And load previously saved circuit by calling `load` method:

```javascript
var obj = // ...load object from file or from another circuit or whatever

circuit.load(obj);

```

Use circuit as a gate in another circuit
----------------------------------------

You can "compile" any circuit and use it as a gate in another circuit like this:

```javascript
// export circuit to variable
var obj = someCircuit.save();

// register it as a gate in another circuit
anotherCircuit.registerGate("my_gate", obj);

// use it as a gate in another circuit
// assuming original circuit has three qubits then gate must spread to 3 qubits, in this example: 2, 3, 4)
anotherCircuit.addGate("my_gate", 0, [2, 3, 4]);

```

Decompose circuit
-----------------

If your circuit contains custom gates (created from another circuit), you can decompose it into equivalent circuit containing only basic gates.

If you pass `true` as argument to function `save`, you'll get decomposed circuit.

Example:
```javascript
var obj = circuit.save(true);
// now obj contains decomposed circuit. You can load it:
circuit.load(obj);
```

Export to QASM
--------------

Circuit can be exported to [OpenQASM](https://github.com/Qiskit/openqasm) with following limitation:

- at the moment, gates not directly supported by QASM and qelib1.inc are exported as-is - their definition is not generated. **TODO**

To export circuit to OpenQASM use `exportQASM(comment, decompose, exportAsGateName)` method:

Example:
```javascript
var qasm = circuit.exportQASM("Comment to insert at the beginning.\nCan be multi-line comment as this one.", false);
```

- `comment` - comment to insert at the beginning of the file

- `decompose` - if set to `true` and circuit contains custom gates then it will be decomposed to basic gates and then exported. If set to `false` then custom gates will be exported as user defined gates.

- `exportAsGateName` - internally used by export method. Default is `false`. if `true` then circuit is exported as user defined gate.


Import from QASM
----------------

Circuit can be imported from [OpenQASM](https://github.com/Qiskit/openqasm) with few limitations:

- `import` directive is ignored (but most of gates defined in `qelib1.inc` are supported)

- Operations on entire registers cannot be imported at the moment (e.g. `x q;` will not be imported but `x q[1];` will). **TODO**

- Integer registers and measure gates are ignored. **TODO**


To import circuit from OpenQASM use `importQASM(input)` method:

```javascript
circuit.importQASM("OPENQASM 2.0;\nimport \"qelib1.inc\";\nqreg q[2];\nh q[0];\ncx q[0],q[1];\n");
```

- `input` is string containing QASM source code.


API docs
========

*To be written...*

License
=======
[MIT](LICENSE.txt)
