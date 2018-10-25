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


var randomString = function(len) {
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

var formatComplex2 = function(re, im) {
	var re = math.round(re, 8);
	var im = math.round(im, 8);
	return (re >= 0 ? " " : "-") + math.abs(re).toFixed(8) + (im >= 0 ? "+" : "-") + math.abs(im).toFixed(8) + "i";
};

var formatComplex = function(complex) {
	return formatComplex2(complex.re, complex.im);
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
				label: "..."
			},
			exportInfo: {
				quil: {
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
				connectors: ["not"],
				label: "X"
			},
			exportInfo: {
				quil: {
					name: "X"
				}
			}
		},

		y: {
			description: "Pauli Y (PI rotation over Y-axis)",
			matrix: [
				[0,"multiply(-1, i)"],
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
				}
			}
		},

		h: {
			description: "Hadamard gate",
			matrix: [
				["1 / sqrt(2)","1 / sqrt(2)"],
				["1 / sqrt(2)","0 - (1 / sqrt(2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "H"
			},
			exportInfo: {
				quil: {
					name: "H"
				}
			}
		},

		srn: {
			description: "Square root of NOT",
			matrix: [
				["1 / sqrt(2)","-1 / sqrt(2)"],
				["-1 / sqrt(2)","1 / sqrt(2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: ""
			},
			exportInfo: {

			}
		},

		r2: {
			description: "PI/2 rotation over Z-axis aka \"Phase PI/2\"",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, PI / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "R2"
			},
				
			exportInfo: {
				quil: {
					replacement: {
						name: "s"
					}
				}
			}
		},

		r4: {
			description: "PI/4 rotation over Z-axis aka \"Phase PI/4\"",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, PI / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "R4"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "t"
					}
				}
			}
		},

		r8: {
			description: "PI/8 rotation over Z-axis aka \"Phase PI/8\"",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, PI / 8))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "R8;"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "rz",
						params: {
							phi: "pi/8"
						}
					}
				}				
			}
		},

		rx: {
			description: "Rotation around the X-axis by given angle",
			matrix: [
				["cos(theta / 2)", "multiply(-i, sin(theta / 2))"],
				["multiply(-i, sin(theta / 2))", "cos(theta / 2)"]
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
				}
			}
		},

		ry: {
			description: "Rotation around the Y-axis by given angle",
			matrix: [
				["cos(theta / 2)", "multiply(-1, sin(theta / 2))"],
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
				}
			}
		},

		rz: {
			description: "Rotation around the Z-axis by given angle",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, phi))"]
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
				}
			}
		},

		u1: {
			description: "1-parameter 0-pulse single qubit gate",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, lambda))"]
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
				}
			}
		},

		u2: {
			description: "2-parameter 1-pulse single qubit gate",
			matrix: [
				["1 / sqrt(2)", "pow(-e, multiply(i, lambda)) / sqrt(2)"],
				["pow(e, multiply(i, phi)) / sqrt(2)", "pow(e, multiply(i, lambda) + multiply(i, phi)) / sqrt(2)"]
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
				}
			}
		},

		u3: {
			description: "3-parameter 2-pulse single qubit gate",
			matrix: [
				["cos(theta / 2)", "pow(-e, multiply(i, lambda)) * sin(theta / 2)"],
				["pow(e, multiply(i, phi)) * sin(theta / 2)", "pow(e, multiply(i, lambda) + multiply(i, phi)) * cos(theta / 2)"]
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
				}
			}
		},

		s: {
			description: "PI/2 rotation over Z-axis (synonym for `r2`)",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, PI / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S"
			},
			exportInfo: {
				quil: {
					name: "S"
				}
			}
		},

		t: {
			description: "PI/4 rotation over Z-axis (synonym for `r4`)",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, PI / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T"
			},
			exportInfo: {
				quil: {
					name: "T"
				}
			}
		},

		sdg: {
			description: "(-PI/2) rotation over Z-axis",
			matrix: [
				[1,0],
				[0,"pow(e, multiply(i, (-1 * PI) / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "-S"
			},
			exportInfo: {
				quil: {
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
				[0,"pow(e, multiply(i, (-1 * PI) / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "-T"
			},
			exportInfo: {
				quil: {
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
				label: ""
			},
			exportInfo: {
				quil: {
					name: "SWAP"
				}
			}
		},

		srswap: {
			description: "Square root of swap",
			matrix: [
				[1,0,0,0],
				[0,"multiply(0.5, add(1, i))","multiply(0.5, subtract(1, i))",0],
				[0,"multiply(0.5, subtract(1, i))","multiply(0.5, add(1, i))",0],
				[0,0,0,1]
			],
			params: [],
			drawingInfo: {
				connectors: ["box","box"],
				label: ""
			},
			exportInfo: {
				
			}
		},

		cx: {
			description: "Controlled Pauli X (PI rotation over X-axis) aka \"CNOT\" gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,0,1],
				[0,0,1,0]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","not"],
				label: "X"
			},
			exportInfo: {
				quil: {
					name: "CNOT"
				}
			}
		},

		cy: {
			description: "Controlled Pauli Y (PI rotation over Y-axis)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,0,"multiply(-1, i)"],
				[0,0,"i",0]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Y"
			},
			exportInfo: {
				
			}
		},

		cz: {
			description: "Controlled Pauli Z (PI rotation over Z-axis)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,-1]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "Z"
			},
			exportInfo: {
				quil: {
					name: "CZ"
				}
			}
		},

		ch: {
			description: "Controlled Hadamard gate",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,"1 / sqrt(2)","1 / sqrt(2)"],
				[0,0,"1 / sqrt(2)","0 - (1 / sqrt(2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "H"
			},
			exportInfo: {
				
			}
		},

		csrn: {
			description: "Controlled square root of NOT",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,"1 / sqrt(2)","-1 / sqrt(2)"],
				[0,0,"-1 / sqrt(2)","1 / sqrt(2)"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: ""
			},
			exportInfo: {
				
			}
		},

		cr2: {
			description: "Controlled PI/2 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, PI / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "R2"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				}				
			}
		},

		cr4: {
			description: "Controlled PI/4 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, PI / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "R4"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				}				
			}
		},

		cr8: {
			description: "Controlled PI/8 rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, PI / 8))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "R8"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/8"
						}
					}
				}				
			}
		},

		crx: {
			description: "Controlled rotation around the X-axis by given angle",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "multiply(-i, sin(theta / 2))" ],
				[ 0, 0, "multiply(-i, sin(theta / 2))", "cos(theta / 2)" ]
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot","not"],
				label: "RX"
			},
			exportInfo: {
				
			}
		},

		cry: {
			description: "Controlled rotation around the Y-axis by given angle",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "multiply(-1, sin(theta / 2))" ],
				[ 0, 0, "sin(theta / 2)", "cos(theta / 2)" ]
  			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "RY"
			},
			exportInfo: {
				
			}
		},

		crz: {
			description: "Controlled rotation around the Z-axis by given angle",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, phi))"]
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "RZ"
			},
			exportInfo: {
				quil: {
					name: "CPHASE",
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
				[0,0,0,"pow(e, multiply(i, lambda))"]
			],
			params: ["lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU1"
			},
			exportInfo: {
				quil: {
					name: "CPHASE",
					params: ["lambda"]
				}
			}
		},

		cu2: {
			description: "Controlled 2-parameter 1-pulse single qubit gate",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "1 / sqrt(2)", "pow(-e, multiply(i, lambda)) / sqrt(2)" ],
				[ 0, 0, "pow(e, multiply(i, phi)) / sqrt(2)", "pow(e, multiply(i, lambda) + multiply(i, phi)) / sqrt(2)" ]
			],
			params: ["phi", "lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU2"
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
				}
			}
		},

		cu3: {
			description: "Controlled 3-parameter 2-pulse single qubit gate",
			matrix: [
				[ 1, 0, 0, 0 ],
				[ 0, 1, 0, 0 ],
				[ 0, 0, "cos(theta / 2)", "pow(-e, multiply(i, lambda)) * sin(theta / 2)" ],
				[ 0, 0, "pow(e, multiply(i, phi)) * sin(theta / 2)", "pow(e, multiply(i, lambda) + multiply(phi, lambda)) * cos(theta / 2)" ]
			],
			params: ["theta", "phi", "lambda"],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "CU3"
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
				}
			}
		},

		cs: {
			description: "Controlled PI/2 rotation over Z-axis (synonym for `cr2`)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, PI / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "S"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/2"
						}
					}
				}				
			}
		},

		ct: {
			description: "Controlled PI/4 rotation over Z-axis (synonym for `cr4`)",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, PI / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "T"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "pi/4"
						}
					}
				}				
			}
		},

		csdg: {
			description: "Controlled (-PI/2) rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, (-1 * PI) / 2))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "-S"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/2"
						}
					}
				}				
			}
		},

		ctdg: {
			description: "Controlled (-PI/4) rotation over Z-axis",
			matrix: [
				[1,0,0,0],
				[0,1,0,0],
				[0,0,1,0],
				[0,0,0,"pow(e, multiply(i, (-1 * PI) / 4))"]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box"],
				label: "-T"
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "crz",
						params: {
							phi: "-pi/4"
						}
					}
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
				label: "CCNOT"
			},
			exportInfo: {
				quil: {
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
				label: ""
			},
			exportInfo: {
				
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
				[0,0,0,0,0,"multiply(0.5, add(1, i))","multiply(0.5, subtract(1, i))",0],
				[0,0,0,0,0,"multiply(0.5, subtract(1, i))","multiply(0.5, add(1, i))",0],
				[0,0,0,0,0,0,0,1]
			],
			params: [],
			drawingInfo: {
				connectors: ["dot","box","box"],
				label: ""
			},
			exportInfo: {
				
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
				}
			}
		},
	};

	this.init(numQubits);
};

