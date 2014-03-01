/**
 * Copyright (c) 2014 eBay Software Foundation.
 *
 */
var fs = require('fs');
	async = require('async'),
	childprocess = require('child_process'),
	wrench = require('wrench'),
	util = require('util');

var spawn = childprocess.spawn;
var nodeLocation = __dirname+'/../node_modules/.bin/';
var coverageFolder = __dirname+'/../../../coverage/';
var reportFolder = __dirname+'/../../../report/';

function run(options) {
	if(!fs.existsSync(reportFolder)) {
		fs.mkdirSync(reportFolder);	
	}
	
	async.waterfall([
         function(callback){
        	 runIstanbul(options, callback);
         },
         function(result, callback){
        	 runXUnitReport(options, callback);
         },
         function(result, callback){
        	 runJSHint(options, callback);
         }], 
         function(err, results){
			console.log(err);
	});
}

function runIstanbul(options, callback){
	try {
		console.log('Running Istanbul Report...');
    	var codecoverage = spawn(nodeLocation+'istanbul',  ['cover', nodeLocation+'_mocha', '-- -R spec --ui bdd '+ options.test]);
    	var logData = '';
		codecoverage.stdout.on('data', function (data) {
			data = '' + data;
			if(data.indexOf('Statements') > 0 || data.indexOf('Branches') > 0 || data.indexOf('Functions') > 0 || data.indexOf('Lines') > 0) {
				logData += data;
			}
		});
		
		codecoverage.on('close', function (code) {
			if(fs.existsSync(coverageFolder+'lcov.info')) {
				fs.renameSync(coverageFolder+'lcov.info', coverageFolder+'coverage.lcov');
				wrench.copyDirSyncRecursive(coverageFolder, reportFolder+'coverage');
				wrench.rmdirSyncRecursive(coverageFolder, true);
				console.log(logData);
				console.log('Istanbul Code Coverage Report is Generated Successfully at report/coverage');
			}
			callback(null, 'done');
		});
	 }catch(err){
		 console.trace(err);
		 callback(null, 'done');
	 }
}

function runJSHint(options, callback) {
	console.log('Running JSHint Report...');
	process.argv.push(options.src);
	 process.argv.push("--reporter="+__dirname+"/myreporter.js");
	 require("jshint/src/cli.js").interpret(process.argv);
	 callback(null, 'done');
}

function runXUnitReport(options, callback) {
	console.log('Running xUnit Report...');
	var xunitXML = "";
	try {
		var arr=[];
		arr.push('-R');
		arr.push('xunit');
		arr.push(options.test);
		var codecoverage = spawn(nodeLocation+'mocha',  arr);
		codecoverage.stdout.on('data', function (data) {
			var str = '' + data;
			if(str.indexOf('<test') > -1 || str.indexOf('</test') > -1) {
				xunitXML += str;
			}
		});
		
		codecoverage.stderr.on('data', function (data) {
			console.log('' + data);
		});
		
		codecoverage.on('close', function (code) {
			if(xunitXML.length > 0) {
				fs.writeFileSync(reportFolder+'xunit.xml', xunitXML);
				console.log('xUnit Report is Generated Successfully at report/xunit.xml');
			}
			callback(null, 'done');
		});
	}catch(err){
		console.trace(err);
		callback(null, 'done');
	}
}

exports.run = run;

