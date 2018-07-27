/**
 * @license
 *
 * Copyright (c) 2016, Petar Korponaić <petar.korponaic@gmail.com>
 *
 * This source code is licensed under the MIT License, found in
 * the LICENSE.txt file in the root directory of this source tree.
 */

var QuantumCircuit = require("../lib/quantum-circuit.js");

var circuit = new QuantumCircuit();


circuit.test("X", [
	["x",  0, 0]
], [
	[0, 0],
	[1, 0]
]);

circuit.test("Y", [
	["y",  0, 0]
], [
	[0, 0],
	[0, 1]
]);

circuit.test("Z", [
	["z",  0, 0]
], [
	[1, 0],
	[0, 0]
]);

circuit.test("H", [
	["h",  0, 0]
], [
	[0.70710678, 0],
	[0.70710678, 0]
]);

circuit.test("SRN", [
	["srn",  0, 0]
], [
	[0.70710678, 0],
	[-0.70710678, 0]
]);

circuit.test("X-R2", [
	["x",   0, 0],
	["r2",  1, 0]
], [
	[0, 0],
	[0, 1]
]);

circuit.test("X-R4", [
	["x",   0, 0],
	["r4",  1, 0]
], [
	[0, 0],
	[0.70710678, 0.70710678]
]);

circuit.test("X-R8", [
	["x",   0, 0],
	["r8",  1, 0]
], [
	[0, 0],
	[0.92387953, 0.38268343]
]);

circuit.test("Bell", [
	["h",  0, 0],
	["cx", 1, [0, 1]]
], [
	[0.70710678, 0],
	[0,          0],
	[0,          0],
	[0.70710678, 0]
]);