QuantumCircuit.prototype.init = function(numQubits) {
	this.numQubits = numQubits || 1;
	this.params = [];
	this.customGates = {};
	this.cregs = {};
	this.collapsed = [];
	this.prob = [];

	this.clear();
};

QuantumCircuit.prototype.clear = function() {
	this.gates = [];
	for(var i = 0; i < this.numQubits; i++) {
		this.gates.push([]);
	}
	this.resetState();
};

QuantumCircuit.prototype.resetState = function() {
	// reset state
	this.state = {};
	this.stateBits = 0;

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
	this.stats = {};
};

QuantumCircuit.prototype.initState = function() {
	this.resetState();
	this.state["0"] = math.complex(1, 0);
	this.stateBits = 0;
};

QuantumCircuit.prototype.numAmplitudes = function() {
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
	var id = randomString();
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

			if(options.creg) {
				var existingCreg = this.cregs[options.creg.name] || [];
				var currentValue = existingCreg.length > options.creg.bit ? existingCreg[options.creg.bit] : 0;
				this.setCregBit(options.creg.name, options.creg.bit || 0, currentValue);
			}
		}

		this.gates[wire][column] = gate;
	}
};

QuantumCircuit.prototype.removeGate = function(column, wire) {
	if(!this.gates[wire]) {
		return;
	}

	var gate = this.gates[wire][column];
	if(!gate) {
		return;
	}

	var id = gate.id;

	var numWires = this.gates[0].length;
	for(var wire = 0; wire < numWires; wire++) {
		if(this.gates[wire][column].id == id) {
			this.gates[wire][column] = null;
		}
	}
};

