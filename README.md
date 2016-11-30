Quantum Circuit Simulator
=========================

Quantum computer simulator implemented in javascript. Can run in browser or at server (nodejs).

Using in browser
----------------

Simply include [quantum-circuit.js](quantum-circuit.js) and <a href="http://mathjs.org/" target="_blank">mathjs</a> into your html page:

```html
<!doctype html>
<html>
    <head>
      <title>Quantum Circuit Simulator Example</title>
    </head>

    <body>
		<script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/mathjs/3.8.0/math.min.js"></script>
		<script type="text/javascript" src="quantum-circuit.js"></script>

		<script type="text/javascript">
		    // Your code here
		</script>
	</body>
</html>
```

See [example.html](example.html) for more info.

Using at server with nodejs
---------------------------

Install <a href="https://www.npmjs.com/package/quantum-circuit">quantum-circuit</a> npm module:

```bash
npm install quantum-circuit
```

Or, you can install it globally:

```bash
npm install -g quantum-circuit
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

Add single qubit gates
----------------------

Call `addGate` method passing gate name, column index and qubit (wire) index. For example, to add Hadamard as a first gate (column 0) at first qubit (wire 0) type:

```javascript
circuit.addGate("h", 0, 0);
```

Add multi-qubit gates
---------------------

Call `addGate` method passing gate name, column index and array of connected qubits (wires). For example, to add CNOT as a second gate (column 1) at second qubit (wire 1) controlled by first qubit (wire 0) do:

```javascript
circuit.addGate("cx", 1, [0, 1]);
```

Implemented gates
-----------------

**Single-qubit gates**

- `h`   Hadamard
- `x`   Pauli X (NOT)
- `y`   Pauli Y
- `z`   Pauli Z
- `srn` Square root of NOT
- `s`   Phase shift (the same as `r2`)
- `r2`  Rotate PI/2
- `r4`  Rotate PI/4
- `r8`  Rotate PI/8

**Two-qubit gates**

- `swap` Swap
- `srswap` Square root of Swap
- `ch`   Controlled Hadamard
- `cx`   Controlled Pauli X (CNOT)
- `cy`   Controlled Pauli Y
- `cz`   Controlled Pauli Z
- `csrn` Controlled Square root of NOT
- `cs`   Controlled Phase shift (the same as `cr2`)
- `cr2`  Controlled Rotate PI/2
- `cr4`  Controlled Rotate PI/4
- `cr8`  Controlled Rotate PI/8


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

View/print final state
----------------------

You can get state as string with method `stateAsString()`:

```javascript
var s = circuit.stateAsString();
```

Or, you can print state to javascript console:

```javascript
circuit.print();
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

API docs
========

*To be written...*

License
=======
[MIT](LICENSE)
