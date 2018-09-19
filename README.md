Quantum Circuit Simulator
=========================

Quantum circuit simulator implemented in javascript. Smoothly runs 20+ qubit simulations in browser or at server (node.js). No UI: you can use it in your program to run quantum simulations. Circuit can be imported from and exported to [OpenQASM](https://github.com/Qiskit/openqasm). You can export circuit to [pyQuil](http://docs.rigetti.com/en/latest/index.html) so it can be used for QASM to pyQuil conversion. Circuit drawing can be exported to [SVG](https://www.w3.org/Graphics/SVG/) vector image.


Using in browser
----------------

Simply include [quantum-circuit.min.js](dist/) into your html page (available via unpkg CDN [https://unpkg.com/quantum-circuit](https://unpkg.com/quantum-circuit))

```html
<!doctype html>
<html>
    <head>
        <title>Quantum Circuit Simulator Example</title>
    </head>

    <body>
        <script type="text/javascript" src="https://unpkg.com/quantum-circuit"></script>

        <script type="text/javascript">
            // Your code here
        </script>
    </body>
</html>
```

See [live example](https://quantum-circuit.com/example.html)


Using at server with node.js
----------------------------

Install [quantum-circuit](https://www.npmjs.com/package/quantum-circuit) npm module:

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

| Name | pyQuil | Qubits | Params | Description |
| --- | --- | --- | --- | --- |
| **id** | I | 1 |  |  |
| **x** | X | 1 |  |  |
| **y** | Y | 1 |  |  |
| **z** | Z | 1 |  |  |
| **h** | H | 1 |  |  |
| **srn** |  | 1 |  |  |
| **r2** |  | 1 |  |  |
| **r4** |  | 1 |  |  |
| **r8** |  | 1 |  |  |
| **rx** | RX | 1 | theta |  |
| **ry** | RY | 1 | theta |  |
| **rz** | RZ | 1 | phi |  |
| **u1** | PHASE | 1 | lambda |  |
| **u2** |  | 1 | phi, lambda |  |
| **u3** |  | 1 | theta, phi, lambda |  |
| **s** | S | 1 |  |  |
| **t** | T | 1 |  |  |
| **sdg** |  | 1 |  |  |
| **tdg** |  | 1 |  |  |
| **swap** | SWAP | 2 |  |  |
| **srswap** |  | 2 |  |  |
| **cx** | CNOT | 2 |  |  |
| **cy** |  | 2 |  |  |
| **cz** | CZ | 2 |  |  |
| **ch** |  | 2 |  |  |
| **csrn** |  | 2 |  |  |
| **cr2** |  | 2 |  |  |
| **cr4** |  | 2 |  |  |
| **cr8** |  | 2 |  |  |
| **crx** |  | 2 |  |  |
| **cry** |  | 2 |  |  |
| **crz** | CPHASE | 2 | phi |  |
| **cu1** | CPHASE | 2 | lambda |  |
| **cu2** |  | 2 | phi, lambda |  |
| **cu3** |  | 2 | theta, phi, lambda |  |
| **cs** |  | 2 |  |  |
| **ct** |  | 2 |  |  |
| **csdg** |  | 2 |  |  |
| **ctdg** |  | 2 |  |  |
| **ccx** | CCNOT | 3 |  |  |
| **cswap** |  | 3 |  |  |
| **csrswap** |  | 3 |  |  |
| **measure** | MEASURE | 1 |  |  |


*For more details see [reference](#gates)*


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


Measurement
-----------

Method `measure(wire)` returns chance of being 1 for given qubit:

Example:
```javascript
console.log(circuit.measure(0));
```

*Note: method `measure` will return real number betwen 0 and 1.*


You can store measurement into classical register. For example, to measure first qubit (wire 0) and store result into classical register named `c` as fourth bit (bit 3):

```javascript
circuit.measure(0, "c", 3);
```

Also, you can add `measure` gate to circuit and then measurement will be done automatically and result will be stored into classical register:

```javascript
circuit.addGate("measure", -1, 0, { creg: { name: "c", bit: 3 } });
```

Short form of writing this is `addMeasure(wire, creg, cbit)`:

```javascript
circuit.addMeasure(0, "c", 3);
```

*Note:*

- *If specified classical register doesn't exists - it will be created automatically.*

- *Equal probability (0.5) will be stored as random 0 or 1*


Classical registers
-------------------

**Create register**

Classical registers are created automatically if you add measurement gate to the circuit but you can also manually create registers by calling `createCreg(name, len)`.

Example: create classical 5-bit register named `ans`:
```javascript
circuit.createCreg("ans", 5);
```

**Read register**

To get register value as integer, call `getCregValue(name)`.

Example:
```javascript
var value = circuit.getCregValue("ans");
```

**Read single bit**

Example: get bit 3 from register named `ans`:

```
console.log(circuit.getCregBit("ans", 3));
```
*Returns integer: 0 or 1*


**Set single bit**

Example: set bit 3 to `1` in register named `ans`:

```
circuit.setCregBit("ans", 3, 1);
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

To export circuit to OpenQASM use `exportQASM(comment, decompose)` method:

Example:
```javascript
var qasm = circuit.exportQASM("Comment to insert at the beginning.\nCan be multi-line comment as this one.", false);
```

- `comment` - comment to insert at the beginning of the file

- `decompose` - if set to `true` and circuit contains custom gates then it will be decomposed to basic gates and then exported. If set to `false` then custom gates will be exported as user defined gates.


Import from QASM
----------------

Circuit can be imported from [OpenQASM](https://github.com/Qiskit/openqasm) with following limitations:

- `import` directive is ignored (but most of gates defined in `qelib1.inc` are supported) **TODO**

- `if` statement is ignored. **TODO**

- `barrier` is ignored. **TODO**

- `reset` is ignored. **TODO**


To import circuit from OpenQASM use `importQASM(input)` method:

Example:
```javascript
circuit.importQASM("OPENQASM 2.0;\nimport \"qelib1.inc\";\nqreg q[2];\nh q[0];\ncx q[0],q[1];\n");
```

- `input` is string containing QASM source code.


Export to pyQuil
----------------

Circuit can be exported to [pyQuil](http://docs.rigetti.com/en/latest/index.html)

To export circuit to pyQuil use `exportQASM(comment, decompose)` method:

Example:
```javascript
var pyquil = circuit.exportPyquil("Comment to insert at the beginning.\nCan be multi-line comment as this one.", false);
```

- `comment` - comment to insert at the beginning of the file

- `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will defined as subroutines.


Export to SVG
-------------

Vector `.svg` image of circuit can be created with `exportSVG(embedded)` function with following limitations:

- Integer registers are not drawn. **TODO**

- Gate symbols are non-standard. **TODO** *(BTW, do we have standard?)*

- Not yet tested well. **TODO**


**Example 1**

Show circuit in browser:

```javascript

// Assuming we have <div id="drawing"></div> somewhere in HTML
var container = document.getElementById("drawing");

// SVG is returned as string
var svg = circuit.exportSVG(true);

// add SVG into container
container.innerHTML = svg;

```

**Example 2**

Generate standalone SVG image at server with node.js:

```javascript

// export as standalone SVG
var svg = circuit.exportSVG(false);

// do something with svg string (e.g. save to file)
...

// Or, export as embedded SVG for use in browser
svg = circuit.exportSVG(true);

// do something with svg string (e.g. serve via HTTP)
...

``` 


Export to Quirk
---------------

Circuit can be exported to popular open-source drag-and-drop quantum circuit simulator [Quirk](https://algassert.com/quirk) with following limitations:

- Quirk doesn't support more than 16 qubits.

- Quirk can possibly incorrectly interpret circuit if we have multiple controlled gates in the same column.

- Quirk doesn't support non-sequentially positioned multi-qubit user-defined gates (for example gate on wires [3, 0, 1]) so it's best to export decomposed circuit.


Example:

```javascript

var quirkData = circuit.exportQuirk(true);

var quirkURL = "http://algassert.com/quirk#circuit=" + JSON.stringify(quirkData);

// Now do something with quirkURL. Assuming this code runs in browser and we have <a id="quirk"></a> somewhere, you can:
var quirkLink = document.getElementById("quirk");
quirkLink.setAttr("href", quirkLink);

```


About algorithm
===============

Memory usage: up to `2 * (2^numQubits) * sizeOfComplexNumber`


- Naive implementation stores entire state vector in an array of size `2^numQubits`. We are storing state in a "map", and only amplitudes with non-zero probabilities are stored. So, in worst case, size of state map is `2^n`, but it's less most of the time because we don't store zeroes.

- Naive implementation creates transformation matrix and multiplies it with state vector. We are not creating and not storing entire transformation matrix in memory. Instead, elements of transformation matrix are calculated one by one and state is multiplied and stored in new state map on the fly. This way, memory usage is minimal (in worst case we have two `2^n` state vectors at a time).

- Algorithm is parallelizable so it could use GPU, but GPU support is not implemented yet (work in progress).


Benchmark
---------

*Performance is measured on MacBook Pro MJLT2 mid-2015 (Core i7 2.5 GHz, 16GB RAM)*

![Benchmark 1](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark1.png)

![Benchmark 2](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark2.png)

![Benchmark 3](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark3.png)

*You can find scripts in [/benchmark](benchmark/) directory.*


Gates
=====

## id

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,1]
]
```

*Example:*
```javascript
circuit.addGate("id", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## x

*Qubits:* 1

*Matrix:*
```javascript
[
    [0,1]
    [1,0]
]
```

*Example:*
```javascript
circuit.addGate("x", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## y

*Qubits:* 1

*Matrix:*
```javascript
[
    [0,"multiply(-1, i)"]
    ["i",0]
]
```

*Example:*
```javascript
circuit.addGate("y", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## z

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,-1]
]
```

*Example:*
```javascript
circuit.addGate("z", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## h

*Qubits:* 1

*Matrix:*
```javascript
[
    ["1 / sqrt(2)","1 / sqrt(2)"]
    ["1 / sqrt(2)","0 - (1 / sqrt(2))"]
]
```

*Example:*
```javascript
circuit.addGate("h", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## srn

*Qubits:* 1

*Matrix:*
```javascript
[
    ["1 / sqrt(2)","-1 / sqrt(2)"]
    ["-1 / sqrt(2)","1 / sqrt(2)"]
]
```

*Example:*
```javascript
circuit.addGate("srn", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## r2

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, PI / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("r2", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## r4

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, PI / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("r4", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## r8

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, PI / 8))"]
]
```

*Example:*
```javascript
circuit.addGate("r8", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## rx

*Qubits:* 1

*Parameters:*

- *theta*


*Matrix:*
```javascript
[
    ["cos(theta / 2)","multiply(-i, sin(theta / 2))"]
    ["multiply(-i, sin(theta / 2))","cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("rx", 0, 0, {
    params: {
        theta: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## ry

*Qubits:* 1

*Parameters:*

- *theta*


*Matrix:*
```javascript
[
    ["cos(theta / 2)","multiply(-1, sin(theta / 2))"]
    ["sin(theta / 2)","cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("ry", 0, 0, {
    params: {
        theta: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## rz

*Qubits:* 1

*Parameters:*

- *phi*


*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, phi))"]
]
```

*Example:*
```javascript
circuit.addGate("rz", 0, 0, {
    params: {
        phi: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## u1

*Qubits:* 1

*Parameters:*

- *lambda*


*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, lambda))"]
]
```

*Example:*
```javascript
circuit.addGate("u1", 0, 0, {
    params: {
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## u2

*Qubits:* 1

*Parameters:*

- *phi*
- *lambda*


*Matrix:*
```javascript
[
    ["1 / sqrt(2)","pow(-e, multiply(i, lambda)) / sqrt(2)"]
    ["pow(e, multiply(i, phi)) / sqrt(2)","pow(e, multiply(i, lambda) + multiply(i, phi)) / sqrt(2)"]
]
```

*Example:*
```javascript
circuit.addGate("u2", 0, 0, {
    params: {
        phi: "pi/2",
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## u3

*Qubits:* 1

*Parameters:*

- *theta*
- *phi*
- *lambda*


*Matrix:*
```javascript
[
    ["cos(theta / 2)","pow(-e, multiply(i, lambda)) * sin(theta / 2)"]
    ["pow(e, multiply(i, phi)) * sin(theta / 2)","pow(e, multiply(i, lambda) + multiply(i, phi)) * cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("u3", 0, 0, {
    params: {
        theta: "pi/2",
        phi: "pi/2",
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## s

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, PI / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("s", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## t

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, PI / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("t", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## sdg

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, (-1 * PI) / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("sdg", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## tdg

*Qubits:* 1

*Matrix:*
```javascript
[
    [1,0]
    [0,"pow(e, multiply(i, (-1 * PI) / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("tdg", 0, 0);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## swap

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,0,1,0]
    [0,1,0,0]
    [0,0,0,1]
]
```

*Example:*
```javascript
circuit.addGate("swap", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## srswap

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,"multiply(0.5, add(1, i))","multiply(0.5, subtract(1, i))",0]
    [0,"multiply(0.5, subtract(1, i))","multiply(0.5, add(1, i))",0]
    [0,0,0,1]
]
```

*Example:*
```javascript
circuit.addGate("srswap", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cx

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,0,1]
    [0,0,1,0]
]
```

*Example:*
```javascript
circuit.addGate("cx", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cy

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,0,"multiply(-1, i)"]
    [0,0,"i",0]
]
```

*Example:*
```javascript
circuit.addGate("cy", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cz

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,-1]
]
```

*Example:*
```javascript
circuit.addGate("cz", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## ch

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"1 / sqrt(2)","1 / sqrt(2)"]
    [0,0,"1 / sqrt(2)","0 - (1 / sqrt(2))"]
]
```

*Example:*
```javascript
circuit.addGate("ch", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## csrn

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"1 / sqrt(2)","-1 / sqrt(2)"]
    [0,0,"-1 / sqrt(2)","1 / sqrt(2)"]
]
```

*Example:*
```javascript
circuit.addGate("csrn", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cr2

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, PI / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("cr2", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cr4

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, PI / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("cr4", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cr8

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, PI / 8))"]
]
```

*Example:*
```javascript
circuit.addGate("cr8", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## crx

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"cos(theta / 2)","multiply(-i, sin(theta / 2))"]
    [0,0,"multiply(-i, sin(theta / 2))","cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("crx", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cry

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"cos(theta / 2)","multiply(-1, sin(theta / 2))"]
    [0,0,"sin(theta / 2)","cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("cry", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## crz

*Qubits:* 2

*Parameters:*

- *phi*


*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, phi))"]
]
```

*Example:*
```javascript
circuit.addGate("crz", 0, [0, 1], {
    params: {
        phi: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cu1

*Qubits:* 2

*Parameters:*

- *lambda*


*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, lambda))"]
]
```

*Example:*
```javascript
circuit.addGate("cu1", 0, [0, 1], {
    params: {
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cu2

*Qubits:* 2

*Parameters:*

- *phi*
- *lambda*


*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"1 / sqrt(2)","pow(-e, multiply(i, lambda)) / sqrt(2)"]
    [0,0,"pow(e, multiply(i, phi)) / sqrt(2)","pow(e, multiply(i, lambda) + multiply(i, phi)) / sqrt(2)"]
]
```

*Example:*
```javascript
circuit.addGate("cu2", 0, [0, 1], {
    params: {
        phi: "pi/2",
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cu3

*Qubits:* 2

*Parameters:*

- *theta*
- *phi*
- *lambda*


*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,"cos(theta / 2)","pow(-e, multiply(i, lambda)) * sin(theta / 2)"]
    [0,0,"pow(e, multiply(i, phi)) * sin(theta / 2)","pow(e, multiply(i, lambda) + multiply(phi, lambda)) * cos(theta / 2)"]
]
```

*Example:*
```javascript
circuit.addGate("cu3", 0, [0, 1], {
    params: {
        theta: "pi/2",
        phi: "pi/2",
        lambda: "pi/2"
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cs

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, PI / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("cs", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## ct

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, PI / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("ct", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## csdg

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, (-1 * PI) / 2))"]
]
```

*Example:*
```javascript
circuit.addGate("csdg", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## ctdg

*Qubits:* 2

*Matrix:*
```javascript
[
    [1,0,0,0]
    [0,1,0,0]
    [0,0,1,0]
    [0,0,0,"pow(e, multiply(i, (-1 * PI) / 4))"]
]
```

*Example:*
```javascript
circuit.addGate("ctdg", 0, [0, 1]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## ccx

*Qubits:* 3

*Matrix:*
```javascript
[
    [1,0,0,0,0,0,0,0]
    [0,1,0,0,0,0,0,0]
    [0,0,1,0,0,0,0,0]
    [0,0,0,1,0,0,0,0]
    [0,0,0,0,1,0,0,0]
    [0,0,0,0,0,1,0,0]
    [0,0,0,0,0,0,0,1]
    [0,0,0,0,0,0,1,0]
]
```

*Example:*
```javascript
circuit.addGate("ccx", 0, [0, 1, 2]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## cswap

*Qubits:* 3

*Matrix:*
```javascript
[
    [1,0,0,0,0,0,0,0]
    [0,1,0,0,0,0,0,0]
    [0,0,1,0,0,0,0,0]
    [0,0,0,1,0,0,0,0]
    [0,0,0,0,1,0,0,0]
    [0,0,0,0,0,0,1,0]
    [0,0,0,0,0,1,0,0]
    [0,0,0,0,0,0,0,1]
]
```

*Example:*
```javascript
circuit.addGate("cswap", 0, [0, 1, 2]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## csrswap

*Qubits:* 3

*Matrix:*
```javascript
[
    [1,0,0,0,0,0,0,0]
    [0,1,0,0,0,0,0,0]
    [0,0,1,0,0,0,0,0]
    [0,0,0,1,0,0,0,0]
    [0,0,0,0,1,0,0,0]
    [0,0,0,0,0,"multiply(0.5, add(1, i))","multiply(0.5, subtract(1, i))",0]
    [0,0,0,0,0,"multiply(0.5, subtract(1, i))","multiply(0.5, add(1, i))",0]
    [0,0,0,0,0,0,0,1]
]
```

*Example:*
```javascript
circuit.addGate("csrswap", 0, [0, 1, 2]);
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```

## measure

*Qubits:* 1

*Example:*
```javascript
circuit.addGate("measure", 0, 0, {
    creg: {
        name: "c",
        bit: 3
    }
});
```

*Or:*
```javascript
circuit.addMeasure(0, "c", 3);
```




API docs
========

*To be written...*


License
=======
[MIT](LICENSE.txt)
