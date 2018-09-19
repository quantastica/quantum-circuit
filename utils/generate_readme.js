var fs = require("fs");
var path = require("path");

var QuantumCircuit = require("../lib/quantum-circuit.js");

fs.readFile( path.join(__dirname, "README_TEMPLATE.md"), function (err, data) {
	if(err) {
		throw err; 
	}

	var readme = data.toString();

	fs.writeFile(path.join(path.join(__dirname, "../"), "README.md"), readme, function(err) {
		if(err) {
			throw err;
		}

		console.log("README.md is written.");
	});
});
