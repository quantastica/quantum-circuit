/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

var math = require("mathjs");

var QASMImport = require("./qasm_import/QASMImport.js");


var formatComplex2 = function(re, im, options) {
	options = options || {};

	var sre = formatFloat(re, options);

	var opt = JSON.parse(JSON.stringify(options));
	opt.plusChar = "+";
	var sim = formatFloat(im, opt);
	return sre + sim + (options.iotaChar ? options.iotaChar : "i");
};

var formatFloat = function(f, options) {
	options = options || {};

	if(options.decimalPlaces) {
		f = math.round(f, options.decimalPlaces);
	}

	var s = f + "";

	if(options.fixedWidth) {
		s = f.toFixed(options.decimalPlaces || 14);
	}

	var plusChar = options.plusChar;
	if(options.fixedWidth && !plusChar) {
		plusChar = " ";
	}

	if(plusChar && f >= 0) {
		s = plusChar + s;
	}

	return s;
};

var zeroesMatrix = function(n) {
	var matrix = [];
	for(var i = 0; i < n; i++) {
		matrix[i] = [];
		for(var j = 0; j < n; j++) {
			matrix[i][j] = 0;
		}
	}
	return matrix;
};

var identityMatrix = function(n) {
	var matrix = [];
	for(var i = 0; i < n; i++) {
		matrix[i] = [];
		for(var j = 0; j < n; j++) {
			matrix[i][j] = j == i ? 1 : 0;
		}
	}
	return matrix;
};


var makeControlled = function(U) {
	var m = U.length;
	var C = identityMatrix(m * 2);
	for (var i = 0; i < m; i++) {
		for (var j = 0; j < m; j++) {
			C[i + m][j + m] = U[i][j];
		}
	}
	return C;
};

var uniqueArray = function(array) {
  return array.filter(function(value, index, self) {
	return self.indexOf(value) === index;
  });
};

var qubitLetter = function(n, max) {
	maxN = max || (n + 1);

	if(maxN > 0) {
		maxN = maxN - 1;
	}

	maxLen = maxN.toString(26).length;

	var nStr = n.toString(26);
	while(nStr.length < maxLen) {
		nStr = "0" + nStr;
	}

	var res = "";
	for(var i = 0; i < nStr.length; i++) {
		var code = nStr.charCodeAt(i);
		res += String.fromCharCode(code < 97 ? code + 49 : code + 10);
	}

	return res;
};

var QuantumCircuit = function(numQubits) {
	this.basicGates = {
		id: {
			description: "Single qubit identity gate",
			matrix: [
				[1, 0],
				[0, 1]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "ID"
			},
			exportInfo: {
				quil: {
					name: "I"
				},
				cirq: {
					name: "I",
					notTfqSupported: true
				},
				quest: {
					name: "compactUnitary",
					params: { alpha: "(Complex) { .real = 1, .imag = 0 }",
							beta: "(Complex) {.real = 0, .imag = 0}"}
				},
				qsharp: {
					name: "I"
				},
				qiskit: {
					name: "id"
				},
				braket: {
					name: "i"
				},
				aqasm: {
					name: "I"
				},
				cudaq: {
					name: "i",
					matrix: "[[1, 0], [0, 1]]"
				},
				quirk: {
					name: "…",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		x: {
			description: "Pauli X (PI rotation over X-axis) aka \"NOT\" gate",
			matrix: [
				[0,1],
				[1,0]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "X"
			},
			exportInfo: {
				quil: {
					name: "X"
				},
				cirq: {
					name: "X"
				},
				quest: {
					name: "pauliX"
				},
				qsharp: {
					name: "X"
				},
				quirk: {
					name: "X",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "x"
				},
				aqasm: {
					name: "X"
				},
				ionq: {
					names: [ "x", "not" ],
				},
				cudaq: {
					name: "x"
				}
			}
		},

		y: {
			description: "Pauli Y (PI rotation over Y-axis)",
			matrix: [
				[0,"-i"],
				["i",0]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Y"
			},
			exportInfo: {
				quil: {
					name: "Y"
				},
				cirq: {
					name: "Y"
				},
				quest: {
					name: "pauliY"
				},
				qsharp: {
					name: "Y"
				},
				quirk: {
					name: "Y",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "y"
				},
				aqasm: {
					name: "Y"
				},
				ionq: {
					name: "y"
				},
				cudaq: {
					name: "y"
				}
			}
		},

		z: {
			description: "Pauli Z (PI rotation over Z-axis)",
			matrix: [
				[1,0],
				[0,-1]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z"
			},
			exportInfo: {
				quil: {
					name: "Z"
				},
				cirq: {
					name: "Z"
				},
				quest: {
					name: "pauliZ"
				},
				qsharp: {
					name: "Z"
				},
				quirk: {
					name: "Z",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "z"
				},
				aqasm: {
					name: "Z"
				},
				ionq: {
					name: "z"
				},
				cudaq: {
					name: "z"
				}
			}
		},

		h: {
			description: "Hadamard gate",
			matrix: [
				["1 / sqrt(2)","1 / sqrt(2)"],
				["1 / sqrt(2)","-1 / sqrt(2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "H"
			},
			exportInfo: {
				quil: {
					name: "H"
				},
				cirq: {
					name: "H"
				},
				quest: {
					name: "hadamard"
				},
				qsharp: {
					name: "H"
				},
				quirk: {
					name: "H",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "h"
				},
				aqasm: {
					name: "H"
				},
				ionq: {
					name: "h"
				},
				cudaq: {
					name: "h"
				}
			}
		},

		srn: {
			description: "Square root of NOT",
			matrix: [
				["0.5+0.5i","0.5-0.5i"],
				["0.5-0.5i","0.5+0.5i"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "&#x221A;X"
			},
			exportInfo: {
				quil: {
					name: "srn",
					defgate: "DEFGATE srn:\n    0.5+0.5i, 0.5-0.5i\n    0.5-0.5i, 0.5+0.5i"
				},
				pyquil: {
					name: "srn",
					array: "[[0.5+0.5j, 0.5-0.5j], [0.5-0.5j, 0.5+0.5j]]"
				},
				cirq: {
					name: "X**(1/2)"
				},
				quest: {
					name: "unitary",
					matrix: [[["0.5", "0.5"], ["0.5", "-0.5"]],
						[["0.5", "-0.5"],["0.5", "0.5"]]]
				},
				qasm: {
					equivalent: [
						{ name: "h", wires: [0] },
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "pi/2" }, wires: [0] },
						{ name: "h", wires: [0] }
					]
				},
				qiskit: {
					name: "sx"
				},
				braket: {
					name: "v"
				},
				aqasm: {
					matrix: [["0.5+0.5i","0.5-0.5i"],["0.5-0.5i","0.5+0.5i"]],
					array: "[[0.5+0.5j, 0.5-0.5j], [0.5-0.5j, 0.5+0.5j]]"
				},
				ionq: {
					name: "v"
				},
				cudaq: {
					equivalent: [
						{ name: "h", wires: [0] },
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "pi/2" }, wires: [0] },
						{ name: "h", wires: [0] }
					]
				},
				quirk: {
					name: "X^½",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		srndg: {
			description: "Inverse square root of NOT",
			matrix: [
				["0.5-0.5i","0.5+0.5i"],
				["0.5+0.5i","0.5-0.5i"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "&#x221A;X&#8224;"
			},
			exportInfo: {
				quil: {
					name: "srndg",
					defgate: "DEFGATE srndg:\n    0.5-0.5i, 0.5+0.5i\n    0.5+0.5i, 0.5-0.5i"
				},
				pyquil: {
					name: "srndg",
					array: "[[0.5-0.5j, 0.5+0.5j], [0.5+0.5j, 0.5-0.5j]]"
				},
				cirq: {
					name: "X**(-1/2)"
				},
				quest: {
					name: "unitary",
					matrix: [[["0.5", "-0.5"], ["0.5", "0.5"]],
						[["0.5", "0.5"],["0.5", "-0.5"]]]
				},
				qasm: {
					equivalent: [
						{ name: "h", wires: [0] },
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "-pi/2" }, wires: [0] },
						{ name: "h", wires: [0] }
					]
				},
				qiskit: {
					name: "sxdg"
				},
				braket: {
					name: "vi"
				},
				aqasm: {
					matrix: [["0.5-0.5i","0.5+0.5i"],["0.5+0.5i","0.5-0.5i"]],
					array: "[[0.5-0.5j, 0.5+0.5j], [0.5+0.5j, 0.5-0.5j]]"
				},
				ionq: {
					name: "vi"
				},
				cudaq: {
					equivalent: [
						{ name: "h", wires: [0] },
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "-pi/2" }, wires: [0] },
						{ name: "h", wires: [0] }
					]
				},
				quirk: {
					name: "X^-½",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		r2: {
			description: "PI/2 rotation over Z-axis aka \"Phase PI/2\"",
			matrix: [
				[1,0],
				[0,"exp(i * pi / 2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/2"
			},

			exportInfo: {
				quil: {
					replacement: {
						name: "s"
					}
				},
				cirq: {
					replacement: {
						name: "s"
					}
				},
				quest: {
					name: "sGate"
				},
				qsharp: {
					replacement: {
						name: "s",
					}
				},
				qasm: {
					replacement: [
						{ name: "s", params: {} }
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "s", params: {} }
				   ]
				},
				quirk: {
					name: "Z^½",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "s"
				},
				aqasm: {
					name: "S"
				},
				cudaq: {
					name: "s"
				}
			}
		},

		r4: {
			description: "PI/4 rotation over Z-axis aka \"Phase PI/4\"",
			matrix: [
				[1,0],
				[0,"exp(i * pi / 4)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/4"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "t"
					}
				},
				cirq: {
					replacement: {
						name: "t"
					}
				},
				quest: {
					name: "tGate"
				},
				qsharp: {
					replacement: {
						name: "t"
					}
				},
				qasm: {
					replacement: [
						{ name: "t", params: {} }
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "t", params: {} }
				   ]
				},
				quirk: {
					name: "Z^¼",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "t"
				},
				aqasm: {
					name: "T"
				},
				cudaq: {
					name: "t"
				}
			}
		},

		r8: {
			description: "PI/8 rotation over Z-axis aka \"Phase PI/8\"",
			matrix: [
				[1,0],
				[0,"exp(i * pi / 8)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/8"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: {theta: "M_PI/8"}
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "u1", params: { lambda: "pi/8" } }
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "u1", params: { lambda: "pi/8" } }
				   ]
				},
				quirk: {
					name: "Z^⅛",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "phaseshift",
					params: {theta: "pi/8"}
				},
				aqasm: {
					matrix: [[1,0],[0,"exp(i * pi / 8)"]],
					array: "[[1,0],[0,np.exp(1j * np.pi / 8)]]"
				},
				cudaq: {
					replacement: [
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "pi/8" } }
					]				
				}
			}
		},

		rx: {
			description: "Rotation around the X-axis by given angle",
			matrix: [
				["cos(theta / 2)", "-i * sin(theta / 2)"],
				["-i * sin(theta / 2)", "cos(theta / 2)"]
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "RX"
			},
			exportInfo: {
				quil: {
					name: "RX",
					params: ["theta"]
				},
				cirq: {
					name: "rx",
					params: ["theta"]
				},
				quest: {
					name: "rotateX",
					params: ["theta"]
				},
				qsharp: {
					name: "Rx",
					params: ["theta"]
				},
				braket: {
					name: "rx",
					params: ["theta"]
				},
				aqasm: {
					name: "RX"
				},
				ionq: {
					name: "rx",
					paramsKey: "rotation"
				},
				cudaq: {
					name: "rx"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		ry: {
			description: "Rotation around the Y-axis by given angle",
			matrix: [
				["cos(theta / 2)", "-1 * sin(theta / 2)"],
				["sin(theta / 2)", "cos(theta / 2)"]
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "RY"
			},
			exportInfo: {
				quil: {
					name: "RY",
					params: ["theta"]
				},
				cirq: {
					name: "ry",
					params: ["theta"]
				},
				quest: {
					name: "rotateY",
					params: ["theta"]
				},
				qsharp: {
					name: "Ry",
					params: ["theta"]
				},
				braket: {
					name: "ry",
					params: ["theta"]
				},
				aqasm: {
					name: "RY"
				},
				ionq: {
					name: "ry",
					paramsKey: "rotation"
				},
				cudaq: {
					name: "ry"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		rz: {
			description: "Rotation around the Z-axis by given angle",
			
			matrix: [
				["cos(phi / 2) - i * sin(phi / 2)", 0],
				[0, "cos(phi / 2) + i * sin(phi / 2)"]
			],

			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "RZ"
			},
			exportInfo: {
				quil: {
					name: "RZ",
					params: ["phi"]
				},
				cirq: {
					name: "rz",
					params: ["theta"]
				},
				quest: {
					name: "rZ",
					//@TODO add function
					func: "TODO"
				},
				qsharp: {
					name: "Rz",
					params: ["theta"]
				},
				braket: {
					name: "rz",
					params: ["phi"]
				},
				aqasm: {
					name: "RZ"
				},
				ionq: {
					name: "rz",
					paramsKey: "rotation"
				},
				cudaq: {
					name: "rz"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		u1: {
			description: "Single-qubit rotation about the Z axis",
			matrix: [
				[1,0],
				[0,"exp(i * lambda)"]
			],
			params: ["lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U1"
			},
			exportInfo: {
				quil: {
					name: "PHASE",
					params: ["lambda"]
				},
				cirq: {
					name: "u1",
					params: ["lambda"],
					array: "[[1, 0], [0, np.exp(1j*p_lambda)]]",
					notTfqSupported: true
				},
				quest: {
					name: "phaseShift",
					params: ["lambda"]
				},
				braket: {
					name: "phaseshift",
					params: ["lambda"]
				},
				qiskit: {
					name: "p"
				},
				aqasm: {
					name: "PH"
				},
				cudaq: {
					replacement: [
						{ name: "u3", params: { theta: 0, phi: 0, lambda: "lambda" } }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		u2: {
			description: "Single-qubit rotation about the X+Z axis",
			matrix: [
				["1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],
				["exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)"]
			],
			params: ["phi", "lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U2"
			},
			exportInfo: {
				quil: {
					name: "u2",
					params: ["phi", "lambda"],
					defgate: "DEFGATE u2(%phi, %lambda):\n    1/SQRT(2), -1*EXP(i*%lambda)*1/SQRT(2)\n    EXP(i*%phi)*1/SQRT(2), EXP(i*%lambda + i*%phi)*1/SQRT(2)"
				},
				pyquil: {
					name: "u2",
					params: ["phi", "lambda"],
					array: "[[1/quil_sqrt(2),-quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[quil_exp(1j*p_phi)*1/quil_sqrt(2),quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]"
				},
				cirq: {
					name: "u2",
					params: ["phi", "lambda"],
					array: "[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					notTfqSupported: true
				},
				quest: {
					name: "unitary",
					params: ["phi", "lambda"],
					matrix: [[["1/sqrt(2)", "0"], ["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"]],
							 [["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"], ["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"]]]
				},
				braket: {
					name: "unitary",
					params: ["phi", "lambda"],
					array: "[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]"
				},
				aqasm: {
					matrix: [["1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],["exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)"]],
					array: "[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					params: ["phi", "lambda"]
				},
				qiskit: {
					replacement: [
						{ name: "u3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" } }
					]
				},
				cudaq: {
					replacement: [
						{ name: "u3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" } }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		u3: {
			description: "Generic single-qubit rotation gate with 3 Euler angles",
			matrix: [
				[ "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)" ],
				[ "exp(i * phi) * sin(theta / 2)", "exp(i * lambda + i * phi) * cos(theta / 2)" ]
			],
			params: ["theta", "phi", "lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U3"
			},
			exportInfo: {
				quil: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					defgate: "DEFGATE u3(%theta, %phi, %lambda):\n    COS(%theta/2), -1*EXP(i*%lambda)*SIN(%theta/2)\n    EXP(i*%phi)*SIN(%theta/2), EXP(i*%lambda + i*%phi)*COS(%theta/2)"
				},
				pyquil: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array: "[[quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]"
				},
				cirq: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array: "[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					notTfqSupported: true
				},
				quest: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					matrix: [[["cos(theta/2)", "0"], ["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"]],
							 [["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"], ["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"]]]
				},
				braket: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					array: "[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]"
				},
				qiskit: {
					name: "u"
				},
				aqasm: {
					matrix: [[ "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)" ],[ "exp(i * phi) * sin(theta / 2)", "exp(i * lambda + i * phi) * cos(theta / 2)" ]],
					array: "[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					params: ["theta", "phi", "lambda"]
				},
				cudaq: {
					name: "u3"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		s: {
			description: "PI/2 rotation over Z-axis (synonym for `r2`)",
			matrix: [
				[1,0],
				[0,"i"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S"
			},
			exportInfo: {
				quil: {
					name: "S"
				},
				cirq: {
					name: "S"
				},
				quest: {
					name: "sGate"
				},
				qsharp: {
					name: "S"
				},
				quirk: {
					name: "Z^½",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "s"
				},
				aqasm: {
					name: "S"
				},
				ionq: {
					name: "s"
				},
				cudaq: {
					name: "s"
				}
			}
		},

		t: {
			description: "PI/4 rotation over Z-axis (synonym for `r4`)",
			matrix: [
				[1,0],
				[0,"exp(i * pi / 4)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T"
			},
			exportInfo: {
				quil: {
					name: "T"
				},
				cirq: {
					name: "T"
				},
				quest: {
					name: "tGate"
				},
				qsharp: {
					name: "T"
				},
				quirk: {
					name: "Z^¼",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "t"
				},
				aqasm: {
					name: "T"
				},
				ionq: {
					name: "t"
				},
				cudaq: {
					name: "t"
				}
			}
		},

		sdg: {
			description: "(-PI/2) rotation over Z-axis",
			matrix: [
				[1,0],
				[0,"-i"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S&#8224;"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: { theta: "-M_PI/2" }
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				quirk: {
					name: "Z^-½",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "si"
				},
				aqasm: {
					name: "S",
					dagger: true
				},
				ionq: {
					name: "si"
				},
				cudaq: {
					name: "sdg"
				}
			}
		},

		tdg: {
			description: "(-PI/4) rotation over Z-axis",
			matrix: [
				[1,0],
				[0,"exp(-i * pi / 4)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T&#8224;"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: { theta: "-M_PI/4" }
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				quirk: {
					name: "Z^-¼",
					controlQubits: 0,
					targetQubits: 1
				},
				braket: {
					name: "ti"
				},
				aqasm: {
					name: "T",
					dagger: true
				},
				ionq: {
					name: "ti"
				},
				cudaq: {
					name: "tdg"
				}
			}
		},

		gpi: {
			description: "GPi gate",
			matrix: [
				[0, "exp(-i*phi)"],
				["exp(i*phi)", 0]
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "GPi"
			},

			exportInfo: {
				quil: {
					name: "gpi",
					params: ["phi"],
					defgate: "DEFGATE gpi(%phi):\n    0, EXP(-i * %phi)\n    EXP(i * %phi), 0"
				},
				pyquil: {
					name: "gpi",
					params: ["phi"],
					array: "[ [ 0, quil_exp(-1j*p_phi) ], [ quil_exp(1j*p_phi), 0 ] ]"
				},
				cirq: {
					name: "gpi"
				},
				quest: {
					name: "gpi",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					equivalent: [
						{ name: "u3", params: { theta: "pi", phi: "phi", lambda: "pi-phi" }, wires: [0] }
					]
				},
				qiskit: {
					equivalent: [
						{ name: "u3", params: { theta: "pi", phi: "phi", lambda: "pi-phi" }, wires: [0] }
					]
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array: "[ [ 0, np.exp(-1j*p_phi) ], [ np.exp(1j*p_phi), 0 ] ]"
				},
				aqasm: {
					matrix: [ [ 0, "exp(-i*phi)" ], [ "exp(i*phi)", 0] ],
					array: "[ [ 0, np.exp(-1j*p_phi) ], [ np.exp(1j*p_phi), 0 ] ]",
					params: ["phi"]
				},
				ionq: {
					name: "gpi",
					paramsKey: "phase"
				},
				cudaq: {
					equivalent: [
						{ name: "u3", params: { theta: "pi", phi: "phi", lambda: "pi-phi" }, wires: [0] }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		gpi2: {
			description: "GPi2 gate",
			matrix: [
				["1/sqrt(2)", "(-i*exp(-i*phi))/sqrt(2)"],
				["(-i*exp(i*phi))/sqrt(2)", "1/sqrt(2)"]
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "GPi2"
			},
			exportInfo: {
				quil: {
					name: "gpi2",
					params: ["phi"],
					defgate: "DEFGATE gpi2(%phi):\n    1/SQRT(2), (-i*EXP(-i * %phi)) / SQRT(2)\n    (-i*EXP(i * %phi)) / SQRT(2), 1/SQRT(2)"
				},
				pyquil: {
					name: "gpi2",
					params: ["phi"],
					array: "[ [ 1/quil_sqrt(2), (-1j*quil_exp(-1j*p_phi))/quil_sqrt(2) ], [ (-1j*quil_exp(1j*p_phi))/quil_sqrt(2), 1/quil_sqrt(2) ] ]"
				},
				cirq: {
					name: "gpi2"
				},
				quest: {
					name: "gpi2",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "phi-(pi/2)", lambda: "(pi/2)-phi" }, wires: [0] }
					]
				},
				qiskit: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "phi-(pi/2)", lambda: "(pi/2)-phi" }, wires: [0] }
					]
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array: "[ [ 1/np.sqrt(2), (-1j*np.exp(-1j*p_phi))/np.sqrt(2) ], [ (-1j*np.exp(1j*p_phi))/np.sqrt(2), 1/np.sqrt(2) ] ]"
				},
				aqasm: {
					matrix: [ [ "1/sqrt(2)", "(-i*exp(-i*phi))/sqrt(2)" ], [ "(-i*exp(i*phi))/sqrt(2)", "1/sqrt(2)" ] ],
					array: "[ [ 1/np.sqrt(2), (-1j*np.exp(-1j*p_phi))/np.sqrt(2) ], [ (-1j*np.exp(1j*p_phi))/np.sqrt(2), 1/np.sqrt(2) ] ]",
					params: ["phi"]
				},
				ionq: {
					name: "gpi2",
					paramsKey: "phase"
				},
				cudaq: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "phi-(pi/2)", lambda: "(pi/2)-phi" }, wires: [0] }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				},
			}
		},

		vz: {
			description: "VirtualZ gate",
			matrix: [
				["exp(-i*theta/2)", 0],
				[0, "exp(i*theta/2)"]
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "VrtZ"
			},
			exportInfo: {
				quil: {
					name: "vz",
					params: ["theta"],
					defgate: "DEFGATE vz(%theta):\n    EXP(-i * %theta/2), 0\n    0, EXP(-i * %theta/2)"
				},
				pyquil: {
					name: "vz",
					params: ["theta"],
					array: "[ [ quil_exp(-1j*p_theta/2), 0 ], [ 0, quil_exp(1j*p_theta/2) ] ]"
				},
				cirq: {
					name: "vz"
				},
				quest: {
					name: "vz",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					equivalent: [
						{ name: "rz", params: { phi: "theta" }, wires: [0] }
					]
				},
				qiskit: {
					equivalent: [
						{ name: "rz", params: { phi: "theta" }, wires: [0] }
					]
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array: "[ [ np.exp(-1j*p_theta/2), 0 ], [ 0, np.exp(1j*p_theta/2) ] ]"
				},
				aqasm: {
					matrix: [ [ "exp(-i*theta/2)", 0 ], [ 0, "exp(i*theta/2)"] ],
					array: "[ [ np.exp(-1j*p_theta/2), 0 ], [ 0, np.exp(1j*p_theta/2) ] ]",
					params: ["theta"]
				},
				ionq: {
					name: "vz",
					paramsKey: "phase"
				},
				cudaq: {
					equivalent: [
						{ name: "rz", params: { phi: "theta" }, wires: [0] }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		cx: {
			description: "Controlled NOT (CNOT) gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,0,1],
				[0,0,1,0]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","not"],
				label: "X",
				root: "x"
			},
			exportInfo: {
				quil: {
					name: "CNOT"
				},
				cirq: {
					name: "CNOT"
				},
				quest: {
					name: "controlledNot"
				},
				qsharp: {
					name: "CNOT"
				},
				quirk: {
					name: "X",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "cnot"
				},
				aqasm: {
					name: "CNOT"
				},
				ionq: {
					name: "cnot"
				},
				cudaq: {
					name: "cx"
				}
			}
		},

		cy: {
			description: "Controlled Y gate (controlled rotation over Y-axis by PI)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,0,"-i"],
				[0,0,"i",0]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Y",
				root: "y"
			},
			exportInfo: {
				quest: {
					name: "controlledPauliY"
				},
				cirq: {
					replacement: {
						name: "y",
						type: "controlled",
						notTfqSupported: true
					}
				},
				quil: {
					name: "cy",
					defgate: "DEFGATE cy:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0, -i\n    0, 0, i, 0"
				},
				pyquil: {
					name: "cy",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0,-1j],[0,0,1j,0]]"
				},
				qsharp: {
					name: "Controlled Y"
				},
				quirk: {
					name: "Y",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "cy"
				},
				aqasm: {
					name: "Y",
					controlled: true
				},
				cudaq: {
					name: "cy"
				}
			}
		},

		cz: {
			description: "Controlled Z gate (controlled rotation over Z-axis by PI)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,-1]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","dot"],
				label: "Z",
				root: "z"
			},
			exportInfo: {
				quil: {
					name: "CZ"
				},
				cirq: {
					name: "CZ"
				},
				quest: {
					name: "controlledPhaseFlip"
				},
				qsharp: {
					name: "Controlled Z"
				},
				quirk: {
					name: "Z",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "cz"
				},
				aqasm: {
					name: "CSIGN"
				},
				cudaq: {
					name: "cz"
				}
			}
		},

		ch: {
			description: "Controlled Hadamard gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,"1 / sqrt(2)","1 / sqrt(2)"],
				[0,0,"1 / sqrt(2)","-1 / sqrt(2)"]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "H",
				root: "h"
			},
			exportInfo: {
				quest: {
					name: "controlledUnitary",
					matrix: [[["1/sqrt(2)", "0"], ["1/sqrt(2)", "0"]],
							 [["1/sqrt(2)", "0"], ["-1/sqrt(2)", "0"]]]
				},
				cirq: {
					replacement: {
						name: "h",
						type: "controlled",
						notTfqSupported: true
					}
				},
				quil: {
					name: "ch",					
					defgate: "DEFGATE ch:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0.7071067811865475, 0.7071067811865475\n    0, 0, 0.7071067811865475, -0.7071067811865475"
				},
				pyquil: {
					name: "ch",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,1/np.sqrt(2),1/np.sqrt(2)],[0,0,1/np.sqrt(2),-1/np.sqrt(2)]]"
				},
				qsharp: {
					name: "Controlled H"
				},
				quirk: {
					name: "H",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,1/np.sqrt(2),1/np.sqrt(2)],[0,0,1/np.sqrt(2),-1/np.sqrt(2)]]"
				},
				aqasm: {
					name: "H",
					controlled: true
				},
				cudaq: {
					name: "ch"
				}
			}
		},

		csrn: {
			description: "Controlled square root of NOT",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,"0.5+0.5i","0.5-0.5i"],
				[0,0,"0.5-0.5i","0.5+0.5i"]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "&#x221A;X",
				root: "srn"
			},
			exportInfo: {
				quest: {
					name: "controlledUnitary",
					matrix: [[["-1/sqrt(2)", "0"], ["-1/sqrt(2)", "0"]],
							 [["-1/sqrt(2)", "0"], ["1/sqrt(2)", "0"]]]
				},
				cirq: {
					replacement: {
						name: "srn",
						type: "controlled",
						notTfqSupported: true
					}
				},
				quil: {
					name: "csrn",
					defgate: "DEFGATE csrn:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0.5+0.5i, 0.5-0.5i\n    0, 0, 0.5-0.5i, 0.5+0.5i"
				},
				qasm: {
					name: "csx"
				},
				qiskit: {
					name: "csx"
				},
				pyquil: {
					name: "csrn",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]"
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]"
				},
				aqasm: {
					matrix: [[1,0,0,0],[0,1,0,0],[0,0,"0.5+0.5i","0.5-0.5i"],[0,0,"0.5-0.5i","0.5+0.5i"]],
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]"
				},
				cudaq: {
					equivalent: [
						{ name: "h", wires: [1] },
						{ name: "cu1", params: { lambda: "pi/2" }, wires: [0, 1] },
						{ name: "h", wires: [1] }
					]
				},
				quirk: {
					name: "X^½",
					controlQubits: 1,
					targetQubits: 1
				}
			}
		},

		swap: {
			description: "Swaps the state of two qubits.",
			matrix: [
				[1,0,0,0],
				[0,0,1,0],
				[0,1,0,0],
				[0,0,0,1]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["x","x"],
				label: "SWP"
			},
			exportInfo: {
				quil: {
					name: "SWAP"
				},
				cirq: {
					name: "SWAP"
				},
				quest: {
					name: "swap",
					func: "void swap(Qureg qubits, const int q1, const int q2) {\n"+
						  "    controlledNot(qubits, q1, q2);\n" +
						  "    controlledNot(qubits, q2, q1);\n" +
						  "    controlledNot(qubits, q1, q2);\n}"
				},
				qsharp: {
					name: "SWAP"
				},
				quirk: {
					name: "Swap",
					controlQubits: 0,
					targetQubits: 2
				},
				braket: {
					name: "swap"
				},
				aqasm: {
					name: "SWAP"
				},
				ionq: {
					name: "swap"
				},
				cudaq: {
					name: "swap"
				}
			}
		},

		srswap: {
			description: "Square root of swap",
			matrix: [
				[1,0,0,0],
				[0,"0.5 * (1 + i)","0.5 * (1 - i)",0],
				[0,"0.5 * (1 - i)","0.5 * (1 + i)",0],
				[0,0,0,1]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["box","box"],
				label: "&#x221A;SWP"
			},
			exportInfo: {
				quil: {
					name: "srswap",
					defgate: "DEFGATE srswap:\n    1, 0, 0, 0\n    0, 0.5+0.5i, 0.5-0.5i, 0\n    0, 0.5-0.5i, 0.5+0.5i, 0\n    0, 0, 0, 1"
				},
				cirq: {
					name: "SWAP**(1/2)"
				},
				pyquil: {
					name: "srswap",
					array: "[[1,0,0,0],[0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,1]]"
				},
				quest: {
					name: "srswap",
					func: "void srswap(Qureg qubits, const int q1, const int q2) {\n" +
						  "    controlledNot(qubits, q2, q1);\n"+
						  "    rotateY(qubits, q2, M_PI/2);\n"+
						  "    rotateZ(qubits, q2, M_PI/16);\n"+
						  "    controlledNot(qubits, q1, q2);\n"+
						  "    rotateZ(qubits, q1, M_PI/8);\n"+
						  "    rotateZ(qubits, q2, -M_PI/8);\n"+
						  "    controlledNot(qubits, q1, q2);\n"+
						  "    rotateZ(qubits, q2, M_PI/16);\n"+
						  "    rotateY(qubits, q2, -M_PI/2);\n"+
						  "    controlledNot(qubits, q2, q1);\n}"
				},
				qasm: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi/2", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "7*pi/4" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi", lambda: "pi/2" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "-3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "0" }, wires: [1]},
				   ]
				},
				qiskit: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi/2", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "7*pi/4" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi", lambda: "pi/2" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "-3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "0" }, wires: [1]},
					]
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,1]]"
				},
				aqasm: {
					name: "SQRTSWAP"
				},
				cudaq: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi/2", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "7*pi/4" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/4", phi: "-1*pi", lambda: "-1*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi", lambda: "pi/2" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "-3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "pi/2", lambda: "0" }, wires: [1]},
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		iswap: {
			description: "Swaps the state of two qubits, applying a -i phase to q1 when it is in the 1 state and a -i phase to q2 when it is in the 0 state",
			matrix: [
				[1,0,0,0],
				[0,0,"0+i",0],
				[0,"0+i",0,0],
				[0,0,0,1]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["box","box"],
				label: "iSWP"
			},
			exportInfo: {
				quil: {
					name: "ISWAP"
				},
				cirq: {
					name: "ISWAP"
				},
				quest: {
					name: "iSWAP",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "3*pi/2", lambda: "0" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "0" }, wires: [0]},
						{ name: "u3", params: { theta: "pi", phi: "pi/4", lambda: "-1*pi/4" }, wires: [1]}
				   ]
				},
				qiskit: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "3*pi/2", lambda: "0" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "0" }, wires: [0]},
						{ name: "u3", params: { theta: "pi", phi: "pi/4", lambda: "-1*pi/4" }, wires: [1]}
					]
				},
				braket: {
					name: "iswap"
				},
				aqasm: {
					name: "ISWAP"
				},
				cudaq: {
					equivalent: [
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "-1*pi" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "3*pi/2" }, wires: [0]},
						{ name: "u3", params: { theta: "pi/2", phi: "3*pi/2", lambda: "0" }, wires: [1]},
						{ name: "cx", wires: [0, 1]},
						{ name: "u3", params: { theta: "pi/2", phi: "0", lambda: "0" }, wires: [0]},
						{ name: "u3", params: { theta: "pi", phi: "pi/4", lambda: "-1*pi/4" }, wires: [1]}
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		xx: {
			description: "XX gate",
			matrix: [
				["cos(theta)", 0, 0, "-i*sin(theta)"],

				[0, "cos(theta)", "-i*sin(theta)", 0],

				[0, "-i*sin(theta)", "cos(theta)", 0],

				["-i*sin(theta)", 0, 0, "cos(theta)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box","box"],
				label: "XX"
			},
			exportInfo: {
				quil: {
					name: "xx",
					params: ["theta"],
					defgate: "DEFGATE xx(%theta):\n    COS(%theta), 0, 0, -i*SIN(%theta)\n    0, COS(%theta), -i*SIN(%theta), 0\n    0, -i*SIN(%theta), COS(%theta), 0\n    -i*SIN(%theta), 0, 0, COS(%theta)"
				},
				pyquil: {
					name: "xx",
					params: ["theta"],
					array: "[ [quil_cos(p_theta), 0, 0, -1j*quil_sin(p_theta)], [0, quil_cos(p_theta), -1j*quil_sin(p_theta), 0], [0, -1j*quil_sin(p_theta), quil_cos(p_theta), 0], [-1j*quil_sin(p_theta), 0, 0, quil_cos(p_theta)] ]"
				},
				cirq: {
					name: "xx"
				},
				quest: {
					name: "xx",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					name: "rxx"
				},
				qiskit: {
					name: "rxx"
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array: "[[np.cos(p_theta), 0, 0, -1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [-1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]"
				},
				aqasm: {
					matrix: [["cos(theta)", 0, 0, "-i*sin(theta)"],[0, "cos(theta)", "-i*sin(theta)", 0],[0, "-i*sin(theta)", "cos(theta)", 0],["-i*sin(theta)", 0, 0, "cos(theta)"]],
					array: "[[np.cos(p_theta), 0, 0, -1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [-1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]",
					params: ["theta"]
				},
				ionq: {
					name: "xx",
					paramsKey: "phase"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},
		
		yy: {
			description: "YY gate",
			matrix: [
				["cos(theta)", 0, 0, "i*sin(theta)"],

				[0, "cos(theta)", "-i*sin(theta)", 0],

				[0, "-i*sin(theta)", "cos(theta)", 0],

				["i*sin(theta)", 0, 0, "cos(theta)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box","box"],
				label: "YY"
			},
			exportInfo: {
				quil: {
					name: "yy",
					params: ["theta"],
					defgate: "DEFGATE yy(%theta):\n    COS(%theta), 0, 0, i*SIN(%theta)\n    0, COS(%theta), -i*SIN(%theta), 0\n    0, -i*SIN(%theta), COS(%theta), 0\n    i*SIN(%theta), 0, 0, COS(%theta)"
				},
				cirq: {
					name: "YY"
				},
				pyquil: {
					name: "yy",
					params: ["theta"],
					array: "[ [quil_cos(p_theta), 0, 0, 1j*quil_sin(p_theta)], [0, quil_cos(p_theta), -1j*quil_sin(p_theta), 0], [0, -1j*quil_sin(p_theta), quil_cos(p_theta), 0], [1j*quil_sin(p_theta), 0, 0, quil_cos(p_theta)] ]"
				},
				quest: {
					name: "yy",
					//@TODO add function
					func: "TODO"
				},
				braket: {
					name: "yy",
					params: ["theta"]
				},
				aqasm: {
					matrix: [["cos(theta)", 0, 0, "i*sin(theta)"],[0, "cos(theta)", "-i*sin(theta)", 0],[0, "-i*sin(theta)", "cos(theta)", 0],["i*sin(theta)", 0, 0, "cos(theta)"]],
					array: "[[np.cos(p_theta), 0, 0, 1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]",
					params: ["theta"]
				},
				qasm: {
					name: "ryy"
				},
				qiskit: {
					name: "ryy"
				},
				ionq: {
					name: "yy",
					paramsKey: "phase"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		zz: {
			description: "Parametric 2-qubit rotation about ZZ",
			matrix: [
				[ "exp(-i * theta / 2)", 0, 0, 0 ],
				[ 0, "exp(i * theta / 2)", 0, 0  ],
				[ 0, 0, "exp(i * theta / 2)", 0  ],
				[ 0, 0, 0, "exp(-i * theta / 2)" ]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box","box"],
				label: "ZZ"
			},
			exportInfo: {
				quil: {
					name: "zz",
					params: ["theta"],
					defgate: "DEFGATE zz(%theta):\n    EXP(-i * %theta / 2), 0, 0, 0\n    0, EXP(i * %theta / 2), 0, 0\n    0, 0, EXP(i * %theta / 2), 0\n    0, 0, 0, EXP(-i * %theta / 2)"
				},
				pyquil: {
					name: "zz",
					params: ["theta"],
					array: "[ [ quil_exp(-1j * p_theta / 2), 0, 0, 0 ], [ 0, quil_exp(1j * p_theta / 2), 0, 0], [ 0, 0, quil_exp(1j * p_theta / 2), 0 ], [ 0, 0, 0, quil_exp(-1j * p_theta / 2) ] ]"
				},
				quest: {
					name: "zz",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					name: "rzz"
				},
				qiskit: {
					name: "rzz"
				},
				ionq: {
					name: "zz",
					paramsKey: "phase"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		xy: {
			description: "XY gate",
			matrix: [
				[1, 0, 0, 0],
				[0, "cos(phi / 2)", "i * sin(phi / 2)", 0],
				[0, "i * sin(phi / 2)", "cos(phi / 2)", 0],
				[0, 0, 0, 1]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["phi"],
			drawingInfo: {
				connectors: ["box","box"],
				label: "XY"
			},
			exportInfo: {
				quil: {
					name: "XY",
					"params": [
						"phi"
					]
				},
				qasm: {
					equivalent: [
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "-3*pi/4"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/4"}, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [1] },
				   ]
				},
				qiskit: {
					equivalent: [
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "-3*pi/4"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/4"}, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [1] },
					]
				},
				cirq: {
					name: "xy",
					params: ["phi"],
					array: "[[1, 0, 0, 0], [0, np.cos(p_phi/2), 1j*np.sin(p_phi/2), 0], [0, 1j*np.sin(p_phi/2), np.cos(p_phi/2), 0], [0, 0, 0, 1]]",
					notTfqSupported: true
				},
				quest: {
					name: "xy",
					//@TODO add function
					func: "TODO"
				},
				braket: {
					name: "xy",
					params: ["phi"]
				},
				aqasm: {
					matrix: [[1, 0, 0, 0],[0, "cos(phi / 2)", "i * sin(phi / 2)", 0],[0, "i * sin(phi / 2)", "cos(phi / 2)", 0],[0, 0, 0, 1]],
					array: "[[1, 0, 0, 0], [0, np.cos(p_phi/2), 1j*np.sin(p_phi/2), 0], [0, 1j*np.sin(p_phi/2), np.cos(p_phi/2), 0], [0, 0, 0, 1]]",
					params: ["phi"]
				},
				cudaq: {
					equivalent: [
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "-3*pi/4"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "phi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/4"}, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [1] },
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		ms: {
			description: "Mølmer-Sørensen gate",
			matrix: [
				["1/sqrt(2)", 0, 0, "(-i*exp(-i*(phi0+phi1)))/sqrt(2)"],

				[0, "1/sqrt(2)", "(-i*exp(-i*(phi0-phi1)))/sqrt(2)", 0],

				[0, "(-i*exp(i*(phi0-phi1)))/sqrt(2)", "1/sqrt(2)", 0],

				["(-i*exp(i*(phi0+phi1)))/sqrt(2)", 0, 0, "1/sqrt(2)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["phi0", "phi1"],
			drawingInfo: {
				connectors: ["box","box"],
				label: "MS"
			},
			exportInfo: {
				quil: {
					name: "ms",
					params: ["phi0", "phi1"],
					defgate: "DEFGATE ms(%phi0, %phi1):\n    1/SQRT(2), 0, 0, (-i*EXP(-i*(%phi0+%phi1)))/SQRT(2)\n    0, 1/SQRT(2), (-i*EXP(-i*(%phi0-%phi1)))/SQRT(2), 0\n    0, (-i*EXP(i*(%phi0-%phi1)))/SQRT(2), 1/SQRT(2), 0\n    (-i*EXP(i*(%phi0+%phi1)))/SQRT(2), 0, 0, 1/SQRT(2)"
				},
				pyquil: {
					name: "ms",
					params: ["phi0", "phi1"],
					array: "[ [ 1/quil_sqrt(2), 0, 0, (-1j*quil_exp(-1j*(p_phi0+p_phi1)))/quil_sqrt(2) ], [ 0, 1/quil_sqrt(2), (-1j*quil_exp(-1j*(p_phi0-p_phi1)))/quil_sqrt(2), 0 ], [ 0, (-1j*quil_exp(1j*(p_phi0-p_phi1)))/quil_sqrt(2), 1/quil_sqrt(2), 0 ], [ (-1j*quil_exp(1j*(p_phi0+p_phi1)))/quil_sqrt(2), 0, 0, 1/quil_sqrt(2) ] ]"
				},
				cirq: {
					name: "ms"
				},
				quest: {
					name: "ms",
					//@TODO add function
					func: "TODO"
				},
				qasm: {
					name: "ms"
				},
				qiskit: {
					name: "ms"
				},
				braket: {
					name: "unitary",
					params: ["phi0", "phi1"],
					array: "[ [ 1/np.sqrt(2), 0, 0, (-1j*np.exp(-1j*(p_phi0+p_phi1)))/np.sqrt(2) ], [ 0, 1/np.sqrt(2), (-1j*np.exp(-1j*(p_phi0-p_phi1)))/np.sqrt(2), 0 ], [ 0, (-1j*np.exp(1j*(p_phi0-p_phi1)))/np.sqrt(2), 1/np.sqrt(2), 0 ], [ (-1j*np.exp(1j*(p_phi0+p_phi1)))/np.sqrt(2), 0, 0, 1/np.sqrt(2) ] ]"
				},
				aqasm: {
					matrix: [ [ "1/sqrt(2)", 0, 0, "(-1i*exp(-1i*(phi0+phi1)))/sqrt(2)" ], [ 0, "1/sqrt(2)", "(-1i*exp(-1i*(phi0-phi1)))/sqrt(2)", 0 ], [ 0, "(-1i*exp(1i*(phi0-phi1)))/sqrt(2)", "1/sqrt(2)", 0 ], [ "(-1i*exp(1i*(phi0+phi1)))/sqrt(2)", 0, 0, "1/sqrt(2)" ] ],
					array: "[ [ 1/np.sqrt(2), 0, 0, (-1j*np.exp(-1j*(p_phi0+p_phi1)))/np.sqrt(2) ], [ 0, 1/np.sqrt(2), (-1j*np.exp(-1j*(p_phi0-p_phi1)))/np.sqrt(2), 0 ], [ 0, (-1j*np.exp(1j*(p_phi0-p_phi1)))/np.sqrt(2), 1/np.sqrt(2), 0 ], [ (-1j*np.exp(1j*(p_phi0+p_phi1)))/np.sqrt(2), 0, 0, 1/np.sqrt(2) ] ]",
					params: ["phi0", "phi1"]
				},
				ionq: {
					name: "ms",
					paramsKey: "phases"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cr2: {
			description: "Controlled PI/2 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 2)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/2",
				root: "r2"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
					]
				},
				quirk: {
					name: "Z^½",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 2)] ]"
				},
				aqasm: {
					name: "S",
					controlled: true
				},
				cudaq: {
					name: "cs"
				}
			}
		},

		cr4: {
			description: "Controlled PI/4 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 4)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/4",
				root: "r4"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
					]
				},
				quirk: {
					name: "Z^¼",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 4)] ]"
				},
				aqasm: {
					name: "T",
					controlled: true
				},
				cudaq: {
					name: "ct"
				}
			}
		},

		cr8: {
			description: "Controlled PI/8 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 8)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/8",
				root: "r8"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/8"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/8" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/8" }}
				   ]
				},
				quirk: {
					name: "Z^⅛",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 8)] ]"
				},
				aqasm: {
					matrix: [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,"exp(i * pi / 8)"]],
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 8)] ]"
				},
				cudaq: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/8" }}
				   ]
				},
			}
		},

		crx: {
			description: "Controlled rotation around the X-axis by given angle",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "-i * sin(theta / 2)" ],
				[ 0, 0, "-i * sin(theta / 2)", "cos(theta / 2)" ]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "RX",
				root: "rx"
			},
			exportInfo: {
				quil: {
					name: "crx",
					params: ["theta"],
					defgate: "DEFGATE crx(%theta):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -i*SIN(%theta/2)\n    0, 0, -i*SIN(%theta/2), COS(%theta/2)"
				},
				cirq: {
					replacement: {
						name: "rx",
						params: { theta: "theta" },
						type: "controlled",
						notTfqSupported: true
					}
				},
				pyquil: {
					name: "crx",
					params: ["theta"],
					array: "[[ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, quil_cos(p_theta / 2), -1j*quil_sin(p_theta / 2) ], [ 0, 0, -1j*quil_sin(p_theta / 2), quil_cos(p_theta / 2) ]]"
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta"],
					matrix: [[["cos(theta/2)", "0"], ["0", "-sin(theta/2)"]],
							 [["0", "-sin(theta/2)"], ["cos(theta/2)", "0"]]]
				},
				qsharp: {
					name: "Controlled Rx",
					params: ["theta"]
				},
				qasm: {
					replacement: [
						{ name: "cu3", params: { theta: "theta", phi: "-1*pi/2", lambda: "pi/2" }},
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu3", params: { theta: "theta", phi: "-1*pi/2", lambda: "pi/2" }},
					]
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array: "[[ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, np.cos(p_theta / 2), -1j*np.sin(p_theta / 2) ], [ 0, 0, -1j*np.sin(p_theta / 2), np.cos(p_theta / 2) ]]"
				},
				aqasm: {
					name: "RX",
					controlled: true
				},
				cudaq: {
					name: "crx"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cry: {
			description: "Controlled rotation around the Y-axis by given angle",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "-1 * sin(theta / 2)" ],
				[ 0, 0, "sin(theta / 2)", "cos(theta / 2)" ]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "RY",
				root: "ry"
			},
			exportInfo: {
				quil: {
					name: "cry",
					params: ["theta"],
					defgate: "DEFGATE cry(%theta):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -1*SIN(%theta/2)\n    0, 0, SIN(%theta/2), COS(%theta/2)"
				},
				cirq: {
					replacement: {
						name: "ry",
						params: { theta: "theta" },
						type: "controlled",
						notTfqSupported: true
					}
				},
				pyquil: {
					name: "cry",
					params: ["theta"],
					array: "[[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, quil_cos(p_theta / 2), -1*quil_sin(p_theta / 2) ],[ 0, 0, quil_sin(p_theta / 2), quil_cos(p_theta / 2) ]]"
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta"],
					matrix: [[["cos(theta/2)", "0"], ["-sin(theta/2)", "0"]],
							 [["sin(theta/2)", "0"], ["cos(theta/2)", "0"]]]
				},
				qsharp: {
					name: "Controlled Ry",
					params: ["theta"]
				},
				qasm: {
					equivalent: [
						{ name: "u3", params: { theta: "theta/2", phi: "0", lambda: "0" }, wires: [1] },
						{ name: "cx", wires: [0, 1] },
						{ name: "u3", params: { theta: "-1*theta / 2", phi: "0", lambda: "0" }, wires: [1] },
						{ name: "cx", wires: [0, 1] }
					]
				},
				qiskit: {
					equivalent: [
						{ name: "u3", params: { theta: "theta/2", phi: "0", lambda: "0" }, wires: [1] },
						{ name: "cx", wires: [0, 1] },
						{ name: "u3", params: { theta: "-1*theta / 2", phi: "0", lambda: "0" }, wires: [1] },
						{ name: "cx", wires: [0, 1] }
					]
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array: "[[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, np.cos(p_theta / 2), -1*np.sin(p_theta / 2) ],[ 0, 0, np.sin(p_theta / 2), np.cos(p_theta / 2) ]]"
				},
				aqasm: {
					name: "RY",
					controlled: true
				},
				cudaq: {
					name: "cry"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		crz: {
			description: "Controlled rotation around the Z-axis by given angle",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0, 0, "cos(phi / 2) - i * sin(phi / 2)", 0],
				[0, 0, 0, "cos(phi / 2) + i * sin(phi / 2)"]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["phi"],
			drawingInfo: {
				connectors: ["dot","dot"],
				label: "RZ",
				root: "rz"
			},
			exportInfo: {
				quil: {
					name: "crz",
					params: ["phi"],
					defgate: "DEFGATE crz(%phi):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%phi / 2) - i * SIN(%phi / 2), 0\n    0, 0, 0, COS(%phi / 2) + i * SIN(%phi / 2)"
				},
				pyquil: {
					name: "crz",
					params: ["phi"],
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, quil_cos(p_phi / 2) - 1j * quil_sin(p_phi / 2), 0], [0, 0, 0, quil_cos(p_phi / 2) + 1j * quil_sin(p_phi / 2)]]"
				},
				cirq: {
					replacement: {
						name: "rz",
						params: { phi: "phi" },
						type: "controlled"
					}
				},
				quest: {
					name: "controlledRotateZ",
					params: ["theta"]
				},
				qsharp: {
					name: "Controlled Rz",
					params: ["phi"]
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, np.cos(p_phi / 2) - 1j * np.sin(p_phi / 2), 0], [0, 0, 0, np.cos(p_phi / 2) + 1j * np.sin(p_phi / 2)]]"
				},
				aqasm: {
					name: "RZ",
					controlled: true
				},
				cudaq: {
					name: "crz"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cu1: {
			description: "Controlled rotation about the Z axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * lambda)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU1",
				root: "u1"
			},
			exportInfo: {
				quil: {
					name: "CPHASE",
					params: ["lambda"]
				},
				cirq: {
					name: "cu1",
					params: ["lambda"],
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j*p_lambda)]]",
					notTfqSupported: true
				},
				quest: {
					name: "controlledPhaseShift",
					params: ["theta"]
				},
				braket: {
					name: "unitary",
					params: ["lambda"],
					array: "[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j*p_lambda)]]"
				},
				aqasm: {
					name: "PH",
					controlled: true
				},
				qiskit: {
					name: "cp"
				},
				cudaq: {
					replacement: [
						{ name: "cu3", params: { theta: 0, phi: 0, lambda: "lambda" } }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cu2: {
			description: "Controlled rotation about the X+Z axis",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)" ],
				[ 0, 0, "exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)" ]
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["phi", "lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU2",
				root: "u2"
			},
			exportInfo: {
				quil: {
					name: "cu2",
					params: ["phi", "lambda"],
					defgate: "DEFGATE cu2(%phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 1/SQRT(2), -1*EXP(i*%lambda)*1/SQRT(2)\n    0, 0, EXP(i*%phi)*1/SQRT(2), EXP(i*%lambda + i*%phi)*1/SQRT(2)"
				},
				pyquil: {
					name: "cu2",
					params: ["phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/quil_sqrt(2), -quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[0, 0, quil_exp(1j*p_phi)*1/quil_sqrt(2), quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]"
				},
				cirq: {
					name: "cu2",
					params: ["phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					notTfqSupported: true
				},
				quest: {
					name: "controlledUnitary",
					params: ["phi", "lambda"],
					matrix: [[["1/sqrt(2)", "0"], ["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"]],
							 [["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"], ["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"]]]
				},
				qasm: {
					replacement: [
						{ name: "cu3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" } }
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" } }
					]
				},
				braket: {
					name: "unitary",
					params: ["phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
				},
				aqasm: {
					matrix: [[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, "1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)" ],[ 0, 0, "exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)" ]],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					params: ["phi", "lambda"]
				},
				cudaq: {
					replacement: [
						{ name: "cu3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" } }
					]
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cu3: {
			description: "Controlled rotation gate with 3 Euler angles",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)" ],
				[ 0, 0, "exp(i * phi) * sin(theta / 2)", "exp(i * lambda + i * phi) * cos(theta / 2)" ]
			],
			numTargetQubits: 1,
			numControlQubits: 1,

			params: ["theta", "phi", "lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU3",
				root: "u3"
			},
			exportInfo: {
				quil: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					defgate: "DEFGATE cu3(%theta, %phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -1*EXP(i*%lambda)*SIN(%theta/2)\n    0, 0, EXP(i*%phi)*SIN(%theta/2), EXP(i*%lambda + i*%phi)*COS(%theta/2)"
				},
				pyquil: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[0, 0, quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]"
				},
				cirq: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					notTfqSupported: true
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta", "phi", "lambda"],
					matrix: [[["cos(theta/2)", "0"], ["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"]],
							 [["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"], ["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"]]]
				},
				braket: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
				},
				aqasm: {
					matrix: [[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)" ],[ 0, 0, "exp(i * phi) * sin(theta / 2)", "exp(i * lambda + i * phi) * cos(theta / 2)" ]],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					params: ["theta", "phi", "lambda"]
				},
				qiskit: {
					name: "cu"
				},
				cudaq: {
					controlled: true,
					name: "u3",
					controlWiresCount: 1
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 2
				}
			}
		},

		cs: {
			description: "Controlled PI/2 rotation over Z-axis (synonym for `cr2`)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"i"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "S",
				root: "s"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
				   ]
				},
				quirk: {
					name: "Z^½",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(1j * np.pi / 2)]]",
				},
				aqasm: {
					name: "S",
					controlled: true
				},
				cudaq: {
					name: "cs"
				}
			}
		},

		ct: {
			description: "Controlled PI/4 rotation over Z-axis (synonym for `cr4`)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 4)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "T",
				root: "t"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
				   ]
				},
				quirk: {
					name: "Z^¼",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(1j * np.pi / 4)]]",
				},
				aqasm: {
					name: "T",
					controlled: true
				},
				cudaq: {
					name: "ct"
				}
			}
		},

		csdg: {
			description: "Controlled (-PI/2) rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"-i"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "S&#8224;",
				root: "sdg"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"-M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "-1*pi/2" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "-1*pi/2" }}
				   ]
				},
				quirk: {
					name: "Z^-½",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(-1j * np.pi / 2)]]",
				},
				aqasm: {
					name: "S",
					controlled: true,
					dagger: true
				},
				cudaq: {
					equivalent: [
						{ name: "cu3", params: { theta: 0, phi: 0, lambda: "-pi/2" }, wires: [0, 1] }
					]
				}
			}
		},

		ctdg: {
			description: "Controlled (-PI/4) rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(-i * pi / 4)"]
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "T&#8224;",
				root: "tdg"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"-M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "-1*pi/4" }}
				   ]
				},
				qiskit: {
					replacement: [
						{ name: "cu1", params: { lambda: "-1*pi/4" }}
				   ]
				},
				quirk: {
					name: "Z^-¼",
					controlQubits: 1,
					targetQubits: 1
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(-1j * np.pi / 4)]]",
				},
				aqasm: {
					name: "T",
					controlled: true,
					dagger: true
				},
				cudaq: {
					equivalent: [
						{ name: "cu3", params: { theta: 0, phi: 0, lambda: "-pi/4" }, wires: [0, 1] }
					]
				}
			}
		},

		ccx: {
			description: "Toffoli aka \"CCNOT\" gate",
			matrix: [
				[1,0,0,0,0,0,0,0],
				[0,1,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,0],
				[0,0,0,1,0,0,0,0],
				[0,0,0,0,1,0,0,0],
				[0,0,0,0,0,1,0,0],
				[0,0,0,0,0,0,0,1],
				[0,0,0,0,0,0,1,0]
			],
			numTargetQubits: 1,
			numControlQubits: 2,
			params: [],
			drawingInfo: {
				connectors: ["dot","dot","not"],
				label: "CCNOT",
				root: "x"
			},
			exportInfo: {
				quil: {
					name: "CCNOT"
				},
				cirq: {
					name: "CCX",
					notTfqSupported: true
				},
				quest: {
					name: "ccx",
					func: "void ccx(Qureg qubits, const int q1, const int q2, const int q3) {\n"+
						  "    hadamard(qubits, q3);\n"+
						  "    controlledNot(qubits, q2, q3);\n"+
						  "    phaseShift(qubits, q3, -M_PI/4);\n"+
						  "    controlledNot(qubits, q1, q3);\n"+
						  "    tGate(qubits, q3);\n"+
						  "    controlledNot(qubits, q2, q3);\n"+
						  "    phaseShift(qubits, q3, -M_PI/4);\n"+
						  "    controlledNot(qubits, q1, q3);\n"+
						  "    tGate(qubits, q2);\n"+
						  "    tGate(qubits, q3);\n"+
						  "    controlledNot(qubits, q1, q2);\n"+
						  "    hadamard(qubits, q3);\n"+
						  "    tGate(qubits, q1);\n"+
						  "    phaseShift(qubits, q2, -M_PI/4);\n"+
						  "    controlledNot(qubits, q1, q2);\n}"
				},
				qsharp: {
					name: "CCNOT"
				},
				quirk: {
					name: "X",
					controlQubits: 2,
					targetQubits: 1
				},
				braket: {
					name: "ccnot"
				},
				aqasm: {
					name: "CCNOT"
				},
				cudaq: {
					name: "x",
					controlled: true,
					controlWiresCount: 2
				}
			}
		},

		cswap: {
			description: "Controlled swap aka \"Fredkin\" gate",
			matrix: [
				[1,0,0,0,0,0,0,0],
				[0,1,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,0],
				[0,0,0,1,0,0,0,0],
				[0,0,0,0,1,0,0,0],
				[0,0,0,0,0,0,1,0],
				[0,0,0,0,0,1,0,0],
				[0,0,0,0,0,0,0,1]
			],
			numTargetQubits: 2,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","x","x"],
				label: "SWP",
				root: "swap"
			},
			exportInfo: {
				cirq: {
					name: "CSWAP"
				},
				quest: {
					name: "cswap",
					func: "void cswap(Qureg qubits, const int q1, const int q2, const int q3) {\n"+
						  "    controlledNot(qubits, q3, q2);\n"+
						  "    hadamard(qubits, q3);\n"+
						  "    controlledNot(qubits, q2, q3);\n"+
						  "    phaseShift(qubits, q3, -M_PI/4);\n"+
						  "    controlledNot(qubits, q1, q3);\n"+
						  "    tGate(qubits, q3);\n"+
						  "    controlledNot(qubits, q2, q3);\n"+
						  "    phaseShift(qubits, q3, -M_PI/4);\n"+
						  "    controlledNot(qubits, q1, q3);\n"+
						  "    tGate(qubits, q2);\n"+
						  "    tGate(qubits, q3);\n"+
						  "    hadamard(qubits, q3);\n"+
						  "    controlledNot(qubits, q1, q2);\n"+
						  "    tGate(qubits, q1);\n"+
						  "    phaseShift(qubits, q2, -M_PI/4);\n"+
						  "    controlledNot(qubits, q2, q3);\n"+
						  "    controlledNot(qubits, q3, q2);\n}"
				},
				qsharp: {
					name: "Controlled SWAP"
				},
				quil: {
					name: "CSWAP"
				},
				pyquil: {
					name: "CSWAP"
				},
				quirk: {
					name: "Swap",
					controlQubits: 1,
					targetQubits: 2
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0,0,0,0,0], [0,1,0,0,0,0,0,0], [0,0,1,0,0,0,0,0], [0,0,0,1,0,0,0,0], [0,0,0,0,1,0,0,0], [0,0,0,0,0,0,1,0], [0,0,0,0,0,1,0,0], [0,0,0,0,0,0,0,1]]"
				},
				aqasm: {
					name: "SWAP",
					controlled: true
				},
				cudaq: {
					name: "swap",
					controlled: true,
					controlWiresCount: 1
				}
			}
		},

		csrswap: {
			description: "Controlled square root of swap",
			matrix: [
				[1,0,0,0,0,0,0,0],
				[0,1,0,0,0,0,0,0],
				[0,0,1,0,0,0,0,0],
				[0,0,0,1,0,0,0,0],
				[0,0,0,0,1,0,0,0],
				[0,0,0,0,0,"0.5 * (1 + i)","0.5 * (1 - i)",0],
				[0,0,0,0,0,"0.5 * (1 - i)","0.5 * (1 + i)",0],
				[0,0,0,0,0,0,0,1]
			],
			numTargetQubits: 2,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot","box","box"],
				label: "&#x221A;SWP",
				root: "srswap"
			},
			exportInfo: {
				quest: {
					name: "csrswap",
					//@TODO add function
					func: "TODO"
				},
				cirq: {
					replacement: {
						name: "srswap",
						type: "controlled",
						notTfqSupported: true
					}
				},
				quil: {
					name: "csrswap",					
					defgate: "DEFGATE csrswap:\n    1, 0, 0, 0, 0, 0, 0, 0\n    0, 1, 0, 0, 0, 0, 0, 0\n    0, 0, 1, 0, 0, 0, 0, 0\n    0, 0, 0, 1, 0, 0, 0, 0\n    0, 0, 0, 0, 1, 0, 0, 0\n    0, 0, 0, 0, 0, 0.5+0.5i, 0.5-0.5i, 0\n    0, 0, 0, 0, 0, 0.5-0.5i, 0.5+0.5i, 0\n    0, 0, 0, 0, 0, 0, 0, 1"
				},
				pyquil: {
					name: "csrswap",
					array: "[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]"
				},
				braket: {
					name: "unitary",
					array: "[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]"
				},
				aqasm: {
					name: "SQRTSWAP",
					controlled: true
				},
				cudaq: {
					name: "csrswap",
					matrix: "[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]"
				},
				quirk: {
					controlQubits: 0,
					targetQubits: 3
				}
			}
		},

		reset: {
			description: "Resets qubit",
			matrix: [],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "RST"
			},
			exportInfo: {
				quil: {
					name: "RESET"
				},
				cirq: {
					name: "reset",
					notTfqSupported: true
				},
				quest: {
					name: "reset",
					//@TODO add function
					func: "TODO"
				},
				qsharp: {
					name: "Reset"
				},
				cudaq: {
					name: "reset"
				},
				quirk: {
					name: "|0⟩⟨0|",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		measure: {
			description: "Measures qubit and stores outcome (0 or 1) into classical register",
			matrix: [],
			params: [],
			drawingInfo: {
				connectors: ["gauge"],
				label: ""
			},
			exportInfo: {
				quil: {
					name: "MEASURE"
				},
				cirq: {
					name: "measure"
				},
				quest: {
					name: "measure"
				},
				qsharp: {
					name: "M"
				},
				cudaq: {
					name: "mz"
				},
				quirk: {
					name: "Measure",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		},

		barrier: {
			description: "Barrier",
			matrix: [],
			params: [],
			drawingInfo: {
				connectors: ["barrier"],
				label: "BAR"
			},
			exportInfo: {
				quil: {
					name: "FENCE"
				},
				quest: {
					name: "barrier",
					//@TODO add function
					func: "TODO"
				},
				quirk: {
					name: "…",
					controlQubits: 0,
					targetQubits: 1
				}
			}
		}
	};

	this.init(numQubits);
};

QuantumCircuit.prototype.defaultHybridOptions = function() {
	return {
		optimizer: "Powell",
		tolerance: 0.001,
		costFunction: {
			python: "",
			javascript: ""
		}
	};
};

QuantumCircuit.prototype.defaultEncoderDecoderOptions = function() {
	return {
		functionName: "",
		inputEncoding: {
			type: "custom",
			customFunction: {
				python: "def custom_encoder(input_data_row, input_encoding):\n    qasm = \"\"\n    qasm += \"OPENQASM 2.0;\\n\"\n    qasm += \"include \\\"qelib1.inc\\\";\\n\"\n\n    # ...\n\n    return qasm\n",
				javascript: "function customEncoder(inputDataRow, inputEncoding) {\n    let qasm = \"\";\n    qasm += \"OPENQASM 2.0;\\n\";\n    qasm += \"include \\\"qelib1.inc\\\";\\n\";\n    \n    // ...\n    \n    return qasm;\n}\n"
			},
			qubitOffset: 0,
			colDefs: [
			],
			data: [
			]
		},
		outputDecoding: {
			type: "custom",
			customFunction: {
				python: "def custom_decoder(counts, output_decoding):\n    output_data_row = {}\n\n    # ...\n    \n    return output_data_row\n",
				javascript: "function customDecoder(counts, outputDecoding) {\n    outputDataRow = {};\n    \n    // ...\n    \n    return outputDataRow;\n}\n"
			},
			qubitOffset: 0,
			colDefs: [
			]
		}
	};
};

QuantumCircuit.prototype.init = function(numQubits, options) {
	options = options || {};

	this.numQubits = numQubits || 1;
	this.gates = [];
	this.partitionMap = [];
	this.partitionCount = 0;
	this.partitionInfo = {};

	this.params = [];
	this.options = {
		params: {},

		hybrid: false,
		hybridOptions: this.defaultHybridOptions(),

		encoderDecoder: false,
		encoderDecoderOptions: this.defaultEncoderDecoderOptions()
	};

	if(!options.keepCustomGates) {
		this.customGates = {};
	}

	this.cregs = {};
	this.collapsed = [];
	this.prob = [];
	this.measureResetsQubit = false;
	this.reverseBitOrder = false;

	this.lastRunArguments = { initialValues: null, options: null };

	this.clear();
};

QuantumCircuit.prototype.clearGates = function() {
	this.gates = [];
	for(var i = 0; i < this.numQubits; i++) {
		this.gates.push([]);
	}
};

QuantumCircuit.prototype.clear = function() {
	this.clearGates();
	this.initState();
};


QuantumCircuit.prototype.resetState = function() {
	// reset state
	this.state = {};
	this.stateBits = 0;
	this.partitionCache = {};

	// reset cregs
	for(var creg in this.cregs) {
		var len = this.cregs[creg].length || 0;
		this.cregs[creg] = [];
		for(var i = 0; i < len; i++) {
			this.cregs[creg].push(0);
		}
	}

	// reset measurement
	this.collapsed = [];
	this.prob = [];

	// reset statistics
	this.stats = {
		duration: 0
	};
};

QuantumCircuit.prototype.initState = function() {
	this.resetState();
	this.state["0"] = math.complex(1, 0);
};

QuantumCircuit.prototype.formatComplex = function(complex, options) {
	return formatComplex2(complex.re, complex.im, options);
};

QuantumCircuit.prototype.multiplySquareMatrices = function(m1, m2) {
	var len = m1.length;

	var c = len;
	var d = len;
	var k = len;

	var res = [];
	while(c--) {
		res[c] = [];
		d = len;
		while(d--) {
			res[c][d] = 0;
			k = len;
			while(k--) {
				if(m1[c][k] && m2[k][d]) {
					if(res[c][d]) {
						res[c][d] = math.add(res[c][d], math.multiply(m1[c][k], m2[k][d]));
					} else {
						res[c][d] = math.multiply(m1[c][k], m2[k][d]);
					}
				}
			}
		}
	}
	return res;
};

QuantumCircuit.prototype.isIdentityMatrix = function(m, precision) {
	if(typeof precision == "undefined") {
		precision = 14;
	}

	for(var i = 0; i < m.length; i++) {
		for(var j = 0; j < m.length; j++) {
			if(math.round(m[i][j], precision) != (i == j ? 1 : 0)) {
				return false;
			}
		}
	}
	return true;
}

QuantumCircuit.prototype.isUnitaryMatrix = function(U, precision) {
	return this.isIdentityMatrix(math.multiply(U, math.ctranspose(U)), precision);
};


QuantumCircuit.prototype.isHermitianMatrix = function(H, precision) {
	var diff = this.matrixDiff(H, math.ctranspose(H))

	return diff <= math.pow(10, -1 * (precision || 14));
};


QuantumCircuit.prototype.matrixDiff = function(matrix1, matrix2) {
	var total = 0;
	var count = 0;
	for(var r = 0; r < matrix1.length; r++) {
		var row1 = matrix1[r];
		var row2 = matrix2[r];
		for(var c = 0; c < row1.length; c++) {
			var item1 = row1[c];
			var item2 = row2[c];

			var i1 = (typeof item1 == "object") ? item1 : math.complex(item1);
			var i2 = (typeof item2 == "object") ? item2 : math.complex(item2);

			// distance in the complex plane
			var distance = math.abs(math.subtract(i1, i2));

			total += distance;

			count++;
		}
	}

	var diff = count ? (total / count) : 0;

	return diff;
};


//
// Extract variables from expression string and returns object with expression string and array of variable names
// Note that symbol "j" is automatically converted to "i" (imaginary unit used in python is "j" but we need "i")
//
QuantumCircuit.prototype.parseMathString = function(str) {
	var variables = [];

	// convert imaginary unit "j" to "i"
	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			if(node.name == "j") {
				return "i";
			}

			if(variables.indexOf(node.name) < 0) {
				variables.push(node.name);
			}
		}
	};

	var node = math.parse(str.replace(/[\t\n\r]/gm, ""));

	var expression = node.toString({ handler: mathToStringHandler });

	return {
		expression: expression,
		variables: variables,
		node: node
	};
};

//
// Evaluate expression
//
QuantumCircuit.prototype.evalMathString = function(str, vars) {
	vars = vars || {};

	var parsed = this.parseMathString(str);

	var res = math.evaluate(parsed.expression, vars);
	if(res instanceof math.Matrix) {
		return res.toArray();
	}

	return res;
};

QuantumCircuit.prototype.parseMatrix = function(M, vars) {
	var self = this;

	var A = null;
	if(typeof M == "string") {
		A = self.evalMathString(M, vars);
	} else {
		A = M;
	}

	var res = [];

	A.map(function(row, rowIndex) {
		if(Array.isArray(row)) {
			res.push([]);
			row.map(function(val, colIndex) {
				if(typeof val == "string") {
					res[rowIndex].push(self.evalMathString(val, vars));
				} else {
					res[rowIndex].push(val);
				}
			});
		} else {
			if(typeof row == "string") {
				res.push(self.evalMathString(row, vars));
			} else {
				res.push(row);
			}
		}
	});

	return res;
};

QuantumCircuit.prototype.matrixHasComplexElement = function(M) {
	for(var r = 0; r < M.length; r++) {
		var row = M[r];

		if(row instanceof Array) {
			for(var c = 0; c < row.length; c++) {
				var cell = row[c];

				if(cell instanceof math.Complex || ((typeof cell == "object") && ((cell.mathjs && cell.mathjs == "Complex") || (cell.type && cell.type == "Complex")))) {
					return true;
				}
			}
		} else {
			if(row instanceof math.Complex || ((typeof row == "object") && ((row.mathjs && row.mathjs == "Complex") || (row.type && row.type == "Complex")))) {
				return true;
			}
		}
	}
	return false;
};

// ---
// Convert complex elements with zero imaginary part to real number datatype
// Warning! Modifies matrix in-place
// ---
QuantumCircuit.prototype.matrixZeroImagToReal = function(M) {
	for(var r = 0; r < M.length; r++) {
		var row = M[r];

		if(row instanceof Array) {
			for(var c = 0; c < row.length; c++) {
				var cell = row[c];

				if(cell instanceof math.Complex || ((typeof cell == "object") && ((cell.mathjs && cell.mathjs == "Complex") || (cell.type && cell.type == "Complex")))) {
					if(math.im(cell) == 0) {
						M[r][c] = math.re(cell);
					}
				}
			}
		} else {
			if(row instanceof math.Complex || ((typeof row == "object") && ((row.mathjs && row.mathjs == "Complex") || (row.type && row.type == "Complex")))) {
				if(math.im(row) == 0) {
					M[r] = math.re(row);
				}
			}
		}
	}
	return M;
};


//
// Options: {
//     minify:           false
//	   fixedWidth:       false
//     decimalPlaces:    14,
//     iotaChar:         "i"
// }
//
QuantumCircuit.prototype.stringifyMatrix = function(M, options) {
	var self = this;

	// mathjs Matrix to array
	var A = M.toArray ? M.toArray() : M;

	options = options || {};

	var forceComplex = false;
	if(options.fixedWidth) {
		// forceComplex if matrix has at least one complex element
		forceComplex = this.matrixHasComplexElement(A);
	}

	var str = "";
	str += "[";
	A.map(function(row, rowIndex) {
		if(rowIndex > 0) {
			str += ",";
		}
		if(!options.minify) {
			str += "\n  ";
		} else {
			str += " ";
		}

		if(row instanceof Array) {
			str += "[";
			row.map(function(el, elIndex) {
				if(elIndex > 0) {
					str += ", ";
				}
				if(el instanceof math.Complex) {
					str += self.formatComplex(el, options);
				} else {
					if((typeof el == "object") && ((el.mathjs && el.mathjs == "Complex") || (el.type && el.type == "Complex"))) {
						str += formatComplex2(el.re, el.im, options);
					} else {
						if(typeof el == "string") {
							// expression
							str += el;
						} else {
							if(forceComplex) {
								str += formatComplex2(el, 0, options);
							} else {
								str += formatFloat(el, options);
							}
						}						
					}
				}
			});
			str += "]";
		} else {
			if(row instanceof math.Complex) {
				str += self.formatComplex(row, options);
			} else {
				if((typeof row == "object") && ((row.mathjs && row.mathjs == "Complex") || (row.type && row.type == "Complex"))) {
					str += formatComplex2(row.re, row.im, options);
				} else {
					if(typeof row == "string") {
						// expression
						str += row;
					} else {
						if(forceComplex) {
							str += formatComplex2(row, 0, options);
						} else {
							str += formatFloat(row, options);
						}
					}
				}
			}
		}
	});
	if(A.length) {
		if(!options.minify) {
			str += "\n";
		} else {
			str += " ";
		}
	}
	str += "]";

	return str;
};


QuantumCircuit.prototype.matrixRe = function(U) {
	var res = [];
	for(var r = 0; r < U.length; r++) {
		var row = U[r];
		if(Array.isArray(row)) {
			var newRow = [];
			for(var c = 0; c < row.length; c++) {
				if(typeof row[c] == "object") {
					newRow.push(row[c].re);
				} else {
					newRow.push(row[c]);
				}
			}
			res.push(newRow);
		} else {
			if(typeof row == "object") {
				newRow.push(row.re);
			} else {
				newRow.push(row);
			}
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixIm = function(U) {
	var res = [];
	for(var r = 0; r < U.length; r++) {
		var row = U[r];
		if(Array.isArray(row)) {
			var newRow = [];
			for(var c = 0; c < row.length; c++) {
				if(typeof row[c] == "object") {
					newRow.push(row[c].im);
				} else {
					newRow.push(0);
				}
			}
			res.push(newRow);
		} else {
			if(typeof row == "object") {
				newRow.push(row.im);
			} else {
				newRow.push(0);
			}
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixAbs = function(U) {
	var res = [];
	for(var r = 0; r < U.length; r++) {
		var row = U[r];
		if(Array.isArray(row)) {
			var newRow = [];
			for(var c = 0; c < row.length; c++) {
				newRow.push(math.abs(row[c]));
			}
			res.push(newRow);
		} else {
			res.push(math.abs(row));
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixArg = function(U) {
	var res = [];
	for(var r = 0; r < U.length; r++) {
		var row = U[r];
		if(Array.isArray(row)) {
			var newRow = [];
			for(var c = 0; c < row.length; c++) {
				newRow.push(math.arg(row[c]));
			}
			res.push(newRow);
		} else {
			res.push(math.arg(row));
		}
	}

	return res;
};


//
// combineList is array of objects:
//
// {
//     circuit: <QuantumCircuit>
//     wires: [0, 1, 2] // array of destination qubits (for each wire in given circuit)
// }
//

QuantumCircuit.prototype.setCombinedState = function(combineList) {
	var newState = {};
	var newStateBits = 0;
	var totalQubits = 0;
	for(var itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
		var item = combineList[itemIndex];
		// calculate number of qubits based on wireMap
		item.wires.map(function(dest) {
			if(dest + 1 > totalQubits) {
				totalQubits = dest + 1;
			}
		});
	}

	var bitMaps = [];
	for(var itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
		var item = combineList[itemIndex];

		var cmap = [];
		item.wires.map(function(dest, source) {
			cmap.push({
				and: 1 << ((totalQubits - 1) - dest),
				or: 1 << ((item.circuit.numQubits - 1) - source)
			});
		});

		bitMaps.push(cmap);
	}

	var n3 = 1 << totalQubits;
	for(var a3 = 0; a3 < n3; a3++) {
		var s3 = null;
		for(var itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
			var map = bitMaps[itemIndex];

			var a1 = 0;
			for(var i = 0; i < map.length; i++) {
				if(a3 & map[i].and) {
					a1 |= map[i].or;
				}
			}

			var item = combineList[itemIndex];
			var s1 = item.circuit.state[a1];
			if(s1) {
				if(s3 == null) {
					s3 = s1;
				} else {
					s3 = math.multiply(s1, s3);
				}
			} else {
				s3 = math.complex(0, 0);
			}
		}

		if(s3 && (s3.re || s3.im)) {
			newState[a3] = s3;
			newStateBits |= a3;
		}
	}

	this.resetState();
	// expand circuit if needed
	if(this.numQubits < totalQubits) {
		this.numQubits = totalQubits;

		while(this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		var numCols = this.numCols();
		for(var i = 0; i < this.gates.length; i++) {
			while(this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	this.state = newState;
	this.stateBits = newStateBits;

	if(this.stateBits == 0 && Object.keys(this.state).length == 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

//
// Combines state vectors of two evaluated circuits and stores resulting vector into this.
//
QuantumCircuit.prototype._setCombinedState = function(c1, c2, options) {
	options = options || {};

	var q1 = c1.numQubits;
	var q2 = c2.numQubits;

	// create wireMap if not provided
	if(!options.wireMap) {
		options.wireMap = {
			c1: [],
			c2: []
		}

		for(var i = 0; i < q1; i++) {
			options.wireMap.c1.push(i);
		}

		for(var i = 0; i < q2; i++) {
			options.wireMap.c2.push(i + q1);
		}
	}

	// calculate number of qubits based on wireMap
	var q3 = 0;
	options.wireMap.c1.map(function(dest) {
		if(dest + 1 > q3) {
			q3 = dest + 1;
		}
	});
	options.wireMap.c2.map(function(dest) {
		if(dest + 1 > q3) {
			q3 = dest + 1;
		}
	});

	// create bit map for circuit 1
	var c1map = [];
	options.wireMap.c1.map(function(dest, source) {
		c1map.push({ and: 1 << ((q3 - 1) - dest), or: 1 << ((q1 - 1) - source) });
	});

	// create bit map for circuit 2
	var c2map = [];
	options.wireMap.c2.map(function(dest, source) {
		c2map.push({ and: 1 << ((q3 - 1) - dest), or: 1 << ((q2 - 1) - source) });
	});

	var unused = 0;
	for(var i = 0; i < q3; i++) {
		if(options.wireMap.c1.indexOf(i) < 0 && options.wireMap.c2.indexOf(i) < 0) {
			unused |= 1 << ((q3 - 1) - i);
		}
	}

	var newState = {};
	var newStateBits = 0;

	var n3 = 1 << q3;
	for(var a3 = 0; a3 < n3; a3++) {
		if(!(a3 & unused)) {
			var a1 = 0;
			for(var i = 0; i < c1map.length; i++) {
				if(a3 & c1map[i].and) a1 |= c1map[i].or;
			}

			var a2 = 0;
			for(var i = 0; i < c2map.length; i++) {
				if(a3 & c2map[i].and) a2 |= c2map[i].or;
			}

			var s1 = c1.state[a1];
			if(s1) {
				var s2 = c2.state[a2];
				if(s2) {
					var s3 = math.multiply(s1, s2);
					if(s3.re || s3.im) {
						newState[a3] = s3;
						newStateBits |= a3;
					}
				}
			}
		}
	}

	this.resetState();
	// expand circuit if needed
	if(this.numQubits < q3) {
		this.numQubits = q3;

		while(this.gates.length < this.numQubits) {
			this.gates.push([]);
		}
		var numCols = this.numCols();
		for(var i = 0; i < this.gates.length; i++) {
			while(this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	this.state = newState;
	this.stateBits = newStateBits;

	if(this.stateBits == 0 && Object.keys(this.state).length == 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

// Add qubits preserving state
QuantumCircuit.prototype.appendQubits = function(numQubits) {
	var c = new QuantumCircuit(numQubits);
	this._setCombinedState(this, c);
};

QuantumCircuit.prototype.numAmplitudes = function(onlyPossible) {
	if(onlyPossible) {
		var possibleCount = 0;
		for(var is in this.state) {
			var state = math.round(this.state[is], 14);
			if(state.re || state.im) {
				possibleCount++;
			}
		}
		return possibleCount;
	}

	return math.pow(2, this.numQubits);
};

QuantumCircuit.prototype.numCols = function() {
	return this.gates.length ? this.gates[0].length : 0;
};

QuantumCircuit.prototype.numGates = function(decompose) {
	var circuit = null;
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var numGates = 0;
	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				numGates++;
			}
		}
	}

	return numGates;
};

QuantumCircuit.prototype.isEmptyCell = function(col, wire) {
	if(this.gates[wire] && this.gates[wire][col]) {
		return false;
	}

	for(var w = 0; w < this.numQubits; w++) {
		var gate = this.getGateAt(col, w);
		if(gate) {
			if(gate.name == "measure" || (gate.options && gate.options.condition && gate.options.condition.creg) || (Math.min.apply(null, gate.wires) < wire && Math.max.apply(null, gate.wires) > wire)) {
				return false;
			}
		}
	}

	return true;
};

QuantumCircuit.prototype.isEmptyPlace = function(col, wires, usingCregs) {
	var minWire = Math.min.apply(null, wires);
	var maxWire = Math.max.apply(null, wires);

	if(usingCregs) {
		var mx = this.numQubits - 1;
		if(mx > maxWire) {
			maxWire = mx;
		}
	}

	var allEmpty = true;
	for(var wire = minWire; wire <= maxWire; wire++) {
		if(!this.isEmptyCell(col, wire)) {
			allEmpty = false;
			break;
		}
	}

	return allEmpty;
};

QuantumCircuit.prototype.lastNonEmptyPlace = function(wires, usingCregs) {
	var col = this.numCols();
	var allEmpty = true;

	var minWire = Math.min.apply(null, wires);
	var maxWire = Math.max.apply(null, wires);

	if(usingCregs) {
		var mx = this.numQubits - 1;
		if(mx > maxWire) {
			maxWire = mx;
		}
	}

	while(allEmpty && col--) {
		for(var wire = minWire; wire <= maxWire; wire++) {
			if(!this.isEmptyCell(col, wire)) {
				allEmpty = false;
				break;
			}
		}
	}

	return col;
};

QuantumCircuit.prototype.insertColumn = function(colIndex) {
	for(var i = 0; i < this.numQubits; i++) {
		this.gates[i].splice(colIndex || 0, 0, null);
	}
};

QuantumCircuit.prototype.randomString = function(len) {
	len = len || 17;

	var text = "";
	// let first char to be letter
	var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be letters and numbers
	charset += "0123456789";
	for(var i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};


QuantumCircuit.prototype.addGate = function(gateName, column, wires, options) {
	var wireList = [];
	if(Array.isArray(wires)) {
		for(var i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
	}

	if(column < 0) {
		column = this.lastNonEmptyPlace(wireList, gateName == "measure" || (options && options.condition && options.condition.creg)) + 1;
	}

	var numConnectors = wireList.length;
	var id = this.randomString();
	for(var connector = 0; connector < numConnectors; connector++) {
		var wire = wireList[connector];

		if((wire + 1) > this.numQubits) {
			this.numQubits = wire + 1;
		}

		while(this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		var numCols = this.numCols();
		if((column + 1) > numCols) {
			numCols = column + 1;
		}

		for(var i = 0; i < this.gates.length; i++) {
			while(this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}

		var gate = {
			id: id,
			name: gateName,
			connector: connector,
			options: {}
		}

		if(options) {
			gate.options = options;

			// extend creg if required
			if(options.creg && options.creg["name"] && typeof options.creg["bit"] != "undefined") {
				var cregBit = parseInt(options.creg.bit || 0);
				if(isNaN(cregBit)) {
					cregBit = 0;
				}
				var existingCreg = this.cregs[options.creg.name] || [];
				var currentValue = (existingCreg.length > cregBit) ? existingCreg[options.creg.bit] : 0;
				this.setCregBit(options.creg.name, cregBit, currentValue);
			}
		}

		this.gates[wire][column] = gate;
	}
	return id;
};

QuantumCircuit.prototype.appendGate = function(gateName, wires, options) {
	return this.addGate(gateName, -1, wires, options);
};


QuantumCircuit.prototype.insertGate = function(gateName, column, wires, options) {
	var wireList = [];
	if(Array.isArray(wires)) {
		for(var i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
	}

	if(column < 0) {
		column = this.lastNonEmptyPlace(wireList, (!!gateName && gateName == "measure") || (options && options.condition && options.condition.creg)) + 1;
	}

	var spaceIsEmpty = true;
	var numConnectors = wireList.length;
	for(var connector = 0; connector < numConnectors; connector++) {
		var wire = wireList[connector];

		if((wire + 1) > this.numQubits) {
			this.numQubits = wire + 1;
		}

		while(this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		var numCols = this.numCols();
		if((column + 1) > numCols) {
			numCols = column + 1;
		}

		for(var i = 0; i < this.gates.length; i++) {
			while(this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	if(!this.isEmptyPlace(column, wireList, (!!gateName && gateName == "measure") || (options && options.condition && options.condition.creg))) {
		this.insertColumn(column);
	}

	var id = null;
	if(gateName) {
		id = this.addGate(gateName, column, wireList, options);
	}
	return id;
};

QuantumCircuit.prototype.insertSpace = function(column, wires) {
	return this.insertGate(null, column, wires, null);
};


QuantumCircuit.prototype.removeGateAt = function(column, wire) {
	if(!this.gates[wire]) {
		return;
	}

	var gate = this.gates[wire][column];
	if(!gate) {
		return;
	}

	var id = gate.id;

	var numWires = this.gates.length;
	for(var w = 0; w < numWires; w++) {
		var cell = this.gates[w][column];
		if(cell && cell.id == id) {
			this.gates[w][column] = null;
		}
	}
};

QuantumCircuit.prototype.removeGate = function(gateId) {
	var gatePos = this.getGatePosById(gateId);
	if(!gatePos || gatePos.col < 0 || !gatePos.wires.length) {
		return;
	}

	this.removeGateAt(gatePos.col, gatePos.wires[0]);
};


QuantumCircuit.prototype.addMeasure = function(wire, creg, cbit) {
	this.addGate("measure", -1, wire, { creg: { name: creg, bit: cbit } });
};

QuantumCircuit.prototype.appendCircuit = function(circuit, pack) {
	var colOffset = this.numCols();

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {

				if(!this.basicGates[gate.name] && circuit.customGates[gate.name]) {
					this.registerGate(gate.name, circuit.customGates[gate.name]);
				}

				this.addGate(gate.name, column + colOffset, gate.wires, gate.options);
			}
		}
	}
};





QuantumCircuit.prototype.removeTrailingColumns = function() {
	var numCols = this.numCols();
	for(var column = numCols - 1; column >= 0; column--) {
		var isEmptyCol = true;
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate) {
				isEmptyCol = false;
				break;
			}
		}

		if(!isEmptyCol) {
			return;
		}

		for(var wire = 0; wire < this.numQubits; wire++) {
			this.gates[wire].pop();
		}
	}
};

QuantumCircuit.prototype.removeLeadingColumns = function() {
	var emptyCount = 0;
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		var isEmptyCol = true;
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate) {
				isEmptyCol = false;
				break;
			}
		}

		if(!isEmptyCol) {
			break;
		}

		emptyCount++;
	}

	for(var i = 0; i < emptyCount; i++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			this.gates[wire].shift();
		}
	}
};

QuantumCircuit.prototype.removeTrailingRows = function() {
	var numCols = this.numCols();
	for(var wire = this.numQubits - 1; wire >= 0; wire--) {
		var isEmptyRow = true;
		for(var column = 0; column < numCols; column++) {
			var gate = this.gates[wire][column];
			if(gate) {
				isEmptyRow = false;
				break;
			}
		}

		if(!isEmptyRow) {
			return;
		}
		this.gates.pop();
		this.numQubits--;
	}
};

QuantumCircuit.prototype.removeQubit = function(wire) {
	if(!this.gates[wire]) {
		return;
	}

	this.resetState();

	var numCols = this.numCols();
	for(var col = 0; col < numCols; col++) {
		this.removeGateAt(col, wire);
	}

	for(var w = wire + 1; w < this.numQubits; w++) {
		for(var col = 0; col < numCols; col++) {
			this.gates[w - 1][col] = this.gates[w][col];
		}
	}

	this.gates.pop();
	this.numQubits--;
};


QuantumCircuit.prototype.flipVertically = function() {
	this.resetState();

	var numCols = this.numCols();
	var lastQubit = this.numQubits - 1;
	for(var w = 0; w < this.numQubits / 2; w++) {
		for(var col = 0; col < numCols; col++) {
			var tmp = this.gates[w][col];
			this.gates[w][col] = this.gates[lastQubit - w][col];
			this.gates[lastQubit - w][col] = tmp;
		}
	}
};

QuantumCircuit.prototype.flipHorizontally = function() {
	this.resetState();

	var numCols = this.numCols();
	var lastCol = numCols - 1;
	for(var w = 0; w < this.numQubits; w++) {
		for(var col = 0; col < numCols / 2; col++) {
			var tmp = this.gates[w][col];
			this.gates[w][col] = this.gates[w][lastCol - col];
			this.gates[w][lastCol - col] = tmp;
		}
	}
};



QuantumCircuit.prototype.applyTransform = function(U, qubits) {
	var newState = {};
	var newStateBits = 0;

	// clone list of wires to itself (remove reference to original array)
	qubits = qubits.slice(0);

	// reverse bit order
	if(this.reverseBitOrder) {
		// convert index from 0-based to end-based
		for(var i = 0; i < qubits.length; i++) {
			qubits[i] = (this.numQubits - 1) - qubits[i];
		}
	}

	qubits.reverse();

	// list of wires not used by this gate
	var unused = [];
	for(var i = 0; i < this.numQubits; i++) {
		if(qubits.indexOf(i) < 0) {
			unused.push(i);
		}
	}

	var unusedCount = unused.length;
	var unusedSpace = (1 << unusedCount);

	function getElMask(el) {
		var res = 0;
		qubits.map(function(qubit, index) {
			if(el & (1 << index)) {
				res |= (1 << qubit);
			}
		});
		return res;
	}

	function getIncMask() {
		var res = 0;
		qubits.map(function(qubit, index) {
			res |= (1 << qubit);
		});
		return res + 1;
	}

	function getNotMask() {
		var res = 0;
		unused.map(function(qubit, index) {
			res |= (1 << qubit);
		});
		return res;
	}

	var ZERO = math.complex(0, 0);

	for(var elrow = 0; elrow < U.length; elrow++) {

		var rowmask = getElMask(elrow);

		for(var elcol = 0; elcol < U[elrow].length; elcol++) {

			var colmask = getElMask(elcol);

			if((this.stateBits & colmask) == colmask) {

				var uval = U[elrow][elcol];
				if(uval) {
					var row = rowmask;
					var col = colmask;

					var counter = unusedSpace;
					var countermask = getElMask(0);
					var incmask = getIncMask();
					var notmask = getNotMask();
					var toothless = countermask;
					while(counter--) {
						var state = this.state[col];
						if(state) {
							row = toothless | rowmask;

							if(uval == 1) {
								newState[row] = math.add(newState[row] || ZERO, state);
							} else {
								newState[row] = math.add(newState[row] || ZERO, math.multiply(uval, state));
							}
							newStateBits |= row;
						}

						toothless = (toothless + incmask) & notmask;
						col = toothless | colmask;
					}
				}
			}
		}
	}
	// replace current state with new state
	this.state = newState;
	this.stateBits = newStateBits;

	if(this.stateBits == 0 && Object.keys(this.state).length == 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

//
// `endianness` can be:
//     null - this is default and depends on this.reverseBitOrder
//     "big" - big endian (like Rigetti/pyQuil)
//     "little" - little endian (like IBM/Qiskit)
//
QuantumCircuit.prototype.transformMatrix = function(totalQubits, U, targetQubits, endianness) {
	// clone list of wires to itself (remove reference to original array)
	targetQubits = targetQubits.slice(0);

	var reverseBits = false;
	if(!endianness) {
		reverseBits = !this.reverseBitOrder;
	} else {
		reverseBits = endianness == "big";
	}

	// reverse bit order
	if(reverseBits) {
		// convert index from 0-based to end-based
		for(var i = 0; i < targetQubits.length; i++) {
			targetQubits[i] = (totalQubits - 1) - targetQubits[i];
		}
	}

	targetQubits.reverse();

	// list of wires not used by this gate
	var unused = [];
	for(var i = 0; i < totalQubits; i++) {
		if(targetQubits.indexOf(i) < 0) {
			unused.push(i);
		}
	}

	var unusedCount = unused.length;
	var unusedSpace = (1 << unusedCount);

	function getElMask(el) {
		var res = 0;
		targetQubits.map(function(qubit, index) {
			if(el & (1 << index)) {
				res |= (1 << qubit);
			}
		});
		return res;
	}

	function getIncMask() {
		var res = 0;
		targetQubits.map(function(qubit, index) {
			res |= (1 << qubit);
		});
		return res + 1;
	}

	function getNotMask() {
		var res = 0;
		unused.map(function(qubit, index) {
			res |= (1 << qubit);
		});
		return res;
	}

	var T = math.zeros([ 1 << totalQubits, 1 << totalQubits ]);

	for(var elrow = 0; elrow < U.length; elrow++) {

		var rowmask = getElMask(elrow);

		for(var elcol = 0; elcol < U[elrow].length; elcol++) {

			var colmask = getElMask(elcol);

			var uval = U[elrow][elcol];
			if(uval) {
				var row = rowmask;
				var col = colmask;

				var counter = unusedSpace;
				var countermask = getElMask(0);
				var incmask = getIncMask();
				var notmask = getNotMask();
				var toothless = countermask;
				while(counter--) {
					row = toothless | rowmask;

					T[row][col] = uval;

					toothless = (toothless + incmask) & notmask;
					col = toothless | colmask;
				}
			}
		}
	}
	return T;
};

//
// Function returns unitary of the whole circuit
//
// `endianness` can be:
//     null - this is default and depends on this.reverseBitOrder
//     "big" - big endian (like Rigetti/pyQuil)
//     "little" - little endian (like IBM/Qiskit)
//
QuantumCircuit.prototype.circuitMatrix = function(endianness) {
	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	if(decomposed.gotClassicalControl()) {
		return [];
	}

	var matrix = [];
	for(var col = decomposed.numCols() - 1; col >= 0; col--) {
		for(var wire = decomposed.numQubits - 1; wire >= 0; wire--) {
			var gate = decomposed.getGateAt(col, wire);
			if(gate && gate.connector == 0) {
				var gateDef = decomposed.basicGates[gate.name];
				if(!gateDef) {
					throw new Error("Unknown gate \"" + gate.name + "\"");
					return;
				}
				if(gateDef.matrix && gateDef.matrix.length) {
					var rawGate = decomposed.getRawGate(gateDef, gate.options);

					var U = decomposed.transformMatrix(decomposed.numQubits, rawGate, gate.wires, endianness);

					if(!matrix || !matrix.length) {
						matrix = U;
					} else {
						matrix = this.multiplySquareMatrices(matrix, U);
					}
				}
			}
		}
	}

	return matrix;
};


QuantumCircuit.prototype.eigenvalues2x2 = function(A) {
	var M = this.parseMatrix(A);

	var eigen = [0, 0];

	var x = math.add(M[0][0], M[1][1]);

	eigen[0] = math.divide(math.add(x, math.sqrt( math.add(math.multiply(math.multiply(4, M[0][1]), M[1][0]), math.pow( math.subtract(M[0][0], M[1][1]), 2)))), 2);
	eigen[1] = math.divide(math.subtract(x, math.sqrt( math.add(math.multiply(math.multiply(4, M[0][1]), M[1][0]), math.pow( math.subtract(M[0][0], M[1][1]), 2)))), 2);

	return eigen;
};

QuantumCircuit.prototype.getBipartiteState = function(q1, q2) {
	var bipartiteState = {};
	var ampCount = 0;

	function specSumComplex(a, b) {
		var rawSum = math.add(a, b);
		var arg = rawSum.arg();
		return math.complex({ abs: math.sqrt(math.pow(math.abs(a), 2) + math.pow(math.abs(b), 2)), arg: arg });
	}

	for(var is in this.state) {
		var i = parseInt(is);
		var index = 0;
		var bit1 = (i & (1 << q1)) ? 1 : 0;
		var bit2 = (i & (1 << q2)) ? 2 : 0;

		index |= bit1;
		index |= bit2;

		if(typeof bipartiteState[index] != "undefined") {
			bipartiteState[index] = specSumComplex(bipartiteState[index], this.state[is]);
		} else {
			bipartiteState[index] = this.state[is];
		}

		ampCount++;
	}

	if(!ampCount) {
		bipartiteState["0"] = math.complex(1, 0);
	}

	return bipartiteState;
};


QuantumCircuit.prototype.chanceMap = function() {
	var self = this;


	var map = {};
	for(var sour = 0; sour < this.numQubits; sour++) {
		for(var dest = 0; dest < this.numQubits; dest++) {
			if(!map[sour]) {
				map[sour] = {};
			}
			if(dest == sour) {
				map[sour][dest] = null;
			} else {
				map[sour][dest] = {};
			}
		}
	}

	for(var sour = 0; sour < this.numQubits; sour++) {
		for(var dest = sour + 1; dest < this.numQubits; dest++) {
			var reducedState = this.getBipartiteState(sour, dest);

			var circ = new QuantumCircuit(2);
			circ.state = reducedState;

			var radius = math.abs(circ.angles()[0].radius);

			var concurence = math.round(1 - math.pow(radius, 2), 7);

			map[sour][dest].entangled = concurence > 0;
			map[sour][dest].concurence = concurence;
			map[sour][dest].concurencePercent = math.round(concurence * 100, 2);


			map[dest][sour].entangled = concurence > 0;
			map[dest][sour].concurence = concurence;
			map[dest][sour].concurencePercent = math.round(concurence * 100, 2);
		}
	}

	return map;
};


function binStr(n, len) {
	var bin = n.toString(2);
	while(bin.length < len) {
		bin = "0" + bin;
	}
	return bin;
}


function reverseBitwise(n, len) {
	return parseInt(binStr(n, len).split("").reverse().join(""), 2);
}


QuantumCircuit.prototype.resetQubit = function(wire, value) {
	var U = [
		[0, 0],
		[0, 0]
	];

	var bit = null;
	if(this.reverseBitOrder) {
		bit = math.pow(2, (this.numQubits - 1) - wire);
	} else {
		bit = math.pow(2, wire);
	}

	var prob = 0;
	for(var is in this.state) {
		var i = parseInt(is);
		if(value ? !!(i & bit) : !(i & bit)) {
			prob += math.pow(math.abs(this.state[is]), 2);
		}
	}

	prob = math.round(prob, 14);

	if(prob == 1) {
		return;
	}

	if(value) {
		if(prob == 0) {
			U[1][0] = 1;
		} else {
			U[1][1] = math.sqrt(1 / prob);
		}
	} else {
		if(prob == 0) {
			U[0][1] = 1;
		} else {
			U[0][0] = math.sqrt(1 / prob);
		}
	};

	this.collapsed = [];
	this.prob = [];
	this.applyTransform(U, [wire]);
};


QuantumCircuit.prototype.applyGate = function(gateName, column, wires, options) {
	if(gateName == "measure") {
		if(!options.creg) {
			throw "Error: \"measure\" gate requires destination.";
		}

		var value = this.measure(wires[0], options.creg.name, options.creg.bit);

		var doReset = this.measureResetsQubit;
		if(!doReset) {
			for(var col = column; col < this.numCols(); col++) {
				var fromRow = col == column ? wires[0] : 0;
				for(var row = fromRow; row < this.numQubits; row++) {
					var g = this.gates[row][col];
					if(g && g.name != "measure") {
						doReset = true;
						break;
					}
				}
				if(doReset) {
					break;
				}
			}
		}

		if(doReset) {
			this.resetQubit(wires[0], value);
		}

		return;
	}

	if(gateName == "reset") {
		this.resetQubit(wires[0], 0);
		return;
	}

	if(gateName == "barrier") {
		return;
	}

	var gate = this.basicGates[gateName];
	if(!gate) {
		console.log("Unknown gate \"" + gateName + "\".");
		return;
	}

	var rawGate = this.getRawGate(gate, options);

	this.collapsed = [];
	this.prob = [];

	this.applyTransform(rawGate, wires);
};

QuantumCircuit.prototype.getRawGate = function(gate, gateOptions, globalOptions) {
	var originalGlobalParams = globalOptions && globalOptions.params ? globalOptions.params : (this.options && this.options.params ? this.options.params : {});

	var globalParams = JSON.parse(JSON.stringify(originalGlobalParams));
	for(var globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	var rawGate = [];
	gate.matrix.map(function(row) {
		var rawGateRow = [];
		row.map(function(item) {
			if(typeof item == "string") {
				var params = gateOptions ? gateOptions.params || {} : {};

				var vars = {};
				gate.params.map(function(varName, varIndex) {
					if(Array.isArray(params)) {
						// Deprecated. For backward compatibility only. "params" should be object - not array.
						vars[varName] = params.length > varIndex ? math.evaluate(params[varIndex], globalParams) : null;
					} else {
						vars[varName] = math.evaluate(params[varName], globalParams);
					}
				});

				var ev = math.evaluate(item, vars);
				rawGateRow.push(ev);
			} else {
				rawGateRow.push(item);
			}
		});
		rawGate.push(rawGateRow);
	});
	return rawGate;
};

QuantumCircuit.prototype.countParameterizedGates = function() {
	var parameterizedCount = 0;
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.options && gate.options.params) {
					var gateParamCount = 0;
					for(paramName in gate.options.params) {
						gateParamCount++;
					}
					if(gateParamCount > 0) {
						parameterizedCount++;
					}
				}
			}
		}
	}
	return parameterizedCount;
};

QuantumCircuit.prototype.findGlobalParams = function() {
	var res = {
		globalParams: [],
		cells: []
	};

	var extractVariables = function(s) {
		var vars = [];

		var mathToStringHandler = function(node, options) {
			if(node.isSymbolNode && !node.isFunctionNode && !math[node.name]) {
				vars.push(node.name);
			}
		};

		var node = math.parse(s);
		node.toString({ handler: mathToStringHandler });

		return vars;
	};

	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.options && gate.options.params) {
					var cellAdded = false;
					for(var gateParamName in gate.options.params) {
						var gateParamValue = gate.options.params[gateParamName];
						if(typeof gateParamValue == "string") {
							var globals = extractVariables(gateParamValue);

							if(globals.length) {
								for(var g = 0; g < globals.length; g++) {
									if(res.globalParams.indexOf(globals[g]) < 0) {
										res.globalParams.push(globals[g]);
									}
								}

								if(!cellAdded) {
									var maxWire = Math.max.apply(null, gate.wires);
									res.cells.push([column, maxWire]);
									cellAdded = true;
								}
							}
						}
					}
				}
			}
		}
	}

	return res;
};


QuantumCircuit.prototype.getGlobalParams = function() {
	var globalParams = this.findGlobalParams().globalParams;
	return globalParams;
};

QuantumCircuit.prototype.gotGlobalParams = function() {
	var globalParams = this.getGlobalParams();

	return globalParams.length > 0;
};

QuantumCircuit.prototype.updateGlobalParams = function() {
	this.params = this.getGlobalParams();

	this.options = this.options || {};
	this.options.params = this.options.params || {};

	for(var i = 0; i < this.params.length; i++) {
		var paramName = this.params[i];
		if(typeof this.options.params[paramName] == "undefined") {
			this.options.params[paramName] = 0;
		}
	}

	for(var paramName in this.options.params) {
		if(this.params.indexOf(paramName) < 0) {
			delete this.options.params[paramName];
		}
	}

	return this.params;
};


QuantumCircuit.prototype.isGateParamsGlobal = function(gate) {
	var globalParams = this.getGlobalParams();

	var extractVariables = function(s) {
		var vars = [];

		var mathToStringHandler = function(node, options) {
			if(node.isSymbolNode && !node.isFunctionNode && !math[node.name]) {
				vars.push(node.name);
			}
		};

		var node = math.parse(s);
		node.toString({ handler: mathToStringHandler });

		return vars;
	};

	if(gate.options && gate.options.params) {
		for(var gateParamName in gate.options.params) {
			var gateParamValue = gate.options.params[gateParamName];
			var isGlobal = false;
			if(typeof gateParamValue == "string") {
				var globals = extractVariables(gateParamValue);

				if(globals.length) {
					isGlobal = true;
				}
			}

			if(!isGlobal) {
				return false;
			}
		}
		return true;
	}
	return false;
};


QuantumCircuit.prototype.makeGateParamsGlobal = function(gate) {
	var globalParams = this.getGlobalParams();

	var extractVariables = function(s) {
		var vars = [];

		var mathToStringHandler = function(node, options) {
			if(node.isSymbolNode && !node.isFunctionNode && !math[node.name]) {
				vars.push(node.name);
			}
		};

		var node = math.parse(s);
		node.toString({ handler: mathToStringHandler });

		return vars;
	};

	if(gate.options && gate.options.params) {
		for(var gateParamName in gate.options.params) {
			var gateParamValue = gate.options.params[gateParamName];
			var isGlobal = false;
			if(typeof gateParamValue == "string") {
				var globals = extractVariables(gateParamValue);

				if(globals.length) {
					isGlobal = true;
				}
			}

			if(!isGlobal) {
				// Find unique global variable name
				var varIndex = 0;
				while(globalParams.indexOf("var" + varIndex) >= 0) {
					varIndex++;
				}
				var globalVarName = "var" + varIndex;
				globalParams.push(globalVarName);

				// Update gate
				for(var i = 0; i < gate.wires.length; i++) {
					var cell = this.gates[gate.wires[i]][gate.column];
					cell.options.params[gateParamName] = globalVarName;
				}

				// Update circuit
				this.params.push(globalVarName);
				this.options.params[globalVarName] = gateParamValue;
			}
		}
	}
};


QuantumCircuit.prototype.makeAllParamsGlobal = function() {
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				this.makeGateParamsGlobal(gate);
			}
		}
	}
};


QuantumCircuit.prototype.decompose = function(obj) {
	if(!obj.gates.length) {
		return obj;
	}

	this.updateGlobalParams();

	function injectArray(a1, a2, pos) {
		return a1.slice( 0, pos ).concat( a2 ).concat( a1.slice( pos ) );
	}

	for(var column = 0; column < obj.gates[0].length; column++) {
		for(var wire = 0; wire < obj.numQubits; wire++) {
			var gate = obj.gates[wire][column];
			if(gate && gate.connector == 0 && !this.basicGates[gate.name]) {
				var tmp = new QuantumCircuit();
				var custom = obj.customGates[gate.name];
				if(custom) {
					tmp.load(custom);
					// ---
					// circuit with params
					if(tmp.params.length && gate.options && gate.options.params) {
						var globalParams = gate.options.params;
						for(var cc = 0; cc < tmp.gates[0].length; cc++) {
							for(var ww = 0; ww < tmp.numQubits; ww++) {
								var gg = tmp.gates[ww][cc];
								if(gg && gg.connector == 0) {
									if(gg.options && gg.options.params) {
										for(var destParam in gg.options.params) {
											// parse param, replace variable with global param and assemble it back
											var node = math.parse(gg.options.params[destParam]);
											var transformed = node.transform(function (node, path, parent) {
												if(node.isSymbolNode && globalParams.hasOwnProperty(node.name)) {
													return math.parse("(" + globalParams[node.name] + ")");
												} else {
													return node;
												}
											});
											gg.options.params[destParam] = transformed.toString();
										}
									}
								}
							}
						}
					}

					if(gate.options && gate.options.condition) {
						for(var cc = 0; cc < tmp.gates[0].length; cc++) {
							for(var ww = 0; ww < tmp.numQubits; ww++) {
								var gg = tmp.gates[ww][cc];
								if(gg) {
									gg.options = gg.options || {};
									gg.options.condition = gate.options.condition;
								}
							}
						}
					}
					// ---

					var decomposed = tmp.save(true);
					if(!decomposed.gates[0].length) {
						for(var tmpq = 0; tmpq < decomposed.gates.length; tmpq++) {
							decomposed.gates[tmpq].push(null);
						}
					}

					var empty = [];
					for(var i = 0; i < decomposed.gates[0].length - 1; i++) {
						empty.push(null);
					}

					// shift columns right
					for(var w = 0; w < obj.numQubits; w++) {
						var g = obj.gates[w][column];
						if(g && g.id == gate.id) {
							obj.gates[w].splice(column, 1);
							var insertGate = JSON.parse(JSON.stringify(decomposed.gates[g.connector]));
							// unique id
							for(var tmpq = 0; tmpq < insertGate.length; tmpq++) {
								if(insertGate[tmpq]) {
									insertGate[tmpq].id = insertGate[tmpq].id + "_" + gate.id;
								}
							}
							obj.gates[w] = injectArray(obj.gates[w], insertGate, column);
						} else {
							obj.gates[w] = injectArray(obj.gates[w], empty, column + 1);
						}
					}
				}
			}
		}
	}

	obj.customGates = {};

	return obj;
};

QuantumCircuit.prototype.decomposeGateAt = function(column, wire) {
	var self = this;

	// if there is no gate - return
	var gate = this.getGateAt(column, wire);
	if(!gate) {
		return;
	}

	// if gate is not composite - return
	if(!this.customGates[gate.name]) {
		return;
	}

	// copy circuit
	var obj = new QuantumCircuit();
	obj.load(this.save());

	// remove all gates except this
	for(var col = 0; col < obj.gates[0].length; col++) {
		for(var row = 0; row < obj.numQubits; row++) {
			var g = obj.gates[row][col];
			if(g && g.id != gate.id) {
				obj.removeGateAt(col, row);
			}
		}
	}

	// decompose circuit
	var circuit = new QuantumCircuit();
	circuit.load(obj.save(true));
	circuit.removeLeadingColumns();
	circuit.removeTrailingColumns();

	for(var i = 0; i < circuit.gates[0].length - 1; i++) {
		this.insertSpace(column + i, gate.wires);
	}
	this.removeGate(gate.id);

	var destCol = column;
	for(var col = 0; col < circuit.gates[0].length; col++) {
		var gates = circuit.getGatesAtColumn(col);
		gates.map(function(g) {
			self.addGate(g.name, destCol, g.wires, g.options);
		});
		destCol++;
	}

	return circuit;
};


QuantumCircuit.prototype.removeMeasurementAndClassicalControl = function() {
	// remove measurement and classical control
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate) {
				// remove measurement
				if(gate.name == "measure") {
					this.gates[wire][column] = null;
					gate = null;
				}
			}

			if(gate) {
				// remove conditions
				if(gate.options && gate.options.condition) {
					delete this.gates[wire][column].options.condition;
				}
			}
		}
	}

	// remove cregs
	this.cregs = {};

	// remove hybrid options
	if(this.options) {
		this.options.hybrid = false;
		if(this.options.hybridOptions) {
			delete this.options.hybridOptions;
		}

		this.options.encoderDecoder = false;
		if(this.options.encoderDecoderOptions) {
			delete this.options.encoderDecoderOptions;
		}
	}
};


//
// Convert this circuit to custom gate
//

QuantumCircuit.prototype.convertToCustomGate = function(gateName, decompose, addToCircuit) {
	// remove measurement and classical control
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate) {
				// remove measurement
				if(gate.name == "measure") {
					this.gates[wire][column] = null;
					gate = null;
				}
			}

			if(gate) {
				// remove conditions
				if(gate.options && gate.options.condition) {
					delete this.gates[wire][column].options.condition;
				}
			}
		}
	}

	// remove cregs
	this.cregs = {};

	var source = this.save(decompose);
	if(source.options) {
		source.options.hybrid = false;
		if(source.options.hybridOptions) {
			delete source.options.hybridOptions;
		}

		source.options.encoderDecoder = false;
		if(source.options.encoderDecoderOptions) {
			delete source.options.encoderDecoderOptions;
		}
	}

	this.clear();
	this.customGates[gateName] = source;

	if(addToCircuit) {
		var wires = [];
		for(var i = 0; i < this.numQubits; i++) {
			wires.push(i);
		}

		var gateOptions = JSON.parse(JSON.stringify(this.customGates[gateName].options));

		this.addGate(gateName, -1, wires, gateOptions);
	} else {
		this.removeTrailingRows();
	}
};

QuantumCircuit.prototype.validCustomGateName = function(baseName) {
	baseName = (baseName || "sub") + "";

	var customGateNames = [];
	if(this.customGates) {
		if(!this.basicGates[baseName]) {
			if(!this.customGates[baseName]) {
				return baseName;
			}
		}

		for(var gateName in this.basicGates) {
			customGateNames.push(gateName);
		}

		for(var gateName in this.customGates) {
			customGateNames.push(gateName);
		}
	}

	var index = 0;
	var validName = "";
	do {
		index++;
		validName = baseName + index;
	} while(customGateNames.indexOf(validName) >= 0);

	return validName;
};


//
// Split circuit into composite gates, each of "blockSize" qubits
//
// Options:
//   {
//      flexibleBlockSize: bool // Allow larger blocks for gates with more qubits than block size
//      verticalOnly: bool // Don't extend blocks horizontally
//   }
//

QuantumCircuit.prototype.splitIntoBlocks = function(blockSize, options) {
	options = options || {};

	var blocks = [];
	var prevCondition = "{}";
	var prevIsUnitary = true;

	var currentBlock = null;

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	var numCols = decomposed.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < decomposed.numQubits; wire++) {
			var gate = decomposed.getGateAt(column, wire);
			if(gate && gate.connector == 0 && !gate.addedToBlock) {
				var gateDef = this.basicGates[gate.name];
				var currentCondition = gate.options && gate.options.condition ? JSON.stringify(gate.options.condition) : "{}";
				var currentIsUnitary = gateDef && !!(gateDef.matrix && gateDef.matrix.length);

				var newWires = JSON.parse(JSON.stringify(currentBlock ? currentBlock.wires : []));
				gate.wires.map(function(wire) {
					if(newWires.indexOf(wire) < 0) {
						newWires.push(wire);
					}
				});

				if(
					!blocks.length ||
					!(currentCondition == prevCondition) ||
					!currentIsUnitary ||
					!prevIsUnitary ||
					!(newWires.length <= blockSize)
				) {
					currentBlock = {
						wires: gate.wires,
						gates: [gate]
					};
					blocks.push(currentBlock);

					if(gate.options && gate.options.condition) {
						currentBlock.condition = gate.options.condition;
					}
				} else {
					currentBlock.wires = newWires;
					currentBlock.gates.push(gate);
				}

				gate.wires.map(function(ww) {
					decomposed.gates[ww][column].addedToBlock = true;
				});

				prevCondition = currentCondition;
				prevIsUnitary = currentIsUnitary;

				if(!options.verticalOnly) {
					// try to extend the block horizontally
					var extColumn = column + 1;
					var extWires = JSON.parse(JSON.stringify(currentBlock.wires));
					extWires.sort();
					while(extColumn < numCols && extWires.length) {
						extWire = extWires[0];

						while(extWires.length && extWire <= extWires[extWires.length - 1]) {
							var extGate = decomposed.getGateAt(extColumn, extWire);
							if(extGate && !extGate.addedToBlock) {
								var extGateDef = this.basicGates[extGate.name];
								var extCondition = extGate.options && extGate.options.condition ? JSON.stringify(extGate.options.condition) : "{}";
								var extIsUnitary = extGateDef && !!(extGateDef.matrix && extGateDef.matrix.length);

								//
								// Check if gate is valid for block
								//
								var gateValid = extIsUnitary && (extCondition == currentCondition);

								// Check if all gate's wires are inside block
								if(gateValid) {
									for(var ww = 0; ww < extGate.wires.length; ww++) {
										if(extWires.indexOf(extGate.wires[ww]) < 0) {
											gateValid = false;
											break;
										}
									}
								}

								if(gateValid) {
									// add gate to block
									currentBlock.gates.push(extGate);

									extGate.wires.map(function(ww) {
										decomposed.gates[ww][extColumn].addedToBlock = true;
									});
								} else {
									// remove gate's wires from scan
									var validExtWires = [];
									for(var ww = 0; ww < extWires.length; ww++) {
										var extW = extWires[ww];
										if(extGate.wires.indexOf(extW) < 0) {
											validExtWires.push(extW);
										}
									}
									extWires = validExtWires;
								}
							}
							// goto next valid wire
							if(extWires.length) {
								var newExtWire = extWires[extWires.length - 1] + 1;
								for(var ww = extWires.length - 1; ww >= 0; ww--) {
									var extW = extWires[ww];
									if(extW > extWire) {
										newExtWire = extW;
									}
								}
								extWire = newExtWire;
							}

						}
						extColumn++;
					}
				}
			}
		}
	}

	var circuit = new QuantumCircuit();

	var blockCounter = 0;
	for(var blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
		var block = blocks[blockIndex];

		var isBlock = false;
		if(block.wires.length <= blockSize || !!options.flexibleBlockSize) {
			for(var x = 0; x < block.gates.length; x++) {
				var gate = block.gates[x];
				var gateDef = this.basicGates[gate.name];

				if(gateDef.matrix && gateDef.matrix.length) {
					isBlock = true;
				}
			}
		}

		if(isBlock) {
			blockCounter++;

			var customGate = new QuantumCircuit();
			for(var x = 0; x < block.gates.length; x++) {
				var gate = block.gates[x];

				if(gate.options.condition) {
					delete gate.options.condition;
				}

				// Update gate wires
				var wires = [];
				gate.wires.map(function(wire) {
					wires.push(block.wires.indexOf(wire));
				});
				gate.wires = wires;

				// add gate to custom gate
				customGate.appendGate(gate.name, wires, gate.options);
			}

			// register custom gate
			var customGateName = "block" + blockCounter;
			circuit.registerGate(customGateName, customGate);

			// add custom gate to circuit
			var customGateOptions = {};
			if(block.condition) {
				customGateOptions.condition = block.condition;
			}
			circuit.appendGate(customGateName, block.wires, customGateOptions);
		} else {
			// ---
			// add original gate (non-unitary gates [and gates with more than blockSize wires if allowFlexibleBlockSize = false])
			// ---
			block.gates.map(function(gate) {
				circuit.appendGate(gate.name, gate.wires, gate.options);
			});
		}
	}

	this.load(circuit.save(false));
};


QuantumCircuit.prototype.usedGates = function(options) {
	options = options || {};

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));
	var used = [];
	for(var wire = 0; wire < decomposed.numQubits; wire++) {
		for(var col = 0; col < decomposed.numCols(); col++) {
			var gate = decomposed.gates[wire][col];
			if(gate && used.indexOf(gate.name) < 0) {
				var skipGate = false;

				if(options.unitariesOnly) {
					var basicGate = decomposed.basicGates[gate.name];
					if(!basicGate || !basicGate.matrix || !basicGate.matrix.length) {
						skipGate = true;
					}
				}

				if(!skipGate) {
					used.push(gate.name);
				}
			}
		}
	}

	// Custom gates
	if(!options.noCustomGates) {
		for(var customGateName in this.customGates) {
			var customGate = this.customGates[customGateName];

			if(used.indexOf(customGateName) < 0) {
				used.push(customGateName);
			}
		}
	}

	return used;
};


QuantumCircuit.prototype.countOps = function(obj, options) {
	options = options || {};
	options.shallow = options.shallow || false;

	if(!obj) {
		obj = this;
	}

	var ops = {};
	for(var wire = 0; wire < obj.gates.length; wire++) {
		for(var col = 0; col < obj.gates[wire].length; col++) {
			var gate = obj.gates[wire][col];
			if(gate && gate.connector == 0) {
				var basicGate = this.basicGates[gate.name];
				if(basicGate) {
					if(ops[gate.name]) {
						ops[gate.name]++;
					} else {
						ops[gate.name] = 1;
					}
				} else {
					var customGate = this.customGates[gate.name];
					if(customGate) {
						if(ops[gate.name]) {
							ops[gate.name]++;
						} else {
							ops[gate.name] = 1;
						}

						if(!options.shallow) {
							var subOps = this.countOps(customGate, options);
							for(subName in subOps) {
								if(ops[subName]) {
									ops[subName] += subOps[subName];
								} else {
									ops[subName] = subOps[subName];
								}
							}
						}
					}
				}
			}
		}
	}

	return ops;
};


//
// Returns arrays of qubits where gates are present
//
QuantumCircuit.prototype.getCouplingMap = function(options) {
	options = options || {};

	var couplingMap = "";

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	for(var wire = 0; wire < decomposed.numQubits; wire++) {
		for(var col = 0; col < decomposed.numCols(); col++) {
			var gate = decomposed.getGateAt(col, wire);
			if(gate && gate.connector == 0) {
				var skipGate = false;

				if(options.unitariesOnly) {
					var basicGate = decomposed.basicGates[gate.name];
					if(!basicGate || !basicGate.matrix || !basicGate.matrix.length) {
						skipGate = true;
					}
				}

				if(!skipGate) {
					var wiresStr = JSON.stringify(gate.wires);
					if(couplingMap.indexOf(wiresStr) < 0) {
						if(couplingMap) {
							couplingMap += ",";
						}
						couplingMap += wiresStr;
					}
				}
			}
		}
	}

	return JSON.parse("[" + couplingMap + "]");
};

QuantumCircuit.prototype.getGateDef = function(name) {
	var gateDef = this.basicGates[name];
	if(!gateDef) {
		gateDef = this.customGates[name];
	}
	return gateDef;
};

// ---
// Import from Qubit Toaster
// ---
QuantumCircuit.prototype.importRaw = function(data, errorCallback) {
	var numQubits = data ? (data.qubits || 0) : 0;

	this.init(numQubits);

	if(!data) {
		if(errorCallback) {
			errorCallback([]);
		} else {
			return;
		}
	}

	// import classical registers
	if(data.cregs) {
		for(var i = 0; i < data.cregs.length; i++) {
			var creg = data.cregs[i];

			if(!creg.name) {
				var errorMessage = "Classical register " + i + " doesn't have a \"name\".";
				if(errorCallback) {
					errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			this.createCreg(creg.name, creg.len || 0);
		}
	}

	// import program
	if(data.program) {
		for(var i = 0; i < data.program.length; i++) {
			var gate = data.program[i];

			// Import from matrix is not implemented yet, so best we have is gate name
			// Check if gate has name
			if(!gate.name) {
				var errorMessage = "Gate " + i + " doesn't have a \"name\". Name is optional and this is OK for QubitToaster but we cannot import gate from matrix. Not implemented yet.";
				if(errorCallback) {
					errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			// Check if gate name exists in this.basicGates
			var basicGate = this.basicGates[gate.name];
			if(!basicGate) {
				var errorMessage = "Unknown gate \"" + gate.name + "\". Name is optional and this is OK for QubitToaster but we cannot import gate from matrix. We can import only gates by name from set of known gates.";
				if(errorCallback) {
					errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}


			var wires = JSON.parse(JSON.stringify(gate.wires || []));
			var options = JSON.parse(JSON.stringify(gate.options || {}));

			// check if number of wires is correct
			var basicGateQubits = basicGate.matrix && basicGate.matrix.length ? math.log2(basicGate.matrix.length) : 1;
			if(wires.length != basicGateQubits) {
				var errorMessage = "Gate \"" + gate.name + "\" has " + wires.length + " wires but should have " + basicGateQubits + " wires.";
				if(errorCallback) {
					errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			// Check if all parameters are present
			if(basicGate.params && basicGate.params.length) {
				if(!options.params) {
					var errorMessage = "Missing parameters for gate \"" + gate.name + "\". Expecting " + basicGate.params.length + " parameters.";
					if(errorCallback) {
						errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
						return;
					} else {
						throw new Error(errorMessage);
					}
				}

				for(var p = 0; p < basicGate.params.length; p++) {
					var paramName = basicGate.params[p];

					if(typeof options.params[paramName] == "undefined") {
						var errorMessage = "Missing parameter \"" + paramName + "\" for gate \"" + gate.name + "\".";
						if(errorCallback) {
							errorCallback([ { msg: errorMessage, line: 0, col: 0 } ]);
							return;
						} else {
							throw new Error(errorMessage);
						}
					}

				}
			}
			this.appendGate(gate.name, wires, options);
		}
	}

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if(errorCallback) {
		errorCallback([]);
	}
};

// ---
// Export to Qubit Toaster
// ---
QuantumCircuit.prototype.exportRaw = function() {
	var globalParams = this.options && this.options.params ? this.options.params : {};
	var globalParams = JSON.parse(JSON.stringify(globalParams));
	for(var globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	var numCols = decomposed.numCols();
	var sequence = [];
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < decomposed.numQubits; wire++) {
			var gate = decomposed.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gt = decomposed.basicGates[gate.name];
				if(!gt) {
					console.log("Unknown gate \"" + gate.name + "\".");
					return;
				}

				var rawGate = decomposed.getRawGate(gt, gate.options);

				var rawMatrix = [];
				rawGate.map(function(row) {
					var rawRow = [];
					row.map(function(cell) {
						cell = JSON.parse(JSON.stringify(cell));
						if(typeof cell == "object") {
							if(cell["mathjs"] && typeof cell["mathjs"] == "string") {
								cell["type"] = cell["mathjs"].toLowerCase();
								delete cell.mathjs;
							}
						}
						rawRow.push(cell);
					});
					rawMatrix.push(rawRow);
				});

				var options = {};
				if(gate.options) {
					options = JSON.parse(JSON.stringify(gate.options));
				}

				if(options.params) {
					for(var paramName in options.params) {
						options.params[paramName] = math.evaluate(options.params[paramName], globalParams);
					}
				}

				sequence.push({
					name: gate.name,
					matrix: rawMatrix,
					wires: gate.wires,
					options: options
				});
			}
		}
	}

	var cregs = [];
	for(var creg in decomposed.cregs) {
		cregs.push({
			name: creg,
			len: decomposed.cregs[creg].length || 0
		});
	}

	return {
		qubits: decomposed.numQubits,
		cregs: cregs,
		program: sequence
	};
};

//
// Returns input file for Quantum Generator
//
// options: { 
//     noVectors: bool (default: false) // set true for transpiling with "replace_blocks" & "replace_gates" methods to avoid generating (large) vectors
//     basisInputVectors: bool (default: false) // set true to use real standard basis vectors as input. If false then random complex vectors will be used.
//     fromMatrix: bool (default: false) // directly send matrix to generator (instead vectors)
//     numSamples: int (default: 0) // number of random vectors. 0=auto
//     useGates: array of string (default: ["u3, "cx"]) // gates to use when generating random vectors
// }
//

QuantumCircuit.prototype.exportToGenerator = function(options) {
	options = options || {};

	var qasm = this.exportQASM(null, false, null, false, true);
	var usedGates = this.usedGates({ noCustomGates: true, unitariesOnly: true });
	var couplingMap = this.getCouplingMap({ unitariesOnly: true });

	var output = {
		source: { 
			circuit: { 
				qasm: qasm
			}
		},

		problem: [],

		type: "circuit",

		settings: {
			allowed_gates: usedGates.join(","),
			coupling_map: couplingMap
		}
	};

	var circuit = new QuantumCircuit();
	circuit.load(this.save(true));

	if(options.fromMatrix) {
		var matrix = circuit.circuitMatrix();
		var unitary = [];

		matrix.map(function(row) {
			row.map(function(value) {
				if(typeof value == "object") {
					unitary.push([value.re, value.im]);
				} else {
					unitary.push(value);
				}
			});
		});

		output.problem.push({
			unitary: unitary
		});

		return output;
	}

	if(!options.noVectors) {
		if(options.basisInputVectors) {
			var vectorLen = math.pow(2, this.numQubits);
			var numSamples = options.numSamples || vectorLen;

			var initialVector = [];
			for(var i = 0; i < vectorLen; i++) {
				initialVector.push(math.complex(0, 0));
			}

			for(var i = 0; i < numSamples; i++) {
				var set = { input: [], output: [] };

				initialVector[i] = math.complex(1, 0);

				initialVector.map(function(el) {
					set.input.push([ el.re, el.im ]);
				});

				circuit.run(null, { initialState: initialVector });

				circuit.stateAsArray().map(function(state) {
					set.output.push([ state.amplitude.re, state.amplitude.im ]);
				});

				output.problem.push(set);

				initialVector[i] = math.complex(0, 0);
			}

		} else {
			var stateCircuit = new QuantumCircuit();

			var numSamples = options.numSamples || (this.numQubits < 3 ? 8 : (this.numQubits < 5 ? ((1 << this.numQubits) + 1) : (this.numQubits < 9 ? (this.numQubits * 4) : this.numQubits)));
			for(var i = 0; i < numSamples + 1; i++) {

				var set = { input: [], output: [] };

				var initialVector = [];

				if(i > 0) {
					stateCircuit.randomCircuit(this.numQubits, 20, { useGates: options.useGates || ["u3", "cx"], noClassicControl: true, noMeasure: true, noReset: true });
					stateCircuit.run();

					stateCircuit.stateAsArray().map(function(state) {
						set.input.push([ state.amplitude.re, state.amplitude.im ]);
					});

					initialVector = stateCircuit.state;
				} else {
					circuit.initState();

					circuit.stateAsArray().map(function(state) {
						set.input.push([ state.amplitude.re, state.amplitude.im ]);
					});

					initialVector = circuit.state;
				}

				circuit.run(null, { initialState: initialVector });

				circuit.stateAsArray().map(function(state) {
					set.output.push([ state.amplitude.re, state.amplitude.im ]);
				});

				output.problem.push(set);
			}
		}
	}

	return output;
};


QuantumCircuit.prototype.save = function(decompose, lightweight) {
	this.updateGlobalParams();

	var data = {
		numQubits: this.numQubits,
		params: JSON.parse(JSON.stringify(this.params)),
		options: JSON.parse(JSON.stringify(this.options)),
		gates: JSON.parse(JSON.stringify(this.gates)),
		customGates: JSON.parse(JSON.stringify(this.customGates)),
		cregs: JSON.parse(JSON.stringify(this.cregs))
	}

	var res = null;
	if(decompose) {
		res = this.decompose(data);
	} else {
		res = data;
	}

	// ---
	// remove Id from gates?
	// ---
	if(lightweight) {
		if(res.gates) {
			res.gates.map(function(row) {
				if(row) {
					row.map(function(cell) {
						if(cell && cell.id) {
							delete cell.id;
						}
					});
				}
			});
		}

		if(res.customGates) {
			for(var customGateName in res.customGates) {
				var customGate = res.customGates[customGateName];
				if(customGate && customGate.gates) {
					customGate.gates.map(function(row) {
						if(row) {
							row.map(function(cell) {
								if(cell && cell.id) {
									delete cell.id;
								}
							});
						}
					});
				}
			}
		}
	}
	// ---

	return res;
};

QuantumCircuit.prototype.load = function(obj) {
	this.numQubits = obj.numQubits || 1;
	this.clear();
	this.params = JSON.parse(JSON.stringify(obj.params || []));
	this.options = JSON.parse(JSON.stringify(obj.options || {}));
	this.gates = JSON.parse(JSON.stringify(obj.gates || []));
	this.customGates = JSON.parse(JSON.stringify(obj.customGates || {}));
	this.cregs = JSON.parse(JSON.stringify(obj.cregs || {}));

	// default options
	this.options.params = this.options.params || {};

	this.options.hybrid = this.options.hybrid || false;
	if(!this.options.hybridOptions) {
		this.options.hybridOptions = this.defaultHybridOptions();
	}

	this.options.encoderDecoder = this.options.encoderDecoder || false;
	if(!this.options.encoderDecoderOptions) {
		this.options.encoderDecoderOptions = this.defaultEncoderDecoderOptions();
	}
};


var generateGrayCode = function(numBits) {
	if(numBits <= 0) {
		throw new Error("Cannot generate the gray code for less than 1 bit.");
	}

	var result = [0];
	for(i = 0; i < numBits; i++) {
		var reversed = [].concat(result).reverse();
		reversed.map(function(x) {
			result.push(x + math.pow(2, i));
		});
	}

	var gray = [];
	result.map(function(dec) {
		gray.push(binStr(dec, numBits));
	});

	return gray;
};


QuantumCircuit.prototype.grayCodeChain = function(numCtrlQubits, gateName, gateOptions) {

	function compareStrings(s1, s2) {
		var comp = [];
		for(var i = 0; i < s1.length; i++) {
			comp.push(s1[i] != s2[i]);
		}
		return comp;
	}

	function indicesOfChar(s, ch) {
		var indices = [];
		for(var i = 0; i < s.length; i++) {
			if(s[i] == ch) {
				indices.push(i);
			}
		}
		return indices;
	}

	function countChar(s, ch) {
		var count = 0;
		for(var i = 0; i < s.length; i++) {
			if(s[i] == ch) {
				count++;
			}
		}
		return count;
	}

	var qControls = [];
	for(var i = 0; i < numCtrlQubits; i++) {
		qControls.push(i);
	}

	var qTarget = numCtrlQubits;
	var grayCode = generateGrayCode(numCtrlQubits);
	var lastPattern = null;

	var rules = [];
	grayCode.map(function(pattern) {
		var lmPos = pattern.indexOf("1");
		if(lmPos >= 0) {
			if(!lastPattern) {
				lastPattern = pattern;
			}

			var comp = compareStrings(pattern, lastPattern);
			var pos = comp.indexOf(true);
			if(pos >= 0) {
				if(pos != lmPos) {
					rules.push({ gateName: "cx", wires: [ qControls[pos], qControls[lmPos] ], options: null });
				} else {
					var indices = indicesOfChar(pattern, "1");
					for(var idx = 1; idx < indices.length; idx++) {
						rules.push({ gateName: "cx", wires: [ qControls[indices[idx]], qControls[lmPos] ], options: null });
					}
				}
			}

			if(!(countChar(pattern, "1") % 2)) {
				// inverse
				// !!!
				// Warning - this works only with gate which is own inverse
				// TODO: implement proper inverse for all gates
				// !!!
				var inverseOptions = null;
				if(gateOptions) {
					inverseOptions = JSON.parse(JSON.stringify(gateOptions));
					if(inverseOptions.params) {
						for(key in inverseOptions.params) {
							var val = inverseOptions.params[key];
							if(typeof val == "number") {
								val = 0 - val;
							} else {
								val = "-(" + val + ")";
							}
							inverseOptions.params[key] = val;
						}
					}
				}
				rules.push({ gateName: gateName, wires: [ qControls[lmPos], qTarget ], options: inverseOptions });
			} else {
				rules.push({ gateName: gateName, wires: [ qControls[lmPos], qTarget ], options: gateOptions });
			}
			lastPattern = pattern;
		}
	});

	return rules;
};


QuantumCircuit.prototype.MCU1Circuit = function(ctrlQubits) {
	var numCtrlQubits = 0;
	var invertControls = [];
	if(typeof ctrlQubits == "number") {
		numCtrlQubits = ctrlQubits;
	} else {
		numCtrlQubits = ctrlQubits.length || 0;
		for(var i = 0; i < numCtrlQubits; i++) {
			if(!ctrlQubits[i] || (typeof ctrlQubits[i] == "number" && ctrlQubits[i] < 0)) {
				invertControls.push(i);
			}
		}
	}

	if(numCtrlQubits == 0) {
		throw new Error("Cannot create multi-controlled gate with zero control qubits.");
	}

	function addX(circuit, wires) {
		wires.map(function(wire) {
			circuit.appendGate("x", wire);
		});
	}

	var scaledLambda = "lambda / " + math.pow(2, numCtrlQubits - 1);
	var gateOptions = { params: { lambda: scaledLambda } };

	var qc = new QuantumCircuit();

	if(numCtrlQubits == 1) {
		addX(qc, invertControls);
		qc.appendGate("cu1", [0, 1], gateOptions);
		addX(qc, invertControls);
		return qc;
	}

	addX(qc, invertControls);
	var rules = this.grayCodeChain(numCtrlQubits, "cu1", gateOptions);
	rules.map(function(rule) {
		qc.appendGate(rule.gateName, rule.wires, rule.options);
	});
	addX(qc, invertControls);

	return qc;
};


QuantumCircuit.prototype.MCXCircuit = function(ctrlQubits) {
	var numCtrlQubits = 0;
	var invertControls = [];
	if(typeof ctrlQubits == "number") {
		numCtrlQubits = ctrlQubits;
	} else {
		numCtrlQubits = ctrlQubits.length || 0;
		for(var i = 0; i < numCtrlQubits; i++) {
			if(!ctrlQubits[i] || (typeof ctrlQubits[i] == "number" && ctrlQubits[i] < 0)) {
				invertControls.push(i);
			}
		}
	}

	var qc = new QuantumCircuit();
	if(numCtrlQubits == 0) {
		throw new Error("Cannot create multi-controlled gate with zero control qubits.");
	}

	function addX(circuit, wires) {
		wires.map(function(wire) {
			circuit.appendGate("x", wire);
		});
	}

	if(numCtrlQubits == 1) {
		addX(qc, invertControls);
		qc.appendGate("cx", [0, 1]);
		addX(qc, invertControls);
		return qc;
	}

	if(numCtrlQubits == 2) {
		addX(qc, invertControls);
		qc.appendGate("ccx", [0, 1, 2]);
		addX(qc, invertControls);
		return qc;
	}

	var mcu1 = qc.MCU1Circuit(numCtrlQubits);
	var mcu1name = "mcu1_" + numCtrlQubits;
	var mcu1wires = [];
	for(var i = 0; i < numCtrlQubits + 1; i++) {
		mcu1wires.push(i);
	}

	qc.registerGate(mcu1name, mcu1);
	addX(qc, invertControls);
	qc.appendGate("h", numCtrlQubits);
	qc.appendGate(mcu1name, mcu1wires, { params: { lambda: "pi" }});
	addX(qc, invertControls);
	qc.appendGate("h", numCtrlQubits);

	return qc;
};


QuantumCircuit.prototype.registerGate = function(name, obj) {
	if(obj instanceof QuantumCircuit) {
		this.customGates[name] = obj.save();
	} else {
		this.customGates[name] = obj;
	}

	if(this.isMultiControlledGate(name)) {
		var mcInfo = this.decodeMultiControlledGateName(name);
		if(mcInfo.numCtrlQubits != this.customGates[name].numQubits - 1) {
			mcInfo.numCtrlQubits = this.customGates[name].numQubits - 1;
			var ctrlQubits = [];
			for(var i = 0; i < mcInfo.numCtrlQubits; i++) {
				ctrlQubits.push(typeof mcInfo.ctrlQubits[i] == "undefined" ? true : mcInfo.ctrlQubits[i]);
			}
			mcInfo.ctrlQubits = ctrlQubits;
		}

		var rootGate = this.basicGates[mcInfo.rootName];
		if(rootGate && rootGate.drawingInfo && rootGate.drawingInfo.connectors) {
			if(!this.customGates[name].drawingInfo) {
				this.customGates[name].drawingInfo = {};
			}

			var connectors = [];
			mcInfo.ctrlQubits.map(function(ctrlQubit) {
				if(ctrlQubit) {
					connectors.push("dot");
				} else {
					connectors.push("ndot");
				}
			});
			connectors.push(rootGate.drawingInfo.connectors[rootGate.drawingInfo.connectors.length - 1]);

			this.customGates[name].drawingInfo.connectors = connectors;
			this.customGates[name].drawingInfo.root = rootGate.drawingInfo.root;
		}
	}
};


QuantumCircuit.prototype.registerMCXGate = function(ctrlQubits) {
	var gateName = this.multiControlledGateName("mcx", ctrlQubits);
	this.registerGate(gateName, this.MCXCircuit(ctrlQubits).save(true));
	return gateName;
};


QuantumCircuit.prototype.registerMCU1Gate = function(ctrlQubits) {
	var gateName = this.multiControlledGateName("mcu1", ctrlQubits);
	this.registerGate(gateName, this.MCU1Circuit(ctrlQubits).save(true));
	return gateName;
};


QuantumCircuit.prototype.registerMultiControlledGate = function(rootName, ctrlQubits) {
	switch(rootName) {
		case "cx": return this.registerMCXGate(ctrlQubits); break;
		case "cu1": return this.registerMCU1Gate(ctrlQubits); break;
	}

	return "";
};

QuantumCircuit.prototype.getOrRegisterMultiControlledEquivalent = function(gateName, inverseControl) {
	var gateDef = this.basicGates[gateName];
	if(gateDef) {
		if(gateDef.drawingInfo) {
			// Basic gate with multi-controlled/inverse controlled implementation
			if(gateName == "x" || gateName == "u1" || gateDef.drawingInfo.root == "x" || gateDef.drawingInfo.root == "u1") {
				if(!this.basicGates["c" + gateName] || inverseControl) {
					// create multi controlled version and return its name
					var rootName = "c" + (gateDef.drawingInfo.root || gateName);
					var numCtrlQubits = math.log2(gateDef.matrix.length);
					var ctrlQubits = [];
					for(var i = 0; i < numCtrlQubits - 1; i++) {
						ctrlQubits.push(true);
					}
					ctrlQubits.unshift(!inverseControl);

					return this.registerMultiControlledGate(rootName, ctrlQubits);
				} else {
					// there is basic gate with additional control
					return "c" + gateName;
				}
			}
		}

		// Basic gate for which we don't have multi-controlled or inverse controlled implementation
		// but maybe we have basic gate with additional control
		for(var gn in this.basicGates) {
			var tmpGateDef = this.basicGates[gn];
			if(tmpGateDef && tmpGateDef.drawingInfo && tmpGateDef.drawingInfo.root && tmpGateDef.drawingInfo.root == gateName) {
				if(!inverseControl) {
					// there is basic gate with additional control
					return gn;
				}
			}
		}
		return null;
	}

	if(this.customGates[gateName]) {
		var mcInfo = this.decodeMultiControlledGateName(gateName);
		if(!mcInfo || !mcInfo.numCtrlQubits) {
			return null;
		}

		if(mcInfo.rootName == "cx" || mcInfo.rootName == "cu1") {
			// create multi controlled version and return its name
			mcInfo.ctrlQubits.unshift(!inverseControl);
			return this.registerMultiControlledGate(mcInfo.rootName, mcInfo.ctrlQubits);
		}

		return null;
	}

	return null;
};


QuantumCircuit.prototype.removeUnusedMultiControlledGates = function() {
	var ops = this.countOps(null, { shallow: false });

	for(gateName in this.customGates) {
		if(!ops[gateName]) {
			if(this.isMultiControlledGate(gateName)) {
				delete this.customGates[gateName];
			}
		}
	}
};


QuantumCircuit.prototype.decodeMultiControlledGateName = function(gateName) {
	if(!gateName) {
		return null;
	}

	var mcInfo = {};
	var splitted = gateName.split("_");

	// name
	if(splitted.length > 0) {
		mcInfo.name = splitted[0];
		mcInfo.rootName = mcInfo.name.substring(1);

		if(mcInfo.rootName != "cx" && mcInfo.rootName != "cu1") {
			return null;
		}
	}

	// numCtrlQubits
	if(splitted.length > 1) {
		var numCtrlQubits = parseInt(splitted[1]);
		if(!isNaN(numCtrlQubits) && numCtrlQubits <= 20) {
			mcInfo.numCtrlQubits = numCtrlQubits;
		}
	}

	// ctrlQubits
	if(mcInfo.numCtrlQubits) {
		var ctrlQubits = [];
		if(splitted.length > 2) {
			for(var i = 0; i < splitted[2].length; i++) {
				if(splitted[2][i] == "0") {
					ctrlQubits.push(false);
				}
				if(splitted[2][i] == "1") {
					ctrlQubits.push(true);
				}
			}
		}

		if(!ctrlQubits.length) {
			for(var i = 0; i < numCtrlQubits; i++) {
				ctrlQubits.push(true);
			}
		}
		mcInfo.ctrlQubits = ctrlQubits;
	}

	return mcInfo;
};


QuantumCircuit.prototype.multiControlledGateName = function(namePrefix, ctrlQubits) {
	var gateName = namePrefix + "_";
	if(typeof ctrlQubits == "number") {
		gateName += ctrlQubits;
	} else {
		gateName += (ctrlQubits.length || 0);

		var wires = "";
		ctrlQubits.map(function(wire) {
			if(!wire || (typeof wire == "number" && wire < 0)) {
				wires += "0";
			} else {
				wires += "1";
			}
		});
		if(wires.indexOf("0") < 0) {
			wires = "";
		}
		if(wires) {
			gateName += "_" + wires;
		}
	}
	return gateName;
};


QuantumCircuit.prototype.isMultiControlledGate = function(gateName) {
	var mcInfo = this.decodeMultiControlledGateName(gateName);
	var isMultiControlled = !!this.customGates[gateName] && !!mcInfo && !!mcInfo.numCtrlQubits;
	return isMultiControlled;
};


QuantumCircuit.prototype.isControllableGate = function(gateName) {
	var gateDef = this.basicGates[gateName];
	if(gateDef) {
		if(gateDef.drawingInfo) {
			if(gateDef.drawingInfo.root == "x" || gateDef.drawingInfo.root == "u1") {
				return true;
			}
		}
		for(var gn in this.basicGates) {
			var gateDef = this.basicGates[gn];
			if(gateDef && gateDef.drawingInfo && gateDef.drawingInfo.root && gateDef.drawingInfo.root == gateName) {
				return true;
			}
		}
	}

	return this.isMultiControlledGate(gateName);
};

QuantumCircuit.prototype.getGatePosById = function(gateId) {
	var circuit = this;

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.id == gateId) {
				return {
					wires: gate.wires,
					col: column
				};
			}
		}
	}

	return {
		wires: [],
		col: -1
	};
};

QuantumCircuit.prototype.getGateById = function(gateId) {
	var circuit = this;

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.id == gateId) {
				return gate;
			}
		}
	}

	return null;
};


QuantumCircuit.prototype.getGateBefore = function(column, wire) {
	var gate = null;
	var col = column - 1;
	while(col >= 0 && !gate) {
		gate = this.getGateAt(col, wire);
		col--;
	}
	return gate;
};

QuantumCircuit.prototype.getGateAt = function(column, wire) {
	if(!this.gates[wire] || !this.gates[wire][column]) {
		return null;
	}

	var gate = JSON.parse(JSON.stringify(this.gates[wire][column]));
	if(!gate) {
		return null;
	}

	gate.column = column;
	gate.wires = [];

	var id = gate.id;
	var numWires = this.gates.length;
	for(var wire = 0; wire < numWires; wire++) {
		var g = this.gates[wire][column];
		if(g && g.id == id) {
			gate.wires[g.connector] = wire;
		}
	}
	return gate;
};

QuantumCircuit.prototype.getGatesAtColumn = function(column) {
	var gates = [];
	var numWires = this.gates.length;
	for(var wire = 0; wire < numWires; wire++) {
		var gate = this.getGateAt(column, wire);
		if(gate && gate.connector == 0) {
			gates.push(gate);
		}
	}
	return gates;
};

QuantumCircuit.prototype.getControllableGatesAtColumn = function(column) {
	var gates = this.getGatesAtColumn(column);
	var controllableGates = [];
	for(var i = 0; i < gates.length; i++) {
		var gate = gates[i];
		if(this.isControllableGate(gate.name)) {
			controllableGates.push(gate);
		}
	}
	return controllableGates;
};


QuantumCircuit.prototype.exportJavaScript = function(comment, decompose, exportAsGateName, asJupyter) {
	var self = this;

	var circuit = null;

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var js = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 2 && cline[0] != "/" && cline[1] != "/") {
				js += "// ";
			}
			js += cline;
			js += "\n";
		});
	}

	var indent = "";
	var circuitVar = "";

	if(exportAsGateName) {
		indent = "    ";
		circuitVar = "circ";

		js += "const " + exportAsGateName + " = function() {\n";

		js += indent + "const " + circuitVar + " = new QuantumCircuit(" + circuit.numQubits + ");\n\n";
		if(circuit.params && circuit.params.length) {
			js += indent + circuitVar + ".params = " + JSON.stringify(circuit.params) + "\n\n";
		}
	} else {
		indent = "";
		circuitVar = "circuit";

		js += indent + "const QuantumCircuit = require(\"quantum-circuit\");\n\n";

		js += indent + "const " + circuitVar + " = new QuantumCircuit(" + circuit.numQubits + ");\n\n";

		var usedGates = circuit.usedGates();
		if(!decompose) {
			var customGatesAdded = [];
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						js += customCircuit.exportJavaScript("", true, usedGateName);
						customGatesAdded.push(usedGateName);
					}
				}
			});

			customGatesAdded.map(function(customGateName) {
				js += indent + circuitVar + ".registerGate(\"" + customGateName + "\", " + customGateName + "());\n";
			});

			if(customGatesAdded.length > 0) {
				js += "\n";
			}
		}
	}

	var cregCount = 0;
	for(var cregName in this.cregs) {
		js += indent + circuitVar + ".createCreg(\"" + cregName + "\", " + (this.cregs[cregName].length || 1) + ");\n";
		cregCount++;
	}
	if(cregCount > 0) {
		js += "\n";
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateName = gate.name;

				if(gateName == "measure" && gate.options && gate.options.creg) {
					js += indent + circuitVar + ".addMeasure(" + wire + ", \"" + gate.options.creg.name + "\", " + gate.options.creg.bit + ");\n";
				} else {
					js += indent + circuitVar + ".appendGate(\"" + gate.name + "\"";

					if(gate.wires.length == 1) {
						js += ", ";
						js += gate.wires[0];
					} else {
						js += ", [";
						for(var w = 0; w < gate.wires.length; w++) {
							if(w > 0) {
								js += ",";
							}
							js += gate.wires[w];
						}
						js += "]";
					}

					if(gate.options) {
						var opt = {};
						for(var optKey in gate.options) {
							if(gate.options[optKey]) {
								var obj = gate.options[optKey];
								var skip = false;
								if(typeof obj == "object" && Object.keys(obj).length === 0 && obj.constructor === Object) {
									skip = true;
								}

								if(!skip) {
									opt[optKey] = obj;
								}
							}
						}
						js += ", " + JSON.stringify(opt);
					}
					js += ");\n"
				}
			}
		}
	}

	if(exportAsGateName) {
		js += "\n";
		js += indent + "return " + circuitVar + ";\n";
		js += "};\n\n";
	} else {
		js += "\n";

		js += indent + circuitVar + ".run();\n\n";

		js += indent + "console.log(\"Probabilities:\");\n";
		js += indent + "console.log(JSON.stringify(circuit.probabilities()));\n\n";
		js += indent + "console.log(\"Measure all:\");\n";
		js += indent + "console.log(JSON.stringify(circuit.measureAll()));\n\n";
		if(circuit.cregCount()) {
			js += indent + "console.log(\"Classical registers:\");\n";
			js += indent + "console.log(circuit.cregsAsString());\n\n";
		}
	}


	if(asJupyter) {
		var notebook = {
			"metadata": {
				"kernelspec": {
					"display_name": "Javascript (Node.js)",
					"language": "javascript",
					"name": "javascript"
				},
				"language_info": {
					"file_extension": ".js",
					"mimetype": "application/javascript",
					"name": "javascript"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: js,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return js;
};

// This function is deprecated. Use exportToQiskit() instead
QuantumCircuit.prototype.exportQiskit = function(comment, decompose, exportAsGateName, versionStr, providerName, backendName, asJupyter, shots, circuitReplacement, insideSubmodule, hybrid, encoderDecoder) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		providerName: providerName,
		backendName: backendName,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder
	};
	
	return this.exportToQiskit(options, exportAsGateName, circuitReplacement, insideSubmodule);
};


//added by suraj
// This function is deprecated. Use exportToCudaQ() instead
QuantumCircuit.prototype.exportCudaQ = function(comment, decompose, exportAsGateName, versionStr, providerName, backendName, asJupyter, shots, circuitReplacement, insideSubmodule, hybrid, encoderDecoder) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		providerName: providerName,
		backendName: backendName,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder
	};

	return this.exportToCudaQ(options, exportAsGateName, circuitReplacement, insideSubmodule);
};

// This function is deprecated. Use exportToQuEST() instead
QuantumCircuit.prototype.exportQuEST = function(comment, decompose, exportAsGateName, definedFunc) {
	var newOptions = {
		comment: comment,
		decompose: decompose
	};

	return this.exportToQuEST(newOptions, exportAsGateName, definedFunc);
};

// This function is deprecated. Use exportToQASM() instead
QuantumCircuit.prototype.exportQASM = function(comment, decompose, exportAsGateName, circuitReplacement, compatibilityMode, insideSubmodule) {
	var options = {
		comment: comment,
		decompose: decompose,
		compatibilityMode: compatibilityMode
	};
	
	return this.exportToQASM(options, exportAsGateName, circuitReplacement, insideSubmodule)	
};


QuantumCircuit.prototype.importQASM = function(input, errorCallback, compatibilityMode) {
	this.init();
	QASMImport(this, input, errorCallback, compatibilityMode);
};


// This function is deprecated. Use exportToPyquil() instead
QuantumCircuit.prototype.exportPyquil = function(comment, decompose, exportAsGateName, versionStr, lattice, asQVM, asJupyter, shots, hybrid, encoderDecoder) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		lattice: lattice,
		asQVM: asQVM,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder
	};
	return this.exportToPyquil(options, exportAsGateName);
}

// This function is deprecated. Use exportToQuil() instead
QuantumCircuit.prototype.exportQuil = function(comment, decompose, exportAsGateName, versionStr) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr
	};

	return this.exportToQuil(options, exportAsGateName);
};


QuantumCircuit.prototype.importQuil = function(quil, errorCallback, options, qubitNames, renamedGates, lineOffset) {
	var self = this;

	options = options || {};

	self.init();

	renamedGates = renamedGates || {};
	lineOffset = lineOffset || 0;

	function getGateInfo(gateName) {
		if(self.customGates && self.customGates[gateName]) {
			return { name: gateName, customGate: self.customGates[gateName] };
		}

		for(var gname in self.basicGates) {
			var gdef = self.basicGates[gname];
			if(gdef.exportInfo) {
				if(gdef.exportInfo.quil && gdef.exportInfo.quil.name == gateName) {
					return { name: gname, gateDef: gdef, quilDef: gdef.exportInfo.quil };
				}
				if(gdef.exportInfo.pyquil && gdef.exportInfo.pyquil.name == gateName) {
					return { name: gname, gateDef: gdef, quilDef: gdef.exportInfo.pyquil };
				}
			}
		}

		return null;
	}


	var lines = quil.split("\n");

	var commands = [];
	var multiline = false;
	lines.map(function(line, lineIndex) {
		// remove comments
		line = line.split("#")[0];

		if(!line.length) {
			multiline = false;
		} else {
			// remove leading and trailing spaces
			line = line.trim();
		}

		if(!multiline) {
			if(line.length) {
				var clines = line.split(";");
				var codelines = [];
				clines.map(function(cline) {
					if(cline.trim().length) {
						codelines.push(cline.trim());
					}
				});

				codelines.map(function(codeline) {

					var tokens = codeline.split(" ");
					var lastToken = tokens[tokens.length - 1];
					if(lastToken.length) {
						if(lastToken[lastToken.length - 1] == ":") {
							multiline = true;
							// remove ":"
							lastToken = lastToken.substring(0, lastToken.length - 1);
							tokens[tokens.length - 1] = lastToken;
						}

						if(tokens.length) {
							var type = "GATE";
							if(tokens[0] == "DEFGATE" || tokens[0] == "DEFCIRCUIT") {
								type = tokens[0];
								tokens.splice(0, 1);
							}

							var name = tokens.join(" ");

							var params = [];
							var paramStart = name.indexOf("(");
							if(paramStart >= 0) {
								var paramEnd = name.indexOf(")");
								if(paramEnd > paramStart) {
									params = name.substring(paramStart + 1, paramEnd).split(",");
									params.map(function(par, ndx) {
										par = par.trim();
										while(par.length && par[0] == "%") {
											par = par.slice(1);
										}
										params[ndx] = par;
									});

									if((paramEnd + 1) <= name.length) {
										tok = name.substring(paramEnd + 1, name.length).split(" ");

										tokens = [];
										tok.map(function(tk) {
											tk = tk.trim(); 
											if(tk.length) {
												tokens.push(tk);
											}
										});
									} else {
										tokens = [];
									}

									name = name.substring(0, paramStart).trim();
								}
							} else {
								name = tokens.splice(0, 1)[0].trim();
							}

							var args = [];
							for(var t = 0; t < tokens.length; t++) {
								var token = tokens[t];
								if(qubitNames) {
									var qindex = qubitNames.indexOf(token);
									if(qindex >= 0) {
										args.push(qindex);
									} else {
										args.push(token);
									}
								} else {
									args.push(token);
								}
							}

							commands.push({ type: type, name: name, params: params, args: args, body: [], line: lineIndex, col: 0 });
						}
					}
				});
			}
		} else {
			var codelines = line.split(";");
			codelines.map(function(codeline) {
				if(codeline.trim().length) {
					commands[commands.length - 1].body.push(codeline.trim());
				}
			});
		}
	});

	var commandCount = commands.length;
	for(var commandIndex = 0; commandIndex < commandCount; commandIndex++) {
		var command = commands[commandIndex];

		if(renamedGates[command.name]) {
			command.name = renamedGates[command.name];
		}

		switch(command.type) {
			case "DEFGATE": {
				if(command.name == command.name.toUpperCase()) {
					var newName = command.name.toLowerCase();
					renamedGates[command.name] = newName;
					command.name = newName;
				}

				// NOT IMPLEMENTED YET !!!

			}; break;

			case "DEFCIRCUIT": {
				if(command.name == command.name.toUpperCase()) {
					var newName = command.name.toLowerCase();
					renamedGates[command.name] = newName;
					command.name = newName;
				}

				var subQuil = command.body.join("\n");
				var subQubitNames = command.args;
				var subCircuit = new QuantumCircuit();

				subCircuit.importQuil(subQuil, errorCallback, options, subQubitNames, renamedGates, command.line + 1);

				subCircuit.params = JSON.parse(JSON.stringify(command.params));

				self.registerGate(command.name, subCircuit.save());
			}; break;

			case "GATE": {
				switch(command.name) {
					case "DECLARE": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "DEFFRAME": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "DEFWAVEFORM": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "PULSE": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "SET-FREQUENCY":
					case "SHIFT-FREQUENCY": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "SET-PHASE":
					case "SHIFT-PHASE": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "SET-SCALE": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "CAPTURE":
					case "RAW-CAPTURE": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "FENCEALL": {
						var gateInfo = getGateInfo("FENCE");
						if(!gateInfo) {
							var errorMessage = "Cannot recognize \"" + command.name + "\".";
							if(errorCallback) {
								errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
								return;
							} else {
								throw new Error(errorMessage);
							}
						}

						var destCol = self.lastNonEmptyPlace([0, self.numQubits - 1], false);
						destCol += 1;
						for(var destWire = 0; destWire < self.numQubits; destWire++) {
							self.addGate(gateInfo.name, destCol, destWire);
						}
					}; break;

					case "DELAY": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "HALT": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					case "PRAGMA": {
						// NOT IMPLEMENTED YET !!!
					}; break;

					default: {
						var gateInfo = getGateInfo(command.name);
						if(!gateInfo) {
							var errorMessage = "Cannot recognize \"" + command.name + "\".";
							if(errorCallback) {
								errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
								return;
							} else {
								throw new Error(errorMessage);
							}
						} else {
							var params = {};

							if(gateInfo.gateDef) {
								var gateDef = gateInfo.gateDef;
								var quilDef = gateInfo.quilDef;

								if((quilDef.params || []).length != (command.params || []).length) {
									var errorMessage = "Invalid number of params. Expected " + (quilDef.params || []).length + " got " + (command.params || []).length + ".";
									if(errorCallback) {
										errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
										return;
									} else {
										throw new Error(errorMessage);
									}
								} else {

									for(var i = 0; i < gateDef.params.length; i++) {
										var paramName = gateDef.params[i];

										var paramIndex = quilDef.params.indexOf(paramName);

										if(paramIndex < 0 || paramIndex >= command.params.length) {
											var errorMessage = "Internal error: QUIL definition for gate \"" + command.name + " is invalid.";
											if(errorCallback) {
												errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
												return;
											} else {
												throw new Error(errorMessage);
											}
										} else {
											params[paramName] = command.params[paramIndex];
										}
									}
								}
							} else {
								var gateDef = gateInfo.customGate;
								if((gateDef.params || []).length != (command.params || []).length) {
									var errorMessage = "Invalid number of params. Expected " + (gateDef.params || []).length + " got " + (command.params || []).length + ".";
									if(errorCallback) {
										errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
										return;
									} else {
										throw new Error(errorMessage);
									}
								} else {
									for(var i = 0; i < gateDef.params.length; i++) {
										var paramName = gateDef.params[i];
										params[paramName] = command.params[i];
									}
								}
							}

							// Check if number of arguments match gateDef
							if(command.name == "MEASURE") {
								if(command.args.length != 2) {
									var errorMessage = "Expecting 2 arguments (qubit and target register) but found " + command.args.length + ".";
									if(errorCallback) {
										errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
										return;
									} else {
										throw new Error(errorMessage);
									}
								}
							} else {
								var qubitCount = 1;
								if(gateDef.numQubits) {
									qubitCount = gateDef.numQubits;
								} else {
									if(gateDef.matrix && gateDef.matrix.length) {
										qubitCount = math.log2(gateDef.matrix.length);
									}
								}

								if(command.args.length != qubitCount) {
									var errorMessage = "Expecting " + qubitCount + " arguments but found " + command.args.length + ".";
									if(errorCallback) {
										errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
										return;
									} else {
										throw new Error(errorMessage);
									}
								}
							}

							var args = [];
							var creg = {};
							for(var i = 0; i < command.args.length; i++) {
								var arg = command.args[i];
								if(command.name == "MEASURE") {

									var cregStart = arg.indexOf("[");
									if(cregStart >= 0) {
										var cregEnd = arg.indexOf("]");
										if(cregEnd > cregStart) {
											cregBit = arg.substring(cregStart + 1, cregEnd);
											cregName = arg.substring(0, cregStart);

											creg = {
												bit: cregBit,
												name: cregName
											};
										}
									} else {
										var argInt = parseInt(arg);
										if(isNaN(argInt)) {
											if(i > 0) {
												args.push(arg);
											} else {
												var errorMessage = "Invalid argument \"" + arg + "\"";
												if(errorCallback) {
													errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
													return;
												} else {
													throw new Error(errorMessage);
												}
											}
										}
										args.push(argInt);
									}
								} else {
									var argInt = parseInt(arg);
									if(isNaN(argInt)) {
										var errorMessage = "Invalid argument \"" + arg + "\"";
										if(errorCallback) {
											errorCallback([ { msg: errorMessage, line: lineOffset + command.line, col: command.col } ]);
											return;
										} else {
											throw new Error(errorMessage);
										}
									}
									args.push(argInt);
								}
							}

							self.appendGate(gateInfo.name, args, { params: params, creg: creg });
						}
					}
				}

			}; break;
		}
	}

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if(errorCallback) {
		errorCallback([]);
	}
};


QuantumCircuit.prototype.importIonq = function(data, errorCallback) {
	var self = this;

	var numQubits = data.qubits || 1;

	self.init(numQubits);

	if(!data.circuit) {
		var errorMessage = "Invalid file format.";
		if(errorCallback) {
			errorCallback([ { msg: errorMessage, line: -1, col: -1 } ]);
			return;
		} else {
			throw new Error(errorMessage);
		}
	}

	function getGateInfo(gateName) {
		if(self.customGates && self.customGates[gateName]) {
			return { name: gateName, customGate: self.customGates[gateName] };
		}

		for(var gname in self.basicGates) {
			var gdef = self.basicGates[gname];
			if(gdef.exportInfo) {
				if(gdef.exportInfo.ionq && 
					(
						(gdef.exportInfo.ionq.name && gdef.exportInfo.ionq.name == gateName) ||
						(gdef.exportInfo.ionq.names && gdef.exportInfo.ionq.names.indexOf(gateName) >= 0)
					)
				) {
					return { name: gname, gateDef: gdef };
				}
			}
		}

		return null;
	}

	data.circuit.map(function(ionqGate) {
		var gateInfo = getGateInfo(ionqGate.gate);
		if(!gateInfo) {
			var errorMessage = "Unknown gate \"" + ionqGate.gate + "\"";
			if(errorCallback) {
				errorCallback([ { msg: errorMessage, line: -1, col: -1 } ]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		var wires = [];
		if(typeof ionqGate.control != "undefined") {
			wires.push(ionqGate.control);
		}
		if(typeof ionqGate.controls != "undefined") {
			wires = wires.concat(ionqGate.controls);
		}
		if(typeof ionqGate.target != "undefined") {
			wires.push(ionqGate.target);
		}
		if(typeof ionqGate.targets != "undefined") {
			wires = wires.concat(ionqGate.targets);
		}

		var params = [];
		if(typeof ionqGate.rotation != "undefined") {
			params.push(ionqGate.rotation);
		}
		if(typeof ionqGate.phase != "undefined") {
			params.push(ionqGate.phase);
		}
		if(typeof ionqGate.phases != "undefined") {
			params = params.concat(ionqGate.phases);
		}

		var gateQubits = gateInfo.gateDef ? (gateInfo.gateDef.matrix ? math.log2(gateInfo.gateDef.matrix.length) : 1) : (gateInfo.customGate.numQubits || 1);

		var gateParams = gateInfo.gateDef ? (gateInfo.gateDef.params || []) : (gateInfo.customGate.params || []);


		if(wires.length != gateQubits) {
			var errorMessage = "Gate \"" + ionqGate.gate + "\": invalid number of qubits. Expected " + gateQubits + " but got " + wires.length + ".";
			if(errorCallback) {
				errorCallback([ { msg: errorMessage, line: -1, col: -1 } ]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		if(params.length != gateParams.length) {
			var errorMessage = "Gate \"" + ionqGate.gate + "\": invalid number of params. Expected " + gateParams.length + " but got " + params.length + ".";
			if(errorCallback) {
				errorCallback([ { msg: errorMessage, line: -1, col: -1 } ]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		var options = {};

		if(params.length) {
			options.params = {};
			gateParams.map(function(paramName, paramIndex) {
				options.params[paramName] = ionqGate.rotation ? params[paramIndex] : 2 * math.pi * params[paramIndex];
			});
		}

		self.appendGate(gateInfo.name, wires, options);
	});

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if(errorCallback) {
		errorCallback([]);
	}
};


QuantumCircuit.prototype.exportToIonq = function(options, circuitReplacement) {
	options = options || {};

	var self = this;
	
	var globalParams = this.options && this.options.params ? this.options.params : {};
	var globalParams = JSON.parse(JSON.stringify(globalParams));
	for(var globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	// ---
	// decompose circuit
	var circuit = new QuantumCircuit();
	circuit.load(this.save(true));
	// ---

	var ionqCircuit = {
		qubits: circuit.numQubits,
		circuit: []
	};

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);

			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);

				if(gateDef.exportInfo && gateDef.exportInfo.ionq) {
					if(gateDef.exportInfo.ionq.name || gateDef.exportInfo.ionq.names) {
						var ionqGate = {
							gate: gateDef.exportInfo.ionq.name || gateDef.exportInfo.ionq.names[0]
						};

						if(gateDef.params && gateDef.params.length) {
							ionqGate[gateDef.exportInfo.ionq.paramsKey] = [];
							gateDef.params.map(function(paramName) {
								var paramValue = math.evaluate(gate.options.params[paramName], globalParams);
								if(gateDef.exportInfo.ionq.paramsKey != "rotation") {
									paramValue = paramValue / (2 * math.pi);
								}
								ionqGate[gateDef.exportInfo.ionq.paramsKey].push(paramValue);
							});
						}

						ionqCircuit.circuit.push(ionqGate);
					} else {
						var ionqGate = {
							gate: "Export gate \"" + gate.name + "\" to IONQ not supported yet. Comming soon."
						};
						ionqCircuit.circuit.push(ionqGate);
					}
				} else {
					var ionqGate = {
						gate: "Export gate \"" + gate.name + "\" to IONQ not supported yet. Comming soon."
					};
					ionqCircuit.circuit.push(ionqGate);
				}
			}
		}
	}
	
	return ionqCircuit;
};



QuantumCircuit.prototype.exportQuirk = function() {
	var self = this;

	circuit = new QuantumCircuit();
	circuit.load(this.save(true));

	var quirk = {
		cols: [],
		gates: []
	};

	var numQubits = circuit.numQubits;
	var emptyColumn = [];
	for(var wire = 0; wire < numQubits; wire++) {
		emptyColumn.push(1);
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		quirk.cols.push(JSON.parse(JSON.stringify(emptyColumn)));
	}

	var quirkCol = 0;
	var processedGateIds = [];
	for(var column = 0; column < numCols; column++) {
		var columnGotControl = false;
		var quirkName = "";
		var ignoreSubsequent = false;
		var firstGateInColumn = true;
		for(var wire = 0; wire < numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate) {
				var gateDef = circuit.basicGates[gate.name];
				var quirkInfo = gateDef.exportInfo.quirk || {};

				var firstOcurence = processedGateIds.indexOf(gate.id) < 0;
				if(firstOcurence) {

					processedGateIds.push(gate.id);

					ignoreSubsequent = false;
					if(quirkInfo.name) {
						definedGate = false;
						quirkName = quirkInfo.name;
					} else {
						definedGate = true;
						quirkName = "~" + gate.name;

						if(gateDef.params.length && gate.options.params) {
							var globalParams = circuit.options && circuit.options.params ? circuit.options.params : {};

							gateDef.params.map(function(param){
								angle = math.round(math.evaluate(gate.options.params[param], globalParams), 7);
								quirkName += "_" + angle;
							});
						}

						var minWire = math.min(gate.wires);
						var maxWire = math.max(gate.wires);
						var targetWires = [];
						gate.wires.map(function(tWire) {
							var wIndex = tWire - minWire;
							targetWires.push(wIndex);
							quirkName += "_" + wIndex;
						});

						var alreadyDefined = quirk.gates.find(function(gt) {
							return gt.id == quirkName;
						});

						if(!alreadyDefined) {
							var rawMatrix = circuit.getRawGate(gateDef, gate.options);

							var gateMatrix = circuit.transformMatrix((maxWire - minWire) + 1, rawMatrix, targetWires);

							var matrix = "{";
							gateMatrix.map(function(row, rowIndex) {
								if(rowIndex > 0) {
									matrix += ",";
								}
								matrix += "{";
								
								row.map(function(col, colIndex) {
									if(colIndex > 0) {
										matrix += ",";
									}

									if(typeof col != "object") {
										col = math.complex(col).toString();
									} else {
										col = col.toString();
									}

									matrix += col;
								});
								matrix += "}";
							});
							matrix += "}";

							quirk.gates.push({
								id: quirkName,
								matrix: matrix
							});
						}
					}

					if(!firstGateInColumn && !columnGotControl) {
						columnGotControl = !!quirkInfo.controlQubits;
					}

					if(columnGotControl) {
						quirk.cols.splice(quirkCol + 1, 0, JSON.parse(JSON.stringify(emptyColumn)));
						quirkCol++;
					} else {
						columnGotControl = !!quirkInfo.controlQubits;
					}

					firstGateInColumn = false;
				}

				if(!ignoreSubsequent) {
					if(gate.connector < quirkInfo.controlQubits) {
						quirk.cols[quirkCol][wire] = "•";
					} else {
						quirk.cols[quirkCol][wire] = quirkName;
					}
				}

				ignoreSubsequent = definedGate;
			}
		}
		quirkCol++;
	}

	return quirk;
};


QuantumCircuit.prototype.exportCirq = function(comment, decompose, exportAsGateName, versionStr, asJupyter, shots, exportTfq) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots,
		exportTfq: exportTfq
	};
	return this.exportToCirq(options, exportAsGateName);
}


QuantumCircuit.prototype.exportQSharp = function(comment, decompose, exportAsGateName, versionStr, asJupyter, circuitName, indentDepth) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		circuitName: circuitName,
		indentDepth: indentDepth
	};
	return this.exportToQSharp(options, exportAsGateName);
}

QuantumCircuit.prototype.exportQobj = function(circuitName, experimentName, numShots, circuitReplacement) {
	var options = {
		circuitName: circuitName,
		experimentName: experimentName,
		numShots: numShots
	};
	
	return this.exportToQobj(options, circuitReplacement)	
}


QuantumCircuit.prototype.importQobj = function(qobj, errorCallback) {
	var self = this;

	this.init();

	if(!qobj || !qobj.experiments || !qobj.experiments.length) {
		if(errorCallback) {
			errorCallback([ { msg: "Invalid input file: no experiments found." } ]);
		}
		return;
	}

	var experiment = qobj.experiments[0];

	var header = experiment.header || {};

	// Add qubits
	this.init(parseInt(header.n_qubits || 0));

	// Classical registers
	var cregData = {};
	if(header.creg_sizes && header.creg_sizes.length) {
		var totalBits = 0;
		for(var i = 0; i < header.creg_sizes.length; i++) {
			var cregDef = header.creg_sizes[i];
			if(cregDef.length > 1) {
				var cregName = cregDef[0] + "";
				var cregLen = parseInt(cregDef[1]);
				this.createCreg(cregName, cregLen);

				var cregMask = ((1 << (totalBits + cregLen)) - (1 << totalBits));

				cregData[cregName] = {
					mask: cregMask,
					offset: totalBits
				};

				totalBits += cregLen;
			}
		}
	}

	// Return classical condition argument for gate from bfunc mask and value
	function conditionFromMaskAndValue(mask, value) {
		for(var cregName in cregData) {
			var data = cregData[cregName];

			if(data.mask == mask) {
				return {
					creg: cregName,
					value: value >> data.offset
				}
			}
		}
	}

	// Obtain classical register name and local bit number from global bit number
	function memoryToCreg(memory) {
		var totalBits = 0;
		for(var cregName in self.cregs) {
			var creg = self.cregs[cregName];
			if((totalBits + creg.length) > memory) {
				return {
					name: cregName,
					bit: memory - totalBits
				};
			}
			totalBits += creg.length;
		}
		return null;
	}

	// Add gates
	var instructions = experiment.instructions || [];
	var conditions = {};
	for(var instIndex = 0; instIndex < experiment.instructions.length; instIndex++) {
		var inst = experiment.instructions[instIndex];

		switch(inst.name) {
			// classical control
			case "bfunc": {
				var condition = conditionFromMaskAndValue(parseInt(inst.mask), parseInt(inst.val));

				if(!condition) {
					var errorMessage = "Invalid classical condition.";
					if(errorCallback) {
						errorCallback([ { msg: errorMessage } ]);
						return;
					} else {
						throw new Error(errorMessage);
					}
				}

				conditions[inst.register] = condition;
			}; break;

			// Measurement
			case "measure": {
				for(var qIndex = 0; qIndex < inst.qubits.length; qIndex++) {
					var qubit = inst.qubits[qIndex];
					var memory = inst.memory[qIndex];
					var creg = memoryToCreg(memory);
					if(!creg) {
						var errorMessage = "Invalid measurement destination.";
						if(errorCallback) {
							errorCallback([ { msg: errorMessage } ]);
							return;
						} else {
							throw new Error(errorMessage);
						}					
					}

					var options = { creg: creg };

					this.appendGate("measure", qubit, options);
				}
			}; break;

			case "barrier": {
				// !!! Not implemented yet. Ignore for now.
			}; break;

			// Normal gate
			default: {
				var options = {
					params: {},
					condition: {}
				};

				// Find gate definition
				var gateName = inst.name;
				switch(gateName) {
					case "iden": gateName = "id"; break;
				}

				var gateDef = this.basicGates[gateName];
				if(!gateDef) {
					var errorMessage = "Unknown gate \"" + inst.name + "\".";
					if(errorCallback) {
						errorCallback([ { msg: errorMessage } ]);
						return;
					} else {
						throw new Error(errorMessage);
					}
				}

				// Gate params (if any)
				if(gateDef.params && gateDef.params.length) {
					if(!inst.params || !inst.params.length || inst.params.length != gateDef.params.length) {
						var errorMessage = "Invalid number of params for gate \"" + inst.name + "\".";
						if(errorCallback) {
							errorCallback([ { msg: errorMessage } ]);
							return;
						} else {
							throw new Error(errorMessage);
						}
					}

					for(var parIndex = 0; parIndex < gateDef.params.length; parIndex++) {
						var paramName = gateDef.params[parIndex];
						options.params[paramName] = inst.params[parIndex];
					}
				}

				// Classical control (if any)
				if(typeof inst.conditional != "undefined") {
					var condition = conditions[inst.conditional];
					if(!condition) {
						var errorMessage = "Invalid classical condition.";
						if(errorCallback) {
							errorCallback([ { msg: errorMessage } ]);
							return;
						} else {
							throw new Error(errorMessage);
						}
					}
					options.condition = condition;
				}

				// Add gate to circuit
				this.appendGate(gateName, inst.qubits, options);
			}
		}
	}

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if(errorCallback) {
		errorCallback([]);
	}
};

QuantumCircuit.prototype.exportTFQ = function(comment, decompose, exportAsGateName, versionStr, asJupyter, shots) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots
	};
	return this.exportToTFQ(options, exportAsGateName);
}

QuantumCircuit.prototype.exportBraket = function(comment, decompose, exportAsGateName, versionStr, asJupyter, shots, hybrid, encoderDecoder, indentDepth) {
	var options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder,
		indentDepth: indentDepth
	};

	return this.exportToBraket(options, exportAsGateName);
}

QuantumCircuit.prototype.exportSVG = function(embedded, options) {
	var newOptions = options || {};
	newOptions.embedded = !!embedded;

	return this.exportToSVG(newOptions);
};

QuantumCircuit.prototype.exportToSVG = function(options) {
	var self = this;
	var options = options || {};

	options.embedded = options.embedded || false;
	options.cellWidth = options.cellWidth || 40;
	options.cellHeight = options.cellHeight || 40;
	options.hSpacing = options.hSpacing || 28;
	options.vSpacing = options.vSpacing || 34;
	options.blackboxPaddingX = options.blackboxPaddingX || 2;
	options.blackboxPaddingY = options.blackboxPaddingY || 2;
	options.blackboxLineColor = options.blackboxLineColor || "black";
	options.blackboxSelectedLineColor = options.blackboxSelectedLineColor || "black";
	options.wireColor = options.wireColor || "black";
	options.gateLineColor = options.gateLineColor || "black";
	options.gateSelectedLineColor = options.gateSelectedLineColor || "black";
	options.cWireColor = options.cWireColor || "silver";
	options.cWireSelectedColor = options.cWireSelectedColor || "silver";
	options.cArrowSize = options.cArrowSize || 10;
	options.hWireColor = options.hWireColor || "black";
	options.edWireColor = options.edWireColor || "black";
	options.wireWidth = options.wireWidth || 1;
	options.wireTextHeight = options.wireTextHeight || 8;
	options.wireTextDown = options.wireTextDown || 16;
	options.wireMargin = options.wireMargin || 20;
	options.wireLabelWidth = options.wireLabelWidth || 40;
	options.dotRadius = options.dotRadius || 5;
	options.paramTextHeight = options.paramTextHeight || 6;
	options.selectionPaddingX = options.selectionPaddingX || 4;
	options.selectionPaddingY = options.selectionPaddingY || 4;
	options.selectionLineColor = options.selectionLineColor || "#2185D0";
	options.drawBlochSpheres = options.drawBlochSpheres || false;

	if(typeof options.drawHybrid == "undefined") {
		options.drawHybrid = this.options ? !!this.options.hybrid : false;
	}

	if(typeof options.encoderDecoder == "undefined") {
		options.drawEncoderDecoder = this.options ? !!this.options.encoderDecoder : false;
	}

	var numRows = this.numQubits;
	var numCols = this.numCols();
	var numCregs = this.cregCount();

	var columnOffset = 0;

	var paddingTop = 0;

	var totalCols = numCols;

	// reserve col for bloch spheres
	if(options.drawBlochSpheres) {
		totalCols++;
	}

	var totalWireCols = totalCols;

	// reserve 2 cols for hybrid quantum-classical connector
	if(options.drawHybrid) {
		totalCols += 2;
	}

	// reserve 2 cols for encoder/decoder connector
	if(options.drawEncoderDecoder) {
		columnOffset = 1;
		totalCols += 2;
		totalWireCols += 1;
		paddingTop = options.cellHeight + options.vSpacing;
	}

	var getCellX = function(col) {
		return options.wireLabelWidth + ((options.cellWidth + options.hSpacing) * col) + options.hSpacing;
	};

	var getCellY = function(wire) {
		return ((options.cellHeight + options.vSpacing) * wire) + options.vSpacing + paddingTop;
	};

	var totalWidth = getCellX(totalCols);
	var totalWireWidth = getCellX(totalWireCols);
	var totalHeight = ((options.cellHeight + options.vSpacing) * (numRows + numCregs + (options.drawHybrid ? 1 : 0))) + options.vSpacing + paddingTop;

	var hybridWireY = ((options.cellHeight + options.vSpacing) * (numRows + numCregs)) + options.vSpacing + (options.cellHeight / 2) + paddingTop;

	var getCregIndex = function(name) {
		var cregIndex = 0;
		for(var cregName in self.cregs) {
			if(cregName == name) {
				return cregIndex;
			}
			cregIndex++;
		}
		return cregIndex;
	};


	var polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	};

	var describeArc = function(x, y, radius, startAngle, endAngle) {
		var start = polarToCartesian(x, y, radius, endAngle);
		var end = polarToCartesian(x, y, radius, startAngle);

		var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		var d = [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
		].join(" ");

		return d;
	};

	var qWireY = function(wire) {
		return ((options.cellHeight + options.vSpacing) * wire) + (options.vSpacing + (options.cellHeight / 2)) + paddingTop;
	};

	var qGateY = function(wire) {
		return ((options.cellHeight + options.vSpacing) * wire) + options.vSpacing + paddingTop;
	};

	var cWireY = function(cregName) {
		return ((options.cellHeight + options.vSpacing) * (numRows + getCregIndex(cregName))) + (options.vSpacing + (options.cellHeight / 2)) + paddingTop;
	};

	var gateCoverSVG = function(gateX, gateY, gateWidth, gateHeight) {
		var res = "";

		res += "<rect class=\"qc-gate-cover\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"none\" fill=\"transparent\" stroke-width=\"0\" />";

		return res;
	};

	var gateBoxSVG = function(gateX, gateY, gateName, gateLabel, selected, cover) {

		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;

		var res = "";

		res += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\">" + gateLabel + "</text>";
		}

		if(cover) {
			res += gateCoverSVG(gateX, gateY, gateWidth, gateHeight);
		}

		return res;
	};


	var gateBarrierSVG = function(gateX, gateY, gateName, selected, cover) {

		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight + options.vSpacing;

		var res = "";

		var lineX = gateX + (gateWidth / 2);

		var topPos = gateY - (options.vSpacing / 2);
		res += "<line class=\"qc-gate-barrier-line\" x1=\"" + lineX + "\" y1=\"" + topPos + "\" x2=\"" + lineX + "\" y2=\"" + (topPos + gateHeight) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" stroke-dasharray=\"5,5\" />";

		if(cover) {
			res += gateCoverSVG(gateX, gateY, gateWidth, gateHeight);
		}

		return res;
	};

	var gateRectSVG = function(gateX, gateY, gateName, gateLabel, selected, cover) {

		var gateWidth = options.cellWidth * 2;
		var gateHeight = options.cellHeight;

		var res = "";

		res += "<rect class=\"qc-gate-rect\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">" + gateLabel + "</text>";
		}

		if(cover) {
			res += gateCoverSVG(gateX, gateY, gateWidth, gateHeight);
		}

		return res;
	};

	var gateCircleSVG = function(cellX, cellY, gateName, gateLabel, selected, cover) {
		var centerX = cellX + (options.cellWidth / 2);
		var centerY = cellY + (options.cellHeight / 2);

		var gateWidth = options.cellWidth * 0.8;
		var gateHeight = options.cellHeight * 0.8;
		var gateX = cellX + ((options.cellWidth - gateWidth) / 2);
		var gateY = cellY + ((options.cellHeight - gateHeight) / 2);

		var res = "";

		res += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">" + gateLabel + "</text>";
		}

		if(cover) {
			res += gateCoverSVG(cellX, cellY, options.cellWidth, options.cellHeight);
		}

		return res;
	};

	var gateNotSVG = function(cellX, cellY, gateName, selected, cover) {
		var centerX = cellX + (options.cellWidth / 2);
		var centerY = cellY + (options.cellHeight / 2);

		var gateWidth = options.cellWidth * 0.8;
		var gateHeight = options.cellHeight * 0.8;
		var gateX = cellX + ((options.cellWidth - gateWidth) / 2);
		var gateY = cellY + ((options.cellHeight - gateHeight) / 2);


		var res = "";

		res += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-not-line\" x1=\"" + centerX + "\" x2=\"" + centerX + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-not-line\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + centerY +"\" y2=\"" + centerY + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" />";

		if(cover) {
			res += gateCoverSVG(cellX, cellY, options.cellWidth, options.cellHeight);
		}

		return res;
	};

	var gateGaugeSVG = function(gateX, gateY, gateName, selected, cover) {
		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;
		var centerX = gateX + (gateWidth / 2);
		var centerY = gateY + (gateHeight / 2);
		var movedown = gateHeight / 5;

		var res = "";

		res += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		res += "<path class=\"gc-gate-gauge-arc\" d=\"" + describeArc(centerX, centerY + movedown, gateWidth / 2.3, 300, 60) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" fill=\"none\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-gauge-scale\" x1=\"" + centerX + "\" x2=\"" + ((gateX + gateWidth) - movedown) + "\" y1=\"" + (centerY + movedown) + "\" y2=\"" + (gateY + movedown) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" />";

		if(cover) {
			res += gateCoverSVG(gateX, gateY, gateWidth, gateHeight);
		}

		return res;
	};

	var gateXSVG = function(cellX, cellY, gateName, selected, cover) {
		var gateWidth = options.cellWidth * 0.4;
		var gateHeight = options.cellHeight * 0.4;
		var gateX = cellX + ((options.cellWidth - gateWidth) / 2);
		var gateY = cellY + ((options.cellHeight - gateHeight) / 2);

		var res = "";
		res += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + (gateY + gateHeight) +"\" y2=\"" + gateY + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.gateLineColor) + "\" stroke-width=\"1\" />";

		if(cover) {
			res += gateCoverSVG(cellX, cellY, options.cellWidth, options.cellHeight);
		}

		return res;
	};

	var gateDotSVG = function(cellX, cellY, gateName, selected, cover) {
		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;
		var centerX = cellX + (gateWidth / 2);
		var centerY = cellY + (gateHeight / 2);

		var res = "";
		res += "<circle class=\"qc-gate-dot\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" r=\"" + options.dotRadius + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.wireColor) + "\" fill=\"" + (selected ? options.gateSelectedLineColor : options.wireColor) + "\" stroke-width=\"1\" />";

		if(cover) {
			res += gateCoverSVG(cellX, cellY, gateWidth, gateHeight);
		}

		return res;
	};

	var gateInvertedDotSVG = function(cellX, cellY, gateName, selected, cover) {
		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;
		var centerX = cellX + (gateWidth / 2);
		var centerY = cellY + (gateHeight / 2);

		var res = "";
		res += "<circle class=\"qc-gate-ndot\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" r=\"" + options.dotRadius + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.wireColor) + "\" fill=\"white\" stroke-width=\"1\" />";

		if(cover) {
			res += gateCoverSVG(cellX, cellY, gateWidth, gateHeight);
		}

		return res;
	};

	var gateSVG = function(gateX, gateY, gateName, gateLabel, connector, drawBox, selected, cover) {
		var res = "";

		if(connector != "box" && drawBox) {
			res += gateBoxSVG(gateX, gateY, gateName, "", selected, cover);
		}

		switch(connector) {
			case "box": res += gateBoxSVG(gateX, gateY, gateName, gateLabel, selected, cover); break;
			case "rect": res += gateRectSVG(gateX, gateY, gateName, gateLabel, selected, cover); break;
			case "circle": res += gateCircleSVG(gateX, gateY, gateName, gateLabel, selected, cover); break;
			case "not": res += gateNotSVG(gateX, gateY, gateName, selected, cover); break;
			case "x": res += gateXSVG(gateX, gateY, gateName, selected, cover); break;
			case "dot": res += gateDotSVG(gateX, gateY, gateName, selected, cover); break;
			case "ndot": res += gateInvertedDotSVG(gateX, gateY, gateName, selected, cover); break;
			case "gauge": res += gateGaugeSVG(gateX, gateY, gateName, selected, cover); break;
			case "barrier": res += gateBarrierSVG(gateX, gateY, gateName, selected, cover); break;
		}

		return res;
	};

	var drawGate = function(gate, colIndex, rowIndex) {
		var dinfo = self.basicGates[gate.name] ? self.basicGates[gate.name].drawingInfo : null;
		if(!dinfo) {
			dinfo = self.customGates[gate.name] ? self.customGates[gate.name].drawingInfo : null;
		}

		var blackbox = false;
		var selected = options && options.selection && options.selection.indexOf(gate.id) >= 0;
		if(!dinfo) {
			dinfo = { connectors: [] };
			blackbox = true;
		}
		while(dinfo.connectors.length < gate.wires.length) {
			dinfo.connectors.push("box");
		}

		var topWire = Math.min.apply(null, gate.wires);
		var bottomWire = Math.max.apply(null, gate.wires);
		var cLinkTopY = cWireY(bottomWire);

		var svg = "";
		svg += "<g class=\"qc-gate-group\" data-id=\"" + gate.id + "\" data-gate=\"" + gate.name + "\">";
		if(blackbox) {
			var gateX = getCellX(colIndex) - options.blackboxPaddingX;
			var gateY = qGateY(topWire) - options.blackboxPaddingY;
			var gateWidth = options.cellWidth + (2 * options.blackboxPaddingX);
			var gateHeight = ((qGateY(bottomWire) + options.cellHeight) - gateY) + options.blackboxPaddingY;

			var centerX = gateX + (gateWidth / 2);

			cLinkTopY = gateY + gateHeight;

			svg += "<text class=\"qc-blackbox-label\" x=\"" + centerX + "\" y=\"" + (gateY - options.wireTextHeight - (options.blackboxPaddingY * 2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + (dinfo.label || gate.name) + "</text>";
			svg += "<rect class=\"qc-gate-blackbox\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? options.blackboxSelectedLineColor : options.blackboxLineColor) + "\" fill=\"transparent\" stroke-width=\"1\" />";
		}

		if(selected) {
			var gateX = getCellX(colIndex) - options.selectionPaddingX;
			var gateY = qGateY(topWire) - options.selectionPaddingY;
			var gateWidth = options.cellWidth + (2 * options.selectionPaddingX);
			var gateHeight = ((qGateY(bottomWire) + options.cellHeight) - gateY) + options.selectionPaddingY;

			var centerX = gateX + (gateWidth / 2);

			cLinkTopY = gateY + gateHeight;

			svg += "<rect class=\"qc-gate-selection\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + options.selectionLineColor + "\" fill=\"transparent\" stroke-dasharray=\"4\" stroke-width=\"1\" />";
		}

		// link
		if(topWire != bottomWire && !blackbox) {
			var linkX = getCellX(colIndex) + (options.cellWidth / 2);
			var linkY1 = getCellY(topWire) + (options.cellHeight / 2);
			var linkY2 = getCellY(bottomWire) + (options.cellHeight / 2);
			svg += "<line class=\"qc-gate-link\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? options.gateSelectedLineColor : options.wireColor) + "\" stroke-width=\"1\" />";
		}

		// connectors
		var maxWire = Math.max.apply(null, gate.wires);
		gate.wires.map(function(wire, connector) {

			switch(dinfo.connectors[connector]) {
				case "box": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateBoxSVG(gateX, gateY, gate.name, (blackbox ? qubitLetter(connector, numRows) : (dinfo.label || gate.name)), selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + options.cellHeight;
					}
				}; break;

				case "circle": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateCircleSVG(gateX, gateY, gate.name, (blackbox ? qubitLetter(connector, numRows) : (dinfo.label || gate.name)), selected, false);

					if(!blackbox && wire == bottomWire) {
						var gateHeight = (options.cellHeight * 0.8);
						cLinkTopY = gateY + gateHeight + ((options.cellHeight - gateHeight) / 2);
					}
				}; break;

				case "not": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateNotSVG(cellX, cellY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						var gateHeight = (options.cellHeight * 0.8);
						cLinkTopY = cellY + gateHeight + ((options.cellHeight - gateHeight) / 2);
					}
				}; break;

				case "x": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateXSVG(cellX, cellY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = qWireY(bottomWire);
					}

				}; break;

				case "dot": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateDotSVG(cellX, cellY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = qWireY(bottomWire) + options.dotRadius;
					}
				}; break;

				case "ndot": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateInvertedDotSVG(cellX, cellY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = qWireY(bottomWire) + options.dotRadius;
					}
				}; break;

				case "gauge": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateGaugeSVG(gateX, gateY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + options.cellHeight;
					}
				}; break;

				case "barrier": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateBarrierSVG(gateX, gateY, gate.name, selected, false);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + options.cellHeight;
					}
				}; break;

			}

			// params
			if(gate.options && gate.options.params && wire == maxWire) {
				var gateX = getCellX(colIndex);
				var gateY = getCellY(wire);
				var centerX = gateX + (options.cellWidth / 2);

				var paramsStr = "";
				var paramsCount = 0;
				for(var paramName in gate.options.params) {
					if(paramsStr) {
						paramsStr += ", ";
					}

					var paramVal = gate.options.params[paramName];
					if(typeof paramVal == "string" && paramVal.match(/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/)) {
						paramVal = parseFloat(paramVal);
					}

					if(typeof paramVal == "number") {
						paramVal = math.round(paramVal, 3);
					}

					paramsStr += paramVal;
					paramsCount++;
				}

				if(paramsStr.length > 26) {
					paramsStr = "(" + paramsCount + " params)";
				}
				svg += "<text class=\"qc-gate-params\" x=\"" + centerX + "\" y=\"" + (gateY + options.cellHeight + options.paramTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + paramsStr + "</text>";
			}

		});

		// measure
		if(gate.name == "measure" && gate.options && gate.options.creg && gate.options.creg.name) {
			var linkX = getCellX(colIndex) + (options.cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.creg.name);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX - (options.cArrowSize / 2)) + "\" y1=\"" + (linkY2 - options.cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" stroke-width=\"1\" />";
			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX + (options.cArrowSize / 2)) + "\" y1=\"" + (linkY2 - options.cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<text class=\"qc-wire-label\" x=\"" + linkX + "\" y=\"" + (linkY2 + options.wireTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + gate.options.creg.bit + "</text>";
		}

		// controlled by classic register
		if(gate.options && gate.options.condition && gate.options.condition.creg) {
			var linkX = getCellX(colIndex) + (options.cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.condition.creg);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<circle class=\"qc-gate-dot-c\" cx=\"" + linkX + "\" cy=\"" + linkY2 + "\" r=\"" + options.dotRadius + "\" stroke=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" fill=\"" + (selected ? options.cWireSelectedColor : options.cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<text class=\"qc-wire-label\" x=\"" + linkX + "\" y=\"" + (linkY2 + options.wireTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">== " + gate.options.condition.value + "</text>";
		}

		svg += "</g>";

		return svg;
	};

	var drawGatePlaceholder = function(colOffset, colIndex, wire) {
		var svg = "";

		var gateWidth = options.cellWidth + options.hSpacing;
		var gateHeight = options.cellHeight + options.vSpacing;
		var gateX = getCellX(colOffset + colIndex) - options.hSpacing;
		var gateY = getCellY(wire) - options.vSpacing;

		if(wire == numRows) {
			gateHeight = options.vSpacing;
		}

		if(colIndex == numCols) {
			gateWidth = options.hSpacing;
		}

		svg += "<rect class=\"qc-gate-placeholder\" data-row=\"" + wire + "\" data-col=\"" + colIndex + "\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"none\" fill=\"transparent\" stroke-width=\"0\" />";

		return svg;
	};

	var drawGateHandle = function(gate, colOffset, colIndex, wire) {
		var svg = "";

		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;
		var gateX = getCellX(colOffset + colIndex);
		var gateY = getCellY(wire);

		svg += "<rect class=\"qc-gate-handle\" data-id=\"" + gate.id + "\" data-gate=\"" + gate.name + "\" data-row=\"" + wire + "\" data-col=\"" + colIndex + "\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"none\" fill=\"transparent\" stroke-width=\"0\" />";

		return svg;
	};

	var drawGateCanvas = function(colIndex, wire, className, canvasId) {
		var svg = "";

		var gateWidth = options.cellWidth;
		var gateHeight = options.cellHeight;
		var gateX = getCellX(colIndex);
		var gateY = getCellY(wire);


		svg += "<g class=\"" + (className || "qc-canvas-group") + "\" data-row=\"" + wire + "\">";
		svg += "<rect class=\"qc-canvas-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"transparent\" fill=\"white\" stroke-width=\"1\" />";
		svg += "<foreignObject class=\"qc-canvas-object\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\">";
		svg += "<div style=\"position:relative;\">";
		svg += "<canvas id=\"" + canvasId + "-" + wire + "\" class=\"" + canvasId + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\">";
		svg += "</canvas>";
		svg += "</div>";
		svg += "</foreignObject>";
		svg += "</g>";

		return svg;
	};

	var escapeHtml = function(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	};

	// 
	// - gateGallery and customGateGallery is used for toolbox palette in drag & drop editor.
	// - gateGalleryRaw is used to generate list of all gate symbols that look the same as in diagram
	//   (gate symbol only without controlling wire). Useful to generate training set for circuit image recognition.
	//
	if(options.gateGallery || options.gateGalleryRaw || options.customGateGallery) {
		var gateList = [];

		// basic gates
		if(options.gateGallery || options.gateGalleryRaw) {

			var uniq = [];
			for(var gateName in this.basicGates) {
				var gate = this.basicGates[gateName];
				var dinfo = JSON.parse(JSON.stringify(gate.drawingInfo || { connectors: ["box"] }));
				if(dinfo.connectors) {
					var gateLabel = dinfo.label || gateName;
					var connector = dinfo.connectors ? dinfo.connectors[dinfo.connectors.length - 1] : "box";

					if(options.gateGallery) {
						// Draw "swap", "cu1" and "cz" gates as box
						if(connector == "x" || connector == "dot") {
							connector = "box";
						}
					}

					var uniqStr = gateLabel + "|" + connector;

					if(uniq.indexOf(uniqStr) < 0 && gateName != "ccx") {
						uniq.push(uniqStr);

						var svg = "";
						if(!options.embedded) {
							svg += "<?xml version=\"1.0\"?>";
							svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
						}
						svg += "<svg class=\"qc-gate-gallery-item\" data-gate=\"" + escapeHtml(gateName) + "\" data-content=\"" + escapeHtml(gate.description) + "\" width=\"" + options.cellWidth + "\" height=\"" + options.cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
						svg += "<title>" + (gate.description || gate.name) + "</title>"
						svg = svg + gateSVG(0, 0, gateName, gateLabel, connector, !!options.gateGallery, false, true);
						svg += "</svg>";

						if(options.gateGallery) {
							gateList.push(svg);
						} else {
							gateList.push({ name: gateName, svg: svg });
						}
					}
				}
			}

			// special item: dot
			var dotsvg = "";
			if(!options.embedded) {
				dotsvg += "<?xml version=\"1.0\"?>";
				dotsvg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
			}
			dotsvg += "<svg class=\"qc-gate-gallery-item\" data-gate=\"dot\" data-content=\"Control\" width=\"" + options.cellWidth + "\" height=\"" + options.cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
			dotsvg = dotsvg + gateSVG(0, 0, "dot", "dot", "dot", !!options.gateGallery, false, true);
			dotsvg += "</svg>";

			if(options.gateGallery) {
				gateList.push(dotsvg);
			} else {
				gateList.push({ name: "dot", svg: dotsvg });
			}

			// special item: inverted dot
			var ndotsvg = "";
			if(!options.embedded) {
				ndotsvg += "<?xml version=\"1.0\"?>";
				ndotsvg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
			}
			ndotsvg += "<svg class=\"qc-gate-gallery-item\" data-gate=\"ndot\" data-content=\"Control\" width=\"" + options.cellWidth + "\" height=\"" + options.cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
			ndotsvg = ndotsvg + gateSVG(0, 0, "ndot", "ndot", "ndot", !!options.gateGallery, false, true);
			ndotsvg += "</svg>";

			if(options.gateGallery) {
				gateList.push(ndotsvg);
			} else {
				gateList.push({ name: "dot", svg: ndotsvg });
			}
		}

		// custom gates
		if(options.customGateGallery) {
			for(var gateName in this.customGates) {
				var svg = "";
				if(!options.embedded) {
					svg += "<?xml version=\"1.0\"?>";
					svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
				}
				svg += "<svg class=\"qc-custom-gate-gallery-item\" data-gate=\"" + gateName + "\" width=\"" + (options.cellWidth * 2) + "\" height=\"" + options.cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
				svg = svg + gateSVG(0, 0, gateName, gateName, "rect", false, false, true);
				svg += "</svg>";
				gateList.push(svg);
			}
		}

		return gateList;
	} else {
		var svg = "";
		if(!options.embedded) {
			svg += "<?xml version=\"1.0\"?>";
			svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
		}

		svg += "<svg class=\"qc-circuit\" width=\"" + totalWidth + "\" height=\"" + totalHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

		if(options.placeholders) {
			for(var column = 0; column <= numCols; column++) {
				for(var wire = 0; wire <= this.numQubits; wire++) {
					svg += drawGatePlaceholder(columnOffset, column, wire);
				}
			}
		}

		// Quantum wires
		for(var wire = 0; wire < numRows; wire++) {
			var wireY = qWireY(wire);
			var initSymbol = "0";
			if(options.customGate) {
				initSymbol = qubitLetter(wire, numRows);
			}
			svg += "<text class=\"qc-wire-init\" x=\"0\" y=\"" + wireY + "\" dominant-baseline=\"middle\" text-anchor=\"start\">|" + initSymbol + "&#x27E9;</text>";
			svg += "<line class=\"qc-wire\" x1=\"" + options.wireMargin + "\" x2=\"" + totalWireWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + options.wireColor + "\" stroke-width=\"" + options.wireWidth + "\" />";
			svg += "<text class=\"qc-wire-label\" x=\"" + options.wireMargin + "\" y=\"" + (wireY - (options.wireTextHeight*2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"start\" font-size=\"75%\">q" + wire + "</text>";
		}

		// Classical wires
		for(var cregName in this.cregs) {
			var wireY = cWireY(cregName);
			svg += "<text class=\"qc-wire-init\" x=\"0\" y=\"" + wireY + "\" dominant-baseline=\"middle\" text-anchor=\"start\">0</text>";
			svg += "<line class=\"qc-wire-c\" x1=\"" + options.wireMargin + "\" x2=\"" + totalWireWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + options.cWireColor + "\" stroke-width=\"" + options.wireWidth + "\" />";
			svg += "<text class=\"qc-wire-label\" x=\"" + options.wireMargin + "\" y=\"" + (wireY - (options.wireTextHeight * 2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"start\" font-size=\"75%\">" + cregName + "</text>";
		}

		// Gates
		for(var column = 0; column < numCols; column++) {
			for(var wire = 0; wire < this.numQubits; wire++) {
				var gate = this.getGateAt(column, wire);
				if(gate) {
					if(gate.connector == 0) {
						svg += drawGate(gate, columnOffset + column, wire);
					}
				}
			}
		}

		// Gate handles (for drag & drop editor)
		if(options.placeholders) {
			for(var column = 0; column < numCols; column++) {
				for(var wire = 0; wire < this.numQubits; wire++) {
					var gate = this.getGateAt(column, wire);
					if(gate) {
						svg += drawGateHandle(gate, columnOffset, column, wire);
					}
				}
			}
		}

		// Place for bloch sphere on each quantum wire
		if(options.drawBlochSpheres) {
			var currentCol = totalCols - 1;
			if(options.drawHybrid) {
				currentCol -= 2;
			}
			
			if(options.drawEncoderDecoder) {
				currentCol -= 1;
			}

			for(var wire = 0; wire < this.numQubits; wire++) {
				svg += drawGateCanvas(currentCol, wire, "qc-bloch-group", "qc-bloch-canvas");
			}
		}

		// hybrid quantum-classical
		if(options.drawHybrid) {
			var currentCol = totalCols - 2;
			// connector
			var colIndex = currentCol;

			var gateX = getCellX(colIndex) + options.blackboxPaddingX;
			var gateY = qGateY(0) + options.blackboxPaddingY;
			var gateWidth = options.cellWidth - (2 * options.blackboxPaddingX);
			var gateHeight = ((qGateY(numRows + numCregs - 1) + options.cellHeight) - gateY) - options.blackboxPaddingY;

			var centerX = gateX + (gateWidth / 2);
			var centerY = gateY + (gateHeight / 2);

			cLinkTopY = gateY + gateHeight;

			// cost
			svg += "<rect class=\"qc-cost-h\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + options.hWireColor + "\" fill=\"white\" stroke-width=\"1\" rx=\"8\" />";
			svg += "<text class=\"qc-label-h\" x=\"" + centerX + "\" y=\"" + centerY + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + options.hWireColor + "\" transform=\"rotate(-90, " + centerX + ", " + centerY + ")\">Cost</text>";


			var gate2X = getCellX(colIndex + 1) + options.blackboxPaddingX;
			var center2X = gate2X + (gateWidth / 2);

			// arrow
			svg += "<marker id=\"qc-arrow-head\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"10\" refX=\"8\" refY=\"5\"><path d=\"M0,0 V10 L8,5 Z\" fill=\"" + options.hWireColor + "\"/></marker>";
			svg += "<line class=\"qc-link-h\" x1=\"" + (gateX + gateWidth) + "\" x2=\"" + gate2X + "\" y1=\"" + centerY +"\" y2=\"" + centerY + "\" stroke=\"" + options.hWireColor + "\" stroke-width=\"" + options.wireWidth + "\" marker-end=\"url(#qc-arrow-head)\" />";


			// optimizer
			svg += "<rect class=\"qc-optimizer-h\" x=\"" + gate2X + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + options.hWireColor + "\" fill=\"white\" stroke-width=\"1\" rx=\"8\" />";
			svg += "<text class=\"qc-label-h\" x=\"" + center2X + "\" y=\"" + centerY + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + options.hWireColor + "\" transform=\"rotate(-90, " + center2X + ", " + centerY + ")\">Optimizer</text>";

			// link
			var linkX = center2X;
			var linkY1 = cLinkTopY;
			var linkY2 = hybridWireY;
			svg += "<line class=\"qc-wire-h\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + options.hWireColor + "\" stroke-dasharray=\"4\" stroke-width=\"1\" />";

			// Connect all globally parametrized gates
			var hWireX = 0;
			var globalParamsInfo = this.findGlobalParams();
			if(globalParamsInfo.globalParams.length) {
				hWireX = getCellX(globalParamsInfo.cells[0][0]) + options.cellWidth + (options.hSpacing / 2);
				for(var i = 0; i < globalParamsInfo.cells.length; i++) {
					var cell = globalParamsInfo.cells[i];

					var link2X = getCellX(cell[0]) + options.cellWidth + (options.hSpacing / 2);
					var link2Y2 = getCellY(cell[1]) + options.cellHeight + options.vSpacing - (options.paramTextHeight / 2);
					var link2Y1 = hybridWireY;
					var cellBottomRightX = getCellX(cell[0]) + options.cellWidth;
					var cellBottomRightY = getCellY(cell[1]) + options.cellHeight + (options.paramTextHeight * 2) + 4;
					svg += "<line class=\"qc-wire-h\" x1=\"" + link2X + "\" x2=\"" + link2X + "\" y1=\"" + link2Y1 +"\" y2=\"" + link2Y2 + "\" stroke=\"" + options.hWireColor + "\" stroke-dasharray=\"4\" stroke-width=\"1\" />";
					svg += "<line class=\"qc-wire-h\" x1=\"" + link2X + "\" x2=\"" + cellBottomRightX + "\" y1=\"" + link2Y2 +"\" y2=\"" + cellBottomRightY + "\" stroke=\"" + options.hWireColor + "\" stroke-dasharray=\"4\" stroke-width=\"1\" marker-end=\"url(#qc-arrow-head)\" />";
				}

				var wireY = hybridWireY;
				svg += "<line class=\"qc-wire-h\" x1=\"" + hWireX + "\" x2=\"" + center2X + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + options.hWireColor + "\" stroke-dasharray=\"4\" stroke-width=\"" + options.wireWidth + "\" />";

			} else {
				// No gates with global params
				hWireX = getCellX(totalWireCols + 1);

				var wireY = hybridWireY;
				svg += "<line class=\"qc-wire-h\" x1=\"" + center2X + "\" x2=\"" + hWireX + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + options.hWireColor + "\" stroke-dasharray=\"4\" stroke-width=\"" + options.wireWidth + "\"  marker-end=\"url(#qc-arrow-head)\" />";
				svg += "<text class=\"qc-warning-params-h\" x=\"" + (hWireX - 5) + "\" y=\"" + wireY + "\" dominant-baseline=\"middle\" text-anchor=\"end\">(no global params)</text>";
			}

		}

		if(options.drawEncoderDecoder) {
			// encoder
			var currentCol = 0;

			var colIndex = currentCol;
			var gateX = getCellX(colIndex) + options.blackboxPaddingX;
			var gateY = qGateY(0) + options.blackboxPaddingY;
			var gateWidth = options.cellWidth - (2 * options.blackboxPaddingX);
			var gateHeight = ((qGateY(numRows + numCregs - 1) + options.cellHeight) - gateY) - options.blackboxPaddingY;

			var centerX = gateX + (gateWidth / 2);
			var centerY = gateY + (gateHeight / 2);

			cLinkTopY = gateY + gateHeight;

			svg += "<marker id=\"qc-arrow-head-ed\" orient=\"auto\" markerWidth=\"8\" markerHeight=\"10\" refX=\"8\" refY=\"5\"><path d=\"M0,0 V10 L8,5 Z\" fill=\"" + options.hWireColor + "\"/></marker>";

			svg += "<rect class=\"qc-encoder-ed\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + options.edWireColor + "\" fill=\"white\" stroke-width=\"1\" rx=\"8\" />";
			svg += "<text class=\"qc-label-ed\" x=\"" + centerX + "\" y=\"" + centerY + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + options.edWireColor + "\" transform=\"rotate(-90, " + centerX + ", " + centerY + ")\">Encoder</text>";

			// link with arrow
			var linkX = centerX;
			var linkY1 = gateY - (options.cellHeight + options.vSpacing);
			var linkY2 = gateY;

			svg += "<line class=\"qc-wire-ed\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + options.edWireColor + "\" stroke-width=\"1\" marker-end=\"url(#qc-arrow-head-ed)\" />";
			svg += "<text class=\"qc-label-input-ed\" x=\"" + linkX + "\" y=\"" + (linkY1 - 10) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">Input</text>";

			// decoder
			currentCol = totalCols - 1;

			colIndex = currentCol;
			gateX = getCellX(colIndex) + options.blackboxPaddingX;
			gateY = qGateY(0) + options.blackboxPaddingY;
			gateWidth = options.cellWidth - (2 * options.blackboxPaddingX);
			gateHeight = ((qGateY(numRows + numCregs - 1) + options.cellHeight) - gateY) - options.blackboxPaddingY;

			centerX = gateX + (gateWidth / 2);
			centerY = gateY + (gateHeight / 2);

			cLinkTopY = gateY;

			svg += "<rect class=\"qc-decoder-ed\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + options.edWireColor + "\" fill=\"white\" stroke-width=\"1\" rx=\"8\" />";
			svg += "<text class=\"qc-label-ed\" x=\"" + centerX + "\" y=\"" + centerY + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + options.edWireColor + "\" transform=\"rotate(-90, " + centerX + ", " + centerY + ")\">Decoder</text>";

			// link with arrow
			linkX = centerX;
			linkY1 = gateY;
			linkY2 = gateY - (options.cellHeight + options.vSpacing);

			svg += "<line class=\"qc-wire-ed\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + options.edWireColor + "\" stroke-width=\"1\" marker-end=\"url(#qc-arrow-head-ed)\" />";
			svg += "<text class=\"qc-label-output-ed\" x=\"" + linkX + "\" y=\"" + (linkY2 - 10) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">Output</text>";
		}

		svg += "</svg>";
	}

	return svg;
};


QuantumCircuit.prototype.exportToQiskit = function(options, exportAsGateName, circuitReplacement, insideSubmodule) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var providerName = options.providerName;
	var backendName = options.backendName;
	var asJupyter = options.asJupyter;
	var shots = options.shots || 1024;
	var hybrid = options.hybrid;
	var encoderDecoder = options.encoderDecoder;

	if(typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	if(typeof encoderDecoder == "undefined") {
		encoderDecoder = this.options ? !!this.options.encoderDecoder : false;
	}

	var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";

	var encoderDecoderOptions = this.options && this.options.encoderDecoderOptions ? this.options.encoderDecoderOptions : {};
	var inputEncoding = encoderDecoderOptions.inputEncoding ? encoderDecoderOptions.inputEncoding : {};
	var outputDecoding = encoderDecoderOptions.outputDecoding ? encoderDecoderOptions.outputDecoding : {};

	var self = this;

	providerName = providerName || "Aer";

	backendName = backendName || "";

	if(providerName == "Aer") {
		if(!backendName) {
			if(hybrid && costFunction.indexOf("state") >= 0) {
				backendName = "statevector_simulator";
			} else {
				backendName = "qasm_simulator";
			}
		}

		if(backendName == "aer_simulator") {
			backendName = "qasm_simulator";
		}

		if(backendName == "aer_simulator_statevector") {
			backendName = "statevector_simulator";
		}
	}
	if(providerName == "IONQ") {
		if(!backendName) {
			backendName = "ionq_simulator";
		}
	}

	var version = parseFloat(versionStr || "0.7");
	if(isNaN(version)) {
		version = 0.7;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var qiskit = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				qiskit += "# ";
			}
			qiskit += cline;
			qiskit += "\n";
		});
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			var nodeName = node.name;
			if(options.replaceVars && typeof options.replaceVars[nodeName] != "undefined") {
				nodeName = options.replaceVars[nodeName];
				if(self.params.indexOf(nodeName) >= 0 && hybrid) {
					return "params[" + self.params.indexOf(nodeName) + "]";
				}
				return nodeName;
			}

			if(self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	var adjustIdentation = function(addStr, ident) {
		ident = ident || "";

		var str = "";

		// add user defined cost function with proper identation
		var cfLines = addStr.split("\n");
		var minIdent = -1;
		cfLines.map(function(cfLine) {
			var tmpIdent = cfLine.search(/\S/);
			if(tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if(minIdent < 0) {
			minIdent = 0;
		}

		var addIdent = "";
		if(minIdent < ident.length) {
			for(var tmp = 0; tmp < (ident.length - minIdent); tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function(cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	var identation = "";
	if(exportAsGateName) {
		qiskit += "def " + exportAsGateName + "(qc";

		var argc = 0;
		if(circuit.params && circuit.params.length) {
			for(var pc = 0; pc < circuit.params.length; pc++) {
				qiskit += ", ";
				argc++;
				qiskit += circuit.params[pc];
			}
		}

		for(var i = 0; i < circuit.numQubits; i++) {
			qiskit += ", ";
			argc++;
			qiskit += qubitLetter(i, circuit.numQubits);
		}
		qiskit += "):\n";
	} else {
		if(!circuitReplacement) {
			var usedGates = circuit.usedGates();

			qiskit += "from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n";

			var needTranspile = false;
			var isIonqNative = false;
			switch(providerName) {
				case "Aer":  {
					qiskit += "from qiskit import execute, " + providerName + "\n";

					if(hybrid && costFunction.indexOf("state") >= 0 && backendName != "statevector_simulator") {
						qiskit += "from qiskit_experiments.library import StateTomography\n";
					}
				}; break;

				case "IBMQ": {
					qiskit += "from qiskit import execute, " + providerName + "\nfrom qiskit.providers.ibmq import least_busy\n";
					if(hybrid && costFunction.indexOf("state") >= 0) {
						qiskit += "from qiskit_experiments.library import StateTomography\n";
					}
				}; break;

				case "IONQ": {
					needTranspile = true;

					qiskit += "from qiskit_ionq import IonQProvider\n";

					if(hybrid && costFunction.indexOf("state") >= 0) {
						qiskit += "from qiskit_experiments.library import StateTomography\n";
					}
				}; break;
			}

			if(usedGates.indexOf("ms") >= 0 || usedGates.indexOf("gpi") >= 0 || usedGates.indexOf("gpi2") >= 0) {
				needTranspile = true;
				qiskit += "from qiskit_ionq import GPIGate, GPI2Gate, MSGate\n";
			}

			if(needTranspile) {
				qiskit += "from qiskit import transpile\n";
			}

			if(hybrid) {
				qiskit += "from scipy.optimize import minimize\n";
				qiskit += "from collections import Counter\n";
			}

			if(encoderDecoder) {
				qiskit += "from quantastica.encoder_decoder import encode_input, decode_output\n";
			}

			qiskit += "import numpy as np\n";
			qiskit += "\n";

			switch(providerName) {
				case "Aer": {
					qiskit += identation + "backend = Aer.get_backend(\"" + backendName + "\")\n";
					qiskit += "\n";
				}; break;

				case "IBMQ": {
					qiskit += identation + "IBMQ.load_account()\n";
					qiskit += identation + "provider = IBMQ.get_provider(hub=\"ibm-q\", group=\"open\", project=\"main\")\n";
					if(backendName) {
						qiskit += identation + "backend = provider.get_backend(\"" + backendName + "\")\n";
					} else {
						qiskit += identation + "backends = provider.backends()\n";
						qiskit += identation + "backend = least_busy(backends)\n";
					}
					qiskit += "\n";
				}; break;

				case "IONQ": {
					var ionqNative = ["measure", "delay", "barrier", "reset", "snapshot", "ms", "gpi2", "gpi"];
					isIonqNative = true;
					usedGates.map(function(usedGate) {
						if(ionqNative.indexOf(usedGate) < 0) {
							isIonqNative = false;
						}
					});

					qiskit += identation + "# Requires QISKIT_IONQ_API_TOKEN environment variable to be set\n";
					qiskit += identation + "provider = IonQProvider()\n";
					qiskit += identation + "backend = provider.get_backend(\"" + backendName + "\"";
					if(isIonqNative) {
						qiskit += ", gateset=\"native\"";
					}
					qiskit += ")\n\n";
				}; break;
			}


			if(shots) {
				qiskit += "shots = " + shots + "\n";
				qiskit += "\n";
			}

			var globalParams = this.options && this.options.params ? this.options.params : {};
			if(this.params.length) {
				for(var i = 0; i < this.params.length; i++) {
					var globalParamName = this.params[i];

					var node = math.parse(globalParams[globalParamName]);
					var globalParamValue = node.toString({ handler: mathToStringHandler });

					qiskit += globalParamName + " = " + globalParamValue + "\n";
				}
				qiskit += "\n";
			}

			if(hybrid) {
				qiskit += "tolerance = " + (this.options && this.options.hybridOptions && this.options.hybridOptions.tolerance ? this.options.hybridOptions.tolerance || "0.001" : "0.001") + "\n";
				qiskit += "\n";
			}

			if(!decompose) {
				usedGates.map(function(usedGateName) {
					var basicGate = circuit.basicGates[usedGateName];
					if(!basicGate) {
						var customGate = self.customGates[usedGateName];
						if(customGate) {
							var customCircuit = new QuantumCircuit();
							customCircuit.load(customGate);
							var newOptions = {
								comment: "",
								decompose: true,
								versionStr: versionStr,
								providerName: "",
								backendName: false,
								asJupyter: false,
								shots: false,
								hybrid: null,
								encoderDecoder: false
							};
							qiskit += customCircuit.exportToQiskit(newOptions, usedGateName, circuitReplacement, insideSubmodule);
						}
					}
				});
			}


			if(hybrid) {
				identation = "  ";

				qiskit += "def objective_function(params):\n"
			}

			if(encoderDecoder) {
				identation = "  ";

				if(inputEncoding.type == "custom") {
					var customEncoder = inputEncoding.customFunction && inputEncoding.customFunction.python ? inputEncoding.customFunction.python : "def custom_encoder(input_data_row, input_encoding):\n    pass\n";
					qiskit += customEncoder + "\n";
				}

				if(outputDecoding.type == "custom") {
					var customDecoder = outputDecoding.customFunction && outputDecoding.customFunction.python ? outputDecoding.customFunction.python : "def custom_decoder(counts, output_decoding):\n    pass\n";
					qiskit += customDecoder + "\n";
				}

				var functionName = encoderDecoderOptions.functionName || "my_function";

				qiskit += "def " + functionName + "(";
				if(inputEncoding.colDefs) {
					inputEncoding.colDefs.map(function(colDef, colDefIndex) {
						if(colDefIndex > 0) {
							qiskit += ", ";
						}
						qiskit += colDef.name;
					});
				}
				qiskit += "):\n"

				var inputEncodingCopy = JSON.parse(JSON.stringify(inputEncoding));
				if(inputEncodingCopy.colDefs) {
					inputEncodingCopy.colDefs.map(function(colDef) {
						if(colDef.min) {
							colDef.min = math.evaluate(colDef.min);
						}
						if(colDef.max) {
							colDef.max = math.evaluate(colDef.max);
						}
					});
				}
				if(typeof inputEncodingCopy.data != "undefined") {
					delete inputEncodingCopy.data;
				}

				if(inputEncodingCopy.type == "custom") {
					inputEncodingCopy.customFunction = { python: "$custom_encoder$" };
				} else {
					if(inputEncodingCopy.customFunction) {
						delete inputEncodingCopy.customFunction;
					}
				}

				var outputDecodingCopy = JSON.parse(JSON.stringify(outputDecoding));
				if(outputDecodingCopy.colDefs) {
					outputDecodingCopy.colDefs.map(function(colDef) {
						if(colDef.min) {
							colDef.min = math.evaluate(colDef.min);
						}
						if(colDef.max) {
							colDef.max = math.evaluate(colDef.max);
						}
					});
				}

				if(outputDecodingCopy.type == "custom") {
					outputDecodingCopy.customFunction = { python: "$custom_decoder$" };
				} else {
					if(outputDecodingCopy.customFunction) {
						delete outputDecodingCopy.customFunction;
					}
				}

				var inputEncodingStr = "input_encoding = " + JSON.stringify(inputEncodingCopy, null, 4);
				inputEncodingStr = inputEncodingStr.replace("\"$custom_encoder$\"", "custom_encoder");
				qiskit += adjustIdentation(inputEncodingStr, identation) + "\n";

				var outputDecodingStr = "output_decoding = " + JSON.stringify(outputDecodingCopy, null, 4);
				outputDecodingStr = outputDecodingStr.replace("\"$custom_decoder$\"", "custom_decoder");
				qiskit += adjustIdentation(outputDecodingStr, identation) + "\n";
			}

			qiskit += identation + "qc = QuantumCircuit()\n";
			qiskit += "\n";

			qiskit += identation + "q = QuantumRegister(" + circuit.numQubits + ", 'q')\n";
			for(var cregName in this.cregs) {
				qiskit += identation + cregName + " = ClassicalRegister(" + (this.cregs[cregName].length || 1) + ", '" + cregName + "')\n";
			}
			qiskit += "\n";

			qiskit += identation + "qc.add_register(q)\n";
			for(var cregName in this.cregs) {
				qiskit += identation + "qc.add_register(" + cregName + ")\n";
			}
			qiskit += "\n";

			if(encoderDecoder) {
				var inputRowStr = "{";
				if(inputEncoding.colDefs) {
					if(inputEncoding.colDefs.length) {
						inputRowStr += " ";
					}
					inputEncoding.colDefs.map(function(colDef, colDefIndex) {
						if(colDefIndex > 0) {
							inputRowStr += ", ";
						}
						inputRowStr += "\"" + colDef.name + "\": " + colDef.name;
					});
					if(inputEncoding.colDefs.length) {
						inputRowStr += " ";
					}
				}
				inputRowStr += "}";
				qiskit += identation + "input_data_row = " + inputRowStr + "\n";
				qiskit += identation + "input_qasm = encode_input(input_data_row, input_encoding)\n";
				qiskit += identation + "input_qc = QuantumCircuit()\n";
				qiskit += identation + "input_qc = input_qc.from_qasm_str(input_qasm)\n";
				qiskit += identation + "qc = qc.compose(input_qc)\n";
				qiskit += identation + "qc.barrier()\n";
				qiskit += "\n";
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);	
			var qiskitReplacement = null;
			var qiskitEquivalent = null;
			var qiskitCondition = null;
			if(gate && gate.connector == 0) {
				
				qiskitCondition = gate.options && gate.options.condition && gate.options.condition.creg ? gate.options.condition : null;

				var gateDef = circuit.getGateDef(gate.name);
				if(gateDef){
					if(gateDef.exportInfo && !isIonqNative) {
						if(gateDef.exportInfo.qiskit && gateDef.exportInfo.qiskit.replacement) {
							qiskit += "\n" + identation + "# " + gate.name + "\n";
							var replacementCircuit = new QuantumCircuit();
							qiskitReplacement = gateDef.exportInfo.qiskit.replacement;
							qiskitReplacement.map(function(replacement){
								if(gate.options && gate.options.params){
									var params = Object.keys(gate.options.params);
									var replacementParams = Object.keys(replacement.params);
									params.map(function(param){
										if(replacementParams.indexOf(param) > -1){
											replacement.params[param] = gate.options.params[param];
										}
									});
								}							
								replacementCircuit.appendGate(replacement.name, gate.wires, {params: replacement.params, condition: qiskitCondition});
							});
							var newOptions = {
								comment: "",
								decompose: false,
								versionStr: false,
								providerName: false,
								backendName: false,
								asJupyter: false,
								shots: false,
								hybrid: null,
								encoderDecoder: false
							};
							qiskit += adjustIdentation(replacementCircuit.exportToQiskit(newOptions, false, true, !!exportAsGateName || insideSubmodule), identation);
						} else if(gateDef.exportInfo.qiskit && gateDef.exportInfo.qiskit.equivalent) {
							qiskit += "\n" + identation + "# " + gate.name + "\n";
							var equivalentCircuit = new QuantumCircuit();
							qiskitEquivalent = gateDef.exportInfo.qiskit.equivalent;
							qiskitEquivalent.map(function(equivalent){
								var gateWires = equivalent.wires.length > 1 ? gate.wires : gate.wires[equivalent.wires[0]];
								var eqParams = {};
								if(equivalent.params) {
									var gateParams = {};
									if(gate.options && gate.options.params) {
										for(var gateParamName in gate.options.params) {
											var node = math.parse(gate.options.params[gateParamName]);
											var valueString = node.toString({ handler: mathToStringHandler });
											gateParams[gateParamName] = valueString;
										}
									}
									
									for(var eqParamName in equivalent.params) {
										var node = math.parse(equivalent.params[eqParamName]);
										var valueString = node.toString({ handler: mathToStringHandler, replaceVars: gateParams });
										eqParams[eqParamName] = valueString;
									}
								}
								equivalentCircuit.appendGate(equivalent.name, gateWires, { params: eqParams, condition: qiskitCondition });
							});
							var newOptions = {
								comment: "",
								decompose: false,
								versionStr: false,
								providerName: false,
								backendName: false,
								asJupyter: false,
								shots: false,
								hybrid: null,
								encoderDecoder: false
							};
							qiskit += adjustIdentation(equivalentCircuit.exportToQiskit(newOptions, false, true, !!exportAsGateName || insideSubmodule), identation);
						}
					}
				}

				if(!qiskitReplacement && !qiskitEquivalent) {
					if(exportAsGateName || insideSubmodule || hybrid || encoderDecoder) {
						qiskit += "  ";
					}
				}

				if(!qiskitReplacement && !qiskitEquivalent) {

					var gateName = gate.name;

					var gateParams = gate.options && gate.options.params ? gate.options.params : {};
					
					// Measurement is commented out in hybrid quantum-classical circuit when running on statevector simulator
					if(backendName == "statevector_simulator" && gateName == "measure" && hybrid) {
						qiskit += "# ";
					}

					if(this.basicGates[gateName]) {
						qiskit += "qc.";
					}
					
					if(gateDef && gateDef.exportInfo && gateDef.exportInfo.qiskit && gateDef.exportInfo.qiskit.name){
						gateName = gateDef.exportInfo.qiskit.name;
					} else {
						gateName = gate.name;
					}

					var qcAppend = false;
					var angleInTurns = false;
					if(gateName == "ms") {
						qcAppend = true;
						angleInTurns = true;
						gateName = "MSGate";
					}

					if(gateName == "gpi" && isIonqNative) {
						qcAppend = true;
						angleInTurns = true;
						gateName = "GPIGate";
					}

					if(gateName == "gpi2" && isIonqNative) {
						qcAppend = true;
						angleInTurns = true;
						gateName = "GPI2Gate";
					}

					if(qcAppend) {
						qiskit += "append(";
					}

					qiskit += gateName + "(";

					var argCount = 0;
					if(gateParams) {
						var gateDef = this.basicGates[gate.name];
						if(!gateDef) {
							gateDef = this.customGates[gate.name];

							qiskit += "qc";
							argCount++;
						}

						if(gateDef) {
							var paramDef = gateDef.params || [];
							var paramCount = paramDef.length;
							if(paramCount) {
								for(var p = 0; p < paramCount; p++) {
									if(argCount > 0) {
										qiskit += ", ";
									}
									var paramName = paramDef[p];

									// ---
									// prepend 'np' to math constants
									if(gateParams[paramName] || gateParams[paramName].toString()) {
										var node = math.parse(gateParams[paramName]);
										var valueString = node.toString({ handler: mathToStringHandler });
										if(angleInTurns) {
											valueString = "(" + valueString + ") / (2*np.pi)";
										}
										qiskit += valueString;
									}
									// ---

									argCount++;
								}

								if(gateName == "cu" && !gateParams["gamma"]) {
									qiskit += ", 0";
									argCount++;
								}

							}
						}
					}

					if(qcAppend) {
						if(argCount) {
							qiskit += "), ";
						}
						qiskit += "[";

						for(var w = 0; w < gate.wires.length; w++) {
							if(w > 0) {
								qiskit += ", ";
							}
							if(exportAsGateName || insideSubmodule) {
								qiskit += qubitLetter(gate.wires[w], circuit.numQubits);
							} else {
								qiskit += gate.wires[w];
							}
							argCount++;
						}

						qiskit += "]";
					} else {
						for(var w = 0; w < gate.wires.length; w++) {
							if(argCount > 0) {
								qiskit += ", ";
							}
							if(exportAsGateName || insideSubmodule) {
								qiskit += qubitLetter(gate.wires[w], circuit.numQubits);
							} else {
								qiskit += "q[" + gate.wires[w] + "]";
							}
							argCount++;
						}
					}


					if(gateName == "measure" && gate.options && gate.options.creg) {
						if(argCount > 0) {
							qiskit += ", ";
						}

						qiskit += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
						argCount++;
					}

					qiskit += ")";					

					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						qiskit += ".c_if(" + gate.options.condition.creg + ", " + gate.options.condition.value + ")";
					}

					qiskit += "\n";
				}
			}
		}
	}

	if(!circuitReplacement) {
		if(exportAsGateName) {
			qiskit += "\n";
		} else {
			qiskit += "\n";

			identation = "";
			if(hybrid) {
				identation = "  ";
			}

			if(encoderDecoder) {
				identation = "  ";

				qiskit += identation + "qc.measure_all(q)\n";
				qiskit += "\n";
			}

			if(needTranspile) {
				qiskit += identation + "qc = transpile(qc, backend)\n";
			}

			if(providerName == "Aer") {
				var execBlock = "";
				execBlock += identation + "job = execute(qc, backend=backend";
				if(shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if(hybrid) {

					if(backendName == "statevector_simulator") {
						qiskit += execBlock;
						qiskit += identation + "state = job_result.get_statevector(qc).data\n";
						qiskit += "\n"
					} else {
						if(costFunction.indexOf("state") >= 0) {
							qiskit += identation + "qst = StateTomography(qc)\n";
							qiskit += identation + "qst_analysis = qst.run(backend).block_for_results()\n";
							qiskit += identation + "density = qst_analysis.analysis_results(\"state\").value\n";
							qiskit += identation + "state = np.diag(density)\n";
						} else {
							qiskit += execBlock;
							qiskit += identation + "counts = Counter(job_result.get_counts(qc))\n";
							qiskit += "\n"
						}
					}

					if(!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n"
					qiskit += identation + "return cost\n"
				} else {
					if(encoderDecoder) {
						qiskit += execBlock;
						qiskit += identation + "counts = job_result.get_counts(qc)\n\n";
						qiskit += identation + "output_data_row = decode_output(counts, output_decoding, unpack_values=True)\n";
						qiskit += identation + "return output_data_row\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "print(job_result.get_counts(qc))\n";
					}
				}
			}

			if(providerName == "IBMQ") {
				var execBlock = "";
				execBlock += identation + "job = execute(qc, backend=backend";
				if(shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if(hybrid) {
					if(costFunction.indexOf("state") >= 0) {
						qiskit += identation + "qst = StateTomography(qc)\n";
						qiskit += identation + "qst_analysis = qst.run(backend).block_for_results()\n";
						qiskit += identation + "density = qst_analysis.analysis_results(\"state\").value\n";
						qiskit += identation + "state = np.diag(density)\n";
						qiskit += "\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "counts = Counter(job_result.get_counts(qc))\n";
						qiskit += "\n";
					}

					if(!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n"
					qiskit += identation + "return cost\n"
				} else {
					if(encoderDecoder) {
						qiskit += execBlock;
						qiskit += identation + "counts = job_result.get_counts(qc)\n\n";
						qiskit += identation + "output_data_row = decode_output(counts, output_decoding, unpack_values=True)\n";
						qiskit += identation + "return output_data_row\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "print(job_result.get_counts(qc))\n";
					}
				}
			}

			if(providerName == "IONQ") {

				var execBlock = "";
				execBlock += identation + "job = backend.run(qc";
				if(shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if(hybrid) {
					if(costFunction.indexOf("state") >= 0) {
						qiskit += identation + "qst = StateTomography(qc)\n";
						qiskit += identation + "qst_analysis = qst.run(backend).block_for_results()\n";
						qiskit += identation + "density = qst_analysis.analysis_results(\"state\").value\n";
						qiskit += identation + "state = np.diag(density)\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "counts = Counter(job.get_counts())\n";
						qiskit += "\n";
					}

					if(!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n"
					qiskit += identation + "return cost\n"
				} else {
					if(encoderDecoder) {
						qiskit += execBlock;
						qiskit += identation + "counts = job_result.get_counts(qc)\n\n";
						qiskit += identation + "output_data_row = decode_output(counts, output_decoding, unpack_values=True)\n";
						qiskit += identation + "return output_data_row\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "print(job.get_counts())\n";
					}
				}
			}

			if(hybrid) {
				var globalParamList = "";
				this.params.map(function(globalParamName, globalParamIndex) {
					if(globalParamIndex > 0) {
						globalParamList += ", ";
					}
					globalParamList += globalParamName;
				});

				qiskit += "\n";
				qiskit += "params = np.array([" + globalParamList + "])\n";
				qiskit += "\n";
				qiskit += "minimum = minimize(objective_function, params, method=\"" + (this.options && this.options.hybridOptions && this.options.hybridOptions.optimizer ? this.options.hybridOptions.optimizer : "Powell") + "\", tol=tolerance)\n";
				qiskit += "print(\"cost:\", minimum.fun, \"params:\", minimum.x)\n";
			}
		}

		if(asJupyter) {
			var notebook = {
				metadata: {
					kernelspec: {
						display_name: "Python 3",
						language: "python",
						name: "python3"
					}
				},
				nbformat: 4,
				nbformat_minor: 0,
				cells: [
					{
						cell_type: "code",
						source: qiskit,
						metadata: {

						},
						outputs: [],
						execution_count: null
					}
				]
			};
			return JSON.stringify(notebook);
		}
	}

	return qiskit;
};


//added by suraj
QuantumCircuit.prototype.exportToCudaQ = function(options, exportAsGateName, circuitReplacement, insideSubmodule) {
	var self = this;

	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var providerName = options.providerName || "";
	var backendName = options.backendName || "";
	var asJupyter = options.asJupyter;
	var stateVector = options.stateVector;
	var shots = options.shots || 1024;
	var hybrid = options.hybrid;
	var encoderDecoder = options.encoderDecoder;

	if(typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	if(typeof encoderDecoder == "undefined") {
		encoderDecoder = this.options ? !!this.options.encoderDecoder : false;
	}

	var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";

	var encoderDecoderOptions = this.options && this.options.encoderDecoderOptions ? this.options.encoderDecoderOptions : {};
	var inputEncoding = encoderDecoderOptions.inputEncoding ? encoderDecoderOptions.inputEncoding : {};
	var outputDecoding = encoderDecoderOptions.outputDecoding ? encoderDecoderOptions.outputDecoding : {};

	if(typeof stateVector == "undefined") {
		if(hybrid && costFunction.indexOf("state") >= 0) {
			stateVector = true;
		} else {
			stateVector = false;
		}
	}

	var version = parseFloat(versionStr || "0.9");
	if(isNaN(version)) {
		version = 0.9;
	}

	// decompose?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(!!decompose));

	var cudaq = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				cudaq += "# ";
			}
			cudaq += cline;
			cudaq += "\n";
		});
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			var nodeName = node.name;
			if(options.replaceVars && typeof options.replaceVars[nodeName] != "undefined") {
				nodeName = options.replaceVars[nodeName];
				if(self.params.indexOf(nodeName) >= 0 && hybrid) {
					return "params[" + self.params.indexOf(nodeName) + "]";
				}
				return nodeName;
			}

			if(self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	var adjustIdentation = function(addStr, ident) {
		var str = "";

		// add user defined cost function with proper identation
		var cfLines = addStr.split("\n");
		var minIdent = -1;
		cfLines.map(function(cfLine) {
			var tmpIdent = cfLine.search(/\S/);
			if(tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if(minIdent < 0) {
			minIdent = 0;
		}

		var addIdent = "";
		if(minIdent < ident.length) {
			for(var tmp = 0; tmp < (ident.length - minIdent); tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function(cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	var identation = "";
	var globalParams = {};
	if(exportAsGateName) {
		cudaq += "@cudaq.kernel\n";
		cudaq += "def " + exportAsGateName + "(";

		var argc = 0;
		if(circuit.params && circuit.params.length) {
			for(var pc = 0; pc < circuit.params.length; pc++) {
				if(argc > 0) {
					cudaq += ", ";
				}
				argc++;
				cudaq += circuit.params[pc] + ": float";
			}
		}

		for(var i = 0; i < circuit.numQubits; i++) {
			if(argc > 0) {
				cudaq += ", ";
			}
			argc++;
			cudaq += "q_" + i + ": cudaq.qubit";
		}
		cudaq += "):\n";

		identation += "  ";
	} else {
		if(!circuitReplacement) {
			var usedGates = circuit.usedGates();

			cudaq += "import cudaq\n";

			if(hybrid) {
				cudaq += "from scipy.optimize import minimize\n";
				cudaq += "from collections import Counter\n";
			}

			if(encoderDecoder) {
				cudaq += "from quantastica.encoder_decoder import encode_input, decode_output\n";
			}

			cudaq += "import numpy as np\n";
			cudaq += "\n";

			var usedGates = circuit.usedGates();
			var gotCustomOps = false;
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(basicGate) {
					if(basicGate.exportInfo && basicGate.exportInfo.cudaq) {
						var cudaqInfo = basicGate.exportInfo.cudaq;
						if(cudaqInfo.matrix) {
							cudaq += "cudaq.register_operation(\"" + (cudaqInfo.name || usedGateName) + "\", np.array(" + cudaqInfo.matrix + "))\n";
							gotCustomOps = true;
						}
					}
				}
			});
			if(gotCustomOps) {
				cudaq += "\n";
			}

			if(providerName) {
				// TODO: backendName
				cudaq += "cudaq.set_target(\"" + providerName + "\")\n";
				cudaq += "\n";
			}

			if(shots) {
				cudaq += "shots = " + shots + "\n";
				cudaq += "\n";
			}

			globalParams = circuit.options && circuit.options.params ? circuit.options.params : {};
			if(circuit.params.length) {
				cudaq += identation + "params = [\n";
				for(var i = 0; i < circuit.params.length; i++) {
					var globalParamName = circuit.params[i];

					var node = math.parse(globalParams[globalParamName] + "");
					var globalParamValue = node.toString({ handler: mathToStringHandler });

					cudaq += identation + "  " + globalParamValue;
					if(i < circuit.params.length - 1) {
						cudaq += ",";
					}
					cudaq += " # " + globalParamName + "\n";
				}
				cudaq += "]\n";
				cudaq += "\n";
			}

			if(hybrid) {
				cudaq += "tolerance = " + (circuit.options && circuit.options.hybridOptions && circuit.options.hybridOptions.tolerance ? circuit.options.hybridOptions.tolerance || "0.001" : "0.001") + "\n";
				cudaq += "\n";
			}

			if(!decompose) {
				usedGates.map(function(usedGateName) {
					var basicGate = circuit.basicGates[usedGateName];
					if(!basicGate) {
						var customGate = self.customGates[usedGateName];
						if(customGate) {
							var customCircuit = new QuantumCircuit();
							customCircuit.load(customGate);
							var newOptions = {
								comment: "",
								decompose: true,
								versionStr: versionStr,
								providerName: "",
								backendName: false,
								asJupyter: false,
								shots: null,
								hybrid: null,
								encoderDecoder: false,
								commentOutUnknownGates: options.commentOutUnknownGates
							};
							cudaq += customCircuit.exportToCudaQ(newOptions, usedGateName, circuitReplacement, insideSubmodule);
						}
					}
				});
			}

			if(encoderDecoder) {
				identation += "  ";

				if(inputEncoding.type == "custom") {
					var customEncoder = inputEncoding.customFunction && inputEncoding.customFunction.python ? inputEncoding.customFunction.python : "def custom_encoder(input_data_row, input_encoding):\n    pass\n";
					cudaq += customEncoder + "\n";
				}

				if(outputDecoding.type == "custom") {
					var customDecoder = outputDecoding.customFunction && outputDecoding.customFunction.python ? outputDecoding.customFunction.python : "def custom_decoder(counts, output_decoding):\n    pass\n";
					cudaq += customDecoder + "\n";
				}

				var functionName = encoderDecoderOptions.functionName || "my_function";

				cudaq += "def " + functionName + "(";
				if(inputEncoding.colDefs) {
					inputEncoding.colDefs.map(function(colDef, colDefIndex) {
						if(colDefIndex > 0) {
							cudaq += ", ";
						}
						cudaq += colDef.name;
					});
				}
				cudaq += "):\n"

				var inputEncodingCopy = JSON.parse(JSON.stringify(inputEncoding));
				if(inputEncodingCopy.colDefs) {
					inputEncodingCopy.colDefs.map(function(colDef) {
						if(colDef.min) {
							colDef.min = math.evaluate(colDef.min);
						}
						if(colDef.max) {
							colDef.max = math.evaluate(colDef.max);
						}
					});
				}
				if(typeof inputEncodingCopy.data != "undefined") {
					delete inputEncodingCopy.data;
				}

				if(inputEncodingCopy.type == "custom") {
					inputEncodingCopy.customFunction = { python: "$custom_encoder$" };
				} else {
					if(inputEncodingCopy.customFunction) {
						delete inputEncodingCopy.customFunction;
					}
				}

				var outputDecodingCopy = JSON.parse(JSON.stringify(outputDecoding));
				if(outputDecodingCopy.colDefs) {
					outputDecodingCopy.colDefs.map(function(colDef) {
						if(colDef.min) {
							colDef.min = math.evaluate(colDef.min);
						}
						if(colDef.max) {
							colDef.max = math.evaluate(colDef.max);
						}
					});
				}

				if(outputDecodingCopy.type == "custom") {
					outputDecodingCopy.customFunction = { python: "$custom_decoder$" };
				} else {
					if(outputDecodingCopy.customFunction) {
						delete outputDecodingCopy.customFunction;
					}
				}

				var inputEncodingStr = "input_encoding = " + JSON.stringify(inputEncodingCopy, null, 4);
				inputEncodingStr = inputEncodingStr.replace("\"$custom_encoder$\"", "custom_encoder");
				cudaq += adjustIdentation(inputEncodingStr, identation) + "\n";

				var outputDecodingStr = "output_decoding = " + JSON.stringify(outputDecodingCopy, null, 4);
				outputDecodingStr = outputDecodingStr.replace("\"$custom_decoder$\"", "custom_decoder");
				cudaq += adjustIdentation(outputDecodingStr, identation) + "\n";
			}

			cudaq += identation + "@cudaq.kernel\n";
			cudaq += identation + "def circuit(";
			if(!exportAsGateName && circuit.params && circuit.params.length) {
				cudaq += "params: list[float]";
			}
			cudaq += "):\n";

			identation += "  ";

			cudaq += identation + "q = cudaq.qvector(" + circuit.numQubits + ")\n";

			if(encoderDecoder) {
				var inputRowStr = "{";
				if(inputEncoding.colDefs) {
					if(inputEncoding.colDefs.length) {
						inputRowStr += " ";
					}
					inputEncoding.colDefs.map(function(colDef, colDefIndex) {
						if(colDefIndex > 0) {
							inputRowStr += ", ";
						}
						inputRowStr += "\"" + colDef.name + "\": " + colDef.name;
					});
					if(inputEncoding.colDefs.length) {
						inputRowStr += " ";
					}
				}
				inputRowStr += "}";
				cudaq += identation + "input_data_row = " + inputRowStr + "\n";
				cudaq += identation + "input_qasm = encode_input(input_data_row, input_encoding)\n";
				// TODO:
				cudaq += identation + "# !!! CREATE KERNEL FROM QASM: NOT SUPPORTED YET.";
				//cudaq += identation + "...create kernel from input_qasm and append gates to this kernel...";
				cudaq += "\n";
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);	
			var cudaqReplacement = null;
			var cudaqEquivalent = null;
			var cudaqCondition = null;
			if(gate && gate.connector == 0) {
				
				cudaqCondition = gate.options && gate.options.condition && gate.options.condition.creg ? gate.options.condition : null;

				var gateDef = circuit.getGateDef(gate.name);
				if(gateDef) {
					if(gateDef.exportInfo) {
						if(gateDef.exportInfo.cudaq && gateDef.exportInfo.cudaq.replacement) {
							cudaq += "\n" + identation + "# " + gate.name + "\n";
							var replacementCircuit = new QuantumCircuit();
							cudaqReplacement = Array.isArray(gateDef.exportInfo.cudaq.replacement) ? gateDef.exportInfo.cudaq.replacement : [ gateDef.exportInfo.cudaq.replacement ];
							cudaqReplacement.map(function(replacement) {
								if(gate.options && gate.options.params) {
									var params = Object.keys(gate.options.params);
									var replacementParams = Object.keys(replacement.params);
									params.map(function(param) {
										if(replacementParams.indexOf(param) > -1) {
											replacement.params[param] = gate.options.params[param];
										}
									});
								}							
								replacementCircuit.appendGate(replacement.name, gate.wires, {params: replacement.params, condition: cudaqCondition});
							});
							var newOptions = {
								comment: "",
								decompose: false,
								versionStr: versionStr,
								providerName: "",
								backendName: "",
								asJupyter: false,
								shots: null,
								hybrid: false,
								encoderDecoder: false,
								commentOutUnknownGates: options.commentOutUnknownGates
							};
							cudaq += adjustIdentation(replacementCircuit.exportToCudaQ(newOptions, false, true, !!exportAsGateName || insideSubmodule), identation);
						} else {
							if(gateDef.exportInfo.cudaq && gateDef.exportInfo.cudaq.equivalent) {
								cudaq += "\n" + identation + "# " + gate.name + "\n";
								var equivalentCircuit = new QuantumCircuit();
								cudaqEquivalent = Array.isArray(gateDef.exportInfo.cudaq.equivalent) ? gateDef.exportInfo.cudaq.equivalent : [ gateDef.exportInfo.cudaq.equivalent ];
								cudaqEquivalent.map(function(equivalent) {
									var gateWires = equivalent.wires.length > 1 ? gate.wires : gate.wires[equivalent.wires[0]];
									var eqParams = {};
									if(equivalent.params) {
										var gateParams = {};
										if(gate.options && gate.options.params) {
											for(var gateParamName in gate.options.params) {
												var node = math.parse(gate.options.params[gateParamName] + "");
												var valueString = node.toString({ handler: mathToStringHandler });
												gateParams[gateParamName] = valueString;
											}
										}
										
										for(var eqParamName in equivalent.params) {
											var node = math.parse(equivalent.params[eqParamName] + "");
											var valueString = node.toString({ handler: mathToStringHandler, replaceVars: gateParams });
											eqParams[eqParamName] = valueString;
										}
									}
									equivalentCircuit.appendGate(equivalent.name, gateWires, { params: eqParams, condition: cudaqCondition });
								});
								var newOptions = {
									comment: "",
									decompose: false,
									versionStr: versionStr,
									providerName: "",
									backendName: "",
									asJupyter: false,
									shots: null,
									hybrid: false,
									encoderDecoder: false,
									commentOutUnknownGates: options.commentOutUnknownGates
								};
								cudaq += adjustIdentation(equivalentCircuit.exportToCudaQ(newOptions, false, true, !!exportAsGateName || insideSubmodule), identation);
							}
						}
					}
				}

				if(!cudaqReplacement && !cudaqEquivalent) {
					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						cudaq += identation + "if " + gate.options.condition.creg + ":\n";
						cudaq += "  ";
					}

					cudaq += identation;

					var gateName = gate.name;

					var gateParams = gate.options && gate.options.params ? gate.options.params : {};
					
					// Measurement is commented out in hybrid quantum-classical circuit when running on statevector simulator
					if(gateName == "measure") {
						if(stateVector && hybrid) {
							cudaq += "# ";
						}

						if(circuit.gotClassicalControl()) {
							cudaq += gate.options.creg.name + " = ";
						}
					}

					// Comment out unknown gates
					if(circuit.basicGates[gate.name] && !(gateDef && gateDef.exportInfo && gateDef.exportInfo.cudaq) && options.commentOutUnknownGates) {
						cudaq += "# ";
					}
				
					var controlWiresCount = 0;
					if(gateDef && gateDef.exportInfo && gateDef.exportInfo.cudaq && gateDef.exportInfo.cudaq.name) {
						gateName = gateDef.exportInfo.cudaq.name;
						if(gateDef.exportInfo.cudaq.adjoint) {
							gateName += ".adj";
						}
						if(gateDef.exportInfo.cudaq.controlled) {
							gateName += ".ctrl";
							controlWiresCount = gateDef.exportInfo.cudaq.controlWiresCount || 1;
						}
					} else {
						gateName = gate.name;
					}

					cudaq += gateName + "(";

					var argCount = 0;
					if(gateParams) {
						var gateDef = circuit.basicGates[gate.name];
						if(!gateDef) {
							gateDef = circuit.customGates[gate.name];
						}

						if(gateDef) {
							var paramDef = gateDef.params || [];
							var paramCount = paramDef.length;
							if(paramCount) {
								for(var p = 0; p < paramCount; p++) {
									if(argCount > 0) {
										cudaq += ", ";
									}
									var paramName = paramDef[p];

									// ---
									// prepend 'np' to math constants
									if(gateParams[paramName] || gateParams[paramName].toString()) {
										var node = math.parse(gateParams[paramName] + "");
										var valueString = node.toString({ handler: mathToStringHandler });
										if(!exportAsGateName) {
											var globalParamIndex = circuit.params.indexOf(valueString);
											if(globalParamIndex >= 0) {
												valueString = "params[" + globalParamIndex + "]";
											}
										}

										cudaq += valueString;
									}
									// ---

									argCount++;
								}

								if(gateName == "cu" && !gateParams["gamma"]) {
									cudaq += ", 0";
									argCount++;
								}
							}
						}
					}

					for(var w = 0; w < gate.wires.length; w++) {
						if(argCount > 0) {
							cudaq += ", ";
						}
						if(w == 0 && controlWiresCount) {
							cudaq += "[";
						}
						if(exportAsGateName || insideSubmodule) {
							cudaq += "q_" + gate.wires[w];
						} else {
							cudaq += "q[" + gate.wires[w] + "]";
						}
						if(w == controlWiresCount - 1 && controlWiresCount) {
							cudaq += "]";
						}

						argCount++;
					}

					if(gateName == "measure" && gate.options && gate.options.creg) {
						if(argCount > 0) {
							cudaq += ", ";
						}

						cudaq += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
						argCount++;
					}

					cudaq += ")";

					cudaq += "\n";
				}
			}
		}
	}

	if(!circuitReplacement) {
		if(exportAsGateName) {
			cudaq += "\n";
		} else {
			cudaq += "\n";

			if(encoderDecoder) {
				cudaq += identation + "mz()\n";
				cudaq += "\n";
			}

			var identation = "";
			if(hybrid) {
				identation += "  ";
			}

			if(encoderDecoder) {
				identation += "  ";
			}

			// ---

			var execBlock = "";
			if(stateVector) {
				execBlock += identation + "state = cudaq.get_state(circuit";
				if(circuit.params && circuit.params.length) {
					execBlock += ", params";
				}
				execBlock += ")\n";
			} else {
				execBlock += identation + "counts = cudaq.sample(circuit";
				if(circuit.params && circuit.params.length) {
					execBlock += ", params";
				}
				if(shots) {
					execBlock += ", shots_count=shots";
				}
				execBlock += ")\n";
			}

			if(hybrid) {
				cudaq += "def objective_function(params):\n";

				cudaq += execBlock;

				if(!stateVector) {
					cudaq += identation + "counts = Counter(dict(counts.items()))\n";
				}

				if(!costFunction.trim()) {
					costFunction = "# CALCULATE COST HERE\ncost = 0";
				}

				cudaq += adjustIdentation(costFunction, identation);

				cudaq += "\n"
				cudaq += identation + "return cost\n"
			} else {
				if(encoderDecoder) {
					cudaq += execBlock;
					cudaq += identation + "output_data_row = decode_output(counts, output_decoding, unpack_values=True)\n";
					cudaq += identation + "return output_data_row\n";
				} else {
					cudaq += execBlock;
					cudaq += identation + "print(counts)\n";
				}
			}
			// ----

			if(hybrid) {
				var globalParamList = "";
				circuit.params.map(function(globalParamName, globalParamIndex) {
					if(globalParamIndex > 0) {
						globalParamList += ", ";
					}
					globalParamList += globalParamName;
				});

				cudaq += "\n";
				cudaq += "minimum = minimize(objective_function, params, method=\"" + (circuit.options && circuit.options.hybridOptions && circuit.options.hybridOptions.optimizer ? circuit.options.hybridOptions.optimizer : "Powell") + "\", tol=tolerance)\n";
				cudaq += "print(\"cost:\", minimum.fun, \"params:\", minimum.x)\n";
			}
		}

		if(asJupyter) {
			var notebook = {
				metadata: {
					kernelspec: {
						display_name: "Python 3",
						language: "python",
						name: "python3"
					}
				},
				nbformat: 4,
				nbformat_minor: 0,
				cells: [
					{
						cell_type: "code",
						source: cudaq,
						metadata: {

						},
						outputs: [],
						execution_count: null
					}
				]
			};
			return JSON.stringify(notebook);
		}
	}

	return cudaq;
};



QuantumCircuit.prototype.exportToQuEST = function(options, exportAsGateName, definedFunc) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;

	var self = this;

	definedFunc = definedFunc || [];

	var circuit = null;
	var functions = ["unitary","controlledUnitary"];

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var quest = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 2 && cline[0] != "/" && cline[1] != "/") {
				quest += "// ";
			}
			quest += cline;
			quest += "\n";
		});
	}

	for(var i = 0; i < this.numQubits; i++) {
		var gates = this.gates[i];
		for(var j = 0; j < gates.length; j++) {
			var gate = gates[j];
			if(!gate || !this.basicGates[gate.name]){
				continue;
			}

			if(this.basicGates[gate.name].exportInfo && this.basicGates[gate.name].exportInfo.quest) {
				var questName = this.basicGates[gate.name].exportInfo.quest.name;
				if(definedFunc.includes(gate.name)) {
					continue;
				}
				if(functions.includes(questName) || this.basicGates[gate.name].exportInfo.quest.func ) {
					definedFunc.push(gate.name);
				}
			}
		}
	}

	if(exportAsGateName) {
		quest += "Qureg " + exportAsGateName + "(Qureg qubits";

		for(var i = 0; i < circuit.numQubits; i++) {
			quest += ", const int q";
			quest += i;
		}

		if(circuit.params && circuit.params.length) {
			for(var i = 0; i < circuit.params.length; i++) {
				quest += ", double " + circuit.params[i];
			}
		}
		quest += ") {\n";
	} else {
		quest += "#include <math.h>\n#include \"QuEST.h\"\n\n";
		quest += "#ifndef M_PI\n#define M_PI 3.14159265\n#endif\n\n";

		var customQuEST = [];


		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						var newOptions = {
							comment: "",
							decompose: false
						};
						customQuEST.push(customCircuit.exportToQuEST(newOptions, usedGateName, definedFunc));
					}
				}
			});
		}

		for(var i = 0; i < definedFunc.length; i++) {
			var gateName = definedFunc[i];
				if(this.basicGates[gateName].exportInfo && this.basicGates[gateName].exportInfo.quest) {
				var questName = this.basicGates[gateName].exportInfo.quest.name;
				switch(questName) {
					case "unitary":
					case "controlledUnitary": {
						matrix = this.basicGates[gateName].exportInfo.quest.matrix;
						var questParams = this.basicGates[gateName].exportInfo.quest.params;
						quest += "void " + gateName + "(Qureg qubits, const int q";
						if(questName == "controlledUnitary") {
							quest += "1, const int q2";
						}
						if (questParams) {
							for(var j=0; j < questParams.length; j++) {
								quest += ", double " + questParams[j];
							}
						}
						quest += ") {\n";
						quest += "    ComplexMatrix2 u;\n";
						quest += "    u.r0c0 = (Complex) {.real=" + matrix[0][0][0] + ", .imag= " + matrix[0][0][1] + "};\n";
						quest += "    u.r0c1 = (Complex) {.real=" + matrix[0][1][0] + ", .imag= " + matrix[0][1][1] + "};\n";
						quest += "    u.r1c0 = (Complex) {.real=" + matrix[1][0][0] + ", .imag= " + matrix[1][0][1] + "};\n";
						quest += "    u.r1c1 = (Complex) {.real=" + matrix[1][1][0] + ", .imag= " + matrix[1][1][1] + "};\n";
						quest += "    " + questName + "(qubits, q"
						if(questName == "controlledUnitary") {
							quest += "1, q2";
						}
						quest += ", u);\n}\n\n";
					} break;
					default: { quest += this.basicGates[gateName].exportInfo.quest.func + "\n\n"; } break;
				}
			}
		}

		for(var i = 0; i < customQuEST.length; i++) {
			quest += customQuEST[i];
		}

		quest += "int main(int argc, char *argv[]) {\n";
		quest += "    QuESTEnv env = createQuESTEnv();\n";
		quest += "    Qureg qubits = createQureg(" + circuit.numQubits +", env);\n";
		quest += "    int measured[" + circuit.numQubits +"];\n\n";
	}

	quest += "\n";

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {

				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					quest += "if(" + gate.options.condition.creg + "==" + gate.options.condition.value + ") {\n";
				}

				var gateName = gate.name;
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var gateDef = this.basicGates[gateName];

				if(gateName == "measure") {
					quest += "    measured[" + gate.wires[0] + "] = measure(qubits, " + gate.wires[0];
				} else if(gateDef) {
					var questName = gateDef.exportInfo.quest.name;
					var questParams = gateDef.exportInfo.quest.params;

					if(functions.includes(questName)) {
						quest += "    " + gateName + "(qubits";
					} else {
						quest += "    " + questName + "(qubits";
					}

					for(var w = 0; w < gate.wires.length; w++) {
							if(exportAsGateName) {
								quest += ", q" + gate.wires[w];
							} else {
								quest += ", " + gate.wires[w];
							}
					}

					if(questParams) {
						switch(questName){
							case "compactUnitary": {
								quest += ", " + questParams.alpha;
								quest += ", " + questParams.beta;
							} break;
							case "phaseShift":
							case "controlledPhaseShift": {
								if(questParams.theta) {
									quest += ", " + questParams.theta;
								}
							} break;
						}
					}
				} else {
					gateDef = this.customGates[gateName];
					quest += "    qubits = " + gateName + "(qubits";

					for(var w = 0; w < gate.wires.length; w++) {
							quest += ", " + gate.wires[w];
					}
				}

				if(gateParams) {
					var gateDef = this.basicGates[gateName];
					if(!gateDef) {
						gateDef = this.customGates[gateName];
					}

					if(gateDef) {
						var paramDef = gateDef.params || [];
						var paramCount = paramDef.length;

						if(paramCount) {
							for(var p = 0; p < paramCount; p++) {
								var paramName = paramDef[p];
								quest += ", " + gateParams[paramName];
							}
						}
					}
				}

				quest += ");\n";

				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					quest += "}\n";
				}
			}
		}
	}

	if(exportAsGateName) {
		quest += "\n    return qubits;\n}\n\n";
	} else {
		quest += "\n    destroyQureg(qubits, env);\n";
		quest += "    destroyQuESTEnv(env);\n";
		quest += "    return 0;\n}\n";
	}

	return quest;
};


QuantumCircuit.prototype.exportToQASM = function(options, exportAsGateName, circuitReplacement, insideSubmodule) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var compatibilityMode = options.compatibilityMode;

	var self = this;

	var globalParams = this.options && this.options.params ? this.options.params : {};

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var nodeName = node.name;
			if(options.replaceVars && typeof options.replaceVars[nodeName] != "undefined") {
				var nodeName = options.replaceVars[nodeName];
				if(!compatibilityMode && self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if(!compatibilityMode && self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};

	var circuit = null;

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var qasm = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(exportAsGateName || insideSubmodule) {
				qasm += "  ";
			}

			if(cline.length >= 2 && cline[0] != "/" && cline[1] != "/") {
				qasm += "// ";
			}
			qasm += cline;
			qasm += "\n";
		});
	}

	if(exportAsGateName) {
		qasm += "gate " + exportAsGateName;

		if(circuit.params && circuit.params.length) {
			qasm += "(";
			for(var pc = 0; pc < circuit.params.length; pc++) {
				if(pc > 0) {
					qasm += ", ";
				}
				qasm += circuit.params[pc];
			}
			qasm += ")";
		}

		for(var i = 0; i < circuit.numQubits; i++) {
			if(i == 0) {
				qasm += " ";
			}
			if(i > 0) {
				qasm += ", ";
			}
			qasm += qubitLetter(i, circuit.numQubits);
		}
		qasm += "\n{\n";
	} else {
		if(!circuitReplacement){
			qasm += "OPENQASM 2.0;\n";
			qasm += "include \"qelib1.inc\";\n";
			qasm += "qreg q[" + circuit.numQubits + "];\n";

			for(var cregName in circuit.cregs) {
				qasm += "creg " + cregName + "[" + (circuit.cregs[cregName].length || 1) + "];\n";
			}

			var usedGates = circuit.usedGates();
			if(!decompose) {
				usedGates.map(function(usedGateName) {
					var basicGate = circuit.basicGates[usedGateName];
					if(!basicGate) {
						var customGate = self.customGates[usedGateName];
						if(customGate) {
							var customCircuit = new QuantumCircuit();
							customCircuit.load(customGate);
							var newOptions = {
								comment: "",
								decompose: false,
								compatibilityMode: compatibilityMode
							};
							qasm += customCircuit.exportToQASM(newOptions, usedGateName, false, false);
						}
					}
				});
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			var qasmReplacement = null;
			var qasmEquivalent = null;
			
			if(gate && gate.connector == 0) {
				var qasmName = gate.name;
				if(!compatibilityMode) {
					var gateDef = circuit.getGateDef(gate.name);
					if(gateDef){
						if(gateDef.exportInfo){
							if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.name) {
								qasmName = gateDef.exportInfo.qasm.name;
							} else if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.replacement) {
								var replacementCircuit = new QuantumCircuit();
								replacementCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								qasmReplacement = gateDef.exportInfo.qasm.replacement;
								qasmReplacement.map(function(replacement) {
									if(gate.options && gate.options.params){
										var params = Object.keys(gate.options.params);
										var replacementParams = Object.keys(replacement.params);
										params.map(function(param){
											if(replacementParams.indexOf(param) >= 0) {
												replacement.params[param] = gate.options.params[param];
											}
										});
									}

									var replacementCondition = gate.options && gate.options.condition ? gate.options.condition : {};
									replacementCircuit.appendGate(replacement.name, gate.wires, { params: replacement.params, condition: replacementCondition });
								});
								var newOptions = {
									comment: gate.name,
									decompose: false,
									compatibilityMode: compatibilityMode
								};
								qasm += "\n";
								qasm += replacementCircuit.exportToQASM(newOptions, false, true, !!exportAsGateName || insideSubmodule);
								qasm += "\n";
							} else if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.equivalent) {
								var equivalentCircuit = new QuantumCircuit();
								equivalentCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								qasmEquivalent = gateDef.exportInfo.qasm.equivalent;
								qasmEquivalent.map(function(equivalent) {

									var gateWires = equivalent.wires.length > 1 ? gate.wires : gate.wires[equivalent.wires[0]];
									var eqParams = {};
									if(equivalent.params) {
										// ---
										// equivalent gate params can contain variable from gate params
										// ---

										// Evaluate gate's params
										var gateParams = {};
										if(gate.options && gate.options.params) {
											for(var gateParamName in gate.options.params) {
												var node = math.parse(gate.options.params[gateParamName]);
												var valueString = node.toString({ handler: mathToStringHandler });
												gateParams[gateParamName] = valueString;
											}
										}
										
										for(var eqParamName in equivalent.params) {
											var node = math.parse(equivalent.params[eqParamName]);
											var valueString = node.toString({ handler: mathToStringHandler, replaceVars: gateParams });
											eqParams[eqParamName] = valueString;
										}
									}

									var eqCondition = gate.options && gate.options.condition ? gate.options.condition : {};

									equivalentCircuit.appendGate(equivalent.name, gateWires, { params: eqParams, condition: eqCondition });
								});
								var newOptions = {
									comment: gate.name,
									decompose: false,
									compatibilityMode: compatibilityMode
								};
								qasm += "\n";
								qasm += equivalentCircuit.exportToQASM(newOptions, "", true, !!exportAsGateName || insideSubmodule);
								qasm += "\n";
							}
						}
					}
				}

				if(!qasmReplacement && !qasmEquivalent) {
					if(exportAsGateName || insideSubmodule) {
						qasm += "  ";
					}
					
					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						qasm += "if(" + gate.options.condition.creg + "==" + gate.options.condition.value + ") ";
					}
				}

				if((!qasmReplacement && !qasmEquivalent) || compatibilityMode) {
					var gateName = gate.name;
					var gateParams = gate.options && gate.options.params ? gate.options.params : {};

					qasm += compatibilityMode ? gate.name : qasmName;

					if(gateParams) {
						var gateDef = circuit.basicGates[gateName];
						if(!gateDef) {
							gateDef = circuit.customGates[gateName];
						}

						if(gateDef) {
							var paramDef = gateDef.params || [];
							var paramCount = paramDef.length;
							if(paramCount) {
								qasm += " (";
								for(var p = 0; p < paramCount; p++) {
									if(p > 0) {
										qasm += ", ";
									}
									var paramName = paramDef[p];

									var paramValue = gateParams[paramName];
									if(!exportAsGateName && !insideSubmodule && !compatibilityMode) {
										var node = math.parse(gateParams[paramName]);
										paramValue = node.toString({ handler: mathToStringHandler });
									}
									qasm += paramValue;
								}
								qasm += ")";
							}
						}	
					}

					for(var w = 0; w < gate.wires.length; w++) {
						if(w > 0) {
							qasm += ",";
						}
						if(exportAsGateName || insideSubmodule) {
							qasm += " " + qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							qasm += " q[" + gate.wires[w] + "]";
						}
					}

					if(gateName == "measure" && gate.options && gate.options.creg) {
						qasm += " -> ";
						qasm += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
					}

					qasm += ";\n";
				}
			}
		}
	}

	if(exportAsGateName) {
		qasm += "}\n\n";
	}

	return qasm;
};

QuantumCircuit.prototype.exportToPyquil = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var lattice = options.lattice;
	var asQVM = options.asQVM;
	var asJupyter = options.asJupyter;
	var shots = options.shots;
	var hybrid = options.hybrid;

	var self = this;

	var version = parseFloat(versionStr || "2.12");
	if(isNaN(version)) {
		version = 2.1;
	}

	if(!shots) {
		shots = 1024;
	}

	if(typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			if(self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	var adjustIdentation = function(addStr, ident) {
		var str = "";

		// add user defined cost function with proper identation
		var cfLines = addStr.split("\n");
		var minIdent = -1;
		cfLines.map(function(cfLine) {
			var tmpIdent = cfLine.search(/\S/);
			if(tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if(minIdent < 0) {
			minIdent = 0;
		}

		var addIdent = "";
		if(minIdent < ident.length) {
			for(var tmp = 0; tmp < (ident.length - minIdent); tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function(cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	var importGates = "";
	var defParams = [];
	var defGates = "";
	var defRun = "";
	var defArrays = "";
	var usedGates = circuit.usedGates();
	var gotMeasurement = circuit.gotMeasurement();

	var defGateNames = [];
	var defCircNames = [];
	usedGates.map(function(usedGateName) {
		var basicGate = circuit.basicGates[usedGateName];
		if(basicGate) {
			if(basicGate.exportInfo && basicGate.exportInfo.pyquil) {
				var quilInfo = basicGate.exportInfo.pyquil;
				if(quilInfo.array) {

					// defgate

					var paramList = "";
					if(quilInfo.params) {
						paramList += ", [";
						quilInfo.params.map(function(paramName, paramIndex) {
							if(paramIndex > 0) {
								paramList += ", ";
							}
							paramList += "p_" + paramName;
							var paramText = "p_" + paramName + " = Parameter(\'" + paramName + "\')";
							if(defParams.indexOf(paramText) < 0) {
								defParams.push(paramText);
							}
						});
						paramList += "]";
					}

					defRun += "p.inst(" + quilInfo.name + "_defgate)\n";
					defArrays += quilInfo.name + "_array = np.array(" + quilInfo.array + ")\n";
					defGates += quilInfo.name + "_defgate = DefGate(\'" + quilInfo.name + "\', " + quilInfo.name + "_array" + paramList + ")\n";
					defGates += quilInfo.name + " = " + quilInfo.name + "_defgate.get_constructor()\n";

					defGateNames.push(quilInfo.name);
				} else {
					var importName = "";
					if(quilInfo.replacement) {
						var bg = circuit.basicGates[quilInfo.replacement.name];
						if(bg) {
							if(bg.exportInfo) {
								if(bg.exportInfo.pyquil) {
									importName = bg.exportInfo.pyquil.name;
								} else {
									if(bg.exportInfo.quil) {
										importName = bg.exportInfo.quil.name;
									}
								}
							}
						}
					} else {
						importName = quilInfo.name;
					}

					if(importName) {
						if(importGates) {
							importGates += ", ";
						}
						importGates += importName;
					}
				}
			} else {
				if(basicGate.exportInfo && basicGate.exportInfo.quil) {
					var quilInfo = basicGate.exportInfo.quil;

					if(!quilInfo.defgate) {

						var importName = "";
						if(quilInfo.replacement) {
							var bg = circuit.basicGates[quilInfo.replacement.name];
							if(bg) {
								if(bg.exportInfo) {
									if(bg.exportInfo.pyquil) {
										importName = bg.exportInfo.pyquil.name;
									} else {
										if(bg.exportInfo.quil) {
											importName = bg.exportInfo.quil.name;
										}
									}
								}
							}
						} else {
							importName = quilInfo.name;
						}

						if(importName) {
							if(importGates) {
								importGates += ", ";
							}
							importGates += importName;
						}

					}
				} else {
					// basic gate not supported by pyquil
					// TODO: add pyquil define gate code
				}
			}
		}
	});

	// import MOVE, AND, OR if circuit has conditions
	var gotConditions = circuit.gotClassicalControl();
	if(gotConditions) {
		if(importGates) {
			importGates += ", ";
		}
		if(version < 2) {
			importGates += "FALSE, NOT, OR, AND";
		} else {
			importGates += "MOVE, NOT, IOR, AND";
		}
	}

	var importsForDefgate = "";
	if(defGates) {
		if(version < 2.12) {
			importsForDefgate = "from pyquil.parameters import Parameter, quil_sin, quil_cos, quil_sqrt, quil_exp, quil_cis\nfrom pyquil.quilbase import DefGate";
		} else {
			importsForDefgate = "from pyquil.quilatom import Parameter, quil_sin, quil_cos, quil_sqrt, quil_exp, quil_cis\nfrom pyquil.quilbase import DefGate";			
		}
	}

	var pyquil = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				pyquil += "# ";
			}
			pyquil += cline;
			pyquil += "\n";
		});
	}

	var indent = "";
	if(exportAsGateName) {
		var args = "";
		var argCount = 0;
		for(var i = 0; i < circuit.params.length; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for(var i = 0; i < circuit.numQubits; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += "q" + i;
			argCount++;
		}
		pyquil += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indent = "  ";
	} else {
		if(version < 2) {
			pyquil += "from pyquil.api import QVMConnection\n";
			pyquil += "from pyquil.quil import Program\n";
		} else {
			pyquil += "from pyquil import Program, get_qc\n";
		}

		if(importGates) {
			pyquil += "from pyquil.gates import " + importGates + "\n";
		}
		if(importsForDefgate) {
			pyquil += importsForDefgate + "\n";
		}

		pyquil += "from functools import reduce\n";

		if(hybrid) {
			pyquil += "from scipy.optimize import minimize\n";
			pyquil += "from collections import Counter\n";

		}

		pyquil += "import numpy as np\n";


		if(shots) {
			pyquil += "\n";
			pyquil += "shots = " + shots + "\n";
		}

		var globalParams = this.options && this.options.params ? this.options.params : {};
		if(this.params.length) {
			pyquil += "\n";
			for(var i = 0; i < this.params.length; i++) {
				var globalParamName = this.params[i];

				var node = math.parse(globalParams[globalParamName]);
				var globalParamValue = node.toString({ handler: mathToStringHandler });

				pyquil += globalParamName + " = " + globalParamValue + "\n";
			}
			pyquil += "\n";
		}

		if(hybrid) {
			pyquil += "tolerance = " + (this.options && this.options.hybridOptions && this.options.hybridOptions.tolerance ? this.options.hybridOptions.tolerance || "0.001" : "0.001") + "\n";
			pyquil += "\n";
		}

		if(defGates) {
			defParams.map(function(defParamItem, defIndex) {
				if(defIndex == 0) {
					pyquil += "\n";
				}
				pyquil += defParamItem + "\n";
			});
			pyquil += "\n";
			pyquil += defArrays + "\n";
			pyquil += "\n";
			pyquil += defGates + "\n";
		}
		pyquil += "\n";

		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						var newOptions = {
							comment: "",
							decompose: false,
							versionStr: versionStr,
						};
						pyquil += customCircuit.exportToPyquil(newOptions, usedGateName);
						defCircNames.push(usedGateName);
					}
				}
			});
		}
	}

	if(hybrid) {
		indent += "  ";

		pyquil += "def objective_function(params):\n"
	}

	if(version >= 2 && !exportAsGateName) {
		if(asQVM || lattice) {
			pyquil += indent + "p = Program('PRAGMA INITIAL_REWIRING \"PARTIAL\"')\n\n";
		} else {
			pyquil += indent + "p = Program()\n\n";
		}

		var totalBits = circuit.cregTotalBits();
		if(gotConditions) {
			totalBits += 1;
		};
		if(totalBits) {
			pyquil += indent + "ro = p.declare('ro', memory_type='BIT', memory_size=" + totalBits + ")\n";
			pyquil += "\n";
		}
	} else {
		pyquil += indent + "p = Program()\n\n";
	}

	pyquil += defRun ? (indent + defRun + "\n") : "";

	for(var column = 0; column < circuit.numCols(); column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);
				var gateParams = gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var quilInfo = null;
				if(gateDef) {
					if(gateDef.exportInfo) {
						if(gateDef.exportInfo.pyquil && gateDef.exportInfo.pyquil.replacement) {
							if(gateDef.exportInfo.pyquil.replacement.params) {
								gateParams = gateDef.exportInfo.pyquil.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.pyquil.replacement.name);
						} else {
							if(gateDef.exportInfo.quil && gateDef.exportInfo.quil.replacement) {
								if(gateDef.exportInfo.quil.replacement.params) {
									gateParams = gateDef.exportInfo.quil.replacement.params;
								}
								gateDef = circuit.getGateDef(gateDef.exportInfo.quil.replacement.name);
							}
						}

						if(gateDef && gateDef.exportInfo) {
							if(gateDef.exportInfo.pyquil) {
								quilInfo = gateDef.exportInfo.pyquil;
							} else {
								if(gateDef.exportInfo.quil) {
									quilInfo = gateDef.exportInfo.quil;
								}
							}
						}
					}

					var isDefGate = false;
					var isDefCirc = false;
					if(quilInfo) {
						isDefGate = defGateNames.indexOf(quilInfo.name) >= 0;
						isDefCirc = defCircNames.indexOf(quilInfo.name) >= 0;
					} else {
						isDefGate = defGateNames.indexOf(gate.name) >= 0;
						isDefCirc = defCircNames.indexOf(gate.name) >= 0;
					}

					var insideControl = false;
					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						// ---
						// Flow control
						// ---
						insideControl = true;
						pyquil += "\n";

						var testBit = self.cregTotalBits();
						var condition = gate.options.condition;
						var conditionValue = condition.value || 0;
						var cregBase = self.cregBase(condition.creg);

						if(conditionValue == 0) {
							var cregSize = self.cregs[condition.creg].length;
							if(version < 2) {
								pyquil += indent + "p.inst(FALSE(" + testBit + "))\n";
								for(var bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									pyquil += indent + "p.inst(OR(" + (bitIndex + cregBase) + ", " + testBit + "))\n";
								}
								pyquil += indent + "p.inst(NOT(" + testBit + "))\n";
								pyquil += indent + "p.if_then(" + testBit + ", Program(";
							} else {
								pyquil += indent + "p.inst(MOVE(ro[" + testBit + "], 0))\n";
								for(var bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									pyquil += indent + "p.inst(IOR(ro[" + testBit + "], ro[" + (bitIndex + cregBase) + "]))\n";
								}
								pyquil += indent + "p.inst(NOT(ro[" + testBit + "]))\n";
								pyquil += indent + "p.if_then(ro[" + testBit + "], Program(";
							}
						} else {
							var bitStr = conditionValue.toString(2).split("").reverse();
							var bitCount = 0;
							var singleBitIndex = 0;
							bitStr.map(function(bitValue, bitIndex) {
								var bitVal = parseInt(bitValue);
								bitStr[bitIndex] = bitVal;
								if(bitVal) {
									bitCount++;
									singleBitIndex = bitIndex;
								}
							});

							if(bitCount == 1) {
								if(version < 2) {
									pyquil += indent + "p.if_then(" + (singleBitIndex + cregBase) + ", Program(";
								} else {
									pyquil += indent + "p.if_then(ro[" + (singleBitIndex + cregBase) + "], Program(";
								}
							} else {
								if(version < 2) {
									pyquil += indent + "p.inst(FALSE(" + testBit + "))\n";
									var firstSet = true;
									bitStr.map(function(bitValue, bitIndex) {
										if(bitValue) {
											if(firstSet) {
												firstSet = false;
												pyquil += indent + "p.inst(OR(" + (bitIndex + cregBase) + ", " + testBit + "))\n";
											} else {
												pyquil += indent + "p.inst(AND(" + (bitIndex + cregBase) + ", " + testBit + "))\n";
											}
										}
									});
									pyquil += indent + "p.if_then(" + testBit + ", Program(";
								} else {
									pyquil += indent + "p.inst(MOVE(ro[" + testBit + "], 0))\n";
									var firstSet = true;
									bitStr.map(function(bitValue, bitIndex) {
										if(bitValue) {
											if(firstSet) {
												firstSet = false;
												pyquil += indent + "p.inst(IOR(ro[" + testBit + "], ro[" + (bitIndex + cregBase) + "]))\n";
											} else {
												pyquil += indent + "p.inst(AND(ro[" + testBit + "], ro[" + (bitIndex + cregBase) + "]))\n";
											}
										}
									});
									pyquil += indent + "p.if_then(ro[" + testBit + "], Program(";
								}
							}
						}
						// ---
					} else {
						pyquil += indent + "p.inst(";
					}

					if(quilInfo) {
						pyquil += quilInfo.name;
					} else {
						pyquil += gate.name;
					}

					var gotOpenBrace = false;
					if(quilInfo && quilInfo.params && quilInfo.params.length) {
						var argCount = 0;
						pyquil += "(";
						gotOpenBrace = true;
						for(var p = 0; p < quilInfo.params.length; p++) {
							if(argCount > 0) {
								pyquil += ", ";
							}

							// ---
							// prepend 'np' to math constants
							if(typeof gateParams[quilInfo.params[p]] != "undefined") {
								var node = math.parse(gateParams[quilInfo.params[p]]);
								pyquil += node.toString({ handler: mathToStringHandler });
							}
							// ---

							argCount++;
						}
						if(version < 2 || isDefGate) {
							pyquil += ")";
						} else {
							pyquil += ", ";
						}
					} else {
						if(gateDef && gateDef.params && gateDef.params.length) {
							var argCount = 0;
							pyquil += "(";
							gotOpenBrace = true;
							for(var p = 0; p < gateDef.params.length; p++) {
								if(argCount > 0) {
									pyquil += ", ";
								}

								// ---
								// prepend 'np' to math constants
								if(typeof gateParams[gateDef.params[p]] != "undefined") {
									var node = math.parse(gateParams[gateDef.params[p]]);
									pyquil += node.toString({ handler: mathToStringHandler });
								}
								// ---

								argCount++;
							}
							if(version < 2 || isDefGate) {
								pyquil += ")";
							} else {
								pyquil += ", ";
							}
						}
					}

					if(gate.wires.length) {
						var argCount = 0;
						if(version < 2 || !gotOpenBrace || isDefGate) {
							pyquil += "(";
							gotOpenBrace = true;
						}
						for(var w = 0; w < gate.wires.length; w++) {
							if(argCount > 0) {
								pyquil += ", ";
							}

							if(exportAsGateName) {
								pyquil += "q" + gate.wires[w];
							} else {
								pyquil += "" + gate.wires[w];
							}

							argCount++;
						}

						if(gate.name == "measure" && gate.options && gate.options.creg) {
							var targetBit = parseInt(gate.options.creg.bit) || 0;
							if(isNaN(targetBit)) {
								targetBit = 0;
							}

							if(argCount > 0) {
								pyquil += ", ";
							}

							if(version < 2) {
								pyquil += (targetBit + self.cregBase(gate.options.creg.name));
							} else {
								pyquil += "ro[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
							}

							argCount++;
						}
						pyquil += ")";
					}

					pyquil += ")";
					if(insideControl) {
						pyquil += ")\n";
					}
					pyquil += "\n";
				} else {
					// unknown gate?
					pyquil += indent + "# Export to pyquil WARNING: unknown gate \"" + gate.name + "\".";
				}
			}
		}
	}

	if(exportAsGateName) {
		pyquil += indent + "return p\n";
		pyquil += "\n";
	} else {
		pyquil += "\n";
		if(version < 2) {
			pyquil += indent + "qvm = QVMConnection()\n";

			if(hybrid) {
				pyquil += "\n"

				pyquil += indent + "# CALCULATE COST HERE\n";

				var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
				if(!costFunction.trim()) {
					costFunction = "cost = 0";
				}

				pyquil += adjustIdentation(costFunction, indent);

				pyquil += "\n"
				pyquil += indent + "return cost\n"
			} else {
				pyquil += indent + "print(qvm.run(p))\n";
			}
		} else {
			if(shots) {
				pyquil += indent + "p.wrap_in_numshots_loop(shots)\n";
				pyquil += "\n";
			}

			var latticeName = lattice;
			if(!latticeName) {
				if(version < 2.1) {
					latticeName = this.numQubits + "q-generic-qvm";
				} else {
					latticeName = this.numQubits + "q-qvm";
				}
			}

			pyquil += indent + "qc = get_qc('" + latticeName + "'" + (lattice ? (", as_qvm=" + (asQVM ? "True" : "False")) : "") + ")\n";

			if(lattice) {
				pyquil += indent + "ep = qc.compile(p)\n";

				if(gotMeasurement) {

					pyquil += indent + "results_list = qc.run(ep).readout_data.get(\"ro\")\n";
					pyquil += indent + "results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], \"\"), results_list))\n";

					if(hybrid) {
						pyquil += indent + "counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n"
						pyquil += indent + "# CALCULATE COST HERE\n";

						var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
						if(!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n"
						pyquil += indent + "return cost\n"
					} else {
						pyquil += indent + "counts = dict(zip(results,[results.count(i) for i in results]))\n";
						pyquil += indent + "print(counts)\n";					
					}
				} else {
					if(hybrid) {
						pyquil += indent + "counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n"
						pyquil += indent + "# CALCULATE COST HERE\n";

						var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
						if(!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n"
						pyquil += indent + "return cost\n"
					} else {
						pyquil += indent + "print(qc.run(ep).readout_data.get(\"ro\"))\n";
					}
				}
			} else {
				if(gotMeasurement) {
					pyquil += indent + "results_list = qc.run(p).readout_data.get(\"ro\")\n";
					pyquil += indent + "results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], \"\"), results_list))\n";
					if(hybrid) {
						pyquil += indent + "counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n"
						pyquil += indent + "# CALCULATE COST HERE\n";

						var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
						if(!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n"
						pyquil += indent + "return cost\n"
					} else {
						pyquil += indent + "counts = dict(zip(results,[results.count(i) for i in results]))\n";
						pyquil += indent + "print(counts)\n";					
					}
				} else {
					pyquil += indent + "results_list = qc.run(p).readout_data.get(\"ro\")\n";
					pyquil += indent + "results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], \"\"), results_list))\n";
					if(hybrid) {
						pyquil += indent + "counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n"
						pyquil += indent + "# CALCULATE COST HERE\n";

						var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
						if(!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n"
						pyquil += indent + "return cost\n"
					} else {
						pyquil += indent + "print(results)\n";
					}
				}
			}
		}

		if(hybrid) {
			var globalParamList = "";
			this.params.map(function(globalParamName, globalParamIndex) {
				if(globalParamIndex > 0) {
					globalParamList += ", ";
				}
				globalParamList += globalParamName;
			});

			pyquil += "\n";
			pyquil += "params = np.array([" + globalParamList + "])\n";
			pyquil += "\n";
			pyquil += "minimum = minimize(objective_function, params, method=\"" + (this.options && this.options.hybridOptions && this.options.hybridOptions.optimizer ? this.options.hybridOptions.optimizer : "Powell") + "\", tol=tolerance)\n";
			pyquil += "print(\"cost:\", minimum.fun, \"params:\", minimum.x)\n";
		}
	}

	if(asJupyter) {
		var notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: pyquil,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return pyquil;
};

QuantumCircuit.prototype.exportToQuil = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;

	// QUIL Submodules not supported
	var decompose = true; // options.decompose;
	var versionStr = options.versionStr;

	var self = this;

	var version = parseFloat(versionStr || "2.0");
	if(isNaN(version)) {
		version = 2.0;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var quil = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				quil += "# ";
			}
			quil += cline;
			quil += "\n";
		});
	}

	var usedGates = circuit.usedGates();
	usedGates.map(function(usedGateName) {
		var basicGate = circuit.basicGates[usedGateName];
		if(basicGate) {
			if(basicGate.exportInfo && basicGate.exportInfo.quil) {
				if(basicGate.exportInfo.quil.defgate) {
					quil += basicGate.exportInfo.quil.defgate;
					quil += "\n\n";
				}
			} else {
				// basic gate not supported by quil
				// TODO: add quil define gate code
			}
		}
	});

	var gotConditions = this.gotClassicalControl();
	var indent = "";
	if(exportAsGateName) {
		var params = "";
		if(circuit.params.length) {
			params += "(";
			for(var i = 0; i < circuit.params.length; i++) {
				if(i > 0) {
					params += ", ";
				}
				params += "%" + circuit.params[i];
			}
			params += ")";
		}

		var args = "";
		for(var i = 0; i < circuit.numQubits; i++) {
			if(i > 0) {
				args += " ";
			}
			args += "q" + i;
		}
		quil += "DEFCIRCUIT " + exportAsGateName + (params ? " " + params : "") + (args ? " " + args : "") + ":\n";
		indent = "    ";
	} else {
		quil += "\n";

		if(version >= 2) {
			var totalBits = circuit.cregTotalBits();
			if(gotConditions) {
				totalBits += 1;
			};
			if(totalBits) {
				quil += "DECLARE ro BIT[" + totalBits + "]\n";
			}
		}

		var globalParams = this.options && this.options.params ? this.options.params : {};
		if(this.params.length) {
			quil += "\n";
			for(var i = 0; i < this.params.length; i++) {
				var globalParamName = this.params[i];

				var node = math.parse(globalParams[globalParamName]);
				var globalParamValue = node.toString({ handler: mathToStringHandler });

				quil += "DECLARE " + globalParamName + " REAL[1]\n";
			}
			quil += "\n";
		}

		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						var newOptions = {
							comment: "",
							decompose: false
						};					
						quil += customCircuit.exportToQuil(newOptions, exportAsGateName);
					}
				}
			});
		}
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode && circuit.params.indexOf(node.name) >= 0) {
			return "%" + node.name;
		}
	};

	var labelCounter = 1;
	for(var column = 0; column < circuit.numCols(); column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var quilInfo = null;
				if(gateDef) {
					if(gateDef.exportInfo) {
						if(gateDef.exportInfo.quil && gateDef.exportInfo.quil.replacement) {
							if(gateDef.exportInfo.quil.replacement.params) {
								gateParams = gateDef.exportInfo.quil.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.quil.replacement.name);
						}

						quilInfo = (gateDef && gateDef.exportInfo && gateDef.exportInfo.quil) ? gateDef.exportInfo.quil : null;
					}

					var insideControl = false;
					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						// ---
						// Flow control
						// ---
						insideControl = true;
						quil += "\n";

						var testBit = self.cregTotalBits();
						var condition = gate.options.condition;
						var conditionValue = condition.value || 0;
						var cregBase = self.cregBase(condition.creg);

						if(conditionValue == 0) {
							var cregSize = self.cregs[condition.creg].length;
							if(version < 2) {
								quil += indent + "FALSE [" + testBit + "]\n";
								for(var bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									quil += indent + "OR [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
								}
								quil += indent + "NOT [" + testBit + "]\n";
								quil += "JUMP-WHEN @THEN" + labelCounter + " [" + testBit + "]\n";
								quil += "JUMP @END" + (labelCounter + 1) + "\n";
								quil += "LABEL @THEN" + labelCounter + "\n";
							} else {
								quil += indent + "FALSE ro[" + testBit + "]\n";
								for(var bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									quil += indent + "OR ro[" + (bitIndex + cregBase) + "] ro[" + testBit + "]\n";
								}
								quil += indent + "NOT ro[" + testBit + "]\n";
								quil += "JUMP-WHEN @THEN" + labelCounter + " ro[" + testBit + "]\n";
								quil += "JUMP @END" + (labelCounter + 1) + "\n";
								quil += "LABEL @THEN" + labelCounter + "\n";
							}
						} else {
							var bitStr = conditionValue.toString(2).split("").reverse();
							var bitCount = 0;
							var singleBitIndex = 0;
							bitStr.map(function(bitValue, bitIndex) {
								var bitVal = parseInt(bitValue);
								bitStr[bitIndex] = bitVal;
								if(bitVal) {
									bitCount++;
									singleBitIndex = bitIndex;
								}
							});

							if(bitCount == 1) {
								if(version < 2) {
									quil += "JUMP-WHEN @THEN" + labelCounter + " [" + (singleBitIndex + cregBase) + "]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								} else {
									quil += "JUMP-WHEN @THEN" + labelCounter + " ro[" + (singleBitIndex + cregBase) + "]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								}
							} else {
								if(version < 2) {
									quil += indent + "FALSE [" + testBit + "]\n";
									var firstSet = true;
									bitStr.map(function(bitValue, bitIndex) {
										if(bitValue) {
											if(firstSet) {
												firstSet = false;
												quil += indent + "OR [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
											} else {
												quil += indent + "AND [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
											}
										}
									});
									quil += "JUMP-WHEN @THEN" + labelCounter + " [" + testBit + "]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								} else {
									quil += indent + "FALSE ro[" + testBit + "]\n";
									var firstSet = true;
									bitStr.map(function(bitValue, bitIndex) {
										if(bitValue) {
											if(firstSet) {
												firstSet = false;
												quil += indent + "OR ro[" + (bitIndex + cregBase) + "] ro[" + testBit + "]\n";
											} else {
												quil += indent + "AND ro[" + (bitIndex + cregBase) + "] ro[" + testBit + "]\n";
											}
										}
									});
									quil += "JUMP-WHEN @THEN" + labelCounter + " ro[" + testBit + "]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								}
							}
						}
						// ---
					}

					if(quilInfo) {
						quil += indent + quilInfo.name;
					} else {
						quil += indent + gate.name;
					}

					quil += " ";
					var argCount = 0;
					if(quilInfo && quilInfo.params && quilInfo.params.length) {
						quil += "(";
						for(var p = 0; p < quilInfo.params.length; p++) {
							if(argCount > 0) {
								quil += ", ";
							}

							// ---
							// prepend '%' to global params
							if(typeof gateParams[quilInfo.params[p]] != "undefined") {
								var node = math.parse(gateParams[quilInfo.params[p]]);
								quil += node.toString({ handler: mathToStringHandler });
							}
							// ---

							argCount++;
						}
						quil += ")";
					} else {
						if(gateDef && gateDef.params && gateDef.params.length) {
							quil += "(";
							for(var p = 0; p < gateDef.params.length; p++) {
								if(argCount > 0) {
									quil += ", ";
								}

								// ---
								// prepend '%' to global params
								if(typeof gateParams[gateDef.params[p]] != "undefined") {
									var node = math.parse(gateParams[gateDef.params[p]]);
									quil += node.toString({ handler: mathToStringHandler });
								}
								// ---

								argCount++;
							}
							quil += ")";
						}
					}

					for(var w = 0; w < gate.wires.length; w++) {
						if(argCount > 0) {
							quil += " ";
						}

						if(exportAsGateName) {
							quil += "q" + gate.wires[w];
						} else {
							quil += "" + gate.wires[w];
						}

						argCount++;
					}

					if(gate.name == "measure" && gate.options && gate.options.creg) {
						var targetBit = parseInt(gate.options.creg.bit) || 0;
						if(isNaN(targetBit)) {
							targetBit = 0;
						}

						if(argCount > 0) {
							quil += " ";
						}

						if(version < 2) {
							quil += "[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
						} else {
							quil += "ro[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
						}

						argCount++;
					}

					quil += "\n";

					if(insideControl) {
						quil += "LABEL @END" + (labelCounter + 1) + "\n";
						quil += "\n";
						labelCounter += 2;
					}
				} else {
					// unknown gate?
					console.log("unknown gate", gate.name);
				}
			}
		}
	}

	if(exportAsGateName) {
		quil += "\n";
	}

	return quil;
};

QuantumCircuit.prototype.exportToAQASM = function(options, isExportPyAQASM, exportAsGateName, indentDepth) {
	var self = this;

	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var asJupyter = options.asJupyter;
	var shots = options.shots;
	var hybrid = !!isExportPyAQASM ? options.hybrid : false;

	var circuit = null;
	var tempCircuit = null;

	shots = shots || 1024;

	if(typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	var obj = this.save(!!decompose);

	circuit = new QuantumCircuit();
	tempCircuit = new QuantumCircuit();
	circuit.load(obj);
	tempCircuit.load(obj);


	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			var nodeName = node.name;
			if(options.replaceVars && typeof options.replaceVars[nodeName] != "undefined") {
				var nodeName = options.replaceVars[nodeName];
				if(self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if(self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};


	var adjustIdentation = function(addStr, ident) {
		var str = "";

		// add user defined cost function with proper identation
		var cfLines = addStr.split("\n");
		var minIdent = -1;
		cfLines.map(function(cfLine) {
			var tmpIdent = cfLine.search(/\S/);
			if(tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if(minIdent < 0) {
			minIdent = 0;
		}

		var addIdent = "";
		if(minIdent < ident.length) {
			for(var tmp = 0; tmp < (ident.length - minIdent); tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function(cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	var getIndent = function(depth) {
		var indent = "";
		for(var i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	}

	indentDepth = indentDepth || 0;

	var gatesToBeAdded = [];
	if(!isExportPyAQASM){
		if(!decompose) {
			var numCols = tempCircuit.numCols();
			for(var column = numCols - 1; column >= 0; column--) {
				for(var wire = 0; wire < tempCircuit.numQubits; wire++) {
					var gate = tempCircuit.gates[wire][column];
					if(gate && gate.connector == 0 && !tempCircuit.basicGates[gate.name]) {
						customDecomposedCircuit = tempCircuit.decomposeGateAt(column, wire);
						var isDecomposeCustomCircuit = false;
						for(var decomposedColumn = 0; decomposedColumn < customDecomposedCircuit.numCols(); decomposedColumn++) {
							for(var decomposedWire = 0; decomposedWire < customDecomposedCircuit.numQubits; decomposedWire++) {
								var gateInCustomCircuit = customDecomposedCircuit.getGateAt(decomposedColumn, decomposedWire);

								if(gateInCustomCircuit && gateInCustomCircuit.connector == 0){
									gatesToBeAdded.push(gateInCustomCircuit);
								}
								
								circuit.gates.map(function(circuitGate, index){
									circuitGate.map(function(gateToRemove){
										if(gateToRemove && gateToRemove.name == gate.name){
											circuit.removeGate(gateToRemove.id);
										}
									});														
								});				
							}
						}
					}
				}
			}
		}
		gatesToBeAdded.map(function(gateToAdd){
			if(gateToAdd){
				circuit.insertGate(gateToAdd.name, gateToAdd.column, gateToAdd.wires, gateToAdd.options);
			}
		});
	}

	var aqasm = "";
	var indent = getIndent(indentDepth);
	var usedGates = circuit.usedGates();
	var numQubits = circuit.numQubits;
	
	if(!isExportPyAQASM){
		aqasm += indent +  "BEGIN\n";
		aqasm += indent +  "qubits " + numQubits + "\n";

		if (circuit.cregs){
			var cregLength = 0;
			for(var creg in circuit.cregs){
				cregLength += circuit.cregs[creg].length;
			}
			aqasm += indent + "cbits " + cregLength + "\n";
		}
	}else {
		if(exportAsGateName){
			var args = "";
			var argCount = 0;
			for(var i = 0; i < circuit.params.length; i++) {
				if(argCount > 0) {
					args += ", ";
				}
				args += circuit.params[i];
				argCount++;
			}
			for(var i = 0; i < circuit.numQubits; i++) {
				if(argCount > 0) {
					args += ", ";
				}
				args += qubitLetter(i, circuit.numQubits);
				argCount++;
			}
		}else {
			aqasm += indent + "from qat.lang.AQASM import *\n";
			aqasm += indent + "from qat.qpus import get_default_qpu\n";
			aqasm += indent + "from collections import Counter\n";

			if(hybrid) {
				aqasm += indent + "from scipy.optimize import minimize\n";
			}
			
			aqasm += indent +  "import numpy as np\n";

			aqasm += "\n";

			var unsupportedGateDefinition = "";
			var submoduleCount = 0;
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(basicGate) {
					if(!decompose) {
						if(circuit.basicGates[usedGateName].exportInfo.aqasm && circuit.basicGates[usedGateName].exportInfo.aqasm.array) {
							unsupportedAqasmInfo = circuit.basicGates[usedGateName].exportInfo.aqasm;
			
							gateUnitary = usedGateName + "_gate";
							aqasm += indent + "def " + gateUnitary +"(";
							
							if(unsupportedAqasmInfo.params && unsupportedAqasmInfo.params.length){
								var argCount = 0;
								unsupportedAqasmInfo.params.map(function(paramName){
									if(argCount > 0) {
										aqasm += ", ";
									}
									aqasm += indent + "p_" + paramName;
									argCount++;
								});
							}
					
							aqasm += "):\n";
							aqasm += getIndent(indentDepth + 1) + "return np.array(" +  unsupportedAqasmInfo.array + ")\n\n";							

							unsupportedGateDefinition += usedGateName + " = AbstractGate(\"" + usedGateName + "\", [";
							
							var count = 0;

							if(unsupportedAqasmInfo.params){
								for(var i = 0; i < unsupportedAqasmInfo.params.length; i++){
									if(count > 0){
										unsupportedGateDefinition += ", ";
									}
									unsupportedGateDefinition += "float";
									count++;
								}
							}

							if(basicGate.matrix){
								arity = math.log2(basicGate.matrix.length);
							}

							unsupportedGateDefinition += "], matrix_generator=" + gateUnitary + ", arity=" + arity +")\n";
						}					
					}
				} else {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);

						var newOptions = {
							comment: "",
							decompose: true,
							asJupyter: false,
							shots: null,
							hybrid: false
						};

						aqasm += customCircuit.exportToAQASM(newOptions, isExportPyAQASM, usedGateName, indentDepth);
						submoduleCount++;
					}
				}
			});

			aqasm += unsupportedGateDefinition;

			aqasm += "\n";

			if(shots) {
				aqasm += indent + "shots = " + shots + "\n";
				aqasm += "\n";
			}

			aqasm += indent +  "program = Program()\n";
			aqasm += indent +  "qubits_reg = program.qalloc("+ circuit.numQubits +")\n";	
			
			for(var cregName in circuit.cregs){
				aqasm += indent + cregName + " = program.calloc(" + circuit.cregs[cregName].length + ")\n";
			}

			aqasm += "\n";

			var globalParams = this.options && this.options.params ? this.options.params : {};
			if(this.params.length) {
				for(var i = 0; i < this.params.length; i++) {
					var globalParamName = this.params[i];

					var node = math.parse(globalParams[globalParamName]);
					var globalParamValue = node.toString({ handler: mathToStringHandler });

					aqasm += globalParamName + " = " + globalParamValue + "\n";
				}
				aqasm += "\n";
			}

			if(hybrid) {
				aqasm += indent + "tolerance = " + (this.options && this.options.hybridOptions && this.options.hybridOptions.tolerance ? this.options.hybridOptions.tolerance || "0.001" : "0.001") + "\n";
				aqasm += "\n";
			}
		}
	}

	if(exportAsGateName){
		aqasm += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indentDepth++;
		indent = getIndent(indentDepth);
		aqasm += indent + "circuit = QRoutine()\n"	
	} else {
		if(hybrid) {
			aqasm += "def objective_function(params):\n"
			indentDepth++;
			indent = getIndent(indentDepth);
		}
	}

	if(!exportAsGateName) {
		if(submoduleCount) {
			aqasm += "\n";
			usedGates.map(function(usedGateName) {
				if(!circuit.basicGates[usedGateName] && circuit.customGates[usedGateName]) {
					aqasm += indent + usedGateName + "(";
				}
			});
		}
	}

	for(var column = 0; column < circuit.numCols(); column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);
				var name = "";
				if(gate.options && gate.options.params){
					gateParams = gate.options.params;
				}

				if(gate.name == "measure"){
					if(!isExportPyAQASM) {
						name += "MEAS"
					} else {
						name += "program.measure";
					}
				}

				if(gate.name == "reset"){
					if(!isExportPyAQASM) {
						name += "RESET"
					} else {
						name += "program.reset";
					}
				}

				if(gateDef && gateDef.exportInfo){
					if(gateDef.exportInfo.aqasm){
						var aqasmInfo = gateDef.exportInfo.aqasm;
						var aqasmInfoName = "";
						if(aqasmInfo.name){					
							if(gateDef.params.length){
								gateDef.params.map(function(param){
									var node = math.parse(gateParams[param]);
									var paramValue = node.toString({handler: mathToStringHandler});
									aqasmInfoName = aqasmInfo.name;
									if(!isExportPyAQASM){
										aqasmInfoName += "[" + paramValue + "]";
									}else{
										aqasmInfoName += "(" + paramValue + ")";	
									}
								});
							}else {
								aqasmInfoName += aqasmInfo.name;
							}

							if(aqasmInfo.controlled && aqasmInfo.dagger){
								if(!isExportPyAQASM){
									name += "CTRL(DAG(" + aqasmInfoName + "))";
								}else {
									name += aqasmInfoName + ".dag().ctrl()";
								}
							}else if(aqasmInfo.controlled){
								if(!isExportPyAQASM){
									name += "CTRL(" + aqasmInfoName + ")";
								}else {
									name += aqasmInfoName + ".ctrl()";
								}
							}else if(aqasmInfo.dagger){
								if(!isExportPyAQASM){
									name += "DAG(" + aqasmInfoName + ")";
								}else {
									name += aqasmInfoName + ".dag()";
								}
							}else {
								name += aqasmInfoName;
							}

						} else if(aqasmInfo.matrix){
							if(!isExportPyAQASM) {
								name = "[";
								for(var k = 0 ; k < aqasmInfo.matrix.length; k++){
									row = aqasmInfo.matrix[k];
									name += "[";
									for(var i = 0; i < row.length; i++) {
										name += "(";
										row_element = row[i];
										if(aqasmInfo.params){
											aqasmInfo.params.map(function(paramName){
												var param = gateParams[paramName];
												if(row_element.toString().indexOf(paramName) > 0){
													row_element = row_element.replace(paramName, param);
												}
											});
										}
										evaluated_expression = math.evaluate(row_element, self.options.params);
										matrix_element = math.complex(evaluated_expression);
										matrix_element_real = matrix_element["re"];
										matrix_element_im = matrix_element["im"];
										name += matrix_element_real + ", " + matrix_element_im + ")";
										if (i < row.length - 1){
											name += " ";
										}
									}
									name += "]";
									if(k < aqasmInfo.matrix.length - 1) {
										name += " ";
									}
								}
								name += "]";
							} else {
								name += gate.name + "(";
								var paramCount = 0;
								gateDef.params.map(function(paramName){
									if(paramCount > 0){
										name += ", ";
									}
									var node = math.parse(gateParams[paramName]);
									var paramValue = node.toString({handler: mathToStringHandler});
									name += paramValue;
									paramCount++;
								});

								name += ")";
							}							
						}
					}

					aqasm += indent + name;

					if(!isExportPyAQASM){
						aqasm += " ";
					} else {
						aqasm += "(";
					}
				}
				
				var argCount = 0;
				for(var w = 0; w < gate.wires.length; w++){
					if(argCount > 0){
						aqasm +=  ", ";
					}

					if(!isExportPyAQASM){
						aqasm += "q[" + gate.wires[w] + "]";
					} else {
						if(exportAsGateName) {
							aqasm += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							aqasm += "qubits_reg[" + gate.wires[w] + "]";
						}
					}

					argCount = argCount + 1;
				}

				if(gate.options && gate.options.creg){
					aqasm += ", " + gate.options.creg.name + "[" + gate.options.creg.bit + "]";
				}

				if(isExportPyAQASM){
					aqasm += ")";
				}

				aqasm += "\n";
			}
		}
	}

	if(exportAsGateName) {
		aqasm += indent + "return circuit\n\n";
	}

	if(!isExportPyAQASM) {
		aqasm += "END";
	} else {
		if(!exportAsGateName){			
			aqasm += indent +  "\n";
			aqasm += indent +  "circuit = program.to_circ()\n";
			aqasm += indent +  "job = circuit.to_job(nbshots=shots, aggregate_data=False)\n";
			aqasm += indent +  "qpu = get_default_qpu()\n";
			aqasm += indent +  "job_result = qpu.submit(job)\n";
			aqasm += indent +  "counts = Counter()\n\n";
			aqasm += indent +  "for state in job_result:\n";
			aqasm += indent +  "    string_state = str(state.state)\n";
			aqasm += indent +  "    string_state = string_state[string_state.find('|') + 1: string_state.find('>')]\n";
			aqasm += indent +  "    string_state = string_state[::-1]\n"
			aqasm += indent +  "    counts[string_state] += 1\n\n"

			if(hybrid) {
				aqasm += indent + "# CALCULATE COST HERE\n";
	
				var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
				if(!costFunction.trim()) {
					costFunction = "cost = 0";
				}
	
				aqasm += adjustIdentation(costFunction, indent);
	
				aqasm += "\n"
				aqasm += indent + "return cost\n";	
	
				indentDepth--;
				indent = getIndent(indentDepth);
				if(hybrid) {
					var globalParamList = "";
					this.params.map(function(globalParamName, globalParamIndex) {
						if(globalParamIndex > 0) {
							globalParamList += ", ";
						}
						globalParamList += globalParamName;
					});
	
					aqasm += "\n";
					aqasm += "params = np.array([" + globalParamList + "])\n";
					aqasm += "\n";
					aqasm += "minimum = minimize(objective_function, params, method=\"" + (this.options && this.options.hybridOptions && this.options.hybridOptions.optimizer ? this.options.hybridOptions.optimizer : "Powell") + "\", tol=tolerance)\n";
					aqasm += "print(\"cost:\", minimum.fun, \"params:\", minimum.x)\n";
				}
	
			} else {
				aqasm += indent + "print(counts)";
			}
		}
	}

	if(asJupyter && isExportPyAQASM) {
		var notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: aqasm,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return aqasm
};

QuantumCircuit.prototype.exportAQASM = function(comment, decompose, isExportPyAQASM, exportAsGateName, asJupyter, shots, hybrid, encoderDecoder, indentDepth) {
	var options = {
		comment: comment,
		decompose: decompose,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder
	};

	return this.exportToAQASM(options, isExportPyAQASM, exportAsGateName, indentDepth);
};


QuantumCircuit.prototype.exportToPyAQASM = function(options, exportAsGateName) {
	return this.exportToAQASM(options, true, exportAsGateName);
};

QuantumCircuit.prototype.exportPyAQASM = function(comment, decompose, exportAsGateName, asJupyter, shots, hybrid, encoderDecoder) {
	var options = {
		comment: comment,
		decompose: decompose,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		encoderDecoder: encoderDecoder
	};
	return this.exportToPyAQASM(options, exportAsGateName);
};

QuantumCircuit.prototype.exportToCirq = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var asJupyter = options.asJupyter;
	var shots = options.shots;
	var exportTfq = options.exportTfq;

	var self = this;

	var platform = "";
	if(exportTfq) {
		platform = "TFQ";
	} else {
		platform = "cirq";
	}

	var version = parseFloat(versionStr || "0.7");
	if(isNaN(version)) {
		version = 0.7;
	}

	if(typeof shots == "undefined") {
		shots = 1024;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var cirq = "";
	var indent = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				cirq += "# ";
			}
			cirq += cline;
			cirq += "\n";
		});
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}
		}
	};

	var paramsToArg = function(gateName, gateParams) {
		var argCount = 0;
		if(gateParams) {
			var gateDef = this.basicGates[gateName];
			if(!gateDef) {
				gateDef = this.customGates[gateName];
			}

			if(gateDef) {
				var paramDef = gateDef.params || [];
				var paramCount = paramDef.length;
				if(paramCount) {		
					for(var p = 0; p < paramCount; p++) {
						if(argCount > 0) {
							cirq += ", ";
						}
						var paramName = paramDef[p];

						// ---
						// prepend 'np' to math constants
						if(gateParams[paramName]) {
							var node = math.parse(gateParams[paramName]);
							cirq += node.toString({ handler: mathToStringHandler });
						}
						// ---

						argCount++;
					}
				}
			}
		}
	};

	if(exportAsGateName) {
		var args = "";
		var argCount = 0;
		for(var i = 0; i < circuit.params.length; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for(var i = 0; i < circuit.numQubits; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits);
			argCount++;
		}
		cirq += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		cirq += "    return [\n";
		indent = "        ";
	} else {
		if(exportTfq){
			cirq += "import tensorflow_quantum as tfq\n"
		}

		cirq += "import cirq\n";
		cirq += "import numpy as np\n";
		cirq += "from functools import reduce\n";
		cirq += "\n";

		var globalParams = this.options && this.options.params ? this.options.params : {};
		if(this.params.length) {
			for(var i = 0; i < this.params.length; i++) {
				var globalParamName = this.params[i];

				var node = math.parse(globalParams[globalParamName]);
				var globalParamValue = node.toString({ handler: mathToStringHandler });

				cirq += globalParamName + " = " + globalParamValue + "\n";
			}
			cirq += "\n";
		}

		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						var newOptions = {
							comment: "",
							decompose: true,
							versionStr: versionStr
						};						
						cirq += customCircuit.exportToCirq(newOptions, exportAsGateName);
					}
				}
			});
		}

		var defGates = "";
		var usedGates = circuit.usedGates();
		usedGates.map(function(usedGateName) {
			var basicGate = circuit.basicGates[usedGateName];
			if(basicGate) {
				if(basicGate.exportInfo && basicGate.exportInfo.cirq) {
					var cirqInfo = basicGate.exportInfo.cirq;
					var isReplaced = false;
					if (cirqInfo.replacement) {
						var replacementGateDef = circuit.getGateDef(cirqInfo.replacement.name)
						cirqInfo = replacementGateDef.exportInfo.cirq
						isReplaced = true;
					}
					if(cirqInfo.array) {
						if(!exportTfq){
							// defgate
							var defName = isReplaced ? cirqInfo.name : usedGateName
							if (defGates.indexOf(defName) < 0) {
								defGates += "def " + defName + "(";
								var paramList = "";
								if(cirqInfo.params) {
									paramList += ", [";
									cirqInfo.params.map(function(paramName, paramIndex) {
										if(paramIndex > 0) {
											defGates += ", ";
										}
										defGates += "p_" + paramName;
									});
									paramList += "]";
								}
								defGates += "):\n";
								if(basicGate.matrix && basicGate.matrix.length) {
									if(version < 0.7) {
										switch(basicGate.matrix.length) {
											case 2: defGates += "    return cirq.SingleQubitMatrixGate(np.array(" + cirqInfo.array + "))\n"; break;
											case 4: defGates += "    return cirq.TwoQubitMatrixGate(np.array(" + cirqInfo.array + "))\n"; break;
											default: defGates += "    # Export to " + platform + " WARNING: Cannot define " + basicGate.matrix.length + " x " + basicGate.matrix.length + " matrix gate\n";
										}
									} else {
										defGates += "    return cirq.MatrixGate(np.array(" + cirqInfo.array + "))\n";
									}
								}
								defGates += "\n";
							}
						}
					}
				}
			}
		});
		cirq += defGates;

		if(exportTfq){
			cirq += "q = cirq.GridQubit.rect(1, " + circuit.numQubits + ")\n";
		}else{
			cirq += "q = [cirq.NamedQubit('q' + str(i)) for i in range(" + circuit.numQubits + ")]\n";
		}

		cirq += "\n";

		if(version < 0.7) {
			cirq += "circuit = cirq.Circuit.from_ops(\n";
		} else {
			cirq += "circuit = cirq.Circuit(\n";
		}
		indent = "    ";
	}
	
	var numCols = circuit.numCols();
	var gateCounter = 0;
	var multishotKeys = '';
	var tempGateDef = null;
	var noTfqSupport = false;
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gateCounter > 0){
					cirq += ",";
					if(exportTfq && noTfqSupport){
						cirq += indent + "# Export to TFQ WARNING: Gate not yet supported by Tensorflow Quantum";
					}
					cirq += "\n";
				}
				var gateDef = circuit.getGateDef(gate.name);
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var cirqInfo = null;
				var isControlledGate = false;
				var isBasicGate = !!circuit.basicGates[gate.name];
				if(gateDef) {
					if(gateDef.exportInfo && gateDef.exportInfo.cirq) {
							noTfqSupport = gateDef.exportInfo.cirq.notTfqSupported ? true : false;
							if(gateDef.exportInfo.cirq && gateDef.exportInfo.cirq.replacement) {
							if(gateDef.exportInfo.cirq.replacement.params) {
								gateParams = gateDef.exportInfo.cirq.replacement.params;
							}
							isControlledGate = (gateDef.exportInfo.cirq.replacement.type && (gateDef.exportInfo.cirq.replacement.type == "controlled")) ? true : false;							
							noTfqSupport = gateDef.exportInfo.cirq.replacement.notTfqSupported ? true : false;
							gateDef = circuit.getGateDef(gateDef.exportInfo.cirq.replacement.name);
						}
						cirqInfo = (gateDef && gateDef.exportInfo && gateDef.exportInfo.cirq) ? gateDef.exportInfo.cirq : null;
					}
					
					gateCounter++;

					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						cirq += indent + "# Export to " + platform +" WARNING: classical control not implemented yet.\n";
					}

					var tmpParamCount = 0;
					var paramString = "";


					if(gateParams) {
						var paramDef = gateDef.params || [];
						if(gate.name == "yy"){
							paramDef = [];
						}
						var paramCount = paramDef.length;
						if(paramCount) {
							for(var p = 0; p < paramCount; p++) {
								if(tmpParamCount == 0) {
									paramString += "(";
								}
								if(tmpParamCount > 0) {
									paramString += ", ";
								}
								var paramName = paramDef[p];
								// ---
								// prepend 'np' to math constants
								if(gateParams[paramName]) {
									var node = math.parse(gateParams[paramName]);
									if(!node.args){
										for(var param in gate.options.params){
											node = math.parse(gate.options.params[param]);
										}
									}
									paramString += node.toString({ handler: mathToStringHandler });									
								}
								// ---
								if(tmpParamCount == paramCount - 1) {
									if(isBasicGate) {
										paramString += ")";
									} else {
										paramString += ", ";
									}
								}
								tmpParamCount++;
							}
						}
					}

					if(cirqInfo) {
						var addBraces = cirqInfo.name.indexOf("**") >= 0;

						cirq += indent;

						if(addBraces) {
							cirq += "(";
						}

						if(!cirqInfo.array) {
							cirq += "cirq.";
						}

						if(exportTfq && cirqInfo.tfqReplacement && cirqInfo.tfqReplacement.name){
							cirq += "cirq." + cirqInfo.tfqReplacement.name
						}else{
							cirq += cirqInfo.name;
						}

						if(addBraces) {
							cirq += ")";
						}

					} else {
						cirq += indent + gate.name;
					}

					cirq += paramString;					
					

					if(isControlledGate) {
						cirq += ".controlled().on("
					} else {
						if(isBasicGate) {
							cirq += "(";
						}
					}

					var argCount = 0;
					for(var w = 0; w < gate.wires.length; w++) {
						if(argCount > 0) {
							cirq += ", ";
						}
						if(exportAsGateName) {
							cirq += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							cirq += "q[" + gate.wires[w] + "]";
						}
						argCount++;
					}

					if(gate.name == "measure" && gate.options && gate.options.creg) {
						if(argCount > 0) {
							cirq += ", key=";
						}

						cirq += "'" + gate.options.creg.name + gate.options.creg.bit + "'";

						if(column == numCols - 1 && wire == this.numQubits - 1){
							multishotKeys += "'" + gate.options.creg.name + gate.options.creg.bit + "'";
						}else{
							multishotKeys += "'" + gate.options.creg.name + gate.options.creg.bit + "', ";
						}
						argCount++;
					}

					cirq += ")";

				} else {
					cirq += indent + "# Export to " + platform + " WARNING: unknown gate \"" + gate.name + "\".";
				}
			}
		}
	}

	if(exportTfq && noTfqSupport){
		cirq += indent + "# Export to TFQ WARNING: Gate not yet supported by Tensorflow Quantu";
	}

	if(!exportAsGateName) {
		cirq += "\n)\n";
		cirq += "\n";
		if(!exportTfq){
			cirq += "simulator = cirq.Simulator()\n";
			cirq += "result = simulator.run(circuit, repetitions="+ shots +")\n";
			cirq += "result_dict = dict(result.multi_measurement_histogram(keys=[" + multishotKeys + "]))\n";
			cirq += "keys = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1]), result_dict.keys()))\n";
			cirq += "counts = dict(zip(keys,[value for value in result_dict.values()]))\n";
			cirq += "print(counts)";
		}
	} else {
		cirq += "\n    ]\n";
		cirq += "\n";
	}

	if(asJupyter) {
		var notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: cirq,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return cirq;
}

QuantumCircuit.prototype.exportToTFQ = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var asJupyter = options.asJupyter;
	var shots = options.shots;
	
	var self = this;

	if(typeof shots == "undefined") {
		shots = 1024;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var tfq = "";
	var indent = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
			if(cline.length >= 1 && cline[0] != "#") {
				cirq += "# ";
			}
			cirq += cline;
			cirq += "\n";
		});
	}

	var newOptions = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: false,
		shots: shots,
		exportTfq: true
	};						
	tfq += circuit.exportToCirq(newOptions, exportAsGateName);
	tfq += "results_list = tfq.layers.Sample()(circuit, repetitions="+shots+").to_list()[0]\n";
	tfq += "results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1]), results_list))\n";
	tfq += "counts = dict(zip(results,[results.count(i) for i in results]))\n";
	tfq += "print(counts)";

	if(asJupyter) {
		var notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: tfq,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return tfq;
}

QuantumCircuit.prototype.exportToQSharp = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var asJupyter = options.asJupyter;
	var circuitName = options.circuitName;
	var indentDepth = options.indentDepth;

	var self = this;
	
	var mathToStringHandler = function(node, options) {

		// symbols
		if(node.isSymbolNode) {
			var parameterJson = { "pi": "PI()" };
			if(parameterJson[node.name]){
				return parameterJson[node.name];
			}
		}

		// constant
		if(node.isConstantNode) {
			// convert integer to float
			if(Number.isInteger(node.value)) {
				return (node.value).toFixed(1);
			}
		}
	};

	var operationName = circuitName || "Circuit";

	indentDepth = indentDepth || 0;

	function getIndent(depth) {
		var indent = "";
		for(var i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var qsharp = "";
	var indent = getIndent(indentDepth);

	if(!exportAsGateName) {
		if(!asJupyter) {
			// opening namespace
			qsharp += "namespace Quantum {\n";
			indentDepth++;
			indent = getIndent(indentDepth);
		}

		qsharp += indent+"open Microsoft.Quantum.Intrinsic;\n";
		qsharp += indent+"open Microsoft.Quantum.Canon;\n";
		qsharp += indent+"open Microsoft.Quantum.Math;\n";
		qsharp += indent+"open Microsoft.Quantum.Convert;\n";

		qsharp += "\n";

		qsharp += indent+"function SetBitValue(reg: Int, bit: Int, value: Bool): Int {\n";
		qsharp += indent+"    if(value) {\n";
		qsharp += indent+"        return reg ||| (1 <<< bit);\n";
		qsharp += indent+"    } else {\n";
		qsharp += indent+"        return reg &&& ~~~(1 <<< bit);\n";
		qsharp += indent+"    }\n";
		qsharp += indent+"}\n";

		qsharp += indent+"\n";
	}

	if(exportAsGateName) {
		var args = "";
		var argCount = 0;
		for(var i = 0; i < circuit.params.length; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for(var i = 0; i < circuit.numQubits; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits) + ": Qubit";
			argCount++;
		}
		qsharp += indent + "operation " + exportAsGateName + (args ? "(" + args + ")" : "");
		// qsharp += "    return [\n";
		// indent = "        ";
	} else{
		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						var newOptions = {
							comment: "",
							decompose: true,
							versionStr: versionStr,
							asJupyter: false,
							circuitName: null,
							indentDepth: indentDepth
						};
						qsharp += customCircuit.exportToQSharp(newOptions, exportAsGateName);
					}
				}
			});
		}

		qsharp += indent+"operation " + operationName + "()";
	}

	indentDepth++;
	indent = getIndent(indentDepth);

	var cregCount = 0;
	for(cregName in circuit.cregs) {
		cregCount++;
	}

	var cregList = "";
	if(cregCount) {
		qsharp += " : ("
		for(cregName in circuit.cregs) {
			if(cregList) {
				qsharp += ", ";
				cregList += ", ";
			}
			qsharp += "Int";
			cregList += cregName;
		}
		qsharp += ")";
	} else {
		qsharp += " : Unit";
	}
	qsharp += " {\n";
	// ---

	// declare cregs
	if(cregCount) {
		for(cregName in circuit.cregs) {
			qsharp += indent + "mutable " + cregName + " = 0;\n";
		}
	}

	qreg_name = "qubits";

	if(!exportAsGateName){
		qsharp += indent+"using(";
		qsharp += qreg_name + " = Qubit[" + circuit.numQubits + "]";
		qsharp += ") {\n";
		indentDepth++;
		indent = getIndent(indentDepth);
	}

	var defGates = "";
	var usedGates = circuit.usedGates();

	var numCols = circuit.numCols();
	var gateCounter = 0;
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);

				if(!gateDef) {
					gateDef = circuit.customGates[gate.name];
				}

				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var qsharpInfo = null;
				var isControlledGate = false;
				var wireIdx = 0;
				if(gateDef) {
					if(gateDef.exportInfo) {
						if(gateDef.exportInfo.qsharp && gateDef.exportInfo.qsharp.replacement) {
							if(gateDef.exportInfo.qsharp.replacement.params) {
								gateParams = gateDef.exportInfo.qsharp.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.qsharp.replacement.name);
						}						
						qsharpInfo = (gateDef && gateDef.exportInfo && gateDef.exportInfo.qsharp) ? gateDef.exportInfo.qsharp : null;
					}

					if(gateDef.drawingInfo && gateDef.drawingInfo.root && gate.name != "cx" && gate.name != "ccx") {
						isControlledGate = true;
					}


					var tmpParamCount = 0;
					var paramString = "";
					if(gateParams) {
						var paramDef = gateDef.params || [];
						var paramCount = paramDef.length;
						if(paramCount) {		
							for(var p = 0; p < paramCount; p++) {
								// if(tmpParamCount == 0) {
								// 	paramString += "(";
								// }
								if(tmpParamCount > 0) {
									paramString += ", ";
								}
								var paramName = paramDef[p];	

								// ---
								// prepend 'np' to math constants
								if(gateParams[paramName]) {
									var node = math.parse(gateParams[paramName]);
									paramString += node.toString({ handler: mathToStringHandler });
								}
								// ---

								// if(tmpParamCount == paramCount - 1) {
								// 	paramString += ")";
								// }
								tmpParamCount++;
							}
						}
					}
					// ---
					if(gate.name == "measure") {
						if(gate.options && gate.options.creg) {
							qsharp += indent + "set " + gate.options.creg.name + " = SetBitValue(" + gate.options.creg.name + ", " + gate.options.creg.bit + ", ResultAsBool(M(";
							if(exportAsGateName) {
								qsharp += qubitLetter(gate.wires[0], circuit.numQubits) + ")));\n";
							}else {
								qsharp += qreg_name + "[" + gate.wires[0] + "])));\n";
							}
						} else {
							qsharp += indent + "// Export to qsharp WARNING: missing destination register\n";
						}
					} else {
						qsharp += indent;

						if(gate.options && gate.options.condition && gate.options.condition.creg) {
							qsharp += "if(" + gate.options.condition.creg + " == " + gate.options.condition.value + ") {\n";
							indentDepth++;
							indent = getIndent(indentDepth);
							qsharp += indent;
						}

						if(qsharpInfo) {
							qsharp += qsharpInfo.name + "(";
						} else {
							qsharp += gate.name + "(";
						}

						if(isControlledGate) {
							if(exportAsGateName) {
								qsharp += "[" + qubitLetter(gate.wires[0], circuit.numQubits) + "], (";
							} else {
								qsharp += "[" + qreg_name + "[" + gate.wires[0] + "]], (";
							}
							wireIdx = 1;
						}else{
							wireIdx = 0;
						}

						if(paramString){
							qsharp += paramString + ", ";
						} 
						// else {
						// 	qsharp += paramString + "(";
						// }
						var argCount = 0;
						for(var w = wireIdx; w < gate.wires.length; w++) {
							if(argCount > 0) {
								qsharp += ", ";
							}
							if(exportAsGateName) {
								qsharp += qubitLetter(gate.wires[w], circuit.numQubits);
							}else {
								qsharp += qreg_name + "[" + gate.wires[w] + "]";
							}

							argCount++;
						}

						if(isControlledGate){
							qsharp += ")";
						}

						qsharp += ");\n";

						if(gate.options && gate.options.condition && gate.options.condition.creg) {
							// end if
							indentDepth--;
							indent = getIndent(indentDepth);
							qsharp += indent + "}\n";
						}
					}
				}
			}
		}
	}
	if(!exportAsGateName){
		qsharp += indent + "ResetAll(" + qreg_name + ");\n";

		indentDepth--;
		indent = getIndent(indentDepth);

		qsharp += indent + "}\n";
	}

	if(cregCount) {
		qsharp += indent + "return (" + cregList + ");\n";
	}

	indentDepth--;
	indent = getIndent(indentDepth);
	qsharp += indent + "}\n";

	if(!exportAsGateName) {
		if(!asJupyter) {
			// closing namespace
			qsharp += "}\n";

		}
	} else {
		qsharp += "\n";
	}

	if(asJupyter) {
		var notebook = {
			"metadata": {
				"kernelspec": {
					"display_name": "Q#",
					"language": "qsharp",
					"name": "iqsharp"
				},
				"language_info": {
					"name": ""
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: qsharp,
					metadata: {

					},
					outputs: [],
					execution_count: null
				},
				{
					cell_type: "code",
					source: "%simulate " + operationName,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return qsharp;
};

QuantumCircuit.prototype.exportToBraket = function(options, exportAsGateName) {
	options = options || {};

	var comment = options.comment;
	var decompose = options.decompose;
	var versionStr = options.versionStr;
	var asJupyter = options.asJupyter;
	var shots = options.shots;
	var hybrid = options.hybrid;
	var indentDepth = options.indentDepth;

	var self = this;


	shots = shots || 1024;

	var version = parseFloat(versionStr || "1.0");
	if(isNaN(version)) {
		version = 1.0;
	}

	if(typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	// decompose ?
	var circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			if(self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	var adjustIdentation = function(addStr, ident) {
		var str = "";

		// add user defined cost function with proper identation
		var cfLines = addStr.split("\n");
		var minIdent = -1;
		cfLines.map(function(cfLine) {
			var tmpIdent = cfLine.search(/\S/);
			if(tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if(minIdent < 0) {
			minIdent = 0;
		}

		var addIdent = "";
		if(minIdent < ident.length) {
			for(var tmp = 0; tmp < (ident.length - minIdent); tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function(cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	var getIndent = function(depth) {
		var indent = "";
		for(var i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	}

	indentDepth = indentDepth || 0;

	var braket = "";
	var indent = getIndent(indentDepth);

	var usedGates = circuit.usedGates();
	var isSubModule = false;
	usedGates.map(function(usedGateName){
		if(!circuit.basicGates[usedGateName]){
			isSubModule = true;
		}
	});

	var args = "";
	var argCount = 0;
	if(exportAsGateName) {
		for(var i = 0; i < circuit.numQubits; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits);
			argCount++;
		}
		for(var i = 0; i < circuit.params.length; i++) {
			if(argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
	} else {
		braket += indent + "import numpy as np\n";
		braket += indent + "from braket.devices import LocalSimulator\n";
		braket += indent + "from braket.circuits import Circuit\n";
		braket += indent + "from collections import Counter\n";

		if(hybrid) {
			braket += indent + "from scipy.optimize import minimize\n";
		}

		braket += "\n";

		if(shots) {
			braket += indent + "shots = " + shots + "\n";
			braket += "\n";
		}

		var globalParams = this.options && this.options.params ? this.options.params : {};
		if(this.params.length) {
			for(var i = 0; i < this.params.length; i++) {
				var globalParamName = this.params[i];

				var node = math.parse(globalParams[globalParamName]);
				var globalParamValue = node.toString({ handler: mathToStringHandler });

				braket += globalParamName + " = " + globalParamValue + "\n";
			}
			braket += "\n";
		}

		if(hybrid) {
			braket += indent + "tolerance = " + (this.options && this.options.hybridOptions && this.options.hybridOptions.tolerance ? this.options.hybridOptions.tolerance || "0.001" : "0.001") + "\n";
			braket += "\n";
		}
	}

	var unsupportedBraketInfo = null;
	var gateUnitary = null;
	var submoduleCount = 0;
	usedGates.map(function(usedGateName) {
		var basicGate = circuit.basicGates[usedGateName];
		if(basicGate) {
			if(!decompose){
				if(circuit.basicGates[usedGateName].exportInfo.braket && circuit.basicGates[usedGateName].exportInfo.braket.array) {
					unsupportedBraketInfo = circuit.basicGates[usedGateName].exportInfo.braket;
	
					if(unsupportedBraketInfo.name == "unitary"){
						gateUnitary = usedGateName + "_unitary";
						braket += indent + "def " + gateUnitary +"(";
					}
					
					if(unsupportedBraketInfo.params && unsupportedBraketInfo.params.length){
						var argCount = 0;
						unsupportedBraketInfo.params.map(function(paramName){
							if(argCount > 0) {
								braket += ", ";
							}
							braket += indent + "p_" + paramName;
							argCount++;
						});
					}
			
					braket += "):\n";
					braket += getIndent(indentDepth + 1) + "return np.array(" +  unsupportedBraketInfo.array + ");\n\n";
				}
			}
		} else {
			var customGate = self.customGates[usedGateName];
			if(customGate) {
				var customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				braket += customCircuit.exportBraket("", true, usedGateName, versionStr, false, null, false, false, indentDepth);
				submoduleCount++;
			}
		}
	});	
					
	if(exportAsGateName){
		braket += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indentDepth++;
		indent = getIndent(indentDepth);
	} else {
		if(hybrid) {
			braket += "def objective_function(params):\n"
			indentDepth++;
			indent = getIndent(indentDepth);
		}
	}

	braket += indent + "circuit = Circuit()\n";

	if(!exportAsGateName) {
		if(submoduleCount) {
			braket += "\n";
			usedGates.map(function(usedGateName) {
				if(!circuit.basicGates[usedGateName] && circuit.customGates[usedGateName]) {
					braket += indent + "circuit.register_subroutine(" + usedGateName + ")\n";
				}
			});
			braket += "\n";
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var paramDef = gateDef.params || [];
				var braketInfo = null;

				var gateName = gate.name;
				var paramString = "";
				var isUnitary = false;

				if(gateDef) {
					if(gateDef.exportInfo && gateDef.exportInfo.braket) {
						braketInfo = gateDef.exportInfo.braket;

						if(braketInfo.params) {
							if(Array.isArray(braketInfo.params)) {
								paramDef = braketInfo.params;
							} else {
								gateParams = braketInfo.params;
								paramDef = Object.keys(gateParams);
							}
						}

						if(braketInfo.name == "unitary") {
							isUnitary = true;
						} else {
							gateName = braketInfo.name;
						}
					}
				}

				if(!braketInfo && !circuit.customGates[gate.name]) {
					braket += indent + "# Unsupported gate \"" + gate.name + "\".\n";
				} else {
					var tmpParamCount = 0;
					if(gateParams) {
						var paramCount = paramDef.length;
						if(paramCount) {		
							for(var p = 0; p < paramCount; p++) {
								if(tmpParamCount > 0) {
									paramString += ", ";
								}
								var paramName = paramDef[p];	

								// ---
								// prepend 'np' to math constants
								if(typeof gateParams[paramName] != "undefined") {
									var node = math.parse(gateParams[paramName]);
									paramString += node.toString({ handler: mathToStringHandler });
								}
								tmpParamCount++;
							}
						}
					}

					braket += indent + "circuit.";

					if(isUnitary) {
						braket += "unitary(matrix=" + gateName + "_unitary(" + paramString + "), targets=[";
					} else {
						braket += gateName + "(";
					}
					
					var argCount = 0;
					for(w = 0; w < gate.wires.length; w++) {
						if(argCount > 0) {
							braket += ", ";
						}
						if(exportAsGateName) {
							braket += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							braket += gate.wires[w];
						}
						argCount++;
					}

					if(isUnitary) {
						braket += "]";
					} else {
						if(paramString) {
							braket += ", ";
							braket += paramString;
						}
					}
					braket += ")";
					braket += "\n";
				}
			}
		}
	}
	
	if(exportAsGateName){
		braket += indent + "return circuit";
	}

	braket += "\n\n";
	
	if(!exportAsGateName) {
		braket += indent + "local_sim = LocalSimulator()\n";
		braket += indent + "result = local_sim.run(circuit, shots=shots).result()\n";
		braket += indent + "counts = Counter({ \"\".join(reversed(k)): v for k, v in result.measurement_counts.items() })\n";
		braket += "\n";

		if(hybrid) {
			braket += indent + "# CALCULATE COST HERE\n";

			var costFunction = this.options && this.options.hybridOptions && this.options.hybridOptions.costFunction ? this.options.hybridOptions.costFunction.python || "" : "";
			if(!costFunction.trim()) {
				costFunction = "cost = 0";
			}

			braket += adjustIdentation(costFunction, indent);

			braket += "\n"
			braket += indent + "return cost\n";


			indentDepth--;
			indent = getIndent(indentDepth);
			if(hybrid) {
				var globalParamList = "";
				this.params.map(function(globalParamName, globalParamIndex) {
					if(globalParamIndex > 0) {
						globalParamList += ", ";
					}
					globalParamList += globalParamName;
				});

				braket += "\n";
				braket += "params = np.array([" + globalParamList + "])\n";
				braket += "\n";
				braket += "minimum = minimize(objective_function, params, method=\"" + (this.options && this.options.hybridOptions && this.options.hybridOptions.optimizer ? this.options.hybridOptions.optimizer : "Powell") + "\", tol=tolerance)\n";
				braket += "print(\"cost:\", minimum.fun, \"params:\", minimum.x)\n";
			}

		} else {
			braket += indent + "print(counts)";
		}
	}

	if(asJupyter) {
		var notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3"
				}
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: braket,
					metadata: {

					},
					outputs: [],
					execution_count: null
				}
			]
		};
		return JSON.stringify(notebook);
	}

	return braket;
};

QuantumCircuit.prototype.exportToQobj = function(options, circuitReplacement) {
	options = options || {};

	var circuitName = options.circuitName;
	var experimentName = options.experimentName;
	var numShots = options.numShots;

	var self = this;
	
	var globalParams = this.options && this.options.params ? this.options.params : {};
	var globalParams = JSON.parse(JSON.stringify(globalParams));
	for(var globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	circuitName = circuitName || "";
	experimentName = experimentName || "";
	numShots = numShots || 1;

	// ---
	// decompose circuit
	var circuit = new QuantumCircuit();
	circuit.load(this.save(true));
	// ---

	var id = this.randomString();
	var parentQobj = {qobj_id: "qobj_" + id, type: "QASM", schema_version: "1.0", experiments: [], header: {description: circuitName}, config:{shots: numShots, memory_slots: 0}};
	var qobj = {header: {memory_slots: 0, n_qubits: 0, qreg_sizes: [], qubit_labels: [], creg_sizes: [], clbit_labels: [], name: "circuit0"}, config: {n_qubits: 0, memory_slots: 0}, instructions: []};
	var cregNames = Object.keys(circuit.cregs);

	var intToDouble = function(node, options) {
		if(Number.isInteger(node)) {
			return node.toFixed(1);
		}
		return node;
	};

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var nodeName = node.name;
			if(options.replaceVars && typeof options.replaceVars[nodeName] != "undefined") {
				var nodeName = options.replaceVars[nodeName];
				if(self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if(self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};

	if(!circuitReplacement){
		if(experimentName){
			qobj.header.description = experimentName;
		}
		for(cregName in circuit.cregs){
			var cregLength = circuit.cregs[cregName].length;
			parentQobj.config.memory_slots += cregLength;
			qobj.header.creg_sizes.push([cregName, cregLength]);
			for(var i = 0; i < cregLength; i++){
				qobj.header.clbit_labels.push([cregName, i]);
			}
		}
		qobj.header.memory_slots = parentQobj.config.memory_slots;
		qobj.header.n_qubits = circuit.numQubits;
		qobj.config.memory_slots = parentQobj.config.memory_slots;
		qobj.config.n_qubits = circuit.numQubits;
		qobj.header.qreg_sizes.push(["q", circuit.numQubits]);
	}

	var registerSlots = parentQobj.config.memory_slots;

	var usedGates = circuit.usedGates();
	usedGates.map(function(usedGateName){
		var basicGate = circuit.basicGates[usedGateName];
		if(!basicGate){
			var customGate = self.customGates[usedGateName];
			if(customGate){
				customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				var newOptions = {
					circuitName: circuitName,
					experimentName: experimentName,
					numShots: numShots
				};
				parentQobj += customCircuit.exportToQobj(newOptions, false);
			}
		}
	});

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++){
		for(var wire = 0; wire < circuit.numQubits; wire++){
			var gate = circuit.getGateAt(column, wire);
			var qobjInstruction = {name : "", qubits: []};
			var qobjReplacement = null;
			var qobjEquivalent = null;
			if(column == 0){
				qobj.header.qubit_labels.push(["q", wire]);
			}

			if(gate && gate.connector == 0){
				var gateDef = circuit.getGateDef(gate.name);
				if(gateDef){
					if(gateDef.exportInfo){
						if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.replacement){
							qobjReplacement = gateDef.exportInfo.qasm.replacement;
							qobjReplacement.map(function(replacement){
								var replacementCircuit = new QuantumCircuit();
								replacementCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								if(gate.options && gate.options.params){
									var params = Object.keys(gate.options.params);
									var replacementParams = Object.keys(replacement.params);
									params.map(function(param){
										if(replacementParams.indexOf(param) > -1){
											replacement.params[param] = gate.options.params[param];
										}
									});
								}
								var replacementCondition = gate.options && gate.options.condition ? gate.options.condition : {};
								replacementCircuit.addGate(replacement.name, column, gate.wires, { params: replacement.params, condition: replacementCondition });
								var newOptions = {
									circuitName: "",
									experimentName: "",
									numShots: ""
								};
								qobj.instructions = qobj.instructions.concat(replacementCircuit.exportToQobj(newOptions, true));
							});
						}else if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.equivalent){
							qobjEquivalent = gateDef.exportInfo.qasm.equivalent;
							qobjEquivalent.map(function(equivalent){
								var equivalentCircuit = new QuantumCircuit();
								equivalentCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								var gateWires = equivalent.wires.length > 1 ? gate.wires : gate.wires[equivalent.wires[0]];
								var eqParams = {};
								if(equivalent.params) {
									// ---
									// equivalent gate params can contain variable from gate params
									// ---

									// Evaluate gate's params
									var gateParams = {};
									if(gate.options && gate.options.params) {
										for(var gateParamName in gate.options.params) {
											var node = math.parse(gate.options.params[gateParamName]);
											var valueString = node.toString({ handler: mathToStringHandler });
											gateParams[gateParamName] = valueString;
										}
									}
									
									for(var eqParamName in equivalent.params) {
										var node = math.parse(equivalent.params[eqParamName]);
										var valueString = node.toString({ handler: mathToStringHandler, replaceVars: gateParams });
										eqParams[eqParamName] = valueString;
									}
								}

								var eqCondition = gate.options && gate.options.condition ? gate.options.condition : {};

								equivalentCircuit.addGate(equivalent.name, column, gateWires, { params: eqParams, condition: eqCondition });
								var newOptions = {
									circuitName: "",
									experimentName: "",
									numShots: ""
								};
								qobj.instructions = qobj.instructions.concat(equivalentCircuit.exportToQobj(newOptions, true));
							});
						}
					}
				}

				if(!qobjReplacement && !qobjEquivalent){
					var gateName = gate.name;
					var gateParams = gate.options && gate.options.params ? gate.options.params : {};
					if(this.basicGates[gateName]){
						switch(gateName) {
							case "id": {
								gateName = "iden";
							}; break;
		
							// case "r2": {
							// 	gateName = "u1";
							// 	gateParams = { lambda: "pi/2" };
							// }; break;
		
							// case "r4": {
							// 	gateName = "u1";
							// 	gateParams = { lambda: "pi/4" };
							// }; break;
		
							// case "r8": {
							// 	gateName = "u1";
							// 	gateParams = { lambda: "pi/8" };
							// }; break;
		
							// case "cr2": {
							// 	gateName = "cu1";
							// 	gateParams = { lambda: "pi/2" };
							// }; break;
		
							// case "cr4": {
							// 	gateName = "cu1";
							// 	gateParams = { lambda: "pi/4" };
							// }; break;
		
							// case "cr8": {
							// 	gateName = "cu1";
							// 	gateParams = { lambda: "pi/8" };
							// }; break;
						}
					
						qobjInstruction.name = gateName;				
						qobjInstruction.qubits = gate.wires;

						if(gate.options && gate.options.condition && gate.options.condition.creg){
							var booleanInstruction = {name: "", register: registerSlots, relation: "==", mask: "", val: ""};
							var cregSize = circuit.cregs[gate.options.condition.creg].length;
							var numberOfBitsShift = 0;
							var maskValue = 0;
							var mask = "";
							var val = "";
							
							var indexOfRegister = cregNames.indexOf(gate.options.condition.creg);
							for(var i = 0; i < indexOfRegister; i++){
								numberOfBitsShift += circuit.cregs[cregNames[i]].length;
							}

							var value = (gate.options.condition.value % Math.pow(2, cregSize))*Math.pow(2, numberOfBitsShift);
							val = "0x" + value.toString(16).toUpperCase();

							if(numberOfBitsShift > 0){
								var exponent = Math.pow(2, numberOfBitsShift);
								for(var bit = 0; bit < cregSize; bit++){								
									maskValue += exponent;
									exponent *= 2;
								}
								mask = "0x" + maskValue.toString(16).toUpperCase();
							}else {
								mask = "0x" + (Math.pow(2, cregSize) - 1).toString(16).toUpperCase();
							}
							booleanInstruction.name = "bfunc";
							qobjInstruction.conditional = registerSlots;
							booleanInstruction.mask = mask;
							booleanInstruction.val = val;
							qobj.instructions.push(booleanInstruction);
							registerSlots += 1;
						}

						if(gateName == "measure" && gate.options && gate.options.creg){
							qobjInstruction.memory = [];
							qobjInstruction.register = [];
							var prevRegisterLength = 0;
							var indexOfRegister = cregNames.indexOf(gate.options.creg.name);
							for(var i = 0; i < indexOfRegister; i++){
								prevRegisterLength += circuit.cregs[cregNames[i]].length;
							}
							var cregBit = prevRegisterLength + gate.options.creg.bit;
							qobjInstruction.memory.push(cregBit);
							qobjInstruction.register.push(cregBit);
						}

						if(gateParams){
							gateDef = this.basicGates[gateName];
							if(!gateDef) {
								gateDef = this.customGates[gateName];
							}
							if(gateDef){
								paramDef = gateDef.params || [];
								paramCount = paramDef.length;
								if(paramCount){
									qobjInstruction.params = [];
									for(var p = 0; p < paramCount; p++) {
										paramName = paramDef[p];
										if(gateParams[paramName] || gateParams[paramName].toString()){
											var node = math.evaluate(gateParams[paramName], globalParams);
											qobjInstruction.params.push(node);
										}
									}
								}
							}
						}
						
						qobj.instructions.push(qobjInstruction);
					}
				}
			}
		}
	}
	
	if(circuitReplacement){
		return qobj.instructions;
	}

	if(qobj.instructions.length){
		parentQobj.experiments.push(qobj);
	}

	return parentQobj;
};


QuantumCircuit.prototype.clearPartitions = function() {
	this.partitionMap = [];
	this.partitionCount = 0;
	this.partitionInfo = {};

	var numCols = this.numCols();
	for(var wire = 0; wire < this.numQubits; wire++) {
		this.partitionMap.push([]);
		for(var column = 0; column < numCols; column++) {
			this.partitionMap[wire].push(-1);
		}
	}
};

QuantumCircuit.prototype.createPartitions = function() {
	this.clearPartitions();

	var wirePartitions = [];
	for(var i = 0; i < this.numQubits; i++) {
		wirePartitions.push(-1);
	}

	var partitionCounter = 0;
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.wires) {
				var prevPartitions = [];
				for(var w = 0; w < gate.wires.length; w++) {
					var wr = gate.wires[w];
					var prevPartition = wirePartitions[wr];
					if(prevPartitions.indexOf(prevPartition) < 0) {
						prevPartitions.push(prevPartition);
					}
				}
				var partition = -1;
				if(prevPartitions.length != 1 || prevPartitions[0] == -1) {
					partition = partitionCounter++;
				} else {
					partition = prevPartitions[0];
				}

				for(var w = 0; w < gate.wires.length; w++) {
					var wr = gate.wires[w];

					oldPartition = wirePartitions[wr];
					if(oldPartition == -1) {
						wirePartitions[wr] = partition;
					} else {
						for(var i = 0; i < this.numQubits; i++) {
							if(wirePartitions[i] == oldPartition) {
								wirePartitions[i] = partition;
							}
						}
					}
				}
			}
		}

		for(var wire = 0; wire < this.numQubits; wire++) {
			this.partitionMap[wire][column] = wirePartitions[wire];
		}
	}

	this.partitionCount = partitionCounter;

	for(var partition = 0; partition < partitionCounter; partition++) {
		this.partitionInfo[partition] = this.partitionBounds(partition);
	}
};

QuantumCircuit.prototype.printPartitions = function() {
	var numCols = this.numCols();
	for(var wire = 0; wire < this.numQubits; wire++) {
		var row = "";
		for(var column = 0; column < numCols; column++) {
			var part = this.partitionMap[wire][column];
			if(part == -1) part = " ";
			if(this.getGateAt(column, wire)) {
				part = part + "*";
			} else {
				part = part + " ";
			}
			while(part.length < 4) {
				part = " " + part;
			}
			row += part;
		}
		var w = wire + "";
		while(w.length < 2) {
			w = "0" + w;
		}
		row = "q" + w + row;
		console.log(row);
	}
};


QuantumCircuit.prototype.partitionBounds = function(partitionIndex) {
	var bounds = {
		wire: {
			top: -1,
			bottom: -1
		},
		column: {
			left: -1,
			right: -1
		},
		wireMap: {

		},
		parents: {

		}
	};

	var found = false;
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var partition = this.partitionMap[wire][column];
			if(partition == partitionIndex) {
				found = true;

				if(bounds.wire.top < 0) {
					bounds.wire.top = wire;
				}
				if(bounds.wire.bottom < wire) {
					bounds.wire.bottom = wire;
				}

				if(bounds.column.left < 0) {
					bounds.column.left = column;
				}
				if(bounds.column.right < column) {
					bounds.column.right = column;
				}
			}
		}
	}

	if(!found) {
		return null;
	}

	var partitionWire = 0;
	for(var wire = bounds.wire.top; wire <= bounds.wire.bottom; wire++) {
		var partition = this.partitionMap[wire][bounds.column.left];
		if(partition == partitionIndex) {
			bounds.wireMap[wire] = partitionWire;

			partitionWire++;
		}
	}
	bounds.numQubits = partitionWire;

	if(bounds.column.left > 0) {
		for(var wire in bounds.wireMap) {
			var parentPartition = this.partitionMap[wire][bounds.column.left - 1];
			if(parentPartition >= 0) {
				if(!bounds.parents[parentPartition]) {
					bounds.parents[parentPartition] = {};
					bounds.parents[parentPartition].links = [];
				}
				var parentBounds = this.partitionInfo[parentPartition];
				for(var pwire in parentBounds.wireMap) {
					if(pwire == wire) {
						bounds.parents[parentPartition].links.push(bounds.wireMap[wire]);
					}
				}
			}
		}
	}

	return bounds;
};


QuantumCircuit.prototype.partitionCircuit = function(partitionIndex) {
	var bounds = this.partitionInfo[partitionIndex];
	if(!bounds) {
		return null;
	}

	var combineList = [];
	var usedWires = [];
	for(var parentPartition in bounds.parents) {
		var combineItem = {};

		combineItem.circuit = this.partitionCache[parentPartition];
		combineItem.wires = [];
		combineItem.wires = bounds.parents[parentPartition].links;

		usedWires = usedWires.concat(combineItem.wires);

		combineList.push(combineItem);
	}

	var circuit = new QuantumCircuit();

	// combine state from parent partitions
	if(combineList.length > 0) {
		if(bounds.numQubits > usedWires.length) {
			var combineItem = {};
			combineItem.circuit = new QuantumCircuit(bounds.numQubits - usedWires.length);
			combineItem.wires = [];
			for(var i = 0; i < bounds.numQubits; i++) {
				if(usedWires.indexOf(i) < 0) {
					combineItem.wires.push(i);
				}
			}
			combineList.push(combineItem);
		}
		circuit.setCombinedState(combineList);
	}

	// add gates to the circuit
	for(var column = bounds.column.left; column <= bounds.column.right; column++) {
		for(var wire = bounds.wire.top; wire <= bounds.wire.bottom; wire++) {
			var partition = this.partitionMap[wire][column];
			if(partition == partitionIndex) {
				var gate = this.getGateAt(column, wire);
				if(gate && gate.connector == 0) {
					var gateWires = [];
					for(var w = 0; w < gate.wires.length; w++) {
						var wr = gate.wires[w];
						gateWires.push(bounds.wireMap[wr]);
					}
					circuit.addGate(gate.name, column - bounds.column.left, gateWires, gate.options);
				}
			}
		}
	}

	return circuit;
};

//
// Options:
//   {
//     strictMode: bool,
//     partitioning: bool,
//     continue: bool,
//     initialState: Array
//     onGate: function(column, wire, gateCounter) { ... },
//     onColumn: function(column) { ... }
//   }
//
QuantumCircuit.prototype.run = function(initialValues, options) {
	this.lastRunArguments = { initialValues: initialValues, options: options };

	options = options || {};

	if(typeof options.strictMode != "undefined") {
		this.measureResetsQubit = !!options.strictMode;
	}

	if(!options.continue) {
		this.initState();
		this.stats.duration = 0;
	}

	if(options.initialState) {
		if(Array.isArray(options.initialState)) {
			this.state = {};
			for(var valIndex = 0; valIndex < options.initialState.length; valIndex++) {
				var val = options.initialState[valIndex];

				if(Array.isArray(val) && val.length == 2) {
					val = math.complex(val[0], val[1]);
				}

				if(typeof val == "string") {
					val = this.evalMathString(val);
				}
				if(typeof val == "number") {
					val = math.complex(val, 0);
				}
				this.state[valIndex + ""] = val;
			}
		} else {
			this.state = options.initialState;
		}

		this.stateBits = 0;
		for(var aindex in this.state) {
			this.stateBits |= parseInt(aindex);
		}
	}

	this.stats.start = new Date();

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	if(initialValues) {
		decomposed.insertColumn(0);
		for(var wire = 0; wire < decomposed.numQubits; wire++) {
			if(initialValues[wire]) {
				decomposed.addGate("x", 0, wire, {});
			}
		}
	}

	var partitioning = options.partitioning;

	if(partitioning) {
		decomposed.createPartitions();
//		decomposed.printPartitions();
	}

	var numCols = decomposed.numCols();
	var gateCounter = 0;
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < decomposed.numQubits; wire++) {
			var gate = decomposed.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				gateCounter++;

				var executeGate = true;
				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					var cregValue = this.getCregValue(gate.options.condition.creg);
					executeGate = cregValue === gate.options.condition.value;
				}

				if(executeGate) {

					if(partitioning) {
						var partition = decomposed.partitionMap[wire][column];
						if(!decomposed.partitionCache[partition]) {
							decomposed.partitionCache[partition] = decomposed.partitionCircuit(partition);
						}

						var pcirc = decomposed.partitionCache[partition];
						var bounds = decomposed.partitionInfo[partition];

						var pcolumn = column - bounds.column.left;

						var pgate = pcirc.getGateAt(pcolumn, bounds.wireMap[wire]);

						pcirc.cregs = JSON.parse(JSON.stringify(this.cregs));
						pcirc.applyGate(pgate.name, pcolumn, pgate.wires, pgate.options);
						this.cregs = JSON.parse(JSON.stringify(pcirc.cregs));
					} else {
						this.applyGate(gate.name, column, gate.wires, gate.options);
					}
				}

				// callback after gate is finished
				if(options && options.onGate) {
					options.onGate(column, wire, gateCounter);
				}
			}
		}
		// callback after column is finished
		if(options && options.onColumn) {
			options.onColumn(column);
		}
	}

	if(partitioning) {
		var lastPartitions = [];
		for(var wire = 0; wire < decomposed.numQubits; wire++) {
			var partition = decomposed.partitionMap[wire][numCols - 1];
			if(partition >= 0 && lastPartitions.indexOf(partition) < 0) {
				lastPartitions.push(partition);
			}
		}
		if(lastPartitions.length) {
			if(lastPartitions.length == 1) {
				this.state = decomposed.partitionCache[lastPartitions[0]].state;
				this.stateBits = decomposed.partitionCache[lastPartitions[0]].stateBits;
			} else {
				var startTime = this.stats.start;
				var combineList = [];
				for(var i = 0; i < lastPartitions.length; i++) {
					var lastPartition = lastPartitions[i];

					var combineItem = {};

					combineItem.circuit = decomposed.partitionCache[lastPartition];
					combineItem.wires = [];

					var lastBounds = decomposed.partitionInfo[lastPartition];
					for(var wire in lastBounds.wireMap) {
						combineItem.wires.push(parseInt(wire));
					}

					combineList.push(combineItem);
				}
				this.setCombinedState(combineList);
				this.stats.start = startTime;
			}
		}
	}

	this.stats.end = new Date();
	this.stats.duration += this.stats.end - this.stats.start;
};

QuantumCircuit.prototype.continue = function() {
	this.run(null, {
		continue: true
	});
};

QuantumCircuit.prototype.stateAsArray = function(onlyPossible, skipItems, blockSize, reverseBits) {
	var state = [];

	var numAmplitudes = this.numAmplitudes();

	skipItems = skipItems || 0;
	blockSize = blockSize || (onlyPossible ? this.numAmplitudes(onlyPossible) : numAmplitudes);

	var count = 0;
	for(var i = 0; i < numAmplitudes; i++) {
		var ampIndex = i;
		if(reverseBits) {
			ampIndex = reverseBitwise(i, this.numQubits);
		}

		var amplitude = math.round(this.state[ampIndex] || math.complex(0, 0), 14);

		if(!onlyPossible || (amplitude.re || amplitude.im)) {
			if(count >= skipItems) {
				var indexBinStr = i.toString(2);
				while(indexBinStr.length < this.numQubits) {
					indexBinStr = "0" + indexBinStr;
				}

				var amplitudeStr = this.formatComplex(amplitude, { fixedWidth: true, decimalPlaces: 8, iotaChar: "i" });
				var magnitude = math.pow(math.abs(amplitude), 2);
				var chance = magnitude * 100;
				var chanceStr = chance.toFixed(5);
				var phase = math.arg(amplitude);
				var phaseStr = phase.toFixed(5);

				state.push({
					index: i,
					indexBinStr: indexBinStr,
					amplitude: amplitude,
					amplitudeStr: amplitudeStr,
					magnitude: magnitude,
					chance: chance,
					chanceStr: chanceStr,
					phase: phase,
					phaseStr: phaseStr
				});
			}

			count++;

			if(state.length == blockSize) {
				return state;
			}
		}
	}

	return state;
};

QuantumCircuit.prototype.stateAsSimpleArray = function(reverseBits) {

	var numAmplitudes = this.numAmplitudes();
	if(!this.state) {
		return [];
	}

	var state = [];
	for(var i = 0; i < numAmplitudes; i++) {
		var ampIndex = i;
		if(reverseBits) {
			ampIndex = reverseBitwise(i, this.numQubits);
		}

		state.push(math.round(this.state[ampIndex] || math.complex(0, 0), 14));
	}
	return state;
};


QuantumCircuit.prototype.stateAsString = function(onlyPossible) {

	var numAmplitudes = this.numAmplitudes();
	if(!this.state) {
		return "Error: circuit is not initialized. Please call initState() or run() method.";
	}

	var s = "";
	var count = 0;
	for(var i = 0; i < numAmplitudes; i++) {
		var state = math.round(this.state[i] || math.complex(0, 0), 14);
		if(!onlyPossible || (state.re || state.im)) {
			var m = math.pow(math.abs(state), 2) * 100;

			// binary string
			var bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}

			// right aligned percent
			var perc = m.toFixed(5);
			while(perc.length < 9) {
				perc = " " + perc;
			}

			s += this.formatComplex(state, { fixedWidth: true, decimalPlaces: 8, iotaChar: "i" }) + "|" + bin + ">\t" + perc + "%\n";
		}
	}
	return s;
};

QuantumCircuit.prototype.print = function(onlyPossible) {
	console.log(this.stateAsString(onlyPossible));
};

QuantumCircuit.prototype.gotClassicalControl = function() {
	for(var column = 0; column < this.numCols(); column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					return true;
				}
			}
		}
	}
	return false;
};

QuantumCircuit.prototype.gotMeasurement = function() {
	for(var column = 0; column < this.numCols(); column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.name == "measure") {
					return true;
				}
			}
		}
	}
	return false;
};


QuantumCircuit.prototype.gotMidCircuitMeasurement = function() {
	var gotMeasurement = false;
	for(var column = 0; column < this.numCols(); column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.name == "measure") {
					gotMeasurement = true;
				} else {
					if(gotMeasurement) {
						return true;
					}
				}
			}
		}
	}
	return false;
};


QuantumCircuit.prototype.cregCount = function() {
	var cregCount = 0;
	for(var cregName in this.cregs) {
		cregCount++;
	}
	return cregCount;
};

QuantumCircuit.prototype.getCregs = function() {
	var res = {};
	for(var creg in this.cregs) {
		res[creg] = this.getCregValue(creg);
	}
	return res;
};

QuantumCircuit.prototype.cregsAsString = function() {
	var s = "reg\tbin\tdec\n";
	for(var creg in this.cregs) {
		var value = this.getCregValue(creg);

		// binary string
		var bin = value.toString(2);
		var len = this.cregs[creg] ? this.cregs[creg].length || 1 : 1;
		while(bin.length < len) {
			bin = "0" + bin;
		}

		s += creg + "\t" + bin + "\t" + value + "\n";
	}
	return s;
};


QuantumCircuit.prototype.createCreg = function(creg, len) {
	this.cregs[creg] = [];

	// extend register
	while(this.cregs[creg].length < (len || 1)) {
		this.cregs[creg].push(0);
	}
};

QuantumCircuit.prototype.removeCreg = function(creg) {
	// remove reference to creg
	var numCols = this.numCols();
	var removeGates = [];
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate && gate.options) {
				// gate writing to creg
				if(gate.options.creg && gate.options.creg.name && gate.options.creg.name == creg) {
					if(removeGates.indexOf(gate.id) < 0) {
						removeGates.push(gate.id);
					}
				}

				// gate controlled by creg
				if(gate.options.condition && gate.options.condition.creg && gate.options.condition.creg == creg) {
					delete gate.options.condition;
				}
			}
		}
	}

	// delete register
	delete this.cregs[creg];

	for(var i = 0; i < removeGates.length; i++) {
		this.removeGate(removeGates[i]);
	}
};

QuantumCircuit.prototype.renameCreg = function(oldName, newName) {
	// rename reference
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate && gate.options) {
				// gate writing to creg
				if(gate.options.creg && gate.options.creg.name && gate.options.creg.name == oldName) {
					gate.options.creg.name = newName;
				}

				// gate controlled by creg
				if(gate.options.condition && gate.options.condition.creg && gate.options.condition.creg == oldName) {
					gate.options.condition.creg = newName;
				}
			}
		}
	}

	// rename register
	this.cregs[newName] = JSON.parse(JSON.stringify(this.cregs[oldName]));
	delete this.cregs[oldName];
};

QuantumCircuit.prototype.minCregSize = function(creg) {
	var largestBit = 0;
	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.gates[wire][column];
			if(gate && gate.options) {
				// gate writing to creg
				if(gate.options.creg && gate.options.creg.name && gate.options.creg.name == creg) {
					var targetBit = parseInt(gate.options.creg.bit || 0);
					if(isNaN(targetBit)) {
						targetBit = 0;
					}
					if(targetBit > largestBit) {
						largestBit = targetBit;
					}
				}

				// gate controlled by creg
				if(gate.options.condition && gate.options.condition.creg && gate.options.condition.creg == creg) {
					var lb = Math.floor(Math.log2(gate.options.condition.value));
					if(lb > largestBit) {
						largestBit = lb;
					}
				}
			}
		}
	}

	return largestBit + 1;
};

QuantumCircuit.prototype.resizeCreg = function(creg, size) {
	if(size < this.minCregSize(creg)) {
		return;
	}

	while(this.cregs[creg].length < size) {
		this.cregs[creg].push(0);
	}

	while(this.cregs[creg].length > size) {
		this.cregs[creg].pop();
	}

};

QuantumCircuit.prototype.getCreg = function(creg) {
	return this.cregs[creg];
};

QuantumCircuit.prototype.setCregBit = function(creg, cbit, value) {
	// see if cbit is integer
	var bit = parseInt(cbit);
	if(isNaN(bit)) {
		throw "Error: invalid \"cbit\" argument to \"setCregBit\" method: expected \"integer\" got \"" + typeof cbit + "\".";
	}

	// create register if does not exist
	if(!this.cregs[creg]) {
		this.cregs[creg] = [];
	}

	// extend register if needed
	while(bit >= this.cregs[creg].length) {
		this.cregs[creg].push(0);
	}

	// set bit
	this.cregs[creg][bit] = value ? 1 : 0;
};

QuantumCircuit.prototype.getCregBit = function(creg, cbit) {
	if(!this.cregs[creg]) {
		throw "Error: \"getCregBit\": unknown register \"" + creg + "\".";
	}

	var bit = parseInt(cbit);
	if(isNaN(bit) || bit >= this.cregs[creg].length) {
		throw "Error: \"getCregBit\": bit \"" + cbit + "\" not found.";
	}
	return this.cregs[creg][bit];
};

QuantumCircuit.prototype.cregBase = function(creg) {
	if(!this.cregs[creg]) {
		throw "Error: \"getCregBit\": unknown register \"" + creg + "\".";
	}

	var base = 0;
	for(var regName in this.cregs) {
		if(regName == creg) {
			return base;
		}
		base += this.cregs[regName].length;
	}
};

QuantumCircuit.prototype.cregTotalBits = function() {
	var bits = 0;
	for(var regName in this.cregs) {
		bits += this.cregs[regName].length;
	}
	return bits;
};

QuantumCircuit.prototype.getCregValue = function(creg) {
	if(!this.cregs[creg]) {
		throw "Error: \"getCregBit\": unknown register \"" + creg + "\".";
	}

	var len = this.cregs[creg].length;
	var value = 0;
	for(var i = 0; i < len; i++) {
		if(this.cregs[creg][i]) {
			value += math.pow(2, i);
		}
	}
	return value;
};

//
// This function simulates measurement of all qubits on current state vector, without modifying state
//   Returns array of 0s and 1s for each qubit. 
//   For example, bell state will return: [0, 0] or [1, 1]
//   If you need multiple shots then use "measureAllMultishot" method (it runs much faster).
//
QuantumCircuit.prototype.measureAll = function(forceSampling) {
	if(this.collapsed && this.collapsed.length == this.numQubits && !forceSampling) {
		return this.collapsed;
	}

	this.collapsed = [];

	var randomWeight = Math.random();
	for(var is in this.state) {
		var state = math.round(this.state[is], 14);
		if(state.re || state.im) {
			var chance = math.round(math.pow(math.abs(state), 2), 14);
			randomWeight -= chance;
			if(randomWeight <= 0) {
				var i = parseInt(is);
				if(this.reverseBitOrder) {
					for(var q = this.numQubits - 1; q >= 0; q--) {
						this.collapsed.push(1 << q & i ? 1 : 0);
					}
				} else {
					for(var q = 0; q < this.numQubits; q++) {
						this.collapsed.push(1 << q & i ? 1 : 0);
					}
				}
				return this.collapsed;
			}
		}
	}

	// This shold never happen, but "nature is not classical" :)
	if(!this.collapsed.length) {
		while(this.collapsed.length < this.numQubits) {
			this.collapsed.push(0);
		}
	}
	return this.collapsed;
};


//
//   Returns object (dictionary) with measured values (binary) as keys and counts as values
//   For example, 1024 shots on bell state will return something like: { "00": 514, "11": 510 }
//   if forceRerun is true: circuit will be re-executed after each shot. This is behavior of a quantum computer.
//   if forceRerun is false: it will be automatically determined if re-execution is necessary.
//
QuantumCircuit.prototype.measureAllMultishot = function(shots, forceRerun) {
	shots = shots || 1;

	if(!forceRerun) {
		// Automatically determine if re-run is necessary
		forceRerun = this.measureResetsQubit || this.gotClassicalControl() || this.gotMidCircuitMeasurement();
	}

	var counts = {};

	if(forceRerun) {
		for(var i = 0; i < shots; i++) {
			var collapsed = this.measureAll(true).reverse();
			var bitstring = "";
			collapsed.map(function(bit) {
				bitstring += bit;
			});

			if(counts[bitstring]) {
				counts[bitstring]++;
			} else {
				counts[bitstring] = 1;
			}

			if(i < shots - 1) {
				this.run(this.lastRunArguments.initialValues, this.lastRunArguments.options);
			}
		}
		return counts;
	}


	var randomWeights = [];
	for(var i = 0; i < shots; i++) {
		randomWeights.push(Math.random());
	}

	var shotCount = 0;
	do {
		for(var is in this.state) {
			var state = math.round(this.state[is], 14);
			if(state.re || state.im) {
				var chance = math.round(math.pow(math.abs(state), 2), 14);

				for(var sh = 0; sh < shots; sh++) {
					if(randomWeights[sh] > 0) {
						randomWeights[sh] -= chance;

						if(randomWeights[sh] <= 0) {
							var bin = parseInt(is).toString(2);
							while(bin.length < this.numQubits) {
								bin = "0" + bin;
							}

							if(counts[bin]) {
								counts[bin]++;
							} else {
								counts[bin] = 1;
							}

							shotCount++;

							if(shotCount == shots) {
								return counts;
							}
						}
					}
				}
			}
		}
	} while(shotCount < shots);

	return counts;
};


QuantumCircuit.prototype.measure = function(wire, creg, cbit, forceSampling) {
	if(forceSampling || !this.collapsed || this.collapsed.length != this.numQubits) {
		this.measureAll(forceSampling);
	}

	var val = this.collapsed[wire];

	if(creg && typeof cbit != "undefined") {
		this.setCregBit(creg, cbit, val);
	}

	return val;
};

QuantumCircuit.prototype.probabilities = function() {
	this.prob = [];

	for(var wire = 0; wire < this.numQubits; wire++) {
		this.prob.push(0);
	}

	for(var is in this.state) {
		var i = parseInt(is);

		for(var wire = 0; wire < this.numQubits; wire++) {
			var bit = null;

			if(this.reverseBitOrder) {
				bit = math.pow(2, (this.numQubits - 1) - wire);
			} else {
				bit = math.pow(2, wire);
			}

			if(i & bit) {
				var state = this.state[is];
				if(state.re || state.im) {
					this.prob[wire] += math.pow(math.abs(state), 2);
				}
			}
		}
	}

	for(var wire = 0; wire < this.numQubits; wire++) {
		this.prob[wire] = math.round(this.prob[wire], 14);
	}

	return this.prob;
};

QuantumCircuit.prototype.probability = function(wire) {
	if(!this.prob || this.prob.length != this.numQubits) {
		this.probabilities();
	}

	return this.prob[wire];
};

QuantumCircuit.prototype.densityMatrix = function() {
	var density = [];
	var numAmplitudes = this.numAmplitudes();
	for(row = 0; row < numAmplitudes; row++) {
		var r = [];
		var rowVal = this.state[row] || math.complex(0, 0);
		for(var col = 0; col < numAmplitudes; col++) {
			var colVal = this.state[col] || math.complex(0, 0);
			if(colVal.re || colVal.im) {
				colVal = math.conj(colVal);
			}
			r.push(math.multiply(rowVal, colVal));
		}
		density.push(r);
	}
	return density;
};

QuantumCircuit.prototype.partialTrace = function(qubit) {

	function insertBit(input, pos, bit) {
		var out = input << 1;
		var m = (2 << pos) - 1;
		var posBit = 1 << pos;
		var out = (out ^ ((out ^ input) & m)) | posBit;
		if(!bit) {
			out = out ^ posBit;
		}
		return out;
	}

	var trace = [];

	var unusedCount = this.numQubits - 1;
	var unusedLen = math.pow(2, unusedCount);

	var qpos = null;
	if(this.reverseBitOrder) {
		qpos = (this.numQubits - 1) - qubit;
	} else {
		qpos = qubit;
	}

	for(var el = 0; el < 4; el++) {
		trace.push(math.complex(0, 0));
		var base = unusedLen;
		while(base--) {
			var row = insertBit(base, qpos, el & 2 ? 1 : 0);
			if(this.state[row]) {
				var col = insertBit(base, qpos, el & 1 ? 1 : 0);
				if(this.state[col]) {
					trace[el] = math.add(trace[el], math.multiply(this.state[row], math.conj(this.state[col])));
				}
			}
		}
	}
	return [
		[ trace[0], trace[1] ],
		[ trace[2], trace[3] ]
	];
};


QuantumCircuit.prototype.angles = function() {
	var angles = [];
	for(var wire = 0; wire < this.numQubits; wire++) {
		angles.push({ theta: 0, phi: 0 });
	}

	for(var wire = 0; wire < this.numQubits; wire++) {
		var trace = this.partialTrace(wire);
		var alpha = math.round(math.sqrt(trace[0][0]), 12);
		var beta = math.round(math.multiply(trace[1][0], math.sqrt(2)), 12);
		var radius = math.round(math.abs(math.sqrt(2*math.abs(math.trace(math.pow(trace, 2)))-1)), 12);

		var theta = math.multiply(2, math.acos(alpha));
		var phi = 0;

		if(!(math.round(beta.re, 8) == 0 && math.round(beta.im, 8) == 0)) {
			phi = math.multiply(math.complex(0, -1), math.log(math.multiply(beta, math.csc(math.divide(theta, 2))))).re;
			if(isNaN(phi)) {
				phi = 0;
			}
		}

		angles[wire].theta = math.round(math.abs(theta), 12);
		angles[wire].phi = math.round(phi, 12);
		angles[wire].thetaDeg = math.round(math.multiply(math.abs(theta), (180 / math.pi)), 7);
		angles[wire].phiDeg = math.round(math.multiply(phi, (180 / math.pi)), 7);
		angles[wire].radius = math.round(radius, 7);
	}

	return angles;
};


//
// Options: 
//  { 
//		useGates: [ "ry", "rz", "crz", ... ],
//  	noMeasure: false
//      noReset: false
//      noClassicControl: false
//  }
//

QuantumCircuit.prototype.randomCircuit = function(numQubits, numGates, options) {
	this.init(numQubits);

	options = options || {};

	var gates = (options.useGates && options.useGates.length) ? options.useGates : Object.keys(this.basicGates);

	if(options.noMeasure && gates.indexOf("measure") >= 0) {
		gates.splice(gates.indexOf("measure"), 1);
	}

	if(options.noReset && gates.indexOf("reset") >= 0) {
		gates.splice(gates.indexOf("reset"), 1);
	}

	gates.splice(gates.indexOf("barrier"), 1);

	var gateCount = 0;
	while(gateCount < numGates) {
		var gateName = gates[Math.floor(Math.random() * gates.length)];
		var gate = this.basicGates[gateName];
		if(gate) {
			var gateQubits = gate.matrix && gate.matrix.length ? math.log2(gate.matrix.length) : 1;

			if(gateQubits <= numQubits) {
				// gate wires
				var gateWires = [];
				while(gateWires.length < gateQubits) {
					var gateWire = -1;
					do {
						gateWire = Math.floor(Math.random() * numQubits);
					} while(gateWires.indexOf(gateWire) >= 0);
					gateWires.push(gateWire);
				}

				var opt = {};

				// gate params
				if(gate.params && gate.params.length) {
					var params = {};
					gate.params.map(function(paramName) {
						params[paramName] = Math.PI * 2 * Math.random();

						// -PI..PI
						if(params[paramName] > Math.PI) {
							params[paramName] = Math.PI - params[paramName];
						}
					});
					opt.params = params;
				}

				if(gateName == "measure") {
					// measurement destination
					opt.creg = {
						name: "c",
						bit: gateWires[0]
					};
				} else {
					if(!options.noClassicControl) {
						// maybe add condition
						if(Math.floor(Math.random() * 4) == 0) {
							var cregBits = this.cregTotalBits();
							if(cregBits) {
								opt.condition = {
									creg: "c",
									value: Math.floor(Math.random() * (math.pow(2, cregBits)))
								};
							}
						}
					}
				}

				this.appendGate(gateName, gateWires, opt);
				gateCount++;
			}
		}
	}
};

QuantumCircuit.prototype.randomUnitary = function(numQubits) {
	var circ = new QuantumCircuit();
	circ.randomCircuit((numQubits || 1), (numQubits || 1) * 8, {
		useGates: [ "rx", "rz", "cz" ],
		noMeasure: true,
		noReset: true,
		noClassicControl: true
	});
	return circ.circuitMatrix();
};

QuantumCircuit.prototype.eulerAnglesZYZ = function(inputMatrix) {
	var eulerAngles = {theta: null, phi: null, lambda: null, phase: null};
	var coeff = math.pow(math.det(inputMatrix), -0.5);
	eulerAngles.phase = -1 * math.complex(coeff).toPolar().phi;
	var su_mat = math.multiply(coeff, inputMatrix);
	eulerAngles.theta = 2 * math.atan2(math.abs(su_mat[1][0]), math.abs(su_mat[0][0]));
	var phiplambda = 2 * math.complex(su_mat[1][1]).toPolar().phi;
	var phimlamda = 2 * math.complex(su_mat[1][0]).toPolar().phi;
	eulerAngles.phi = (phiplambda + phimlamda) / 2.0;
	eulerAngles.lambda = (phiplambda - phimlamda) / 2.0;
	return eulerAngles;
};

module.exports = QuantumCircuit;