QuantumCircuit.prototype.addMeasure = function(wire, creg, cbit) {
	this.addGate("measure", -1, wire, { creg: { name: creg, bit: cbit } });
};

//
// Ugly but efficient :)
// 
// TODO: 
//   - clean up and add comments
//   - Parallelize/Use GPU

QuantumCircuit.prototype.applyTransform = function(U, qubits) {
	// clone list of wires to itself (remove reference to original array)
	qubits = qubits.slice(0);

	// convert index from 0-based to end-based
	for(var i = 0; i < qubits.length; i++) {
		qubits[i] = (this.numQubits - 1) - qubits[i];
	}
	// reverse order
	qubits.reverse();

	//
	// "incMap" and "fixMap" are instructions about bit-wise operations used to calculate row and column index of destination transform matrix elements
	//
	var incMap = [];
	var fixMap = [];
	var usedCount = 0;
	var unusedCount = 0;
	for(var i = 0; i < this.numQubits; i++) {
		if(qubits.indexOf(i) < 0) {
			incMap.push({ 
				and: 1 << incMap.length,
				or: 1 << i
			});
			unusedCount++;
		} else {
			fixMap.push({ 
				rowAnd: 1 << (fixMap.length + qubits.length), 
				colAnd: 1 << fixMap.length, 
				or: 1 << qubits[fixMap.length]
			});
			usedCount++;
		}
	}

	//
	// "uflat" is flatten transform matrix, only non-zero elements
	//
	uflat = {};
	var unum = 0;
	var uindex = 0;
	U.map(function(urow) {
		urow.map(function(uval) {
			if(uval) {
				var rowOr = 0;
				var colOr = 0;

				var fix = usedCount;
				while(fix--) {
					var fmap = fixMap[fix];
					if(uindex & fmap.rowAnd) {
						rowOr |= fmap.or;
					}
					if(uindex & fmap.colAnd) {
						colOr |= fmap.or;
					}
				}

				uflat[unum] = {
					uval: uval,
					rowOr: rowOr,
					colOr: colOr
				};
				unum++;
			}
			uindex++;
		});
	});

	//
	// main loop
	//
	// current state is multiplied and stored into newState
	var newState = {};
	var newStateBits = 0;
	var incCount = (1 << unusedCount);
	while(incCount--) {
		var row = 0;

		var inc = unusedCount;
		while(inc--) {
			if(incCount & incMap[inc].and) {
				row |= incMap[inc].or;
			}
		}

		if((this.stateBits & row) == row) {
			var ucount = unum;
			while(ucount--) {
				var u = uflat[ucount];

				var j = row | u.colOr;

				var state = this.state[j];

				if(state) {
					var i = row | u.rowOr;
					if(math.equal(u.uval, 1)) {
						newState[i] = math.add(newState[i] || math.complex(0, 0), state);
					} else {
						newState[i] = math.add(newState[i] || math.complex(0, 0), math.multiply(u.uval, state));
					}
					newStateBits |= i;
				}
			}			
		}
	}
	// replace current state with new state
	this.state = newState;
	this.stateBits = newStateBits;
};

