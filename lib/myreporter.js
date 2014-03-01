/**
 * Copyright (c) 2014 eBay Software Foundation.
 *
 */
var fs = require('fs');
var reportFolder = __dirname+'/../../../report/';

module.exports =
{
	reporter: function (results)
	{
		"use strict";

		var files = {},
		out = "",
		pairs = {
			"&": "&amp;",
			'"': "&quot;",
			"'": "&apos;",
			"<": "&lt;",
			">": "&gt;"
		},
		file, i, issue;

		function encode(s) {
			for (var r in pairs) {
				if (typeof(s) !== "undefined") {
					s = s.replace(new RegExp(r, "g"), pairs[r]);
				}
			}
			return s || "";
		}

		results.forEach(function (result) {
			result.file = result.file.replace(/^\.\//, '');
			if (!files[result.file]) {
				files[result.file] = [];
			}
			files[result.file].push(result.error);
		});

		out += "<?xml version=\"1.0\" encoding=\"utf-8\"?>";
		out += "<jslint>";

		for (file in files) {
			out += "\t<file name=\"" + __dirname+"/../../../"+file + "\">";
			for (i = 0; i < files[file].length; i++) {
				issue = files[file][i];
				out += "\t\t<issue line=\"" + issue.line +
					"\" char=\"" + issue.character +
					"\" reason=\"" + encode(issue.reason) +
					"\" evidence=\"" + encode(issue.evidence) +
					(issue.code ? "\" severity=\"" + encode(issue.code.charAt(0)) : "") +
					"\" />";
			}
			out += "\t</file>";
		}

		out += "</jslint>";
		out += "\n";
		var jshintXML = out.toString();
		if(!fs.existsSync(reportFolder)) {
			fs.mkdirSync(reportFolder);	
		}
		fs.writeFileSync(reportFolder + 'jshint.xml', jshintXML);
		console.log('JSHint Report is Generated Successfully at report/jshint.xml\n');
	}
};
