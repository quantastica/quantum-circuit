/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

import * as math from "mathjs";
import * as el from "mathjs";
import {QASMImport} from "./qasm_import/QASMImport.js";

const formatFloat = function (f, options) {
	options = options || {};

	if (options.decimalPlaces) {
		f = math.round(f, options.decimalPlaces);
	}

	let s = f + "";

	if (options.fixedWidth) {
		s = f.toFixed(options.decimalPlaces || 14);
	}

	let plusChar = options.plusChar;
	if (options.fixedWidth && !plusChar) {
		plusChar = " ";
	}

	if (plusChar && f >= 0) {
		s = plusChar + s;
	}

	return s;
};
const formatComplex2 = function (re, im, options) {
	options = options || {};

	const sre = formatFloat(re, options);

	const opt = JSON.parse(JSON.stringify(options));
	opt.plusChar = "+";
	const sim = formatFloat(im, opt);
	return sre + sim + (options.iotaChar ? options.iotaChar : "i");
};


const qubitLetter = function (n, max) {
	let maxN = max || n + 1;

	if (maxN > 0) {
		maxN = maxN - 1;
	}

	let maxLen = maxN.toString(26).length;

	let nStr = n.toString(26);
	while (nStr.length < maxLen) {
		nStr = "0" + nStr;
	}

	let res = "";
	for (let i = 0; i < nStr.length; i++) {
		const code = nStr.charCodeAt(i);
		res += String.fromCharCode(code < 97 ? code + 49 : code + 10);
	}

	return res;
};

export const QuantumCircuit = function QuantumCircuit(numQubits) {
	this.basicGates = {
		id: {
			description: "Single qubit identity gate",
			matrix: [
				[1, 0],
				[0, 1],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "ID",
			},
			exportInfo: {
				quil: {
					name: "I",
				},
				cirq: {
					name: "I",
					notTfqSupported: true,
				},
				quest: {
					name: "compactUnitary",
					params: {
						alpha: "(Complex) { .real = 1, .imag = 0 }",
						beta: "(Complex) {.real = 0, .imag = 0}",
					},
				},
				qsharp: {
					name: "I",
				},
				qiskit: {
					name: "id",
				},
				braket: {
					name: "i",
				},
				aqasm: {
					name: "I",
				},
			},
		},

		x: {
			description: 'Pauli X (PI rotation over X-axis) aka "NOT" gate',
			matrix: [
				[0, 1],
				[1, 0],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "X",
			},
			exportInfo: {
				quil: {
					name: "X",
				},
				cirq: {
					name: "X",
				},
				quest: {
					name: "pauliX",
				},
				qsharp: {
					name: "X",
				},
				quirk: {
					name: "X",
				},
				braket: {
					name: "x",
				},
				aqasm: {
					name: "X",
				},
				ionq: {
					names: ["x", "not"],
				},
			},
		},

		y: {
			description: "Pauli Y (PI rotation over Y-axis)",
			matrix: [
				[0, "-i"],
				["i", 0],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Y",
			},
			exportInfo: {
				quil: {
					name: "Y",
				},
				cirq: {
					name: "Y",
				},
				quest: {
					name: "pauliY",
				},
				qsharp: {
					name: "Y",
				},
				quirk: {
					name: "Y",
				},
				braket: {
					name: "y",
				},
				aqasm: {
					name: "Y",
				},
				ionq: {
					name: "y",
				},
			},
		},

		z: {
			description: "Pauli Z (PI rotation over Z-axis)",
			matrix: [
				[1, 0],
				[0, -1],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z",
			},
			exportInfo: {
				quil: {
					name: "Z",
				},
				cirq: {
					name: "Z",
				},
				quest: {
					name: "pauliZ",
				},
				qsharp: {
					name: "Z",
				},
				quirk: {
					name: "Z",
				},
				braket: {
					name: "z",
				},
				aqasm: {
					name: "Z",
				},
				ionq: {
					name: "z",
				},
			},
		},

		h: {
			description: "Hadamard gate",
			matrix: [
				["1 / sqrt(2)", "1 / sqrt(2)"],
				["1 / sqrt(2)", "-1 / sqrt(2)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "H",
			},
			exportInfo: {
				quil: {
					name: "H",
				},
				cirq: {
					name: "H",
				},
				quest: {
					name: "hadamard",
				},
				qsharp: {
					name: "H",
				},
				quirk: {
					name: "H",
				},
				braket: {
					name: "h",
				},
				aqasm: {
					name: "H",
				},
				ionq: {
					name: "h",
				},
			},
		},

		srn: {
			description: "Square root of NOT",
			matrix: [
				["0.5+0.5i", "0.5-0.5i"],
				["0.5-0.5i", "0.5+0.5i"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "&#x221A;X",
			},
			exportInfo: {
				quil: {
					name: "srn",
					defgate: "DEFGATE srn:\n    0.5+0.5i, 0.5-0.5i\n    0.5-0.5i, 0.5+0.5i",
				},
				pyquil: {
					name: "srn",
					array: "[[0.5+0.5j, 0.5-0.5j], [0.5-0.5j, 0.5+0.5j]]",
				},
				cirq: {
					name: "X**(1/2)",
				},
				quest: {
					name: "unitary",
					matrix: [
						[
							["0.5", "0.5"],
							["0.5", "-0.5"],
						],
						[
							["0.5", "-0.5"],
							["0.5", "0.5"],
						],
					],
				},
				qasm: {
					name: "sx",
				},
				qiskit: {
					name: "sx",
				},
				braket: {
					name: "v",
				},
				aqasm: {
					matrix: [
						["0.5+0.5i", "0.5-0.5i"],
						["0.5-0.5i", "0.5+0.5i"],
					],
					array: "[[0.5+0.5j, 0.5-0.5j], [0.5-0.5j, 0.5+0.5j]]",
				},
				ionq: {
					name: "v",
				},
			},
		},

		srndg: {
			description: "Inverse square root of NOT",
			matrix: [
				["0.5-0.5i", "0.5+0.5i"],
				["0.5+0.5i", "0.5-0.5i"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "&#x221A;X&#8224;",
			},
			exportInfo: {
				quil: {
					name: "srndg",
					defgate: "DEFGATE srndg:\n    0.5-0.5i, 0.5+0.5i\n    0.5+0.5i, 0.5-0.5i",
				},
				pyquil: {
					name: "srndg",
					array: "[[0.5-0.5j, 0.5+0.5j], [0.5+0.5j, 0.5-0.5j]]",
				},
				cirq: {
					name: "X**(-1/2)",
				},
				quest: {
					name: "unitary",
					matrix: [
						[
							["0.5", "-0.5"],
							["0.5", "0.5"],
						],
						[
							["0.5", "0.5"],
							["0.5", "-0.5"],
						],
					],
				},
				qasm: {
					name: "sxdg",
				},
				qiskit: {
					name: "sxdg",
				},
				braket: {
					name: "vi",
				},
				aqasm: {
					matrix: [
						["0.5-0.5i", "0.5+0.5i"],
						["0.5+0.5i", "0.5-0.5i"],
					],
					array: "[[0.5-0.5j, 0.5+0.5j], [0.5+0.5j, 0.5-0.5j]]",
				},
				ionq: {
					name: "vi",
				},
			},
		},

		r2: {
			description: 'PI/2 rotation over Z-axis aka "Phase PI/2"',
			matrix: [
				[1, 0],
				[0, "exp(i * pi / 2)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/2",
			},

			exportInfo: {
				quil: {
					replacement: {
						name: "s",
					},
				},
				cirq: {
					replacement: {
						name: "s",
					},
				},
				quest: {
					name: "sGate",
				},
				qsharp: {
					replacement: {
						name: "s",
					},
				},
				qasm: {
					replacement: [{ name: "s", params: {} }],
				},
				qiskit: {
					replacement: [{ name: "s", params: {} }],
				},
				quirk: {
					name: "Z^½",
				},
				braket: {
					name: "s",
				},
				aqasm: {
					name: "S",
				},
			},
		},

		r4: {
			description: 'PI/4 rotation over Z-axis aka "Phase PI/4"',
			matrix: [
				[1, 0],
				[0, "exp(i * pi / 4)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/4",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "t",
					},
				},
				cirq: {
					replacement: {
						name: "t",
					},
				},
				quest: {
					name: "tGate",
				},
				qsharp: {
					replacement: {
						name: "t",
					},
				},
				qasm: {
					replacement: [{ name: "t", params: {} }],
				},
				qiskit: {
					replacement: [{ name: "t", params: {} }],
				},
				quirk: {
					name: "Z^¼",
				},
				braket: {
					name: "t",
				},
				aqasm: {
					name: "T",
				},
			},
		},

		r8: {
			description: 'PI/8 rotation over Z-axis aka "Phase PI/8"',
			matrix: [
				[1, 0],
				[0, "exp(i * pi / 8)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "Z&#x1D6D1;/8",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				quest: {
					name: "phaseShift",
					params: { theta: "M_PI/8" },
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				qasm: {
					replacement: [{ name: "u1", params: { lambda: "pi/8" } }],
				},
				qiskit: {
					replacement: [{ name: "u1", params: { lambda: "pi/8" } }],
				},
				quirk: {
					name: "Z^⅛",
				},
				braket: {
					name: "phaseshift",
					params: { theta: "pi/8" },
				},
				aqasm: {
					matrix: [
						[1, 0],
						[0, "exp(i * pi / 8)"],
					],
					array: "[[1,0],[0,np.exp(1j * np.pi / 8)]]",
				},
			},
		},

		rx: {
			description: "Rotation around the X-axis by given angle",
			matrix: [
				["cos(theta / 2)", "-i * sin(theta / 2)"],
				["-i * sin(theta / 2)", "cos(theta / 2)"],
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "RX",
			},
			exportInfo: {
				quil: {
					name: "RX",
					params: ["theta"],
				},
				cirq: {
					name: "rx",
					params: ["theta"],
				},
				quest: {
					name: "rotateX",
					params: ["theta"],
				},
				qsharp: {
					name: "Rx",
					params: ["theta"],
				},
				braket: {
					name: "rx",
					params: ["theta"],
				},
				aqasm: {
					name: "RX",
				},
				ionq: {
					name: "rx",
					paramsKey: "rotation",
				},
			},
		},

		ry: {
			description: "Rotation around the Y-axis by given angle",
			matrix: [
				["cos(theta / 2)", "-1 * sin(theta / 2)"],
				["sin(theta / 2)", "cos(theta / 2)"],
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "RY",
			},
			exportInfo: {
				quil: {
					name: "RY",
					params: ["theta"],
				},
				cirq: {
					name: "ry",
					params: ["theta"],
				},
				quest: {
					name: "rotateY",
					params: ["theta"],
				},
				qsharp: {
					name: "Ry",
					params: ["theta"],
				},
				braket: {
					name: "ry",
					params: ["theta"],
				},
				aqasm: {
					name: "RY",
				},
				ionq: {
					name: "ry",
					paramsKey: "rotation",
				},
			},
		},

		rz: {
			description: "Rotation around the Z-axis by given angle",

			matrix: [
				["cos(phi / 2) - i * sin(phi / 2)", 0],
				[0, "cos(phi / 2) + i * sin(phi / 2)"],
			],

			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "RZ",
			},
			exportInfo: {
				quil: {
					name: "RZ",
					params: ["phi"],
				},
				cirq: {
					name: "rz",
					params: ["theta"],
				},
				qsharp: {
					name: "Rz",
					params: ["theta"],
				},
				braket: {
					name: "rz",
					params: ["phi"],
				},
				aqasm: {
					name: "RZ",
				},
				ionq: {
					name: "rz",
					paramsKey: "rotation",
				},
			},
		},

		u1: {
			description: "Single-qubit rotation about the Z axis",
			matrix: [
				[1, 0],
				[0, "exp(i * lambda)"],
			],
			params: ["lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U1",
			},
			exportInfo: {
				quil: {
					name: "PHASE",
					params: ["lambda"],
				},
				cirq: {
					name: "u1",
					params: ["lambda"],
					array: "[[1, 0], [0, np.exp(1j*p_lambda)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "phaseShift",
					params: ["lambda"],
				},
				braket: {
					name: "phaseshift",
					params: ["lambda"],
				},
				qiskit: {
					name: "p",
				},
				aqasm: {
					name: "PH",
				},
			},
		},

		u2: {
			description: "Single-qubit rotation about the X+Z axis",
			matrix: [
				["1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],
				["exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)"],
			],
			params: ["phi", "lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U2",
			},
			exportInfo: {
				quil: {
					name: "u2",
					params: ["phi", "lambda"],
					defgate:
						"DEFGATE u2(%phi, %lambda):\n    1/SQRT(2), -1*EXP(i*%lambda)*1/SQRT(2)\n    EXP(i*%phi)*1/SQRT(2), EXP(i*%lambda + i*%phi)*1/SQRT(2)",
				},
				pyquil: {
					name: "u2",
					params: ["phi", "lambda"],
					array:
						"[[1/quil_sqrt(2),-quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[quil_exp(1j*p_phi)*1/quil_sqrt(2),quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]",
				},
				cirq: {
					name: "u2",
					params: ["phi", "lambda"],
					array:
						"[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "unitary",
					params: ["phi", "lambda"],
					matrix: [
						[
							["1/sqrt(2)", "0"],
							["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"],
						],
						[
							["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"],
							["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"],
						],
					],
				},
				braket: {
					name: "unitary",
					params: ["phi", "lambda"],
					array:
						"[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
				},
				aqasm: {
					matrix: [
						["1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],
						["exp(i * phi) * 1 / sqrt(2)", "exp(i * lambda + i * phi) * 1 / sqrt(2)"],
					],
					array:
						"[[1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)], [np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					params: ["phi", "lambda"],
				},
				qiskit: {
					replacement: [
						{
							name: "u3",
							params: { theta: "pi/2", phi: "phi", lambda: "lambda" },
						},
					],
				},
			},
		},

		u3: {
			description: "Generic single-qubit rotation gate with 3 Euler angles",
			matrix: [
				["cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)"],
				[
					"exp(i * phi) * sin(theta / 2)",
					"exp(i * lambda + i * phi) * cos(theta / 2)",
				],
			],
			params: ["theta", "phi", "lambda"],
			drawingInfo: {
				connectors: ["box"],
				label: "U3",
			},
			exportInfo: {
				quil: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					defgate:
						"DEFGATE u3(%theta, %phi, %lambda):\n    COS(%theta/2), -1*EXP(i*%lambda)*SIN(%theta/2)\n    EXP(i*%phi)*SIN(%theta/2), EXP(i*%lambda + i*%phi)*COS(%theta/2)",
				},
				pyquil: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array:
						"[[quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]",
				},
				cirq: {
					name: "u3",
					params: ["theta", "phi", "lambda"],
					array:
						"[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					matrix: [
						[
							["cos(theta/2)", "0"],
							["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"],
						],
						[
							["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"],
							["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"],
						],
					],
				},
				braket: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					array:
						"[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
				},
				qiskit: {
					name: "u",
				},
				aqasm: {
					matrix: [
						["cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)"],
						[
							"exp(i * phi) * sin(theta / 2)",
							"exp(i * lambda + i * phi) * cos(theta / 2)",
						],
					],
					array:
						"[[np.cos(p_theta/2), -np.exp(1j*p_lambda)*np.sin(p_theta/2)], [np.exp(1j*p_phi)*np.sin(p_theta/2), np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					params: ["theta", "phi", "lambda"],
				},
			},
		},

		s: {
			description: "PI/2 rotation over Z-axis (synonym for `r2`)",
			matrix: [
				[1, 0],
				[0, "exp(i * pi / 2)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S",
			},
			exportInfo: {
				quil: {
					name: "S",
				},
				cirq: {
					name: "S",
				},
				quest: {
					name: "sGate",
				},
				qsharp: {
					name: "S",
				},
				quirk: {
					name: "Z^½",
				},
				braket: {
					name: "s",
				},
				aqasm: {
					name: "S",
				},
				ionq: {
					name: "s",
				},
			},
		},

		t: {
			description: "PI/4 rotation over Z-axis (synonym for `r4`)",
			matrix: [
				[1, 0],
				[0, "exp(i * pi / 4)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T",
			},
			exportInfo: {
				quil: {
					name: "T",
				},
				cirq: {
					name: "T",
				},
				quest: {
					name: "tGate",
				},
				qsharp: {
					name: "T",
				},
				quirk: {
					name: "Z^¼",
				},
				braket: {
					name: "t",
				},
				aqasm: {
					name: "T",
				},
				ionq: {
					name: "t",
				},
			},
		},

		sdg: {
			description: "(-PI/2) rotation over Z-axis",
			matrix: [
				[1, 0],
				[0, "exp(-i * pi / 2)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "S&#8224;",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				quest: {
					name: "phaseShift",
					params: { theta: "-M_PI/2" },
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				quirk: {
					name: "Z^-½",
				},
				braket: {
					name: "si",
				},
				aqasm: {
					name: "S",
					dagger: true,
				},
				ionq: {
					name: "si",
				},
			},
		},

		tdg: {
			description: "(-PI/4) rotation over Z-axis",
			matrix: [
				[1, 0],
				[0, "exp(-i * pi / 4)"],
			],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "T&#8224;",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				cirq: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				quest: {
					name: "phaseShift",
					params: { theta: "-M_PI/4" },
				},
				qsharp: {
					replacement: {
						name: "u1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				quirk: {
					name: "Z^-¼",
				},
				braket: {
					name: "ti",
				},
				aqasm: {
					name: "T",
					dagger: true,
				},
				ionq: {
					name: "ti",
				},
			},
		},

		gpi: {
			description: "GPi gate",
			matrix: [
				[0, "exp(-i*phi)"],
				["exp(i*phi)", 0],
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "GPi",
			},

			exportInfo: {
				quil: {
					name: "gpi",
					params: ["phi"],
					defgate: "DEFGATE gpi(%phi):\n    0, EXP(-i * %phi)\n    EXP(i * %phi), 0",
				},
				pyquil: {
					name: "gpi",
					params: ["phi"],
					array: "[ [ 0, quil_exp(-1j*p_phi) ], [ quil_exp(1j*p_phi), 0 ] ]",
				},
				cirq: {
					name: "gpi",
				},
				quest: {
					name: "gpi",
					//@TODO add function
					func: "TODO",
				},
				qasm: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi", phi: "phi", lambda: "pi-phi" },
							wires: [0],
						},
					],
				},
				qiskit: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi", phi: "phi", lambda: "pi-phi" },
							wires: [0],
						},
					],
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array: "[ [ 0, np.exp(-1j*p_phi) ], [ np.exp(1j*p_phi), 0 ] ]",
				},
				aqasm: {
					matrix: [
						[0, "exp(-i*phi)"],
						["exp(i*phi)", 0],
					],
					array: "[ [ 0, np.exp(-1j*p_phi) ], [ np.exp(1j*p_phi), 0 ] ]",
					params: ["phi"],
				},
				ionq: {
					name: "gpi",
					paramsKey: "phase",
				},
			},
		},

		gpi2: {
			description: "GPi2 gate",
			matrix: [
				["1/sqrt(2)", "(-i*exp(-i*phi))/sqrt(2)"],
				["(-i*exp(i*phi))/sqrt(2)", "1/sqrt(2)"],
			],
			params: ["phi"],
			drawingInfo: {
				connectors: ["box"],
				label: "GPi2",
			},
			exportInfo: {
				quil: {
					name: "gpi2",
					params: ["phi"],
					defgate:
						"DEFGATE gpi2(%phi):\n    1/SQRT(2), (-i*EXP(-i * %phi)) / SQRT(2)\n    (-i*EXP(i * %phi)) / SQRT(2), 1/SQRT(2)",
				},
				pyquil: {
					name: "gpi2",
					params: ["phi"],
					array:
						"[ [ 1/quil_sqrt(2), (-1j*quil_exp(-1j*p_phi))/quil_sqrt(2) ], [ (-1j*quil_exp(1j*p_phi))/quil_sqrt(2), 1/quil_sqrt(2) ] ]",
				},
				cirq: {
					name: "gpi2",
				},
				quest: {
					name: "gpi2",
					//@TODO add function
					func: "TODO",
				},
				qasm: {
					equivalent: [
						{
							name: "u3",
							params: {
								theta: "pi/2",
								phi: "phi-(pi/2)",
								lambda: "(pi/2)-phi",
							},
							wires: [0],
						},
					],
				},
				qiskit: {
					equivalent: [
						{
							name: "u3",
							params: {
								theta: "pi/2",
								phi: "phi-(pi/2)",
								lambda: "(pi/2)-phi",
							},
							wires: [0],
						},
					],
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array:
						"[ [ 1/np.sqrt(2), (-1j*np.exp(-1j*p_phi))/np.sqrt(2) ], [ (-1j*np.exp(1j*p_phi))/np.sqrt(2), 1/np.sqrt(2) ] ]",
				},
				aqasm: {
					matrix: [
						["1/sqrt(2)", "(-i*exp(-i*phi))/sqrt(2)"],
						["(-i*exp(i*phi))/sqrt(2)", "1/sqrt(2)"],
					],
					array:
						"[ [ 1/np.sqrt(2), (-1j*np.exp(-1j*p_phi))/np.sqrt(2) ], [ (-1j*np.exp(1j*p_phi))/np.sqrt(2), 1/np.sqrt(2) ] ]",
					params: ["phi"],
				},
				ionq: {
					name: "gpi2",
					paramsKey: "phase",
				},
			},
		},

		vz: {
			description: "VirtualZ gate",
			matrix: [
				["exp(-i*theta/2)", 0],
				[0, "exp(i*theta/2)"],
			],
			params: ["theta"],
			drawingInfo: {
				connectors: ["box"],
				label: "VrtZ",
			},
			exportInfo: {
				quil: {
					name: "vz",
					params: ["theta"],
					defgate:
						"DEFGATE vz(%theta):\n    EXP(-i * %theta/2), 0\n    0, EXP(-i * %theta/2)",
				},
				pyquil: {
					name: "vz",
					params: ["theta"],
					array: "[ [ quil_exp(-1j*p_theta/2), 0 ], [ 0, quil_exp(1j*p_theta/2) ] ]",
				},
				cirq: {
					name: "vz",
				},
				quest: {
					name: "vz",
					//@TODO add function
					func: "TODO",
				},
				qasm: {
					equivalent: [{ name: "rz", params: { phi: "theta" }, wires: [0] }],
				},
				qiskit: {
					equivalent: [{ name: "rz", params: { phi: "theta" }, wires: [0] }],
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array: "[ [ np.exp(-1j*p_theta/2), 0 ], [ 0, np.exp(1j*p_theta/2) ] ]",
				},
				aqasm: {
					matrix: [
						["exp(-i*theta/2)", 0],
						[0, "exp(i*theta/2)"],
					],
					array: "[ [ np.exp(-1j*p_theta/2), 0 ], [ 0, np.exp(1j*p_theta/2) ] ]",
					params: ["theta"],
				},
				ionq: {
					name: "vz",
					paramsKey: "phase",
				},
			},
		},

		cx: {
			description: "Controlled NOT (CNOT) gate",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 0, 1],
				[0, 0, 1, 0],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "not"],
				label: "X",
				root: "x",
			},
			exportInfo: {
				quil: {
					name: "CNOT",
				},
				cirq: {
					name: "CNOT",
				},
				quest: {
					name: "controlledNot",
				},
				qsharp: {
					name: "CNOT",
				},
				quirk: {
					name: "X",
					controlled: true,
				},
				braket: {
					name: "cnot",
				},
				aqasm: {
					name: "CNOT",
				},
				ionq: {
					name: "cnot",
				},
			},
		},

		cy: {
			description: "Controlled Y gate (controlled rotation over Y-axis by PI)",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 0, "-i"],
				[0, 0, "i", 0],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "Y",
				root: "y",
			},
			exportInfo: {
				quest: {
					name: "controlledPauliY",
				},
				cirq: {
					replacement: {
						name: "y",
						type: "controlled",
						notTfqSupported: true,
					},
				},
				quil: {
					name: "cy",
					defgate:
						"DEFGATE cy:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0, -i\n    0, 0, i, 0",
				},
				pyquil: {
					name: "cy",
					array: "[[1,0,0,0],[0,1,0,0],[0,0,0,-1j],[0,0,1j,0]]",
				},
				qsharp: {
					name: "Controlled Y",
				},
				quirk: {
					name: "Y",
					controlled: true,
				},
				braket: {
					name: "cy",
				},
				aqasm: {
					name: "Y",
					controlled: true,
				},
			},
		},

		cz: {
			description: "Controlled Z gate (controlled rotation over Z-axis by PI)",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, -1],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "dot"],
				label: "Z",
				root: "z",
			},
			exportInfo: {
				quil: {
					name: "CZ",
				},
				cirq: {
					name: "CZ",
				},
				quest: {
					name: "controlledPhaseFlip",
				},
				qsharp: {
					name: "Controlled Z",
				},
				quirk: {
					name: "Z",
					controlled: true,
				},
				braket: {
					name: "cz",
				},
				aqasm: {
					name: "CSIGN",
				},
			},
		},

		ch: {
			description: "Controlled Hadamard gate",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "1 / sqrt(2)", "1 / sqrt(2)"],
				[0, 0, "1 / sqrt(2)", "-1 / sqrt(2)"],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "H",
				root: "h",
			},
			exportInfo: {
				quest: {
					name: "controlledUnitary",
					matrix: [
						[
							["1/sqrt(2)", "0"],
							["1/sqrt(2)", "0"],
						],
						[
							["1/sqrt(2)", "0"],
							["-1/sqrt(2)", "0"],
						],
					],
				},
				cirq: {
					replacement: {
						name: "h",
						type: "controlled",
						notTfqSupported: true,
					},
				},
				quil: {
					name: "ch",
					defgate:
						"DEFGATE ch:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0.7071067811865475, 0.7071067811865475\n    0, 0, 0.7071067811865475, -0.7071067811865475",
				},
				pyquil: {
					name: "ch",
					array:
						"[[1,0,0,0],[0,1,0,0],[0,0,1/np.sqrt(2),1/np.sqrt(2)],[0,0,1/np.sqrt(2),-1/np.sqrt(2)]]",
				},
				qsharp: {
					name: "Controlled H",
				},
				quirk: {
					name: "H",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0,0,1/np.sqrt(2),1/np.sqrt(2)],[0,0,1/np.sqrt(2),-1/np.sqrt(2)]]",
				},
				aqasm: {
					name: "H",
					controlled: true,
				},
			},
		},

		csrn: {
			description: "Controlled square root of NOT",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "0.5+0.5i", "0.5-0.5i"],
				[0, 0, "0.5-0.5i", "0.5+0.5i"],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "&#x221A;X",
				root: "srn",
			},
			exportInfo: {
				quest: {
					name: "controlledUnitary",
					matrix: [
						[
							["-1/sqrt(2)", "0"],
							["-1/sqrt(2)", "0"],
						],
						[
							["-1/sqrt(2)", "0"],
							["1/sqrt(2)", "0"],
						],
					],
				},
				cirq: {
					replacement: {
						name: "srn",
						type: "controlled",
						notTfqSupported: true,
					},
				},
				quil: {
					name: "csrn",
					defgate:
						"DEFGATE csrn:\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 0.5+0.5i, 0.5-0.5i\n    0, 0, 0.5-0.5i, 0.5+0.5i",
				},
				qasm: {
					name: "csx",
				},
				qiskit: {
					name: "csx",
				},
				pyquil: {
					name: "csrn",
					array:
						"[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]",
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]",
				},
				aqasm: {
					matrix: [
						[1, 0, 0, 0],
						[0, 1, 0, 0],
						[0, 0, "0.5+0.5i", "0.5-0.5i"],
						[0, 0, "0.5-0.5i", "0.5+0.5i"],
					],
					array:
						"[[1,0,0,0],[0,1,0,0],[0,0,0.5+0.5j,0.5-0.5j],[0,0,0.5-0.5j,0.5+0.5j]]",
				},
			},
		},

		swap: {
			description: "Swaps the state of two qubits.",
			matrix: [
				[1, 0, 0, 0],
				[0, 0, 1, 0],
				[0, 1, 0, 0],
				[0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["x", "x"],
				label: "SWP",
			},
			exportInfo: {
				quil: {
					name: "SWAP",
				},
				cirq: {
					name: "SWAP",
				},
				quest: {
					name: "swap",
					func:
						"void swap(Qureg qubits, const int q1, const int q2) {\n" +
						"    controlledNot(qubits, q1, q2);\n" +
						"    controlledNot(qubits, q2, q1);\n" +
						"    controlledNot(qubits, q1, q2);\n}",
				},
				qsharp: {
					name: "SWAP",
				},
				quirk: {
					name: "Swap",
				},
				braket: {
					name: "swap",
				},
				aqasm: {
					name: "SWAP",
				},
				ionq: {
					name: "swap",
				},
			},
		},

		srswap: {
			description: "Square root of swap",
			matrix: [
				[1, 0, 0, 0],
				[0, "0.5 * (1 + i)", "0.5 * (1 - i)", 0],
				[0, "0.5 * (1 - i)", "0.5 * (1 + i)", 0],
				[0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "&#x221A;SWP",
			},
			exportInfo: {
				quil: {
					name: "srswap",
					defgate:
						"DEFGATE srswap:\n    1, 0, 0, 0\n    0, 0.5+0.5i, 0.5-0.5i, 0\n    0, 0.5-0.5i, 0.5+0.5i, 0\n    0, 0, 0, 1",
				},
				cirq: {
					name: "SWAP**(1/2)",
				},
				pyquil: {
					name: "srswap",
					array:
						"[[1,0,0,0],[0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,1]]",
				},
				quest: {
					name: "srswap",
					func:
						"void srswap(Qureg qubits, const int q1, const int q2) {\n" +
						"    controlledNot(qubits, q2, q1);\n" +
						"    rotateY(qubits, q2, M_PI/2);\n" +
						"    rotateZ(qubits, q2, M_PI/16);\n" +
						"    controlledNot(qubits, q1, q2);\n" +
						"    rotateZ(qubits, q1, M_PI/8);\n" +
						"    rotateZ(qubits, q2, -M_PI/8);\n" +
						"    controlledNot(qubits, q1, q2);\n" +
						"    rotateZ(qubits, q2, M_PI/16);\n" +
						"    rotateY(qubits, q2, -M_PI/2);\n" +
						"    controlledNot(qubits, q2, q1);\n}",
				},
				qasm: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi/2", lambda: "-1*pi" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/4", phi: "-1*pi/2", lambda: "-1*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "7*pi/4" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/4", phi: "-1*pi", lambda: "-1*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi", lambda: "pi/2" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "-3*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi/2", lambda: "0" },
							wires: [1],
						},
					],
				},
				qiskit: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi/2", lambda: "-1*pi" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/4", phi: "-1*pi/2", lambda: "-1*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "7*pi/4" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/4", phi: "-1*pi", lambda: "-1*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi", lambda: "pi/2" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "-3*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "pi/2", lambda: "0" },
							wires: [1],
						},
					],
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,1]]",
				},
				aqasm: {
					name: "SQRTSWAP",
				},
			},
		},

		iswap: {
			description:
				"Swaps the state of two qubits, applying a -i phase to q1 when it is in the 1 state and a -i phase to q2 when it is in the 0 state",
			matrix: [
				[1, 0, 0, 0],
				[0, 0, "0+i", 0],
				[0, "0+i", 0, 0],
				[0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "iSWP",
			},
			exportInfo: {
				quil: {
					name: "ISWAP",
				},
				cirq: {
					name: "ISWAP",
				},
				qasm: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "-1*pi" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "3*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "3*pi/2", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "0" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi", phi: "pi/4", lambda: "-1*pi/4" },
							wires: [1],
						},
					],
				},
				qiskit: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "-1*pi" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "-1*pi/2", lambda: "pi" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "3*pi/2" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi/2", phi: "3*pi/2", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "pi/2", phi: "0", lambda: "0" },
							wires: [0],
						},
						{
							name: "u3",
							params: { theta: "pi", phi: "pi/4", lambda: "-1*pi/4" },
							wires: [1],
						},
					],
				},
				braket: {
					name: "iswap",
				},
				aqasm: {
					name: "ISWAP",
				},
			},
		},

		xx: {
			description: "XX gate",
			matrix: [
				["cos(theta)", 0, 0, "-i*sin(theta)"],

				[0, "cos(theta)", "-i*sin(theta)", 0],

				[0, "-i*sin(theta)", "cos(theta)", 0],

				["-i*sin(theta)", 0, 0, "cos(theta)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "XX",
			},
			exportInfo: {
				quil: {
					name: "xx",
					params: ["theta"],
					defgate:
						"DEFGATE xx(%theta):\n    COS(%theta), 0, 0, -i*SIN(%theta)\n    0, COS(%theta), -i*SIN(%theta), 0\n    0, -i*SIN(%theta), COS(%theta), 0\n    -i*SIN(%theta), 0, 0, COS(%theta)",
				},
				pyquil: {
					name: "xx",
					params: ["theta"],
					array:
						"[ [quil_cos(p_theta), 0, 0, -1j*quil_sin(p_theta)], [0, quil_cos(p_theta), -1j*quil_sin(p_theta), 0], [0, -1j*quil_sin(p_theta), quil_cos(p_theta), 0], [-1j*quil_sin(p_theta), 0, 0, quil_cos(p_theta)] ]",
				},
				cirq: {
					name: "xx",
				},
				quest: {
					name: "xx",
					//@TODO add function
					func: "TODO",
				},
				qasm: {
					name: "rxx",
				},
				qiskit: {
					name: "rxx",
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array:
						"[[np.cos(p_theta), 0, 0, -1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [-1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]",
				},
				aqasm: {
					matrix: [
						["cos(theta)", 0, 0, "-i*sin(theta)"],
						[0, "cos(theta)", "-i*sin(theta)", 0],
						[0, "-i*sin(theta)", "cos(theta)", 0],
						["-i*sin(theta)", 0, 0, "cos(theta)"],
					],
					array:
						"[[np.cos(p_theta), 0, 0, -1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [-1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]",
					params: ["theta"],
				},
				ionq: {
					name: "xx",
					paramsKey: "phase",
				},
			},
		},

		yy: {
			description: "YY gate",
			matrix: [
				["cos(theta)", 0, 0, "i*sin(theta)"],

				[0, "cos(theta)", "-i*sin(theta)", 0],

				[0, "-i*sin(theta)", "cos(theta)", 0],

				["i*sin(theta)", 0, 0, "cos(theta)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "YY",
			},
			exportInfo: {
				quil: {
					name: "yy",
					params: ["theta"],
					defgate:
						"DEFGATE yy(%theta):\n    COS(%theta), 0, 0, i*SIN(%theta)\n    0, COS(%theta), -i*SIN(%theta), 0\n    0, -i*SIN(%theta), COS(%theta), 0\n    i*SIN(%theta), 0, 0, COS(%theta)",
				},
				cirq: {
					name: "YY",
				},
				pyquil: {
					name: "yy",
					params: ["theta"],
					array:
						"[ [quil_cos(p_theta), 0, 0, 1j*quil_sin(p_theta)], [0, quil_cos(p_theta), -1j*quil_sin(p_theta), 0], [0, -1j*quil_sin(p_theta), quil_cos(p_theta), 0], [1j*quil_sin(p_theta), 0, 0, quil_cos(p_theta)] ]",
				},
				quest: {
					name: "yy",
					//@TODO add function
					func: "TODO",
				},
				braket: {
					name: "yy",
					params: ["theta"],
				},
				aqasm: {
					matrix: [
						["cos(theta)", 0, 0, "i*sin(theta)"],
						[0, "cos(theta)", "-i*sin(theta)", 0],
						[0, "-i*sin(theta)", "cos(theta)", 0],
						["i*sin(theta)", 0, 0, "cos(theta)"],
					],
					array:
						"[[np.cos(p_theta), 0, 0, 1j*np.sin(p_theta)], [0, np.cos(p_theta), -1j*np.sin(p_theta), 0], [0, -1j*np.sin(p_theta), np.cos(p_theta), 0], [1j*np.sin(p_theta), 0, 0, np.cos(p_theta)] ]",
					params: ["theta"],
				},
				qasm: {
					name: "ryy",
				},
				qiskit: {
					name: "ryy",
				},
				ionq: {
					name: "yy",
					paramsKey: "phase",
				},
			},
		},

		zz: {
			description: "Parametric 2-qubit rotation about ZZ",
			matrix: [
				["exp(-i * theta / 2)", 0, 0, 0],
				[0, "exp(i * theta / 2)", 0, 0],
				[0, 0, "exp(i * theta / 2)", 0],
				[0, 0, 0, "exp(-i * theta / 2)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["theta"],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "ZZ",
			},
			exportInfo: {
				quil: {
					name: "zz",
					params: ["theta"],
					defgate:
						"DEFGATE zz(%theta):\n    EXP(-i * %theta / 2), 0, 0, 0\n    0, EXP(i * %theta / 2), 0, 0\n    0, 0, EXP(i * %theta / 2), 0\n    0, 0, 0, EXP(-i * %theta / 2)",
				},
				pyquil: {
					name: "zz",
					params: ["theta"],
					array:
						"[ [ quil_exp(-1j * p_theta / 2), 0, 0, 0 ], [ 0, quil_exp(1j * p_theta / 2), 0, 0], [ 0, 0, quil_exp(1j * p_theta / 2), 0 ], [ 0, 0, 0, quil_exp(-1j * p_theta / 2) ] ]",
				},
				qasm: {
					name: "rzz",
				},
				qiskit: {
					name: "rzz",
				},
				ionq: {
					name: "zz",
					paramsKey: "phase",
				},
			},
		},

		xy: {
			description: "XY gate",
			matrix: [
				[1, 0, 0, 0],
				[0, "cos(phi / 2)", "i * sin(phi / 2)", 0],
				[0, "i * sin(phi / 2)", "cos(phi / 2)", 0],
				[0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["phi"],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "XY",
			},
			exportInfo: {
				quil: {
					name: "XY",
					params: ["phi"],
				},
				qasm: {
					equivalent: [
						{ name: "rz", params: { phi: "3*pi/4" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "-3*pi/4" }, wires: [1] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "phi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "pi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [1] },
						{ name: "rz", params: { phi: "phi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "pi/4" }, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4" }, wires: [1] },
					],
				},
				qiskit: {
					equivalent: [
						{ name: "rz", params: { phi: "3*pi/4" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "-3*pi/4" }, wires: [1] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "phi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "pi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [1] },
						{ name: "rz", params: { phi: "phi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [1] },
						{ name: "cz", wires: [1, 0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [0] },
						{ name: "rx", params: { theta: "pi/2" }, wires: [0] },
						{ name: "rz", params: { phi: "pi/4" }, wires: [0] },
						{ name: "rz", params: { phi: "-1*pi/2" }, wires: [1] },
						{ name: "rx", params: { theta: "-1*pi/2" }, wires: [1] },
						{ name: "rz", params: { phi: "3*pi/4" }, wires: [1] },
					],
				},
				cirq: {
					name: "xy",
					params: ["phi"],
					array:
						"[[1, 0, 0, 0], [0, np.cos(p_phi/2), 1j*np.sin(p_phi/2), 0], [0, 1j*np.sin(p_phi/2), np.cos(p_phi/2), 0], [0, 0, 0, 1]]",
					notTfqSupported: true,
				},
				braket: {
					name: "xy",
					params: ["phi"],
				},
				aqasm: {
					matrix: [
						[1, 0, 0, 0],
						[0, "cos(phi / 2)", "i * sin(phi / 2)", 0],
						[0, "i * sin(phi / 2)", "cos(phi / 2)", 0],
						[0, 0, 0, 1],
					],
					array:
						"[[1, 0, 0, 0], [0, np.cos(p_phi/2), 1j*np.sin(p_phi/2), 0], [0, 1j*np.sin(p_phi/2), np.cos(p_phi/2), 0], [0, 0, 0, 1]]",
					params: ["phi"],
				},
			},
		},

		ms: {
			description: "Mølmer-Sørensen gate",
			matrix: [
				["1/sqrt(2)", 0, 0, "(-i*exp(-i*(phi0+phi1)))/sqrt(2)"],

				[0, "1/sqrt(2)", "(-i*exp(-i*(phi0-phi1)))/sqrt(2)", 0],

				[0, "(-i*exp(i*(phi0-phi1)))/sqrt(2)", "1/sqrt(2)", 0],

				["(-i*exp(i*(phi0+phi1)))/sqrt(2)", 0, 0, "1/sqrt(2)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["phi0", "phi1"],
			drawingInfo: {
				connectors: ["box", "box"],
				label: "MS",
			},
			exportInfo: {
				quil: {
					name: "ms",
					params: ["phi0", "phi1"],
					defgate:
						"DEFGATE ms(%phi0, %phi1):\n    1/SQRT(2), 0, 0, (-i*EXP(-i*(%phi0+%phi1)))/SQRT(2)\n    0, 1/SQRT(2), (-i*EXP(-i*(%phi0-%phi1)))/SQRT(2), 0\n    0, (-i*EXP(i*(%phi0-%phi1)))/SQRT(2), 1/SQRT(2), 0\n    (-i*EXP(i*(%phi0+%phi1)))/SQRT(2), 0, 0, 1/SQRT(2)",
				},
				pyquil: {
					name: "ms",
					params: ["phi0", "phi1"],
					array:
						"[ [ 1/quil_sqrt(2), 0, 0, (-1j*quil_exp(-1j*(p_phi0+p_phi1)))/quil_sqrt(2) ], [ 0, 1/quil_sqrt(2), (-1j*quil_exp(-1j*(p_phi0-p_phi1)))/quil_sqrt(2), 0 ], [ 0, (-1j*quil_exp(1j*(p_phi0-p_phi1)))/quil_sqrt(2), 1/quil_sqrt(2), 0 ], [ (-1j*quil_exp(1j*(p_phi0+p_phi1)))/quil_sqrt(2), 0, 0, 1/quil_sqrt(2) ] ]",
				},
				cirq: {
					name: "ms",
				},
				quest: {
					name: "ms",
					//@TODO add function
					func: "TODO",
				},
				qasm: {
					name: "ms",
				},
				qiskit: {
					name: "ms",
				},
				braket: {
					name: "unitary",
					params: ["phi0", "phi1"],
					array:
						"[ [ 1/np.sqrt(2), 0, 0, (-1j*np.exp(-1j*(p_phi0+p_phi1)))/np.sqrt(2) ], [ 0, 1/np.sqrt(2), (-1j*np.exp(-1j*(p_phi0-p_phi1)))/np.sqrt(2), 0 ], [ 0, (-1j*np.exp(1j*(p_phi0-p_phi1)))/np.sqrt(2), 1/np.sqrt(2), 0 ], [ (-1j*np.exp(1j*(p_phi0+p_phi1)))/np.sqrt(2), 0, 0, 1/np.sqrt(2) ] ]",
				},
				aqasm: {
					matrix: [
						["1/sqrt(2)", 0, 0, "(-1i*exp(-1i*(phi0+phi1)))/sqrt(2)"],
						[0, "1/sqrt(2)", "(-1i*exp(-1i*(phi0-phi1)))/sqrt(2)", 0],
						[0, "(-1i*exp(1i*(phi0-phi1)))/sqrt(2)", "1/sqrt(2)", 0],
						["(-1i*exp(1i*(phi0+phi1)))/sqrt(2)", 0, 0, "1/sqrt(2)"],
					],
					array:
						"[ [ 1/np.sqrt(2), 0, 0, (-1j*np.exp(-1j*(p_phi0+p_phi1)))/np.sqrt(2) ], [ 0, 1/np.sqrt(2), (-1j*np.exp(-1j*(p_phi0-p_phi1)))/np.sqrt(2), 0 ], [ 0, (-1j*np.exp(1j*(p_phi0-p_phi1)))/np.sqrt(2), 1/np.sqrt(2), 0 ], [ (-1j*np.exp(1j*(p_phi0+p_phi1)))/np.sqrt(2), 0, 0, 1/np.sqrt(2) ] ]",
					params: ["phi0", "phi1"],
				},
				ionq: {
					name: "ms",
					paramsKey: "phases",
				},
			},
		},

		cr2: {
			description: "Controlled PI/2 rotation over Z-axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * pi / 2)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "Z&#x1D6D1;/2",
				root: "r2",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "M_PI/2" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "pi/2" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "pi/2" } }],
				},
				quirk: {
					name: "Z^½",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 2)] ]",
				},
				aqasm: {
					name: "S",
					controlled: true,
				},
			},
		},

		cr4: {
			description: "Controlled PI/4 rotation over Z-axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * pi / 4)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "Z&#x1D6D1;/4",
				root: "r4",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "M_PI/4" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "pi/4" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "pi/4" } }],
				},
				quirk: {
					name: "Z^¼",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 4)] ]",
				},
				aqasm: {
					name: "T",
					controlled: true,
				},
			},
		},

		cr8: {
			description: "Controlled PI/8 rotation over Z-axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * pi / 8)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "Z&#x1D6D1;/8",
				root: "r8",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "M_PI/8" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/8",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "pi/8" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "pi/8" } }],
				},
				quirk: {
					name: "Z^⅛",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 8)] ]",
				},
				aqasm: {
					matrix: [
						[1, 0, 0, 0],
						[0, 1, 0, 0],
						[0, 0, 1, 0],
						[0, 0, 0, "exp(i * pi / 8)"],
					],
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j * np.pi / 8)] ]",
				},
			},
		},

		crx: {
			description: "Controlled rotation around the X-axis by given angle",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "cos(theta / 2)", "-i * sin(theta / 2)"],
				[0, 0, "-i * sin(theta / 2)", "cos(theta / 2)"],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "RX",
				root: "rx",
			},
			exportInfo: {
				quil: {
					name: "crx",
					params: ["theta"],
					defgate:
						"DEFGATE crx(%theta):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -i*SIN(%theta/2)\n    0, 0, -i*SIN(%theta/2), COS(%theta/2)",
				},
				cirq: {
					replacement: {
						name: "rx",
						params: { theta: "theta" },
						type: "controlled",
						notTfqSupported: true,
					},
				},
				pyquil: {
					name: "crx",
					params: ["theta"],
					array:
						"[[ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, quil_cos(p_theta / 2), -1j*quil_sin(p_theta / 2) ], [ 0, 0, -1j*quil_sin(p_theta / 2), quil_cos(p_theta / 2) ]]",
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta"],
					matrix: [
						[
							["cos(theta/2)", "0"],
							["0", "-sin(theta/2)"],
						],
						[
							["0", "-sin(theta/2)"],
							["cos(theta/2)", "0"],
						],
					],
				},
				qsharp: {
					name: "Controlled Rx",
					params: ["theta"],
				},
				qasm: {
					replacement: [
						{
							name: "cu3",
							params: { theta: "theta", phi: "-1*pi/2", lambda: "pi/2" },
						},
					],
				},
				qiskit: {
					replacement: [
						{
							name: "cu3",
							params: { theta: "theta", phi: "-1*pi/2", lambda: "pi/2" },
						},
					],
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array:
						"[[ 1, 0, 0, 0 ], [ 0, 1, 0, 0 ], [ 0, 0, np.cos(p_theta / 2), -1j*np.sin(p_theta / 2) ], [ 0, 0, -1j*np.sin(p_theta / 2), np.cos(p_theta / 2) ]]",
				},
				aqasm: {
					name: "RX",
					controlled: true,
				},
			},
		},

		cry: {
			description: "Controlled rotation around the Y-axis by given angle",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "cos(theta / 2)", "-1 * sin(theta / 2)"],
				[0, 0, "sin(theta / 2)", "cos(theta / 2)"],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["theta"],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "RY",
				root: "ry",
			},
			exportInfo: {
				quil: {
					name: "cry",
					params: ["theta"],
					defgate:
						"DEFGATE cry(%theta):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -1*SIN(%theta/2)\n    0, 0, SIN(%theta/2), COS(%theta/2)",
				},
				cirq: {
					replacement: {
						name: "ry",
						params: { theta: "theta" },
						type: "controlled",
						notTfqSupported: true,
					},
				},
				pyquil: {
					name: "cry",
					params: ["theta"],
					array:
						"[[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, quil_cos(p_theta / 2), -1*quil_sin(p_theta / 2) ],[ 0, 0, quil_sin(p_theta / 2), quil_cos(p_theta / 2) ]]",
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta"],
					matrix: [
						[
							["cos(theta/2)", "0"],
							["-sin(theta/2)", "0"],
						],
						[
							["sin(theta/2)", "0"],
							["cos(theta/2)", "0"],
						],
					],
				},
				qsharp: {
					name: "Controlled Ry",
					params: ["theta"],
				},
				qasm: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "theta/2", phi: "0", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "-1*theta / 2", phi: "0", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
					],
				},
				qiskit: {
					equivalent: [
						{
							name: "u3",
							params: { theta: "theta/2", phi: "0", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
						{
							name: "u3",
							params: { theta: "-1*theta / 2", phi: "0", lambda: "0" },
							wires: [1],
						},
						{ name: "cx", wires: [0, 1] },
					],
				},
				braket: {
					name: "unitary",
					params: ["theta"],
					array:
						"[[ 1, 0, 0, 0 ],[ 0, 1, 0, 0 ],[ 0, 0, np.cos(p_theta / 2), -1*np.sin(p_theta / 2) ],[ 0, 0, np.sin(p_theta / 2), np.cos(p_theta / 2) ]]",
				},
				aqasm: {
					name: "RY",
					controlled: true,
				},
			},
		},

		crz: {
			description: "Controlled rotation around the Z-axis by given angle",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "cos(phi / 2) - i * sin(phi / 2)", 0],
				[0, 0, 0, "cos(phi / 2) + i * sin(phi / 2)"],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["phi"],
			drawingInfo: {
				connectors: ["dot", "dot"],
				label: "RZ",
				root: "rz",
			},
			exportInfo: {
				quil: {
					name: "crz",
					params: ["phi"],
					defgate:
						"DEFGATE crz(%phi):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%phi / 2) - i * SIN(%phi / 2), 0\n    0, 0, 0, COS(%phi / 2) + i * SIN(%phi / 2)",
				},
				pyquil: {
					name: "crz",
					params: ["phi"],
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, quil_cos(p_phi / 2) - 1j * quil_sin(p_phi / 2), 0], [0, 0, 0, quil_cos(p_phi / 2) + 1j * quil_sin(p_phi / 2)]]",
				},
				cirq: {
					replacement: {
						name: "rz",
						params: { phi: "phi" },
						type: "controlled",
					},
				},
				quest: {
					name: "controlledRotateZ",
					params: ["theta"],
				},
				qsharp: {
					name: "Controlled Rz",
					params: ["phi"],
				},
				braket: {
					name: "unitary",
					params: ["phi"],
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, np.cos(p_phi / 2) - 1j * np.sin(p_phi / 2), 0], [0, 0, 0, np.cos(p_phi / 2) + 1j * np.sin(p_phi / 2)]]",
				},
				aqasm: {
					name: "RZ",
					controlled: true,
				},
			},
		},

		cu1: {
			description: "Controlled rotation about the Z axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * lambda)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: ["lambda"],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "CU1",
				root: "u1",
			},
			exportInfo: {
				quil: {
					name: "CPHASE",
					params: ["lambda"],
				},
				cirq: {
					name: "cu1",
					params: ["lambda"],
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j*p_lambda)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "controlledPhaseShift",
					params: ["theta"],
				},
				braket: {
					name: "unitary",
					params: ["lambda"],
					array:
						"[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, np.exp(1j*p_lambda)]]",
				},
				aqasm: {
					name: "PH",
					controlled: true,
				},
				qiskit: {
					name: "cp",
				},
			},
		},

		cu2: {
			description: "Controlled rotation about the X+Z axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],
				[
					0,
					0,
					"exp(i * phi) * 1 / sqrt(2)",
					"exp(i * lambda + i * phi) * 1 / sqrt(2)",
				],
			],
			numTargetQubits: 1,
			numControlQubits: 1,
			params: ["phi", "lambda"],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "CU2",
				root: "u2",
			},
			exportInfo: {
				quil: {
					name: "cu2",
					params: ["phi", "lambda"],
					defgate:
						"DEFGATE cu2(%phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, 1/SQRT(2), -1*EXP(i*%lambda)*1/SQRT(2)\n    0, 0, EXP(i*%phi)*1/SQRT(2), EXP(i*%lambda + i*%phi)*1/SQRT(2)",
				},
				pyquil: {
					name: "cu2",
					params: ["phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1/quil_sqrt(2), -quil_exp(1j*p_lambda)*1/quil_sqrt(2)],[0, 0, quil_exp(1j*p_phi)*1/quil_sqrt(2), quil_exp(1j*p_lambda+1j*p_phi)*1/quil_sqrt(2)]]",
				},
				cirq: {
					name: "cu2",
					params: ["phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "controlledUnitary",
					params: ["phi", "lambda"],
					matrix: [
						[
							["1/sqrt(2)", "0"],
							["-cos(lambda)/sqrt(2)", "-sin(lambda)/sqrt(2)"],
						],
						[
							["cos(phi)/sqrt(2)", "sin(phi)/sqrt(2)"],
							["cos(lambda+phi)/sqrt(2)", "sin(lambda+phi)/sqrt(2)"],
						],
					],
				},
				qasm: {
					replacement: [
						{
							name: "cu3",
							params: { theta: "pi/2", phi: "phi", lambda: "lambda" },
						},
					],
				},
				qiskit: {
					replacement: [
						{
							name: "cu3",
							params: { theta: "pi/2", phi: "phi", lambda: "lambda" },
						},
					],
				},
				braket: {
					name: "unitary",
					params: ["phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
				},
				aqasm: {
					matrix: [
						[1, 0, 0, 0],
						[0, 1, 0, 0],
						[0, 0, "1 / sqrt(2)", "-exp(i * lambda) * 1 / sqrt(2)"],
						[
							0,
							0,
							"exp(i * phi) * 1 / sqrt(2)",
							"exp(i * lambda + i * phi) * 1 / sqrt(2)",
						],
					],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1/np.sqrt(2), -np.exp(1j*p_lambda)*1/np.sqrt(2)],[0, 0, np.exp(1j*p_phi)*1/np.sqrt(2), np.exp(1j*p_lambda+1j*p_phi)*1/np.sqrt(2)]]",
					params: ["phi", "lambda"],
				},
			},
		},

		cu3: {
			description: "Controlled rotation gate with 3 Euler angles",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)"],
				[
					0,
					0,
					"exp(i * phi) * sin(theta / 2)",
					"exp(i * lambda + i * phi) * cos(theta / 2)",
				],
			],
			numTargetQubits: 1,
			numControlQubits: 1,

			params: ["theta", "phi", "lambda"],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "CU3",
				root: "u3",
			},
			exportInfo: {
				quil: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					defgate:
						"DEFGATE cu3(%theta, %phi, %lambda):\n    1, 0, 0, 0\n    0, 1, 0, 0\n    0, 0, COS(%theta/2), -1*EXP(i*%lambda)*SIN(%theta/2)\n    0, 0, EXP(i*%phi)*SIN(%theta/2), EXP(i*%lambda + i*%phi)*COS(%theta/2)",
				},
				pyquil: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, quil_cos(p_theta/2),-quil_exp(1j*p_lambda)*quil_sin(p_theta/2)],[0, 0, quil_exp(1j*p_phi)*quil_sin(p_theta/2),quil_exp(1j*p_lambda+1j*p_phi)*quil_cos(p_theta/2)]]",
				},
				cirq: {
					name: "cu3",
					params: ["theta", "phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					notTfqSupported: true,
				},
				quest: {
					name: "controlledUnitary",
					params: ["theta", "phi", "lambda"],
					matrix: [
						[
							["cos(theta/2)", "0"],
							["-cos(lambda)*sin(theta/2)", "-sin(lambda)*sin(theta/2)"],
						],
						[
							["cos(phi)*sin(theta/2)", "sin(phi)*sin(theta/2)"],
							["cos(lambda+phi)*cos(theta/2)", "sin(lambda+phi)*cos(theta/2)"],
						],
					],
				},
				braket: {
					name: "unitary",
					params: ["theta", "phi", "lambda"],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
				},
				aqasm: {
					matrix: [
						[1, 0, 0, 0],
						[0, 1, 0, 0],
						[0, 0, "cos(theta/2)", "-exp(i * lambda) * sin(theta / 2)"],
						[
							0,
							0,
							"exp(i * phi) * sin(theta / 2)",
							"exp(i * lambda + i * phi) * cos(theta / 2)",
						],
					],
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, np.cos(p_theta/2),-np.exp(1j*p_lambda)*np.sin(p_theta/2)],[0, 0, np.exp(1j*p_phi)*np.sin(p_theta/2),np.exp(1j*p_lambda+1j*p_phi)*np.cos(p_theta/2)]]",
					params: ["theta", "phi", "lambda"],
				},
				qiskit: {
					name: "cu",
				},
			},
		},

		cs: {
			description: "Controlled PI/2 rotation over Z-axis (synonym for `cr2`)",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * pi / 2)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "S",
				root: "s",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "M_PI/2" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/2",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "pi/2" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "pi/2" } }],
				},
				quirk: {
					name: "Z^½",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(1j * np.pi / 2)]]",
				},
				aqasm: {
					name: "S",
					controlled: true,
				},
			},
		},

		ct: {
			description: "Controlled PI/4 rotation over Z-axis (synonym for `cr4`)",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(i * pi / 4)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "T",
				root: "t",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "M_PI/4" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "pi/4",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "pi/4" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "pi/4" } }],
				},
				quirk: {
					name: "Z^¼",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(1j * np.pi / 4)]]",
				},
				aqasm: {
					name: "T",
					controlled: true,
				},
			},
		},

		csdg: {
			description: "Controlled (-PI/2) rotation over Z-axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(-i * pi / 2)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "S&#8224;",
				root: "sdg",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "-M_PI/2" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/2",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "-1*pi/2" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "-1*pi/2" } }],
				},
				quirk: {
					name: "Z^-½",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(-1j * np.pi / 2)]]",
				},
				aqasm: {
					name: "S",
					controlled: true,
					dagger: true,
				},
			},
		},

		ctdg: {
			description: "Controlled (-PI/4) rotation over Z-axis",
			matrix: [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, "exp(-i * pi / 4)"],
			],
			numTargetQubits: 2,
			numControlQubits: 0,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box"],
				label: "T&#8224;",
				root: "tdg",
			},
			exportInfo: {
				quil: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				cirq: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				quest: {
					name: "controlledPhaseShift",
					params: { theta: "-M_PI/4" },
				},
				qsharp: {
					replacement: {
						name: "cu1",
						params: {
							lambda: "-pi/4",
						},
					},
				},
				qasm: {
					replacement: [{ name: "cu1", params: { lambda: "-1*pi/4" } }],
				},
				qiskit: {
					replacement: [{ name: "cu1", params: { lambda: "-1*pi/4" } }],
				},
				quirk: {
					name: "Z^-¼",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0],[0,1,0,0],[0, 0, 1, 0],[0, 0, 0, np.exp(-1j * np.pi / 4)]]",
				},
				aqasm: {
					name: "T",
					controlled: true,
					dagger: true,
				},
			},
		},

		ccx: {
			description: 'Toffoli aka "CCNOT" gate',
			matrix: [
				[1, 0, 0, 0, 0, 0, 0, 0],
				[0, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 1, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1],
				[0, 0, 0, 0, 0, 0, 1, 0],
			],
			numTargetQubits: 1,
			numControlQubits: 2,
			params: [],
			drawingInfo: {
				connectors: ["dot", "dot", "not"],
				label: "CCNOT",
				root: "x",
			},
			exportInfo: {
				quil: {
					name: "CCNOT",
				},
				cirq: {
					name: "CCX",
					notTfqSupported: true,
				},
				quest: {
					name: "ccx",
					func:
						"void ccx(Qureg qubits, const int q1, const int q2, const int q3) {\n" +
						"    hadamard(qubits, q3);\n" +
						"    controlledNot(qubits, q2, q3);\n" +
						"    phaseShift(qubits, q3, -M_PI/4);\n" +
						"    controlledNot(qubits, q1, q3);\n" +
						"    tGate(qubits, q3);\n" +
						"    controlledNot(qubits, q2, q3);\n" +
						"    phaseShift(qubits, q3, -M_PI/4);\n" +
						"    controlledNot(qubits, q1, q3);\n" +
						"    tGate(qubits, q2);\n" +
						"    tGate(qubits, q3);\n" +
						"    controlledNot(qubits, q1, q2);\n" +
						"    hadamard(qubits, q3);\n" +
						"    tGate(qubits, q1);\n" +
						"    phaseShift(qubits, q2, -M_PI/4);\n" +
						"    controlledNot(qubits, q1, q2);\n}",
				},
				qsharp: {
					name: "CCNOT",
				},
				quirk: {
					name: "X",
					controlled: true,
				},
				braket: {
					name: "ccnot",
				},
				aqasm: {
					name: "CCNOT",
				},
			},
		},

		cswap: {
			description: 'Controlled swap aka "Fredkin" gate',
			matrix: [
				[1, 0, 0, 0, 0, 0, 0, 0],
				[0, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, 0, 1, 0],
				[0, 0, 0, 0, 0, 1, 0, 0],
				[0, 0, 0, 0, 0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "x", "x"],
				label: "SWP",
				root: "swap",
			},
			exportInfo: {
				cirq: {
					name: "CSWAP",
				},
				quest: {
					name: "cswap",
					func:
						"void cswap(Qureg qubits, const int q1, const int q2, const int q3) {\n" +
						"    controlledNot(qubits, q3, q2);\n" +
						"    hadamard(qubits, q3);\n" +
						"    controlledNot(qubits, q2, q3);\n" +
						"    phaseShift(qubits, q3, -M_PI/4);\n" +
						"    controlledNot(qubits, q1, q3);\n" +
						"    tGate(qubits, q3);\n" +
						"    controlledNot(qubits, q2, q3);\n" +
						"    phaseShift(qubits, q3, -M_PI/4);\n" +
						"    controlledNot(qubits, q1, q3);\n" +
						"    tGate(qubits, q2);\n" +
						"    tGate(qubits, q3);\n" +
						"    hadamard(qubits, q3);\n" +
						"    controlledNot(qubits, q1, q2);\n" +
						"    tGate(qubits, q1);\n" +
						"    phaseShift(qubits, q2, -M_PI/4);\n" +
						"    controlledNot(qubits, q2, q3);\n" +
						"    controlledNot(qubits, q3, q2);\n}",
				},
				qsharp: {
					name: "Controlled SWAP",
				},
				quil: {
					name: "CSWAP",
				},
				pyquil: {
					name: "CSWAP",
				},
				quirk: {
					name: "Swap",
					controlled: true,
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0,0,0,0,0], [0,1,0,0,0,0,0,0], [0,0,1,0,0,0,0,0], [0,0,0,1,0,0,0,0], [0,0,0,0,1,0,0,0], [0,0,0,0,0,0,1,0], [0,0,0,0,0,1,0,0], [0,0,0,0,0,0,0,1]]",
				},
				aqasm: {
					name: "SWAP",
					controlled: true,
				},
			},
		},

		csrswap: {
			description: "Controlled square root of swap",
			matrix: [
				[1, 0, 0, 0, 0, 0, 0, 0],
				[0, 1, 0, 0, 0, 0, 0, 0],
				[0, 0, 1, 0, 0, 0, 0, 0],
				[0, 0, 0, 1, 0, 0, 0, 0],
				[0, 0, 0, 0, 1, 0, 0, 0],
				[0, 0, 0, 0, 0, "0.5 * (1 + i)", "0.5 * (1 - i)", 0],
				[0, 0, 0, 0, 0, "0.5 * (1 - i)", "0.5 * (1 + i)", 0],
				[0, 0, 0, 0, 0, 0, 0, 1],
			],
			numTargetQubits: 2,
			numControlQubits: 1,
			params: [],
			drawingInfo: {
				connectors: ["dot", "box", "box"],
				label: "&#x221A;SWP",
				root: "srswap",
			},
			exportInfo: {
				quest: {
					name: "csrswap",
					//@TODO add function
					func: "TODO",
				},
				cirq: {
					replacement: {
						name: "srswap",
						type: "controlled",
						notTfqSupported: true,
					},
				},
				quil: {
					name: "csrswap",
					defgate:
						"DEFGATE csrswap:\n    1, 0, 0, 0, 0, 0, 0, 0\n    0, 1, 0, 0, 0, 0, 0, 0\n    0, 0, 1, 0, 0, 0, 0, 0\n    0, 0, 0, 1, 0, 0, 0, 0\n    0, 0, 0, 0, 1, 0, 0, 0\n    0, 0, 0, 0, 0, 0.5+0.5i, 0.5-0.5i, 0\n    0, 0, 0, 0, 0, 0.5-0.5i, 0.5+0.5i, 0\n    0, 0, 0, 0, 0, 0, 0, 1",
				},
				pyquil: {
					name: "csrswap",
					array:
						"[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]",
				},
				braket: {
					name: "unitary",
					array:
						"[[1,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0],[0,0,1,0,0,0,0,0],[0,0,0,1,0,0,0,0],[0,0,0,0,1,0,0,0],[0,0,0,0,0,0.5 * (1 + 1j),0.5 * (1 - 1j),0],[0,0,0,0,0,0.5 * (1 - 1j),0.5 * (1 + 1j),0],[0,0,0,0,0,0,0,1]]",
				},
				aqasm: {
					name: "SQRTSWAP",
					controlled: true,
				},
			},
		},

		reset: {
			description: "Resets qubit",
			matrix: [],
			params: [],
			drawingInfo: {
				connectors: ["box"],
				label: "RST",
			},
			exportInfo: {
				quil: {
					name: "RESET",
				},
				cirq: {
					name: "reset",
					notTfqSupported: true,
				},
				quest: {
					name: "reset",
					//@TODO add function
					func: "TODO",
				},
				qsharp: {
					name: "Reset",
				},
			},
		},

		measure: {
			description: "Measures qubit and stores chance (0 or 1) into classical bit",
			matrix: [],
			params: [],
			drawingInfo: {
				connectors: ["gauge"],
				label: "",
			},
			exportInfo: {
				quil: {
					name: "MEASURE",
				},
				cirq: {
					name: "measure",
				},
				quest: {
					name: "measure",
				},
				qsharp: {
					name: "M",
				},
			},
		},
	};

	this.init(numQubits);
};

QuantumCircuit.prototype.defaultHybridOptions = function () {
	return {
		optimizer: "Powell",
		tolerance: 0.001,
		costFunction: {
			python: "",
			javascript: "",
		},
	};
};

QuantumCircuit.prototype.init = function (numQubits, options) {
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
	};

	if (!options.keepCustomGates) {
		this.customGates = {};
	}

	this.cregs = {};
	this.collapsed = [];
	this.prob = [];
	this.measureResetsQubit = false;
	this.reverseBitOrder = false;

	this.clear();
};

QuantumCircuit.prototype.clearGates = function () {
	this.gates = [];
	for (let i = 0; i < this.numQubits; i++) {
		this.gates.push([]);
	}
};

QuantumCircuit.prototype.clear = function () {
	this.clearGates();
	this.initState();
};

QuantumCircuit.prototype.resetState = function () {
	// reset state
	this.state = {};
	this.stateBits = 0;
	this.partitionCache = {};

	// reset cregs
	for (let creg in this.cregs) {
		const len = this.cregs[creg].length || 0;
		this.cregs[creg] = [];
		for (let i = 0; i < len; i++) {
			this.cregs[creg].push(0);
		}
	}

	// reset measurement
	this.collapsed = [];
	this.prob = [];

	// reset statistics
	this.stats = {
		duration: 0,
	};
};

QuantumCircuit.prototype.initState = function () {
	this.resetState();
	this.state["0"] = math.complex(1, 0);
};

QuantumCircuit.prototype.formatComplex = function (complex, options) {
	return formatComplex2(complex.re, complex.im, options);
};

QuantumCircuit.prototype.multiplySquareMatrices = function (m1, m2) {
	const len = m1.length;

	let c = len;
	let d = len;
	let k = len;

	const res = [];
	while (c--) {
		res[c] = [];
		d = len;
		while (d--) {
			res[c][d] = 0;
			k = len;
			while (k--) {
				if (m1[c][k] && m2[k][d]) {
					if (res[c][d]) {
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

QuantumCircuit.prototype.isIdentityMatrix = function (m, precision) {
	if (typeof precision == "undefined") {
		precision = 14;
	}

	for (let i = 0; i < m.length; i++) {
		for (let j = 0; j < m.length; j++) {
			// TODO: making this === breaks testing (KE)
			if (math.round(m[i][j], precision) != (i === j ? 1 : 0)) {
				return false;
			}
		}
	}
	return true;
};

QuantumCircuit.prototype.isUnitaryMatrix = function (U, precision) {
	return this.isIdentityMatrix(math.multiply(U, math.ctranspose(U)), precision);
};

QuantumCircuit.prototype.isHermitianMatrix = function (H, precision) {
	const diff = this.matrixDiff(H, math.ctranspose(H));

	return diff <= math.pow(10, -1 * (precision || 14));
};

QuantumCircuit.prototype.matrixDiff = function (matrix1, matrix2) {
	let total = 0;
	let count = 0;
	for (let r = 0; r < matrix1.length; r++) {
		const row1 = matrix1[r];
		const row2 = matrix2[r];
		for (let c = 0; c < row1.length; c++) {
			const item1 = row1[c];
			const item2 = row2[c];

			const i1 = typeof item1 == "object" ? item1 : math.complex(item1);
			const i2 = typeof item2 == "object" ? item2 : math.complex(item2);

			// distance in the complex plane
			const distance = math.abs(math.subtract(i1, i2));

			total += distance;

			count++;
		}
	}

	return count ? total / count : 0;
};

//
// Extract variables from expression string and returns object with expression string and array of variable names
// Note that symbol "j" is automatically converted to "i" (imaginary unit used in python is "j" but we need "i")
//
QuantumCircuit.prototype.parseMathString = function (str) {
	const variables = [];

	// convert imaginary unit "j" to "i"
	const mathToStringHandler = function (node) {
		if (node.isSymbolNode) {
			if (node.name === "j") {
				return "i";
			}

			if (variables.indexOf(node.name) < 0) {
				variables.push(node.name);
			}
		}
	};

	const node = math.parse(str.replace(/[\t\n\r]/gm, ""));

	const expression = node.toString({ handler: mathToStringHandler });

	return {
		expression: expression,
		variables: variables,
		node: node,
	};
};

//
// Evaluate expression
//
QuantumCircuit.prototype.evalMathString = function (str, vars) {
	vars = vars || {};

	const parsed = this.parseMathString(str);

	const res = math.evaluate(parsed.expression, vars);
	if (res instanceof math.Matrix) {
		return res.toArray();
	}

	return res;
};

QuantumCircuit.prototype.parseMatrix = function (M, vars) {
	const self = this;

	let A;
	if (typeof M == "string") {
		A = self.evalMathString(M, vars);
	} else {
		A = M;
	}

	const res = [];

	A.map(function (row, rowIndex) {
		if (Array.isArray(row)) {
			res.push([]);
			row.map(function (val) {
				if (typeof val == "string") {
					res[rowIndex].push(self.evalMathString(val, vars));
				} else {
					res[rowIndex].push(val);
				}
			});
		} else {
			if (typeof row == "string") {
				res.push(self.evalMathString(row, vars));
			} else {
				res.push(row);
			}
		}
	});

	return res;
};

QuantumCircuit.prototype.matrixHasComplexElement = function (M) {
	for (let r = 0; r < M.length; r++) {
		const row = M[r];

		if (row instanceof Array) {
			for (let c = 0; c < row.length; c++) {
				const cell = row[c];

				if (
					cell instanceof math.Complex ||
					(typeof cell == "object" &&
						((cell.mathjs && cell.mathjs === "Complex") ||
							(cell.type && cell.type === "Complex")))
				) {
					return true;
				}
			}
		} else {
			if (
				row instanceof math.Complex ||
				(typeof row == "object" &&
					((row.mathjs && row.mathjs === "Complex") ||
						(row.type && row.type === "Complex")))
			) {
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
QuantumCircuit.prototype.matrixZeroImagToReal = function (M) {
	for (let r = 0; r < M.length; r++) {
		const row = M[r];

		if (row instanceof Array) {
			for (let c = 0; c < row.length; c++) {
				const cell = row[c];

				if (
					cell instanceof math.Complex ||
					(typeof cell == "object" &&
						((cell.mathjs && cell.mathjs === "Complex") ||
							(cell.type && cell.type === "Complex")))
				) {
					if (math.im(cell) === 0) {
						M[r][c] = math.re(cell);
					}
				}
			}
		} else {
			if (
				row instanceof math.Complex ||
				(typeof row == "object" &&
					((row.mathjs && row.mathjs === "Complex") ||
						(row.type && row.type === "Complex")))
			) {
				if (math.im(row) === 0) {
					M[r] = math.re(row);
				}
			}
		}
	}
	return M;
};

//
// Options: {
//     minify:         false
//	   fixedWidth:     false
//     decimalPlaces:  14,
//     iotaChar:       "i"
// }
//
QuantumCircuit.prototype.stringifyMatrix = function (M, options) {
	const self = this;

	// mathjs Matrix to array
	const A = M.toArray ? M.toArray() : M;

	options = options || {};

	let forceComplex = false;
	if (options.fixedWidth) {
		// forceComplex if matrix has at least one complex element
		forceComplex = this.matrixHasComplexElement(A);
	}

	let str = "";
	str += "[";
	A.map(function (row, rowIndex) {
		if (rowIndex > 0) {
			str += ",";
		}
		if (!options.minify) {
			str += "\n  ";
		} else {
			str += " ";
		}

		if (row instanceof Array) {
			str += "[";
			row.map(function (el, elIndex) {
				if (elIndex > 0) {
					str += ", ";
				}
				if (el instanceof math.Complex) {
					str += self.formatComplex(el, options);
				} else {
					if (
						typeof el == "object" &&
						((el.mathjs && el.mathjs === "Complex") ||
							(el.type && el.type === "Complex"))
					) {
						str += formatComplex2(el.re, el.im, options);
					} else {
						if (typeof el == "string") {
							// expression
							str += el;
						} else {
							if (forceComplex) {
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
			if (row instanceof math.Complex) {
				str += self.formatComplex(row, options);
			} else {
				if (
					typeof row == "object" &&
					((row.mathjs && row.mathjs === "Complex") ||
						(row.type && row.type === "Complex"))
				) {
					str += formatComplex2(el.re, el.im, options);
				} else {
					if (typeof row == "string") {
						// expression
						str += row;
					} else {
						if (forceComplex) {
							str += formatComplex2(row, 0, options);
						} else {
							str += formatFloat(row, options);
						}
					}
				}
			}
		}
	});
	if (A.length) {
		if (!options.minify) {
			str += "\n";
		} else {
			str += " ";
		}
	}
	str += "]";

	return str;
};

QuantumCircuit.prototype.matrixRe = function (U) {
	const newRow = [];
	const res = [];
	for (let r = 0; r < U.length; r++) {
		const row = U[r];
		if (Array.isArray(row)) {
			for (let c = 0; c < row.length; c++) {
				if (typeof row[c] == "object") {
					newRow.push(row[c].re);
				} else {
					newRow.push(row[c]);
				}
			}
			res.push(newRow);
		} else {
			if (typeof row == "object") {
				newRow.push(row.re);
			} else {
				newRow.push(row);
			}
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixIm = function (U) {
	const newRow = [];
	const res = [];
	for (let r = 0; r < U.length; r++) {
		const row = U[r];
		if (Array.isArray(row)) {
			for (let c = 0; c < row.length; c++) {
				if (typeof row[c] == "object") {
					newRow.push(row[c].im);
				} else {
					newRow.push(0);
				}
			}
			res.push(newRow);
		} else {
			if (typeof row == "object") {
				newRow.push(row.im);
			} else {
				newRow.push(0);
			}
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixAbs = function (U) {
	const res = [];
	for (let r = 0; r < U.length; r++) {
		const row = U[r];
		if (Array.isArray(row)) {
			const newRow = [];
			for (let c = 0; c < row.length; c++) {
				newRow.push(math.abs(row[c]));
			}
			res.push(newRow);
		} else {
			res.push(math.abs(row));
		}
	}

	return res;
};

QuantumCircuit.prototype.matrixArg = function (U) {
	const res = [];
	for (let r = 0; r < U.length; r++) {
		const row = U[r];
		if (Array.isArray(row)) {
			const newRow = [];
			for (let c = 0; c < row.length; c++) {
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

QuantumCircuit.prototype.setCombinedState = function (combineList) {
	let itemIndex;
	let i;
	let item;
	const newState = {};
	let newStateBits = 0;
	let totalQubits = 0;
	for (itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
		item = combineList[itemIndex];
		// calculate number of qubits based on wireMap
		item.wires.map(function (dest) {
			if (dest + 1 > totalQubits) {
				totalQubits = dest + 1;
			}
		});
	}

	const bitMaps = [];
	for (itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
		item = combineList[itemIndex];

		const cmap = [];
		item.wires.map(function (dest, source) {
			cmap.push({
				and: 1 << (totalQubits - 1 - dest),
				or: 1 << (item.circuit.numQubits - 1 - source),
			});
		});

		bitMaps.push(cmap);
	}

	const n3 = 1 << totalQubits;
	for (let a3 = 0; a3 < n3; a3++) {
		let s3 = null;
		for (itemIndex = 0; itemIndex < combineList.length; itemIndex++) {
			const map = bitMaps[itemIndex];

			let a1 = 0;
			for (i = 0; i < map.length; i++) {
				if (a3 & map[i].and) {
					a1 |= map[i].or;
				}
			}

			item = combineList[itemIndex];
			const s1 = item.circuit.state[a1];
			if (s1) {
				if (s3 == null) {
					s3 = s1;
				} else {
					s3 = math.multiply(s1, s3);
				}
			} else {
				s3 = math.complex(0, 0);
			}
		}

		if (s3 && (s3.re || s3.im)) {
			newState[a3] = s3;
			newStateBits |= a3;
		}
	}

	this.resetState();
	// expand circuit if needed
	if (this.numQubits < totalQubits) {
		this.numQubits = totalQubits;

		while (this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		const numCols = this.numCols();
		for (i = 0; i < this.gates.length; i++) {
			while (this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	this.state = newState;
	this.stateBits = newStateBits;

	if (this.stateBits === 0 && Object.keys(this.state).length === 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

//
// Combines state vectors of two evaluated circuits and stores resulting vector into this.
//
QuantumCircuit.prototype._setCombinedState = function (c1, c2, options) {
	let i;
	options = options || {};

	const q1 = c1.numQubits;
	const q2 = c2.numQubits;

	// create wireMap if not provided
	if (!options.wireMap) {
		options.wireMap = {
			c1: [],
			c2: [],
		};

		for (i = 0; i < q1; i++) {
			options.wireMap.c1.push(i);
		}

		for (i = 0; i < q2; i++) {
			options.wireMap.c2.push(i + q1);
		}
	}

	// calculate number of qubits based on wireMap
	let q3 = 0;
	options.wireMap.c1.map(function (dest) {
		if (dest + 1 > q3) {
			q3 = dest + 1;
		}
	});
	options.wireMap.c2.map(function (dest) {
		if (dest + 1 > q3) {
			q3 = dest + 1;
		}
	});

	// create bit map for circuit 1
	const c1map = [];
	options.wireMap.c1.map(function (dest, source) {
		c1map.push({ and: 1 << (q3 - 1 - dest), or: 1 << (q1 - 1 - source) });
	});

	// create bit map for circuit 2
	const c2map = [];
	options.wireMap.c2.map(function (dest, source) {
		c2map.push({ and: 1 << (q3 - 1 - dest), or: 1 << (q2 - 1 - source) });
	});

	let unused = 0;
	for (i = 0; i < q3; i++) {
		if (options.wireMap.c1.indexOf(i) < 0 && options.wireMap.c2.indexOf(i) < 0) {
			unused |= 1 << (q3 - 1 - i);
		}
	}

	const newState = {};
	let newStateBits = 0;

	const n3 = 1 << q3;
	for (let a3 = 0; a3 < n3; a3++) {
		if (!(a3 & unused)) {
			let a1 = 0;
			for (i = 0; i < c1map.length; i++) {
				if (a3 & c1map[i].and) a1 |= c1map[i].or;
			}

			let a2 = 0;
			for (i = 0; i < c2map.length; i++) {
				if (a3 & c2map[i].and) a2 |= c2map[i].or;
			}

			const s1 = c1.state[a1];
			if (s1) {
				const s2 = c2.state[a2];
				if (s2) {
					const s3 = math.multiply(s1, s2);
					if (s3.re || s3.im) {
						newState[a3] = s3;
						newStateBits |= a3;
					}
				}
			}
		}
	}

	this.resetState();
	// expand circuit if needed
	if (this.numQubits < q3) {
		this.numQubits = q3;

		while (this.gates.length < this.numQubits) {
			this.gates.push([]);
		}
		const numCols = this.numCols();
		for (i = 0; i < this.gates.length; i++) {
			while (this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	this.state = newState;
	this.stateBits = newStateBits;

	if (this.stateBits === 0 && Object.keys(this.state).length === 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

// Add qubits preserving state
QuantumCircuit.prototype.appendQubits = function (numQubits) {
	const c = new QuantumCircuit(numQubits);
	this._setCombinedState(this, c);
};

QuantumCircuit.prototype.numAmplitudes = function (onlyPossible) {
	if (onlyPossible) {
		let possibleCount = 0;
		for (let is in this.state) {
			const state = math.round(this.state[is], 14);
			if (state.re || state.im) {
				possibleCount++;
			}
		}
		return possibleCount;
	}

	return math.pow(2, this.numQubits);
};

QuantumCircuit.prototype.numCols = function () {
	return this.gates.length ? this.gates[0].length : 0;
};

QuantumCircuit.prototype.numGates = function (decompose) {
	let circuit;
	if (decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	let numGates = 0;
	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				numGates++;
			}
		}
	}

	return numGates;
};

QuantumCircuit.prototype.isEmptyCell = function (col, wire) {
	if (this.gates[wire] && this.gates[wire][col]) {
		return false;
	}

	for (let w = 0; w < this.numQubits; w++) {
		const gate = this.getGateAt(col, w);
		if (gate) {
			if (
				gate.name === "measure" ||
				(gate.options && gate.options.condition && gate.options.condition.creg) ||
				(Math.min.apply(null, gate.wires) < wire &&
					Math.max.apply(null, gate.wires) > wire)
			) {
				return false;
			}
		}
	}

	return true;
};

QuantumCircuit.prototype.isEmptyPlace = function (col, wires, usingCregs) {
	const minWire = Math.min.apply(null, wires);
	let maxWire = Math.max.apply(null, wires);

	if (usingCregs) {
		const mx = this.numQubits - 1;
		if (mx > maxWire) {
			maxWire = mx;
		}
	}

	let allEmpty = true;
	for (let wire = minWire; wire <= maxWire; wire++) {
		if (!this.isEmptyCell(col, wire)) {
			allEmpty = false;
			break;
		}
	}

	return allEmpty;
};

QuantumCircuit.prototype.lastNonEmptyPlace = function (wires, usingCregs) {
	let col = this.numCols();
	let allEmpty = true;

	const minWire = Math.min.apply(null, wires);
	let maxWire = Math.max.apply(null, wires);

	if (usingCregs) {
		const mx = this.numQubits - 1;
		if (mx > maxWire) {
			maxWire = mx;
		}
	}

	while (allEmpty && col--) {
		for (let wire = minWire; wire <= maxWire; wire++) {
			if (!this.isEmptyCell(col, wire)) {
				allEmpty = false;
				break;
			}
		}
	}

	return col;
};

QuantumCircuit.prototype.insertColumn = function (colIndex) {
	for (let i = 0; i < this.numQubits; i++) {
		this.gates[i].splice(colIndex || 0, 0, null);
	}
};

QuantumCircuit.prototype.randomString = function (len) {
	len = len || 17;

	let text = "";
	// let first char to be letter
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	text += charset.charAt(Math.floor(Math.random() * charset.length));

	// other chars can be letters and numbers
	charset += "0123456789";
	for (let i = 0; i < len; i++) {
		text += charset.charAt(Math.floor(Math.random() * charset.length));
	}

	return text;
};

QuantumCircuit.prototype.addGate = function (gateName, column, wires, options) {
	let i;
	const wireList = [];
	if (Array.isArray(wires)) {
		for (i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
	}

	if (column < 0) {
		column =
			this.lastNonEmptyPlace(
				wireList,
				gateName === "measure" ||
					(options && options.condition && options.condition.creg),
			) + 1;
	}

	const numConnectors = wireList.length;
	const id = this.randomString();
	for (let connector = 0; connector < numConnectors; connector++) {
		const wire = wireList[connector];

		if (wire + 1 > this.numQubits) {
			this.numQubits = wire + 1;
		}

		while (this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		let numCols = this.numCols();
		if (column + 1 > numCols) {
			numCols = column + 1;
		}

		for (i = 0; i < this.gates.length; i++) {
			while (this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}

		const gate = {
			id: id,
			name: gateName,
			connector: connector,
			options: {},
		};

		if (options) {
			gate.options = options;

			// extend creg if required
			if (
				options.creg &&
				options.creg["name"] &&
				typeof options.creg["bit"] != "undefined"
			) {
				let cregBit = parseInt(options.creg.bit || 0);
				if (isNaN(cregBit)) {
					cregBit = 0;
				}
				const existingCreg = this.cregs[options.creg.name] || [];
				const currentValue =
					existingCreg.length > cregBit ? existingCreg[options.creg.bit] : 0;
				this.setCregBit(options.creg.name, cregBit, currentValue);
			}
		}

		this.gates[wire][column] = gate;
	}
	return id;
};

QuantumCircuit.prototype.appendGate = function (gateName, wires, options) {
	return this.addGate(gateName, -1, wires, options);
};

QuantumCircuit.prototype.insertGate = function (
	gateName,
	column,
	wires,
	options,
) {
	let i;
	const wireList = [];
	if (Array.isArray(wires)) {
		for (i = 0; i < wires.length; i++) {
			wireList.push(wires[i]);
		}
	} else {
		wireList.push(wires);
	}

	if (column < 0) {
		column =
			this.lastNonEmptyPlace(
				wireList,
				(!!gateName && gateName === "measure") ||
					(options && options.condition && options.condition.creg),
			) + 1;
	}

	const numConnectors = wireList.length;
	for (let connector = 0; connector < numConnectors; connector++) {
		const wire = wireList[connector];

		if (wire + 1 > this.numQubits) {
			this.numQubits = wire + 1;
		}

		while (this.gates.length < this.numQubits) {
			this.gates.push([]);
		}

		let numCols = this.numCols();
		if (column + 1 > numCols) {
			numCols = column + 1;
		}

		for (i = 0; i < this.gates.length; i++) {
			while (this.gates[i].length < numCols) {
				this.gates[i].push(null);
			}
		}
	}

	if (
		!this.isEmptyPlace(
			column,
			wireList,
			(!!gateName && gateName === "measure") ||
				(options && options.condition && options.condition.creg),
		)
	) {
		this.insertColumn(column);
	}

	let id = null;
	if (gateName) {
		id = this.addGate(gateName, column, wireList, options);
	}
	return id;
};

QuantumCircuit.prototype.insertSpace = function (column, wires) {
	return this.insertGate(null, column, wires, null);
};

QuantumCircuit.prototype.removeGateAt = function (column, wire) {
	if (!this.gates[wire]) {
		return;
	}

	const gate = this.gates[wire][column];
	if (!gate) {
		return;
	}

	const id = gate.id;

	const numWires = this.gates.length;
	for (let w = 0; w < numWires; w++) {
		const cell = this.gates[w][column];
		if (cell && cell.id === id) {
			this.gates[w][column] = null;
		}
	}
};

QuantumCircuit.prototype.removeGate = function (gateId) {
	const gatePos = this.getGatePosById(gateId);
	if (!gatePos || gatePos.col < 0 || !gatePos.wires.length) {
		return;
	}

	this.removeGateAt(gatePos.col, gatePos.wires[0]);
};

QuantumCircuit.prototype.addMeasure = function (wire, creg, cbit) {
	this.addGate("measure", -1, wire, { creg: { name: creg, bit: cbit } });
};

QuantumCircuit.prototype.appendCircuit = function (circuit) {
	const colOffset = this.numCols();

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (!this.basicGates[gate.name] && circuit.customGates[gate.name]) {
					this.registerGate(gate.name, circuit.customGates[gate.name]);
				}

				this.addGate(gate.name, column + colOffset, gate.wires, gate.options);
			}
		}
	}
};

QuantumCircuit.prototype.removeTrailingColumns = function () {
	const numCols = this.numCols();
	for (let column = numCols - 1; column >= 0; column--) {
		let wire;
		let isEmptyCol = true;
		for (wire = 0; wire < this.numQubits; wire++) {
			const gate = this.gates[wire][column];
			if (gate) {
				isEmptyCol = false;
				break;
			}
		}

		if (!isEmptyCol) {
			return;
		}

		for (wire = 0; wire < this.numQubits; wire++) {
			this.gates[wire].pop();
		}
	}
};

QuantumCircuit.prototype.removeLeadingColumns = function () {
	let emptyCount = 0;
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		let isEmptyCol = true;
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.gates[wire][column];
			if (gate) {
				isEmptyCol = false;
				break;
			}
		}

		if (!isEmptyCol) {
			break;
		}

		emptyCount++;
	}

	for (let i = 0; i < emptyCount; i++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			this.gates[wire].shift();
		}
	}
};

QuantumCircuit.prototype.removeTrailingRows = function () {
	const numCols = this.numCols();
	for (let wire = this.numQubits - 1; wire >= 0; wire--) {
		let isEmptyRow = true;
		for (let column = 0; column < numCols; column++) {
			const gate = this.gates[wire][column];
			if (gate) {
				isEmptyRow = false;
				break;
			}
		}

		if (!isEmptyRow) {
			return;
		}
		this.gates.pop();
		this.numQubits--;
	}
};

QuantumCircuit.prototype.removeQubit = function (wire) {
	let col;
	if (!this.gates[wire]) {
		return;
	}

	this.resetState();

	const numCols = this.numCols();
	for (col = 0; col < numCols; col++) {
		this.removeGateAt(col, wire);
	}

	for (let w = wire + 1; w < this.numQubits; w++) {
		for (col = 0; col < numCols; col++) {
			this.gates[w - 1][col] = this.gates[w][col];
		}
	}

	this.gates.pop();
	this.numQubits--;
};

QuantumCircuit.prototype.flipVertically = function () {
	this.resetState();

	const numCols = this.numCols();
	const lastQubit = this.numQubits - 1;
	for (let w = 0; w < this.numQubits / 2; w++) {
		for (let col = 0; col < numCols; col++) {
			const tmp = this.gates[w][col];
			this.gates[w][col] = this.gates[lastQubit - w][col];
			this.gates[lastQubit - w][col] = tmp;
		}
	}
};

QuantumCircuit.prototype.flipHorizontally = function () {
	this.resetState();

	const numCols = this.numCols();
	const lastCol = numCols - 1;
	for (let w = 0; w < this.numQubits; w++) {
		for (let col = 0; col < numCols / 2; col++) {
			const tmp = this.gates[w][col];
			this.gates[w][col] = this.gates[w][lastCol - col];
			this.gates[w][lastCol - col] = tmp;
		}
	}
};

QuantumCircuit.prototype.applyTransform = function (U, qubits) {
	const newState = {};
	let newStateBits = 0;

	// clone list of wires to itself (remove reference to original array)
	qubits = qubits.slice(0);

	// reverse bit order
	if (this.reverseBitOrder) {
		// convert index from 0-based to end-based
		for (let i = 0; i < qubits.length; i++) {
			qubits[i] = this.numQubits - 1 - qubits[i];
		}
	}

	qubits.reverse();

	// list of wires not used by this gate
	const unused = [];
	for (let i = 0; i < this.numQubits; i++) {
		if (qubits.indexOf(i) < 0) {
			unused.push(i);
		}
	}

	const unusedCount = unused.length;
	const unusedSpace = 1 << unusedCount;

	function getElMask(el) {
		let res = 0;
		qubits.map(function (qubit, index) {
			if (el & (1 << index)) {
				res |= 1 << qubit;
			}
		});
		return res;
	}

	function getIncMask() {
		let res = 0;
		qubits.map(function (qubit) {
			res |= 1 << qubit;
		});
		return res + 1;
	}

	function getNotMask() {
		let res = 0;
		unused.map(function (qubit) {
			res |= 1 << qubit;
		});
		return res;
	}

	const ZERO = math.complex(0, 0);

	for (let elrow = 0; elrow < U.length; elrow++) {
		const rowmask = getElMask(elrow);

		for (let elcol = 0; elcol < U[elrow].length; elcol++) {
			const colmask = getElMask(elcol);

			if ((this.stateBits & colmask) === colmask) {
				const uval = U[elrow][elcol];
				if (uval) {
					let row = rowmask;
					let col = colmask;

					let counter = unusedSpace;
					const countermask = getElMask(0);
					const incmask = getIncMask();
					const notmask = getNotMask();
					let toothless = countermask;
					while (counter--) {
						const state = this.state[col];
						if (state) {
							row = toothless | rowmask;

							if (uval === 1) {
								newState[row] = math.add(newState[row] || ZERO, state);
							} else {
								newState[row] = math.add(
									newState[row] || ZERO,
									math.multiply(uval, state),
								);
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

	if (this.stateBits === 0 && Object.keys(this.state).length === 0) {
		this.state["0"] = math.complex(1, 0);
	}
};

//
// `endianness` can be:
//     null - this is default and depends on this.reverseBitOrder
//     "big" - big endian (like Rigetti/pyQuil)
//     "little" - little endian (like IBM/Qiskit)
//
QuantumCircuit.prototype.transformMatrix = function (
	totalQubits,
	U,
	targetQubits,
	endianness,
) {
	let i;
// clone list of wires to itself (remove reference to original array)
	targetQubits = targetQubits.slice(0);

	let reverseBits;
	if (!endianness) {
		reverseBits = !this.reverseBitOrder;
	} else {
		reverseBits = endianness === "big";
	}

	// reverse bit order
	if (reverseBits) {
		// convert index from 0-based to end-based
		for (i = 0; i < targetQubits.length; i++) {
			targetQubits[i] = totalQubits - 1 - targetQubits[i];
		}
	}

	targetQubits.reverse();

	// list of wires not used by this gate
	const unused = [];
	for (i = 0; i < totalQubits; i++) {
		if (targetQubits.indexOf(i) < 0) {
			unused.push(i);
		}
	}

	const unusedCount = unused.length;
	const unusedSpace = 1 << unusedCount;

	function getElMask(el) {
		let res = 0;
		targetQubits.map(function (qubit, index) {
			if (el & (1 << index)) {
				res |= 1 << qubit;
			}
		});
		return res;
	}

	function getIncMask() {
		let res = 0;
		targetQubits.map(function (qubit) {
			res |= 1 << qubit;
		});
		return res + 1;
	}

	function getNotMask() {
		let res = 0;
		unused.map(function (qubit) {
			res |= 1 << qubit;
		});
		return res;
	}

	const T = math.zeros([1 << totalQubits, 1 << totalQubits]);

	for (let elrow = 0; elrow < U.length; elrow++) {
		const rowmask = getElMask(elrow);

		for (let elcol = 0; elcol < U[elrow].length; elcol++) {
			const colmask = getElMask(elcol);

			const uval = U[elrow][elcol];
			if (uval) {
				let row = rowmask;
				let col = colmask;

				let counter = unusedSpace;
				const countermask = getElMask(0);
				const incmask = getIncMask();
				const notmask = getNotMask();
				let toothless = countermask;
				while (counter--) {
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
QuantumCircuit.prototype.circuitMatrix = function (endianness) {
	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	if (decomposed.gotClassicalControl()) {
		return [];
	}

	let matrix = [];
	for (let col = decomposed.numCols() - 1; col >= 0; col--) {
		for (let wire = decomposed.numQubits - 1; wire >= 0; wire--) {
			const gate = decomposed.getGateAt(col, wire);
			if (gate && gate.connector === 0) {
				const gateDef = decomposed.basicGates[gate.name];
				if (!gateDef) {
					throw new Error('Unknown gate "' + gate.name + '"');
				}
				if (gateDef.matrix && gateDef.matrix.length) {
					const rawGate = decomposed.getRawGate(gateDef, gate.options);

					const U = decomposed.transformMatrix(
						decomposed.numQubits,
						rawGate,
						gate.wires,
						endianness,
					);

					if (!matrix || !matrix.length) {
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

QuantumCircuit.prototype.eigenvalues2x2 = function (A) {
	const M = this.parseMatrix(A);

	const eigen = [0, 0];

	const x = math.add(M[0][0], M[1][1]);

	eigen[0] = math.divide(
		math.add(
			x,
			math.sqrt(
				math.add(
					math.multiply(math.multiply(4, M[0][1]), M[1][0]),
					math.pow(math.subtract(M[0][0], M[1][1]), 2),
				),
			),
		),
		2,
	);
	eigen[1] = math.divide(
		math.subtract(
			x,
			math.sqrt(
				math.add(
					math.multiply(math.multiply(4, M[0][1]), M[1][0]),
					math.pow(math.subtract(M[0][0], M[1][1]), 2),
				),
			),
		),
		2,
	);

	return eigen;
};

QuantumCircuit.prototype.getBipartiteState = function (q1, q2) {
	const bipartiteState = {};
	let ampCount = 0;

	function specSumComplex(a, b) {
		const rawSum = math.add(a, b);
		const arg = rawSum.arg();
		return math.complex({
			abs: math.sqrt(math.pow(math.abs(a), 2) + math.pow(math.abs(b), 2)),
			arg: arg,
		});
	}

	for (let is in this.state) {
		const i = parseInt(is);
		let index = 0;
		const bit1 = i & (1 << q1) ? 1 : 0;
		const bit2 = i & (1 << q2) ? 2 : 0;

		index |= bit1;
		index |= bit2;

		if (typeof bipartiteState[index] != "undefined") {
			bipartiteState[index] = specSumComplex(
				bipartiteState[index],
				this.state[is],
			);
		} else {
			bipartiteState[index] = this.state[is];
		}

		ampCount++;
	}

	if (!ampCount) {
		bipartiteState["0"] = math.complex(1, 0);
	}

	return bipartiteState;
};

QuantumCircuit.prototype.chanceMap = function () {
	const map = {};
	for (let sour = 0; sour < this.numQubits; sour++) {
		for (let dest = 0; dest < this.numQubits; dest++) {
			if (!map[sour]) {
				map[sour] = {};
			}
			if (dest === sour) {
				map[sour][dest] = null;
			} else {
				map[sour][dest] = {};
			}
		}
	}

	for (let sour = 0; sour < this.numQubits; sour++) {
		for (let dest = sour + 1; dest < this.numQubits; dest++) {
			const reducedState = this.getBipartiteState(sour, dest);

			const circ = new QuantumCircuit(2);
			circ.state = reducedState;

			const radius = math.abs(circ.angles()[0].radius);

			const concurence = math.round(1 - math.pow(radius, 2), 7);

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
	let bin = n.toString(2);
	while (bin.length < len) {
		bin = "0" + bin;
	}
	return bin;
}

function reverseBitwise(n, len) {
	return parseInt(binStr(n, len).split("").reverse().join(""), 2);
}

QuantumCircuit.prototype.resetQubit = function (wire, value) {
	const U = [
		[0, 0],
		[0, 0],
	];

	let bit;
	if (this.reverseBitOrder) {
		bit = math.pow(2, this.numQubits - 1 - wire);
	} else {
		bit = math.pow(2, wire);
	}

	let prob = 0;
	for (let is in this.state) {
		const i = parseInt(is);
		if (value ? !!(i & bit) : !(i & bit)) {
			prob += math.pow(math.abs(this.state[is]), 2);
		}
	}

	prob = math.round(prob, 14);

	if (prob === 1) {
		return;
	}

	if (value) {
		if (prob === 0) {
			U[1][0] = 1;
		} else {
			U[1][1] = math.sqrt(1 / prob);
		}
	} else {
		if (prob === 0) {
			U[0][1] = 1;
		} else {
			U[0][0] = math.sqrt(1 / prob);
		}
	}

	this.collapsed = [];
	this.prob = [];
	this.applyTransform(U, [wire]);
};

QuantumCircuit.prototype.applyGate = function (
	gateName,
	column,
	wires,
	options,
) {
	if (gateName === "measure") {
		if (!options.creg) {
			throw 'Error: "measure" gate requires destination.';
		}

		const value = this.measure(wires[0], options.creg.name, options.creg.bit);

		let doReset = this.measureResetsQubit;
		if (!doReset) {
			for (let col = column; col < this.numCols(); col++) {
				const fromRow = col === column ? wires[0] : 0;
				for (let row = fromRow; row < this.numQubits; row++) {
					const g = this.gates[row][col];
					if (g && g.name !== "measure") {
						doReset = true;
						break;
					}
				}
				if (doReset) {
					break;
				}
			}
		}

		if (doReset) {
			this.resetQubit(wires[0], value);
		}

		return;
	}

	if (gateName === "reset") {
		this.resetQubit(wires[0], 0);
		return;
	}

	const gate = this.basicGates[gateName];
	if (!gate) {
		console.log('Unknown gate "' + gateName + '".');
		return;
	}

	const rawGate = this.getRawGate(gate, options);

	this.collapsed = [];
	this.prob = [];

	this.applyTransform(rawGate, wires);
};

QuantumCircuit.prototype.getRawGate = function (
	gate,
	gateOptions,
	globalOptions,
) {
	let globalParams =
		globalOptions && globalOptions.params
			? globalOptions.params
			: this.options && this.options.params
				? this.options.params
				: {};

	globalParams = JSON.parse(JSON.stringify(globalParams));
	for (let globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	const rawGate = [];
	gate.matrix.map(function (row) {
		const rawGateRow = [];
		row.map(function (item) {
			if (typeof item == "string") {
				const params = gateOptions ? gateOptions.params || {} : {};

				const vars = {};
				gate.params.map(function (varName, varIndex) {
					if (Array.isArray(params)) {
						// Deprecated. For backward compatibility only. "params" should be object - not array.
						vars[varName] =
							params.length > varIndex
								? math.evaluate(params[varIndex], globalParams)
								: null;
					} else {
						vars[varName] = math.evaluate(String(params[varName]), globalParams);
					}
				});

				const ev = math.evaluate(item, vars);
				rawGateRow.push(ev);
			} else {
				rawGateRow.push(item);
			}
		});
		rawGate.push(rawGateRow);
	});
	return rawGate;
};

QuantumCircuit.prototype.countParameterizedGates = function () {
	let parameterizedCount = 0;
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.options && gate.options.params) {
					let gateParamCount = 0;
					for (let paramName in gate.options.params) {
						gateParamCount++;
					}
					if (gateParamCount > 0) {
						parameterizedCount++;
					}
				}
			}
		}
	}
	return parameterizedCount;
};

QuantumCircuit.prototype.findGlobalParams = function () {
	const res = {
		globalParams: [],
		cells: [],
	};

	const extractVariables = function (s) {
		const vars = [];

		const mathToStringHandler = function (node) {
			if (node.isSymbolNode && !node.isFunctionNode && !math[node.name]) {
				vars.push(node.name);
			}
		};

		const node = math.parse(s);
		node.toString({ handler: mathToStringHandler });

		return vars;
	};

	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.options && gate.options.params) {
					let cellAdded = false;
					for (let gateParamName in gate.options.params) {
						const gateParamValue = gate.options.params[gateParamName];
						if (typeof gateParamValue == "string") {
							const globals = extractVariables(gateParamValue);

							if (globals.length) {
								for (let g = 0; g < globals.length; g++) {
									if (res.globalParams.indexOf(globals[g]) < 0) {
										res.globalParams.push(globals[g]);
									}
								}

								if (!cellAdded) {
									const maxWire = Math.max.apply(null, gate.wires);
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

QuantumCircuit.prototype.getGlobalParams = function () {
	return this.findGlobalParams().globalParams;
};

QuantumCircuit.prototype.gotGlobalParams = function () {
	const globalParams = this.getGlobalParams();

	return globalParams.length > 0;
};

QuantumCircuit.prototype.updateGlobalParams = function () {
	this.params = this.getGlobalParams();

	this.options = this.options || {};
	this.options.params = this.options.params || {};

	for (let i = 0; i < this.params.length; i++) {
		let paramName = this.params[i];
		if (typeof this.options.params[paramName] == "undefined") {
			this.options.params[paramName] = 0;
		}
	}

	for (let paramName in this.options.params) {
		if (this.params.indexOf(paramName) < 0) {
			delete this.options.params[paramName];
		}
	}

	return this.params;
};

QuantumCircuit.prototype.makeAllParamsGlobal = function () {
	const globalParams = this.getGlobalParams();

	const extractVariables = function (s) {
		const vars = [];

		const mathToStringHandler = function (node) {
			if (node.isSymbolNode && !node.isFunctionNode && !math[node.name]) {
				vars.push(node.name);
			}
		};

		const node = math.parse(s);
		node.toString({ handler: mathToStringHandler });

		return vars;
	};

	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.options && gate.options.params) {
					for (let gateParamName in gate.options.params) {
						const gateParamValue = gate.options.params[gateParamName];
						let isGlobal = false;
						if (typeof gateParamValue == "string") {
							const globals = extractVariables(gateParamValue);

							if (globals.length) {
								isGlobal = true;
							}
						}

						if (!isGlobal) {
							// Find unique global variable name
							let varIndex = 0;
							while (globalParams.indexOf("var" + varIndex) >= 0) {
								varIndex++;
							}
							const globalVarName = "var" + varIndex;
							globalParams.push(globalVarName);

							// Update gate
							for (let i = 0; i < gate.wires.length; i++) {
								const cell = this.gates[gate.wires[i]][column];
								cell.options.params[gateParamName] = globalVarName;
							}

							// Update circuit
							this.params.push(globalVarName);
							this.options.params[globalVarName] = gateParamValue;
						}
					}
				}
			}
		}
	}
};

QuantumCircuit.prototype.decompose = function (obj) {
	let tmpq;
	if (!obj.gates.length) {
		return obj;
	}

	this.updateGlobalParams();

	function injectArray(a1, a2, pos) {
		return a1.slice(0, pos).concat(a2).concat(a1.slice(pos));
	}

	for (let column = 0; column < obj.gates[0].length; column++) {
		for (let wire = 0; wire < obj.numQubits; wire++) {
			const gate = obj.gates[wire][column];
			if (gate && gate.connector === 0 && !this.basicGates[gate.name]) {
				const tmp = new QuantumCircuit();
				const custom = obj.customGates[gate.name];
				if (custom) {
					tmp.load(custom);
					// ---
					// circuit with params
					if (tmp.params.length && gate.options && gate.options.params) {
						const globalParams = gate.options.params;
						for (let cc = 0; cc < tmp.gates[0].length; cc++) {
							for (let ww = 0; ww < tmp.numQubits; ww++) {
								let gg = tmp.gates[ww][cc];
								if (gg && gg.connector === 0) {
									if (gg.options && gg.options.params) {
										for (let destParam in gg.options.params) {
											// parse param, replace variable with global param and assemble it back
											const node = math.parse(gg.options.params[destParam]);
											const transformed = node.transform(function (node) {
												if (node.isSymbolNode && globalParams.hasOwnProperty(node.name)) {
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

					if (gate.options && gate.options.condition) {
						for (let cc = 0; cc < tmp.gates[0].length; cc++) {
							for (let ww = 0; ww < tmp.numQubits; ww++) {
								const gg = tmp.gates[ww][cc];
								if (gg) {
									gg.options = gg.options || {};
									gg.options.condition = gate.options.condition;
								}
							}
						}
					}
					// ---

					const decomposed = tmp.save(true);
					if (!decomposed.gates[0].length) {
						for (tmpq = 0; tmpq < decomposed.gates.length; tmpq++) {
							decomposed.gates[tmpq].push(null);
						}
					}

					const empty = [];
					for (let i = 0; i < decomposed.gates[0].length - 1; i++) {
						empty.push(null);
					}

					// shift columns right
					for (let w = 0; w < obj.numQubits; w++) {
						const g = obj.gates[w][column];
						if (g && g.id === gate.id) {
							obj.gates[w].splice(column, 1);
							const insertGate = JSON.parse(
								JSON.stringify(decomposed.gates[g.connector]),
							);
							// unique id
							for (tmpq = 0; tmpq < insertGate.length; tmpq++) {
								if (insertGate[tmpq]) {
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

QuantumCircuit.prototype.decomposeGateAt = function (column, wire) {
	let col;
	const self = this;

	// if there is no gate - return
	const gate = this.getGateAt(column, wire);
	if (!gate) {
		return;
	}

	// if gate is not composite - return
	if (!this.customGates[gate.name]) {
		return;
	}

	// copy circuit
	const obj = new QuantumCircuit();
	obj.load(this.save());

	// remove all gates except this
	for (col = 0; col < obj.gates[0].length; col++) {
		for (let row = 0; row < obj.numQubits; row++) {
			const g = obj.gates[row][col];
			if (g && g.id !== gate.id) {
				obj.removeGateAt(col, row);
			}
		}
	}

	// decompose circuit
	const circuit = new QuantumCircuit();
	circuit.load(obj.save(true));
	circuit.removeLeadingColumns();
	circuit.removeTrailingColumns();

	for (let i = 0; i < circuit.gates[0].length - 1; i++) {
		this.insertSpace(column + i, gate.wires);
	}
	this.removeGate(gate.id);

	let destCol = column;
	for (col = 0; col < circuit.gates[0].length; col++) {
		const gates = circuit.getGatesAtColumn(col);
		gates.map(function (g) {
			self.addGate(g.name, destCol, g.wires, g.options);
		});
		destCol++;
	}

	return circuit;
};

QuantumCircuit.prototype.removeMeasurementAndClassicalControl = function () {
	// remove measurement and classical control
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			let gate = this.gates[wire][column];
			if (gate) {
				// remove measurement
				if (gate.name === "measure") {
					this.gates[wire][column] = null;
					gate = null;
				}
			}

			if (gate) {
				// remove conditions
				if (gate.options && gate.options.condition) {
					delete this.gates[wire][column].options.condition;
				}
			}
		}
	}

	// remove cregs
	this.cregs = {};

	// remove hybrid options
	if (this.options) {
		this.options.hybrid = false;
		if (this.options.hybridOptions) {
			delete this.options.hybridOptions;
		}
	}
};

//
// Convert this circuit to custom gate
//

QuantumCircuit.prototype.convertToCustomGate = function (
	gateName,
	decompose,
	addToCircuit,
) {
	// remove measurement and classical control
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			let gate = this.gates[wire][column];
			if (gate) {
				// remove measurement
				if (gate.name === "measure") {
					this.gates[wire][column] = null;
					gate = null;
				}
			}

			if (gate) {
				// remove conditions
				if (gate.options && gate.options.condition) {
					delete this.gates[wire][column].options.condition;
				}
			}
		}
	}

	// remove cregs
	this.cregs = {};

	const source = this.save(decompose);
	if (source.options) {
		source.options.hybrid = false;
		if (source.options.hybridOptions) {
			delete source.options.hybridOptions;
		}
	}

	this.clear();
	this.customGates[gateName] = source;

	if (addToCircuit) {
		const wires = [];
		for (let i = 0; i < this.numQubits; i++) {
			wires.push(i);
		}

		const gateOptions = JSON.parse(
			JSON.stringify(this.customGates[gateName].options),
		);

		this.addGate(gateName, -1, wires, gateOptions);
	} else {
		this.removeTrailingRows();
	}
};

QuantumCircuit.prototype.validCustomGateName = function (baseName) {
	baseName = (baseName || "sub") + "";

	const customGateNames = [];
	if (this.customGates) {
		let gateName;
		if (!this.basicGates[baseName]) {
			if (!this.customGates[baseName]) {
				return baseName;
			}
		}

		for (gateName in this.basicGates) {
			customGateNames.push(gateName);
		}

		for (gateName in this.customGates) {
			customGateNames.push(gateName);
		}
	}

	let index = 0;
	let validName = "";
	do {
		index++;
		validName = baseName + index;
	} while (customGateNames.indexOf(validName) >= 0);

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

QuantumCircuit.prototype.splitIntoBlocks = function (blockSize, options) {
	let x;
	let gateDef;
	let gate;
	options = options || {};

	const blocks = [];
	let prevCondition = "{}";
	let prevIsUnitary = true;

	let currentBlock = null;

	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	const numCols = decomposed.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < decomposed.numQubits; wire++) {
			gate = decomposed.getGateAt(column, wire);
			if (gate && gate.connector === 0 && !gate.addedToBlock) {
				gateDef = this.basicGates[gate.name];
				const currentCondition =
					gate.options && gate.options.condition
						? JSON.stringify(gate.options.condition)
						: "{}";
				const currentIsUnitary =
					gateDef && !!(gateDef.matrix && gateDef.matrix.length);

				const newWires = JSON.parse(
					JSON.stringify(currentBlock ? currentBlock.wires : []),
				);
				gate.wires.map(function (wire) {
					if (newWires.indexOf(wire) < 0) {
						newWires.push(wire);
					}
				});

				if (
					!blocks.length ||
					!(currentCondition === prevCondition) ||
					!currentIsUnitary ||
					!prevIsUnitary ||
					!(newWires.length <= blockSize)
				) {
					currentBlock = {
						wires: gate.wires,
						gates: [gate],
					};
					blocks.push(currentBlock);

					if (gate.options && gate.options.condition) {
						currentBlock.condition = gate.options.condition;
					}
				} else {
					currentBlock.wires = newWires;
					currentBlock.gates.push(gate);
				}

				gate.wires.map(function (ww) {
					decomposed.gates[ww][column].addedToBlock = true;
				});

				prevCondition = currentCondition;
				prevIsUnitary = currentIsUnitary;

				if (!options.verticalOnly) {
					// try to extend the block horizontally
					let extColumn = column + 1;
					let extWires = JSON.parse(JSON.stringify(currentBlock.wires));
					extWires.sort();
					while (extColumn < numCols && extWires.length) {
						let extWire = extWires[0];

						while (extWires.length && extWire <= extWires[extWires.length - 1]) {
							const extGate = decomposed.getGateAt(extColumn, extWire);
							if (extGate && !extGate.addedToBlock) {
								const extGateDef = this.basicGates[extGate.name];
								const extCondition =
									extGate.options && extGate.options.condition
										? JSON.stringify(extGate.options.condition)
										: "{}";
								const extIsUnitary =
									extGateDef && !!(extGateDef.matrix && extGateDef.matrix.length);

								//
								// Check if gate is valid for block
								//
								let gateValid = extIsUnitary && extCondition === currentCondition;

								// Check if all gate's wires are inside block
								if (gateValid) {
									for (let ww = 0; ww < extGate.wires.length; ww++) {
										if (extWires.indexOf(extGate.wires[ww]) < 0) {
											gateValid = false;
											break;
										}
									}
								}

								if (gateValid) {
									// add gate to block
									currentBlock.gates.push(extGate);

									extGate.wires.map(function (ww) {
										decomposed.gates[ww][extColumn].addedToBlock = true;
									});
								} else {
									// remove gate's wires from scan
									const validExtWires = [];
									for (let ww = 0; ww < extWires.length; ww++) {
										let extW = extWires[ww];
										if (extGate.wires.indexOf(extW) < 0) {
											validExtWires.push(extW);
										}
									}
									extWires = validExtWires;
								}
							}
							// goto next valid wire
							if (extWires.length) {
								let newExtWire = extWires[extWires.length - 1] + 1;
								for (let ww = extWires.length - 1; ww >= 0; ww--) {
									let extW = extWires[ww];
									if (extW > extWire) {
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

	const circuit = new QuantumCircuit();

	let blockCounter = 0;
	for (let blockIndex = 0; blockIndex < blocks.length; blockIndex++) {
		const block = blocks[blockIndex];

		let isBlock = false;
		if (block.wires.length <= blockSize || !!options.flexibleBlockSize) {
			for (x = 0; x < block.gates.length; x++) {
				gate = block.gates[x];
				gateDef = this.basicGates[gate.name];

				if (gateDef.matrix && gateDef.matrix.length) {
					isBlock = true;
				}
			}
		}

		if (isBlock) {
			blockCounter++;

			const customGate = new QuantumCircuit();
			for (x = 0; x < block.gates.length; x++) {
				gate = block.gates[x];

				if (gate.options.condition) {
					delete gate.options.condition;
				}

				// Update gate wires
				const wires = [];
				gate.wires.map(function (wire) {
					wires.push(block.wires.indexOf(wire));
				});
				gate.wires = wires;

				// add gate to custom gate
				customGate.appendGate(gate.name, wires, gate.options);
			}

			// register custom gate
			const customGateName = "block" + blockCounter;
			circuit.registerGate(customGateName, customGate);

			// add custom gate to circuit
			const customGateOptions = {};
			if (block.condition) {
				customGateOptions.condition = block.condition;
			}
			circuit.appendGate(customGateName, block.wires, customGateOptions);
		} else {
			// ---
			// add original gate (non-unitary gates [and gates with more than blockSize wires if allowFlexibleBlockSize = false])
			// ---
			block.gates.map(function (gate) {
				circuit.appendGate(gate.name, gate.wires, gate.options);
			});
		}
	}

	this.load(circuit.save(false));
};

QuantumCircuit.prototype.usedGates = function (options) {
	options = options || {};

	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));
	const used = [];
	for (let wire = 0; wire < decomposed.numQubits; wire++) {
		for (let col = 0; col < decomposed.numCols(); col++) {
			const gate = decomposed.gates[wire][col];
			if (gate && used.indexOf(gate.name) < 0) {
				let skipGate = false;

				if (options.unitariesOnly) {
					const basicGate = decomposed.basicGates[gate.name];
					if (!basicGate || !basicGate.matrix || !basicGate.matrix.length) {
						skipGate = true;
					}
				}

				if (!skipGate) {
					used.push(gate.name);
				}
			}
		}
	}

	// Custom gates
	if (!options.noCustomGates) {
		for (let customGateName in this.customGates) {
			if (used.indexOf(customGateName) < 0) {
				used.push(customGateName);
			}
		}
	}

	return used;
};

QuantumCircuit.prototype.countOps = function (obj, options) {
	options = options || {};
	options.shallow = options.shallow || false;

	if (!obj) {
		obj = this;
	}

	const ops = {};
	for (let wire = 0; wire < obj.gates.length; wire++) {
		for (let col = 0; col < obj.gates[wire].length; col++) {
			const gate = obj.gates[wire][col];
			if (gate && gate.connector === 0) {
				const basicGate = this.basicGates[gate.name];
				if (basicGate) {
					if (ops[gate.name]) {
						ops[gate.name]++;
					} else {
						ops[gate.name] = 1;
					}
				} else {
					const customGate = this.customGates[gate.name];
					if (customGate) {
						if (ops[gate.name]) {
							ops[gate.name]++;
						} else {
							ops[gate.name] = 1;
						}

						if (!options.shallow) {
							const subOps = this.countOps(customGate, options);
							for (let subName in subOps) {
								if (ops[subName]) {
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
QuantumCircuit.prototype.getCouplingMap = function (options) {
	options = options || {};

	let couplingMap = "";

	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	for (let wire = 0; wire < decomposed.numQubits; wire++) {
		for (let col = 0; col < decomposed.numCols(); col++) {
			const gate = decomposed.getGateAt(col, wire);
			if (gate && gate.connector === 0) {
				let skipGate = false;

				if (options.unitariesOnly) {
					const basicGate = decomposed.basicGates[gate.name];
					if (!basicGate || !basicGate.matrix || !basicGate.matrix.length) {
						skipGate = true;
					}
				}

				if (!skipGate) {
					const wiresStr = JSON.stringify(gate.wires);
					if (couplingMap.indexOf(wiresStr) < 0) {
						if (couplingMap) {
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

QuantumCircuit.prototype.getGateDef = function (name) {
	let gateDef = this.basicGates[name];
	if (!gateDef) {
		gateDef = this.customGates[name];
	}
	return gateDef;
};

// ---
// Import from Qubit Toaster
// ---
QuantumCircuit.prototype.importRaw = function (data, errorCallback) {
	let errorMessage
	;
	const numQubits = data ? data.qubits || 0 : 0;

	this.init(numQubits);

	if (!data) {
		if (errorCallback) {
			errorCallback([]);
		} else {
			return;
		}
	}

	// import classical registers
	if (data.cregs) {
		for (let i = 0; i < data.cregs.length; i++) {
			const creg = data.cregs[i];

			if (!creg.name) {
				let errorMessage = "Classical register " + i + ' doesn\'t have a "name".';
				if (errorCallback) {
					errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			this.createCreg(creg.name, creg.len || 0);
		}
	}

	// import program
	if (data.program) {
		for (let i = 0; i < data.program.length; i++) {
			const gate = data.program[i];

			// Import from matrix is not implemented yet, so best we have is gate name
			// Check if gate has name
			if (!gate.name) {
				errorMessage = "Gate " +
				i +
				' doesn\'t have a "name". Name is optional and this is OK for QubitToaster but we cannot import gate from matrix. Not implemented yet.';
				if (errorCallback) {
					errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			// Check if gate name exists in this.basicGates
			const basicGate = this.basicGates[gate.name];
			if (!basicGate) {
				errorMessage = 'Unknown gate "' +
					gate.name +
					'". Name is optional and this is OK for QubitToaster but we cannot import gate from matrix. We can import only gates by name from set of known gates.';
				if (errorCallback) {
					errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			const wires = JSON.parse(JSON.stringify(gate.wires || []));
			const options = JSON.parse(JSON.stringify(gate.options || {}));

			// check if number of wires is correct
			const basicGateQubits =
				basicGate.matrix && basicGate.matrix.length
					? math.log2(basicGate.matrix.length)
					: 1;
			if (wires.length !== basicGateQubits) {
				errorMessage = 'Gate "' +
				gate.name +
				'" has ' +
				wires.length +
				" wires but should have " +
				basicGateQubits +
				" wires.";
				if (errorCallback) {
					errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
					return;
				} else {
					throw new Error(errorMessage);
				}
			}

			// Check if all parameters are present
			if (basicGate.params && basicGate.params.length) {
				if (!options.params) {
					errorMessage = 'Missing parameters for gate "' +
					gate.name +
					'". Expecting ' +
					basicGate.params.length +
					" parameters.";
					if (errorCallback) {
						errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
						return;
					} else {
						throw new Error(errorMessage);
					}
				}

				for (let p = 0; p < basicGate.params.length; p++) {
					const paramName = basicGate.params[p];

					if (typeof options.params[paramName] == "undefined") {
						errorMessage = 'Missing parameter "' + paramName + '" for gate "' + gate.name + '".';
						if (errorCallback) {
							errorCallback([{ msg: errorMessage, line: 0, col: 0 }]);
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
	if (errorCallback) {
		errorCallback([]);
	}
};

// ---
// Export to Qubit Toaster
// ---
QuantumCircuit.prototype.exportRaw = function () {
	let globalParams =
		this.options && this.options.params ? this.options.params : {};
	globalParams = JSON.parse(JSON.stringify(globalParams));
	for (let globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	const numCols = decomposed.numCols();
	const sequence = [];
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < decomposed.numQubits; wire++) {
			const gate = decomposed.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				const gt = decomposed.basicGates[gate.name];
				if (!gt) {
					console.log('Unknown gate "' + gate.name + '".');
					return;
				}

				const rawGate = decomposed.getRawGate(gt, gate.options);

				const rawMatrix = [];
				rawGate.map(function (row) {
					const rawRow = [];
					row.map(function (cell) {
						cell = JSON.parse(JSON.stringify(cell));
						if (typeof cell == "object") {
							if (cell["mathjs"] && typeof cell["mathjs"] == "string") {
								cell["type"] = cell["mathjs"].toLowerCase();
								delete cell.mathjs;
							}
						}
						rawRow.push(cell);
					});
					rawMatrix.push(rawRow);
				});

				let options = {};
				if (gate.options) {
					options = JSON.parse(JSON.stringify(gate.options));
				}

				if (options.params) {
					for (let paramName in options.params) {
						options.params[paramName] = math.evaluate(
							options.params[paramName],
							globalParams,
						);
					}
				}

				sequence.push({
					name: gate.name,
					matrix: rawMatrix,
					wires: gate.wires,
					options: options,
				});
			}
		}
	}

	const cregs = [];
	for (let creg in decomposed.cregs) {
		cregs.push({
			name: creg,
			len: decomposed.cregs[creg].length || 0,
		});
	}

	return {
		qubits: decomposed.numQubits,
		cregs: cregs,
		program: sequence,
	};
};

//
// Returns input file for Quantum Generator
//
// options: {
//     noVectors: bool (default: false) // set true for transpiling with "replace_blocks" & "replace_gates" methods to avoid generating (large) vectors
//     fromMatrix: bool (default: false) // directly send matrix to generator (instead vectors)
//     numSamples: int (default: auto) // number of random vectors
//     useGates: array of string (default: ["u3, "cx"]) // gates to use when generating random vectors
// }
//

QuantumCircuit.prototype.exportToGenerator = function (options) {
	options = options || {};

	const qasm = this.exportQASM(null, false, null, false, true);
	const usedGates = this.usedGates({
		noCustomGates: true,
		unitariesOnly: true,
	});
	const couplingMap = this.getCouplingMap({ unitariesOnly: true });

	const output = {
		source: {
			circuit: {
				qasm: qasm,
			},
		},

		problem: [],

		type: "circuit",

		settings: {
			allowed_gates: usedGates.join(","),
			coupling_map: couplingMap,
		},
	};

	const circuit = new QuantumCircuit();
	circuit.load(this.save(true));

	if (options.fromMatrix) {
		const matrix = circuit.circuitMatrix();
		const unitary = [];

		matrix.map(function (row) {
			row.map(function (value) {
				if (typeof value == "object") {
					unitary.push([value.re, value.im]);
				} else {
					unitary.push(value);
				}
			});
		});

		output.problem.push({
			unitary: unitary,
		});

		return output;
	}

	if (!options.noVectors) {
		const stateCircuit = new QuantumCircuit();

		const numSamples =
			options.numSamples ||
			(this.numQubits < 3
				? 8
				: this.numQubits < 5
					? (1 << this.numQubits) + 1
					: this.numQubits < 9
						? this.numQubits * 4
						: this.numQubits);
		for (let i = 0; i < numSamples + 1; i++) {
			const set = { input: [], output: [] };

			let initialVector = [];

			if (i > 0) {
				stateCircuit.randomCircuit(this.numQubits, 20, {
					useGates: options.useGates || ["u3", "cx"],
					noClassicControl: true,
					noMeasure: true,
					noReset: true,
				});
				stateCircuit.run();

				stateCircuit.stateAsArray().map(function (state) {
					set.input.push([state.amplitude.re, state.amplitude.im]);
				});

				initialVector = stateCircuit.state;
			} else {
				circuit.initState();

				circuit.stateAsArray().map(function (state) {
					set.input.push([state.amplitude.re, state.amplitude.im]);
				});

				initialVector = circuit.state;
			}

			circuit.run(null, { initialState: initialVector });

			circuit.stateAsArray().map(function (state) {
				set.output.push([state.amplitude.re, state.amplitude.im]);
			});

			output.problem.push(set);
		}
		return output;
	}

	return output;
};

QuantumCircuit.prototype.save = function (decompose, lightweight) {
	this.updateGlobalParams();

	const data = {
		numQubits: this.numQubits,
		params: JSON.parse(JSON.stringify(this.params)),
		options: JSON.parse(JSON.stringify(this.options)),
		gates: JSON.parse(JSON.stringify(this.gates)),
		customGates: JSON.parse(JSON.stringify(this.customGates)),
		cregs: JSON.parse(JSON.stringify(this.cregs)),
	};

	let res;
	if (decompose) {
		res = this.decompose(data);
	} else {
		res = data;
	}

	// ---
	// remove Id from gates?
	// ---
	if (lightweight) {
		if (res.gates) {
			res.gates.map(function (row) {
				if (row) {
					row.map(function (cell) {
						if (cell && cell.id) {
							delete cell.id;
						}
					});
				}
			});
		}

		if (res.customGates) {
			for (let customGateName in res.customGates) {
				const customGate = res.customGates[customGateName];
				if (customGate && customGate.gates) {
					customGate.gates.map(function (row) {
						if (row) {
							row.map(function (cell) {
								if (cell && cell.id) {
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

QuantumCircuit.prototype.load = function (obj) {
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
	if (!this.options.hybridOptions) {
		this.options.hybridOptions = this.defaultHybridOptions();
	}
};

const generateGrayCode = function (numBits) {
	if (numBits <= 0) {
		throw new Error("Cannot generate the gray code for less than 1 bit.");
	}

	const result = [0];
	for (let i = 0; i < numBits; i++) {
		const reversed = [].concat(result).reverse();
		reversed.map(function (x) {
			result.push(x + math.pow(2, i));
		});
	}

	const gray = [];
	result.map(function (dec) {
		gray.push(binStr(dec, numBits));
	});

	return gray;
};

QuantumCircuit.prototype.grayCodeChain = function (
	numCtrlQubits,
	gateName,
	gateOptions,
) {
	function compareStrings(s1, s2) {
		const comp = [];
		for (let i = 0; i < s1.length; i++) {
			comp.push(s1[i] !== s2[i]);
		}
		return comp;
	}

	function indicesOfChar(s, ch) {
		const indices = [];
		for (let i = 0; i < s.length; i++) {
			if (s[i] === ch) {
				indices.push(i);
			}
		}
		return indices;
	}

	function countChar(s, ch) {
		let count = 0;
		for (let i = 0; i < s.length; i++) {
			if (s[i] === ch) {
				count++;
			}
		}
		return count;
	}

	const qControls = [];
	for (let i = 0; i < numCtrlQubits; i++) {
		qControls.push(i);
	}

	const qTarget = numCtrlQubits;
	const grayCode = generateGrayCode(numCtrlQubits);
	let lastPattern = null;

	const rules = [];
	grayCode.map(function (pattern) {
		const lmPos = pattern.indexOf("1");
		if (lmPos >= 0) {
			if (!lastPattern) {
				lastPattern = pattern;
			}

			const comp = compareStrings(pattern, lastPattern);
			const pos = comp.indexOf(true);
			if (pos >= 0) {
				if (pos !== lmPos) {
					rules.push({
						gateName: "cx",
						wires: [qControls[pos], qControls[lmPos]],
						options: null,
					});
				} else {
					const indices = indicesOfChar(pattern, "1");
					for (let idx = 1; idx < indices.length; idx++) {
						rules.push({
							gateName: "cx",
							wires: [qControls[indices[idx]], qControls[lmPos]],
							options: null,
						});
					}
				}
			}

			if (!(countChar(pattern, "1") % 2)) {
				// inverse
				// !!!
				// Warning - this works only with gate which is own inverse
				// TODO: implement proper inverse for all gates
				// !!!
				let inverseOptions = null;
				if (gateOptions) {
					inverseOptions = JSON.parse(JSON.stringify(gateOptions));
					if (inverseOptions.params) {
						for (let key in inverseOptions.params) {
							let val = inverseOptions.params[key];
							if (typeof val == "number") {
								val = 0 - val;
							} else {
								val = "-(" + val + ")";
							}
							inverseOptions.params[key] = val;
						}
					}
				}
				rules.push({
					gateName: gateName,
					wires: [qControls[lmPos], qTarget],
					options: inverseOptions,
				});
			} else {
				rules.push({
					gateName: gateName,
					wires: [qControls[lmPos], qTarget],
					options: gateOptions,
				});
			}
			lastPattern = pattern;
		}
	});

	return rules;
};

QuantumCircuit.prototype.MCU1Circuit = function (ctrlQubits) {
	let numCtrlQubits;
	const invertControls = [];
	if (typeof ctrlQubits == "number") {
		numCtrlQubits = ctrlQubits;
	} else {
		numCtrlQubits = ctrlQubits.length || 0;
		for (let i = 0; i < numCtrlQubits; i++) {
			if (
				!ctrlQubits[i] ||
				(typeof ctrlQubits[i] == "number" && ctrlQubits[i] < 0)
			) {
				invertControls.push(i);
			}
		}
	}

	if (numCtrlQubits === 0) {
		throw new Error(
			"Cannot create multi-controlled gate with zero control qubits.",
		);
	}

	function addX(circuit, wires) {
		wires.map(function (wire) {
			circuit.appendGate("x", wire);
		});
	}

	const scaledLambda = "lambda / " + math.pow(2, numCtrlQubits - 1);
	const gateOptions = { params: { lambda: scaledLambda } };

	const qc = new QuantumCircuit();

	if (numCtrlQubits === 1) {
		addX(qc, invertControls);
		qc.appendGate("cu1", [0, 1], gateOptions);
		addX(qc, invertControls);
		return qc;
	}

	addX(qc, invertControls);
	const rules = this.grayCodeChain(numCtrlQubits, "cu1", gateOptions);
	rules.map(function (rule) {
		qc.appendGate(rule.gateName, rule.wires, rule.options);
	});
	addX(qc, invertControls);

	return qc;
};

QuantumCircuit.prototype.MCXCircuit = function (ctrlQubits) {
	let numCtrlQubits;
	const invertControls = [];
	if (typeof ctrlQubits == "number") {
		numCtrlQubits = ctrlQubits;
	} else {
		numCtrlQubits = ctrlQubits.length || 0;
		for (let i = 0; i < numCtrlQubits; i++) {
			if (
				!ctrlQubits[i] ||
				(typeof ctrlQubits[i] == "number" && ctrlQubits[i] < 0)
			) {
				invertControls.push(i);
			}
		}
	}

	const qc = new QuantumCircuit();
	if (numCtrlQubits === 0) {
		throw new Error(
			"Cannot create multi-controlled gate with zero control qubits.",
		);
	}

	function addX(circuit, wires) {
		wires.map(function (wire) {
			circuit.appendGate("x", wire);
		});
	}

	if (numCtrlQubits === 1) {
		addX(qc, invertControls);
		qc.appendGate("cx", [0, 1]);
		addX(qc, invertControls);
		return qc;
	}

	if (numCtrlQubits === 2) {
		addX(qc, invertControls);
		qc.appendGate("ccx", [0, 1, 2]);
		addX(qc, invertControls);
		return qc;
	}

	const mcu1 = qc.MCU1Circuit(numCtrlQubits);
	const mcu1name = "mcu1_" + numCtrlQubits;
	const mcu1wires = [];
	for (let i = 0; i < numCtrlQubits + 1; i++) {
		mcu1wires.push(i);
	}

	qc.registerGate(mcu1name, mcu1);
	addX(qc, invertControls);
	qc.appendGate("h", numCtrlQubits);
	qc.appendGate(mcu1name, mcu1wires, { params: { lambda: "pi" } });
	addX(qc, invertControls);
	qc.appendGate("h", numCtrlQubits);

	return qc;
};

QuantumCircuit.prototype.registerGate = function (name, obj) {
	if (obj instanceof QuantumCircuit) {
		this.customGates[name] = obj.save();
	} else {
		this.customGates[name] = obj;
	}

	if (this.isMultiControlledGate(name)) {
		const mcInfo = this.decodeMultiControlledGateName(name);
		if (mcInfo.numCtrlQubits !== this.customGates[name].numQubits - 1) {
			mcInfo.numCtrlQubits = this.customGates[name].numQubits - 1;
			const ctrlQubits = [];
			for (let i = 0; i < mcInfo.numCtrlQubits; i++) {
				ctrlQubits.push(
					typeof mcInfo.ctrlQubits[i] === "undefined" ? true : mcInfo.ctrlQubits[i],
				);
			}
			mcInfo.ctrlQubits = ctrlQubits;
		}

		const rootGate = this.basicGates[mcInfo.rootName];
		if (rootGate && rootGate.drawingInfo && rootGate.drawingInfo.connectors) {
			if (!this.customGates[name].drawingInfo) {
				this.customGates[name].drawingInfo = {};
			}

			const connectors = [];
			mcInfo.ctrlQubits.map(function (ctrlQubit) {
				if (ctrlQubit) {
					connectors.push("dot");
				} else {
					connectors.push("ndot");
				}
			});
			connectors.push(
				rootGate.drawingInfo.connectors[rootGate.drawingInfo.connectors.length - 1],
			);

			this.customGates[name].drawingInfo.connectors = connectors;
			this.customGates[name].drawingInfo.root = rootGate.drawingInfo.root;
		}
	}
};

QuantumCircuit.prototype.registerMCXGate = function (ctrlQubits) {
	const gateName = this.multiControlledGateName("mcx", ctrlQubits);
	this.registerGate(gateName, this.MCXCircuit(ctrlQubits).save(true));
	return gateName;
};

QuantumCircuit.prototype.registerMCU1Gate = function (ctrlQubits) {
	const gateName = this.multiControlledGateName("mcu1", ctrlQubits);
	this.registerGate(gateName, this.MCU1Circuit(ctrlQubits).save(true));
	return gateName;
};

QuantumCircuit.prototype.registerMultiControlledGate = function (
	rootName,
	ctrlQubits,
) {
	switch (rootName) {
		case "cx":
			return this.registerMCXGate(ctrlQubits);
		case "cu1":
			return this.registerMCU1Gate(ctrlQubits);
	}

	return "";
};

QuantumCircuit.prototype.getOrRegisterMultiControlledEquivalent = function (
	gateName,
	inverseControl,
) {
	const gateDef = this.basicGates[gateName];
	if (gateDef) {
		if (gateDef.drawingInfo) {
			// Basic gate with multi-controlled/inverse controlled implementation
			if (
				gateName === "x" ||
				gateName === "u1" ||
				gateDef.drawingInfo.root === "x" ||
				gateDef.drawingInfo.root === "u1"
			) {
				if (!this.basicGates["c" + gateName] || inverseControl) {
					// create multi controlled version and return its name
					const rootName = "c" + (gateDef.drawingInfo.root || gateName);
					const numCtrlQubits = math.log2(gateDef.matrix.length);
					const ctrlQubits = [];
					for (let i = 0; i < numCtrlQubits - 1; i++) {
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
		for (let gn in this.basicGates) {
			const tmpGateDef = this.basicGates[gn];
			if (
				tmpGateDef &&
				tmpGateDef.drawingInfo &&
				tmpGateDef.drawingInfo.root &&
				tmpGateDef.drawingInfo.root === gateName
			) {
				if (!inverseControl) {
					// there is basic gate with additional control
					return gn;
				}
			}
		}
		return null;
	}

	if (this.customGates[gateName]) {
		const mcInfo = this.decodeMultiControlledGateName(gateName);
		if (!mcInfo || !mcInfo.numCtrlQubits) {
			return null;
		}

		if (mcInfo.rootName === "cx" || mcInfo.rootName === "cu1") {
			// create multi controlled version and return its name
			mcInfo.ctrlQubits.unshift(!inverseControl);
			return this.registerMultiControlledGate(mcInfo.rootName, mcInfo.ctrlQubits);
		}

		return null;
	}

	return null;
};

QuantumCircuit.prototype.removeUnusedMultiControlledGates = function () {
	const ops = this.countOps(null, { shallow: false });

	for (let gateName in this.customGates) {
		if (!ops[gateName]) {
			if (this.isMultiControlledGate(gateName)) {
				delete this.customGates[gateName];
			}
		}
	}
};

QuantumCircuit.prototype.decodeMultiControlledGateName = function (gateName) {
	let numCtrlQubits;
	if (!gateName) {
		return null;
	}
	const splitted = gateName.split("_");
	numCtrlQubits = parseInt(splitted[1]);

	const mcInfo = {};

	// name
	if (splitted.length > 0) {
		mcInfo.name = splitted[0];
		mcInfo.rootName = mcInfo.name.substring(1);

		if (mcInfo.rootName !== "cx" && mcInfo.rootName !== "cu1") {
			return null;
		}
	}

	// numCtrlQubits
	if (splitted.length > 1) {
		if (!isNaN(numCtrlQubits) && numCtrlQubits <= 20) {
			mcInfo.numCtrlQubits = numCtrlQubits;
		}
	}

	// ctrlQubits
	if (mcInfo.numCtrlQubits) {
		const ctrlQubits = [];
		if (splitted.length > 2) {
			for (let i = 0; i < splitted[2].length; i++) {
				if (splitted[2][i] === "0") {
					ctrlQubits.push(false);
				}
				if (splitted[2][i] === "1") {
					ctrlQubits.push(true);
				}
			}
		}

		if (!ctrlQubits.length) {
			for (let i = 0; i < numCtrlQubits; i++) {
				ctrlQubits.push(true);
			}
		}
		mcInfo.ctrlQubits = ctrlQubits;
	}

	return mcInfo;
};

QuantumCircuit.prototype.multiControlledGateName = function (
	namePrefix,
	ctrlQubits,
) {
	let gateName = namePrefix + "_";
	if (typeof ctrlQubits == "number") {
		gateName += ctrlQubits;
	} else {
		gateName += ctrlQubits.length || 0;

		let wires = "";
		ctrlQubits.map(function (wire) {
			if (!wire || (typeof wire == "number" && wire < 0)) {
				wires += "0";
			} else {
				wires += "1";
			}
		});
		if (wires.indexOf("0") < 0) {
			wires = "";
		}
		if (wires) {
			gateName += "_" + wires;
		}
	}
	return gateName;
};

QuantumCircuit.prototype.isMultiControlledGate = function (gateName) {
	const mcInfo = this.decodeMultiControlledGateName(gateName);
	return !!this.customGates[gateName] && !!mcInfo && !!mcInfo.numCtrlQubits;
};

QuantumCircuit.prototype.isControllableGate = function (gateName) {
	let gateDef = this.basicGates[gateName];
	if (gateDef) {
		if (gateDef.drawingInfo) {
			if (gateDef.drawingInfo.root === "x" || gateDef.drawingInfo.root === "u1") {
				return true;
			}
		}
		for (let gn in this.basicGates) {
			gateDef = this.basicGates[gn];
			if (
				gateDef &&
				gateDef.drawingInfo &&
				gateDef.drawingInfo.root &&
				gateDef.drawingInfo.root === gateName
			) {
				return true;
			}
		}
	}

	return this.isMultiControlledGate(gateName);
};

QuantumCircuit.prototype.getGatePosById = function (gateId) {
	const circuit = this;

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.id === gateId) {
				return {
					wires: gate.wires,
					col: column,
				};
			}
		}
	}

	return {
		wires: [],
		col: -1,
	};
};

QuantumCircuit.prototype.getGateById = function (gateId) {
	const circuit = this;

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.id === gateId) {
				return gate;
			}
		}
	}

	return null;
};

QuantumCircuit.prototype.getGateBefore = function (column, wire) {
	let gate = null;
	let col = column - 1;
	while (col >= 0 && !gate) {
		gate = this.getGateAt(col, wire);
		col--;
	}
	return gate;
};

QuantumCircuit.prototype.getGateAt = function (column, wire) {
	if (!this.gates[wire] || !this.gates[wire][column]) {
		return null;
	}

	const gate = JSON.parse(JSON.stringify(this.gates[wire][column]));
	if (!gate) {
		return null;
	}

	gate.column = column;
	gate.wires = [];

	const id = gate.id;
	const numWires = this.gates.length;
	for (let wire = 0; wire < numWires; wire++) {
		const g = this.gates[wire][column];
		if (g && g.id === id) {
			gate.wires[g.connector] = wire;
		}
	}
	return gate;
};

QuantumCircuit.prototype.getGatesAtColumn = function (column) {
	const gates = [];
	const numWires = this.gates.length;
	for (let wire = 0; wire < numWires; wire++) {
		const gate = this.getGateAt(column, wire);
		if (gate && gate.connector === 0) {
			gates.push(gate);
		}
	}
	return gates;
};

QuantumCircuit.prototype.getControllableGatesAtColumn = function (column) {
	const gates = this.getGatesAtColumn(column);
	const controllableGates = [];
	for (let i = 0; i < gates.length; i++) {
		const gate = gates[i];
		if (this.isControllableGate(gate.name)) {
			controllableGates.push(gate);
		}
	}
	return controllableGates;
};

QuantumCircuit.prototype.exportJavaScript = function (
	comment,
	decompose,
	exportAsGateName,
	asJupyter,
) {
	const self = this;

	let circuit = null;

	// decompose
	if (decompose) {
		circuit = new QuantumCircuit();
		circuit.load(this.save(true));
	} else {
		circuit = this;
	}

	let js = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 2 && cline[0] !== "/" && cline[1] !== "/") {
				js += "// ";
			}
			js += cline;
			js += "\n";
		});
	}

	let indent = "";
	let circuitVar = "";

	if (exportAsGateName) {
		indent = "    ";
		circuitVar = "circ";

		js += "const " + exportAsGateName + " = function() {\n";

		js +=
			indent +
			"const " +
			circuitVar +
			" = new QuantumCircuit(" +
			circuit.numQubits +
			");\n\n";
		if (circuit.params && circuit.params.length) {
			js +=
				indent +
				circuitVar +
				".params = " +
				JSON.stringify(circuit.params) +
				"\n\n";
		}
	} else {
		indent = "";
		circuitVar = "circuit";

		js += indent + 'const QuantumCircuit = require("quantum-circuit");\n\n';

		js +=
			indent +
			"const " +
			circuitVar +
			" = new QuantumCircuit(" +
			circuit.numQubits +
			");\n\n";

		const usedGates = circuit.usedGates();
		if (!decompose) {
			const customGatesAdded = [];
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						js += customCircuit.exportJavaScript("", true, usedGateName);
						customGatesAdded.push(usedGateName);
					}
				}
			});

			customGatesAdded.map(function (customGateName) {
				js +=
					indent +
					circuitVar +
					'.registerGate("' +
					customGateName +
					'", ' +
					customGateName +
					"());\n";
			});

			if (customGatesAdded.length > 0) {
				js += "\n";
			}
		}
	}

	let cregCount = 0;
	for (let cregName in this.cregs) {
		js +=
			indent +
			circuitVar +
			'.createCreg("' +
			cregName +
			'", ' +
			(this.cregs[cregName].length || 1) +
			");\n";
		cregCount++;
	}
	if (cregCount > 0) {
		js += "\n";
	}

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				const gateName = gate.name;

				if (gateName === "measure" && gate.options && gate.options.creg) {
					js +=
						indent +
						circuitVar +
						".addMeasure(" +
						wire +
						', "' +
						gate.options.creg.name +
						'", ' +
						gate.options.creg.bit +
						");\n";
				} else {
					js += indent + circuitVar + '.appendGate("' + gate.name + '"';

					if (gate.wires.length === 1) {
						js += ", ";
						js += gate.wires[0];
					} else {
						js += ", [";
						for (let w = 0; w < gate.wires.length; w++) {
							if (w > 0) {
								js += ",";
							}
							js += gate.wires[w];
						}
						js += "]";
					}

					if (gate.options) {
						const opt = {};
						for (let optKey in gate.options) {
							if (gate.options[optKey]) {
								const obj = gate.options[optKey];
								let skip = false;
								if (
									typeof obj == "object" &&
									Object.keys(obj).length === 0 &&
									obj.constructor === Object
								) {
									skip = true;
								}

								if (!skip) {
									opt[optKey] = obj;
								}
							}
						}
						js += ", " + JSON.stringify(opt);
					}
					js += ");\n";
				}
			}
		}
	}

	if (exportAsGateName) {
		js += "\n";
		js += indent + "return " + circuitVar + ";\n";
		js += "};\n\n";
	} else {
		js += "\n";

		js += indent + circuitVar + ".run();\n\n";

		js += indent + 'console.log("Probabilities:");\n';
		js += indent + "console.log(JSON.stringify(circuit.probabilities()));\n\n";
		js += indent + 'console.log("Measure all:");\n';
		js += indent + "console.log(JSON.stringify(circuit.measureAll()));\n\n";
		if (circuit.cregCount()) {
			js += indent + 'console.log("Classical registers:");\n';
			js += indent + "console.log(circuit.cregsAsString());\n\n";
		}
	}

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Javascript (Node.js)",
					language: "javascript",
					name: "javascript",
				},
				language_info: {
					file_extension: ".js",
					mimetype: "application/javascript",
					name: "javascript",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: js,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return js;
};

QuantumCircuit.prototype.exportQiskit = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	providerName,
	backendName,
	asJupyter,
	shots,
	circuitReplacement,
	insideSubmodule,
	hybrid,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		providerName: providerName,
		backendName: backendName,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
	};

	return this.exportToQiskit(
		options,
		exportAsGateName,
		circuitReplacement,
		insideSubmodule,
	);
};

QuantumCircuit.prototype.exportQuEST = function (
	comment,
	decompose,
	exportAsGateName,
	definedFunc,
) {
	const newOptions = {
		comment: comment,
		decompose: decompose,
	};

	return this.exportToQuEST(newOptions, exportAsGateName, definedFunc);
};

QuantumCircuit.prototype.exportQASM = function (
	comment,
	decompose,
	exportAsGateName,
	circuitReplacement,
	compatibilityMode,
	insideSubmodule,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		compatibilityMode: compatibilityMode,
	};

	return this.exportToQASM(
		options,
		exportAsGateName,
		circuitReplacement,
		insideSubmodule,
	);
};

QuantumCircuit.prototype.importQASM = function (
	input,
	errorCallback,
	compatibilityMode,
) {
	this.init();
	QASMImport(this, input, errorCallback, compatibilityMode);
};

QuantumCircuit.prototype.exportPyquil = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	lattice,
	asQVM,
	asJupyter,
	shots,
	hybrid,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		lattice: lattice,
		asQVM: asQVM,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
	};
	return this.exportToPyquil(options, exportAsGateName);
};

QuantumCircuit.prototype.exportQuil = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
	};

	return this.exportToQuil(options, exportAsGateName);
};

QuantumCircuit.prototype.importQuil = function (
	quil,
	errorCallback,
	options,
	qubitNames,
	renamedGates,
	lineOffset,
) {
	let newName;
	let gateDef;
	let paramName;
	let argInt;
	let errorMessage;
	const self = this;

	options = options || {};

	self.init();

	renamedGates = renamedGates || {};
	lineOffset = lineOffset || 0;

	function getGateInfo(gateName) {
		if (self.customGates && self.customGates[gateName]) {
			return { name: gateName, customGate: self.customGates[gateName] };
		}

		for (let gname in self.basicGates) {
			const gdef = self.basicGates[gname];
			if (gdef.exportInfo) {
				if (gdef.exportInfo.quil && gdef.exportInfo.quil.name === gateName) {
					return { name: gname, gateDef: gdef, quilDef: gdef.exportInfo.quil };
				}
				if (gdef.exportInfo.pyquil && gdef.exportInfo.pyquil.name === gateName) {
					return {
						name: gname,
						gateDef: gdef,
						quilDef: gdef.exportInfo.pyquil,
					};
				}
			}
		}

		return null;
	}

	const lines = quil.split("\n");

	const commands = [];
	let multiline = false;
	lines.map(function (line, lineIndex) {
		let codelines;
// remove comments
		line = line.split("#")[0];

		if (!line.length) {
			multiline = false;
		} else {
			// remove leading and trailing spaces
			line = line.trim();
		}

		if (!multiline) {
			if (line.length) {
				const clines = line.split(";");
				codelines = [];
				clines.map(function (cline) {
					if (cline.trim().length) {
						codelines.push(cline.trim());
					}
				});

				codelines.map(function (codeline) {
					let tokens = codeline.split(" ");
					let lastToken = tokens[tokens.length - 1];
					if (lastToken.length) {
						if (lastToken[lastToken.length - 1] === ":") {
							multiline = true;
							// remove ":"
							lastToken = lastToken.substring(0, lastToken.length - 1);
							tokens[tokens.length - 1] = lastToken;
						}

						if (tokens.length) {
							let type = "GATE";
							if (tokens[0] === "DEFGATE" || tokens[0] === "DEFCIRCUIT") {
								type = tokens[0];
								tokens.splice(0, 1);
							}

							let name = tokens.join(" ");

							let params = [];
							const paramStart = name.indexOf("(");
							if (paramStart >= 0) {
								const paramEnd = name.indexOf(")");
								if (paramEnd > paramStart) {
									params = name.substring(paramStart + 1, paramEnd).split(",");
									params.map(function (par, ndx) {
										par = par.trim();
										while (par.length && par[0] === "%") {
											par = par.slice(1);
										}
										params[ndx] = par;
									});

									if (paramEnd + 1 <= name.length) {
										const tok = name.substring(paramEnd + 1, name.length).split(" ");

										tokens = [];
										tok.map(function (tk) {
											tk = tk.trim();
											if (tk.length) {
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

							const args = [];
							for (let t = 0; t < tokens.length; t++) {
								const token = tokens[t];
								if (qubitNames) {
									const qindex = qubitNames.indexOf(token);
									if (qindex >= 0) {
										args.push(qindex);
									} else {
										args.push(token);
									}
								} else {
									args.push(token);
								}
							}

							commands.push({
								type: type,
								name: name,
								params: params,
								args: args,
								body: [],
								line: lineIndex,
								col: 0,
							});
						}
					}
				});
			}
		} else {
			codelines = line.split(";");
			codelines.map(function (codeline) {
				if (codeline.trim().length) {
					commands[commands.length - 1].body.push(codeline.trim());
				}
			});
		}
	});

	const commandCount = commands.length;
	for (let commandIndex = 0; commandIndex < commandCount; commandIndex++) {
		const command = commands[commandIndex];

		if (renamedGates[command.name]) {
			command.name = renamedGates[command.name];
		}

		switch (command.type) {
			case "DEFGATE":
				{
					if (command.name === command.name.toUpperCase()) {
						newName = command.name.toLowerCase();
						renamedGates[command.name] = newName;
						command.name = newName;
					}

					// NOT IMPLEMENTED YET !!!
				}
				break;

			case "DEFCIRCUIT":
				{
					if (command.name === command.name.toUpperCase()) {
						newName = command.name.toLowerCase();
						renamedGates[command.name] = newName;
						command.name = newName;
					}

					const subQuil = command.body.join("\n");
					const subQubitNames = command.args;
					const subCircuit = new QuantumCircuit();

					subCircuit.importQuil(
						subQuil,
						errorCallback,
						options,
						subQubitNames,
						renamedGates,
						command.line + 1,
					);

					subCircuit.params = JSON.parse(JSON.stringify(command.params));

					self.registerGate(command.name, subCircuit.save());
				}
				break;

			case "GATE":
				{
					switch (command.name) {
						case "DECLARE":
							{
								// NOT IMPLEMENTED YET !!!
							}
							break;

						case "HALT":
							{
								// What!?
							}
							break;

						case "PRAGMA":
							{
								// What!?
							}
							break;

						default: {
							const gateInfo = getGateInfo(command.name);
							if (!gateInfo) {
								errorMessage = 'Cannot recognize "' + command.name + '".';
								if (errorCallback) {
									errorCallback([
										{
											msg: errorMessage,
											line: lineOffset + command.line,
											col: command.col,
										},
									]);
									return;
								} else {
									throw new Error(errorMessage);
								}
							} else {
								const params = {};

								if (gateInfo.gateDef) {
									gateDef = gateInfo.gateDef;
									const quilDef = gateInfo.quilDef;

									if ((quilDef.params || []).length !== (command.params || []).length) {
										errorMessage = "Invalid number of params. Expected " +
										(quilDef.params || []).length +
										" got " +
										(command.params || []).length +
										".";
										if (errorCallback) {
											errorCallback([
												{
													msg: errorMessage,
													line: lineOffset + command.line,
													col: command.col,
												},
											]);
											return;
										} else {
											throw new Error(errorMessage);
										}
									} else {
										for (let i = 0; i < gateDef.params.length; i++) {
											paramName = gateDef.params[i];

											const paramIndex = quilDef.params.indexOf(paramName);

											if (paramIndex < 0 || paramIndex >= command.params.length) {
												errorMessage = 'Internal error: QUIL definition for gate "' +
												command.name +
												" is invalid.";
												if (errorCallback) {
													errorCallback([
														{
															msg: errorMessage,
															line: lineOffset + command.line,
															col: command.col,
														},
													]);
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
									gateDef = gateInfo.customGate;
									if ((gateDef.params || []).length !== (command.params || []).length) {
										errorMessage = "Invalid number of params. Expected " +
										(gateDef.params || []).length +
										" got " +
										(command.params || []).length +
										".";
										if (errorCallback) {
											errorCallback([
												{
													msg: errorMessage,
													line: lineOffset + command.line,
													col: command.col,
												},
											]);
											return;
										} else {
											throw new Error(errorMessage);
										}
									} else {
										for (let i = 0; i < gateDef.params.length; i++) {
											paramName = gateDef.params[i];
											params[paramName] = command.params[i];
										}
									}
								}

								// Check if number of arguments match gateDef
								if (command.name === "MEASURE") {
									if (command.args.length !== 2) {
										errorMessage = "Expecting 2 arguments (qubit and target register) but found " +
										command.args.length +
										".";
										if (errorCallback) {
											errorCallback([
												{
													msg: errorMessage,
													line: lineOffset + command.line,
													col: command.col,
												},
											]);
											return;
										} else {
											throw new Error(errorMessage);
										}
									}
								} else {
									let qubitCount = 1;
									if (gateDef.numQubits) {
										qubitCount = gateDef.numQubits;
									} else {
										if (gateDef.matrix && gateDef.matrix.length) {
											qubitCount = math.log2(gateDef.matrix.length);
										}
									}

									if (command.args.length !== qubitCount) {
										errorMessage = "Expecting " +
										qubitCount +
										" arguments but found " +
										command.args.length +
										".";
										if (errorCallback) {
											errorCallback([
												{
													msg: errorMessage,
													line: lineOffset + command.line,
													col: command.col,
												},
											]);
											return;
										} else {
											throw new Error(errorMessage);
										}
									}
								}

								const args = [];
								let creg = {};
								for (let i = 0; i < command.args.length; i++) {
									const arg = command.args[i];
									if (command.name === "MEASURE") {
										const cregStart = arg.indexOf("[");
										if (cregStart >= 0) {
											const cregEnd = arg.indexOf("]");
											if (cregEnd > cregStart) {
												const cregBit = arg.substring(cregStart + 1, cregEnd);
												const cregName = arg.substring(0, cregStart);

												creg = {
													bit: cregBit,
													name: cregName,
												};
											}
										} else {
											argInt = parseInt(arg);
											if (isNaN(argInt)) {
												if (i > 0) {
													args.push(arg);
												} else {
													errorMessage = 'Invalid argument "' + arg + '"';
													if (errorCallback) {
														errorCallback([
															{
																msg: errorMessage,
																line: lineOffset + command.line,
																col: command.col,
															},
														]);
														return;
													} else {
														throw new Error(errorMessage);
													}
												}
											}
											args.push(argInt);
										}
									} else {
										argInt = parseInt(arg);
										if (isNaN(argInt)) {
											errorMessage = 'Invalid argument "' + arg + '"';
											if (errorCallback) {
												errorCallback([
													{
														msg: errorMessage,
														line: lineOffset + command.line,
														col: command.col,
													},
												]);
												return;
											} else {
												throw new Error(errorMessage);
											}
										}
										args.push(argInt);
									}
								}

								self.appendGate(gateInfo.name, args, {
									params: params,
									creg: creg,
								});
							}
						}
					}
				}
				break;
		}
	}

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if (errorCallback) {
		errorCallback([]);
	}
};

QuantumCircuit.prototype.importIonq = function (data, errorCallback) {
	const self = this;

	const numQubits = data.qubits || 1;

	self.init(numQubits);

	if (!data.circuit) {
		const errorMessage = "Invalid file format.";
		if (errorCallback) {
			errorCallback([{ msg: errorMessage, line: -1, col: -1 }]);
			return;
		} else {
			throw new Error(errorMessage);
		}
	}

	function getGateInfo(gateName) {
		if (self.customGates && self.customGates[gateName]) {
			return { name: gateName, customGate: self.customGates[gateName] };
		}

		for (let gname in self.basicGates) {
			const gdef = self.basicGates[gname];
			if (gdef.exportInfo) {
				if (
					gdef.exportInfo.ionq &&
					((gdef.exportInfo.ionq.name && gdef.exportInfo.ionq.name === gateName) ||
						(gdef.exportInfo.ionq.names &&
							gdef.exportInfo.ionq.names.indexOf(gateName) >= 0))
				) {
					return { name: gname, gateDef: gdef };
				}
			}
		}

		return null;
	}

	data.circuit.map(function (ionqGate) {
		let errorMessage;
		const gateInfo = getGateInfo(ionqGate.gate);
		if (!gateInfo) {
			errorMessage = 'Unknown gate "' + ionqGate.gate + '"';
			if (errorCallback) {
				errorCallback([{ msg: errorMessage, line: -1, col: -1 }]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		let wires = [];
		if (typeof ionqGate.control != "undefined") {
			wires.push(ionqGate.control);
		}
		if (typeof ionqGate.controls != "undefined") {
			wires = wires.concat(ionqGate.controls);
		}
		if (typeof ionqGate.target != "undefined") {
			wires.push(ionqGate.target);
		}
		if (typeof ionqGate.targets != "undefined") {
			wires = wires.concat(ionqGate.targets);
		}

		let params = [];
		if (typeof ionqGate.rotation != "undefined") {
			params.push(ionqGate.rotation);
		}
		if (typeof ionqGate.phase != "undefined") {
			params.push(ionqGate.phase);
		}
		if (typeof ionqGate.phases != "undefined") {
			params = params.concat(ionqGate.phases);
		}

		const gateQubits = gateInfo.gateDef
			? gateInfo.gateDef.matrix
				? math.log2(gateInfo.gateDef.matrix.length)
				: 1
			: gateInfo.customGate.numQubits || 1;

		const gateParams = gateInfo.gateDef
			? gateInfo.gateDef.params || []
			: gateInfo.customGate.params || [];

		if (wires.length !== gateQubits) {
			errorMessage = 'Gate "' +
				ionqGate.gate +
				'": invalid number of qubits. Expected ' +
				gateQubits +
				" but got " +
				wires.length +
				".";
			if (errorCallback) {
				errorCallback([{ msg: errorMessage, line: -1, col: -1 }]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		if (params.length !== gateParams.length) {
			errorMessage = 'Gate "' +
			ionqGate.gate +
			'": invalid number of params. Expected ' +
			gateParams.length +
			" but got " +
			params.length +
			".";
			if (errorCallback) {
				errorCallback([{ msg: errorMessage, line: -1, col: -1 }]);
				return;
			} else {
				throw new Error(errorMessage);
			}
		}

		const options = {};

		if (params.length) {
			options.params = {};
			gateParams.map(function (paramName, paramIndex) {
				options.params[paramName] = ionqGate.rotation
					? params[paramIndex]
					: 2 * math.pi * params[paramIndex];
			});
		}

		self.appendGate(gateInfo.name, wires, options);
	});

	// This error handling is cr*p but let's be consistent with importQASM() for now
	if (errorCallback) {
		errorCallback([]);
	}
};

QuantumCircuit.prototype.exportToIonq = function () {
	let ionqGate;

	let globalParams =
		this.options && this.options.params ? this.options.params : {};
	globalParams = JSON.parse(JSON.stringify(globalParams));
	for (let globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	// ---
	// decompose circuit
	const circuit = new QuantumCircuit();
	circuit.load(this.save(true));
	// ---

	const ionqCircuit = {
		qubits: circuit.numQubits,
		circuit: [],
	};

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);

			if (gate && gate.connector === 0) {
				const gateDef = circuit.getGateDef(gate.name);

				if (gateDef.exportInfo && gateDef.exportInfo.ionq) {
					if (gateDef.exportInfo.ionq.name || gateDef.exportInfo.ionq.names) {
						ionqGate = {
							gate: gateDef.exportInfo.ionq.name || gateDef.exportInfo.ionq.names[0],
						};

						if (gateDef.params && gateDef.params.length) {
							ionqGate[gateDef.exportInfo.ionq.paramsKey] = [];
							gateDef.params.map(function (paramName) {
								let paramValue = math.evaluate(
									gate.options.params[paramName],
									globalParams,
								);
								if (gateDef.exportInfo.ionq.paramsKey !== "rotation") {
									paramValue = paramValue / (2 * math.pi);
								}
								ionqGate[gateDef.exportInfo.ionq.paramsKey].push(paramValue);
							});
						}

						ionqCircuit.circuit.push(ionqGate);
					} else {
						ionqGate = {
							gate:
								'Export gate "' +
								gate.name +
								'" to IONQ not supported yet. Comming soon.',
						};
						ionqCircuit.circuit.push(ionqGate);
					}
				} else {
					ionqGate = {
						gate:
							'Export gate "' +
							gate.name +
							'" to IONQ not supported yet. Comming soon.',
					};
					ionqCircuit.circuit.push(ionqGate);
				}
			}
		}
	}

	return ionqCircuit;
};

QuantumCircuit.prototype.exportQuirk = function (decompose) {
	let alreadyDefined;
	let columnElement;
	let gatePresentInCol;
	let gate;
	let wire;
	let column;
	let numCols;
	const self = this;

	let circuit = null;

	function range(n) {
		const arr = [];
		for (let i = 0; i < n; i++) {
			arr.push(i);
		}
		return arr;
	}

	function isWireInRange(wire, wireRange) {
		return wireRange.indexOf(wire) > -1;
	}

	// force decompose
	decompose = true;
	const obj = this.save(decompose);
	circuit = new QuantumCircuit();
	const tempCircuit = new QuantumCircuit();
	circuit.load(obj);
	tempCircuit.load(obj);

	const quirk = {
		cols: [],
		gates: [],
	};

	let gateMatrix = null;

	const globalParams =
		this.options && this.options.params ? this.options.params : {};

	const customGateCircuit = new QuantumCircuit();

	const gatesToBeAdded = [];

	const gateInformation = {};

	if (!decompose) {
		numCols = tempCircuit.numCols();
		for (column = numCols - 1; column >= 0; column--) {
			for (wire = 0; wire < tempCircuit.numQubits; wire++) {
				gate = tempCircuit.gates[wire][column];
				if (gate && gate.connector === 0 && !tempCircuit.basicGates[gate.name]) {
					let customDecomposedCircuit = tempCircuit.decomposeGateAt(column, wire);
					let isDecomposeCustomCircuit = false;
					gateInformation[gate.name] = {
						info: [],
						isDecomposeCustomCircuit: null,
					};
					for (
						let decomposedColumn = 0;
						decomposedColumn < customDecomposedCircuit.numCols();
						decomposedColumn++
					) {
						for (
							let decomposedWire = 0;
							decomposedWire < customDecomposedCircuit.numQubits;
							decomposedWire++
						) {
							const gateInCustomCircuit = customDecomposedCircuit.getGateAt(
								decomposedColumn,
								decomposedWire,
							);

							if (gateInCustomCircuit) {
								const basicGateInCustomCircuit =
									customDecomposedCircuit.basicGates[gateInCustomCircuit.name];
								if (
									basicGateInCustomCircuit.exportInfo &&
									!basicGateInCustomCircuit.exportInfo.quirk
								) {
									isDecomposeCustomCircuit = isDecomposeCustomCircuit || true;
								}

								if (gateInCustomCircuit.connector === 0) {
									gateInformation[gate.name].info.push({
										gateInCustomCircuit: gateInCustomCircuit,
										column: column,
									});
									gatesToBeAdded.push(gateInformation);
								}
							}
							gateInformation[gate.name].isDecomposeCustomCircuit =
								isDecomposeCustomCircuit;
						}
					}

					if (isDecomposeCustomCircuit) {
						circuit.gates.map(function (circuitGate) {
							circuitGate.map(function (gateToRemove) {
								if (gateToRemove && gateToRemove.name === gate.name) {
									circuit.removeGate(gateToRemove.id);
								}
							});
						});
					}
				}
			}
		}
	}

	let gateKeys = Object.keys(gateInformation);
	for (let gateNumber = 0; gateNumber < gateKeys.length; gateNumber++) {
		let gateKey = gateKeys[gateNumber];
		if (gateInformation[gateKey].isDecomposeCustomCircuit) {
			for (let i = gateInformation[gateKey].info.length - 1; i >= 0; i--) {
				const gateInfo = gateInformation[gateKey].info[i];
				const gateToAdd = gateInfo.gateInCustomCircuit;
				circuit.insertGate(
					gateToAdd.name,
					gateInfo.column,
					gateToAdd.wires,
					gateToAdd.options,
				);
			}
		}
	}

	let previousColumn = null;
	let previousGate = null;
	for (column = 0; column < numCols; column++) {
		for (wire = 0; wire < circuit.numQubits; wire++) {
			gate = circuit.getGateAt(column, wire);
			if (gate) {
				if (
					previousGate &&
					previousGate.name !== gate.name &&
					previousGate.connector !== 0 &&
					previousColumn === column
				) {
					circuit.removeGate(gate.id);
					circuit.insertGate(gate.name, gate.column + 1, gate.wires, gate.options);
				}
				previousGate = gate;
				previousColumn = column;
			}
		}
	}

	numCols = circuit.numCols();
	for (column = 0; column < numCols; column++) {
		const quirkColumn = [];
		let wireRange = [];
		let isBasicGate = false;
		for (wire = 0; wire < circuit.numQubits; wire++) {
			gate = circuit.getGateAt(column, wire);
			if (!gate || gate.name === "measure" || gate.name === "reset") {
				if (isBasicGate || !isWireInRange(wire, wireRange)) {
					quirkColumn.push(1);
				}
			} else {
				const basicGate = circuit.basicGates[gate.name];
				const maxWire = math.max(gate.wires);
				const minWire = math.min(gate.wires);
				const gateWires = gate.wires.slice();
				wireRange = range(maxWire);
				if (basicGate) {
					let quirkName = "";
					let controlled = false;
					isBasicGate = true;
					if (basicGate.exportInfo && basicGate.exportInfo.quirk) {
						quirkName = basicGate.exportInfo.quirk.name;
						controlled = basicGate.exportInfo.quirk.controlled;
					}
					// two-qubit gate
					if (basicGate.matrix.length === 4) {
						// known gate, but this is control bit
						if (
							(quirkName &&
								gate.name === "swap" &&
								gate.connector < gate.wires.length - 2 &&
								controlled) ||
							(gate.name !== "swap" &&
								gate.connector < gate.wires.length - 1 &&
								controlled)
						) {
							quirkName = "•";
						}
					}

					// three-qubit gate
					if (basicGate.matrix.length === 8) {
						// known gate, but this is control bit
						if (
							(quirkName &&
								gate.name === "cswap" &&
								gate.connector < gate.wires.length - 2 &&
								controlled) ||
							(gate.name !== "cswap" &&
								gate.connector < gate.wires.length - 1 &&
								controlled)
						) {
							quirkName = "•";
						}
					}

					if (quirkName) {
						// add gate to column
						quirkColumn.push(quirkName);
					}

					// Not directly supported by quirk
					if (!quirkName) {
						quirkName = "~" + gate.name;

						if (basicGate.params.length && gate.options.params) {
							basicGate.params.map(function (param) {
								let angle = math.round(
									math.evaluate(gate.options.params[param], globalParams),
									7,
								);
								quirkName += "_" + angle;
							});
						}

						let matrix = "";
						matrix += "{";

						const rawMatrix = self.getRawGate(basicGate, gate.options);

						const targetWiresSorted = gateWires.sort();
						const targetWires = [];
						gate.wires.map(function (tWire) {
							targetWires.push(targetWiresSorted.indexOf(tWire));
						});
						if (
							maxWire - minWire + 1 > gate.wires.length ||
							gate.wires[0] > gate.wires[1]
						) {
							gateMatrix = circuit.transformMatrix(
								maxWire - minWire + 1,
								rawMatrix,
								targetWires,
							);
						} else {
							gateMatrix = rawMatrix;
						}

						gateMatrix.map(function (row, rowIndex) {
							if (rowIndex > 0) {
								matrix += ",";
							}
							matrix += "{";

							row.map(function (col, colIndex) {
								if (colIndex > 0) {
									matrix += ",";
								}

								if (typeof col != "object") {
									col = math.complex(col).toString();
								} else {
									col = col.toString();
								}

								matrix += col;
							});
							matrix += "}";
						});
						matrix += "}";

						if (gate.connector === 0) {
							alreadyDefined = quirk.gates.find(function (gt) {
								return gt.id === quirkName;
							});

							if (!alreadyDefined) {
								quirk.gates.push({
									id: quirkName,
									matrix: matrix,
								});
							}

							gatePresentInCol = false;
							for (
								columnElement = 0;
								columnElement < quirkColumn.length;
								columnElement++
							) {
								if (quirkColumn[columnElement] === quirkName) {
									gatePresentInCol = true;
								}
							}

							if (!gatePresentInCol) {
								quirkColumn.push(quirkName);
							} else {
								quirkColumn.push(1);
							}
						} else {
							if (wire < gate.wires[0]) {
								quirk.gates.push({
									id: quirkName,
									matrix: matrix,
								});
								alreadyDefined = quirk.gates.find(function (gt) {
									return gt.id === quirkName;
								});

								if (!alreadyDefined) {
									quirk.gates.push({
										id: quirkName,
										matrix: matrix,
									});
								}

								gatePresentInCol = false;
								for (
									columnElement = 0;
									columnElement < quirkColumn.length;
									columnElement++
								) {
									if (quirkColumn[columnElement] === quirkName) {
										gatePresentInCol = true;
									}
								}

								if (!gatePresentInCol) {
									quirkColumn.push(quirkName);
								} else {
									quirkColumn.push(1);
								}
							}
						}
					}
				} else {
					const customGateWires = [];
					isBasicGate = false;
					if (gate.connector === 0) {
						const customGateExists = customGateCircuit.gates.find(
							function (customGate) {
								return (
									customGate && customGate[0] && customGate[0]["name"] === gate.name
								);
							},
						);
						if (!customGateExists) {
							const wireOffset = gate.wires[0];
							gate.wires.map(function (gateWire) {
								customGateWires.push(gateWire - wireOffset);
							});
							customGateCircuit.registerGate(gate.name, self.customGates[gate.name]);
							customGateCircuit.appendGate(gate.name, customGateWires);
						}
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
	if (!decompose) {
		const usedGates = circuit.usedGates();
		usedGates.map(function (usedGateName) {
			const basicGate = circuit.basicGates[usedGateName];
			if (!basicGate) {
				const customGate = self.customGates[usedGateName];
				if (customGate) {
					const customCircuit = new QuantumCircuit();
					for (let customCol = 0; customCol < customGateCircuit.numCols(); customCol++) {
						let customWire;
						for (
							customWire = 0;
							customWire < customGateCircuit.numGates();
							customWire++
						) {
							const circuitGate = customGateCircuit.getGateAt(customCol, customWire);
							if (circuitGate && circuitGate.name === usedGateName) {
								let customGateObj = customGateCircuit.decomposeGateAt(
									customCol,
									customWire,
								);
								customCircuit.load(customGateObj);
							}
						}
					}
					quirk.gates.push({
						id: "~" + usedGateName,
						circuit: customCircuit.exportQuirk(true),
					});
				}
			}
		});
	}

	return quirk;
};

QuantumCircuit.prototype.exportCirq = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	asJupyter,
	shots,
	exportTfq,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots,
		exportTfq: exportTfq,
	};
	return this.exportToCirq(options, exportAsGateName);
};

QuantumCircuit.prototype.exportQSharp = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	asJupyter,
	circuitName,
	indentDepth,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		circuitName: circuitName,
		indentDepth: indentDepth,
	};
	return this.exportToQSharp(options, exportAsGateName);
};

QuantumCircuit.prototype.exportQobj = function (
	circuitName,
	experimentName,
	numShots,
	circuitReplacement,
) {
	const options = {
		circuitName: circuitName,
		experimentName: experimentName,
		numShots: numShots,
	};

	return this.exportToQobj(options, circuitReplacement);
};

QuantumCircuit.prototype.importQobj = function (qobj, errorCallback) {
	let options;
	let errorMessage;
	let condition;
	const self = this;

	this.init();

	if (!qobj || !qobj.experiments || !qobj.experiments.length) {
		if (errorCallback) {
			errorCallback([{ msg: "Invalid input file: no experiments found." }]);
		}
		return;
	}

	const experiment = qobj.experiments[0];

	const header = experiment.header || {};

	// Add qubits
	this.init(parseInt(header.n_qubits || 0));

	// Classical registers
	const cregData = {};
	if (header.creg_sizes && header.creg_sizes.length) {
		let totalBits = 0;
		for (let i = 0; i < header.creg_sizes.length; i++) {
			const cregDef = header.creg_sizes[i];
			if (cregDef.length > 1) {
				const cregName = cregDef[0] + "";
				const cregLen = parseInt(cregDef[1]);
				this.createCreg(cregName, cregLen);

				const cregMask = (1 << (totalBits + cregLen)) - (1 << totalBits);

				cregData[cregName] = {
					mask: cregMask,
					offset: totalBits,
				};

				totalBits += cregLen;
			}
		}
	}

	// Return classical condition argument for gate from bfunc mask and value
	function conditionFromMaskAndValue(mask, value) {
		for (let cregName in cregData) {
			const data = cregData[cregName];

			if (data.mask === mask) {
				return {
					creg: cregName,
					value: value >> data.offset,
				};
			}
		}
	}

	// Obtain classical register name and local bit number from global bit number
	function memoryToCreg(memory) {
		let totalBits = 0;
		for (let cregName in self.cregs) {
			const creg = self.cregs[cregName];
			if (totalBits + creg.length > memory) {
				return {
					name: cregName,
					bit: memory - totalBits,
				};
			}
			totalBits += creg.length;
		}
		return null;
	}

	// Add gates
	const conditions = {};
	for (
		let instIndex = 0;
		instIndex < experiment.instructions.length;
		instIndex++
	) {
		const inst = experiment.instructions[instIndex];

		switch (inst.name) {
			// classical control
			case "bfunc":
				{
					condition = conditionFromMaskAndValue(
						parseInt(inst.mask),
						parseInt(inst.val),
					);

					if (!condition) {
						errorMessage = "Invalid classical condition.";
						if (errorCallback) {
							errorCallback([{ msg: errorMessage }]);
							return;
						} else {
							throw new Error(errorMessage);
						}
					}

					conditions[inst.register] = condition;
				}
				break;

			// Measurement
			case "measure":
				{
					for (let qIndex = 0; qIndex < inst.qubits.length; qIndex++) {
						const qubit = inst.qubits[qIndex];
						const memory = inst.memory[qIndex];
						const creg = memoryToCreg(memory);
						if (!creg) {
							errorMessage = "Invalid measurement destination.";
							if (errorCallback) {
								errorCallback([{ msg: errorMessage }]);
								return;
							} else {
								throw new Error(errorMessage);
							}
						}

						options = {creg: creg};

						this.appendGate("measure", qubit, options);
					}
				}
				break;

			case "barrier":
				{
					// !!! Not implemented yet. Ignore for now.
				}
				break;

			// Normal gate
			default: {
				options = {
					params: {},
					condition: {},
				};

				// Find gate definition
				let gateName = inst.name;
				switch (gateName) {
					case "iden":
						gateName = "id";
						break;
				}

				const gateDef = this.basicGates[gateName];
				if (!gateDef) {
					errorMessage = 'Unknown gate "' + inst.name + '".';
					if (errorCallback) {
						errorCallback([{ msg: errorMessage }]);
						return;
					} else {
						throw new Error(errorMessage);
					}
				}

				// Gate params (if any)
				if (gateDef.params && gateDef.params.length) {
					if (
						!inst.params ||
						!inst.params.length ||
						inst.params.length !== gateDef.params.length
					) {
						errorMessage = 'Invalid number of params for gate "' + inst.name + '".';
						if (errorCallback) {
							errorCallback([{ msg: errorMessage }]);
							return;
						} else {
							throw new Error(errorMessage);
						}
					}

					for (let parIndex = 0; parIndex < gateDef.params.length; parIndex++) {
						const paramName = gateDef.params[parIndex];
						options.params[paramName] = inst.params[parIndex];
					}
				}

				// Classical control (if any)
				if (typeof inst.conditional != "undefined") {
					condition = conditions[inst.conditional];
					if (!condition) {
						errorMessage = "Invalid classical condition.";
						if (errorCallback) {
							errorCallback([{ msg: errorMessage }]);
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
	if (errorCallback) {
		errorCallback([]);
	}
};

QuantumCircuit.prototype.exportTFQ = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	asJupyter,
	shots,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots,
	};
	return this.exportToTFQ(options, exportAsGateName);
};

QuantumCircuit.prototype.exportBraket = function (
	comment,
	decompose,
	exportAsGateName,
	versionStr,
	asJupyter,
	shots,
	hybrid,
	indentDepth,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
		indentDepth: indentDepth,
	};

	return this.exportToBraket(options, exportAsGateName);
};

QuantumCircuit.prototype.exportSVG = function (embedded, options) {
	const newOptions = options || {};
	newOptions.embedded = !!embedded;

	return this.exportToSVG(newOptions);
};

QuantumCircuit.prototype.exportToSVG = function (optionsArg) {
	let currentCol;
	let wireY;
	let column;
	let wire;
	let svg;
	let gate;
	let gateName;
	const self = this;
	const options = optionsArg || {};

	options.embedded = options.embedded || false;
	options.cellWidth = options.cellWidth || 40;
	options.cellHeight = options.cellHeight || 40;
	options.hSpacing = options.hSpacing || 28;
	options.vSpacing = options.vSpacing || 34;
	options.blackboxPaddingX = options.blackboxPaddingX || 2;
	options.blackboxPaddingY = options.blackboxPaddingY || 2;
	options.blackboxLineColor = options.blackboxLineColor || "black";
	options.blackboxSelectedLineColor =
		options.blackboxSelectedLineColor || "black";
	options.wireColor = options.wireColor || "black";
	options.gateLineColor = options.gateLineColor || "black";
	options.gateSelectedLineColor = options.gateSelectedLineColor || "black";
	options.cWireColor = options.cWireColor || "silver";
	options.cWireSelectedColor = options.cWireSelectedColor || "silver";
	options.cArrowSize = options.cArrowSize || 10;
	options.hWireColor = options.hWireColor || "black";
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

	if (typeof options.drawHybrid == "undefined") {
		options.drawHybrid = this.options ? !!this.options.hybrid : false;
	}

	const getCregIndex = function (name) {
		let cregIndex = 0;
		for (let cregName in self.cregs) {
			if (cregName === name) {
				return cregIndex;
			}
			cregIndex++;
		}
		return cregIndex;
	};

	const getCellX = function (col) {
		return (
			options.wireLabelWidth +
			(options.cellWidth + options.hSpacing) * col +
			options.hSpacing
		);
	};

	const getCellY = function (wire) {
		return (options.cellHeight + options.vSpacing) * wire + options.vSpacing;
	};

	const numRows = this.numQubits;
	const numCols = this.numCols();
	const numCregs = this.cregCount();

	let totalCols = numCols;
	// reserve col for bloch spheres
	if (options.drawBlochSpheres) {
		totalCols++;
	}

	const totalWireCols = totalCols;

	// reserve 2 cols for hybrid quantum-classical connector
	if (options.drawHybrid) {
		totalCols += 2;
	}

	const totalWidth = getCellX(totalCols);
	const totalWireWidth = getCellX(totalWireCols);
	const totalHeight =
		(options.cellHeight + options.vSpacing) *
			(numRows + numCregs + (options.drawHybrid ? 1 : 0)) +
		options.vSpacing;
	const hybridWireY =
		(options.cellHeight + options.vSpacing) * (numRows + numCregs) +
		(options.vSpacing + options.cellHeight / 2);

	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

		return {
			x: centerX + radius * Math.cos(angleInRadians),
			y: centerY + radius * Math.sin(angleInRadians),
		};
	}

	function describeArc(x, y, radius, startAngle, endAngle) {
		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);

		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		return [
			"M",
			start.x,
			start.y,
			"A",
			radius,
			radius,
			0,
			largeArcFlag,
			0,
			end.x,
			end.y,
		].join(" ");
	}

	const qWireY = function (wire) {
		return (
			(options.cellHeight + options.vSpacing) * wire +
			(options.vSpacing + options.cellHeight / 2)
		);
	};

	const qGateY = function (wire) {
		return (options.cellHeight + options.vSpacing) * wire + options.vSpacing;
	};

	const cWireY = function (cregName) {
		return (
			(options.cellHeight + options.vSpacing) *
				(numRows + getCregIndex(cregName)) +
			(options.vSpacing + options.cellHeight / 2)
		);
	};

	function gateBoxSVG(gateX, gateY, gateName, gateLabel, selected) {
		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;

		let res = "";

		res +=
			'<rect class="qc-gate-box" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="white" stroke-width="1" />';
		if (gateLabel) {
			res +=
				'<text class="qc-gate-label" x="' +
				(gateX + gateWidth / 2) +
				'" y="' +
				(gateY + gateHeight / 2) +
				'" dominant-baseline="middle" text-anchor="middle" fill="' +
				(selected ? options.gateSelectedLineColor : options.gateLineColor) +
				'">' +
				gateLabel +
				"</text>";
		}

		return res;
	}

	function gateRectSVG(gateX, gateY, gateName, gateLabel, selected) {
		const gateWidth = options.cellWidth * 2;
		const gateHeight = options.cellHeight;

		let res = "";

		res +=
			'<rect class="qc-gate-rect" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="white" stroke-width="1" />';
		if (gateLabel) {
			res +=
				'<text class="qc-gate-label" x="' +
				(gateX + gateWidth / 2) +
				'" y="' +
				(gateY + gateHeight / 2) +
				'" dominant-baseline="middle" text-anchor="middle">' +
				gateLabel +
				"</text>";
		}

		return res;
	}

	function gateCircleSVG(cellX, cellY, gateName, gateLabel, selected) {
		const centerX = cellX + options.cellWidth / 2;
		const centerY = cellY + options.cellHeight / 2;

		const gateWidth = options.cellWidth * 0.8;
		const gateHeight = options.cellHeight * 0.8;
		const gateX = cellX + (options.cellWidth - gateWidth) / 2;
		const gateY = cellY + (options.cellHeight - gateHeight) / 2;

		let res = "";

		res +=
			'<ellipse class="qc-gate-not" cx="' +
			centerX +
			'" cy="' +
			centerY +
			'" rx="' +
			gateWidth / 2 +
			'" ry="' +
			gateHeight / 2 +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="white" stroke-width="1" />';
		if (gateLabel) {
			res +=
				'<text class="qc-gate-label" x="' +
				(gateX + gateWidth / 2) +
				'" y="' +
				(gateY + gateHeight / 2) +
				'" dominant-baseline="middle" text-anchor="middle">' +
				gateLabel +
				"</text>";
		}

		return res;
	}

	function gateNotSVG(cellX, cellY, gateName, selected) {
		const centerX = cellX + options.cellWidth / 2;
		const centerY = cellY + options.cellHeight / 2;

		const gateWidth = options.cellWidth * 0.8;
		const gateHeight = options.cellHeight * 0.8;
		const gateX = cellX + (options.cellWidth - gateWidth) / 2;
		const gateY = cellY + (options.cellHeight - gateHeight) / 2;

		let res = "";

		res +=
			'<ellipse class="qc-gate-not" cx="' +
			centerX +
			'" cy="' +
			centerY +
			'" rx="' +
			gateWidth / 2 +
			'" ry="' +
			gateHeight / 2 +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="white" stroke-width="1" />';
		res +=
			'<line class="qc-gate-not-line" x1="' +
			centerX +
			'" x2="' +
			centerX +
			'" y1="' +
			gateY +
			'" y2="' +
			(gateY + gateHeight) +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" stroke-width="1" />';
		res +=
			'<line class="qc-gate-not-line" x1="' +
			gateX +
			'" x2="' +
			(gateX + gateWidth) +
			'" y1="' +
			centerY +
			'" y2="' +
			centerY +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" stroke-width="1" />';

		return res;
	}

	function gateGaugeSVG(gateX, gateY, gateName, selected) {
		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;
		const centerX = gateX + gateWidth / 2;
		const centerY = gateY + gateHeight / 2;
		const movedown = gateHeight / 5;

		let res = "";

		res +=
			'<rect class="qc-gate-box" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="white" stroke-width="1" />';
		res +=
			'<path class="gc-gate-gauge-arc" d="' +
			describeArc(centerX, centerY + movedown, gateWidth / 2.3, 300, 60) +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" fill="none" stroke-width="1" />';
		res +=
			'<line class="qc-gate-gauge-scale" x1="' +
			centerX +
			'" x2="' +
			(gateX + gateWidth - movedown) +
			'" y1="' +
			(centerY + movedown) +
			'" y2="' +
			(gateY + movedown) +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" stroke-width="1" />';

		return res;
	}

	function gateXSVG(cellX, cellY, gateName, selected) {
		const gateWidth = options.cellWidth * 0.4;
		const gateHeight = options.cellHeight * 0.4;
		const gateX = cellX + (options.cellWidth - gateWidth) / 2;
		const gateY = cellY + (options.cellHeight - gateHeight) / 2;

		let res = "";
		res +=
			'<line class="qc-gate-x" x1="' +
			gateX +
			'" x2="' +
			(gateX + gateWidth) +
			'" y1="' +
			gateY +
			'" y2="' +
			(gateY + gateHeight) +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" stroke-width="1" />';
		res +=
			'<line class="qc-gate-x" x1="' +
			gateX +
			'" x2="' +
			(gateX + gateWidth) +
			'" y1="' +
			(gateY + gateHeight) +
			'" y2="' +
			gateY +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.gateLineColor) +
			'" stroke-width="1" />';
		return res;
	}

	function gateDotSVG(cellX, cellY, gateName, selected) {
		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;
		const centerX = cellX + gateWidth / 2;
		const centerY = cellY + gateHeight / 2;

		let res = "";
		res +=
			'<circle class="qc-gate-dot" cx="' +
			centerX +
			'" cy="' +
			centerY +
			'" r="' +
			options.dotRadius +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.wireColor) +
			'" fill="' +
			(selected ? options.gateSelectedLineColor : options.wireColor) +
			'" stroke-width="1" />';
		return res;
	}

	function gateInvertedDotSVG(cellX, cellY, gateName, selected) {
		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;
		const centerX = cellX + gateWidth / 2;
		const centerY = cellY + gateHeight / 2;

		let res = "";
		res +=
			'<circle class="qc-gate-ndot" cx="' +
			centerX +
			'" cy="' +
			centerY +
			'" r="' +
			options.dotRadius +
			'" stroke="' +
			(selected ? options.gateSelectedLineColor : options.wireColor) +
			'" fill="white" stroke-width="1" />';
		return res;
	}

	function gateSVG(
		gateX,
		gateY,
		gateName,
		gateLabel,
		connector,
		drawBox,
		selected,
	) {
		let res = "";

		if (connector !== "box" && drawBox) {
			res += gateBoxSVG(gateX, gateY, gateName, "", selected);
		}

		switch (connector) {
			case "box":
				res += gateBoxSVG(gateX, gateY, gateName, gateLabel, selected);
				break;
			case "rect":
				res += gateRectSVG(gateX, gateY, gateName, gateLabel, selected);
				break;
			case "circle":
				res += gateCircleSVG(gateX, gateY, gateName, gateLabel, selected);
				break;
			case "not":
				res += gateNotSVG(gateX, gateY, gateName, selected);
				break;
			case "x":
				res += gateXSVG(gateX, gateY, gateName, selected);
				break;
			case "dot":
				res += gateDotSVG(gateX, gateY, gateName, selected);
				break;
			case "ndot":
				res += gateInvertedDotSVG(gateX, gateY, gateName, selected);
				break;
			case "gauge":
				res += gateGaugeSVG(gateX, gateY, gateName, selected);
				break;
		}

		return res;
	}

	function drawGate(gate, colIndex) {
		let gateY;
		let gateWidth;
		let gateHeight
		;
		let centerX;
		let gateX;
		let linkY2;
		let linkY1;
		let linkX;
		let dinfo = self.basicGates[gate.name]
			? self.basicGates[gate.name].drawingInfo
			: null;
		if (!dinfo) {
			dinfo = self.customGates[gate.name]
				? self.customGates[gate.name].drawingInfo
				: null;
		}

		let blackbox = false;
		const selected =
			options && options.selection && options.selection.indexOf(gate.id) >= 0;
		if (!dinfo) {
			if (gate.wires.length === 1) {
				dinfo = { connectors: ["box"] };
			} else {
				dinfo = { connectors: [] };
				blackbox = true;
			}
		}
		while (dinfo.connectors.length < gate.wires.length) {
			dinfo.connectors.push("box");
		}

		const topWire = Math.min.apply(null, gate.wires);
		const bottomWire = Math.max.apply(null, gate.wires);
		let cLinkTopY = cWireY(bottomWire);

		let svg = "";
		svg +=
			'<g class="qc-gate-group" data-id="' +
			gate.id +
			'" data-gate="' +
			gate.name +
			'">';
		if (blackbox) {
			gateX = getCellX(colIndex) - options.blackboxPaddingX;
			gateY = qGateY(topWire) - options.blackboxPaddingY;
			gateWidth = options.cellWidth + 2 * options.blackboxPaddingX;
			gateHeight = qGateY(bottomWire) + options.cellHeight - gateY + options.blackboxPaddingY;

			centerX = gateX + gateWidth / 2;

			cLinkTopY = gateY + gateHeight;

			svg +=
				'<text class="qc-blackbox-label" x="' +
				centerX +
				'" y="' +
				(gateY - options.wireTextHeight - options.blackboxPaddingY * 2) +
				'" dominant-baseline="hanging" text-anchor="middle" font-size="75%">' +
				(dinfo.label || gate.name) +
				"</text>";
			svg +=
				'<rect class="qc-gate-blackbox" x="' +
				gateX +
				'" y="' +
				gateY +
				'" width="' +
				gateWidth +
				'" height="' +
				gateHeight +
				'" stroke="' +
				(selected ? options.blackboxSelectedLineColor : options.blackboxLineColor) +
				'" fill="transparent" stroke-width="1" />';
		}

		if (selected) {
			gateX = getCellX(colIndex) - options.selectionPaddingX;
			gateY = qGateY(topWire) - options.selectionPaddingY;
			gateWidth = options.cellWidth + 2 * options.selectionPaddingX;
			gateHeight = qGateY(bottomWire) + options.cellHeight - gateY + options.selectionPaddingY;

			cLinkTopY = gateY + gateHeight;

			svg +=
				'<rect class="qc-gate-selection" x="' +
				gateX +
				'" y="' +
				gateY +
				'" width="' +
				gateWidth +
				'" height="' +
				gateHeight +
				'" stroke="' +
				options.selectionLineColor +
				'" fill="transparent" stroke-dasharray="4" stroke-width="1" />';
		}

		// link
		if (topWire !== bottomWire && !blackbox) {
			linkX = getCellX(colIndex) + options.cellWidth / 2;
			linkY1 = getCellY(topWire) + options.cellHeight / 2;
			linkY2 = getCellY(bottomWire) + options.cellHeight / 2;
			svg +=
				'<line class="qc-gate-link" x1="' +
				linkX +
				'" x2="' +
				linkX +
				'" y1="' +
				linkY1 +
				'" y2="' +
				linkY2 +
				'" stroke="' +
				(selected ? options.gateSelectedLineColor : options.wireColor) +
				'" stroke-width="1" />';
		}

		// connectors
		const maxWire = Math.max.apply(null, gate.wires);
		gate.wires.map(function (wire, connector) {
			let cellY;
			let cellX;
			let gateHeight;
			let gateX;
			let gateY;
			switch (dinfo.connectors[connector]) {
				case "box":
					{
						gateX = getCellX(colIndex);
						gateY = getCellY(wire);

						svg =
							svg +
							gateBoxSVG(
								gateX,
								gateY,
								gate.name,
								blackbox ? qubitLetter(connector, numRows) : dinfo.label || gate.name,
								selected,
							);

						if (!blackbox && wire === bottomWire) {
							cLinkTopY = gateY + options.cellHeight;
						}
					}
					break;

				case "circle":
					{
						gateX = getCellX(colIndex);
						gateY = getCellY(wire);

						svg =
							svg +
							gateCircleSVG(
								gateX,
								gateY,
								gate.name,
								blackbox ? qubitLetter(connector, numRows) : dinfo.label || gate.name,
								selected,
							);

						if (!blackbox && wire === bottomWire) {
							gateHeight = options.cellHeight * 0.8;
							cLinkTopY = gateY + gateHeight + (options.cellHeight - gateHeight) / 2;
						}
					}
					break;

				case "not":
					{
						cellX = getCellX(colIndex);
						cellY = getCellY(wire);

						svg = svg + gateNotSVG(cellX, cellY, gate.name, selected);

						if (!blackbox && wire === bottomWire) {
							gateHeight = options.cellHeight * 0.8;
							cLinkTopY = cellY + gateHeight + (options.cellHeight - gateHeight) / 2;
						}
					}
					break;

				case "x":
					{
						cellX = getCellX(colIndex);
						cellY = getCellY(wire);

						svg = svg + gateXSVG(cellX, cellY, gate.name, selected);

						if (!blackbox && wire === bottomWire) {
							cLinkTopY = qWireY(bottomWire);
						}
					}
					break;

				case "dot":
					{
						cellX = getCellX(colIndex);
						cellY = getCellY(wire);

						svg = svg + gateDotSVG(cellX, cellY, gate.name, selected);

						if (!blackbox && wire === bottomWire) {
							cLinkTopY = qWireY(bottomWire) + options.dotRadius;
						}
					}
					break;

				case "ndot":
					{
						cellX = getCellX(colIndex);
						cellY = getCellY(wire);

						svg = svg + gateInvertedDotSVG(cellX, cellY, gate.name, selected);

						if (!blackbox && wire === bottomWire) {
							cLinkTopY = qWireY(bottomWire) + options.dotRadius;
						}
					}
					break;

				case "gauge":
					{
						gateX = getCellX(colIndex);
						gateY = getCellY(wire);

						svg = svg + gateGaugeSVG(gateX, gateY, gate.name, selected);

						if (!blackbox && wire === bottomWire) {
							cLinkTopY = gateY + options.cellHeight;
						}
					}
					break;
			}

			// params
			if (gate.options && gate.options.params && wire === maxWire) {
				gateX = getCellX(colIndex);
				gateY = getCellY(wire);
				const centerX = gateX + options.cellWidth / 2;

				let paramsStr = "";
				let paramsCount = 0;
				for (let paramName in gate.options.params) {
					if (paramsStr) {
						paramsStr += ", ";
					}

					let paramVal = gate.options.params[paramName];
					if (
						typeof paramVal == "string" &&
						paramVal.match(/^[+\-]?\d*\.?\d+(?:[Ee][+\-]?\d+)?$/)
					) {
						paramVal = parseFloat(paramVal);
					}

					if (typeof paramVal == "number") {
						paramVal = math.round(paramVal, 3);
					}

					paramsStr += paramVal;
					paramsCount++;
				}

				if (paramsStr.length > 26) {
					paramsStr = "(" + paramsCount + " params)";
				}
				svg +=
					'<text class="qc-gate-params" x="' +
					centerX +
					'" y="' +
					(gateY + options.cellHeight + options.paramTextHeight) +
					'" dominant-baseline="hanging" text-anchor="middle" font-size="75%">' +
					paramsStr +
					"</text>";
			}
		});

		// measure
		if (
			gate.name === "measure" &&
			gate.options &&
			gate.options.creg &&
			gate.options.creg.name
		) {
			linkX = getCellX(colIndex) + options.cellWidth / 2;
			linkY1 = cLinkTopY;
			linkY2 = cWireY(gate.options.creg.name);

			svg +=
				'<line class="qc-gate-link-c" x1="' +
				linkX +
				'" x2="' +
				linkX +
				'" y1="' +
				linkY1 +
				'" y2="' +
				linkY2 +
				'" stroke="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" stroke-width="1" />';

			svg +=
				'<line class="qc-gate-link-c" x2="' +
				linkX +
				'" x1="' +
				(linkX - options.cArrowSize / 2) +
				'" y1="' +
				(linkY2 - options.cArrowSize) +
				'" y2="' +
				linkY2 +
				'" stroke="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" stroke-width="1" />';
			svg +=
				'<line class="qc-gate-link-c" x2="' +
				linkX +
				'" x1="' +
				(linkX + options.cArrowSize / 2) +
				'" y1="' +
				(linkY2 - options.cArrowSize) +
				'" y2="' +
				linkY2 +
				'" stroke="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" stroke-width="1" />';

			svg +=
				'<text class="qc-wire-label" x="' +
				linkX +
				'" y="' +
				(linkY2 + options.wireTextHeight) +
				'" dominant-baseline="hanging" text-anchor="middle" font-size="75%">' +
				gate.options.creg.bit +
				"</text>";
		}

		// controlled by classic register
		if (gate.options && gate.options.condition && gate.options.condition.creg) {
			linkX = getCellX(colIndex) + options.cellWidth / 2;
			linkY1 = cLinkTopY;
			linkY2 = cWireY(gate.options.condition.creg);

			svg +=
				'<line class="qc-gate-link-c" x1="' +
				linkX +
				'" x2="' +
				linkX +
				'" y1="' +
				linkY1 +
				'" y2="' +
				linkY2 +
				'" stroke="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" stroke-width="1" />';

			svg +=
				'<circle class="qc-gate-dot-c" cx="' +
				linkX +
				'" cy="' +
				linkY2 +
				'" r="' +
				options.dotRadius +
				'" stroke="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" fill="' +
				(selected ? options.cWireSelectedColor : options.cWireColor) +
				'" stroke-width="1" />';

			svg +=
				'<text class="qc-wire-label" x="' +
				linkX +
				'" y="' +
				(linkY2 + options.wireTextHeight) +
				'" dominant-baseline="hanging" text-anchor="middle" font-size="75%">== ' +
				gate.options.condition.value +
				"</text>";
		}

		svg += "</g>";

		return svg;
	}

	function drawGatePlaceholder(colIndex, wire) {
		let svg = "";

		let gateWidth = options.cellWidth + options.hSpacing;
		let gateHeight = options.cellHeight + options.vSpacing;
		const gateX = getCellX(colIndex) - options.hSpacing;
		const gateY = getCellY(wire) - options.vSpacing;

		if (wire === numRows) {
			gateHeight = options.vSpacing;
		}

		if (colIndex === numCols) {
			gateWidth = options.hSpacing;
		}

		svg +=
			'<rect class="qc-gate-placeholder" data-row="' +
			wire +
			'" data-col="' +
			colIndex +
			'" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="none" fill="transparent" stroke-width="0" />';

		return svg;
	}

	function drawGateHandle(gate, colIndex, wire) {
		let svg = "";

		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;
		const gateX = getCellX(colIndex);
		const gateY = getCellY(wire);

		svg +=
			'<rect class="qc-gate-handle" data-id="' +
			gate.id +
			'" data-gate="' +
			gate.name +
			'" data-row="' +
			wire +
			'" data-col="' +
			colIndex +
			'" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="none" fill="transparent" stroke-width="0" />';

		return svg;
	}

	function drawGateCanvas(colIndex, wire, className, canvasId) {
		let svg = "";

		const gateWidth = options.cellWidth;
		const gateHeight = options.cellHeight;
		const gateX = getCellX(colIndex);
		const gateY = getCellY(wire);

		svg +=
			'<g class="' +
			(className || "qc-canvas-group") +
			'" data-row="' +
			wire +
			'">';
		svg +=
			'<rect class="qc-canvas-box" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'" stroke="transparent" fill="white" stroke-width="1" />';
		svg +=
			'<foreignObject class="qc-canvas-object" x="' +
			gateX +
			'" y="' +
			gateY +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'">';
		svg += '<div style="position:relative;">';
		svg +=
			'<canvas id="' +
			canvasId +
			"-" +
			wire +
			'" class="' +
			canvasId +
			'" width="' +
			gateWidth +
			'" height="' +
			gateHeight +
			'">';
		svg += "</canvas>";
		svg += "</div>";
		svg += "</foreignObject>";
		svg += "</g>";

		return svg;
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
	if (
		options.gateGallery ||
		options.gateGalleryRaw ||
		options.customGateGallery
	) {
		const gateList = [];

		// basic gates
		if (options.gateGallery || options.gateGalleryRaw) {
			const uniq = [];
			for (let gateName in this.basicGates) {
				gate = this.basicGates[gateName];
				const dinfo = JSON.parse(
					JSON.stringify(gate.drawingInfo || {connectors: ["box"]}),
				);
				if (dinfo.connectors) {
					const gateLabel = dinfo.label || gateName;
					let connector = dinfo.connectors
						? dinfo.connectors[dinfo.connectors.length - 1]
						: "box";

					if (options.gateGallery) {
						// Draw "swap", "cu1" and "cz" gates as box
						if (connector === "x" || connector === "dot") {
							connector = "box";
						}
					}

					const uniqStr = gateLabel + "|" + connector;

					if (uniq.indexOf(uniqStr) < 0 && gateName !== "ccx") {
						uniq.push(uniqStr);

						svg = "";
						if (!options.embedded) {
							svg += '<?xml version="1.0"?>';
							svg +=
								'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
						}
						svg +=
							'<svg class="qc-gate-gallery-item" data-gate="' +
							escapeHtml(gateName) +
							'" data-content="' +
							escapeHtml(gate.description) +
							'" width="' +
							options.cellWidth +
							'" height="' +
							options.cellHeight +
							'" version="1.1" xmlns="http://www.w3.org/2000/svg">';
						svg =
							svg +
							gateSVG(
								0,
								0,
								gateName,
								gateLabel,
								connector,
								!!options.gateGallery,
								false,
							);
						svg += "</svg>";

						if (options.gateGallery) {
							gateList.push(svg);
						} else {
							gateList.push({ name: gateName, svg: svg });
						}
					}
				}
			}

			// special item: dot
			let dotsvg = "";
			if (!options.embedded) {
				dotsvg += '<?xml version="1.0"?>';
				dotsvg +=
					'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
			}
			dotsvg +=
				'<svg class="qc-gate-gallery-item" data-gate="dot" data-content="Control" width="' +
				options.cellWidth +
				'" height="' +
				options.cellHeight +
				'" version="1.1" xmlns="http://www.w3.org/2000/svg">';
			dotsvg =
				dotsvg + gateSVG(0, 0, "dot", "dot", "dot", !!options.gateGallery, false);
			dotsvg += "</svg>";

			if (options.gateGallery) {
				gateList.push(dotsvg);
			} else {
				gateList.push({ name: "dot", svg: dotsvg });
			}

			// special item: inverted dot
			let ndotsvg = "";
			if (!options.embedded) {
				ndotsvg += '<?xml version="1.0"?>';
				ndotsvg +=
					'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
			}
			ndotsvg +=
				'<svg class="qc-gate-gallery-item" data-gate="ndot" data-content="Control" width="' +
				options.cellWidth +
				'" height="' +
				options.cellHeight +
				'" version="1.1" xmlns="http://www.w3.org/2000/svg">';
			ndotsvg =
				ndotsvg +
				gateSVG(0, 0, "ndot", "ndot", "ndot", !!options.gateGallery, false);
			ndotsvg += "</svg>";

			if (options.gateGallery) {
				gateList.push(ndotsvg);
			} else {
				gateList.push({ name: "dot", svg: ndotsvg });
			}
		}

		// custom gates
		if (options.customGateGallery) {
			for (gateName in this.customGates) {
				svg = "";
				if (!options.embedded) {
					svg += '<?xml version="1.0"?>';
					svg +=
						'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
				}
				svg +=
					'<svg class="qc-custom-gate-gallery-item" data-gate="' +
					gateName +
					'" width="' +
					options.cellWidth * 2 +
					'" height="' +
					options.cellHeight +
					'" version="1.1" xmlns="http://www.w3.org/2000/svg">';
				svg = svg + gateSVG(0, 0, gateName, gateName, "rect", false, false);
				svg += "</svg>";
				gateList.push(svg);
			}
		}

		return gateList;
	} else {
		svg = "";
		if (!options.embedded) {
			svg += '<?xml version="1.0"?>';
			svg +=
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
		}

		svg +=
			'<svg class="qc-circuit" width="' +
			totalWidth +
			'" height="' +
			totalHeight +
			'" version="1.1" xmlns="http://www.w3.org/2000/svg">';

		if (options.placeholders) {
			for (column = 0; column <= numCols; column++) {
				for (wire = 0; wire <= this.numQubits; wire++) {
					svg += drawGatePlaceholder(column, wire);
				}
			}
		}

		// Quantum wires
		for (wire = 0; wire < numRows; wire++) {
			wireY = qWireY(wire);
			let initSymbol = "0";
			if (options.customGate) {
				initSymbol = qubitLetter(wire, numRows);
			}
			svg +=
				'<text class="qc-wire-init" x="0" y="' +
				wireY +
				'" dominant-baseline="middle" text-anchor="start">|' +
				initSymbol +
				"&#x27E9;</text>";
			svg +=
				'<line class="qc-wire" x1="' +
				options.wireMargin +
				'" x2="' +
				totalWireWidth +
				'" y1="' +
				wireY +
				'" y2="' +
				wireY +
				'" stroke="' +
				options.wireColor +
				'" stroke-width="' +
				options.wireWidth +
				'" />';
			svg +=
				'<text class="qc-wire-label" x="' +
				options.wireMargin +
				'" y="' +
				(wireY - options.wireTextHeight * 2) +
				'" dominant-baseline="hanging" text-anchor="start" font-size="75%">q' +
				wire +
				"</text>";
		}

		// Classical wires
		for (const cregName in this.cregs) {
			wireY = cWireY(cregName);
			svg +=
				'<text class="qc-wire-init" x="0" y="' +
				wireY +
				'" dominant-baseline="middle" text-anchor="start">0</text>';
			svg +=
				'<line class="qc-wire-c" x1="' +
				options.wireMargin +
				'" x2="' +
				totalWireWidth +
				'" y1="' +
				wireY +
				'" y2="' +
				wireY +
				'" stroke="' +
				options.cWireColor +
				'" stroke-width="' +
				options.wireWidth +
				'" />';
			svg +=
				'<text class="qc-wire-label" x="' +
				options.wireMargin +
				'" y="' +
				(wireY - options.wireTextHeight * 2) +
				'" dominant-baseline="hanging" text-anchor="start" font-size="75%">' +
				cregName +
				"</text>";
		}

		// Gates
		for (column = 0; column < numCols; column++) {
			for (wire = 0; wire < this.numQubits; wire++) {
				gate = this.getGateAt(column, wire);
				if (gate) {
					if (gate.connector === 0) {
						svg += drawGate(gate, column, wire);
					}
				}
			}
		}

		// Gate handles (for drag & drop editor)
		for (column = 0; column < numCols; column++) {
			for (wire = 0; wire < this.numQubits; wire++) {
				gate = this.getGateAt(column, wire);
				if (gate) {
					if (options.placeholders) {
						svg += drawGateHandle(gate, column, wire);
					}
				}
			}
		}

		// Place for bloch sphere on each quantum wire
		if (options.drawBlochSpheres) {
			currentCol = totalCols - 1;
			if (options.drawHybrid) {
				currentCol -= 2;
			}

			for (wire = 0; wire < this.numQubits; wire++) {
				svg += drawGateCanvas(
					currentCol,
					wire,
					"qc-bloch-group",
					"qc-bloch-canvas",
				);
			}
		}

		// hybrid quantum-classical
		if (options.drawHybrid) {
			currentCol = totalCols - 2;
			// connector
			const colIndex = currentCol;

			const gateX = getCellX(colIndex) + options.blackboxPaddingX;
			const gateY = qGateY(0) + options.blackboxPaddingY;
			const gateWidth = options.cellWidth - 2 * options.blackboxPaddingX;
			const gateHeight =
				qGateY(numRows + numCregs - 1) +
				options.cellHeight -
				gateY -
				options.blackboxPaddingY;

			const centerX = gateX + gateWidth / 2;
			const centerY = gateY + gateHeight / 2;

			let cLinkTopY = gateY + gateHeight;

			// cost
			svg +=
				'<rect class="qc-cost-h" x="' +
				gateX +
				'" y="' +
				gateY +
				'" width="' +
				gateWidth +
				'" height="' +
				gateHeight +
				'" stroke="' +
				options.hWireColor +
				'" fill="white" stroke-width="1" rx="8" />';
			svg +=
				'<text class="qc-label-h" x="' +
				centerX +
				'" y="' +
				centerY +
				'" dominant-baseline="middle" text-anchor="middle" fill="' +
				options.hWireColor +
				'" transform="rotate(-90, ' +
				centerX +
				", " +
				centerY +
				')">Cost</text>';

			const gate2X = getCellX(colIndex + 1) + options.blackboxPaddingX;
			const center2X = gate2X + gateWidth / 2;

			// arrow
			svg +=
				'<marker id="qc-arrow-head" orient="auto" markerWidth="8" markerHeight="10" refX="8" refY="5"><path d="M0,0 V10 L8,5 Z" fill="' +
				options.hWireColor +
				'"/></marker>';
			svg +=
				'<line class="qc-link-h" x1="' +
				(gateX + gateWidth) +
				'" x2="' +
				gate2X +
				'" y1="' +
				centerY +
				'" y2="' +
				centerY +
				'" stroke="' +
				options.hWireColor +
				'" stroke-width="' +
				options.wireWidth +
				'" marker-end="url(#qc-arrow-head)" />';

			// optimizer
			svg +=
				'<rect class="qc-optimizer-h" x="' +
				gate2X +
				'" y="' +
				gateY +
				'" width="' +
				gateWidth +
				'" height="' +
				gateHeight +
				'" stroke="' +
				options.hWireColor +
				'" fill="white" stroke-width="1" rx="8" />';
			svg +=
				'<text class="qc-label-h" x="' +
				center2X +
				'" y="' +
				centerY +
				'" dominant-baseline="middle" text-anchor="middle" fill="' +
				options.hWireColor +
				'" transform="rotate(-90, ' +
				center2X +
				", " +
				centerY +
				')">Optimizer</text>';

			// link
			const linkX = center2X;
			svg +=
				'<line class="qc-wire-h" x1="' +
				linkX +
				'" x2="' +
				linkX +
				'" y1="' +
				cLinkTopY +
				'" y2="' +
				hybridWireY +
				'" stroke="' +
				options.hWireColor +
				'" stroke-dasharray="4" stroke-width="1" />';

			// Connect all globally parametrized gates
			let hWireX;
			const globalParamsInfo = this.findGlobalParams();
			if (globalParamsInfo.globalParams.length) {
				hWireX =
					getCellX(globalParamsInfo.cells[0][0]) +
					options.cellWidth +
					options.hSpacing / 2;
				for (let i = 0; i < globalParamsInfo.cells.length; i++) {
					const cell = globalParamsInfo.cells[i];

					const link2X =
						getCellX(cell[0]) + options.cellWidth + options.hSpacing / 2;
					const link2Y2 =
						getCellY(cell[1]) +
						options.cellHeight +
						options.vSpacing -
						options.paramTextHeight / 2;
					const link2Y1 = hybridWireY;
					const cellBottomRightX = getCellX(cell[0]) + options.cellWidth;
					const cellBottomRightY =
						getCellY(cell[1]) + options.cellHeight + options.paramTextHeight * 2 + 4;
					svg +=
						'<line class="qc-wire-h" x1="' +
						link2X +
						'" x2="' +
						link2X +
						'" y1="' +
						link2Y1 +
						'" y2="' +
						link2Y2 +
						'" stroke="' +
						options.hWireColor +
						'" stroke-dasharray="4" stroke-width="1" />';
					svg +=
						'<line class="qc-wire-h" x1="' +
						link2X +
						'" x2="' +
						cellBottomRightX +
						'" y1="' +
						link2Y2 +
						'" y2="' +
						cellBottomRightY +
						'" stroke="' +
						options.hWireColor +
						'" stroke-dasharray="4" stroke-width="1" marker-end="url(#qc-arrow-head)" />';
				}

				wireY = hybridWireY;
				svg +=
					'<line class="qc-wire-h" x1="' +
					hWireX +
					'" x2="' +
					center2X +
					'" y1="' +
					wireY +
					'" y2="' +
					wireY +
					'" stroke="' +
					options.hWireColor +
					'" stroke-dasharray="4" stroke-width="' +
					options.wireWidth +
					'" />';
			} else {
				// No gates with global params
				hWireX = getCellX(totalWireCols + 1);

				wireY = hybridWireY;
				svg +=
					'<line class="qc-wire-h" x1="' +
					center2X +
					'" x2="' +
					hWireX +
					'" y1="' +
					wireY +
					'" y2="' +
					wireY +
					'" stroke="' +
					options.hWireColor +
					'" stroke-dasharray="4" stroke-width="' +
					options.wireWidth +
					'"  marker-end="url(#qc-arrow-head)" />';
				svg +=
					'<text class="qc-warning-params-h" x="' +
					(hWireX - 5) +
					'" y="' +
					wireY +
					'" dominant-baseline="middle" text-anchor="end">(no global params)</text>';
			}
		}

		svg += "</svg>";
	}

	return svg;
};

QuantumCircuit.prototype.exportToQiskit = function (
	options,
	exportAsGateName,
	circuitReplacement,
	insideSubmodule,
) {
	let execBlock;
	let w;
	let gateDef;
	let node;
	let identation;
	let needTranspile;
	let isIonqNative;
	let i;
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;
	const versionStr = options.versionStr;
	let providerName = options.providerName;
	let backendName = options.backendName;
	const asJupyter = options.asJupyter;
	let shots = options.shots;
	let hybrid = options.hybrid;

	if (typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	let costFunction =
		this.options &&
		this.options.hybridOptions &&
		this.options.hybridOptions.costFunction
			? this.options.hybridOptions.costFunction.python || ""
			: "";

	const self = this;

	providerName = providerName || "Aer";

	backendName = backendName || "";

	if (providerName === "Aer") {
		if (!backendName) {
			if (hybrid && costFunction.indexOf("state") >= 0) {
				backendName = "statevector_simulator";
			} else {
				backendName = "qasm_simulator";
			}
		}

		if (backendName === "aer_simulator") {
			backendName = "qasm_simulator";
		}

		if (backendName === "aer_simulator_statevector") {
			backendName = "statevector_simulator";
		}
	}
	if (providerName === "IONQ") {
		if (!backendName) {
			backendName = "ionq_simulator";
		}
	}

	shots = shots || 1024;
	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let qiskit = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 1 && cline[0] !== "#") {
				qiskit += "# ";
			}
			qiskit += cline;
			qiskit += "\n";
		});
	}

	const mathToStringHandler = function (node, options) {
		if (node.isSymbolNode) {
			const numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if (numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			let nodeName = node.name;
			if (
				options.replaceVars &&
				typeof options.replaceVars[nodeName] != "undefined"
			) {
				nodeName = options.replaceVars[nodeName];
				if (self.params.indexOf(nodeName) >= 0 && hybrid) {
					return "params[" + self.params.indexOf(nodeName) + "]";
				}
				return nodeName;
			}

			if (self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	const adjustIdentation = function (addStr, ident) {
		let str = "";

		// add user defined cost function with proper identation
		const cfLines = addStr.split("\n");
		let minIdent = -1;
		cfLines.map(function (cfLine) {
			const tmpIdent = cfLine.search(/\S/);
			if (tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if (minIdent < 0) {
			minIdent = 0;
		}

		let addIdent = "";
		if (minIdent < ident.length) {
			for (let tmp = 0; tmp < ident.length - minIdent; tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function (cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	if (exportAsGateName) {
		qiskit += "def " + exportAsGateName + "(qc";

		let argc = 0;
		if (circuit.params && circuit.params.length) {
			for (let pc = 0; pc < circuit.params.length; pc++) {
				qiskit += ", ";
				argc++;
				qiskit += circuit.params[pc];
			}
		}

		for (i = 0; i < circuit.numQubits; i++) {
			qiskit += ", ";
			argc++;
			qiskit += qubitLetter(i, circuit.numQubits);
		}
		qiskit += "):\n";
	} else {
		if (!circuitReplacement) {
			let cregName;
			const usedGates = circuit.usedGates();

			qiskit +=
				"from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n";

			needTranspile = false;
			isIonqNative = false;
			switch (providerName) {
				case "Aer":
					{
						qiskit += "from qiskit import execute, " + providerName + "\n";

						if (
							hybrid &&
							costFunction.indexOf("state") >= 0 &&
							backendName !== "statevector_simulator"
						) {
							qiskit += "from qiskit_experiments.library import StateTomography\n";
						}
					}
					break;

				case "IBMQ":
					{
						qiskit +=
							"from qiskit import execute, " +
							providerName +
							"\nfrom qiskit.providers.ibmq import least_busy\n";
						if (hybrid && costFunction.indexOf("state") >= 0) {
							qiskit += "from qiskit_experiments.library import StateTomography\n";
						}
					}
					break;

				case "IONQ":
					{
						needTranspile = true;

						qiskit += "from qiskit_ionq import IonQProvider\n";

						if (hybrid && costFunction.indexOf("state") >= 0) {
							qiskit += "from qiskit_experiments.library import StateTomography\n";
						}
					}
					break;
			}

			if (
				usedGates.indexOf("ms") >= 0 ||
				usedGates.indexOf("gpi") >= 0 ||
				usedGates.indexOf("gpi2") >= 0
			) {
				needTranspile = true;
				qiskit += "from qiskit_ionq import GPIGate, GPI2Gate, MSGate\n";
			}

			if (needTranspile) {
				qiskit += "from qiskit import transpile\n";
			}

			if (hybrid) {
				qiskit += "from scipy.optimize import minimize\n";
				qiskit += "from collections import Counter\n";
			}

			qiskit += "import numpy as np\n";
			qiskit += "\n";

			identation = "";

			switch (providerName) {
				case "Aer":
					{
						qiskit +=
							identation + "backend = Aer.get_backend('" + backendName + "')\n";
						qiskit += "\n";
					}
					break;

				case "IBMQ":
					{
						qiskit += identation + "IBMQ.load_account()\n";
						qiskit +=
							identation +
							'provider = IBMQ.get_provider(hub="ibm-q", group="open", project="main")\n';
						if (backendName) {
							qiskit +=
								identation + 'backend = provider.get_backend("' + backendName + '")\n';
						} else {
							qiskit += identation + "backends = provider.backends()\n";
							qiskit += identation + "backend = least_busy(backends)\n";
						}
						qiskit += "\n";
					}
					break;

				case "IONQ":
					{
						const ionqNative = [
							"measure",
							"delay",
							"barrier",
							"reset",
							"snapshot",
							"ms",
							"gpi2",
							"gpi",
						];
						isIonqNative = true;
						usedGates.map(function (usedGate) {
							if (ionqNative.indexOf(usedGate) < 0) {
								isIonqNative = false;
							}
						});

						qiskit +=
							identation +
							"# Requires QISKIT_IONQ_API_TOKEN environment variable to be set\n";
						qiskit += identation + "provider = IonQProvider()\n";
						qiskit +=
							identation + 'backend = provider.get_backend("' + backendName + '"';
						if (isIonqNative) {
							qiskit += ', gateset="native"';
						}
						qiskit += ")\n\n";
					}
					break;
			}

			if (shots) {
				qiskit += "shots = " + shots + "\n";
				qiskit += "\n";
			}

			const globalParams =
				this.options && this.options.params ? this.options.params : {};
			if (this.params.length) {
				for (i = 0; i < this.params.length; i++) {
					const globalParamName = this.params[i];

					node = math.parse(globalParams[globalParamName]);
					const globalParamValue = node.toString({
						handler: mathToStringHandler,
					});

					qiskit += globalParamName + " = " + globalParamValue + "\n";
				}
				qiskit += "\n";
			}

			if (hybrid) {
				qiskit +=
					"tolerance = " +
					(this.options &&
					this.options.hybridOptions &&
					this.options.hybridOptions.tolerance
						? this.options.hybridOptions.tolerance || "0.001"
						: "0.001") +
					"\n";
				qiskit += "\n";
			}

			if (!decompose) {
				usedGates.map(function (usedGateName) {
					const basicGate = circuit.basicGates[usedGateName];
					if (!basicGate) {
						const customGate = self.customGates[usedGateName];
						if (customGate) {
							const customCircuit = new QuantumCircuit();
							customCircuit.load(customGate);
							const newOptions = {
								comment: "",
								decompose: true,
								versionStr: versionStr,
								providerName: "",
								backendName: false,
								asJupyter: false,
								shots: false,
								hybrid: null,
							};
							qiskit += customCircuit.exportToQiskit(
								newOptions,
								usedGateName,
								circuitReplacement,
								insideSubmodule,
							);
						}
					}
				});
			}

			if (hybrid) {
				identation = "  ";

				qiskit += "def objective_function(params):\n";
			}

			qiskit += identation + "qc = QuantumCircuit()\n";
			qiskit += "\n";

			qiskit +=
				identation + "q = QuantumRegister(" + circuit.numQubits + ", 'q')\n";
			for (cregName in this.cregs) {
				qiskit +=
					identation +
					cregName +
					" = ClassicalRegister(" +
					(this.cregs[cregName].length || 1) +
					", '" +
					cregName +
					"')\n";
			}
			qiskit += "\n";

			qiskit += identation + "qc.add_register(q)\n";
			for (cregName in this.cregs) {
				qiskit += identation + "qc.add_register(" + cregName + ")\n";
			}
			qiskit += "\n";
		}
	}

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			let qiskitReplacement = null;
			let qiskitEquivalent = null;
			let qiskitCondition = null;
			if (gate && gate.connector === 0) {
				qiskitCondition =
					gate.options && gate.options.condition && gate.options.condition.creg
						? gate.options.condition
						: null;

				gateDef = circuit.getGateDef(gate.name);
				if (gateDef) {
					if (gateDef.exportInfo && !isIonqNative) {
						if (gateDef.exportInfo.qiskit && gateDef.exportInfo.qiskit.replacement) {
							qiskitReplacement = gateDef.exportInfo.qiskit.replacement;
							qiskitReplacement.map(function (replacement) {
								const replacementCircuit = new QuantumCircuit();
								if (gate.options && gate.options.params) {
									const params = Object.keys(gate.options.params);
									const replacementParams = Object.keys(replacement.params);
									params.map(function (param) {
										if (replacementParams.indexOf(param) > -1) {
											replacement.params[param] = gate.options.params[param];
										}
									});
								}
								replacementCircuit.addGate(replacement.name, column, gate.wires, {
									params: replacement.params,
									condition: qiskitCondition,
								});
								const newOptions = {
									comment: "",
									decompose: false,
									versionStr: false,
									providerName: false,
									backendName: false,
									asJupyter: false,
									shots: false,
									hybrid: null,
								};
								qiskit += adjustIdentation(
									replacementCircuit.exportToQiskit(
										newOptions,
										false,
										true,
										!!exportAsGateName || insideSubmodule,
									),
									identation,
								);
							});
						} else if (
							gateDef.exportInfo.qiskit &&
							gateDef.exportInfo.qiskit.equivalent
						) {
							qiskitEquivalent = gateDef.exportInfo.qiskit.equivalent;
							qiskitEquivalent.map(function (equivalent) {
								let valueString;
								let node;
								const equivalentCircuit = new QuantumCircuit();
								const gateWires =
									equivalent.wires.length > 1
										? gate.wires
										: gate.wires[equivalent.wires[0]];
								const eqParams = {};
								if (equivalent.params) {
									const gateParams = {};
									if (gate.options && gate.options.params) {
										for (let gateParamName in gate.options.params) {
											node = math.parse(gate.options.params[gateParamName]);
											valueString = node.toString({
												handler: mathToStringHandler,
											});
											gateParams[gateParamName] = valueString;
										}
									}

									for (let eqParamName in equivalent.params) {
										node = math.parse(equivalent.params[eqParamName]);
										valueString = node.toString({
											handler: mathToStringHandler,
											replaceVars: gateParams,
										});
										eqParams[eqParamName] = valueString;
									}
								}
								equivalentCircuit.addGate(equivalent.name, column, gateWires, {
									params: eqParams,
									condition: qiskitCondition,
								});
								const newOptions = {
									comment: "",
									decompose: false,
									versionStr: false,
									providerName: false,
									backendName: false,
									asJupyter: false,
									shots: false,
									hybrid: null,
								};
								qiskit += adjustIdentation(
									equivalentCircuit.exportToQiskit(
										newOptions,
										false,
										true,
										!!exportAsGateName || insideSubmodule,
									),
									identation,
								);
							});
						}
					}
				}

				if (!qiskitReplacement && !qiskitEquivalent) {
					if (exportAsGateName || insideSubmodule || hybrid) {
						qiskit += "  ";
					}
				}

				if (!qiskitReplacement && !qiskitEquivalent) {
					let gateName = gate.name;

					const gateParams =
						gate.options && gate.options.params ? gate.options.params : {};

					// Measurement is commented out in hybrid quantum-classical circuit when running on statevector simulator
					if (
						backendName === "statevector_simulator" &&
						gateName === "measure" &&
						hybrid
					) {
						qiskit += "# ";
					}

					if (this.basicGates[gateName]) {
						qiskit += "qc.";
					}

					if (
						gateDef &&
						gateDef.exportInfo &&
						gateDef.exportInfo.qiskit &&
						gateDef.exportInfo.qiskit.name
					) {
						gateName = gateDef.exportInfo.qiskit.name;
					} else {
						gateName = gate.name;
					}

					let qcAppend = false;
					let angleInTurns = false;
					if (gateName === "ms") {
						qcAppend = true;
						angleInTurns = true;
						gateName = "MSGate";
					}

					if (gateName === "gpi" && isIonqNative) {
						qcAppend = true;
						angleInTurns = true;
						gateName = "GPIGate";
					}

					if (gateName === "gpi2" && isIonqNative) {
						qcAppend = true;
						angleInTurns = true;
						gateName = "GPI2Gate";
					}

					if (qcAppend) {
						qiskit += "append(";
					}

					qiskit += gateName + "(";

					let argCount = 0;
					if (gateParams) {
						gateDef = this.basicGates[gate.name];
						if (!gateDef) {
							gateDef = this.customGates[gate.name];

							qiskit += "qc";
							argCount++;
						}

						if (gateDef) {
							const paramDef = gateDef.params || [];
							const paramCount = paramDef.length;
							if (paramCount) {
								for (let p = 0; p < paramCount; p++) {
									if (argCount > 0) {
										qiskit += ", ";
									}
									const paramName = paramDef[p];

									// ---
									// prepend 'np' to math constants
									if (gateParams[paramName] || gateParams[paramName].toString()) {
										node = math.parse(gateParams[paramName]);
										let valueString = node.toString({
											handler: mathToStringHandler,
										});
										if (angleInTurns) {
											valueString = "(" + valueString + ") / (2*np.pi)";
										}
										qiskit += valueString;
									}
									// ---

									argCount++;
								}

								if (gateName === "cu" && !gateParams["gamma"]) {
									qiskit += ", 0";
									argCount++;
								}
							}
						}
					}

					if (qcAppend) {
						if (argCount) {
							qiskit += "), ";
						}
						qiskit += "[";

						for (w = 0; w < gate.wires.length; w++) {
							if (w > 0) {
								qiskit += ", ";
							}
							if (exportAsGateName || insideSubmodule) {
								qiskit += qubitLetter(gate.wires[w], circuit.numQubits);
							} else {
								qiskit += gate.wires[w];
							}
							argCount++;
						}

						qiskit += "]";
					} else {
						for (w = 0; w < gate.wires.length; w++) {
							if (argCount > 0) {
								qiskit += ", ";
							}
							if (exportAsGateName || insideSubmodule) {
								qiskit += qubitLetter(gate.wires[w], circuit.numQubits);
							} else {
								qiskit += "q[" + gate.wires[w] + "]";
							}
							argCount++;
						}
					}

					if (gateName === "measure" && gate.options && gate.options.creg) {
						if (argCount > 0) {
							qiskit += ", ";
						}

						qiskit += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
						argCount++;
					}

					qiskit += ")";

					if (
						gate.options &&
						gate.options.condition &&
						gate.options.condition.creg
					) {
						qiskit +=
							".c_if(" +
							gate.options.condition.creg +
							", " +
							gate.options.condition.value +
							")";
					}

					qiskit += "\n";
				}
			}
		}
	}

	if (!circuitReplacement) {
		if (exportAsGateName) {
			qiskit += "\n";
		} else {
			qiskit += "\n";

			if (needTranspile) {
				qiskit += identation + "qc = transpile(qc, backend)\n";
			}

			identation = "";
			if (hybrid) {
				identation = "  ";
			}

			if (providerName === "Aer") {
				execBlock = "";
				execBlock += identation + "job = execute(qc, backend=backend";
				if (shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if (hybrid) {
					if (backendName === "statevector_simulator") {
						qiskit += execBlock;
						qiskit += identation + "state = job_result.get_statevector(qc).data\n";
						qiskit += "\n";
					} else {
						if (costFunction.indexOf("state") >= 0) {
							qiskit += identation + "qst = StateTomography(qc)\n";
							qiskit +=
								identation + "qst_analysis = qst.run(backend).block_for_results()\n";
							qiskit +=
								identation + 'density = qst_analysis.analysis_results("state").value\n';
							qiskit += identation + "state = np.diag(density)\n";
						} else {
							qiskit += execBlock;
							qiskit += identation + "counts = Counter(job_result.get_counts(qc))\n";
							qiskit += "\n";
						}
					}

					if (!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n";
					qiskit += identation + "return cost\n";
				} else {
					qiskit += execBlock;
					qiskit += identation + "print(job_result.get_counts(qc))\n";
				}
			}

			if (providerName === "IBMQ") {
				execBlock = "";
				execBlock += identation + "job = execute(qc, backend=backend";
				if (shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if (hybrid) {
					if (costFunction.indexOf("state") >= 0) {
						qiskit += identation + "qst = StateTomography(qc)\n";
						qiskit +=
							identation + "qst_analysis = qst.run(backend).block_for_results()\n";
						qiskit +=
							identation + 'density = qst_analysis.analysis_results("state").value\n';
						qiskit += identation + "state = np.diag(density)\n";
						qiskit += "\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "counts = Counter(job_result.get_counts(qc))\n";
						qiskit += "\n";
					}

					if (!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n";
					qiskit += identation + "return cost\n";
				} else {
					qiskit += execBlock;
					qiskit += identation + "print(job_result.get_counts(qc))\n";
				}
			}

			if (providerName === "IONQ") {
				execBlock = "";
				execBlock += identation + "job = backend.run(qc";
				if (shots) {
					execBlock += ", shots=shots";
				}
				execBlock += ")\n";
				execBlock += identation + "job_result = job.result()\n";

				if (hybrid) {
					if (costFunction.indexOf("state") >= 0) {
						qiskit += identation + "qst = StateTomography(qc)\n";
						qiskit +=
							identation + "qst_analysis = qst.run(backend).block_for_results()\n";
						qiskit +=
							identation + 'density = qst_analysis.analysis_results("state").value\n';
						qiskit += identation + "state = np.diag(density)\n";
					} else {
						qiskit += execBlock;
						qiskit += identation + "counts = Counter(job.get_counts())\n";
						qiskit += "\n";
					}

					if (!costFunction.trim()) {
						costFunction = "# CALCULATE COST HERE\ncost = 0";
					}

					qiskit += adjustIdentation(costFunction, identation);

					qiskit += "\n";
					qiskit += identation + "return cost\n";
				} else {
					qiskit += execBlock;
					qiskit += identation + "print(job.get_counts())\n";
				}
			}

			if (hybrid) {
				let globalParamList = "";
				this.params.map(function (globalParamName, globalParamIndex) {
					if (globalParamIndex > 0) {
						globalParamList += ", ";
					}
					globalParamList += globalParamName;
				});

				qiskit += "\n";
				qiskit += "params = np.array([" + globalParamList + "])\n";
				qiskit += "\n";
				qiskit +=
					'minimum = minimize(objective_function, params, method="' +
					(this.options &&
					this.options.hybridOptions &&
					this.options.hybridOptions.optimizer
						? this.options.hybridOptions.optimizer
						: "Powell") +
					'", tol=tolerance)\n';
				qiskit += 'print("cost:", minimum.fun, "params:", minimum.x)\n';
			}
		}

		if (asJupyter) {
			const notebook = {
				metadata: {
					kernelspec: {
						display_name: "Python 3",
						language: "python",
						name: "python3",
					},
				},
				nbformat: 4,
				nbformat_minor: 0,
				cells: [
					{
						cell_type: "code",
						source: qiskit,
						metadata: {},
						outputs: [],
						execution_count: null,
					},
				],
			};
			return JSON.stringify(notebook);
		}
	}

	return qiskit;
};

QuantumCircuit.prototype.exportToQuEST = function (
	options,
	exportAsGateName,
	definedFunc,
) {
	let w;
	let questParams;
	let gateName;
	let i;
	let j;
	let gate;
	let questName;
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;

	const self = this;

	definedFunc = definedFunc || [];

	let circuit = null;
	const functions = ["unitary", "controlledUnitary"];

	// decompose ?
	circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let quest = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 2 && cline[0] !== "/" && cline[1] !== "/") {
				quest += "// ";
			}
			quest += cline;
			quest += "\n";
		});
	}

	for (i = 0; i < this.numQubits; i++) {
		const gates = this.gates[i];
		for (j = 0; j < gates.length; j++) {
			gate = gates[j];
			if (!gate || !this.basicGates[gate.name]) {
				continue;
			}

			if (
				this.basicGates[gate.name].exportInfo &&
				this.basicGates[gate.name].exportInfo.quest
			) {
				questName = this.basicGates[gate.name].exportInfo.quest.name;
				if (definedFunc.includes(gate.name)) {
					continue;
				}
				if (
					functions.includes(questName) ||
					this.basicGates[gate.name].exportInfo.quest.func
				) {
					definedFunc.push(gate.name);
				}
			}
		}
	}

	if (exportAsGateName) {
		quest += "Qureg " + exportAsGateName + "(Qureg qubits";

		for (i = 0; i < circuit.numQubits; i++) {
			quest += ", const int q";
			quest += i;
		}

		if (circuit.params && circuit.params.length) {
			for (i = 0; i < circuit.params.length; i++) {
				quest += ", double " + circuit.params[i];
			}
		}
		quest += ") {\n";
	} else {
		quest += '#include <math.h>\n#include "QuEST.h"\n\n';
		quest += "#ifndef M_PI\n#define M_PI 3.14159265\n#endif\n\n";

		const customQuEST = [];

		const usedGates = circuit.usedGates();
		if (!decompose) {
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						const newOptions = {
							comment: "",
							decompose: false,
						};
						customQuEST.push(
							customCircuit.exportToQuEST(newOptions, usedGateName, definedFunc),
						);
					}
				}
			});
		}

		for (i = 0; i < definedFunc.length; i++) {
			gateName = definedFunc[i];
			questName = this.basicGates[gateName].exportInfo.quest.name;
			switch (questName) {
				case "unitary":
				case "controlledUnitary":
					{
						let matrix = this.basicGates[gateName].exportInfo.quest.matrix;
						questParams = this.basicGates[gateName].exportInfo.quest.params;
						quest += "void " + gateName + "(Qureg qubits, const int q";
						if (questName === "controlledUnitary") {
							quest += "1, const int q2";
						}
						if (questParams) {
							for (j = 0; j < questParams.length; j++) {
								quest += ", double " + questParams[j];
							}
						}
						quest += ") {\n";
						quest += "    ComplexMatrix2 u;\n";
						quest +=
							"    u.r0c0 = (Complex) {.real=" +
							matrix[0][0][0] +
							", .imag= " +
							matrix[0][0][1] +
							"};\n";
						quest +=
							"    u.r0c1 = (Complex) {.real=" +
							matrix[0][1][0] +
							", .imag= " +
							matrix[0][1][1] +
							"};\n";
						quest +=
							"    u.r1c0 = (Complex) {.real=" +
							matrix[1][0][0] +
							", .imag= " +
							matrix[1][0][1] +
							"};\n";
						quest +=
							"    u.r1c1 = (Complex) {.real=" +
							matrix[1][1][0] +
							", .imag= " +
							matrix[1][1][1] +
							"};\n";
						quest += "    " + questName + "(qubits, q";
						if (questName === "controlledUnitary") {
							quest += "1, q2";
						}
						quest += ", u);\n}\n\n";
					}
					break;
				default:
					{
						quest += this.basicGates[gateName].exportInfo.quest.func + "\n\n";
					}
					break;
			}
		}

		for (i = 0; i < customQuEST.length; i++) {
			quest += customQuEST[i];
		}

		quest += "int main(int argc, char *argv[]) {\n";
		quest += "    QuESTEnv env = createQuESTEnv();\n";
		quest += "    Qureg qubits = createQureg(" + circuit.numQubits + ", env);\n";
		quest += "    int measured[" + circuit.numQubits + "];\n\n";
	}

	quest += "\n";

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.options && gate.options.condition && gate.options.condition.creg) {
					quest +=
						"if(" +
						gate.options.condition.creg +
						"==" +
						gate.options.condition.value +
						") {\n";
				}

				gateName = gate.name;
				const gateParams =
					gate.options && gate.options.params ? gate.options.params : {};
				let gateDef = this.basicGates[gateName];

				if (gateName === "measure") {
					quest +=
						"    measured[" + gate.wires[0] + "] = measure(qubits, " + gate.wires[0];
				} else if (gateDef) {
					questName = gateDef.exportInfo.quest.name;
					questParams = gateDef.exportInfo.quest.params;

					if (functions.includes(questName)) {
						quest += "    " + gateName + "(qubits";
					} else {
						quest += "    " + questName + "(qubits";
					}

					for (w = 0; w < gate.wires.length; w++) {
						if (exportAsGateName) {
							quest += ", q" + gate.wires[w];
						} else {
							quest += ", " + gate.wires[w];
						}
					}

					if (questParams) {
						switch (questName) {
							case "compactUnitary":
								{
									quest += ", " + questParams.alpha;
									quest += ", " + questParams.beta;
								}
								break;
							case "phaseShift":
							case "controlledPhaseShift":
								{
									if (questParams.theta) {
										quest += ", " + questParams.theta;
									}
								}
								break;
						}
					}
				} else {
					gateDef = this.customGates[gateName];
					quest += "    qubits = " + gateName + "(qubits";

					for (w = 0; w < gate.wires.length; w++) {
						quest += ", " + gate.wires[w];
					}
				}

				if (gateParams) {
					gateDef = this.basicGates[gateName];
					if (!gateDef) {
						gateDef = this.customGates[gateName];
					}

					if (gateDef) {
						const paramDef = gateDef.params || [];
						const paramCount = paramDef.length;

						if (paramCount) {
							for (let p = 0; p < paramCount; p++) {
								const paramName = paramDef[p];
								quest += ", " + gateParams[paramName];
							}
						}
					}
				}

				quest += ");\n";

				if (gate.options && gate.options.condition && gate.options.condition.creg) {
					quest += "}\n";
				}
			}
		}
	}

	if (exportAsGateName) {
		quest += "\n    return qubits;\n}\n\n";
	} else {
		quest += "\n    destroyQureg(qubits, env);\n";
		quest += "    destroyQuESTEnv(env);\n";
		quest += "    return 0;\n}\n";
	}

	return quest;
};

QuantumCircuit.prototype.exportToQASM = function (
	options,
	exportAsGateName,
	circuitReplacement,
	insideSubmodule,
) {
	let gateDef;
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;
	const compatibilityMode = options.compatibilityMode;

	const self = this;

	const globalParams =
		this.options && this.options.params ? this.options.params : {};

	const mathToStringHandler = function (node, options) {
		if (node.isSymbolNode) {
			let nodeName = node.name;
			if (
				options.replaceVars &&
				typeof options.replaceVars[nodeName] != "undefined"
			) {
				nodeName = options.replaceVars[nodeName];
				if (!compatibilityMode && self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if (!compatibilityMode && self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};

	let circuit = null;

	// decompose ?
	circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let qasm = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 2 && cline[0] !== "/" && cline[1] !== "/") {
				qasm += "// ";
			}
			qasm += cline;
			qasm += "\n";
		});
	}

	if (exportAsGateName) {
		qasm += "gate " + exportAsGateName;

		if (circuit.params && circuit.params.length) {
			qasm += "(";
			for (let pc = 0; pc < circuit.params.length; pc++) {
				if (pc > 0) {
					qasm += ", ";
				}
				qasm += circuit.params[pc];
			}
			qasm += ")";
		}

		for (let i = 0; i < circuit.numQubits; i++) {
			if (i === 0) {
				qasm += " ";
			}
			if (i > 0) {
				qasm += ", ";
			}
			qasm += qubitLetter(i, circuit.numQubits);
		}
		qasm += "\n{\n";
	} else {
		if (!circuitReplacement) {
			qasm += "OPENQASM 2.0;\n";
			qasm += 'include "qelib1.inc";\n';
			qasm += "qreg q[" + circuit.numQubits + "];\n";

			for (let cregName in circuit.cregs) {
				qasm +=
					"creg " + cregName + "[" + (circuit.cregs[cregName].length || 1) + "];\n";
			}

			const usedGates = circuit.usedGates();
			if (!decompose) {
				usedGates.map(function (usedGateName) {
					const basicGate = circuit.basicGates[usedGateName];
					if (!basicGate) {
						const customGate = self.customGates[usedGateName];
						if (customGate) {
							const customCircuit = new QuantumCircuit();
							customCircuit.load(customGate);
							const newOptions = {
								comment: "",
								decompose: false,
								compatibilityMode: compatibilityMode,
							};
							qasm += customCircuit.exportToQASM(
								newOptions,
								usedGateName,
								false,
								false,
							);
						}
					}
				});
			}
		}
	}

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			let qasmReplacement = null;
			let qasmEquivalent = null;

			if (gate && gate.connector === 0) {
				let qasmName = gate.name;
				if (!compatibilityMode) {
					gateDef = circuit.getGateDef(gate.name);
					if (gateDef) {
						if (gateDef.exportInfo) {
							if (gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.name) {
								qasmName = gateDef.exportInfo.qasm.name;
							} else if (
								gateDef.exportInfo.qasm &&
								gateDef.exportInfo.qasm.replacement
							) {
								qasmReplacement = gateDef.exportInfo.qasm.replacement;
								qasmReplacement.map(function (replacement) {
									const replacementCircuit = new QuantumCircuit();
									replacementCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

									if (gate.options && gate.options.params) {
										const params = Object.keys(gate.options.params);
										const replacementParams = Object.keys(replacement.params);
										params.map(function (param) {
											if (replacementParams.indexOf(param) >= 0) {
												replacement.params[param] = gate.options.params[param];
											}
										});
									}

									const replacementCondition =
										gate.options && gate.options.condition ? gate.options.condition : {};
									replacementCircuit.addGate(replacement.name, column, gate.wires, {
										params: replacement.params,
										condition: replacementCondition,
									});
									const newOptions = {
										comment: "",
										decompose: false,
										compatibilityMode: compatibilityMode,
									};
									qasm += replacementCircuit.exportToQASM(
										newOptions,
										false,
										true,
										!!exportAsGateName || insideSubmodule,
									);
								});
							} else if (
								gateDef.exportInfo.qasm &&
								gateDef.exportInfo.qasm.equivalent
							) {
								qasmEquivalent = gateDef.exportInfo.qasm.equivalent;
								qasmEquivalent.map(function (equivalent) {
									let valueString;
									let node;
									const equivalentCircuit = new QuantumCircuit();
									equivalentCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

									const gateWires =
										equivalent.wires.length > 1
											? gate.wires
											: gate.wires[equivalent.wires[0]];
									const eqParams = {};
									if (equivalent.params) {
										// ---
										// equivalent gate params can contain variable from gate params
										// ---

										// Evaluate gate's params
										const gateParams = {};
										if (gate.options && gate.options.params) {
											for (let gateParamName in gate.options.params) {
												node = math.parse(gate.options.params[gateParamName]);
												valueString = node.toString({
													handler: mathToStringHandler,
												});
												gateParams[gateParamName] = valueString;
											}
										}

										for (let eqParamName in equivalent.params) {
											node = math.parse(equivalent.params[eqParamName]);
											valueString = node.toString({
												handler: mathToStringHandler,
												replaceVars: gateParams,
											});
											eqParams[eqParamName] = valueString;
										}
									}

									const eqCondition =
										gate.options && gate.options.condition ? gate.options.condition : {};

									equivalentCircuit.addGate(equivalent.name, column, gateWires, {
										params: eqParams,
										condition: eqCondition,
									});
									const newOptions = {
										comment: "",
										decompose: false,
										compatibilityMode: compatibilityMode,
									};
									qasm += equivalentCircuit.exportToQASM(
										newOptions,
										"",
										true,
										!!exportAsGateName || insideSubmodule,
									);
								});
							}
						}
					}
				}

				if (!qasmReplacement && !qasmEquivalent) {
					if (exportAsGateName || insideSubmodule) {
						qasm += "  ";
					}

					if (
						gate.options &&
						gate.options.condition &&
						gate.options.condition.creg
					) {
						qasm +=
							"if(" +
							gate.options.condition.creg +
							"==" +
							gate.options.condition.value +
							") ";
					}
				}

				if ((!qasmReplacement && !qasmEquivalent) || compatibilityMode) {
					const gateName = gate.name;
					const gateParams =
						gate.options && gate.options.params ? gate.options.params : {};

					qasm += compatibilityMode ? gate.name : qasmName;

					if (gateParams) {
						gateDef = circuit.basicGates[gateName];
						if (!gateDef) {
							gateDef = circuit.customGates[gateName];
						}

						if (gateDef) {
							const paramDef = gateDef.params || [];
							const paramCount = paramDef.length;
							if (paramCount) {
								qasm += " (";
								for (let p = 0; p < paramCount; p++) {
									if (p > 0) {
										qasm += ", ";
									}
									const paramName = paramDef[p];

									let paramValue = gateParams[paramName];
									if (!exportAsGateName && !insideSubmodule && !compatibilityMode) {
										const node = math.parse(gateParams[paramName]);
										paramValue = node.toString({
											handler: mathToStringHandler,
										});
									}
									qasm += paramValue;
								}
								qasm += ")";
							}
						}
					}

					for (let w = 0; w < gate.wires.length; w++) {
						if (w > 0) {
							qasm += ",";
						}
						if (exportAsGateName || insideSubmodule) {
							qasm += " " + qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							qasm += " q[" + gate.wires[w] + "]";
						}
					}

					if (gateName === "measure" && gate.options && gate.options.creg) {
						qasm += " -> ";
						qasm += gate.options.creg.name + "[" + gate.options.creg.bit + "]";
					}

					qasm += ";\n";
				}
			}
		}
	}

	if (exportAsGateName) {
		qasm += "}\n\n";
	}

	return qasm;
};

QuantumCircuit.prototype.exportToPyquil = function (options, exportAsGateName) {
	let costFunction
	;
	let p;
	let firstSet;
	let bitIndex;
	let node;
	let i;
	let argCount;
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;
	const versionStr = options.versionStr;
	const lattice = options.lattice;
	const asQVM = options.asQVM;
	const asJupyter = options.asJupyter;
	let shots = options.shots;
	let hybrid = options.hybrid;

	const self = this;

	let version = parseFloat(versionStr || "2.12");
	if (isNaN(version)) {
		version = 2.1;
	}

	if (!shots) {
		shots = 1024;
	}

	if (typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	const mathToStringHandler = function (node) {
		if (node.isSymbolNode) {
			const numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if (numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			if (self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	const adjustIdentation = function (addStr, ident) {
		let str = "";

		// add user defined cost function with proper identation
		const cfLines = addStr.split("\n");
		let minIdent = -1;
		cfLines.map(function (cfLine) {
			const tmpIdent = cfLine.search(/\S/);
			if (tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if (minIdent < 0) {
			minIdent = 0;
		}

		let addIdent = "";
		if (minIdent < ident.length) {
			for (let tmp = 0; tmp < ident.length - minIdent; tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function (cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	let importGates = "";
	const defParams = [];
	let defGates = "";
	let defRun = "";
	let defArrays = "";
	let usedGates = circuit.usedGates();
	const gotMeasurement = circuit.gotMeasurement();

	const defGateNames = [];
	const defCircNames = [];
	usedGates.map(function (usedGateName) {
		let bg;
		let importName;
		let quilInfo;
		const basicGate = circuit.basicGates[usedGateName];
		if (basicGate) {
			if (basicGate.exportInfo && basicGate.exportInfo.pyquil) {
				quilInfo = basicGate.exportInfo.pyquil;
				if (quilInfo.array) {
					// defgate

					let paramList = "";
					if (quilInfo.params) {
						paramList += ", [";
						quilInfo.params.map(function (paramName, paramIndex) {
							if (paramIndex > 0) {
								paramList += ", ";
							}
							paramList += "p_" + paramName;
							const paramText = "p_" + paramName + " = Parameter('" + paramName + "')";
							if (defParams.indexOf(paramText) < 0) {
								defParams.push(paramText);
							}
						});
						paramList += "]";
					}

					defRun += "p.inst(" + quilInfo.name + "_defgate)\n";
					defArrays += quilInfo.name + "_array = np.array(" + quilInfo.array + ")\n";
					defGates +=
						quilInfo.name +
						"_defgate = DefGate('" +
						quilInfo.name +
						"', " +
						quilInfo.name +
						"_array" +
						paramList +
						")\n";
					defGates +=
						quilInfo.name + " = " + quilInfo.name + "_defgate.get_constructor()\n";

					defGateNames.push(quilInfo.name);
				} else {
					importName = "";
					if (quilInfo.replacement) {
						bg = circuit.basicGates[quilInfo.replacement.name];
						if (bg) {
							if (bg.exportInfo) {
								if (bg.exportInfo.pyquil) {
									importName = bg.exportInfo.pyquil.name;
								} else {
									if (bg.exportInfo.quil) {
										importName = bg.exportInfo.quil.name;
									}
								}
							}
						}
					} else {
						importName = quilInfo.name;
					}

					if (importName) {
						if (importGates) {
							importGates += ", ";
						}
						importGates += importName;
					}
				}
			} else {
				if (basicGate.exportInfo && basicGate.exportInfo.quil) {
					quilInfo = basicGate.exportInfo.quil;

					if (!quilInfo.defgate) {
						importName = "";
						if (quilInfo.replacement) {
							bg = circuit.basicGates[quilInfo.replacement.name];
							if (bg) {
								if (bg.exportInfo) {
									if (bg.exportInfo.pyquil) {
										importName = bg.exportInfo.pyquil.name;
									} else {
										if (bg.exportInfo.quil) {
											importName = bg.exportInfo.quil.name;
										}
									}
								}
							}
						} else {
							importName = quilInfo.name;
						}

						if (importName) {
							if (importGates) {
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
	const gotConditions = circuit.gotClassicalControl();
	if (gotConditions) {
		if (importGates) {
			importGates += ", ";
		}
		if (version < 2) {
			importGates += "FALSE, NOT, OR, AND";
		} else {
			importGates += "MOVE, NOT, IOR, AND";
		}
	}

	let importsForDefgate = "";
	if (defGates) {
		if (version < 2.12) {
			importsForDefgate =
				"from pyquil.parameters import Parameter, quil_sin, quil_cos, quil_sqrt, quil_exp, quil_cis\nfrom pyquil.quilbase import DefGate";
		} else {
			importsForDefgate =
				"from pyquil.quilatom import Parameter, quil_sin, quil_cos, quil_sqrt, quil_exp, quil_cis\nfrom pyquil.quilbase import DefGate";
		}
	}

	let pyquil = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 1 && cline[0] !== "#") {
				pyquil += "# ";
			}
			pyquil += cline;
			pyquil += "\n";
		});
	}

	let indent = "";
	if (exportAsGateName) {
		let args = "";
		argCount = 0;
		for (i = 0; i < circuit.params.length; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for (i = 0; i < circuit.numQubits; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += "q" + i;
			argCount++;
		}
		pyquil += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indent = "  ";
	} else {
		if (version < 2) {
			pyquil += "from pyquil.api import QVMConnection\n";
			pyquil += "from pyquil.quil import Program\n";
		} else {
			pyquil += "from pyquil import Program, get_qc\n";
		}

		if (importGates) {
			pyquil += "from pyquil.gates import " + importGates + "\n";
		}
		if (importsForDefgate) {
			pyquil += importsForDefgate + "\n";
		}

		pyquil += "from functools import reduce\n";

		if (hybrid) {
			pyquil += "from scipy.optimize import minimize\n";
			pyquil += "from collections import Counter\n";
		}

		pyquil += "import numpy as np\n";

		if (shots) {
			pyquil += "\n";
			pyquil += "shots = " + shots + "\n";
		}

		const globalParams =
			this.options && this.options.params ? this.options.params : {};
		if (this.params.length) {
			pyquil += "\n";
			for (i = 0; i < this.params.length; i++) {
				const globalParamName = this.params[i];

				node = math.parse(globalParams[globalParamName]);
				const globalParamValue = node.toString({
					handler: mathToStringHandler,
				});

				pyquil += globalParamName + " = " + globalParamValue + "\n";
			}
			pyquil += "\n";
		}

		if (hybrid) {
			pyquil +=
				"tolerance = " +
				(this.options &&
				this.options.hybridOptions &&
				this.options.hybridOptions.tolerance
					? this.options.hybridOptions.tolerance || "0.001"
					: "0.001") +
				"\n";
			pyquil += "\n";
		}

		if (defGates) {
			defParams.map(function (defParamItem, defIndex) {
				if (defIndex === 0) {
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

		usedGates = circuit.usedGates();
		if (!decompose) {
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						const newOptions = {
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

	if (hybrid) {
		indent += "  ";

		pyquil += "def objective_function(params):\n";
	}

	if (version >= 2 && !exportAsGateName) {
		if (asQVM || lattice) {
			pyquil += indent + "p = Program('PRAGMA INITIAL_REWIRING \"PARTIAL\"')\n\n";
		} else {
			pyquil += indent + "p = Program()\n\n";
		}

		let totalBits = circuit.cregTotalBits();
		if (gotConditions) {
			totalBits += 1;
		}
		if (totalBits) {
			pyquil +=
				indent +
				"ro = p.declare('ro', memory_type='BIT', memory_size=" +
				totalBits +
				")\n";
			pyquil += "\n";
		}
	} else {
		pyquil += indent + "p = Program()\n\n";
	}

	pyquil += defRun ? indent + defRun + "\n" : "";

	for (let column = 0; column < circuit.numCols(); column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				let gateDef = circuit.getGateDef(gate.name);
				let gateParams = (gateParams =
					gate.options && gate.options.params ? gate.options.params : {});
				let quilInfo = null;
				if (gateDef) {
					if (gateDef.exportInfo) {
						if (gateDef.exportInfo.pyquil && gateDef.exportInfo.pyquil.replacement) {
							if (gateDef.exportInfo.pyquil.replacement.params) {
								gateParams = gateDef.exportInfo.pyquil.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.pyquil.replacement.name);
						} else {
							if (gateDef.exportInfo.quil && gateDef.exportInfo.quil.replacement) {
								if (gateDef.exportInfo.quil.replacement.params) {
									gateParams = gateDef.exportInfo.quil.replacement.params;
								}
								gateDef = circuit.getGateDef(gateDef.exportInfo.quil.replacement.name);
							}
						}

						if (gateDef && gateDef.exportInfo) {
							if (gateDef.exportInfo.pyquil) {
								quilInfo = gateDef.exportInfo.pyquil;
							} else {
								if (gateDef.exportInfo.quil) {
									quilInfo = gateDef.exportInfo.quil;
								}
							}
						}
					}

					let isDefGate = false;
					let isDefCirc = false;
					if (quilInfo) {
						isDefGate = defGateNames.indexOf(quilInfo.name) >= 0;
						isDefCirc = defCircNames.indexOf(quilInfo.name) >= 0;
					} else {
						isDefGate = defGateNames.indexOf(gate.name) >= 0;
						isDefCirc = defCircNames.indexOf(gate.name) >= 0;
					}

					let insideControl = false;
					if (
						gate.options &&
						gate.options.condition &&
						gate.options.condition.creg
					) {
						// ---
						// Flow control
						// ---
						insideControl = true;
						pyquil += "\n";

						const testBit = self.cregTotalBits();
						const condition = gate.options.condition;
						const conditionValue = condition.value || 0;
						const cregBase = self.cregBase(condition.creg);

						if (conditionValue === 0) {
							const cregSize = self.cregs[condition.creg].length;
							if (version < 2) {
								pyquil += indent + "p.inst(FALSE(" + testBit + "))\n";
								for (bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									pyquil +=
										indent +
										"p.inst(OR(" +
										(bitIndex + cregBase) +
										", " +
										testBit +
										"))\n";
								}
								pyquil += indent + "p.inst(NOT(" + testBit + "))\n";
								pyquil += indent + "p.if_then(" + testBit + ", Program(";
							} else {
								pyquil += indent + "p.inst(MOVE(ro[" + testBit + "], 0))\n";
								for (bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									pyquil +=
										indent +
										"p.inst(IOR(ro[" +
										testBit +
										"], ro[" +
										(bitIndex + cregBase) +
										"]))\n";
								}
								pyquil += indent + "p.inst(NOT(ro[" + testBit + "]))\n";
								pyquil += indent + "p.if_then(ro[" + testBit + "], Program(";
							}
						} else {
							const bitStr = conditionValue.toString(2).split("").reverse();
							let bitCount = 0;
							let singleBitIndex = 0;
							bitStr.map(function (bitValue, bitIndex) {
								const bitVal = parseInt(bitValue);
								bitStr[bitIndex] = bitVal;
								if (bitVal) {
									bitCount++;
									singleBitIndex = bitIndex;
								}
							});

							if (bitCount === 1) {
								if (version < 2) {
									pyquil +=
										indent + "p.if_then(" + (singleBitIndex + cregBase) + ", Program(";
								} else {
									pyquil +=
										indent +
										"p.if_then(ro[" +
										(singleBitIndex + cregBase) +
										"], Program(";
								}
							} else {
								if (version < 2) {
									pyquil += indent + "p.inst(FALSE(" + testBit + "))\n";
									firstSet = true;
									bitStr.map(function (bitValue, bitIndex) {
										if (bitValue) {
											if (firstSet) {
												firstSet = false;
												pyquil +=
													indent +
													"p.inst(OR(" +
													(bitIndex + cregBase) +
													", " +
													testBit +
													"))\n";
											} else {
												pyquil +=
													indent +
													"p.inst(AND(" +
													(bitIndex + cregBase) +
													", " +
													testBit +
													"))\n";
											}
										}
									});
									pyquil += indent + "p.if_then(" + testBit + ", Program(";
								} else {
									pyquil += indent + "p.inst(MOVE(ro[" + testBit + "], 0))\n";
									firstSet = true;
									bitStr.map(function (bitValue, bitIndex) {
										if (bitValue) {
											if (firstSet) {
												firstSet = false;
												pyquil +=
													indent +
													"p.inst(IOR(ro[" +
													testBit +
													"], ro[" +
													(bitIndex + cregBase) +
													"]))\n";
											} else {
												pyquil +=
													indent +
													"p.inst(AND(ro[" +
													testBit +
													"], ro[" +
													(bitIndex + cregBase) +
													"]))\n";
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

					if (quilInfo) {
						pyquil += quilInfo.name;
					} else {
						pyquil += gate.name;
					}

					let gotOpenBrace = false;
					if (quilInfo && quilInfo.params && quilInfo.params.length) {
						argCount = 0;
						pyquil += "(";
						gotOpenBrace = true;
						for (p = 0; p < quilInfo.params.length; p++) {
							if (argCount > 0) {
								pyquil += ", ";
							}

							// ---
							// prepend 'np' to math constants
							if (typeof gateParams[quilInfo.params[p]] != "undefined") {
								node = math.parse(String(gateParams[quilInfo.params[p]]));
								pyquil += node.toString({ handler: mathToStringHandler });
							}
							// ---

							argCount++;
						}
						if (version < 2 || isDefGate) {
							pyquil += ")";
						} else {
							pyquil += ", ";
						}
					} else {
						if (gateDef && gateDef.params && gateDef.params.length) {
							argCount = 0;
							pyquil += "(";
							gotOpenBrace = true;
							for (p = 0; p < gateDef.params.length; p++) {
								if (argCount > 0) {
									pyquil += ", ";
								}

								// ---
								// prepend 'np' to math constants
								if (typeof gateParams[gateDef.params[p]] != "undefined") {
									node = math.parse(gateParams[gateDef.params[p]]);
									pyquil += node.toString({ handler: mathToStringHandler });
								}
								// ---

								argCount++;
							}
							if (version < 2 || isDefGate) {
								pyquil += ")";
							} else {
								pyquil += ", ";
							}
						}
					}

					if (gate.wires.length) {
						argCount = 0;
						if (version < 2 || !gotOpenBrace || isDefGate) {
							pyquil += "(";
							gotOpenBrace = true;
						}
						for (let w = 0; w < gate.wires.length; w++) {
							if (argCount > 0) {
								pyquil += ", ";
							}

							if (exportAsGateName) {
								pyquil += "q" + gate.wires[w];
							} else {
								pyquil += "" + gate.wires[w];
							}

							argCount++;
						}

						if (gate.name === "measure" && gate.options && gate.options.creg) {
							let targetBit = parseInt(gate.options.creg.bit) || 0;
							if (isNaN(targetBit)) {
								targetBit = 0;
							}

							if (argCount > 0) {
								pyquil += ", ";
							}

							if (version < 2) {
								pyquil += targetBit + self.cregBase(gate.options.creg.name);
							} else {
								pyquil +=
									"ro[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
							}

							argCount++;
						}
						pyquil += ")";
					}

					pyquil += ")";
					if (insideControl) {
						pyquil += ")\n";
					}
					pyquil += "\n";
				} else {
					// unknown gate?
					pyquil +=
						indent + '# Export to pyquil WARNING: unknown gate "' + gate.name + '".';
				}
			}
		}
	}

	if (exportAsGateName) {
		pyquil += indent + "return p\n";
		pyquil += "\n";
	} else {
		pyquil += "\n";
		if (version < 2) {
			pyquil += indent + "qvm = QVMConnection()\n";

			if (hybrid) {
				pyquil += "\n";

				pyquil += indent + "# CALCULATE COST HERE\n";

				costFunction = this.options &&
				this.options.hybridOptions &&
				this.options.hybridOptions.costFunction
					? this.options.hybridOptions.costFunction.python || ""
					: "";
				if (!costFunction.trim()) {
					costFunction = "cost = 0";
				}

				pyquil += adjustIdentation(costFunction, indent);

				pyquil += "\n";
				pyquil += indent + "return cost\n";
			} else {
				pyquil += indent + "print(qvm.run(p))\n";
			}
		} else {
			if (shots) {
				pyquil += indent + "p.wrap_in_numshots_loop(shots)\n";
				pyquil += "\n";
			}

			let latticeName = lattice;
			if (!latticeName) {
				if (version < 2.1) {
					latticeName = this.numQubits + "q-generic-qvm";
				} else {
					latticeName = this.numQubits + "q-qvm";
				}
			}

			pyquil +=
				indent +
				"qc = get_qc('" +
				latticeName +
				"'" +
				(lattice ? ", as_qvm=" + (asQVM ? "True" : "False") : "") +
				")\n";

			if (lattice) {
				pyquil += indent + "ep = qc.compile(p)\n";

				if (gotMeasurement) {
					pyquil += indent + 'results_list = qc.run(ep).readout_data.get("ro")\n';
					pyquil +=
						indent +
						'results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], ""), results_list))\n';

					if (hybrid) {
						pyquil +=
							indent +
							"counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n";
						pyquil += indent + "# CALCULATE COST HERE\n";

						costFunction = this.options &&
						this.options.hybridOptions &&
						this.options.hybridOptions.costFunction
							? this.options.hybridOptions.costFunction.python || ""
							: "";
						if (!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n";
						pyquil += indent + "return cost\n";
					} else {
						pyquil +=
							indent +
							"counts = dict(zip(results,[results.count(i) for i in results]))\n";
						pyquil += indent + "print(counts)\n";
					}
				} else {
					if (hybrid) {
						pyquil +=
							indent +
							"counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n";
						pyquil += indent + "# CALCULATE COST HERE\n";

						costFunction = this.options &&
						this.options.hybridOptions &&
						this.options.hybridOptions.costFunction
							? this.options.hybridOptions.costFunction.python || ""
							: "";
						if (!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n";
						pyquil += indent + "return cost\n";
					} else {
						pyquil += indent + 'print(qc.run(ep).readout_data.get("ro"))\n';
					}
				}
			} else {
				if (gotMeasurement) {
					pyquil += indent + 'results_list = qc.run(p).readout_data.get("ro")\n';
					pyquil +=
						indent +
						'results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], ""), results_list))\n';
					if (hybrid) {
						pyquil +=
							indent +
							"counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n";
						pyquil += indent + "# CALCULATE COST HERE\n";

						costFunction = this.options &&
						this.options.hybridOptions &&
						this.options.hybridOptions.costFunction
							? this.options.hybridOptions.costFunction.python || ""
							: "";
						if (!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n";
						pyquil += indent + "return cost\n";
					} else {
						pyquil +=
							indent +
							"counts = dict(zip(results,[results.count(i) for i in results]))\n";
						pyquil += indent + "print(counts)\n";
					}
				} else {
					pyquil += indent + 'results_list = qc.run(p).readout_data.get("ro")\n';
					pyquil +=
						indent +
						'results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1], ""), results_list))\n';
					if (hybrid) {
						pyquil +=
							indent +
							"counts = Counter(dict(zip(results,[results.count(i) for i in results])))\n";
						pyquil += "\n";
						pyquil += indent + "# CALCULATE COST HERE\n";

						costFunction = this.options &&
						this.options.hybridOptions &&
						this.options.hybridOptions.costFunction
							? this.options.hybridOptions.costFunction.python || ""
							: "";
						if (!costFunction.trim()) {
							costFunction = "cost = 0";
						}

						pyquil += adjustIdentation(costFunction, indent);

						pyquil += "\n";
						pyquil += indent + "return cost\n";
					} else {
						pyquil += indent + "print(results)\n";
					}
				}
			}
		}

		if (hybrid) {
			let globalParamList = "";
			this.params.map(function (globalParamName, globalParamIndex) {
				if (globalParamIndex > 0) {
					globalParamList += ", ";
				}
				globalParamList += globalParamName;
			});

			pyquil += "\n";
			pyquil += "params = np.array([" + globalParamList + "])\n";
			pyquil += "\n";
			pyquil +=
				'minimum = minimize(objective_function, params, method="' +
				(this.options &&
				this.options.hybridOptions &&
				this.options.hybridOptions.optimizer
					? this.options.hybridOptions.optimizer
					: "Powell") +
				'", tol=tolerance)\n';
			pyquil += 'print("cost:", minimum.fun, "params:", minimum.x)\n';
		}
	}

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: pyquil,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return pyquil;
};

QuantumCircuit.prototype.exportToQuil = function (options, exportAsGateName) {
	const mathToStringHandler = function (node) {
		if (node.isSymbolNode && circuit.params.indexOf(node.name) >= 0) {
			return "%" + node.name;
		}
	};
	let p;
	let firstSet;
	let bitIndex;
	let node;
	let i;
	options = options || {};

	const comment = options.comment;

	// QUIL Submodules not supported
	const decompose = true; // options.decompose;
	const versionStr = options.versionStr;

	const self = this;

	let version = parseFloat(versionStr || "2.0");
	if (isNaN(version)) {
		version = 2.0;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let quil = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 1 && cline[0] !== "#") {
				quil += "# ";
			}
			quil += cline;
			quil += "\n";
		});
	}

	let usedGates = circuit.usedGates();
	usedGates.map(function (usedGateName) {
		const basicGate = circuit.basicGates[usedGateName];
		if (basicGate) {
			if (basicGate.exportInfo && basicGate.exportInfo.quil) {
				if (basicGate.exportInfo.quil.defgate) {
					quil += basicGate.exportInfo.quil.defgate;
					quil += "\n\n";
				}
			} else {
				// basic gate not supported by quil
				// TODO: add quil define gate code
			}
		}
	});

	const gotConditions = this.gotClassicalControl();
	let indent = "";
	if (exportAsGateName) {
		let params = "";
		if (circuit.params.length) {
			params += "(";
			for (i = 0; i < circuit.params.length; i++) {
				if (i > 0) {
					params += ", ";
				}
				params += "%" + circuit.params[i];
			}
			params += ")";
		}

		let args = "";
		for (i = 0; i < circuit.numQubits; i++) {
			if (i > 0) {
				args += " ";
			}
			args += "q" + i;
		}
		quil +=
			"DEFCIRCUIT " +
			exportAsGateName +
			(params ? " " + params : "") +
			(args ? " " + args : "") +
			":\n";
		indent = "    ";
	} else {
		quil += "\n";

		if (version >= 2) {
			let totalBits = circuit.cregTotalBits();
			if (gotConditions) {
				totalBits += 1;
			}
			if (totalBits) {
				quil += "DECLARE ro BIT[" + totalBits + "]\n";
			}
		}

		const globalParams =
			this.options && this.options.params ? this.options.params : {};
		if (this.params.length) {
			quil += "\n";
			for (i = 0; i < this.params.length; i++) {
				const globalParamName = this.params[i];

				node = math.parse(globalParams[globalParamName]);

				quil += "DECLARE " + globalParamName + " REAL[1]\n";
			}
			quil += "\n";
		}

		usedGates = circuit.usedGates();
		if (!decompose) {
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						const newOptions = {
							comment: "",
							decompose: false,
						};
						quil += customCircuit.exportToQuil(newOptions, exportAsGateName);
					}
				}
			});
		}
	}


	let labelCounter = 1;
	for (let column = 0; column < circuit.numCols(); column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				let gateDef = circuit.getGateDef(gate.name);
				let gateParams =
					gate.options && gate.options.params ? gate.options.params : {};
				let quilInfo = null;
				if (gateDef) {
					if (gateDef.exportInfo) {
						if (gateDef.exportInfo.quil && gateDef.exportInfo.quil.replacement) {
							if (gateDef.exportInfo.quil.replacement.params) {
								gateParams = gateDef.exportInfo.quil.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.quil.replacement.name);
						}

						quilInfo =
							gateDef && gateDef.exportInfo && gateDef.exportInfo.quil
								? gateDef.exportInfo.quil
								: null;
					}

					let insideControl = false;
					if (
						gate.options &&
						gate.options.condition &&
						gate.options.condition.creg
					) {
						// ---
						// Flow control
						// ---
						insideControl = true;
						quil += "\n";

						const testBit = self.cregTotalBits();
						const condition = gate.options.condition;
						const conditionValue = condition.value || 0;
						const cregBase = self.cregBase(condition.creg);

						if (conditionValue === 0) {
							const cregSize = self.cregs[condition.creg].length;
							if (version < 2) {
								quil += indent + "FALSE [" + testBit + "]\n";
								for (bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									quil +=
										indent + "OR [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
								}
								quil += indent + "NOT [" + testBit + "]\n";
								quil += "JUMP-WHEN @THEN" + labelCounter + " [" + testBit + "]\n";
								quil += "JUMP @END" + (labelCounter + 1) + "\n";
								quil += "LABEL @THEN" + labelCounter + "\n";
							} else {
								quil += indent + "FALSE ro[" + testBit + "]\n";
								for (bitIndex = 0; bitIndex < cregSize; bitIndex++) {
									quil +=
										indent + "OR ro[" + (bitIndex + cregBase) + "] ro[" + testBit + "]\n";
								}
								quil += indent + "NOT ro[" + testBit + "]\n";
								quil += "JUMP-WHEN @THEN" + labelCounter + " ro[" + testBit + "]\n";
								quil += "JUMP @END" + (labelCounter + 1) + "\n";
								quil += "LABEL @THEN" + labelCounter + "\n";
							}
						} else {
							const bitStr = conditionValue.toString(2).split("").reverse();
							let bitCount = 0;
							let singleBitIndex = 0;
							bitStr.map(function (bitValue, bitIndex) {
								const bitVal = parseInt(bitValue);
								bitStr[bitIndex] = bitVal;
								if (bitVal) {
									bitCount++;
									singleBitIndex = bitIndex;
								}
							});

							if (bitCount === 1) {
								if (version < 2) {
									quil +=
										"JUMP-WHEN @THEN" +
										labelCounter +
										" [" +
										(singleBitIndex + cregBase) +
										"]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								} else {
									quil +=
										"JUMP-WHEN @THEN" +
										labelCounter +
										" ro[" +
										(singleBitIndex + cregBase) +
										"]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								}
							} else {
								if (version < 2) {
									quil += indent + "FALSE [" + testBit + "]\n";
									firstSet = true;
									bitStr.map(function (bitValue, bitIndex) {
										if (bitValue) {
											if (firstSet) {
												firstSet = false;
												quil +=
													indent + "OR [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
											} else {
												quil +=
													indent + "AND [" + (bitIndex + cregBase) + "] [" + testBit + "]\n";
											}
										}
									});
									quil += "JUMP-WHEN @THEN" + labelCounter + " [" + testBit + "]\n";
									quil += "JUMP @END" + (labelCounter + 1) + "\n";
									quil += "LABEL @THEN" + labelCounter + "\n";
								} else {
									quil += indent + "FALSE ro[" + testBit + "]\n";
									firstSet = true;
									bitStr.map(function (bitValue, bitIndex) {
										if (bitValue) {
											if (firstSet) {
												firstSet = false;
												quil +=
													indent +
													"OR ro[" +
													(bitIndex + cregBase) +
													"] ro[" +
													testBit +
													"]\n";
											} else {
												quil +=
													indent +
													"AND ro[" +
													(bitIndex + cregBase) +
													"] ro[" +
													testBit +
													"]\n";
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

					if (quilInfo) {
						quil += indent + quilInfo.name;
					} else {
						quil += indent + gate.name;
					}

					quil += " ";
					let argCount = 0;
					if (quilInfo && quilInfo.params && quilInfo.params.length) {
						quil += "(";
						for (p = 0; p < quilInfo.params.length; p++) {
							if (argCount > 0) {
								quil += ", ";
							}

							// ---
							// prepend '%' to global params
							if (typeof gateParams[quilInfo.params[p]] != "undefined") {
								node = math.parse(String(gateParams[quilInfo.params[p]]));
								quil += node.toString({ handler: mathToStringHandler });
							}
							// ---

							argCount++;
						}
						quil += ")";
					} else {
						if (gateDef && gateDef.params && gateDef.params.length) {
							quil += "(";
							for (p = 0; p < gateDef.params.length; p++) {
								if (argCount > 0) {
									quil += ", ";
								}

								// ---
								// prepend '%' to global params
								if (typeof gateParams[gateDef.params[p]] != "undefined") {
									node = math.parse(gateParams[gateDef.params[p]]);
									quil += node.toString({ handler: mathToStringHandler });
								}
								// ---

								argCount++;
							}
							quil += ")";
						}
					}

					for (let w = 0; w < gate.wires.length; w++) {
						if (argCount > 0) {
							quil += " ";
						}

						if (exportAsGateName) {
							quil += "q" + gate.wires[w];
						} else {
							quil += "" + gate.wires[w];
						}

						argCount++;
					}

					if (gate.name === "measure" && gate.options && gate.options.creg) {
						let targetBit = parseInt(gate.options.creg.bit) || 0;
						if (isNaN(targetBit)) {
							targetBit = 0;
						}

						if (argCount > 0) {
							quil += " ";
						}

						if (version < 2) {
							quil += "[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
						} else {
							quil +=
								"ro[" + (targetBit + self.cregBase(gate.options.creg.name)) + "]";
						}

						argCount++;
					}

					quil += "\n";

					if (insideControl) {
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

	if (exportAsGateName) {
		quil += "\n";
	}

	return quil;
};

QuantumCircuit.prototype.exportToAQASM = function (
	options,
	isExportPyAQASM,
	exportAsGateName,
	indentDepth,
) {
	let submoduleCount;
	const globalParams =
		this.options && this.options.params ? this.options.params : {};
	let i;
	let args;
	let argCount;
	let column;
	let wire;
	let gate;
	const self = this;

	options = options || {};

	const decompose = options.decompose;
	const asJupyter = options.asJupyter;
	let shots, hybrid, circuit, tempCircuit;
	shots = options.shots;
	hybrid = !!isExportPyAQASM ? options.hybrid : false;
	circuit = null;
	shots = shots || 1024;

	if (typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	const obj = this.save(!!decompose);

	circuit = new QuantumCircuit();
	tempCircuit = new QuantumCircuit();
	circuit.load(obj);
	tempCircuit.load(obj);

	const mathToStringHandler = function (node, options) {
		if (node.isSymbolNode) {
			const numpys = ["pi"];
			if (numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			let nodeName = node.name;
			if (
				options.replaceVars &&
				typeof options.replaceVars[nodeName] != "undefined"
			) {
				nodeName = options.replaceVars[nodeName];
				if (self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if (self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};

	const adjustIdentation = function (addStr, ident) {
		let str = "";

		// add user defined cost function with proper identation
		const cfLines = addStr.split("\n");
		let minIdent = -1;
		cfLines.map(function (cfLine) {
			const tmpIdent = cfLine.search(/\S/);
			if (tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if (minIdent < 0) {
			minIdent = 0;
		}

		let addIdent = "";
		if (minIdent < ident.length) {
			for (let tmp = 0; tmp < ident.length - minIdent; tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function (cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	const getIndent = function (depth) {
		let indent = "";
		for (let i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	};

	indentDepth = indentDepth || 0;

	const gatesToBeAdded = [];
	if (!isExportPyAQASM) {
		if (!decompose) {
			const numCols = tempCircuit.numCols();
			for (column = numCols - 1; column >= 0; column--) {
				for (wire = 0; wire < tempCircuit.numQubits; wire++) {
					gate = tempCircuit.gates[wire][column];
					if (gate && gate.connector === 0 && !tempCircuit.basicGates[gate.name]) {
						let customDecomposedCircuit = tempCircuit.decomposeGateAt(column, wire);
						for (
							let decomposedColumn = 0;
							decomposedColumn < customDecomposedCircuit.numCols();
							decomposedColumn++
						) {
							for (
								let decomposedWire = 0;
								decomposedWire < customDecomposedCircuit.numQubits;
								decomposedWire++
							) {
								const gateInCustomCircuit = customDecomposedCircuit.getGateAt(
									decomposedColumn,
									decomposedWire,
								);

								if (gateInCustomCircuit && gateInCustomCircuit.connector === 0) {
									gatesToBeAdded.push(gateInCustomCircuit);
								}

								circuit.gates.map(function (circuitGate) {
									circuitGate.map(function (gateToRemove) {
										if (gateToRemove && gateToRemove.name === gate.name) {
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
		gatesToBeAdded.map(function (gateToAdd) {
			if (gateToAdd) {
				circuit.insertGate(
					gateToAdd.name,
					gateToAdd.column,
					gateToAdd.wires,
					gateToAdd.options,
				);
			}
		});
	}

	let aqasm = "";
	let indent = getIndent(indentDepth);
	const usedGates = circuit.usedGates();
	const numQubits = circuit.numQubits;

	if (!isExportPyAQASM) {
		aqasm += indent + "BEGIN\n";
		aqasm += indent + "qubits " + numQubits + "\n";

		if (circuit.cregs) {
			let cregLength = 0;
			for (let creg in circuit.cregs) {
				cregLength += circuit.cregs[creg].length;
			}
			aqasm += indent + "cbits " + cregLength + "\n";
		}
	} else {
		if (exportAsGateName) {
			args = "";
			argCount = 0;
			for (i = 0; i < circuit.params.length; i++) {
				if (argCount > 0) {
					args += ", ";
				}
				args += circuit.params[i];
				argCount++;
			}
			for (i = 0; i < circuit.numQubits; i++) {
				if (argCount > 0) {
					args += ", ";
				}
				args += qubitLetter(i, circuit.numQubits);
				argCount++;
			}
		} else {
			aqasm += indent + "from qat.lang.AQASM import *\n";
			aqasm += indent + "from qat.qpus import get_default_qpu\n";
			aqasm += indent + "from collections import Counter\n";

			if (hybrid) {
				aqasm += indent + "from scipy.optimize import minimize\n";
			}

			aqasm += indent + "import numpy as np\n";

			aqasm += "\n";

			let unsupportedGateDefinition = "";
			submoduleCount = 0;
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (basicGate) {
					if (!decompose) {
						if (
							circuit.basicGates[usedGateName].exportInfo.aqasm &&
							circuit.basicGates[usedGateName].exportInfo.aqasm.array
						) {
							let unsupportedAqasmInfo = circuit.basicGates[usedGateName].exportInfo.aqasm;

							let gateUnitary = usedGateName + "_gate";
							aqasm += indent + "def " + gateUnitary + "(";

							if (unsupportedAqasmInfo.params && unsupportedAqasmInfo.params.length) {
								let argCount = 0;
								unsupportedAqasmInfo.params.map(function (paramName) {
									if (argCount > 0) {
										aqasm += ", ";
									}
									aqasm += indent + "p_" + paramName;
									argCount++;
								});
							}

							aqasm += "):\n";
							aqasm +=
								getIndent(indentDepth + 1) +
								"return np.array(" +
								unsupportedAqasmInfo.array +
								")\n\n";

							unsupportedGateDefinition +=
								usedGateName + ' = AbstractGate("' + usedGateName + '", [';

							let count = 0;

							if (unsupportedAqasmInfo.params) {
								for (let i = 0; i < unsupportedAqasmInfo.params.length; i++) {
									if (count > 0) {
										unsupportedGateDefinition += ", ";
									}
									unsupportedGateDefinition += "float";
									count++;
								}
							}

							unsupportedGateDefinition +=
								"], matrix_generator=" + gateUnitary + ", arity=" + arity + ")\n";
						}
					}
				} else {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);

						const newOptions = {
							comment: "",
							decompose: true,
							asJupyter: false,
							shots: null,
							hybrid: false,
						};

						aqasm += customCircuit.exportToAQASM(
							newOptions,
							isExportPyAQASM,
							usedGateName,
							indentDepth,
						);
						submoduleCount++;
					}
				}
			});

			aqasm += unsupportedGateDefinition;

			aqasm += "\n";

			if (shots) {
				aqasm += indent + "shots = " + shots + "\n";
				aqasm += "\n";
			}

			aqasm += indent + "program = Program()\n";
			aqasm += indent + "qubits_reg = program.qalloc(" + circuit.numQubits + ")\n";

			for (let cregName in circuit.cregs) {
				aqasm +=
					indent +
					cregName +
					" = program.calloc(" +
					circuit.cregs[cregName].length +
					")\n";
			}

			aqasm += "\n";

			if (this.params.length) {
				for (i = 0; i < this.params.length; i++) {
					const globalParamName = this.params[i];

					const node = math.parse(globalParams[globalParamName]);
					const globalParamValue = node.toString({
						handler: mathToStringHandler,
					});

					aqasm += globalParamName + " = " + globalParamValue + "\n";
				}
				aqasm += "\n";
			}

			if (hybrid) {
				aqasm +=
					indent +
					"tolerance = " +
					(this.options &&
					this.options.hybridOptions &&
					this.options.hybridOptions.tolerance
						? this.options.hybridOptions.tolerance || "0.001"
						: "0.001") +
					"\n";
				aqasm += "\n";
			}
		}
	}

	if (exportAsGateName) {
		aqasm += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indentDepth++;
		indent = getIndent(indentDepth);
		aqasm += indent + "circuit = QRoutine()\n";
	} else {
		if (hybrid) {
			aqasm += "def objective_function(params):\n";
			indentDepth++;
			indent = getIndent(indentDepth);
		}
	}

	if (!exportAsGateName) {
		if (submoduleCount) {
			aqasm += "\n";
			usedGates.map(function (usedGateName) {
				if (
					!circuit.basicGates[usedGateName] &&
					circuit.customGates[usedGateName]
				) {
					aqasm += indent + usedGateName + "(";
				}
			});
		}
	}

	for (column = 0; column < circuit.numCols(); column++) {
		for (wire = 0; wire < circuit.numQubits; wire++) {
			gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				const gateDef = circuit.getGateDef(gate.name);
				let name = "";

				if (gate.name === "measure") {
					if (!isExportPyAQASM) {
						name += "MEAS";
					} else {
						name += "program.measure";
					}
				}

				if (gate.name === "reset") {
					if (!isExportPyAQASM) {
						name += "RESET";
					} else {
						name += "program.reset";
					}
				}

				if (gateDef && gateDef.exportInfo) {
					if (gateDef.exportInfo.aqasm) {
						const aqasmInfo = gateDef.exportInfo.aqasm;
						let aqasmInfoName = "";
						if (aqasmInfo.name) {
							if (gateDef.params.length) {
								gateDef.params.map(function (param) {
									const node = math.parse(gateParams[param]);
									const paramValue = node.toString({
										handler: mathToStringHandler,
									});
									aqasmInfoName = aqasmInfo.name;
									if (!isExportPyAQASM) {
										aqasmInfoName += "[" + paramValue + "]";
									} else {
										aqasmInfoName += "(" + paramValue + ")";
									}
								});
							} else {
								aqasmInfoName += aqasmInfo.name;
							}

							if (aqasmInfo.controlled && aqasmInfo.dagger) {
								if (!isExportPyAQASM) {
									name += "CTRL(DAG(" + aqasmInfoName + "))";
								} else {
									name += aqasmInfoName + ".dag().ctrl()";
								}
							} else if (aqasmInfo.controlled) {
								if (!isExportPyAQASM) {
									name += "CTRL(" + aqasmInfoName + ")";
								} else {
									name += aqasmInfoName + ".ctrl()";
								}
							} else if (aqasmInfo.dagger) {
								if (!isExportPyAQASM) {
									name += "DAG(" + aqasmInfoName + ")";
								} else {
									name += aqasmInfoName + ".dag()";
								}
							} else {
								name += aqasmInfoName;
							}
						} else if (aqasmInfo.matrix) {
							if (!isExportPyAQASM) {
								name = "[";
								for (let k = 0; k < aqasmInfo.matrix.length; k++) {
									let row = aqasmInfo.matrix[k];
									name += "[";
									for (i = 0; i < row.length; i++) {
										name += "(";
										let row_element = row[i];
										if (aqasmInfo.params) {
											aqasmInfo.params.map(function (paramName) {
												let gateParams = gate.options.params;
												const param = gateParams[paramName];
												if (row_element.toString().indexOf(paramName) > 0) {
													row_element = row_element.replace(paramName, param);
												}
											});
										}
										let evaluated_expression = math.evaluate(
											row_element,
											self.options.params,
										);
										let matrix_element = math.complex(evaluated_expression);
										let matrix_element_real = matrix_element["re"];
										let matrix_element_im = matrix_element["im"];
										name += matrix_element_real + ", " + matrix_element_im + ")";
										if (i < row.length - 1) {
											name += " ";
										}
									}
									name += "]";
									if (k < aqasmInfo.matrix.length - 1) {
										name += " ";
									}
								}
								name += "]";
							} else {
								name += gate.name + "(";
								let paramCount = 0;
								gateDef.params.map(function (paramName) {
									if (paramCount > 0) {
										name += ", ";
									}
									const node = math.parse(gateParams[paramName]);
									const paramValue = node.toString({
										handler: mathToStringHandler,
									});
									name += paramValue;
									paramCount++;
								});

								name += ")";
							}
						}
					}

					aqasm += indent + name;

					if (!isExportPyAQASM) {
						aqasm += " ";
					} else {
						aqasm += "(";
					}
				}

				argCount = 0;
				for (let w = 0; w < gate.wires.length; w++) {
					if (argCount > 0) {
						aqasm += ", ";
					}

					if (!isExportPyAQASM) {
						aqasm += "q[" + gate.wires[w] + "]";
					} else {
						if (exportAsGateName) {
							aqasm += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							aqasm += "qubits_reg[" + gate.wires[w] + "]";
						}
					}

					argCount = argCount + 1;
				}

				if (gate.options && gate.options.creg) {
					aqasm += ", " + gate.options.creg.name + "[" + gate.options.creg.bit + "]";
				}

				if (isExportPyAQASM) {
					aqasm += ")";
				}

				aqasm += "\n";
			}
		}
	}

	if (exportAsGateName) {
		aqasm += indent + "return circuit\n\n";
	}

	if (!isExportPyAQASM) {
		aqasm += "END";
	} else {
		if (!exportAsGateName) {
			aqasm += indent + "\n";
			aqasm += indent + "circuit = program.to_circ()\n";
			aqasm +=
				indent + "job = circuit.to_job(nbshots=shots, aggregate_data=False)\n";
			aqasm += indent + "qpu = get_default_qpu()\n";
			aqasm += indent + "job_result = qpu.submit(job)\n";
			aqasm += indent + "counts = Counter()\n\n";
			aqasm += indent + "for state in job_result:\n";
			aqasm += indent + "    string_state = str(state.state)\n";
			aqasm +=
				indent +
				"    string_state = string_state[string_state.find('|') + 1: string_state.find('>')]\n";
			aqasm += indent + "    string_state = string_state[::-1]\n";
			aqasm += indent + "    counts[string_state] += 1\n\n";

			if (hybrid) {
				aqasm += indent + "# CALCULATE COST HERE\n";

				let costFunction =
					this.options &&
					this.options.hybridOptions &&
					this.options.hybridOptions.costFunction
						? this.options.hybridOptions.costFunction.python || ""
						: "";
				if (!costFunction.trim()) {
					costFunction = "cost = 0";
				}

				aqasm += adjustIdentation(costFunction, indent);

				aqasm += "\n";
				aqasm += indent + "return cost\n";

				indentDepth--;
				indent = getIndent(indentDepth);
				if (hybrid) {
					let globalParamList = "";
					this.params.map(function (globalParamName, globalParamIndex) {
						if (globalParamIndex > 0) {
							globalParamList += ", ";
						}
						globalParamList += globalParamName;
					});

					aqasm += "\n";
					aqasm += "params = np.array([" + globalParamList + "])\n";
					aqasm += "\n";
					aqasm +=
						'minimum = minimize(objective_function, params, method="' +
						(this.options &&
						this.options.hybridOptions &&
						this.options.hybridOptions.optimizer
							? this.options.hybridOptions.optimizer
							: "Powell") +
						'", tol=tolerance)\n';
					aqasm += 'print("cost:", minimum.fun, "params:", minimum.x)\n';
				}
			} else {
				aqasm += indent + "print(counts)";
			}
		}
	}

	if (asJupyter && isExportPyAQASM) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: aqasm,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return aqasm;
};

QuantumCircuit.prototype.exportAQASM = function (
	comment,
	decompose,
	isExportPyAQASM,
	exportAsGateName,
	asJupyter,
	shots,
	hybrid,
	indentDepth,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
	};

	return this.exportToAQASM(
		options,
		isExportPyAQASM,
		exportAsGateName,
		indentDepth,
	);
};

QuantumCircuit.prototype.exportToPyAQASM = function (
	options,
	exportAsGateName,
) {
	return this.exportToAQASM(options, true, exportAsGateName);
};

QuantumCircuit.prototype.exportPyAQASM = function (
	comment,
	decompose,
	exportAsGateName,
	asJupyter,
	shots,
	hybrid,
) {
	const options = {
		comment: comment,
		decompose: decompose,
		asJupyter: asJupyter,
		shots: shots,
		hybrid: hybrid,
	};
	return this.exportToPyAQASM(options, exportAsGateName);
};

QuantumCircuit.prototype.exportToCirq = function (options, exportAsGateName) {
	let node;
	let i;
	let argCount;
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;
	const versionStr = options.versionStr;
	const asJupyter = options.asJupyter;
	let shots = options.shots;
	const exportTfq = options.exportTfq;

	const self = this;

	let platform = "";
	if (exportTfq) {
		platform = "TFQ";
	} else {
		platform = "cirq";
	}

	let version = parseFloat(versionStr || "0.7");
	if (isNaN(version)) {
		version = 0.7;
	}

	if (typeof shots == "undefined") {
		shots = 1024;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let cirq = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		comm.map(function (cline) {
			if (cline.length >= 1 && cline[0] !== "#") {
				cirq += "# ";
			}
			cirq += cline;
			cirq += "\n";
		});
	}
	let indent;

	const mathToStringHandler = function (node) {
		if (node.isSymbolNode) {
			const numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if (numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}
		}
	};

	if (exportAsGateName) {
		let args = "";
		argCount = 0;
		for (i = 0; i < circuit.params.length; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for (i = 0; i < circuit.numQubits; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits);
			argCount++;
		}
		cirq += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		cirq += "    return [\n";
		indent = "        ";
	} else {
		if (exportTfq) {
			cirq += "import tensorflow_quantum as tfq\n";
		}

		cirq += "import cirq\n";
		cirq += "import numpy as np\n";
		cirq += "from functools import reduce\n";
		cirq += "\n";

		const globalParams =
			this.options && this.options.params ? this.options.params : {};
		if (this.params.length) {
			for (i = 0; i < this.params.length; i++) {
				const globalParamName = this.params[i];

				node = math.parse(globalParams[globalParamName]);
				const globalParamValue = node.toString({
					handler: mathToStringHandler,
				});

				cirq += globalParamName + " = " + globalParamValue + "\n";
			}
			cirq += "\n";
		}

		let usedGates = circuit.usedGates();
		if (!decompose) {
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						const newOptions = {
							comment: "",
							decompose: true,
							versionStr: versionStr,
						};
						cirq += customCircuit.exportToCirq(newOptions, exportAsGateName);
					}
				}
			});
		}

		let defGates = "";
		usedGates = circuit.usedGates();
		usedGates.map(function (usedGateName) {
			const basicGate = circuit.basicGates[usedGateName];
			if (basicGate) {
				if (basicGate.exportInfo && basicGate.exportInfo.cirq) {
					let cirqInfo = basicGate.exportInfo.cirq;
					let isReplaced = false;
					if (cirqInfo.replacement) {
						const replacementGateDef = circuit.getGateDef(cirqInfo.replacement.name);
						cirqInfo = replacementGateDef.exportInfo.cirq;
						isReplaced = true;
					}
					if (cirqInfo.array) {
						if (!exportTfq) {
							// defgate
							const defName = isReplaced ? cirqInfo.name : usedGateName;
							if (defGates.indexOf(defName) < 0) {
								defGates += "def " + defName + "(";
								if (cirqInfo.params) {
									cirqInfo.params.map(function (paramName, paramIndex) {
										if (paramIndex > 0) {
											defGates += ", ";
										}
										defGates += "p_" + paramName;
									});
								}
								defGates += "):\n";
								if (basicGate.matrix && basicGate.matrix.length) {
									if (version < 0.7) {
										switch (basicGate.matrix.length) {
											case 2:
												defGates +=
													"    return cirq.SingleQubitMatrixGate(np.array(" +
													cirqInfo.array +
													"))\n";
												break;
											case 4:
												defGates +=
													"    return cirq.TwoQubitMatrixGate(np.array(" +
													cirqInfo.array +
													"))\n";
												break;
											default:
												defGates +=
													"    # Export to " +
													platform +
													" WARNING: Cannot define " +
													basicGate.matrix.length +
													" x " +
													basicGate.matrix.length +
													" matrix gate\n";
										}
									} else {
										defGates +=
											"    return cirq.MatrixGate(np.array(" + cirqInfo.array + "))\n";
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

		if (exportTfq) {
			cirq += "q = cirq.GridQubit.rect(1, " + circuit.numQubits + ")\n";
		} else {
			cirq +=
				"q = [cirq.NamedQubit('q' + str(i)) for i in range(" +
				circuit.numQubits +
				")]\n";
		}

		cirq += "\n";

		if (version < 0.7) {
			cirq += "circuit = cirq.Circuit.from_ops(\n";
		} else {
			cirq += "circuit = cirq.Circuit(\n";
		}
		indent = "    ";
	}

	const numCols = circuit.numCols();
	let gateCounter = 0;
	let multishotKeys = "";
	let noTfqSupport = false;
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gateCounter > 0) {
					cirq += ",";
					if (exportTfq && noTfqSupport) {
						cirq +=
							indent +
							"# Export to TFQ WARNING: Gate not yet supported by Tensorflow Quantum";
					}
					cirq += "\n";
				}
				let gateDef = circuit.getGateDef(gate.name);
				let gateParams =
					gate.options && gate.options.params ? gate.options.params : {};
				let cirqInfo = null;
				let isControlledGate = false;
				const isBasicGate = !!circuit.basicGates[gate.name];
				if (gateDef) {
					if (gateDef.exportInfo) {
						noTfqSupport = !!gateDef.exportInfo.cirq.notTfqSupported;
						if (gateDef.exportInfo.cirq && gateDef.exportInfo.cirq.replacement) {
							if (gateDef.exportInfo.cirq.replacement.params) {
								gateParams = gateDef.exportInfo.cirq.replacement.params;
							}
							isControlledGate =
								gateDef.exportInfo.cirq.replacement.type &&
								gateDef.exportInfo.cirq.replacement.type === "controlled";
							noTfqSupport = !!gateDef.exportInfo.cirq.replacement.notTfqSupported;
							gateDef = circuit.getGateDef(gateDef.exportInfo.cirq.replacement.name);
						}
						cirqInfo =
							gateDef && gateDef.exportInfo && gateDef.exportInfo.cirq
								? gateDef.exportInfo.cirq
								: null;
					}

					gateCounter++;

					if (
						gate.options &&
						gate.options.condition &&
						gate.options.condition.creg
					) {
						cirq +=
							indent +
							"# Export to " +
							platform +
							" WARNING: classical control not implemented yet.\n";
					}

					let tmpParamCount = 0;
					let paramString = "";

					if (gateParams) {
						let paramDef = gateDef.params || [];
						if (gate.name === "yy") {
							paramDef = [];
						}
						const paramCount = paramDef.length;
						if (paramCount) {
							for (let p = 0; p < paramCount; p++) {
								if (tmpParamCount === 0) {
									paramString += "(";
								}
								if (tmpParamCount > 0) {
									paramString += ", ";
								}
								const paramName = paramDef[p];
								// ---
								// prepend 'np' to math constants
								if (gateParams[paramName]) {
									node = math.parse(gateParams[paramName]);
									if (!node.args) {
										for (let param in gate.options.params) {
											node = math.parse(gate.options.params[param]);
										}
									}
									paramString += node.toString({
										handler: mathToStringHandler,
									});
								}
								// ---
								if (tmpParamCount === paramCount - 1) {
									if (isBasicGate) {
										paramString += ")";
									} else {
										paramString += ", ";
									}
								}
								tmpParamCount++;
							}
						}
					}

					if (cirqInfo) {
						const addBraces = cirqInfo.name.indexOf("**") >= 0;

						cirq += indent;

						if (addBraces) {
							cirq += "(";
						}

						if (!cirqInfo.array) {
							cirq += "cirq.";
						}

						if (
							exportTfq &&
							cirqInfo.tfqReplacement &&
							cirqInfo.tfqReplacement.name
						) {
							cirq += "cirq." + cirqInfo.tfqReplacement.name;
						} else {
							cirq += cirqInfo.name;
						}

						if (addBraces) {
							cirq += ")";
						}
					} else {
						cirq += indent + gate.name;
					}

					cirq += paramString;

					if (isControlledGate) {
						cirq += ".controlled().on(";
					} else {
						if (isBasicGate) {
							cirq += "(";
						}
					}

					argCount = 0;
					for (let w = 0; w < gate.wires.length; w++) {
						if (argCount > 0) {
							cirq += ", ";
						}
						if (exportAsGateName) {
							cirq += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							cirq += "q[" + gate.wires[w] + "]";
						}
						argCount++;
					}

					if (gate.name === "measure" && gate.options && gate.options.creg) {
						if (argCount > 0) {
							cirq += ", key=";
						}

						cirq += "'" + gate.options.creg.name + gate.options.creg.bit + "'";

						if (column === numCols - 1 && wire === this.numQubits - 1) {
							multishotKeys +=
								"'" + gate.options.creg.name + gate.options.creg.bit + "'";
						} else {
							multishotKeys +=
								"'" + gate.options.creg.name + gate.options.creg.bit + "', ";
						}
						argCount++;
					}

					cirq += ")";
				} else {
					cirq +=
						indent +
						"# Export to " +
						platform +
						' WARNING: unknown gate "' +
						gate.name +
						'".';
				}
			}
		}
	}

	if (exportTfq && noTfqSupport) {
		cirq +=
			indent +
			"# Export to TFQ WARNING: Gate not yet supported by Tensorflow Quantu";
	}

	if (!exportAsGateName) {
		cirq += "\n)\n";
		cirq += "\n";
		if (!exportTfq) {
			cirq += "simulator = cirq.Simulator()\n";
			cirq += "result = simulator.run(circuit, repetitions=" + shots + ")\n";
			cirq +=
				"result_dict = dict(result.multi_measurement_histogram(keys=[" +
				multishotKeys +
				"]))\n";
			cirq +=
				"keys = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1]), result_dict.keys()))\n";
			cirq +=
				"counts = dict(zip(keys,[value for value in result_dict.values()]))\n";
			cirq += "print(counts)";
		}
	} else {
		cirq += "\n    ]\n";
		cirq += "\n";
	}

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: cirq,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return cirq;
};

QuantumCircuit.prototype.exportToTFQ = function (options, exportAsGateName) {
	options = options || {};

	const comment = options.comment;
	const decompose = options.decompose;
	const versionStr = options.versionStr;
	const asJupyter = options.asJupyter;
	let shots = options.shots;
	if (typeof shots == "undefined") {
		shots = 1024;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let tfq = "";

	// comment
	if (comment) {
		const comm = (comment || "").split("\n");
		let cirq;
		comm.map(function (cline) {
			if (cline.length >= 1 && cline[0] !== "#") {
				cirq += "# ";
			}
			cirq += cline;
			cirq += "\n";
		});
	}

	const newOptions = {
		comment: comment,
		decompose: decompose,
		versionStr: versionStr,
		asJupyter: false,
		shots: shots,
		exportTfq: true,
	};
	tfq += circuit.exportToCirq(newOptions, exportAsGateName);
	tfq +=
		"results_list = tfq.layers.Sample()(circuit, repetitions=" +
		shots +
		").to_list()[0]\n";
	tfq +=
		"results = list(map(lambda arr: reduce(lambda x, y: str(x) + str(y), arr[::-1]), results_list))\n";
	tfq += "counts = dict(zip(results,[results.count(i) for i in results]))\n";
	tfq += "print(counts)";

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: tfq,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return tfq;
};

QuantumCircuit.prototype.exportToQSharp = function (options, exportAsGateName) {
	let usedGates;
	let argCount;
	options = options || {};

	const decompose = options.decompose;
	const versionStr = options.versionStr;
	const asJupyter = options.asJupyter;
	const circuitName = options.circuitName;
	let indentDepth = options.indentDepth;

	const self = this;

	const mathToStringHandler = function (node) {
		// symbols
		if (node.isSymbolNode) {
			const parameterJson = { pi: "PI()" };
			if (parameterJson[node.name]) {
				return parameterJson[node.name];
			}
		}

		// constant
		if (node.isConstantNode) {
			// convert integer to float
			if (Number.isInteger(node.value)) {
				return node.value.toFixed(1);
			}
		}
	};

	const operationName = circuitName || "Circuit";

	indentDepth = indentDepth || 0;

	function getIndent(depth) {
		let indent = "";
		for (let i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	let qsharp = "";
	let indent = getIndent(indentDepth);

	if (!exportAsGateName) {
		if (!asJupyter) {
			// opening namespace
			qsharp += "namespace Quantum {\n";
			indentDepth++;
			indent = getIndent(indentDepth);
		}

		qsharp += indent + "open Microsoft.Quantum.Intrinsic;\n";
		qsharp += indent + "open Microsoft.Quantum.Canon;\n";
		qsharp += indent + "open Microsoft.Quantum.Math;\n";
		qsharp += indent + "open Microsoft.Quantum.Convert;\n";

		qsharp += "\n";

		qsharp +=
			indent + "function SetBitValue(reg: Int, bit: Int, value: Bool): Int {\n";
		qsharp += indent + "    if(value) {\n";
		qsharp += indent + "        return reg ||| (1 <<< bit);\n";
		qsharp += indent + "    } else {\n";
		qsharp += indent + "        return reg &&& ~~~(1 <<< bit);\n";
		qsharp += indent + "    }\n";
		qsharp += indent + "}\n";

		qsharp += indent + "\n";
	}

	if (exportAsGateName) {
		let i;
		let args = "";
		argCount = 0;
		for (i = 0; i < circuit.params.length; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += circuit.params[i];
			argCount++;
		}
		for (i = 0; i < circuit.numQubits; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits) + ": Qubit";
			argCount++;
		}
		qsharp +=
			indent + "operation " + exportAsGateName + (args ? "(" + args + ")" : "");
		// qsharp += "    return [\n";
		// indent = "        ";
	} else {
		usedGates = circuit.usedGates();
		if (!decompose) {
			usedGates.map(function (usedGateName) {
				const basicGate = circuit.basicGates[usedGateName];
				if (!basicGate) {
					const customGate = self.customGates[usedGateName];
					if (customGate) {
						const customCircuit = new QuantumCircuit();
						customCircuit.load(customGate);
						const newOptions = {
							comment: "",
							decompose: true,
							versionStr: versionStr,
							asJupyter: false,
							circuitName: null,
							indentDepth: indentDepth,
						};
						qsharp += customCircuit.exportToQSharp(newOptions, exportAsGateName);
					}
				}
			});
		}

		qsharp += indent + "operation " + operationName + "()";
	}

	indentDepth++;
	indent = getIndent(indentDepth);

	let cregCount = 0;
	for (let cregName in circuit.cregs) {
		cregCount++;
	}

	let cregList = "";
	if (cregCount) {
		qsharp += " : (";
		for (let cregName in circuit.cregs) {
			if (cregList) {
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
	if (cregCount) {
		for (let cregName in circuit.cregs) {
			qsharp += indent + "mutable " + cregName + " = 0;\n";
		}
	}

	let qreg_name = "qubits";

	if (!exportAsGateName) {
		qsharp += indent + "using(";
		qsharp += qreg_name + " = Qubit[" + circuit.numQubits + "]";
		qsharp += ") {\n";
		indentDepth++;
		indent = getIndent(indentDepth);
	}
	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				let gateDef = circuit.getGateDef(gate.name);

				if (!gateDef) {
					gateDef = circuit.customGates[gate.name];
				}

				let gateParams =
					gate.options && gate.options.params ? gate.options.params : {};
				let qsharpInfo = null;
				let isControlledGate = false;
				let wireIdx = 0;
				if (gateDef) {
					if (gateDef.exportInfo) {
						if (gateDef.exportInfo.qsharp && gateDef.exportInfo.qsharp.replacement) {
							if (gateDef.exportInfo.qsharp.replacement.params) {
								gateParams = gateDef.exportInfo.qsharp.replacement.params;
							}
							gateDef = circuit.getGateDef(gateDef.exportInfo.qsharp.replacement.name);
						}
						qsharpInfo =
							gateDef && gateDef.exportInfo && gateDef.exportInfo.qsharp
								? gateDef.exportInfo.qsharp
								: null;
					}

					if (
						gateDef.drawingInfo &&
						gateDef.drawingInfo.root &&
						gate.name !== "cx" &&
						gate.name !== "ccx"
					) {
						isControlledGate = true;
					}

					let tmpParamCount = 0;
					let paramString = "";
					if (gateParams) {
						const paramDef = gateDef.params || [];
						const paramCount = paramDef.length;
						if (paramCount) {
							for (let p = 0; p < paramCount; p++) {
								// if(tmpParamCount == 0) {
								// 	paramString += "(";
								// }
								if (tmpParamCount > 0) {
									paramString += ", ";
								}
								const paramName = paramDef[p];

								// ---
								// prepend 'np' to math constants
								if (gateParams[paramName]) {
									const node = math.parse(gateParams[paramName]);
									paramString += node.toString({
										handler: mathToStringHandler,
									});
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
					if (gate.name === "measure") {
						if (gate.options && gate.options.creg) {
							qsharp +=
								indent +
								"set " +
								gate.options.creg.name +
								" = SetBitValue(" +
								gate.options.creg.name +
								", " +
								gate.options.creg.bit +
								", ResultAsBool(M(";
							if (exportAsGateName) {
								qsharp += qubitLetter(gate.wires[0], circuit.numQubits) + ")));\n";
							} else {
								qsharp += qreg_name + "[" + gate.wires[0] + "])));\n";
							}
						} else {
							qsharp +=
								indent + "// Export to qsharp WARNING: missing destination register\n";
						}
					} else {
						qsharp += indent;

						if (
							gate.options &&
							gate.options.condition &&
							gate.options.condition.creg
						) {
							qsharp +=
								"if(" +
								gate.options.condition.creg +
								" == " +
								gate.options.condition.value +
								") {\n";
							indentDepth++;
							indent = getIndent(indentDepth);
							qsharp += indent;
						}

						if (qsharpInfo) {
							qsharp += qsharpInfo.name + "(";
						} else {
							qsharp += gate.name + "(";
						}

						if (isControlledGate) {
							if (exportAsGateName) {
								qsharp += "[" + qubitLetter(gate.wires[0], circuit.numQubits) + "], (";
							} else {
								qsharp += "[" + qreg_name + "[" + gate.wires[0] + "]], (";
							}
							wireIdx = 1;
						} else {
							wireIdx = 0;
						}

						if (paramString) {
							qsharp += paramString + ", ";
						}
						// else {
						// 	qsharp += paramString + "(";
						// }
						argCount = 0;
						for (let w = wireIdx; w < gate.wires.length; w++) {
							if (argCount > 0) {
								qsharp += ", ";
							}
							if (exportAsGateName) {
								qsharp += qubitLetter(gate.wires[w], circuit.numQubits);
							} else {
								qsharp += qreg_name + "[" + gate.wires[w] + "]";
							}

							argCount++;
						}

						if (isControlledGate) {
							qsharp += ")";
						}

						qsharp += ");\n";

						if (
							gate.options &&
							gate.options.condition &&
							gate.options.condition.creg
						) {
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
	if (!exportAsGateName) {
		qsharp += indent + "ResetAll(" + qreg_name + ");\n";

		indentDepth--;
		indent = getIndent(indentDepth);

		qsharp += indent + "}\n";
	}

	if (cregCount) {
		qsharp += indent + "return (" + cregList + ");\n";
	}

	indentDepth--;
	indent = getIndent(indentDepth);
	qsharp += indent + "}\n";

	if (!exportAsGateName) {
		if (!asJupyter) {
			// closing namespace
			qsharp += "}\n";
		}
	} else {
		qsharp += "\n";
	}

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Q#",
					language: "qsharp",
					name: "iqsharp",
				},
				language_info: {
					name: "",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: qsharp,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
				{
					cell_type: "code",
					source: "%simulate " + operationName,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return qsharp;
};

QuantumCircuit.prototype.exportToBraket = function (options, exportAsGateName) {
	let node;
	let i;
	options = options || {};

	const decompose = options.decompose;
	const versionStr = options.versionStr;
	const asJupyter = options.asJupyter;
	let shots = options.shots;
	let hybrid = options.hybrid;
	let indentDepth = options.indentDepth;

	const self = this;

	shots = shots || 1024;
	if (typeof hybrid == "undefined") {
		hybrid = this.options ? !!this.options.hybrid : false;
	}

	// decompose ?
	const circuit = new QuantumCircuit();
	circuit.load(this.save(decompose));

	const mathToStringHandler = function (node) {
		if (node.isSymbolNode) {
			const numpys = ["pi", "sin", "cos", "tan", "asin", "acos", "atan"];
			if (numpys.indexOf(node.name) >= 0) {
				return "np." + node.name;
			}

			if (self.params.indexOf(node.name) >= 0 && hybrid) {
				return "params[" + self.params.indexOf(node.name) + "]";
			}
		}
	};

	const adjustIdentation = function (addStr, ident) {
		let str = "";

		// add user defined cost function with proper identation
		const cfLines = addStr.split("\n");
		let minIdent = -1;
		cfLines.map(function (cfLine) {
			const tmpIdent = cfLine.search(/\S/);
			if (tmpIdent >= 0 && (minIdent < 0 || tmpIdent < minIdent)) {
				minIdent = tmpIdent;
			}
		});

		if (minIdent < 0) {
			minIdent = 0;
		}

		let addIdent = "";
		if (minIdent < ident.length) {
			for (let tmp = 0; tmp < ident.length - minIdent; tmp++) {
				addIdent += " ";
			}
		}

		cfLines.map(function (cfLine) {
			str += addIdent + cfLine + "\n";
		});

		return str;
	};

	const getIndent = function (depth) {
		let indent = "";
		for (let i = 0; i < depth; i++) {
			indent += "    ";
		}
		return indent;
	};

	indentDepth = indentDepth || 0;

	let braket = "";
	let indent = getIndent(indentDepth);

	const usedGates = circuit.usedGates();
	let isSubModule = false;
	usedGates.map(function (usedGateName) {
		if (!circuit.basicGates[usedGateName]) {
			isSubModule = true;
		}
	});

	let args = "";
	let argCount = 0;
	if (exportAsGateName) {
		for (i = 0; i < circuit.numQubits; i++) {
			if (argCount > 0) {
				args += ", ";
			}
			args += qubitLetter(i, circuit.numQubits);
			argCount++;
		}
		for (i = 0; i < circuit.params.length; i++) {
			if (argCount > 0) {
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

		if (hybrid) {
			braket += indent + "from scipy.optimize import minimize\n";
		}

		braket += "\n";

		if (shots) {
			braket += indent + "shots = " + shots + "\n";
			braket += "\n";
		}

		const globalParams =
			this.options && this.options.params ? this.options.params : {};
		if (this.params.length) {
			for (i = 0; i < this.params.length; i++) {
				const globalParamName = this.params[i];

				node = math.parse(globalParams[globalParamName]);
				const globalParamValue = node.toString({
					handler: mathToStringHandler,
				});

				braket += globalParamName + " = " + globalParamValue + "\n";
			}
			braket += "\n";
		}

		if (hybrid) {
			braket +=
				indent +
				"tolerance = " +
				(this.options &&
				this.options.hybridOptions &&
				this.options.hybridOptions.tolerance
					? this.options.hybridOptions.tolerance || "0.001"
					: "0.001") +
				"\n";
			braket += "\n";
		}
	}

	let unsupportedBraketInfo = null;
	let gateUnitary = null;
	let submoduleCount = 0;
	usedGates.map(function (usedGateName) {
		const basicGate = circuit.basicGates[usedGateName];
		if (basicGate) {
			if (!decompose) {
				if (
					circuit.basicGates[usedGateName].exportInfo.braket &&
					circuit.basicGates[usedGateName].exportInfo.braket.array
				) {
					unsupportedBraketInfo = circuit.basicGates[usedGateName].exportInfo.braket;

					if (unsupportedBraketInfo.name === "unitary") {
						gateUnitary = usedGateName + "_unitary";
						braket += indent + "def " + gateUnitary + "(";
					}

					if (unsupportedBraketInfo.params && unsupportedBraketInfo.params.length) {
						let argCount = 0;
						unsupportedBraketInfo.params.map(function (paramName) {
							if (argCount > 0) {
								braket += ", ";
							}
							braket += indent + "p_" + paramName;
							argCount++;
						});
					}

					braket += "):\n";
					braket +=
						getIndent(indentDepth + 1) +
						"return np.array(" +
						unsupportedBraketInfo.array +
						");\n\n";
				}
			}
		} else {
			const customGate = self.customGates[usedGateName];
			if (customGate) {
				const customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				braket += customCircuit.exportBraket(
					"",
					true,
					usedGateName,
					versionStr,
					false,
					null,
					false,
					indentDepth,
				);
				submoduleCount++;
			}
		}
	});

	if (exportAsGateName) {
		braket += "def " + exportAsGateName + (args ? "(" + args + ")" : "") + ":\n";
		indentDepth++;
		indent = getIndent(indentDepth);
	} else {
		if (hybrid) {
			braket += "def objective_function(params):\n";
			indentDepth++;
			indent = getIndent(indentDepth);
		}
	}

	braket += indent + "circuit = Circuit()\n";

	if (!exportAsGateName) {
		if (submoduleCount) {
			braket += "\n";
			usedGates.map(function (usedGateName) {
				if (
					!circuit.basicGates[usedGateName] &&
					circuit.customGates[usedGateName]
				) {
					braket += indent + "circuit.register_subroutine(" + usedGateName + ")\n";
				}
			});
			braket += "\n";
		}
	}

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				const gateDef = circuit.getGateDef(gate.name);
				let gateParams =
					gate.options && gate.options.params ? gate.options.params : {};
				let paramDef = gateDef.params || [];
				let braketInfo = null;

				let gateName = gate.name;
				let paramString = "";
				let isUnitary = false;

				if (gateDef) {
					if (gateDef.exportInfo && gateDef.exportInfo.braket) {
						braketInfo = gateDef.exportInfo.braket;

						if (braketInfo.params) {
							if (Array.isArray(braketInfo.params)) {
								paramDef = braketInfo.params;
							} else {
								gateParams = braketInfo.params;
								paramDef = Object.keys(gateParams);
							}
						}

						if (braketInfo.name === "unitary") {
							isUnitary = true;
						} else {
							gateName = braketInfo.name;
						}
					}
				}

				if (!braketInfo && !circuit.customGates[gate.name]) {
					braket += indent + '# Unsupported gate "' + gate.name + '".\n';
				} else {
					let tmpParamCount = 0;
					if (gateParams) {
						const paramCount = paramDef.length;
						if (paramCount) {
							for (let p = 0; p < paramCount; p++) {
								if (tmpParamCount > 0) {
									paramString += ", ";
								}
								const paramName = paramDef[p];

								// ---
								// prepend 'np' to math constants
								if (typeof gateParams[paramName] != "undefined") {
									node = math.parse(gateParams[paramName]);
									paramString += node.toString({
										handler: mathToStringHandler,
									});
								}
								tmpParamCount++;
							}
						}
					}

					braket += indent + "circuit.";

					if (isUnitary) {
						braket +=
							"unitary(matrix=" +
							gateName +
							"_unitary(" +
							paramString +
							"), targets=[";
					} else {
						braket += gateName + "(";
					}

					argCount = 0;
					for (let w = 0; w < gate.wires.length; w++) {
						if (argCount > 0) {
							braket += ", ";
						}
						if (exportAsGateName) {
							braket += qubitLetter(gate.wires[w], circuit.numQubits);
						} else {
							braket += gate.wires[w];
						}
						argCount++;
					}

					if (isUnitary) {
						braket += "]";
					} else {
						if (paramString) {
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

	if (exportAsGateName) {
		braket += indent + "return circuit";
	}

	braket += "\n\n";

	if (!exportAsGateName) {
		braket += indent + "local_sim = LocalSimulator()\n";
		braket += indent + "result = local_sim.run(circuit, shots=shots).result()\n";
		braket +=
			indent +
			'counts = Counter({ "".join(reversed(k)): v for k, v in result.measurement_counts.items() })\n';
		braket += "\n";

		if (hybrid) {
			braket += indent + "# CALCULATE COST HERE\n";

			let costFunction =
				this.options &&
				this.options.hybridOptions &&
				this.options.hybridOptions.costFunction
					? this.options.hybridOptions.costFunction.python || ""
					: "";
			if (!costFunction.trim()) {
				costFunction = "cost = 0";
			}

			braket += adjustIdentation(costFunction, indent);

			braket += "\n";
			braket += indent + "return cost\n";

			indentDepth--;
			indent = getIndent(indentDepth);
			if (hybrid) {
				let globalParamList = "";
				this.params.map(function (globalParamName, globalParamIndex) {
					if (globalParamIndex > 0) {
						globalParamList += ", ";
					}
					globalParamList += globalParamName;
				});

				braket += "\n";
				braket += "params = np.array([" + globalParamList + "])\n";
				braket += "\n";
				braket +=
					'minimum = minimize(objective_function, params, method="' +
					(this.options &&
					this.options.hybridOptions &&
					this.options.hybridOptions.optimizer
						? this.options.hybridOptions.optimizer
						: "Powell") +
					'", tol=tolerance)\n';
				braket += 'print("cost:", minimum.fun, "params:", minimum.x)\n';
			}
		} else {
			braket += indent + "print(counts)";
		}
	}

	if (asJupyter) {
		const notebook = {
			metadata: {
				kernelspec: {
					display_name: "Python 3",
					language: "python",
					name: "python3",
				},
			},
			nbformat: 4,
			nbformat_minor: 0,
			cells: [
				{
					cell_type: "code",
					source: braket,
					metadata: {},
					outputs: [],
					execution_count: null,
				},
			],
		};
		return JSON.stringify(notebook);
	}

	return braket;
};

QuantumCircuit.prototype.exportToQobj = function (options, circuitReplacement) {
	let i;
	let indexOfRegister;
	options = options || {};

	let circuitName = options.circuitName;
	let experimentName = options.experimentName;
	let numShots = options.numShots;

	const self = this;

	let globalParams = this.options && this.options.params ? this.options.params : {};
	globalParams = JSON.parse(JSON.stringify(globalParams));
	for (let globalParamName in globalParams) {
		globalParams[globalParamName] = math.evaluate(globalParams[globalParamName]);
	}

	circuitName = circuitName || "";
	experimentName = experimentName || "";
	numShots = numShots || 1;

	// ---
	// decompose circuit
	const circuit = new QuantumCircuit();
	circuit.load(this.save(true));
	// ---

	const id = this.randomString();
	let parentQobj = {
		qobj_id: "qobj_" + id,
		type: "QASM",
		schema_version: "1.0",
		experiments: [],
		header: { description: circuitName },
		config: { shots: numShots, memory_slots: 0 },
	};
	const qobj = {
		header: {
			memory_slots: 0,
			n_qubits: 0,
			qreg_sizes: [],
			qubit_labels: [],
			creg_sizes: [],
			clbit_labels: [],
			name: "circuit0",
		},
		config: { n_qubits: 0, memory_slots: 0 },
		instructions: [],
	};
	const cregNames = Object.keys(circuit.cregs);

	const mathToStringHandler = function (node, options) {
		if (node.isSymbolNode) {
			let nodeName = node.name;
			if (
				options.replaceVars &&
				typeof options.replaceVars[nodeName] != "undefined"
			) {
				nodeName = options.replaceVars[nodeName];
				if (self.params.indexOf(nodeName) >= 0) {
					return "(" + globalParams[nodeName] + ")";
				}

				return "(" + nodeName + ")";
			}

			if (self.params.indexOf(node.name) >= 0) {
				return globalParams[node.name];
			}
		}
	};

	if (!circuitReplacement) {
		if (experimentName) {
			qobj.header.description = experimentName;
		}
		for (let cregName in circuit.cregs) {
			const cregLength = circuit.cregs[cregName].length;
			parentQobj.config.memory_slots += cregLength;
			qobj.header.creg_sizes.push([cregName, cregLength]);
			for (let i = 0; i < cregLength; i++) {
				qobj.header.clbit_labels.push([cregName, i]);
			}
		}
		qobj.header.memory_slots = parentQobj.config.memory_slots;
		qobj.header.n_qubits = circuit.numQubits;
		qobj.config.memory_slots = parentQobj.config.memory_slots;
		qobj.config.n_qubits = circuit.numQubits;
		qobj.header.qreg_sizes.push(["q", circuit.numQubits]);
	}

	let registerSlots = parentQobj.config.memory_slots;

	const usedGates = circuit.usedGates();
	usedGates.map(function (usedGateName) {
		const basicGate = circuit.basicGates[usedGateName];
		if (!basicGate) {
			const customGate = self.customGates[usedGateName];
			if (customGate) {
				let customCircuit = new QuantumCircuit();
				customCircuit.load(customGate);
				const newOptions = {
					circuitName: circuitName,
					experimentName: experimentName,
					numShots: numShots,
				};
				parentQobj += customCircuit.exportToQobj(newOptions, false);
			}
		}
	});

	const numCols = circuit.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < circuit.numQubits; wire++) {
			const gate = circuit.getGateAt(column, wire);
			const qobjInstruction = { name: "", qubits: [] };
			let qobjReplacement = null;
			let qobjEquivalent = null;
			if (column === 0) {
				qobj.header.qubit_labels.push(["q", wire]);
			}

			if (gate && gate.connector === 0) {
				let gateDef = circuit.getGateDef(gate.name);
				if (gateDef) {
					if (gateDef.exportInfo) {
						if (gateDef.exportInfo.qasm && gateDef.exportInfo.qasm.replacement) {
							qobjReplacement = gateDef.exportInfo.qasm.replacement;
							qobjReplacement.map(function (replacement) {
								const replacementCircuit = new QuantumCircuit();
								replacementCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								if (gate.options && gate.options.params) {
									const params = Object.keys(gate.options.params);
									const replacementParams = Object.keys(replacement.params);
									params.map(function (param) {
										if (replacementParams.indexOf(param) > -1) {
											replacement.params[param] = gate.options.params[param];
										}
									});
								}
								const replacementCondition =
									gate.options && gate.options.condition ? gate.options.condition : {};
								replacementCircuit.addGate(replacement.name, column, gate.wires, {
									params: replacement.params,
									condition: replacementCondition,
								});
								const newOptions = {
									circuitName: "",
									experimentName: "",
									numShots: "",
								};
								qobj.instructions = qobj.instructions.concat(
									replacementCircuit.exportToQobj(newOptions, true),
								);
							});
						} else if (
							gateDef.exportInfo.qasm &&
							gateDef.exportInfo.qasm.equivalent
						) {
							qobjEquivalent = gateDef.exportInfo.qasm.equivalent;
							qobjEquivalent.map(function (equivalent) {
								let valueString;
								let node;
								const equivalentCircuit = new QuantumCircuit();
								equivalentCircuit.cregs = JSON.parse(JSON.stringify(self.cregs));

								const gateWires =
									equivalent.wires.length > 1
										? gate.wires
										: gate.wires[equivalent.wires[0]];
								const eqParams = {};
								if (equivalent.params) {
									// ---
									// equivalent gate params can contain variable from gate params
									// ---

									// Evaluate gate's params
									const gateParams = {};
									if (gate.options && gate.options.params) {
										for (let gateParamName in gate.options.params) {
											node = math.parse(gate.options.params[gateParamName]);
											valueString = node.toString({
												handler: mathToStringHandler,
											});
											gateParams[gateParamName] = valueString;
										}
									}

									for (let eqParamName in equivalent.params) {
										node = math.parse(equivalent.params[eqParamName]);
										valueString = node.toString({
											handler: mathToStringHandler,
											replaceVars: gateParams,
										});
										eqParams[eqParamName] = valueString;
									}
								}

								const eqCondition =
									gate.options && gate.options.condition ? gate.options.condition : {};

								equivalentCircuit.addGate(equivalent.name, column, gateWires, {
									params: eqParams,
									condition: eqCondition,
								});
								const newOptions = {
									circuitName: "",
									experimentName: "",
									numShots: "",
								};
								qobj.instructions = qobj.instructions.concat(
									equivalentCircuit.exportToQobj(newOptions, true),
								);
							});
						}
					}
				}

				if (!qobjReplacement && !qobjEquivalent) {
					let gateName = gate.name;
					const gateParams =
						gate.options && gate.options.params ? gate.options.params : {};
					if (this.basicGates[gateName]) {
						switch (gateName) {
							case "id":
								{
									gateName = "iden";
								}
								break;

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

						if (
							gate.options &&
							gate.options.condition &&
							gate.options.condition.creg
						) {
							const booleanInstruction = {
								name: "",
								register: registerSlots,
								relation: "==",
								mask: "",
								val: "",
							};
							const cregSize = circuit.cregs[gate.options.condition.creg].length;
							let numberOfBitsShift = 0;
							let maskValue = 0;
							let mask = "";
							let val = "";

							indexOfRegister = cregNames.indexOf(gate.options.condition.creg);
							for (i = 0; i < indexOfRegister; i++) {
								numberOfBitsShift += circuit.cregs[cregNames[i]].length;
							}

							const value =
								(gate.options.condition.value % Math.pow(2, cregSize)) *
								Math.pow(2, numberOfBitsShift);
							val = "0x" + value.toString(16).toUpperCase();

							if (numberOfBitsShift > 0) {
								let exponent = Math.pow(2, numberOfBitsShift);
								for (let bit = 0; bit < cregSize; bit++) {
									maskValue += exponent;
									exponent *= 2;
								}
								mask = "0x" + maskValue.toString(16).toUpperCase();
							} else {
								mask = "0x" + (Math.pow(2, cregSize) - 1).toString(16).toUpperCase();
							}
							booleanInstruction.name = "bfunc";
							qobjInstruction.conditional = registerSlots;
							booleanInstruction.mask = mask;
							booleanInstruction.val = val;
							qobj.instructions.push(booleanInstruction);
							registerSlots += 1;
						}

						if (gateName === "measure" && gate.options && gate.options.creg) {
							qobjInstruction.memory = [];
							qobjInstruction.register = [];
							let prevRegisterLength = 0;
							indexOfRegister = cregNames.indexOf(gate.options.creg.name);
							for (i = 0; i < indexOfRegister; i++) {
								prevRegisterLength += circuit.cregs[cregNames[i]].length;
							}
							const cregBit = prevRegisterLength + gate.options.creg.bit;
							qobjInstruction.memory.push(cregBit);
							qobjInstruction.register.push(cregBit);
						}

						if (gateParams) {
							gateDef = this.basicGates[gateName];
							if (!gateDef) {
								gateDef = this.customGates[gateName];
							}
							if (gateDef) {
								let paramDef = gateDef.params || [];
								let paramCount = paramDef.length;
								if (paramCount) {
									qobjInstruction.params = [];
									for (let p = 0; p < paramCount; p++) {
										let paramName = paramDef[p];
										if (gateParams[paramName] || gateParams[paramName].toString()) {
											const node = math.evaluate(gateParams[paramName], globalParams);
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

	if (circuitReplacement) {
		return qobj.instructions;
	}

	if (qobj.instructions.length) {
		parentQobj.experiments.push(qobj);
	}

	return parentQobj;
};

QuantumCircuit.prototype.clearPartitions = function () {
	this.partitionMap = [];
	this.partitionCount = 0;
	this.partitionInfo = {};

	const numCols = this.numCols();
	for (let wire = 0; wire < this.numQubits; wire++) {
		this.partitionMap.push([]);
		for (let column = 0; column < numCols; column++) {
			this.partitionMap[wire].push(-1);
		}
	}
};

QuantumCircuit.prototype.createPartitions = function () {
	let wr;
	let partition;
	this.clearPartitions();

	const wirePartitions = [];
	for (let i = 0; i < this.numQubits; i++) {
		wirePartitions.push(-1);
	}

	let partitionCounter = 0;
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		let wire;
		for (wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.wires) {
				let w;
				const prevPartitions = [];
				for (w = 0; w < gate.wires.length; w++) {
					wr = gate.wires[w];
					const prevPartition = wirePartitions[wr];
					if (prevPartitions.indexOf(prevPartition) < 0) {
						prevPartitions.push(prevPartition);
					}
				}
				partition = -1;
				if (prevPartitions.length !== 1 || prevPartitions[0] === -1) {
					partition = partitionCounter++;
				} else {
					partition = prevPartitions[0];
				}

				for (w = 0; w < gate.wires.length; w++) {
					wr = gate.wires[w];

					let oldPartition = wirePartitions[wr];
					if (oldPartition === -1) {
						wirePartitions[wr] = partition;
					} else {
						for (let i = 0; i < this.numQubits; i++) {
							if (wirePartitions[i] === oldPartition) {
								wirePartitions[i] = partition;
							}
						}
					}
				}
			}
		}

		for (wire = 0; wire < this.numQubits; wire++) {
			this.partitionMap[wire][column] = wirePartitions[wire];
		}
	}

	this.partitionCount = partitionCounter;

	for (partition = 0; partition < partitionCounter; partition++) {
		this.partitionInfo[partition] = this.partitionBounds(partition);
	}
};

QuantumCircuit.prototype.printPartitions = function () {
	const numCols = this.numCols();
	for (let wire = 0; wire < this.numQubits; wire++) {
		let row = "";
		for (let column = 0; column < numCols; column++) {
			let part = this.partitionMap[wire][column];
			if (part === -1) part = " ";
			if (this.getGateAt(column, wire)) {
				part = part + "*";
			} else {
				part = part + " ";
			}
			while (part.length < 4) {
				part = " " + part;
			}
			row += part;
		}
		let w = wire + "";
		while (w.length < 2) {
			w = "0" + w;
		}
		row = "q" + w + row;
		console.log(row);
	}
};

QuantumCircuit.prototype.partitionBounds = function (partitionIndex) {
	let partition;
	let wire;
	const bounds = {
		wire: {
			top: -1,
			bottom: -1,
		},
		column: {
			left: -1,
			right: -1,
		},
		wireMap: {},
		parents: {},
	};

	let found = false;
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (wire = 0; wire < this.numQubits; wire++) {
			partition = this.partitionMap[wire][column];
			if (partition === partitionIndex) {
				found = true;

				if (bounds.wire.top < 0) {
					bounds.wire.top = wire;
				}
				if (bounds.wire.bottom < wire) {
					bounds.wire.bottom = wire;
				}

				if (bounds.column.left < 0) {
					bounds.column.left = column;
				}
				if (bounds.column.right < column) {
					bounds.column.right = column;
				}
			}
		}
	}

	if (!found) {
		return null;
	}

	let partitionWire = 0;
	for (wire = bounds.wire.top; wire <= bounds.wire.bottom; wire++) {
		partition = this.partitionMap[wire][bounds.column.left];
		if (partition === partitionIndex) {
			bounds.wireMap[wire] = partitionWire;

			partitionWire++;
		}
	}
	bounds.numQubits = partitionWire;

	if (bounds.column.left > 0) {
		for (wire in bounds.wireMap) {
			const parentPartition = this.partitionMap[wire][bounds.column.left - 1];
			if (parentPartition >= 0) {
				if (!bounds.parents[parentPartition]) {
					bounds.parents[parentPartition] = {};
					bounds.parents[parentPartition].links = [];
				}
				const parentBounds = this.partitionInfo[parentPartition];
				for (let pwire in parentBounds.wireMap) {
					if (pwire === wire) {
						bounds.parents[parentPartition].links.push(bounds.wireMap[wire]);
					}
				}
			}
		}
	}

	return bounds;
};

QuantumCircuit.prototype.partitionCircuit = function (partitionIndex) {
	let combineItem;
	const bounds = this.partitionInfo[partitionIndex];
	if (!bounds) {
		return null;
	}

	const combineList = [];
	let usedWires = [];
	for (let parentPartition in bounds.parents) {
		combineItem = {};

		combineItem.circuit = this.partitionCache[parentPartition];
		combineItem.wires = [];
		combineItem.wires = bounds.parents[parentPartition].links;

		usedWires = usedWires.concat(combineItem.wires);

		combineList.push(combineItem);
	}

	const circuit = new QuantumCircuit();

	// combine state from parent partitions
	if (combineList.length > 0) {
		if (bounds.numQubits > usedWires.length) {
			combineItem = {};
			combineItem.circuit = new QuantumCircuit(
				bounds.numQubits - usedWires.length,
			);
			combineItem.wires = [];
			for (let i = 0; i < bounds.numQubits; i++) {
				if (usedWires.indexOf(i) < 0) {
					combineItem.wires.push(i);
				}
			}
			combineList.push(combineItem);
		}
		circuit.setCombinedState(combineList);
	}

	// add gates to the circuit
	for (
		let column = bounds.column.left;
		column <= bounds.column.right;
		column++
	) {
		for (let wire = bounds.wire.top; wire <= bounds.wire.bottom; wire++) {
			const partition = this.partitionMap[wire][column];
			if (partition === partitionIndex) {
				const gate = this.getGateAt(column, wire);
				if (gate && gate.connector === 0) {
					const gateWires = [];
					for (let w = 0; w < gate.wires.length; w++) {
						const wr = gate.wires[w];
						gateWires.push(bounds.wireMap[wr]);
					}
					circuit.addGate(
						gate.name,
						column - bounds.column.left,
						gateWires,
						gate.options,
					);
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
QuantumCircuit.prototype.run = function (initialValues, options) {
	let partition;
	let wire;
	options = options || {};

	this.measureResetsQubit = !!options.strictMode;

	if (!options.continue) {
		this.initState();
		this.stats.duration = 0;
	}

	if (options.initialState) {
		if (Array.isArray(options.initialState)) {
			this.state = {};
			for (let valIndex = 0; valIndex < options.initialState.length; valIndex++) {
				let val = options.initialState[valIndex];

				if (Array.isArray(val) && val.length === 2) {
					val = math.complex(val[0], val[1]);
				}

				if (typeof val == "string") {
					val = this.evalMathString(val);
				}
				if (typeof val == "number") {
					val = math.complex(val, 0);
				}
				this.state[valIndex + ""] = val;
			}
		} else {
			this.state = options.initialState;
		}

		this.stateBits = 0;
		for (let aindex in this.state) {
			this.stateBits |= parseInt(aindex);
		}
	}

	this.stats.start = new Date();

	const decomposed = new QuantumCircuit();
	decomposed.load(this.save(true));

	if (initialValues) {
		decomposed.insertColumn(0);
		for (wire = 0; wire < decomposed.numQubits; wire++) {
			if (initialValues[wire]) {
				decomposed.addGate("x", 0, wire, {});
			}
		}
	}

	const partitioning = options.partitioning;

	if (partitioning) {
		decomposed.createPartitions();
		//		decomposed.printPartitions();
	}

	const numCols = decomposed.numCols();
	let gateCounter = 0;
	for (let column = 0; column < numCols; column++) {
		for (wire = 0; wire < decomposed.numQubits; wire++) {
			const gate = decomposed.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				gateCounter++;

				let executeGate = true;
				if (gate.options && gate.options.condition && gate.options.condition.creg) {
					const cregValue = this.getCregValue(gate.options.condition.creg);
					executeGate = cregValue === gate.options.condition.value;
				}

				if (executeGate) {
					if (partitioning) {
						partition = decomposed.partitionMap[wire][column];
						if (!decomposed.partitionCache[partition]) {
							decomposed.partitionCache[partition] =
								decomposed.partitionCircuit(partition);
						}

						const pcirc = decomposed.partitionCache[partition];
						const bounds = decomposed.partitionInfo[partition];

						const pcolumn = column - bounds.column.left;

						const pgate = pcirc.getGateAt(pcolumn, bounds.wireMap[wire]);

						pcirc.cregs = JSON.parse(JSON.stringify(this.cregs));
						pcirc.applyGate(pgate.name, pcolumn, pgate.wires, pgate.options);
						this.cregs = JSON.parse(JSON.stringify(pcirc.cregs));
					} else {
						this.applyGate(gate.name, column, gate.wires, gate.options);
					}
				}

				// callback after gate is finished
				if (options && options.onGate) {
					options.onGate(column, wire, gateCounter);
				}
			}
		}
		// callback after column is finished
		if (options && options.onColumn) {
			options.onColumn(column);
		}
	}

	if (partitioning) {
		const lastPartitions = [];
		for (wire = 0; wire < decomposed.numQubits; wire++) {
			partition = decomposed.partitionMap[wire][numCols - 1];
			if (partition >= 0 && lastPartitions.indexOf(partition) < 0) {
				lastPartitions.push(partition);
			}
		}
		if (lastPartitions.length) {
			if (lastPartitions.length === 1) {
				this.state = decomposed.partitionCache[lastPartitions[0]].state;
				this.stateBits = decomposed.partitionCache[lastPartitions[0]].stateBits;
			} else {
				const startTime = this.stats.start;
				const combineList = [];
				for (let i = 0; i < lastPartitions.length; i++) {
					const lastPartition = lastPartitions[i];

					const combineItem = {};

					combineItem.circuit = decomposed.partitionCache[lastPartition];
					combineItem.wires = [];

					const lastBounds = decomposed.partitionInfo[lastPartition];
					for (wire in lastBounds.wireMap) {
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

QuantumCircuit.prototype.continue = function () {
	this.run(null, {
		continue: true,
	});
};

QuantumCircuit.prototype.stateAsArray = function (
	onlyPossible,
	skipItems,
	blockSize,
	reverseBits,
) {
	const state = [];

	const numAmplitudes = this.numAmplitudes();

	skipItems = skipItems || 0;
	blockSize =
		blockSize ||
		(onlyPossible ? this.numAmplitudes(onlyPossible) : numAmplitudes);

	let count = 0;
	for (let i = 0; i < numAmplitudes; i++) {
		let ampIndex = i;
		if (reverseBits) {
			ampIndex = reverseBitwise(i, this.numQubits);
		}

		const amplitude = math.round(this.state[ampIndex] || math.complex(0, 0), 14);

		if (!onlyPossible || amplitude.re || amplitude.im) {
			if (count >= skipItems) {
				let indexBinStr = i.toString(2);
				while (indexBinStr.length < this.numQubits) {
					indexBinStr = "0" + indexBinStr;
				}

				const amplitudeStr = this.formatComplex(amplitude, {
					fixedWidth: true,
					decimalPlaces: 8,
					iotaChar: "i",
				});
				const magnitude = math.pow(math.abs(amplitude), 2);
				const chance = magnitude * 100;
				const chanceStr = chance.toFixed(5);
				const phase = math.arg(amplitude);
				const phaseStr = phase.toFixed(5);

				state.push({
					index: i,
					indexBinStr: indexBinStr,
					amplitude: amplitude,
					amplitudeStr: amplitudeStr,
					magnitude: magnitude,
					chance: chance,
					chanceStr: chanceStr,
					phase: phase,
					phaseStr: phaseStr,
				});
			}

			count++;

			if (state.length === blockSize) {
				return state;
			}
		}
	}

	return state;
};

QuantumCircuit.prototype.stateAsSimpleArray = function (reverseBits) {
	const numAmplitudes = this.numAmplitudes();
	if (!this.state) {
		return [];
	}

	const state = [];
	for (let i = 0; i < numAmplitudes; i++) {
		let ampIndex = i;
		if (reverseBits) {
			ampIndex = reverseBitwise(i, this.numQubits);
		}

		state.push(math.round(this.state[ampIndex] || math.complex(0, 0), 14));
	}
	return state;
};

QuantumCircuit.prototype.stateAsString = function (onlyPossible) {
	const numAmplitudes = this.numAmplitudes();
	if (!this.state) {
		return "Error: circuit is not initialized. Please call initState() or run() method.";
	}

	let s = "";
	for (let i = 0; i < numAmplitudes; i++) {
		const state = math.round(this.state[i] || math.complex(0, 0), 14);
		if (!onlyPossible || state.re || state.im) {
			const m = math.pow(math.abs(state), 2) * 100;

			// binary string
			let bin = i.toString(2);
			while (bin.length < this.numQubits) {
				bin = "0" + bin;
			}

			// right aligned percent
			let perc = m.toFixed(5);
			while (perc.length < 9) {
				perc = " " + perc;
			}

			s +=
				this.formatComplex(state, {
					fixedWidth: true,
					decimalPlaces: 8,
					iotaChar: "i",
				}) +
				"|" +
				bin +
				">\t" +
				perc +
				"%\n";
		}
	}
	return s;
};

QuantumCircuit.prototype.print = function (onlyPossible) {
	console.log(this.stateAsString(onlyPossible));
};

QuantumCircuit.prototype.gotClassicalControl = function () {
	for (let column = 0; column < this.numCols(); column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.options && gate.options.condition && gate.options.condition.creg) {
					return true;
				}
			}
		}
	}
	return false;
};

QuantumCircuit.prototype.gotMeasurement = function () {
	for (let column = 0; column < this.numCols(); column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.getGateAt(column, wire);
			if (gate && gate.connector === 0) {
				if (gate.name === "measure") {
					return true;
				}
			}
		}
	}
	return false;
};

QuantumCircuit.prototype.cregCount = function () {
	let cregCount = 0;
	for (let cregName in this.cregs) {
		cregCount++;
	}
	return cregCount;
};

QuantumCircuit.prototype.getCregs = function () {
	const res = {};
	for (let creg in this.cregs) {
		res[creg] = this.getCregValue(creg);
	}
	return res;
};

QuantumCircuit.prototype.cregsAsString = function () {
	let s = "reg\tbin\tdec\n";
	for (let creg in this.cregs) {
		const value = this.getCregValue(creg);

		// binary string
		let bin = value.toString(2);
		const len = this.cregs[creg] ? this.cregs[creg].length || 1 : 1;
		while (bin.length < len) {
			bin = "0" + bin;
		}

		s += creg + "\t" + bin + "\t" + value + "\n";
	}
	return s;
};

QuantumCircuit.prototype.createCreg = function (creg, len) {
	this.cregs[creg] = [];

	// extend register
	while (this.cregs[creg].length < (len || 1)) {
		this.cregs[creg].push(0);
	}
};

QuantumCircuit.prototype.removeCreg = function (creg) {
	// remove reference to creg
	const numCols = this.numCols();
	const removeGates = [];
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.gates[wire][column];
			if (gate && gate.options) {
				// gate writing to creg
				if (
					gate.options.creg &&
					gate.options.creg.name &&
					gate.options.creg.name === creg
				) {
					if (removeGates.indexOf(gate.id) < 0) {
						removeGates.push(gate.id);
					}
				}

				// gate controlled by creg
				if (
					gate.options.condition &&
					gate.options.condition.creg &&
					gate.options.condition.creg === creg
				) {
					delete gate.options.condition;
				}
			}
		}
	}

	// delete register
	delete this.cregs[creg];

	for (let i = 0; i < removeGates.length; i++) {
		this.removeGate(removeGates[i]);
	}
};

QuantumCircuit.prototype.renameCreg = function (oldName, newName) {
	// rename reference
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.gates[wire][column];
			if (gate && gate.options) {
				// gate writing to creg
				if (
					gate.options.creg &&
					gate.options.creg.name &&
					gate.options.creg.name === oldName
				) {
					gate.options.creg.name = newName;
				}

				// gate controlled by creg
				if (
					gate.options.condition &&
					gate.options.condition.creg &&
					gate.options.condition.creg === oldName
				) {
					gate.options.condition.creg = newName;
				}
			}
		}
	}

	// rename register
	this.cregs[newName] = JSON.parse(JSON.stringify(this.cregs[oldName]));
	delete this.cregs[oldName];
};

QuantumCircuit.prototype.minCregSize = function (creg) {
	let largestBit = 0;
	const numCols = this.numCols();
	for (let column = 0; column < numCols; column++) {
		for (let wire = 0; wire < this.numQubits; wire++) {
			const gate = this.gates[wire][column];
			if (gate && gate.options) {
				// gate writing to creg
				if (
					gate.options.creg &&
					gate.options.creg.name &&
					gate.options.creg.name === creg
				) {
					let targetBit = parseInt(gate.options.creg.bit || 0);
					if (isNaN(targetBit)) {
						targetBit = 0;
					}
					if (targetBit > largestBit) {
						largestBit = targetBit;
					}
				}

				// gate controlled by creg
				if (
					gate.options.condition &&
					gate.options.condition.creg &&
					gate.options.condition.creg === creg
				) {
					const lb = Math.floor(Math.log2(gate.options.condition.value));
					if (lb > largestBit) {
						largestBit = lb;
					}
				}
			}
		}
	}

	return largestBit + 1;
};

QuantumCircuit.prototype.resizeCreg = function (creg, size) {
	if (size < this.minCregSize(creg)) {
		return;
	}

	while (this.cregs[creg].length < size) {
		this.cregs[creg].push(0);
	}

	while (this.cregs[creg].length > size) {
		this.cregs[creg].pop();
	}
};

QuantumCircuit.prototype.getCreg = function (creg) {
	return this.cregs[creg];
};

QuantumCircuit.prototype.setCregBit = function (creg, cbit, value) {
	// see if cbit is integer
	const bit = parseInt(cbit);
	if (isNaN(bit)) {
		throw (
			'Error: invalid "cbit" argument to "setCregBit" method: expected "integer" got "' +
			typeof cbit +
			'".'
		);
	}

	// create register if does not exist
	if (!this.cregs[creg]) {
		this.cregs[creg] = [];
	}

	// extend register if needed
	while (bit >= this.cregs[creg].length) {
		this.cregs[creg].push(0);
	}

	// set bit
	this.cregs[creg][bit] = value ? 1 : 0;
};

QuantumCircuit.prototype.getCregBit = function (creg, cbit) {
	if (!this.cregs[creg]) {
		throw 'Error: "getCregBit": unknown register "' + creg + '".';
	}

	const bit = parseInt(cbit);
	if (isNaN(bit) || bit >= this.cregs[creg].length) {
		throw 'Error: "getCregBit": bit "' + cbit + '" not found.';
	}
	return this.cregs[creg][bit];
};

QuantumCircuit.prototype.cregBase = function (creg) {
	if (!this.cregs[creg]) {
		throw 'Error: "getCregBit": unknown register "' + creg + '".';
	}

	let base = 0;
	for (let regName in this.cregs) {
		if (regName === creg) {
			return base;
		}
		base += this.cregs[regName].length;
	}
};

QuantumCircuit.prototype.cregTotalBits = function () {
	let bits = 0;
	for (let regName in this.cregs) {
		bits += this.cregs[regName].length;
	}
	return bits;
};

QuantumCircuit.prototype.getCregValue = function (creg) {
	if (!this.cregs[creg]) {
		throw 'Error: "getCregBit": unknown register "' + creg + '".';
	}

	const len = this.cregs[creg].length;
	let value = 0;
	for (let i = 0; i < len; i++) {
		if (this.cregs[creg][i]) {
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
QuantumCircuit.prototype.measureAll = function (force) {
	let q;
	if (this.collapsed && this.collapsed.length === this.numQubits && !force) {
		return this.collapsed;
	}

	this.collapsed = [];

	let randomWeight = Math.random();
	for (let is in this.state) {
		const state = math.round(this.state[is], 14);
		if (state.re || state.im) {
			const chance = math.round(math.pow(math.abs(state), 2), 14);
			randomWeight -= chance;
			if (randomWeight <= 0) {
				const i = parseInt(is);
				if (this.reverseBitOrder) {
					for (q = this.numQubits - 1; q >= 0; q--) {
						this.collapsed.push((1 << q) & i ? 1 : 0);
					}
				} else {
					for (q = 0; q < this.numQubits; q++) {
						this.collapsed.push((1 << q) & i ? 1 : 0);
					}
				}
				return this.collapsed;
			}
		}
	}

	// This shold never happen, but "nature is not classical" :)
	if (!this.collapsed.length) {
		while (this.collapsed.length < this.numQubits) {
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
QuantumCircuit.prototype.measureAllMultishot = function (shots) {
	shots = shots || 1;

	const counts = {};

	const randomWeights = [];
	for (let i = 0; i < shots; i++) {
		randomWeights.push(Math.random());
	}

	let shotCount = 0;
	do {
		for (let is in this.state) {
			const state = math.round(this.state[is], 14);
			if (state.re || state.im) {
				const chance = math.round(math.pow(math.abs(state), 2), 14);

				for (let sh = 0; sh < shots; sh++) {
					if (randomWeights[sh] > 0) {
						randomWeights[sh] -= chance;

						if (randomWeights[sh] <= 0) {
							let bin = parseInt(is).toString(2);
							while (bin.length < this.numQubits) {
								bin = "0" + bin;
							}

							if (counts[bin]) {
								counts[bin]++;
							} else {
								counts[bin] = 1;
							}

							shotCount++;

							if (shotCount === shots) {
								return counts;
							}
						}
					}
				}
			}
		}
	} while (shotCount < shots);
};

QuantumCircuit.prototype.measure = function (wire, creg, cbit, force) {
	if (force || !this.collapsed || this.collapsed.length !== this.numQubits) {
		this.measureAll(force);
	}

	const val = this.collapsed[wire];

	if (creg && typeof cbit != "undefined") {
		this.setCregBit(creg, cbit, val);
	}

	return val;
};

QuantumCircuit.prototype.probabilities = function () {
	let wire;
	this.prob = [];

	for (wire = 0; wire < this.numQubits; wire++) {
		this.prob.push(0);
	}

	for (let is in this.state) {
		const i = parseInt(is);

		for (wire = 0; wire < this.numQubits; wire++) {
			let bit = null;

			if (this.reverseBitOrder) {
				bit = math.pow(2, this.numQubits - 1 - wire);
			} else {
				bit = math.pow(2, wire);
			}

			if (i & bit) {
				const state = this.state[is];
				if (state.re || state.im) {
					this.prob[wire] += math.pow(math.abs(state), 2);
				}
			}
		}
	}

	for (wire = 0; wire < this.numQubits; wire++) {
		this.prob[wire] = math.round(this.prob[wire], 14);
	}

	return this.prob;
};

QuantumCircuit.prototype.probability = function (wire) {
	if (!this.prob || this.prob.length !== this.numQubits) {
		this.probabilities();
	}

	return this.prob[wire];
};

QuantumCircuit.prototype.densityMatrix = function () {
	const density = [];
	const numAmplitudes = this.numAmplitudes();
	for (let row = 0; row < numAmplitudes; row++) {
		const r = [];
		const rowVal = this.state[row] || math.complex(0, 0);
		for (let col = 0; col < numAmplitudes; col++) {
			let colVal = this.state[col] || math.complex(0, 0);
			if (colVal.re || colVal.im) {
				colVal = math.conj(colVal);
			}
			r.push(math.multiply(rowVal, colVal));
		}
		density.push(r);
	}
	return density;
};

QuantumCircuit.prototype.partialTrace = function (qubit) {
	function insertBit(input, pos, bit) {
		let out = input << 1;
		const m = (2 << pos) - 1;
		const posBit = 1 << pos;
		out = (out ^ ((out ^ input) & m)) | posBit;
		if (!bit) {
			out = out ^ posBit;
		}
		return out;
	}

	const trace = [];

	const unusedCount = this.numQubits - 1;
	const unusedLen = math.pow(2, unusedCount);

	let qpos;
	if (this.reverseBitOrder) {
		qpos = this.numQubits - 1 - qubit;
	} else {
		qpos = qubit;
	}

	for (let el = 0; el < 4; el++) {
		trace.push(math.complex(0, 0));
		let base = unusedLen;
		while (base--) {
			const row = insertBit(base, qpos, el & 2 ? 1 : 0);
			if (this.state[row]) {
				const col = insertBit(base, qpos, el & 1 ? 1 : 0);
				if (this.state[col]) {
					trace[el] = math.add(
						trace[el],
						math.multiply(this.state[row], math.conj(this.state[col])),
					);
				}
			}
		}
	}
	return [
		[trace[0], trace[1]],
		[trace[2], trace[3]],
	];
};

QuantumCircuit.prototype.angles = function () {
	let wire;
	const angles = [];
	for (wire = 0; wire < this.numQubits; wire++) {
		angles.push({ theta: 0, phi: 0 });
	}

	for (wire = 0; wire < this.numQubits; wire++) {
		const trace = this.partialTrace(wire);
		const alpha = math.round(math.sqrt(trace[0][0]), 12);
		const beta = math.round(math.multiply(trace[1][0], math.sqrt(2)), 12);
		const radius = math.round(
			math.abs(math.sqrt(2 * math.abs(math.trace(math.pow(trace, 2))) - 1)),
			12,
		);

		const theta = math.multiply(2, math.acos(alpha));
		let phi = 0;

		if (!(math.round(beta.re, 8) === 0 && math.round(beta.im, 8) === 0)) {
			phi = math.multiply(
				math.complex(0, -1),
				math.log(math.multiply(beta, math.csc(math.divide(theta, 2)))),
			).re;
			if (isNaN(phi)) {
				phi = 0;
			}
		}

		angles[wire].theta = math.round(math.abs(theta), 12);
		angles[wire].phi = math.round(phi, 12);
		angles[wire].thetaDeg = math.round(
			math.multiply(math.abs(theta), 180 / math.pi),
			7,
		);
		angles[wire].phiDeg = math.round(math.multiply(phi, 180 / math.pi), 7);
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

QuantumCircuit.prototype.randomCircuit = function (
	numQubits,
	numGates,
	options,
) {
	this.init(numQubits);

	options = options || {};

	const gates =
		options.useGates && options.useGates.length
			? options.useGates
			: Object.keys(this.basicGates);

	if (options.noMeasure && gates.indexOf("measure") >= 0) {
		gates.splice(gates.indexOf("measure"), 1);
	}

	if (options.noReset && gates.indexOf("reset") >= 0) {
		gates.splice(gates.indexOf("reset"), 1);
	}

	let gateCount = 0;
	while (gateCount < numGates) {
		const gateName = gates[Math.floor(Math.random() * gates.length)];
		const gate = this.basicGates[gateName];
		if (gate) {
			const gateQubits =
				gate.matrix && gate.matrix.length ? math.log2(gate.matrix.length) : 1;

			if (gateQubits <= numQubits) {
				// gate wires
				const gateWires = [];
				while (gateWires.length < gateQubits) {
					let gateWire = -1;
					do {
						gateWire = Math.floor(Math.random() * numQubits);
					} while (gateWires.indexOf(gateWire) >= 0);
					gateWires.push(gateWire);
				}

				const opt = {};

				// gate params
				if (gate.params && gate.params.length) {
					const params = {};
					gate.params.map(function (paramName) {
						params[paramName] = Math.PI * 2 * Math.random();

						// -PI..PI
						if (params[paramName] > Math.PI) {
							params[paramName] = Math.PI - params[paramName];
						}
					});
					opt.params = params;
				}

				if (gateName === "measure") {
					// measurement destination
					opt.creg = {
						name: "c",
						bit: gateWires[0],
					};
				} else {
					if (!options.noClassicControl) {
						// maybe add condition
						if (Math.floor(Math.random() * 4) === 0) {
							const cregBits = this.cregTotalBits();
							if (cregBits) {
								opt.condition = {
									creg: "c",
									value: Math.floor(Math.random() * math.pow(2, cregBits)),
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

QuantumCircuit.prototype.randomUnitary = function (numQubits) {
	const circ = new QuantumCircuit();
	circ.randomCircuit(numQubits || 1, (numQubits || 1) * 8, {
		useGates: ["rx", "rz", "cz"],
		noMeasure: true,
		noReset: true,
		noClassicControl: true,
	});
	return circ.circuitMatrix();
};

QuantumCircuit.prototype.eulerAnglesZYZ = function (inputMatrix) {
	const eulerAngles = { theta: null, phi: null, lambda: null, phase: null };
	const coeff = math.pow(math.det(inputMatrix), -0.5);
	eulerAngles.phase = -1 * math.complex(coeff).toPolar().phi;
	const su_mat = math.multiply(coeff, inputMatrix);
	eulerAngles.theta =
		2 * math.atan2(math.abs(su_mat[1][0]), math.abs(su_mat[0][0]));
	const phiplambda = 2 * math.complex(su_mat[1][1]).toPolar().phi;
	const phimlamda = 2 * math.complex(su_mat[1][0]).toPolar().phi;
	eulerAngles.phi = (phiplambda + phimlamda) / 2.0;
	eulerAngles.lambda = (phiplambda - phimlamda) / 2.0;
	return eulerAngles;
};