QuantumCircuit.prototype.applyGate = function(gateName, wires, options) {
	if(gateName == "measure") {
		if(!options.creg) {
			throw "Error: \"measure\" gate requires destination.";
		}
		this.measure(wires[0], options.creg.name, options.creg.bit);
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
						vars[varName] = params.length > varIndex ? math.eval(params[varIndex]) : null;
					} else {
						vars[varName] = math.eval(params[varName]);
					}
				});

				var ev = math.eval(item, vars);
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
			if(gate && gate.connector == 0 && !(this.basicGates[gate.name] || gate.name == "measure")) {
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
				var gt = this.basicGates[gate.name];
				if(!gt) {
					console.log("Unknown gate \"" + gate.name + "\".");
					return;
				}

				var rawGate = this.getRawGate(gt, gate.options);

				sequence.push({
					name: gate.name,
					matrix: rawGate,
					wires: gate.wires,
					options: gate.options
				});
			}
		}
	}

	var cregs = [];
	for(var creg in this.cregs) {
		cregs.push({
			name: creg,
			len: this.cregs[creg].length || 0
		});
	}

	return {
		qubits: this.numQubits,
		cregs: cregs,
		program: sequence
	};
}

QuantumCircuit.prototype.save = function(decompose) {
	var data = {
		numQubits: this.numQubits,
		params: JSON.parse(JSON.stringify(this.params)),
		gates: JSON.parse(JSON.stringify(this.gates)),
		customGates: JSON.parse(JSON.stringify(this.customGates))
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
};

QuantumCircuit.prototype.registerGate = function(name, obj) {
	this.customGates[name] = obj;
};

QuantumCircuit.prototype.getGateAt = function(column, wire) {
	if(!this.gates[wire] || !this.gates[wire][column]) {
		return null;
	}

	var gate = JSON.parse(JSON.stringify(this.gates[wire][column]));
	if(!gate) {
		return null;
	}
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

QuantumCircuit.prototype.exportQASM = function(comment, decompose, exportAsGateName) {
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
		for(var i = 0; i < circuit.numQubits; i++) {
			if(i == 0) {
				qasm += " ";
			}
			if(i > 0) {
				qasm += ",";
			}
			qasm += String.fromCharCode(97 + i);
		}
		qasm += "\n{\n";
	} else {
		qasm += "OPENQASM 2.0;\n";
		qasm += "include \"qelib1.inc\";\n";
		qasm += "qreg q[" + circuit.numQubits + "];\n";

		for(var cregName in this.cregs) {
			qasm += "creg " + cregName + "[" + (this.cregs[cregName].length || 1) + "];\n";
		}

		if(!decompose) {
			for(var customGateName in this.customGates) {
				var customGate = this.customGates[customGateName];
				var customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				qasm += customCircuit.exportQASM("", true, customGateName);
			}
		}
	}

	var numCols = circuit.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(exportAsGateName) {
					qasm += "  ";
				}

				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					qasm += "if(" + gate.options.condition.creg + "==" + gate.options.condition.value + ") ";
				}

				qasm += gate.name;

				if(gate.options && gate.options.params) {
					var gateDef = this.basicGates[gate.name];
					if(!gateDef) {
						gateDef = this.customGates[gate.name];
					}

					if(gateDef) {
						var paramDef = gateDef.params || [];
						var paramCount = paramDef.length;
						if(paramCount) {
							qasm += " (";
							for(var p = 0; p < paramCount; p++) {
								var paramName = paramDef[p];
								qasm += gate.options.params[paramName];
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
						qasm += " " + String.fromCharCode(97 + gate.wires[w]);
					} else {
						qasm += " q[" + gate.wires[w] + "]";
					}
				}

				if(gate.name == "measure" && gate.options && gate.options.creg) {
					qasm += " -> ";
					qasm += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
				}

				qasm += ";\n";
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


QuantumCircuit.prototype.exportPyquil = function(comment, decompose, exportAsGateName, versionStr) {
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
	var gotConditions = false;
	for(var column = 0; column < circuit.numCols(); column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					gotConditions = true;
				}
			}
		}
	}
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
		importsForDefgate = "from pyquil.parameters import Parameter, quil_sin, quil_cos, quil_sqrt, quil_exp, quil_cis\nfrom pyquil.quilbase import DefGate";
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

		pyquil += "from pyquil.gates import " + importGates + "\n";
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

		if(!decompose) {
			for(var customGateName in circuit.customGates) {
				var customGate = circuit.customGates[customGateName];
				var customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				pyquil += customCircuit.exportPyquil("", false, customGateName, versionStr);
				defCircNames.push(customGateName);
			}
		}
	}

	var mathToStringHandler = function(node, options) {
		if(node.isSymbolNode) {
			if(node.name == "pi") {
				return "np.pi";
			}
		}
	};

	pyquil += indent + "p = Program()\n\n";

	if(version >= 2 && !exportAsGateName) {
		var totalBits = circuit.cregTotalBits();
		if(gotConditions) {
			totalBits += 1;
		};
		if(totalBits) {
			pyquil += "ro = p.declare('ro', memory_type='BIT', memory_size='" + totalBits + "')\n";
			pyquil += "\n";
		}
	}

	pyquil += defRun ? (defRun + "\n") : "";

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
									pyquil += indent + "p.inst(IOR(ro[" + (bitIndex + cregBase) + "], ro[" + testBit + "]))\n";
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
												pyquil += indent + "p.inst(IOR(ro[" + (bitIndex + cregBase) + "], ro[" + testBit + "]))\n";
											} else {
												pyquil += indent + "p.inst(AND(ro[" + (bitIndex + cregBase) + "], ro[" + testBit + "]))\n";
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
							var node = math.parse(gateParams[quilInfo.params[p]]);
							pyquil += node.toString({ handler: mathToStringHandler });
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
								var node = math.parse(gateParams[gateDef.params[p]]);
								pyquil += node.toString({ handler: mathToStringHandler });
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
							if(argCount > 0) {
								pyquil += ", ";
							}

							if(version < 2) {
								pyquil += (gate.options.creg.bit + self.cregBase(gate.options.creg.name));
							} else {
								pyquil += "ro[" + (gate.options.creg.bit + self.cregBase(gate.options.creg.name)) + "]";
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
			pyquil += "qvm = get_qc('9q-generic-qvm')\n";
			pyquil += "print(qvm.run(p))\n";
		}
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

	var gotConditions = false;
	for(var column = 0; column < circuit.numCols(); column++) {
		for(var wire = 0; wire < circuit.numQubits; wire++) {
			var gate = circuit.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				if(gate.options && gate.options.condition && gate.options.condition.creg) {
					gotConditions = true;
				}
			}
		}
	}

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

		if(!decompose) {
			for(var customGateName in circuit.customGates) {
				var customGate = circuit.customGates[customGateName];
				var customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				quil += customCircuit.exportQuil("", false, customGateName);
			}
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
							var node = math.parse(gateParams[quilInfo.params[p]]);
							quil += node.toString({ handler: mathToStringHandler });
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
								var node = math.parse(gateParams[gateDef.params[p]]);
								quil += node.toString({ handler: mathToStringHandler });
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
						if(argCount > 0) {
							quil += " ";
						}

						if(version < 2) {
							quil += "[" + (gate.options.creg.bit + self.cregBase(gate.options.creg.name)) + "]";
						} else {
							quil += "ro[" + (gate.options.creg.bit + self.cregBase(gate.options.creg.name)) + "]";
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

QuantumCircuit.prototype.exportQuirk = function(decompose) {
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

			if(!gate || gate.name == "measure") {
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
		for(var customGateName in circuit.customGates) {
			var customGate = circuit.customGates[customGateName];
			var customCircuit = new QuantumCircuit();
			customCircuit.load(customGate);
			quirk.gates.push({
				id: "~" + customGateName,
				circuit: customCircuit.exportQuirk(true)
			});
		}
	}

	return quirk;
};


QuantumCircuit.prototype.exportSVG = function(embedded) {
	var self = this;
	var cellWidth = 40;
	var cellHeight = 40;
	var hSpacing = 20;
	var vSpacing = 20;
	var blackboxPaddingX = 2;
	var blackboxPaddingY = 2;
	var blackboxLineColor = "black";
	var wireColor = "black";
	var gateLineColor = "black";
	var cWireColor = "silver";
	var cArrowSize = 10;
	var wireWidth = 1;
	var dotRadius = 5;

	var cregIndex = function(name) {
		var cregIndex = 0;
		for(var cregName in self.cregs) {
			if(cregName == name) {
				return cregIndex;
			}
			cregIndex++;
		}
		return cregIndex;
	};

	var cregCount = function() {
		var cregCount = 0;
		for(var cregName in self.cregs) {
			cregCount++;
		}
		return cregCount;
	};

	var numRows = this.numQubits;
	var numCols = this.numCols();
	var numCregs = cregCount();

	var totalWidth = ((cellWidth + hSpacing) * numCols) + hSpacing;
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

	qWireY = function(wire) {
		return ((cellHeight + vSpacing) * wire) + (vSpacing + (cellHeight / 2))
	};

	qGateY = function(wire) {
		return ((cellHeight + vSpacing) * wire) + vSpacing
	};

	cWireY = function(cregName) {
		return ((cellHeight + vSpacing) * (numRows + cregIndex(cregName))) + (vSpacing + (cellHeight / 2))
	};

	function drawGate(gate, colIndex, rowIndex) {
		var dinfo = self.basicGates[gate.name] ? self.basicGates[gate.name].drawingInfo : null;
		var blackbox = false;
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
		svg += "<g class=\"qc-gate-group\">";
		if(blackbox) {
			var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) - blackboxPaddingX;
			var gateY = qGateY(topWire) - blackboxPaddingY;
			var gateWidth = cellWidth + (2 * blackboxPaddingX);
			var gateHeight = ((qGateY(bottomWire) + cellHeight) - gateY) + blackboxPaddingY;

			cLinkTopY = gateY + gateHeight;

			svg += "<rect class=\"qc-gate-blackbox\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + blackboxLineColor + "\" fill=\"transparent\" stroke-width=\"1\" />";
		}

		// link
		if(topWire != bottomWire && !blackbox) {
			var linkX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (cellWidth / 2);
			var linkY1 = (((cellHeight + vSpacing) * topWire) + vSpacing) + (cellHeight / 2);
			var linkY2 = (((cellHeight + vSpacing) * bottomWire) + vSpacing) + (cellHeight / 2);
			svg += "<line class=\"qc-gate-link\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + wireColor + "\" stroke-width=\"1\" />";
		}

		// connectors
		gate.wires.map(function(wire, connector) {

			switch(dinfo.connectors[connector]) {
				case "box": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = ((cellWidth + hSpacing) * colIndex) + hSpacing;
					var gateY = ((cellHeight + vSpacing) * wire) + vSpacing;

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + gateHeight;
					}

					svg += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + gateLineColor + "\" fill=\"white\" stroke-width=\"1\" />";
					svg += "<text class=\"qc-gate-label\" x=\"" + (gateX + (gateWidth / 2)) + "\" y=\"" + (gateY + (gateHeight / 2)) + "\" alignment-baseline=\"middle\" text-anchor=\"middle\">" + (blackbox ? String.fromCharCode(97 + connector) : (dinfo.label || gate.name)) + "</text>";
				}; break;

				case "not": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = ((cellWidth + hSpacing) * colIndex) + hSpacing;
					var gateY = ((cellHeight + vSpacing) * wire) + vSpacing;
					var centerX = gateX + (gateWidth / 2);
					var centerY = gateY + (gateHeight / 2);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + gateHeight;
					}

					svg += "<ellipse class=\"qc-gate-not\" cx=\"" + centerX + "\" cy=\"" + centerY + "\" rx=\"" + (gateWidth / 2) + "\" ry=\"" + (gateHeight / 2) + "\" stroke=\"" + gateLineColor + "\" fill=\"white\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-not-line\" x1=\"" + centerX + "\" x2=\"" + centerX + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + gateLineColor + "\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-not-line\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + centerY +"\" y2=\"" + centerY + "\" stroke=\"" + gateLineColor + "\" stroke-width=\"1\" />";
				}; break;

				case "x": {
					var gateWidth = cellWidth / 2;
					var gateHeight = cellWidth / 2;
					var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (gateWidth / 2);
					var gateY = (((cellHeight + vSpacing) * wire) + vSpacing) + (gateHeight / 2);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = cWireY(bottomWire);
					}

					svg += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + gateY +"\" y2=\"" + (gateY + gateHeight) + "\" stroke=\"" + gateLineColor + "\" stroke-width=\"1\" />";

					svg += "<line class=\"qc-gate-x\" x1=\"" + gateX + "\" x2=\"" + (gateX + gateWidth) + "\" y1=\"" + (gateY + gateHeight) +"\" y2=\"" + gateY + "\" stroke=\"" + gateLineColor + "\" stroke-width=\"1\" />";
				}; break;

				case "dot": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (gateWidth / 2);
					var gateY = (((cellHeight + vSpacing) * wire) + vSpacing) + (gateHeight / 2);

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = cWireY(bottomWire) + dotRadius;
					}

					svg += "<circle class=\"qc-gate-dot\" cx=\"" + gateX + "\" cy=\"" + gateY + "\" r=\"" + dotRadius + "\" stroke=\"" + wireColor + "\" fill=\"" + wireColor + "\" stroke-width=\"1\" />";
				}; break;

				case "gauge": {
					var gateWidth = cellWidth;
					var gateHeight = cellWidth;
					var gateX = ((cellWidth + hSpacing) * colIndex) + hSpacing;
					var gateY = ((cellHeight + vSpacing) * wire) + vSpacing;
					var centerX = gateX + (gateWidth / 2);
					var centerY = gateY + (gateHeight / 2);
					var movedown = gateHeight / 5;

					if(!blackbox && wire == bottomWire) {
						cLinkTopY = gateY + gateHeight;
					}

					svg += "<rect class=\"qc-gate-box\" x=\"" + gateX + "\" y=\"" + gateY + "\" width=\"" + gateWidth + "\" height=\"" + gateHeight + "\" stroke=\"" + gateLineColor + "\" fill=\"white\" stroke-width=\"1\" />";
					svg += "<path class=\"gc-gate-gauge-arc\" d=\"" + describeArc(centerX, centerY + movedown, gateWidth / 2.3, 300, 60) + "\" stroke=\"" + gateLineColor + "\" fill=\"none\" stroke-width=\"1\" />";
					svg += "<line class=\"qc-gate-gauge-scale\" x1=\"" + centerX + "\" x2=\"" + ((gateX + gateWidth) - movedown) + "\" y1=\"" + (centerY + movedown) + "\" y2=\"" + (gateY + movedown) + "\" stroke=\"" + gateLineColor + "\" stroke-width=\"1\" />";
				}; break;

			}
		});

		// measure
		if(gate.name == "measure" && gate.options && gate.options.creg && gate.options.creg.name) {
			var linkX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.creg.name);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + cWireColor + "\" stroke-width=\"1\" />";

			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX - (cArrowSize / 2)) + "\" y1=\"" + (linkY2 - cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + cWireColor + "\" stroke-width=\"1\" />";
			svg += "<line class=\"qc-gate-link-c\" x2=\"" + linkX + "\" x1=\"" + (linkX + (cArrowSize / 2)) + "\" y1=\"" + (linkY2 - cArrowSize) +"\" y2=\"" + linkY2 + "\" stroke=\"" + cWireColor + "\" stroke-width=\"1\" />";
		}

		// controlled by classic register
		if(gate.options && gate.options.condition && gate.options.condition.creg) {
			var linkX = (((cellWidth + hSpacing) * colIndex) + hSpacing) + (cellWidth / 2);
			var linkY1 = cLinkTopY;
			var linkY2 = cWireY(gate.options.condition.creg);

			svg += "<line class=\"qc-gate-link-c\" x1=\"" + linkX + "\" x2=\"" + linkX + "\" y1=\"" + linkY1 +"\" y2=\"" + linkY2 + "\" stroke=\"" + cWireColor + "\" stroke-width=\"1\" />";

			svg += "<circle class=\"qc-gate-dot-c\" cx=\"" + linkX + "\" cy=\"" + linkY2 + "\" r=\"" + dotRadius + "\" stroke=\"" + cWireColor + "\" fill=\"" + cWireColor + "\" stroke-width=\"1\" />";
		}

		svg += "</g>";

		return svg;
	}

	var svg = "";
	if(!embedded) {
		svg += "<?xml version=\"1.0\"?>";
		svg +="<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">";
	}

	svg += "<svg class=\"qc-circuit\" width=\"" + totalWidth + "\" height=\"" + totalHeight + "\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\">";

	for(var wire = 0; wire < numRows; wire++) {
		var wireY = qWireY(wire);
		svg += "<line class=\"qc-wire\" x1=\"0\" x2=\"" + totalWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + wireColor + "\" stroke-width=\"" + wireWidth + "\" />";
	}

	for(var cregName in this.cregs) {
		var wireY = cWireY(cregName);
		svg += "<line class=\"qc-wire-c\" x1=\"0\" x2=\"" + totalWidth + "\" y1=\"" + wireY + "\" y2=\"" + wireY + "\" stroke=\"" + cWireColor + "\" stroke-width=\"" + wireWidth + "\" />";
	}

	var numCols = this.numCols();
	for(var column = 0; column < numCols; column++) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			var gate = this.getGateAt(column, wire);
			if(gate && gate.connector == 0) {
				svg += drawGate(gate, column, wire);
			}
		}
	}
	svg += "</svg>";

	return svg;
};


