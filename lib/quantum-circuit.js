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
		s = f.toFixed(options.decimalPlaces);
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
					replacement: {
						name: "rz",
						params: {
							phi: "0"
						}
					}
				},
				quest: {
					name: "compactUnitary",
					params: { alpha: "(Complex) { .real = 1, .imag = 0 }",
							beta: "(Complex) {.real = 0, .imag = 0}"}
				},
				qsharp: {
					name: "I"
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
				label: "&#x221A;NOT"
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
					matrix: [[["1/sqrt(2)", "0"], ["-1/sqrt(2)", "0"]],
						[["-1/sqrt(2)", "0"],["1/sqrt(2)", "0"]]]
				},
				qasm: {
					replacement: [
						{ name: "h", params: { }},
						{ name: "rx", params: { theta: "-1*pi/2" }},
						{ name: "rz", params: { phi: "-1*pi/2" }}
				   ]
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
						name: "rz",
						params: {
							phi: "pi/2"
						}
					}
				},
				quest: {
					name: "sGate"
				},
				qsharp: {
					replacement: {
						name: "rz",
						params: {
							phi: "pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "rz", params: { phi: "pi/2" }}
				   ]
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
						name: "rz",
						params: {
							phi: "pi/4"
						}
					}
				},
				quest: {
					name: "tGate"
				},
				qsharp: {
					replacement: {
						name: "rz",
						params: {
							phi: "pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "rz", params: { phi: "pi/4" }}
				   ]
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
						name: "rz",
						params: {
							phi: "pi/8"
						}
					}
				},
				cirq: {
					replacement: {
						name: "rz",
						params: {
							phi: "pi/2"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: {theta: "M_PI/8"}
				},
				qsharp: {
					replacement: {
						name: "rz",
						params: {
							phi: "pi/8"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "rz", params: { phi: "pi/8" }}
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
					name: "Rx",
					params: ["theta"]
				},
				quest: {
					name: "rotateX",
					params: ["theta"]
				},
				qsharp: {
					name: "Rx",
					params: ["theta"]
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
					name: "Ry",
					params: ["theta"]
				},
				quest: {
					name: "rotateY",
					params: ["theta"]
				},
				qsharp: {
					name: "Ry",
					params: ["theta"]
				}
			}
		},

		rz: {
			description: "Rotation around the Z-axis by given angle",
			matrix: [
				[1,0],
				[0,"exp(i * phi)"]
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
					name: "Rz",
					params: ["theta"]
				},
				qsharp: {
					name: "Rz",
					params: ["theta"]
				}
			}
		},

		u1: {
			description: "1-parameter 0-pulse single qubit gate",
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
					name: "Rz",
					params: ["lambda"]
				},
				quest: {
					name: "phaseShift",
					params: ["theta"]
				},
				qsharp: {
					name: "Rz",
					params: ["lambda"]
				}
			}
		},

		u2: {
			description: "2-parameter 1-pulse single qubit gate",
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
					defgate: "DEFGATE u2(%phi, %lambda):\n    1 / sqrt(2), -exp(i * %lambda) * 1 / sqrt(2)\n    exp(i * %phi) * 1 / sqrt(2), exp(i * %lambda + i * %phi) * 1 / sqrt(2)"
				},
				pyquil: {
					name: "u2",
					params: ["phi", "lambda"],
					array: "[[1/quil_sqrt(2),-quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[quil_exp(1j*p_phi)*1/quil_sqrt(2),quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]"
				},
				cirq: {
					name: "u2",
					params: ["phi", "lambda"],
					array: "[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]"
				},
				quest: {
					name: "unitary",
					params: ["phi", "lambda"],
					matrix: [[["1/sqrt(2)", "0"], ["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"]],
							 [["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"], ["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"]]]
				}
			}
		},

		u3: {
			description: "3-parameter 2-pulse single qubit gate",
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
					defgate: "DEFGATE u3(%theta, %phi, %lambda):\n    cos(%theta / 2), -exp(i * %lambda) * sin(%theta / 2)\n    exp(i * %phi) * sin(%theta / 2), exp(i * %lambda + i * %phi) * cos(%theta / 2)"
				},
				pyquil: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array: "[[quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]"
				},
				cirq: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array: "[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]"
				},
				quest: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					matrix: [[["cos(theta/2)", "0"], ["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"]],
							 [["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"], ["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"]]]
				}
			}
		},

		s: {
			description: "PI/2 rotation over Z-axis (synonym for `r2`)",
			matrix: [
				[1,0],
				[0,"exp(i * pi / 2)"]
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
				}
			}
		},

		sdg: {
			description: "(-PI/2) rotation over Z-axis",
			matrix: [
				[1,0],
				[0,"exp(-1i * pi / 2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S&#8224;"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/2"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: {theta: "-M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/2"
						}
					}
				}
			}
		},

		tdg: {
			description: "(-PI/4) rotation over Z-axis",
			matrix: [
				[1,0],
				[0,"exp(-1i * pi / 4)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T&#8224;"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/4"
						}
					}
				},
				quest: {
					name: "phaseShift",
					params: {theta: "-M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "rz",
						params: {
							phi: "-pi/4"
						}
					}
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
			params: [],
			drawingInfo: {
				connectors: ["box","box"],
				label: "&#x221A;SWP"
			},
			exportInfo: {
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
			params: [],
			drawingInfo: {
				connectors: ["box","box"],
				label: "iSWP"
			},
			exportInfo: {
				quil: {
					name: "ISWAP"
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
				}
			}
		},

		xy: {
			description: "XY gate",
			matrix: [
				[1, 0, 0, 0],
                [0, "cos(phi / 2)", "1i * sin(phi / 2)", 0],
                [0, "1i * sin(phi / 2)", "cos(phi / 2)", 0],
                [0, 0, 0, 1]
            ],
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
				}
			}
		},

		cy: {
			description: "Controlled Pauli Y (PI rotation over Y-axis)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,0,"-1i"],
				[0,0,"i",0]
			],
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
				pyquil: {
					name: "cy",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0,-1j],[0,0,1j,0]]"
				},
				qsharp: {
					name: "Controlled Y"
				}
			}
		},

		cz: {
			description: "Controlled Z (CPHASE) gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,-1]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
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
				pyquil: {
					name: "ch",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,1/np.sqrt(2),1/np.sqrt(2)],[0,0,1/np.sqrt(2),-1/np.sqrt(2)]]"
				},
				qsharp: {
					name: "Controlled H"
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
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "&#x221A;NOT",
				root: "srn"
			},
			exportInfo: {
				quest: {
					name: "controlledUnitary",
					matrix: [[["-1/sqrt(2)", "0"], ["-1/sqrt(2)", "0"]],
							 [["-1/sqrt(2)", "0"], ["1/sqrt(2)", "0"]]]
				},
				qasm: {
					equivalent: [
						{ name: "rz", params: { phi: "-1*pi/4"}, wires: [0] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4"}, wires: [1] },
						{ name: "rx", params: { theta: "pi"}, wires: [1] },
						{ name: "cz", wires: [0, 1] },
						{ name: "rx", params: { theta: "pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/4"}, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [0] },
						{ name: "cz", wires: [0, 1] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [0] },
						{ name: "rz", params: { phi: "pi/2"}, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2"}, wires: [1] },
						{ name: "rz", params: { phi: "-1*pi/2"}, wires: [1] }
				   ]
				},
				pyquil: {
					name: "csrn",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]"
				}
			}
		},

		ms: {
			description: "Mølmer-Sørensen gate",
			matrix: [
				["cos(theta)", 0, 0, "-i*sin(theta)"],

				[0, "cos(theta)", "-i*sin(theta)", 0],

				[0, "-i*sin(theta)", "cos(theta)", 0],

				["-i*sin(theta)", 0, 0, "cos(theta)"]
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["circle","circle"],
				label: "X"
			},
			exportInfo: {
				quil: {
					name: "ms",
					params: ["theta"],
					defgate: "DEFGATE ms(%theta):\n    cos(%theta), 0, 0, -i*sin(%theta)\n    0, cos(%theta), -i*sin(%theta), 0\n    0, -i*sin(%theta), cos(%theta), 0\n    -i*sin(%theta), 0, 0, cos(%theta)"
				},
				pyquil: {
					name: "ms",
					params: ["theta"],
					array: "[ [quil_cos(p_theta), 0, 0, -1j*quil_sin(p_theta)], [0, quil_cos(p_theta), -1j*quil_sin(p_theta), 0], [0, -1j*quil_sin(p_theta), quil_cos(p_theta), 0], [-1j*quil_sin(p_theta), 0, 0, quil_cos(p_theta)] ]"
				},
				cirq: {
					name: "MS"
				},
				quest: {
					name: "ms",
					//@TODO add function
					func: "TODO"
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
			params: ["theta"],
			drawingInfo: {
				connectors: ["circle","circle"],
				label: "Y"
			},
			exportInfo: {
				quil: {
					name: "yy",
					params: ["theta"],
					defgate: "DEFGATE yy(%theta):\n    cos(%theta), 0, 0, i*sin(%theta)\n    0, cos(%theta), -i*sin(%theta), 0\n    0, -i*sin(%theta), cos(%theta), 0\n    i*sin(%theta), 0, 0, cos(%theta)"
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
				}
			}
		},
/*
		xx: {
			description: "Ising (XX) gate",
			matrix: [
				["1/sqrt(2)", 0, 0, "1/sqrt(2) * (-i * pow(e, i * phi))"],

				[0, "1/sqrt(2)", "-i", 0],

				[0, "-i", "1/sqrt(2)", 0],

				["1/sqrt(2) * (-i * pow(e, -i * phi))", 0, 0, "1/sqrt(2)"]
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["not","not"],
				label: "XX"
			},
			exportInfo: {

			}
		},
*/
		cr2: {
			description: "Controlled PI/2 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/2",
				root: "r2"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
				   ]
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
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/4",
				root: "r4"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
				   ]
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
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z&#x1D6D1;/8",
				root: "r8"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/8"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/8"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/8"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/8"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/8" }}
				   ]
				}
			}
		},

		crx: {
			description: "Controlled rotation around the X-axis by given angle",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "-1i * sin(theta / 2)" ],
				[ 0, 0, "-1i * sin(theta / 2)", "cos(theta / 2)" ]
			],
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
					defgate: "DEFGATE crx(%theta):\n    1, 0, 0, 0,\n    0, 1, 0, 0,\n    0, 0, cos(%theta / 2), -i*sin(%theta / 2),\n    0, 0, -i*sin(%theta / 2), cos(%theta / 2)"
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
					defgate: "DEFGATE cry(%theta):\n    1, 0, 0, 0,\n    0, 1, 0, 0,\n    0, 0, cos(%theta / 2), -1*sin(%theta / 2),\n    0, 0, sin(%theta / 2), cos(%theta / 2)"
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
				}
			}
		},

		crz: {
			description: "Controlled rotation around the Z-axis by given angle",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * phi)"]
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "RZ",
				root: "rz"
			},
			exportInfo: {
				quil: {
					name: "CPHASE",
					params: ["phi"]
				},
				cirq: {
					name: "crz",
					params: ["phi"],
					array: "[ [1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0, np.exp(1j * p_phi)] ]"
				},
				quest: {
					name: "controlledPhaseShift",
					params: ["theta"]
				},
				qsharp: {
					name: "Controlled Rz",
					params: ["phi"]
				}
			}
		},

		cu1: {
			description: "Controlled 1-parameter 0-pulse single qubit gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * lambda)"]
			],
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
					array: "[ [1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0, np.exp(1j * p_lambda)] ]"
				},
				quest: {
					name: "controlledPhaseShift",
					params: ["theta"]
				},
				qsharp: {
					name: "Controlled Rz",
					params: ["phi"]
				}
			}
		},

		cu2: {
			description: "Controlled 2-parameter 1-pulse single qubit gate",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)" ],
				[ 0, 0, "exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)" ]
			],
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
					defgate: "DEFGATE cu2(%phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 1 / sqrt(2), -exp(i * %lambda) * 1 / sqrt(2)\n    0, 0, exp(i * %phi) * 1 / sqrt(2), exp(i * %lambda + i * %phi) * 1 / sqrt(2)"
				},
				pyquil: {
					name: "cu2",
					params: ["phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/quil_sqrt(2), -quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[0, 0, quil_exp(1j*p_phi)*1/quil_sqrt(2), quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]"
				},
				cirq: {
					name: "cu2",
					params: ["phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]"
				},
				quest: {
					name: "controlledUnitary",
					params: ["phi", "lambda"],
					matrix: [[["1/sqrt(2)", "0"], ["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"]],
							 [["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"], ["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"]]]
				},
				qasm: {
					replacement: [
						{ name: "cu3", params: { theta: "pi/2", phi: "phi", lambda: "lambda" }},
				   ]
				}
			}
		},

		cu3: {
			description: "Controlled 3-parameter 2-pulse single qubit gate",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)" ],
				[ 0, 0, "exp(i * phi) * sin(theta / 2)", "exp(i * lambda + i * phi) * cos(theta / 2)" ]
			],

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
					defgate: "DEFGATE cu3(%theta, %phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, cos(%theta / 2), -exp(i * %lambda) * sin(%theta / 2)\n    0, 0, exp(i * %phi) * sin(%theta / 2), exp(i * %lambda + i * %phi) * cos(%theta / 2)"
				},
				pyquil: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[0, 0, quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]"
				},
				cirq: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array: "[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]"
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta", "phi", "lambda"],
					matrix: [[["cos(theta/2)", "0"], ["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"]],
							 [["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"], ["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"]]]
				}
			}
		},

		cs: {
			description: "Controlled PI/2 rotation over Z-axis (synonym for `cr2`)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(i * pi / 2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "S",
				root: "s"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/2" }}
				   ]
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
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "T",
				root: "t"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "cu1", params: { lambda: "pi/4" }}
				   ]
				}
			}
		},

		csdg: {
			description: "Controlled (-PI/2) rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"exp(-1i * pi / 2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "S&#8224;",
				root: "sdg"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/2"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/2"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"-M_PI/2"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/2"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "crz", params: { phi: "-1*pi/2" }}
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
				[0,0,0,"exp(-1i * pi / 4)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "T&#8224;",
				root: "tdg"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/4"
						}
					}
				},
				cirq: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/4"
						}
					}
				},
				quest: {
					name: "controlledPhaseShift",
					params: {theta:"-M_PI/4"}
				},
				qsharp: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/4"
						}
					}
				},
				qasm: {
					replacement: [
						{ name: "crz", params: { phi: "-1*pi/4" }}
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
					name: "CCX"
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
				pyquil: {
					name: "CSWAP"
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
				pyquil: {
					name: "csrswap",
					array: "[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]"
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
					name: "reset"
				},
				quest: {
					name: "reset",
					//@TODO add function
					func: "TODO"
				},
				qsharp: {
					name: "Reset"
				}
			}
		},

		measure: {
			description: "Measures qubit and stores chance (0 or 1) into classical bit",
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
				}
			}
		}
	};

	this.init(numQubits);
};

