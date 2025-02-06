{TITLE}

[quantum-circuit](https://www.npmjs.com/package/quantum-circuit) is open source quantum circuit simulator implemented in javascript. Smoothly runs 20+ qubit simulations in browser or at server (node.js). You can use it in your javascript program to run quantum simulations. 

Circuit can be imported from [OpenQASM](https://github.com/Qiskit/openqasm), [Quil](https://arxiv.org/abs/1608.03355) and [IONQ](https://docs.ionq.com/). You can export circuits to [OpenQASM](https://github.com/Qiskit/openqasm), [pyQuil](http://docs.rigetti.com/en/latest/index.html), [Quil](https://arxiv.org/abs/1608.03355), [Qiskit](https://qiskit.org/documentation/), [Cirq](https://github.com/quantumlib/Cirq), [TensorFlow Quantum](https://www.tensorflow.org/quantum), [QSharp](https://docs.microsoft.com/en-us/quantum/language/index?view=qsharp-preview), and [CudaQ](https://nvidia.github.io/cuda-quantum/latest/index.html), so it can be used for conversion between quantum programming languages. Circuit drawing can be exported to [SVG](https://www.w3.org/Graphics/SVG/) vector image.


## Live examples

### Quantum Programming Studio

[Quantum Programming Studio](https://quantum-circuit.com) is web based quantum programming IDE and simulator built on top of this package. Circuit can be executed on real quantum computer directly from the UI.

### Other live examples

- [qconvert](https://quantum-circuit.com/qconvert) Online quantum programming language converter

- [example.html](https://quantum-circuit.com/example.html)


## Using in browser

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


## Using at server with node.js

Add [quantum-circuit](https://www.npmjs.com/package/quantum-circuit) npm module to your node.js project:

```bash
npm install --save quantum-circuit
```

And then import it into your program:

```javascript
var QuantumCircuit = require("quantum-circuit");

// Your code here

```

### Node.js examples

See [/example/nodejs](example/nodejs/) directory.


Using with Jupyter notebook
---------------------------

You need to install [ijavascript](https://github.com/n-riesco/ijavascript) kernel for [Jupyter notebook](http://jupyter.org/)

You can install quantum-circuit npm module globally and invoke jupyter notebook from any directory:

```
npm install -g quantum-circuit
```

Or inside new directory do:

```
npm init
npm install --save quantum-circuit
jupyter notebook
```

### Jupyter notebook examples

See [/example/jupyter](example/jupyter/) directory.


# Getting started

## Create circuit

Create instance of `QuantumCircuit` class, optionally passing number of qubits (wires) to constructor:

```javascript
var circuit = new QuantumCircuit(3);
```
*Note: number of qubits is optional argument - circuit will expand automatically if you add gates to non-existing wires*


## Add single-qubit gates

Call `appendGate` method passing gate name and qubit (wire) index:

```javascript
circuit.appendGate(gateName, wire, options);
```

For example, to add Hadamard gate to a first qubit (wire 0) type:

```javascript
circuit.appendGate("h", 0);
```

For parametrized gates, provide `options` object with `params`:

```javascript
circuit.appendGate("ry", 0, { "params": { "theta":"pi/2" } });
```

**For more control on gate placement use `addGate` and specify a column as well:**

Call `addGate` method passing gate name, column index and qubit (wire) index:

```javascript
circuit.addGate(gateName, column, wire);
```

For example, to add Hadamard to a second column (column 1) at first qubit (wire 0) type:

```javascript
circuit.addGate("h", 1, 0);
```

Result is:

```
                                
         Column 0    Column 1   
                               
                     |-----|   
Wire 0 --------------|  H  |---
                     |-----|   
                               
                               
```

*Note: if `column` is negative integer then gate will be added to the end of the wire*


## Add multi-qubit gates

Call `appendGate` method passing gate name and array of qubit indexes (wires):

```javascript
circuit.appendGate(gateName, arrayOfWires);
```

Example:
```javascript
circuit.appendGate("cx", [0, 1]);
```

For parametrized gates, provide `options` object with `params`:

```javascript
circuit.appendGate("cry", [0, 1], { "params": { "theta":"pi/2" } });
```

**For more control on gate placement use `addGate` and specify a column as well:**


Call `addGate` method passing gate name, column index and array of connected qubits (wires):

```javascript
circuit.addGate(gateName, column, arrayOfWires);
```

For example, to add CNOT to a second column (column 1) controlled by second qubit (wire 1) at third qubit as target (wire 2) do:

```javascript
circuit.addGate("cx", 1, [1, 2]);
```

```
                                
         Column 0    Column 1   
                               
Wire 0 ------------------------
                               
                               
Wire 1 -----------------o------
                        |      
                     |-----|   
Wire 2 --------------| CX  |---
                     |-----|   
                               
```

*Note: if `column` is negative integer then gate will be added to the end*


## Example - Quantum random number generator

```javascript

var QuantumCircuit = require("quantum-circuit");

//
// 8-bit quantum random number generator
//

var quantumRandom = function() {

    var circuit = new QuantumCircuit();

    for(var i = 0; i < 8; i++) {
        //
        // add Hadamard gate to the end (-1) of i-th wire
        //
        circuit.appendGate("h", i);

        //
        // add measurement gate to i-th qubit which will store result 
        // into classical register "c", into i-th classical bit
        //
        circuit.addMeasure(i, "c", i); 
    }

    // run circuit
    circuit.run();

    // return value of register "c"
    return circuit.getCregValue("c");
};

// Usage - print random number to terminal
console.log(quantumRandom());

```


## Implemented gates

{GATE_INDEX}

*For more details see [gate reference](#gates)*


## Run circuit

Simply call `run` method.

```javascript
circuit.run();
```

## Initial state

By default, initial state of each qubit is `|0>`. You can pass initial values as array of bool (`true` or `false`) or integers (`0` or `1`). This will set first two qubits to `|1>` and evaluate circuit:

```javascript
circuit.run([1, 1]);
```


## Measurement

Method `probabilities()` will return array of probabilities (real numbers between 0 and 1) for each qubit:

```javascript
console.log(circuit.probabilities());
```

Method `probability(wire)` will return probability (real number between 0 and 1) for given qubit:

```javascript
console.log(circuit.probability(0));
```

Method `measureAll()` returns array of chances (as integers 0 or 1) for each qubit:

Example:
```javascript
console.log(circuit.measureAll());
```

Method `measure(wire)` returns chance (as integer 0 or 1) for given qubit:

Example:
```javascript
console.log(circuit.measure(0));
```

You can store measurement into classical register. For example, to measure first qubit (wire 0) and store result into classical register named `c` as fourth bit (bit 3):

```javascript
circuit.measure(0, "c", 3);
```

You can add `measure` gate to circuit and then measurement will be done automatically and result will be stored into classical register:

```javascript
circuit.addGate("measure", -1, 0, { creg: { name: "c", bit: 3 } });
```

Short form of writing this is `addMeasure(wire, creg, cbit)`:

```javascript
circuit.addMeasure(0, "c", 3);
```

*Note:*

- *Measurement gate will reset qubit to measured value only if there are gates with classical control (gates controlled by classical registers). Otherwise, measurement gate will leave qubit as is - measured value will be written to classical register and qubit will remain unchanged. This "nondestructive" behavior is handy when experimenting. However, it will automatically switches to "destructive" mode when needed (when classical control is present)*

- *If specified classical register doesn't exists - it will be created automatically.*


## Classical registers

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

**Read all registers as dictionary**

```javascript
var regs = circuit.getCregs();
console.log(regs);
```

**Read all registers as tab delimited CSV string**

```javascript
var tsv = circuit.cregsAsString();
console.log(tsv);
```

**Read single bit**

Example: get bit 3 from register named `ans`:

```javascript
console.log(circuit.getCregBit("ans", 3));
```
*Returns integer: 0 or 1*


**Set single bit**

Example: set bit 3 to `1` in register named `ans`:

```javascript
circuit.setCregBit("ans", 3, 1);
```

## Control by classical register

Each quatum gate in the circuit (except "measure" gate) can be controlled by classical register - gate will be executed only if classical register contains specified value. Pass `options` object as fourth argument to `addGate` method:

Example:
```javascript
circuit.addGate("x", -1, 0, { 
    condition: { 
        creg: "ans",
        value: 7
    }
});
```
In this example, "x" gate will execute on qubit 0 only if value of register named "ans" equals 7.


## Reset qubit

You can reset qubit to value `|0>` or `|1>` with `resetQubit` method:

```javascript
circuit.resetQubit(3, 0);
```
In this example, qubit 3 will be set to `0|>`. 

*Note that all entangled qubits will be changed as well*


## View/print state vector

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


## Save/Load circuit

You can export circuit to javascript object (format internally used by QuantumCircuit) by calling `save` method:

```javascript
var obj = circuit.save();

// now do something with obj, save to file or whatever...

```

And load previously saved circuit by calling `load` method:

```javascript
var obj = // ...load object from file or from another circuit or whatever

circuit.load(obj);

```


## Use circuit as a gate in another circuit

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


## Decompose circuit

If your circuit contains user defined gates (created from another circuit), you can decompose it into equivalent circuit containing only basic gates.

If you pass `true` as argument to function `save`, you'll get decomposed circuit.

Example:
```javascript
var obj = circuit.save(true);
// now obj contains decomposed circuit. You can load it:
circuit.load(obj);
```

# Import circuit

## Import from QASM

Circuit can be imported from [OpenQASM](https://github.com/Qiskit/openqasm) with following limitations:

- `import` directive is ignored (but gates defined in `qelib1.inc` are supported) **TODO**

- `barrier` is ignored. **TODO**


To import circuit from OpenQASM use `importQASM(input, errorCallback)` method:

Example:
```javascript
circuit.importQASM("OPENQASM 2.0;\nimport \"qelib1.inc\";\nqreg q[2];\nh q[0];\ncx q[0],q[1];\n", function(errors) {
    console.log(errors);
});
```

- `input` is string containing QASM source code.

- `errorCallback` (optional) callback will be called after parsing with one argument: array containing errors or empty array on success. If no callback is provided, function will throw error if input contains errors.


## Import from QUIL

Circuit can be imported from [Quil](https://arxiv.org/abs/1608.03355):


To import circuit from QUIL use `importQuil(quil, errorCallback, options, qubitNames, renamedGates, lineOffset)` method:

Example:
```javascript
circuit.importQuil("H 0\nCNOT 0 1\n", function(errors) {
    console.log(errors);
});
```

- `quil` is string containing QUIL source code.

- `errorCallback` (optional) callback will be called after parsing with one argument: array containing errors or empty array on success. If no callback is provided, function will throw error if input contains errors.

- `options` (optional) function will be called after parsing with array containing syntax errors.

- `qubitNames` (optional) names to be given to the qubits.

- `renamedGates` (optional) custom names given to basic commands

- `lineOffset` (optional) no. of spaces before a new line


## Import from Qobj

Circuit can be imported from [Qobj](https://qiskit.org/documentation/apidoc/qobj.html):

To import circuit from OpenQASM use `importQobj(qobj, errorCallback)` method:

Example:
```javascript
circuit.importQobj({"qobj_id":"qobj_WlLkcGHxihyqWGrKEZ","type":"QASM","schema_version":"1.0","experiments":[{"header":{"memory_slots":0,"n_qubits":2,"qreg_sizes":[["q",2]],"qubit_labels":[["q",0],["q",1]],"creg_sizes":[],"clbit_labels":[],"name":"circuit0","description":"text_exp"},"config":{"n_qubits":2,"memory_slots":0},"instructions":[{"name":"x","qubits":[0,1]}]}],"header":{"description":"test_circ"},"config":{"shots":1,"memory_slots":0}}, function(errors) {
    console.log(errors);
});
```

- `qobj` is Qobj JSON (`"type": "QASM"`).

- `errorCallback` (optional) callback will be called after parsing with one argument: array containing errors or empty array on success. If no callback is provided, function will throw error if input contains errors.


## Import from IONQ json

Circuit can be imported from [IONQ json](https://docs.ionq.com/#tag/quantum_programs):


To import circuit from IONQ json use `importIonq(data, errorCallback)` method:

Example:
```javascript
var ionqCircuit = {
  "qubits": 2,
  "circuit": [
    {
      "gate": "h",
      "target": 0
    },
    {
      "gate": "cnot",
      "target": 1,
      "control": 0
    }
  ]
};

circuit.importIonq(ionqCircuit, function(errors) {
    console.log(errors);
});
```

- `data` is IONQ JSON object.

- `errorCallback` (optional) callback will be called after parsing with one argument: array containing errors or empty array on success. If no callback is provided, function will throw error if input contains errors.


# Export circuit

## Export to JavaScript

Circuit can be exported to JavaScript with `exportJavaScript(comment, decompose, null, asJupyter)` method:

Example:
```javascript
var js = circuit.exportJavaScript("Comment to insert at the beginning.\nCan be multi-line comment like this one.", false);
```

- `comment` - comment to insert at the beginning of the file.

- `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

- `asJupyter` - when this argument is `true` jupyter notebook (set to use `ijavascript` kernel) will be returned.


## Export to Qiskit (python)

Circuit can be exported to [Qiskit](https://qiskit.org/documentation/) with following limitation:

- User defined gates are not generated. Instead, circuit is decomposed to basic gates and exported. Effect is the same but code is less readable. **TODO**

- Gates not directly supported by Qiskit are exported as-is - their definition is not generated. **TODO**

To export circuit to Qiskit use `exportToQiskit(options, exportAsGateName, circuitReplacement, insideSubmodule)` method :

Example:
```javascript
var qiskit = circuit.exportToQiskit({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false, null, null);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - Qiskit version. Can be `"0.7"`. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `providerName` - name of the Qiskit backend simulator provider.

    - `backendName` - name of the Qiskit backend simulator.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `insideSubmodule` - used internally (when `true` adds extra indent for alignment)

- `exportAsGateName` - used internally (name of the custom gate containing the Qiskit circuit)

- `circuitReplacement` - used internally (when `true` exports only gates in the circuit)


## Export to QASM

Circuit can be exported to [OpenQASM](https://github.com/Qiskit/openqasm) with following limitation:

- at the moment, gates not directly supported by QASM and qelib1.inc are exported as-is - their definition is not generated. **TODO**

To export circuit to OpenQASM use `exportToQASM(options, exportAsGateName, circuitReplacement, insideSubmodule)` method:

Example:
```javascript
var qasm = circuit.exportToQASM({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `compatibilityMode` - if set to `true` exports the circuit in compatible mode

- `insideSubmodule` - when `true` adds extra indent for alignment

- `exportAsGateName` - name of the custom gate containing the Qiskit circuit.

- `circuitReplacement` - when `true` exports only gates in the circuit



## Export to pyQuil (python)

Circuit can be exported to [pyQuil](http://docs.rigetti.com/en/latest/index.html)

To export circuit to pyQuil use `exportToPyquil(options, exportAsGateName)` method:

Example:
```javascript
var qasm = circuit.exportToPyquil({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - pyQuil version. Can be `"1.9"`, `"2.0"` or `"2.1"`. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `lattice` - You can optionally pass then name of the lattice.

    - `asQVM` - If this argument is `true` (and if `lattice` is specified) then produced code will run on QVM mimicking running on QPU. Otherwise, produced code will run on QPU.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `exportAsGateName` - name of the custom gate containing the Pyquil circuit.


## Export to Quil

Circuit can be exported to [Quil](https://arxiv.org/abs/1608.03355)

To export circuit to Quil use `exportToQuil(options, exportAsGateName)` method:

Example:
```javascript
var quil = circuit.exportToQuil({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - pyQuil version. Can be `"1.9"`, `"2.0"` or `"2.1"`. Exports to latest supported version when empty string is provided. Remember - it is a string.

- `exportAsGateName` - name of the custom gate containing the Pyquil circuit.



## Export to Cirq (python)

Circuit can be exported to [Cirq](https://github.com/quantumlib/Cirq) with following limitation:

- Gates not directly supported by Cirq are exported as-is - their definition is not generated. **TODO**

- Classical control is ignored (comment with warning is generated). **TODO**

To export circuit to Cirq use `exportToCirq(options, exportAsGateName)` method:

Example:
```javascript
var cirq = circuit.exportToCirq({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - Cirq version. Can be `"0.5"` or empty string. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `exportTfq` - if set to `true` the export function will export circuit to Tensorflow Quantum.

- `exportAsGateName` - name of the custom gate containing the Cirq circuit.


## Export to C/C++ (QuEST)

Circuit can be exported to [QuEST](https://quest.qtechtheory.org/)

To export circuit to QuEST use `exportQuEST(newOptions, exportAsGateName, definedFunc)` method:

Example:
```javascript
var quest = circuit.exportToQuEST("Comment to insert at the beginning.\nCan be multi-line comment as this one.", false);
```

- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

- `exportAsGateName` - name of the custom gate containing the Cirq circuit.

- `definedFunc` - list of gates that must be present in the defined function



## Export to Q# (QSharp)

Circuit can be exported to [Q#](https://docs.microsoft.com/en-us/quantum/language/index?view=qsharp-preview).

To export circuit to Q# use `exportQSharp(options, exportAsGateName)` method:

Example:
```javascript
var qsharp = circuit.exportQSharp("Comment to insert at the beginning.\nCan be multi-line comment as this one.", false, null, null, false, null);
```

- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - QSharp version. Can be `"0.1"` or empty string. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `asJupyter` - when this argument is `true` jupyter notebook (set to use qsharp kernel) will be returned.

    - `circuitName` - Name of the circuit that is being exported to QSharp. By default set to `"Circuit"`

    - `indentDepth` - The no. of tabs to be put before a Python line of code.

- `exportAsGateName` - name of the custom gate containing the QSharp circuit.


## Export to Qobj

Circuit can be exported to [Qobj](https://qiskit.org/documentation/apidoc/qobj.html):

To export circuit to Qiskit use `exportToQobj(options, circuitReplacement)` method :

Example:
```javascript
var qobj = circuit.exportToQobj({circuitName:"new_circuit"}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `circuitName` - name of the circuit that is being exported to Qobj

    - `experimentName` - name of the experiment that describes the number of memory slots, qubits, qubit names, classical bit names etc. 

    - `numShots` - no. of trials.

- `circuitReplacement` - when `true` exports only gates in the circuit


## Export to TensorFlow Quantum (python)

Circuit can be exported to [Tensorflow Quantum](https://www.tensorflow.org/quantum):

To export circuit to TFQ use `exportToTFQ(options, exportAsGateName)` method :

Example:
```javascript
var tfq = circuit.exportToTFQ({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - TFQ version. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

- `exportAsGateName` - name of the custom gate containing the TFQ circuit.


## Export to Braket (python)

Circuit can be exported to [Braket](https://docs.aws.amazon.com/braket/):

To export circuit to Braket use `exportToBraket(options, exportAsGateName)` method :

Example:
```javascript
var braket = circuit.exportToBraket({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `versionStr` - Braket version. Exports to latest supported version when empty string is provided. Remember - it is a string.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `indentDepth` - The no. of tabs to be put before a Python line of code.

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `exportAsGateName` - name of the custom gate containing the Braket circuit.


## Export to pyAQASM (python)

Circuit can be exported to [pyAQASM](https://myqlm.github.io/):

To export circuit to pyAQASM use `exportToPyAQASM(options, exportAsGateName)` method :

Example:
```javascript
var pyAqasm = circuit.exportToPyAQASM({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `exportAsGateName` - name of the custom gate containing the pyAQASM circuit.


## Export to AQASM

Circuit can be exported to [AQASM](https://myqlm.github.io/aqasm.html):

To export circuit to AQASM use `exportToAQASM(options, isExportPyAQASM, exportAsGateName, indentDepth)` method :

Example:
```javascript
var aqasm = circuit.exportToAQASM({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false);
```
- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - no. of trials.

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `isExportPyAQASM` - if `true`, this function will be used to export to pyAQASM instead of AQASM.

- `exportAsGateName` - name of the custom gate containing the AQASM circuit.

- `indentDepth` - The no. of tabs to be put before a Python line of code.



## Export to CudaQ (python)

Circuit can be exported to [CudaQ](https://nvidia.github.io/cuda-quantum/latest/index.html)

To export circuit to CudaQ use `exportToCudaQ(options, exportAsGateName, circuitReplacement, insideSubmodule)` method :

Example:
```javascript
var cudaq = circuit.exportToCudaQ({comment:"Comment to insert at the beginning.\nCan be multi-line comment as this one."}, false, null, null);
```

- `options` - consists of parameters for circuit export as follows:

    - `comment` - comment to insert at the beginning of the file.

    - `decompose` - if set to `true` and circuit contains user defined gates then it will be decomposed to basic gates and then exported. If set to `false` then user defined gates will exported as subroutines.

    - `backendName` - name of the CudaQ backend.

    - `asJupyter` - when this argument is `true` jupyter notebook will be returned.

    - `shots` - number of shots (if code is sampling).

    - `hybrid` - when `true` exports user defined cost function along with circuit for hybrid Quantum-Classical Algorithms

- `insideSubmodule` - used internally (when `true` adds extra indent for alignment)

- `exportAsGateName` - used internally (name of the custom gate containing the CudaQ circuit)

- `circuitReplacement` - used internally (when `true` exports only gates in the circuit)




## Export to SVG

Vector `.svg` image of circuit can be created with `exportSVG(embedded)` function with following limitations:

- Gate symbols are non-standard. **TODO** *(BTW, do we have standard?)*


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


## Export to Quirk

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


# About simulator algorithm

Memory usage: up to `2 * (2^numQubits) * sizeOfComplexNumber`


- Naive implementation stores entire state vector in an array of size `2^numQubits`. We are storing state in a "map", and only amplitudes with non-zero probabilities are stored. So, in worst case, size of state map is `2^n`, but it's less most of the time because we don't store zeroes.

- Naive implementation creates transformation matrix and multiplies it with state vector. We are not creating and not storing entire transformation matrix in memory. Instead, elements of transformation matrix are calculated one by one and state is multiplied and stored in new state map on the fly. This way, memory usage is minimal (in worst case we have two `2^n` state vectors at a time).

- Algorithm is parallelizable so it could use GPU, but GPU support is not implemented yet (work in progress).


## Benchmark

*Performance is measured on MacBook Pro MJLT2 mid-2015 (Core i7 2.5 GHz, 16GB RAM)*

![Benchmark 1](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark1.png)

![Benchmark 2](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark2.png)

![Benchmark 3](https://rawgit.com/perak/quantum-circuit/HEAD/media/benchmark3.png)

*You can find scripts in [/benchmark](benchmark/) directory.*


# Gates

{GATE_REFERENCE}


# API docs

{API_DOCS}


# License
[MIT](LICENSE.txt)
