var fs = require("fs");
var path = require("path");

var QuantumCircuit = require("../lib/quantum-circuit.js");

var escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
};

fs.readFile( path.join(__dirname, "README_TEMPLATE.md"), function (err, data) {
	if(err) {
		throw err; 
	}

	var circ = new QuantumCircuit();

	var readme = data.toString();

	var gateIndex = "";
	var gateRef = "";
	gateIndex += "| Name | Quil | Params | Description |\n";
	gateIndex += "| --- | --- | --- | --- |\n";
	for(var gateName in circ.basicGates) {
		var gateDef = circ.basicGates[gateName];
		var pyquilDef = gateDef.exportInfo && gateDef.exportInfo.pyquil ? gateDef.exportInfo.pyquil : null;
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
		gateIndex += "| **" + gateName + "**";
		gateIndex += " | " + (pyquilDef ? pyquilDef.name : "");
		gateIndex += " | " + paramList;
		gateIndex += " | " + (gateDef.description || "");
		gateIndex += " |\n";
		// ---

		// ---
		// gate reference
		// ---
		gateRef += "## " + gateName + "\n\n";
		gateRef += (gateDef.description || "") + "\n\n";
		if(paramList) {
			gateRef += "*Parameters:*\n\n";
			params.map(function(paramName) {
				gateRef += "- *" + paramName + "*\n";
			});
			gateRef += "\n";
		}
		if(gateDef.matrix && gateDef.matrix.length) {
			gateRef += "\n*Matrix:*\n";
			gateRef += "```\n";
			gateRef += "[\n";
			gateDef.matrix.map(function(row) {
				gateRef += "    " + JSON.stringify(row) + "\n";
			});
			gateRef += "]\n";
			gateRef += "```\n";
		}
		gateRef += "\n";
		// ---
	}

	readme = readme.replace(new RegExp(escapeRegExp("{GATE_INDEX}"), "g"), gateIndex);
	readme = readme.replace(new RegExp(escapeRegExp("{GATE_REFERENCE}"), "g"), gateRef);

	fs.writeFile(path.join(path.join(__dirname, "../"), "README.md"), readme, function(err) {
		if(err) {
			throw err;
		}

		console.log("README.md is written.");
	});
});