QuantumCircuit.prototype.init = function(numQubits) {
	this.numQubits = numQubits || 1;
	this.gates = [];
	this.partitionMap = [];
	this.partitionCount = 0;
	this.partitionInfo = {};

	this.params = [];
	this.customGates = {};
	this.cregs = {};
	this.collapsed = [];
	this.prob = [];
	this.measureResetsQubit = false;
	this.reverseBitOrder = false;

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
			var distance = math.abs(math.subtract(i1, i2)) / 2;

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

	var res = [];

	M.map(function(row, rowIndex) {
		res.push([]);

		row.map(function(val, colIndex) {
			if(typeof val == "string") {
				res[rowIndex].push(self.evalMathString(val, vars));
			} else {
				res[rowIndex].push(val);
			}
		});
	});

	return res;
};

//
// Options: {
//     minify:         false
//	   fixedWidth:     false
//     decimalPlaces:  14,
//     iotaChar:       "i"
// }
//
QuantumCircuit.prototype.stringifyMatrix = function(M, options) {
	var self = this;

	options = options || {};

	var str = "";
	str += "[";
	M.map(function(row, rowIndex) {
		if(rowIndex > 0) {
			str += ",";
		}
		if(!options.minify) {
			str += "\n  ";
		} else {
			str += " ";
		}

		str += "[";
		if(row instanceof Array) {
			row.map(function(el, elIndex) {
				if(elIndex > 0) {
					str += ", ";
				}
				if(el instanceof math.Complex) {
					str += self.formatComplex(el, options);
				} else {
					str += formatFloat(el, options);
				}
			});
		} else {
			if(row instanceof math.Complex) {
				str += self.formatComplex(row, options);
			} else {
				str += formatFloat(row, options);
			}
		}
		str += "]";
	});
	if(M.length) {
		if(!options.minify) {
			str += "\n";
		} else {
			str += " ";
		}
	}
	str += "]";

	return str;
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


QuantumCircuit.prototype.transformMatrix = function(totalQubits, U, targetQubits) {
	// clone list of wires to itself (remove reference to original array)
	targetQubits = targetQubits.slice(0);

	// reverse bit order
	if(!this.reverseBitOrder) {
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


QuantumCircuit.prototype.circuitMatrix = function() {
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
					var U = decomposed.transformMatrix(decomposed.numQubits, rawGate, gate.wires);

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

QuantumCircuit.prototype.chanceMap = function() {
	var self = this;

	function getBipartiteState(q1, q2) {
		var bipartiteState = {};
		var ampCount = 0;
		for(var is in self.state) {
			var i = parseInt(is);
			var index = 0;
			var bit1 = (i & (1 << q1)) ? 1 : 0;
			var bit2 = (i & (1 << q2)) ? 2 : 0;

			index |= bit1;
			index |= bit2;

			if(typeof bipartiteState[index] != "undefined") {
				var c = math.complex(math.abs(self.state[is]));
				bipartiteState[index] = math.sqrt(math.add(math.pow(bipartiteState[index], 2), math.pow(c, 2)));
			} else {
				bipartiteState[index] = math.complex(math.abs(self.state[is]));
			}

			ampCount++;
		}

		if(!ampCount) {
			bipartiteState["0"] = math.complex(1, 0);
		}

		return bipartiteState;
	}

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
			var reducedState = getBipartiteState(sour, dest);

			var circ = new QuantumCircuit(2);
			circ.state = reducedState;

			var t1 = circ.partialTrace(0);
			var e1 = circ.eigenvalues2x2(t1);

			var t2 = circ.partialTrace(1);
			var e2 = circ.eigenvalues2x2(t2);

			e1a = math.round(math.abs(e1[0]), 14);
			e1b = math.round(math.abs(e1[1]), 14);

			e2a = math.round(math.abs(e2[0]), 14);
			e2b = math.round(math.abs(e2[1]), 14);

			pure1 = (e1a == 1 || e1b == 1) && e1a != e1b;
			pure2 = (e2a == 1 || e2b == 1) && e2a != e2b;

			map[sour][dest].entangled = !pure1;
			map[sour][dest].eigen = [e1a, e1b];

			map[dest][sour].entangled = !pure2;
			map[dest][sour].eigen = [e2a, e2b];
		}
	}

	return map;
};


function binStr(i, len) {
	var bin = i.toString(2);
	while(bin.length < len) {
		bin = "0" + bin;
	}
	return bin;
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

	var mul = 1;
	if(prob) {
		mul = math.sqrt(math.divide(1, prob));
	}

	value ? U[1][1] = mul : U[0][0] = mul;

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

QuantumCircuit.prototype.getRawGate = function(gate, options) {
	var rawGate = [];
	gate.matrix.map(function(row) {
		var rawGateRow = [];
		row.map(function(item) {
			if(typeof item == "string") {
				var params = options ? options.params || {} : {};

				var vars = {};
				gate.params.map(function(varName, varIndex) {
					if(Array.isArray(params)) {
						// Deprecated. For backward compatibility only. "params" should be object - not array.
						vars[varName] = params.length > varIndex ? math.evaluate(params[varIndex]) : null;
					} else {
						vars[varName] = math.evaluate(params[varName]);
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

QuantumCircuit.prototype.decompose = function(obj) {
	if(!obj.gates.length) {
		return obj;
	}

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
					var empty = [];
					for(var i = 0; i < decomposed.gates[0].length - 1; i++) {
						empty.push(null);
					}

					// shift columns right
					for(var w = 0; w < obj.numQubits; w++) {
						var g = obj.gates[w][column];
						if(g && g.id == gate.id) {
							obj.gates[w].splice(column, 1);
							var insertGate = decomposed.gates[g.connector];
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
	this.clear();
	this.customGates[gateName] = source;

	if(addToCircuit) {
		var wires = [];
		for(var i = 0; i < this.numQubits; i++) {
			wires.push(i);
		}
		this.addGate(gateName, -1, wires);
	} else {
		this.removeTrailingRows();
	}
};

QuantumCircuit.prototype.validCustomGateName = function(baseName) {
	var customGateNames = [];
	if(this.customGates) {
		for(var gateName in this.customGates) {
			customGateNames.push(gateName);
		}
	}

	var index = 0;
	var validName = "";
	do {
		index++;
		validName = (baseName || "sub") + index;
	} while(customGateNames.indexOf(validName) >= 0);

	return validName;
};

QuantumCircuit.prototype.usedGates = function() {
	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));
	var used = [];
	for(var wire = 0; wire < decomposed.numQubits; wire++) {
		for(var col = 0; col < decomposed.numCols(); col++) {
			var gate = decomposed.gates[wire][col];
			if(gate && used.indexOf(gate.name) < 0) {
				used.push(gate.name);
			}
		}
	}

	// custom gates
	for(var wire = 0; wire < this.numQubits; wire++) {
		for(var col = 0; col < this.numCols(); col++) {
			var gate = this.gates[wire][col];
			if(gate) {
				if(used.indexOf(gate.name) < 0) {
					used.push(gate.name);
				}
			}
		}
	}

	return used;
};

QuantumCircuit.prototype.getGateDef = function(name) {
	var gateDef = this.basicGates[name];
	if(!gateDef) {
		gateDef = this.customGates[name];
	}
	return gateDef;
};

QuantumCircuit.prototype.exportRaw = function() {
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
						options.params[paramName] = math.evaluate(options.params[paramName]);
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

QuantumCircuit.prototype.save = function(decompose) {
	var data = {
		numQubits: this.numQubits,
		params: JSON.parse(JSON.stringify(this.params)),
		gates: JSON.parse(JSON.stringify(this.gates)),
		customGates: JSON.parse(JSON.stringify(this.customGates)),
		cregs: JSON.parse(JSON.stringify(this.cregs))
	}

	if(decompose) {
		return this.decompose(data);
	} else {
		return data;
	}
};

QuantumCircuit.prototype.load = function(obj) {
	this.numQubits = obj.numQubits || 1;
	this.clear();
	this.params = JSON.parse(JSON.stringify(obj.params || []));
	this.gates = JSON.parse(JSON.stringify(obj.gates || []));
	this.customGates = JSON.parse(JSON.stringify(obj.customGates || {}));
	this.cregs = JSON.parse(JSON.stringify(obj.cregs || {}));
};

QuantumCircuit.prototype.registerGate = function(name, obj) {
	if(obj instanceof QuantumCircuit) {
		this.customGates[name] = obj.save();
	} else {
		this.customGates[name] = obj;
	}
};

QuantumCircuit.prototype.isControllableGate = function(gateName) {
	if(gateName == "cx") {
		return true;
	}

	for(var gn in this.basicGates) {
		var gateDef = this.basicGates[gn];
		if(gateDef && gateDef.drawingInfo && gateDef.drawingInfo.root && gateDef.drawingInfo.root == gateName) {
			return true;
		}

	}
	return false;
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


QuantumCircuit.prototype.exportQiskit = function(comment, decompose, exportAsGateName, versionStr, providerName, backendName, asJupyter, shots) {
	var self = this;

	providerName = providerName || "Aer";

	backendName = backendName || "";
	if(!backendName && providerName == "Aer") {
		backendName = "qasm_simulator";
	}

	var version = parseFloat(versionStr || "0.7");
	if(isNaN(version)) {
		version = 0.7;
	}

	// decompose
	var circuit = null;
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

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
		}
	};

	if(exportAsGateName) {
		qiskit += "def " + exportAsGateName + "(";

		var argc = 0;
		if(circuit.params && circuit.params.length) {
			for(var pc = 0; pc < circuit.params.length; pc++) {
				if(argc > 0) {
					qiskit += ", ";
				}
				argc++;
				qiskit += circuit.params[pc];
			}
		}

		for(var i = 0; i < circuit.numQubits; i++) {
			if(argc > 0) {
				qiskit += ", ";
			}
			argc++;
			qiskit += qubitLetter(i, circuit.numQubits);
		}
		qiskit += "):\n";
	} else {
		qiskit += "from qiskit import QuantumRegister, ClassicalRegister\n";
		qiskit += "from qiskit import QuantumCircuit, execute, " + providerName + "\n";
		qiskit += "import numpy as np\n";
		qiskit += "\n";

		qiskit += "qc = QuantumCircuit()\n";
		qiskit += "\n";

		qiskit += "q = QuantumRegister(" + circuit.numQubits + ", 'q')\n";
		for(var cregName in this.cregs) {
			qiskit += cregName + " = ClassicalRegister(" + (this.cregs[cregName].length || 1) + ", '" + cregName + "')\n";
		}
		qiskit += "\n";

		qiskit += "qc.add_register(q)\n";
		for(var cregName in this.cregs) {
			qiskit += "qc.add_register(" + cregName + ")\n";
		}
		qiskit += "\n";

		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						qiskit += customCircuit.exportQiskit("", true, usedGateName, versionStr, "");
					}
				}
			});
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(exportAsGateName) {
					qiskit += "  ";
				}

				var gateName = gate.name;
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				switch(gateName) {
					case "id": {
						gateName = "iden";
					}; break;

					case "r2": {
						gateName = "u1";
						gateParams = { lambda: "pi/2" };
					}; break;

					case "r4": {
						gateName = "u1";
						gateParams = { lambda: "pi/4" };
					}; break;

					case "r8": {
						gateName = "u1";
						gateParams = { lambda: "pi/8" };
					}; break;

					case "cr2": {
						gateName = "cu1";
						gateParams = { lambda: "pi/2" };
					}; break;

					case "cr4": {
						gateName = "cu1";
						gateParams = { lambda: "pi/4" };
					}; break;

					case "cr8": {
						gateName = "cu1";
						gateParams = { lambda: "pi/8" };
					}; break;
				}

				if(this.basicGates[gateName]) {
					qiskit += "qc.";
				}
				qiskit += gateName + "(";

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
									qiskit += ", ";
								}
								var paramName = paramDef[p];

								// ---
								// prepend 'np' to math constants
								if(gateParams[paramName]) {
									var node = math.parse(gateParams[paramName]);
									qiskit += node.toString({ handler: mathToStringHandler });
								}
								// ---

								argCount++;
							}
						}
					}
				}

				for(var w = 0; w < gate.wires.length; w++) {
					if(argCount > 0) {
						qiskit += ", ";
					}
					if(exportAsGateName) {
						qiskit += qubitLetter(gate.wires[w], circuit.numQubits);
					} else {
						qiskit += "q[" + gate.wires[w] + "]";
					}
					argCount++;
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

	if(exportAsGateName) {
		qiskit += "\n";
	} else {
		qiskit += "\n";

		if(providerName == "Aer") {
			qiskit += "backend = Aer.get_backend('" + backendName + "')\n";
			qiskit += "job = execute(qc, backend=backend";
			if(shots) {
				qiskit += ", shots=" + parseInt(shots);
			}
			qiskit += ")\n";
			qiskit += "job_result = job.result()\n";
			qiskit += "print(job_result.get_counts(qc))\n";
		}

		if(providerName == "IBMQ") {
			qiskit += "IBMQ.load_accounts()\n";
			if(backendName) {
				qiskit += "backend = IBMQ.get_backend('" + backendName + "')\n";
			} else {
				qiskit += "backend = least_busy(IBMQ.backends(simulator=False))\n";
			}
			qiskit += "job = execute(qc, backend=backend";
			if(shots) {
				qiskit += ", shots=" + parseInt(shots);
			}
			qiskit += ")\n";
			qiskit += "job_result = job.result()\n";
			qiskit += "print(job_result.get_counts(qc))\n";
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

	return qiskit;
};


QuantumCircuit.prototype.exportQuEST = function(comment, decompose, exportAsGateName, definedFunc) {
	var self = this;

	definedFunc = definedFunc || [];

	var circuit = null;
	var functions = ["unitary","controlledUnitary"];

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

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
			var questName = this.basicGates[gate.name].exportInfo.quest.name;
			if(definedFunc.includes(gate.name)) {
				continue;
			}
			if(functions.includes(questName) || this.basicGates[gate.name].exportInfo.quest.func){
				definedFunc.push(gate.name);
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
						customQuEST.push(customCircuit.exportQuEST("", true, usedGateName, definedFunc));
					}
				}
			});
		}

		for(var i = 0; i < definedFunc.length; i++) {
			var gateName = definedFunc[i];
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
}


QuantumCircuit.prototype.exportQASM = function(comment, decompose, exportAsGateName, circuitReplacement, compatibilityMode) {
	var self = this;
	var circuit = null;

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var qasm = "";

	// comment
	if(comment) {
		var comm = (comment || "").split("\n");
		comm.map(function(cline) {
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

			for(var cregName in this.cregs) {
				qasm += "creg " + cregName + "[" + (this.cregs[cregName].length || 1) + "];\n";
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
							qasm += customCircuit.exportQASM("", false, usedGateName, false);
						}
					}
				});
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			var qasmReplacement = null;
			var qasmEquivalent = null;
			if(gate && gate.connector == 0) {
				if(exportAsGateName) {
					qasm += "  ";
				}
				if(!compatibilityMode){
					var gateDef = circuit.getGateDef(gate.name);
					if(gateDef){
						if(gateDef.exportInfo){
							if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.replacement){
								qasmReplacement = gateDef.exportInfo.qasm.replacement;
								qasmReplacement.map(function(replacement){
									var replacementCircuit = new QuantumCircuit();
									if(gate.options && gate.options.params){
										var params = Object.keys(gate.options.params);
										var replacementParams = Object.keys(replacement.params);
										params.map(function(param){
											if(replacementParams.indexOf(param) > -1){
												replacement.params[param] = gate.options.params[param];
											}
										});
									}							
									replacementCircuit.addGate(replacement.name, column, gate.wires, {params: replacement.params});
									qasm += replacementCircuit.exportQASM("", false, false, true);
								});
							}else if(gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.equivalent){
								qasmEquivalent = gateDef.exportInfo.qasm.equivalent;
								qasmEquivalent.map(function(equivalent){
									var equivalentCircuit = new QuantumCircuit();
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
												gateParams[gateParamName] = math.evaluate(gate.options.params[gateParamName]);
											}
										}

										// Evaluate equivalent gate's params
										for(var eqParamName in equivalent.params) {
											eqParams[eqParamName] = math.evaluate(equivalent.params[eqParamName], gateParams);
										}
									}
									equivalentCircuit.addGate(equivalent.name, column, gateWires, { params: eqParams });
									qasm += equivalentCircuit.exportQASM("", false, false, true);
								});
							}
						}
					}
				}

				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					qasm += "if(" + gate.options.condition.creg + "==" + gate.options.condition.value + ") ";
				}

				if((!qasmReplacement && !qasmEquivalent) || compatibilityMode){
					var gateName = gate.name;
					var gateParams = gate.options && gate.options.params ? gate.options.params : {};
					qasm += gateName;
					if(gateParams) {
						var gateDef = this.basicGates[gateName];
						if(!gateDef) {
							gateDef = this.customGates[gateName];
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
									qasm += gateParams[paramName];
								}
								qasm += ")";
							}
						}
					}

					for(var w = 0; w < gate.wires.length; w++) {
						if(w > 0) {
							qasm += ",";
						}
						if(exportAsGateName) {
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


QuantumCircuit.prototype.importQASM = function(input, errorCallback) {
	this.init();
	QASMImport(this, input, errorCallback);
};


QuantumCircuit.prototype.exportPyquil = function(comment, decompose, exportAsGateName, versionStr, lattice, asQVM, asJupyter, shots) {
	var self = this;

	var version = parseFloat(versionStr || "2.12");
	if(isNaN(version)) {
		version = 2.1;
	}

	if(typeof shots == "undefined") {
		shots = 1024;
	}

	// decompose
	var circuit = null;
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var importGates = "";
	var defParams = [];
	var defGates = "";
	var defRun = "";
	var defArrays = "";
	var usedGates = circuit.usedGates();

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
		indent = "    ";
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

		pyquil += "import numpy as np\n";
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
						pyquil += customCircuit.exportPyquil("", false, usedGateName, versionStr);
						defCircNames.push(usedGateName);
					}
				}
			});
		}
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			var numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if(numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}
		}
	};

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
			pyquil += "ro = p.declare('ro', memory_type='BIT', memory_size=" + totalBits + ")\n";
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
			pyquil += "qvm = QVMConnection()\n";
			pyquil += "print(qvm.run(p))\n";
		} else {
			if(shots) {
				pyquil += "p.wrap_in_numshots_loop(" + shots + ")\n";
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

			pyquil += "qc = get_qc('" + latticeName + "'" + (lattice ? (", as_qvm=" + (asQVM ? "True" : "False")) : "") + ")\n";

			if(lattice) {
				pyquil += "ep = qc.compile(p)\n";
				pyquil += "print(qc.run(ep))\n";
			} else {
				pyquil += "print(qc.run(p))\n";
			}
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

QuantumCircuit.prototype.exportQuil = function(comment, decompose, exportAsGateName, versionStr) {
	var self = this;

	var version = parseFloat(versionStr || "2.0");
	if(isNaN(version)) {
		version = 2.0;
	}

	// decompose
	var circuit = null;
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

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
				quil += "DECLARE ro BIT[" + totalBits + "]\n\n";
			}
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
						quil += customCircuit.exportQuil("", false, usedGateName);
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


QuantumCircuit.prototype.importQuil = function(quil, errorCallback, options, qubitNames, renamedGates) {
	var self = this;

	options = options || {};

	self.init();

	renamedGates = renamedGates || {};

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
			var tokens = line.split(" ");
			if(!tokens.length) {
				multiline = false;
			} else {
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
									params[ndx] = par.trim();
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

								name = name.substring(0, paramStart);
							}
						} else {
							name = tokens.splice(0, 1)[0];
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
			}
		} else {
			commands[commands.length - 1].body.push(line);
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
				subCircuit.params = command.params;

				subCircuit.importQuil(subQuil, errorCallback, options, subQubitNames, renamedGates);

				self.registerGate(command.name, subCircuit.save());
			}; break;

			case "GATE": {
				switch(command.name) {
					case "DECLARE": {
						// NOT IMPLEMENTED YET !!!

					}; break;

					case "HALT": {
						// What!?

					}; break;

					case "PRAGMA": {
						// What!?

					}; break;

					default: {
						var gateInfo = getGateInfo(command.name);
						if(!gateInfo) {
							var errorMessage = "Cannot recognize \"" + command.name + "\".";
							if(errorCallback) {
								errorCallback([ { msg: errorMessage, line: command.line, col: command.col } ]);
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
										errorCallback([ { msg: errorMessage, line: command.line, col: command.col } ]);
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
												errorCallback([ { msg: errorMessage, line: command.line, col: command.col } ]);
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
										errorCallback([ { msg: errorMessage, line: command.line, col: command.col } ]);
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
										args.push(parseInt(arg));
									}
								} else {
									args.push(parseInt(arg));
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

QuantumCircuit.prototype.exportQuirk = function(decompose) {
	var self = this;

	var circuit = null;

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	var quirk = {
		cols: [],
		gates: []
	};

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		var quirkColumn = [];
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);

			if(!gate || gate.name == "measure" || gate.name == "reset") {
				quirkColumn.push(1);
			} else {
				var basicGate = circuit.basicGates[gate.name];
				if(basicGate) {
					var quirkName = "";

					// one-qubit gate
					if(basicGate.matrix.length == 2) {
						switch(gate.name) {
							case "x": quirkName = "X"; break;
							case "y": quirkName = "Y"; break;
							case "z": quirkName = "Z"; break;
							case "h": quirkName = "H"; break;
							case "r2": quirkName = "Z^½"; break;
							case "r4": quirkName = "Z^¼"; break;
							case "r8": quirkName = "Z^⅛"; break;
							case "s": quirkName = "Z^½"; break;
							case "t": quirkName = "Z^¼"; break;
							case "sdg": quirkName = "Z^-½"; break;
							case "tdg": quirkName = "Z^-¼"; break;
						}
					}
					// two-qubit gate
					if(basicGate.matrix.length == 4) {
						switch(gate.name) {
							case "cx": quirkName = "X"; break;
							case "cy": quirkName = "Y"; break;
							case "cz": quirkName = "Z"; break;
							case "ch": quirkName = "H"; break;
							case "cr2": quirkName = "Z^½"; break;
							case "cr4": quirkName = "Z^¼"; break;
							case "cr8": quirkName = "Z^⅛"; break;
							case "cs": quirkName = "Z^½"; break;
							case "ct": quirkName = "Z^¼"; break;
							case "csdg": quirkName = "Z^-½"; break;
							case "ctdg": quirkName = "Z^-¼"; break;
							case "swap": quirkName = "Swap"; break;
						}

						// known gate, but this is control bit
						if(quirkName && (gate.name == "swap" && gate.connector < gate.wires.length - 2) || (gate.name != "swap" && gate.connector < gate.wires.length - 1)) {
							quirkName = "•";
						}
					}

					// three-qubit gate
					if(basicGate.matrix.length == 8) {
						switch(gate.name) {
							case "ccx": quirkName = "X"; break;
							case "cswap": quirkName = "Swap"; break;
						}

						// known gate, but this is control bit
						if(quirkName && (gate.name == "swap" && gate.connector < gate.wires.length - 2) || (gate.name != "swap" && gate.connector < gate.wires.length - 1)) {
							quirkName = "•";
						}
					}

					if(quirkName) {
						// add gate to column
						quirkColumn.push(quirkName);
					}

					// Not directly supported by quirk
					if(!quirkName) {
						if(gate.connector == 0) {
							quirkName = "~" + gate.name;

							var alreadyDefined = quirk.gates.find(function(gt) {
								return gt.id == quirkName;
							});

							if(!alreadyDefined) {

								var matrix = "";
								matrix += "{";
								basicGate.matrix.map(function(row, rowIndex) {
									if(rowIndex > 0) {
										matrix += ",";
									}
									matrix += "{";
									row.map(function(col, colIndex) {
										if(colIndex > 0) {
											matrix += ",";
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
							quirkColumn.push(quirkName);
						} else {
							quirkColumn.push(1);
						}
					}
				} else {
					if(gate.connector == 0) {
						quirkColumn.push("~" + gate.name);
					} else {
						quirkColumn.push(1);
					}
				}
			}
		}
		quirk.cols.push(quirkColumn);
	}

	// user defined gates
	if(!decompose) {
		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						quirk.gates.push({
							id: "~" + usedGateName,
							circuit: customCircuit.exportQuirk(true)
						});
					}
				}
			});
		}
	}

	return quirk;
};


QuantumCircuit.prototype.exportCirq = function(comment, decompose, exportAsGateName, versionStr, asJupyter) {
	var self = this;

	var circuit = null;

	var version = parseFloat(versionStr || "0.5");
	if(isNaN(version)) {
		version = 0.5;
	}

	// decompose
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

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
		cirq += "import cirq\n";
		cirq += "import numpy as np\n";
		cirq += "\n";

		var usedGates = circuit.usedGates();
		if(!decompose) {
			usedGates.map(function(usedGateName) {
				var basicGate = circuit.basicGates[usedGateName];
				if(!basicGate) {
					var customGate = self.customGates[usedGateName];
					if(customGate) {
						var customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						cirq += customCircuit.exportCirq("", true, usedGateName, versionStr);
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
								switch(basicGate.matrix.length) {
									case 2: defGates += "    return cirq.SingleQubitMatrixGate(np.array(" + cirqInfo.array + "))\n"; break;
									case 4: defGates += "    return cirq.TwoQubitMatrixGate(np.array(" + cirqInfo.array + "))\n"; break;
									default: defGates += "    # Export to cirq WARNING: Cannot define " + basicGate.matrix.length + " x " + basicGate.matrix.length + " matrix gate\n";
								}
							}
							defGates += "\n";
						}
					}
				}
			}
		});
		cirq += defGates;

		cirq += "q = [cirq.NamedQubit('q' + str(i)) for i in range(" + circuit.numQubits + ")]\n";
		cirq += "\n";
		cirq += "circuit = cirq.Circuit.from_ops(\n";
		indent = "    ";
	}

	var numCols = circuit.numCols();
	var gateCounter = 0;
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				var gateDef = circuit.getGateDef(gate.name);
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				var cirqInfo = null;
				if(gateDef) {
					if(gateDef.exportInfo) {
						if(gateDef.exportInfo.cirq && gateDef.exportInfo.cirq.replacement) {
							if(gateDef.exportInfo.cirq.replacement.params) {
								gateParams = gateDef.exportInfo.cirq.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.cirq.replacement.name);
						}

						cirqInfo = (gateDef && gateDef.exportInfo && gateDef.exportInfo.cirq) ? gateDef.exportInfo.cirq : null;
					}

					if(gateCounter > 0) {
						cirq += ",\n";
					}
					gateCounter++;

					if(gate.options && gate.options.condition && gate.options.condition.creg) {
						cirq += indent + "# Export to cirq WARNING: classical control not implemented yet.\n";
					}

					var tmpParamCount = 0;
					var paramString = "";

					if(gateParams) {
						var paramDef = gateDef.params || [];
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
									paramString += node.toString({ handler: mathToStringHandler });
								}
								// ---

								if(tmpParamCount == paramCount - 1) {
									paramString += ")";
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

						cirq += cirqInfo.name;

						if(addBraces) {
							cirq += ")";
						}

					} else {
						cirq += indent + gate.name;
					}

					cirq += paramString + "(";

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
						argCount++;
					}

					cirq += ")";
				} else {
					cirq += indent + "# Export to cirq WARNING: unknown gate \"" + gate.name + "\".";
				}
			}
		}
	}

	if(!exportAsGateName) {
		cirq += "\n)\n";
		cirq += "\n";
		cirq += "simulator = cirq.Simulator()\n";
		cirq += "result = simulator.run(circuit)\n";
		cirq += "print(result)\n";
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

QuantumCircuit.prototype.exportQSharp = function(comment, decompose, exportAsGateName, versionStr, asJupyter, circuitName, indentDepth) {
	var self = this;
	
	var circuit = null;

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

	// decompose
// !!! Force decompose until we implement submodules
//decompose = true;
//
	if(decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

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
						qsharp += customCircuit.exportQSharp("", true, usedGateName, versionStr, false, null, indentDepth);
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
}

QuantumCircuit.prototype.exportQobj = function(circuitName, experimentName, numShots) {
	var self = this;
	
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
	var registerSlots = parentQobj.config.memory_slots;
	qobj.header.memory_slots = parentQobj.config.memory_slots;
	qobj.header.n_qubits = circuit.numQubits;
	qobj.config.memory_slots = parentQobj.config.memory_slots;
	qobj.config.n_qubits = circuit.numQubits;
	qobj.header.qreg_sizes.push(["q", circuit.numQubits]);

	var usedGates = circuit.usedGates();
	usedGates.map(function(usedGateName){
		var basicGate = circuit.basicGates[usedGateName];
		if(!basicGate){
			var customGate = self.customGates[usedGateName];
			if(customGate){
				customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				parentQobj = customCircuit.exportQobj(circuitName, experimentName, numShots);	
			}
		}
	});

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++){
		for(var wire = 0; wire < circuit.numQubits; wire++){
			var gate = circuit.getGateAt(column, wire);
			var qobjInstruction = {name : "", qubits: []};
			if(column == 0){
				qobj.header.qubit_labels.push(["q", wire]);
			}

			if(gate && gate.connector == 0){
				var gateName = gate.name;
				var gateParams = gate.options && gate.options.params ? gate.options.params : {};
				if(this.basicGates[gateName]){
					switch(gateName) {
						case "id": {
							gateName = "iden";
						}; break;
	
						case "r2": {
							gateName = "u1";
							gateParams = { lambda: "pi/2" };
						}; break;
	
						case "r4": {
							gateName = "u1";
							gateParams = { lambda: "pi/4" };
						}; break;
	
						case "r8": {
							gateName = "u1";
							gateParams = { lambda: "pi/8" };
						}; break;
	
						case "cr2": {
							gateName = "cu1";
							gateParams = { lambda: "pi/2" };
						}; break;
	
						case "cr4": {
							gateName = "cu1";
							gateParams = { lambda: "pi/4" };
						}; break;
	
						case "cr8": {
							gateName = "cu1";
							gateParams = { lambda: "pi/8" };
						}; break;
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
									if(gateParams[paramName]){
										var node = math.evaluate(gateParams[paramName]);
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

	if(qobj.instructions.length){
		parentQobj.experiments.push(qobj);
	}
	return parentQobj;
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

QuantumCircuit.prototype.exportSVG = function(embedded, options) {
	var self = this;
	var options = options || {};

	var cellWidth = 40;
	var cellHeight = 40;
	var hSpacing = 20;
	var vSpacing = 20;
	var blackboxPaddingX = 2;
	var blackboxPaddingY = 2;
	var blackboxLineColor = "black";
	var blackboxSelectedLineColor = "black";
	var wireColor = "black";
	var gateLineColor = "black";
	var gateSelectedLineColor = "black";
	var cWireColor = "silver";
	var cWireSelectedColor = "silver";
	var cArrowSize = 10;
	var wireWidth = 1;
	var wireTextHeight = 8;
	var wireTextDown = 16;
	var wireMargin = 20;
	var wireLabelWidth = 40;
	var dotRadius = 5;
	var selectionPaddingX = 5;
	var selectionPaddingY = 5;
	var selectionLineColor = "#2185D0";

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

	var getCellX = function(col) {
		return wireLabelWidth + ((cellWidth + hSpacing) * col) + hSpacing;
	};

	var getCellY = function(wire) {
		return ((cellHeight + vSpacing) * wire) + vSpacing;
	};

	var numRows = this.numQubits;
	var numCols = this.numCols();
	var numCregs = this.cregCount();

	var totalWidth = getCellX(numCols);
	var totalHeight = ((cellHeight + vSpacing) * (numRows + numCregs)) + vSpacing;

	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

		return {
				x: centerX + (radius * Math.cos(angleInRadians)),
				y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	function describeArc(x, y, radius, startAngle, endAngle){

		var start = polarToCartesian(x, y, radius, endAngle);
		var end = polarToCartesian(x, y, radius, startAngle);

		var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		var d = [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
		].join(" ");

		return d;
	}

	var qWireY = function(wire) {
		return ((cellHeight + vSpacing) * wire) + (vSpacing + (cellHeight / 2))
	};

	var qGateY = function(wire) {
		return ((cellHeight + vSpacing) * wire) + vSpacing
	};

	var cWireY = function(cregName) {
		return ((cellHeight + vSpacing) * (numRows + getCregIndex(cregName))) + (vSpacing + (cellHeight / 2))
	};

	function gateBoxSVG(gateX, gateY, gateName, gateLabel, selected) {

		var gateWidth = cellWidth;
		var gateHeight = cellHeight;

		var res = "";

		res += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\" fill=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\">" + gateLabel + "</text>";
		}

		return res;
	}

	function gateRectSVG(gateX, gateY, gateName, gateLabel, selected) {

		var gateWidth = cellWidth * 2;
		var gateHeight = cellHeight;

		var res = "";

		res += "<rect class=\"qc-gate-rect\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">" + gateLabel + "</text>";
		}

		return res;
	}

	function gateCircleSVG(cellX, cellY, gateName, gateLabel, selected) {
		var centerX = cellX + (cellWidth / 2);
		var centerY = cellY + (cellHeight / 2);

		var gateWidth = cellWidth * 0.8;
		var gateHeight = cellHeight * 0.8;
		var gateX = cellX + ((cellWidth - gateWidth) / 2);
		var gateY = cellY + ((cellHeight - gateHeight) / 2);

		var res = "";

		res += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		if(gateLabel) {
			res += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" dominant-baseline=\"middle\" text-anchor=\"middle\">" + gateLabel + "</text>";
		}

		return res;
	}

	function gateNotSVG(cellX, cellY, gateName, selected) {
		var centerX = cellX + (cellWidth / 2);
		var centerY = cellY + (cellHeight / 2);

		var gateWidth = cellWidth * 0.8;
		var gateHeight = cellHeight * 0.8;
		var gateX = cellX + ((cellWidth - gateWidth) / 2);
		var gateY = cellY + ((cellHeight - gateHeight) / 2);


		var res = "";

		res += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-not-line\" x1=\"" + centerX + "\" x2=\"" + centerX + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-not-line\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + centerY +"\" y2=\"" + centerY + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" stroke-width=\"1\" />";

		return res;
	}

	function gateGaugeSVG(gateX, gateY, gateName, selected) {
		var gateWidth = cellWidth;
		var gateHeight = cellHeight;
		var centerX = gateX + (gateWidth / 2);
		var centerY = gateY + (gateHeight / 2);
		var movedown = gateHeight / 5;

		var res = "";

		res += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"white\" stroke-width=\"1\" />";
		res += "<path class=\"gc-gate-gauge-arc\" d=\"" + describeArc(centerX, centerY + movedown, gateWidth / 2.3, 300, 60) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" fill=\"none\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-gauge-scale\" x1=\"" + centerX + "\" x2=\"" + ((gateX + gateWidth) - movedown) + "\" y1=\"" + (centerY + movedown) + "\" y2=\"" + (gateY + movedown) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" stroke-width=\"1\" />";

		return res;
	}

	function gateXSVG(cellX, cellY, gateName, selected) {
		var gateWidth = cellWidth * 0.4;
		var gateHeight = cellHeight * 0.4;
		var gateX = cellX + ((cellWidth - gateWidth) / 2);
		var gateY = cellY + ((cellHeight - gateHeight) / 2);

		var res = "";
		res += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" stroke-width=\"1\" />";
		res += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + (gateY + gateHeight) +"\" y2=\"" + gateY + "\" stroke=\"" + (selected ? gateSelectedLineColor : gateLineColor) + "\" stroke-width=\"1\" />";
		return res;
	}

	function gateDotSVG(cellX, cellY, gateName, selected) {
		var gateWidth = cellWidth;
		var gateHeight = cellHeight;
		var centerX = cellX + (gateWidth / 2);
		var centerY = cellY + (gateHeight / 2);

		var res = "";
		res += "<circle class=\"qc-gate-dot\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" r=\"" + dotRadius + "\" stroke=\"" + (selected ? gateSelectedLineColor : wireColor) + "\" fill=\"" + (selected ? gateSelectedLineColor : wireColor) + "\" stroke-width=\"1\" />";
		return res;
	}

	function gateSVG(gateX, gateY, gateName, gateLabel, connector, drawBox, selected) {
		var res = "";

		if(connector != "box" && drawBox) {
			res += gateBoxSVG(gateX, gateY, gateName, "", selected);
		}

		switch(connector) {
			case "box": res += gateBoxSVG(gateX, gateY, gateName, gateLabel, selected); break;
			case "rect": res += gateRectSVG(gateX, gateY, gateName, gateLabel, selected); break;
			case "circle": res += gateCircleSVG(gateX, gateY, gateName, gateLabel, selected); break;
			case "not": res += gateNotSVG(gateX, gateY, gateName, selected); break;
			case "x": res += gateXSVG(gateX, gateY, gateName, selected); break;
			case "dot": res += gateDotSVG(gateX, gateY, gateName, selected); break;
			case "gauge": res += gateGaugeSVG(gateX, gateY, gateName, selected); break;
		}

		return res;
	}


	function drawGate(gate, colIndex, rowIndex) {
		var dinfo = self.basicGates[gate.name] ? self.basicGates[gate.name].drawingInfo : null;
		var blackbox = false;
		var selected = options && options.selection && options.selection.indexOf(gate.id) >= 0;
		if(!dinfo) {
			if(gate.wires.length == 1) {
				dinfo = { connectors: ["box"] };
			} else {
				dinfo = { connectors: [] };
				blackbox = true;
			}
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
			var gateX = getCellX(colIndex) - blackboxPaddingX;
			var gateY = qGateY(topWire) - blackboxPaddingY;
			var gateWidth = cellWidth + (2 * blackboxPaddingX);
			var gateHeight = ((qGateY(bottomWire) + cellHeight) - gateY) + blackboxPaddingY;

			var centerX = gateX + (gateWidth / 2);

			cLinkTopY = gateY + gateHeight;

			svg += "<text class=\"qc-blackbox-label\" x=\"" + centerX + "\" y=\"" + (gateY - wireTextHeight - (blackboxPaddingY * 2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + (dinfo.label || gate.name) + "</text>";
			svg += "<rect class=\"qc-gate-blackbox\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + (selected ? blackboxSelectedLineColor : blackboxLineColor) + "\" fill=\"transparent\" stroke-width=\"1\" />";
		}

		if(selected) {
			var gateX = getCellX(colIndex) - selectionPaddingX;
			var gateY = qGateY(topWire) - selectionPaddingY;
			var gateWidth = cellWidth + (2 * selectionPaddingX);
			var gateHeight = ((qGateY(bottomWire) + cellHeight) - gateY) + selectionPaddingY;

			var centerX = gateX + (gateWidth / 2);

			cLinkTopY = gateY + gateHeight;

			svg += "<rect class=\"qc-gate-selection\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + selectionLineColor + "\" fill=\"transparent\" stroke-dasharray=\"4\" stroke-width=\"1\" />";
		}

		// link
		if(topWire != bottomWire && !blackbox) {
			var linkX = getCellX(colIndex) + (cellWidth / 2);
			var linkY1 = getCellY(topWire) + (cellHeight / 2);
			var linkY2 = getCellY(bottomWire) + (cellHeight / 2);
			svg += "<line class=\"qc-gate-link\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? gateSelectedLineColor : wireColor) + "\" stroke-width=\"1\" />";
		}

		// connectors
		gate.wires.map(function(wire, connector) {

			switch(dinfo.connectors[connector]) {
				case "box": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateBoxSVG(gateX, gateY, gate.name, (blackbox ? qubitLetter(connector, numRows) : (dinfo.label || gate.name)), selected);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + cellHeight;
					}
				}; break;

				case "circle": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateCircleSVG(gateX, gateY, gate.name, (blackbox ? qubitLetter(connector, numRows) : (dinfo.label || gate.name)), selected);

					if(!blackbox && wire == bottomWire) {
						var gateHeight = (cellHeight * 0.8);
						cLinkTopY = gateY + gateHeight + ((cellHeight - gateHeight) / 2);
					}
				}; break;

				case "not": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateNotSVG(cellX, cellY, gate.name, selected);

					if(!blackbox && wire == bottomWire) {
						var gateHeight = (cellHeight * 0.8);
						cLinkTopY = cellY + gateHeight + ((cellHeight - gateHeight) / 2);
					}
				}; break;

				case "x": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateXSVG(cellX, cellY, gate.name, selected);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = qWireY(bottomWire);
					}

				}; break;

				case "dot": {
					var cellX = getCellX(colIndex);
					var cellY = getCellY(wire);

					svg = svg + gateDotSVG(cellX, cellY, gate.name, selected);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = qWireY(bottomWire) + dotRadius;
					}
				}; break;

				case "gauge": {
					var gateX = getCellX(colIndex);
					var gateY = getCellY(wire);

					svg = svg + gateGaugeSVG(gateX, gateY, gate.name, selected);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + cellHeight;
					}
				}; break;
			}
/*
			// params
			if(gate.options && gate.options.params && connector == gate.wires.length - 1) {
				var gateX = getCellX(colIndex);
				var gateY = getCellY(wire);
				var centerX = gateX + (cellWidth / 2);
				var gateHeight = (cellHeight * 0.8);

				var paramsStr = "";
				for(var paramName in gate.options.params) {
					if(paramsStr) {
						paramsStr += ", ";
					}
					paramsStr += gate.options.params[paramName];
				}
				svg += "<text class=\"qc-gate-params\" x=\"" + centerX + "\" y=\"" + (gateY + gateHeight + wireTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + paramsStr + "</text>";
			}
*/
		});

		// measure
		if(gate.name == "measure" && gate.options && gate.options.creg && gate.options.creg.name) {
			var linkX = getCellX(colIndex) + (cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.creg.name);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX - (cArrowSize / 2)) + "\" y1=\"" + (linkY2 - cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" stroke-width=\"1\" />";
			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX + (cArrowSize / 2)) + "\" y1=\"" + (linkY2 - cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<text class=\"qc-wire-label\" x=\"" + linkX + "\" y=\"" + (linkY2 + wireTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">" + gate.options.creg.bit + "</text>";
		}

		// controlled by classic register
		if(gate.options && gate.options.condition && gate.options.condition.creg) {
			var linkX = getCellX(colIndex) + (cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.condition.creg);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<circle class=\"qc-gate-dot-c\" cx=\"" + linkX + "\" cy=\"" + linkY2 + "\" r=\"" + dotRadius + "\" stroke=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" fill=\"" + (selected ? cWireSelectedColor : cWireColor) + "\" stroke-width=\"1\" />";

			svg += "<text class=\"qc-wire-label\" x=\"" + linkX + "\" y=\"" + (linkY2 + wireTextHeight) + "\" dominant-baseline=\"hanging\" text-anchor=\"middle\" font-size=\"75%\">== " + gate.options.condition.value + "</text>";
		}

		svg += "</g>";

		return svg;
	}

	function drawGatePlaceholder(colIndex, wire) {
		var gateWidth = cellWidth + hSpacing;
		var gateHeight = cellHeight + vSpacing;
		var gateX = getCellX(colIndex) - hSpacing;
		var gateY = getCellY(wire) - vSpacing;

		if(wire == numRows) {
			gateHeight = vSpacing;
		}

		if(colIndex == numCols) {
			gateWidth = hSpacing;
		}

		svg += "<rect class=\"qc-gate-placeholder\" data-row=\"" + wire + "\" data-col=\"" + colIndex + "\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"none\" fill=\"transparent\" stroke-width=\"0\" />";
	}

	function drawGateHandle(gate, colIndex, wire) {
		var gateWidth = cellWidth;
		var gateHeight = cellHeight;
		var gateX = getCellX(colIndex);
		var gateY = getCellY(wire);

		svg += "<rect class=\"qc-gate-handle\" data-id=\"" + gate.id + "\" data-gate=\"" + gate.name + "\" data-row=\"" + wire + "\" data-col=\"" + colIndex + "\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"none\" fill=\"transparent\" stroke-width=\"0\" />";
	}


	function escapeHtml(str) {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

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
						// Draw "swap" gate as box
						if(connector == "x") {
							connector = "box";
						}

						if(gateName == "ms") {
							gateLabel = "XX";
						}

						if(gateName == "yy") {
							gateLabel = "YY";
						}
					}

					var uniqStr = gateLabel + "|" + connector;

					if(uniq.indexOf(uniqStr) < 0 && gateName != "ccx") {
						uniq.push(uniqStr);

						var svg = "";
						if(!embedded) {
							svg += "<?xml version=\"1.0\"?>";
							svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
						}
						svg += "<svg class=\"qc-gate-gallery-item\" data-gate=\"" + escapeHtml(gateName) + "\" data-content=\"" + escapeHtml(gate.description) + "\" width=\"" + cellWidth + "\" height=\"" + cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
						svg = svg + gateSVG(0, 0, gateName, gateLabel, connector, !!options.gateGallery, false);
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
			var svg = "";
			if(!embedded) {
				svg += "<?xml version=\"1.0\"?>";
				svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
			}
			svg += "<svg class=\"qc-gate-gallery-item\" data-gate=\"dot\" data-content=\"Control\" width=\"" + cellWidth + "\" height=\"" + cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
			svg = svg + gateSVG(0, 0, "dot", "dot", "dot", !!options.gateGallery, false);
			svg += "</svg>";

			if(options.gateGallery) {
				gateList.push(svg);
			} else {
				gateList.push({ name: "dot", svg: svg });
			}
		}


		// custom gates
		if(options.customGateGallery) {
			for(var gateName in this.customGates) {
				var svg = "";
				if(!embedded) {
					svg += "<?xml version=\"1.0\"?>";
					svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
				}
				svg += "<svg class=\"qc-custom-gate-gallery-item\" data-gate=\"" + gateName + "\" width=\"" + (cellWidth * 2) + "\" height=\"" + cellHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";
				svg = svg + gateSVG(0, 0, gateName, gateName, "rect", false, false);
				svg += "</svg>";
				gateList.push(svg);
			}
		}

		return gateList;
	} else {
		var svg = "";
		if(!embedded) {
			svg += "<?xml version=\"1.0\"?>";
			svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
		}

		svg += "<svg class=\"qc-circuit\" width=\"" + totalWidth + "\" height=\"" + totalHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

		if(options.placeholders) {
			for(var column = 0; column <= numCols; column++) {
				for(var wire = 0; wire <= this.numQubits; wire++) {
					drawGatePlaceholder(column, wire);
				}
			}
		}

		for(var wire = 0; wire < numRows; wire++) {
			var wireY = qWireY(wire);
			var initSymbol = "0";
			if(options.customGate) {
				initSymbol = qubitLetter(wire, numRows);
			}
			svg += "<text class=\"qc-wire-init\" x=\"0\" y=\"" + wireY + "\" dominant-baseline=\"middle\" text-anchor=\"start\">|" + initSymbol + "&#x027E9;</text>";
			svg += "<line class=\"qc-wire\" x1=\"" + wireMargin + "\" x2=\"" + totalWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + wireColor + "\" stroke-width=\"" + wireWidth + "\" />";
			svg += "<text class=\"qc-wire-label\" x=\"" + wireMargin + "\" y=\"" + (wireY - (wireTextHeight*2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"start\" font-size=\"75%\">q" + wire + "</text>";
		}

		for(var cregName in this.cregs) {
			var wireY = cWireY(cregName);
			svg += "<text class=\"qc-wire-init\" x=\"0\" y=\"" + wireY + "\" dominant-baseline=\"middle\" text-anchor=\"start\">0</text>";
			svg += "<line class=\"qc-wire-c\" x1=\"" + wireMargin + "\" x2=\"" + totalWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + cWireColor + "\" stroke-width=\"" + wireWidth + "\" />";
			svg += "<text class=\"qc-wire-label\" x=\"" + wireMargin + "\" y=\"" + (wireY - (wireTextHeight * 2)) + "\" dominant-baseline=\"hanging\" text-anchor=\"start\" font-size=\"75%\">" + cregName + "</text>";
		}

		for(var column = 0; column < numCols; column++) {
			for(var wire = 0; wire < this.numQubits; wire++) {
				var gate = this.getGateAt(column, wire);
				if(gate) {
					if(gate.connector == 0) {
						svg += drawGate(gate, column, wire);
					}
				}
			}
		}

		for(var column = 0; column < numCols; column++) {
			for(var wire = 0; wire < this.numQubits; wire++) {
				var gate = this.getGateAt(column, wire);
				if(gate) {
					if(options.placeholders) {
						drawGateHandle(gate, column, wire);
					}
				}
			}
		}

		svg += "</svg>";

	}

	return svg;
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
//     onGate: function(column, wire, gateCounter) { ... },
//     onColumn: function(column) { ... }
//   }
//
QuantumCircuit.prototype.run = function(initialValues, options) {
	options = options || {};

	this.measureResetsQubit = !!options.strictMode;

	if(!options.continue) {
		this.initState();
		this.stats.duration = 0;
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

QuantumCircuit.prototype.stateAsArray = function(onlyPossible, skipItems, blockSize) {
	state = [];

	var numAmplitudes = this.numAmplitudes();

	skipItems = skipItems || 0;
	blockSize = blockSize || (onlyPossible ? this.numAmplitudes(onlyPossible) : numAmplitudes);

	var count = 0;
	for(var i = 0; i < numAmplitudes; i++) {
		var amplitude = math.round(this.state[i] || math.complex(0, 0), 14);
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

				state.push({
					index: i,
					indexBinStr: indexBinStr,
					amplitude: amplitude,
					amplitudeStr: amplitudeStr,
					magnitude: magnitude,
					chance: chance,
					chanceStr: chanceStr
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
QuantumCircuit.prototype.measureAll = function(force) {
	if(this.collapsed && this.collapsed.length == this.numQubits && !force) {
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
// This function simulates measurement of all qubits on current state vector, without modifying state, multiple times
//   Returns object (dictionary) with measured values (binary) as keys and counts as values
//   For example, 1024 shots on bell state will return something like: { "00": 514, "11": 510 }
//
QuantumCircuit.prototype.measureAllMultishot = function(shots) {
	shots = shots || 1;

	var counts = {};

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
};


QuantumCircuit.prototype.measure = function(wire, creg, cbit, force) {
	if(force || !this.collapsed || this.collapsed.length != this.numQubits) {
		this.measureAll(force);
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
				colVal = math.complex(colVal.re, colVal.im * -1);
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
			var col = insertBit(base, qpos, el & 1 ? 1 : 0);
			var row = insertBit(base, qpos, el & 2 ? 1 : 0);
			var rowVal = this.state[row] || math.complex(0, 0);
			var colVal = this.state[col] || math.complex(0, 0);
			if(rowVal && colVal) {
				trace[el] = math.add(trace[el], math.multiply(rowVal, math.complex(colVal.re, colVal.im * -1.0)));
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

		var theta = math.multiply(2, math.acos(alpha));

		var phi = 0;

		if(!(beta.re == 0 && beta.im == 0)) {
			phi = math.multiply(math.complex(0, -1), math.log(math.multiply(beta, math.csc(math.divide(theta, 2))))).re;
		}

		angles[wire].theta = math.round(math.abs(theta), 12);
		angles[wire].phi = math.round(phi, 12);
		angles[wire].thetaDeg = math.round(math.multiply(math.abs(theta), (180 / math.pi)), 7);
		angles[wire].phiDeg = math.round(math.multiply(phi, (180 / math.pi)), 7);
	}

	return angles;
};

QuantumCircuit.prototype.randomCircuit = function(numQubits, numGates, options) {
	this.init(numQubits);

	options = options || {};

	var gates = (options.useGates && options.useGates.length) ? options.useGates : Object.keys(this.basicGates);

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

				var options = {};

				// gate params
				if(gate.params && gate.params.length) {
					var params = {};
					gate.params.map(function(paramName) {
						var fracPi = Math.floor(Math.random() * 8) + 1;
						params[paramName] = Math.PI / fracPi;
					});
					options.params = params;
				}

				if(gateName == "measure") {
					// measurement destination
					options.creg = {
						name: "c",
						bit: gateWires[0]
					};
				} else {
					// maybe add condition
					if(Math.floor(Math.random() * 4) == 0) {
						var cregBits = this.cregTotalBits();
						if(cregBits) {
							options.condition = {
								creg: "c",
								value: Math.floor(Math.random() * (math.pow(2, cregBits)))
							};
						}
					}
				}

				this.appendGate(gateName, gateWires, options);
				gateCount++;
			}
		}
	}
};

module.exports = QuantumCircuit;
