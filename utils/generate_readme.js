var fs = require("fs");
var path = require("path");

var QuantumCircuit = require("../lib/quantum-circuit.js");

var escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
};

fs.readFile( path.join(__dirname, "README_TEMPLATE.md"), function (err, data) {
	if(err) {
		throw err;
		return;
	}

	var circ = new QuantumCircuit();

	var readme = data.toString();

	var gateIndex = "";
	var gateRef = "";
	gateIndex += "| Name | pyQuil | Qubits | Params | Description |\n";
	gateIndex += "| --- | --- | --- | --- | --- |\n";
	for(var gateName in circ.basicGates) {
		var gateDef = circ.basicGates[gateName];
		var numQubits = Math.log2(gateDef.matrix && gateDef.matrix.length ? gateDef.matrix.length : 2);
		var pyquilDef = (gateDef.exportInfo ? (gateDef.exportInfo.pyquil || gateDef.exportInfo.quil) : null) || null;
		var params = gateDef.params || [];
		var paramList = "";
		if(gateDef.params && gateDef.params.length) {
			gateDef.params.map(function(paramName, paramIndex) {
				if(paramIndex > 0) {
					paramList += ", ";
				}
				paramList += paramName;
			});
		}

		// ---
		// gate index
		// ---
		var pyquilName = pyquilDef ? (pyquilDef.array ? "def " + (pyquilDef.name || "") : (pyquilDef.name || "")) : "";
		if(pyquilDef && pyquilDef.replacement) {
			var gdef = circ.basicGates[pyquilDef.replacement.name] || null;
			if(gdef) {
				var pdef = (gdef.exportInfo ? (gdef.exportInfo.pyquil || gdef.exportInfo.quil) : null) || null;
				if(pdef) {
					pyquilName = pdef.name || "";
					if(pyquilDef.replacement.params) {
						pyquilName += "(";
						var pcount = 0;
						for(var pname in pyquilDef.replacement.params) {
							if(pcount) {
								pyquilName += ", ";
							}
							pyquilName += pyquilDef.replacement.params[pname];
						}
						pyquilName += ")";
					}					
				}
			}
		}

		gateIndex += "| **" + gateName + "**";
		gateIndex += " | " + pyquilName;
		gateIndex += " | " + numQubits;
		gateIndex += " | " + paramList;
		gateIndex += " | " + (gateDef.description || "");
		gateIndex += " |\n";
		// ---

		// ---
		// gate reference
		// ---
		gateRef += "## " + gateName + "\n";
		if(gateDef.description) {
			gateRef += "\n" + gateDef.description + "\n";
		}

		gateRef += "\n**Qubits:** " + numQubits + "\n";

		if(params.length) {
			gateRef += "\n**Parameters:**\n\n";
			params.map(function(paramName) {
				gateRef += "- " + paramName + "\n";
			});
			gateRef += "\n";
		}
		if(gateDef.matrix && gateDef.matrix.length) {
			gateRef += "\n**Matrix:**\n";
			gateRef += "```javascript\n";
			gateRef += "[\n";
			gateDef.matrix.map(function(row) {
				gateRef += "    " + JSON.stringify(row) + "\n";
			});
			gateRef += "]\n";
			gateRef += "```\n";
		}

		gateRef += "\n**Example:**\n";
		gateRef += "```javascript\n";
		gateRef += "circuit.addGate(\"" + gateName + "\", -1, ";
		if(numQubits == 1) {
			gateRef += "0";
		} else {
			gateRef += "[";
			for(var i = 0; i < numQubits; i++) {
				if(i > 0) {
					gateRef += ", ";
				}
				gateRef += i;
			}
			gateRef += "]";
		}

		if(gateName == "measure") {
			gateRef += ", {\n";
			gateRef += "    creg: {\n";
			gateRef += "        name: \"c\",\n";
			gateRef += "        bit: 3\n";
			gateRef += "    }\n";
			gateRef += "}";
		} else {
			if(params.length) {
				gateRef += ", {\n";
				gateRef += "    params: {";
				params.map(function(paramName, paramIndex) {
					if(paramIndex > 0) {
						gateRef += ",";
					}
					gateRef += "\n";
					gateRef += "        " + paramName + ": \"pi/2\"";
				});
				gateRef += "\n    }\n";
				gateRef += "}";
			}
		}
		gateRef += ");\n";
		gateRef += "```\n";

		if(gateName == "measure") {
			gateRef += "\n**Or:**\n"
			gateRef += "```javascript\n";
			gateRef += "circuit.addMeasure(0, \"c\", 3);\n";
			gateRef += "```\n"
		}
		
		gateRef += "\n";
		// ---
	}

	var apiDocs = "*To be written...*";

	readme = readme.replace(new RegExp(escapeRegExp("{GATE_INDEX}"), "g"), gateIndex);
	readme = readme.replace(new RegExp(escapeRegExp("{GATE_REFERENCE}"), "g"), gateRef);
	readme = readme.replace(new RegExp(escapeRegExp("{API_DOCS}"), "g"), apiDocs);

	fs.writeFile(path.join(path.join(__dirname, "../"), "README.md"), readme, function(err) {
		if(err) {
			throw err;
			return;
		}
		console.log("README.md is written.");			
	});
});