QuantumCircuit.prototype.run = function(initialValues, options) {
	options = options || {};

	this.initState();

	this.stats.start = new Date();

	if(initialValues) {
		for(var wire = 0; wire < this.numQubits; wire++) {
			if(initialValues[wire]) {
				this.applyGate("x", [wire]);
			}
		}
	}

	var decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));
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
					this.applyGate(gate.name, gate.wires, gate.options);
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

	this.stats.end = new Date();
	this.stats.duration = this.stats.end - this.stats.start;
};

QuantumCircuit.prototype.test = function(name, gates, expectedState) {

	console.log("TEST: " + name);

	this.clear();

	if(!gates || !gates.length) {
		console.log("Invalid input");
		return false;
	}

	for(var i = 0; i < gates.length; i++) {
		var gate = gates[i];
		if(!gate || !gate.length || gate.length < 3) {
			console.log("Invalid input");
			return false;
		}
		this.addGate(gate[0], gate[1], gate[2]);
	}

	this.run();

	var numRes = this.numAmplitudes();
	if(numRes > expectedState.length) {
		console.log("Warning: expected state is incomplette.");
		numRes = expectedState.length;
	}

	var gotError = false;
	for(var i = 0; i < numRes; i++) {
		var expected = expectedState[i];
		var state = this.state[i] || math.complex(0, 0);

		if(math.round(expected[0], 5) != math.round(state.re, 5) || math.round(expected[1], 5) != math.round(state.im, 5)) {
			if(!gotError) {
				gotError = true;
				console.log("ERROR");
			}

			var bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}

			console.log("|" + bin + "> Expected: " + formatComplex2(expected[0], expected[1]) + " Got: " + formatComplex(state));
		}
	}

	console.log(gotError ? "Didn't pass." : "Passed.");
	console.log("");

	return !gotError;
};

