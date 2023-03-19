var fs = require("fs");
var path = require("path");
var url = require("url");

var QuantumCircuit = require("../lib/quantum-circuit.js");

var escapeRegExp = function(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
};

var extractMarkdownLinks = function(s) {
	var res = [];
	var regex1 = /\[([^\[]+)\]\(([^\)]+)\)/g;
	while((array1 = regex1.exec(s)) !== null) {
		res.push({
			full: array1[0],
			title: array1[1],
			link: array1[2],
			index: array1.index
		});
	}
	return res;
};

var convertRelativeLinksToAbsolute = function(s, baseURL) {
	var res = "";
	var links = extractMarkdownLinks(s);
	var pos = 0;
	links.map(function(link) {
		res += s.substring(pos, link.index);

		var newlink = link.full;
		if(link.link && link.link.indexOf("#") < 0 && link.link.indexOf("http://") < 0 && link.link.indexOf("https://") < 0) {
			newlink = link.full.replace(/\((.+?)\)/g, "(" + url.resolve(baseURL, link.link) + ")");
		}

		res += newlink;
		pos = link.index + link.full.length;
	});
	return res;
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
	gateIndex += "| Name | pyQuil | Cirq | Q# | IONQ | Qubits | Params | Description |\n";
	gateIndex += "| --- | --- | --- | --- | --- | --- | --- | --- |\n";
	for(var gateName in circ.basicGates) {
		var gateDef = circ.basicGates[gateName];
		var numQubits = Math.log2(gateDef.matrix && gateDef.matrix.length ? gateDef.matrix.length : 2);
		var pyquilDef = (gateDef.exportInfo ? (gateDef.exportInfo.pyquil || gateDef.exportInfo.quil) : null) || null;
		var cirqDef = (gateDef.exportInfo ? gateDef.exportInfo.cirq : null) || null;
		var qsharpDef = (gateDef.exportInfo ? gateDef.exportInfo.qsharp : null) || null;
		var ionqDef = (gateDef.exportInfo ? gateDef.exportInfo.ionq : null) || null;
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

		var cirqName = cirqDef ? (cirqDef.array ? "def " + (cirqDef.name || "") : (cirqDef.name || "")) : "";
		if(cirqDef && cirqDef.replacement) {
			var gdef = circ.basicGates[cirqDef.replacement.name] || null;
			if(gdef) {
				var pdef = (gdef.exportInfo ? gdef.exportInfo.cirq : null) || null;
				if(pdef) {
					cirqName = pdef.name || "";
					if(cirqDef.replacement.params) {
						cirqName += "(";
						var pcount = 0;
						for(var pname in cirqDef.replacement.params) {
							if(pcount) {
								cirqName += ", ";
							}
							cirqName += cirqDef.replacement.params[pname];
						}
						cirqName += ")";
					}					
				}
			}
		}

		var qsharpName = qsharpDef ? (qsharpDef.array ? ""/*"def " + (qsharpDef.name || "")*/ : (qsharpDef.name || "")) : "";
		if(qsharpDef && qsharpDef.replacement) {
			var gdef = circ.basicGates[qsharpDef.replacement.name] || null;
			if(gdef) {
				var pdef = (gdef.exportInfo ? gdef.exportInfo.qsharp : null) || null;
				if(pdef) {
					qsharpName = pdef.name || "";
					if(qsharpDef.replacement.params) {
						qsharpName += "(";
						var pcount = 0;
						for(var pname in qsharpDef.replacement.params) {
							if(pcount) {
								qsharpName += ", ";
							}
							qsharpName += qsharpDef.replacement.params[pname];
						}
						qsharpName += ")";
					}
				}
			}
		}

		var ionqName = ionqDef ? (ionqDef.array ? "def " + (ionqDef.name || "") : (ionqDef.name ? ionqDef.name : (ionqDef.names ? ionqDef.names[0] : ""))) : "";
		if(ionqDef && ionqDef.replacement) {
			var gdef = circ.basicGates[ionqDef.replacement.name] || null;
			if(gdef) {
				var pdef = (gdef.exportInfo ? gdef.exportInfo.ionq : null) || null;
				if(pdef) {
					ionqName = pdef.name || "";
					if(ionqDef.replacement.params) {
						ionqName += "(";
						var pcount = 0;
						for(var pname in ionqDef.replacement.params) {
							if(pcount) {
								ionqName += ", ";
							}
							ionqName += ionqDef.replacement.params[pname];
						}
						ionqName += ")";
					}					
				}
			}
		}

		gateIndex += "| **" + gateName + "**";
		gateIndex += " | " + pyquilName;
		gateIndex += " | " + cirqName;
		gateIndex += " | " + qsharpName;
		gateIndex += " | " + ionqName;
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
			gateDef.matrix.map(function(row, rowIndex) {
				if(rowIndex > 0) {
					gateRef += ",";
				}
				gateRef += "\n    " + JSON.stringify(row);
			});
			gateRef += "\n]\n";
			gateRef += "```\n";
		}

		gateRef += "\n**Example:**\n";
		gateRef += "```javascript\n";
		gateRef += "circuit.appendGate(\"" + gateName + "\", ";
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

	readme = readme.replace(new RegExp(escapeRegExp("{TITLE}"), "g"), "# Quantum Circuit Simulator");
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