QuantumCircuit.prototype.stateAsString = function(onlyPossible) {

	var numAmplitudes = this.numAmplitudes();
	if(!this.state) {
		return "Error: circuit is not initialized. Please call initState() or run() method.";
	}

	var s = "";
	var count = 0;
	for(var i = 0; i < numAmplitudes; i++) {
		var state = this.state[i] || math.complex(0, 0);
		var m = math.round(math.pow(math.abs(state), 2) * 100, 2);
		if(!onlyPossible || m) {
			if(count) { s += "\n"; }

			// binary string
			var bin = i.toString(2);
			while(bin.length < this.numQubits) {
				bin = "0" + bin;
			}

			s += formatComplex(state) + "|" + bin + ">\t" + m + "%";
			count++;
		}
	}
	return s;
};

QuantumCircuit.prototype.print = function(onlyPossible) {
	console.log(this.stateAsString(onlyPossible));
};


QuantumCircuit.prototype.createCreg = function(creg, len) {
	this.cregs[creg] = [];

	// extend register
	while(this.cregs[creg].length < (len || 1)) {
		this.cregs[creg].push(0);
	}
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

QuantumCircuit.prototype.measureAll = function(force) {
	if(this.collapsed && this.collapsed.length == this.numQubits && !force) {
		return this.collapsed;
	}

	function rnd(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	var random_range = (1 << this.numQubits) - 1;

	this.collapsed = [];
	var maxChance = 0;
	for(var is in this.state) {
		var i = parseInt(is);
		var state = this.state[is];
		var chance = 0;
		if(state.re || state.im) {
			chance = math.round(math.pow(math.abs(state), 2), 5);
		}

		if(chance > maxChance || (chance == maxChance && (!this.collapsed.length || !rnd(0, random_range)))) {
			maxChance = chance;
			this.collapsed = [];
			for(var q = this.numQubits - 1; q >= 0; q--) {
				this.collapsed.push(1 << q & i ? 1 : 0);
			}
		}
	}
	return this.collapsed;
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
			var bit = math.pow(2, (this.numQubits - 1) - wire);
			if(i & bit) {
				var state = this.state[is];
				if(state.re || state.im) {
					this.prob[wire] += math.pow(math.abs(state), 2);
				}
			}
		}
	}

	for(var wire = 0; wire < this.numQubits; wire++) {
		this.prob[wire] = math.round(this.prob[wire], 5);
	}
	return this.prob;
};

QuantumCircuit.prototype.probability = function(wire) {
	if(!this.prob || this.prob.length != this.numQubits) {
		this.probabilities();
	}

	return this.prob[wire];
};

module.exports = QuantumCircuit;
