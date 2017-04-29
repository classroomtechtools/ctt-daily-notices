/*
	Interfaces with gas-local in order to bring what is normally server-side code
	into the local node.js stack, i.e. "virtualizing" it

	Creates an object virtual that contains all code in source folders
	Also has method .virtual which creates one as well, which is used to pass on
	virtualized code into templating files
*/

'use strict';

let moment = require('moment');  // Moment is just too good not to use
let gas = require('gas-local');
let ejs = require('ejs');
let Document = require('./Document.js');
let Spreadsheet = require('./Spreadsheet.js');
let Form = require('./form.js');

const sourcePath = 'dev';

let hooksForMocks = {

	production: false,

	FormApp: {
		getActiveForm: function () {
			return Form('getActiveForm');
		},

		openById: function (id) {
			return Form('openById');
		},

		create: function (title) {
			return Form(title);
		},

		'DestinationType': {
			'SPREADSHEET': 'SPREADSHEET'
		},
	},

	DocumentApp: {
		getActiveDocument: function () {
			/* return new Document(); */
		},
	},

	SpreadsheetApp: {
		allSpreadsheets: [],

		active: null,

		/*

		*/
		create: function (name, rows, columns) {
			var id = this.allSpreadsheets.length;
			var ss = Spreadsheet(id, name, rows, columns);
			this.allSpreadsheets.push(ss);
			return ss;
		},

		/*
			Have to hold the same one otherwise we create a new one 
			with every test iteration
		*/
		getActiveSpreadsheet: function () {
			if (this.active == null) {
				this.active = Spreadsheet(this.allSpreadsheets.length);
				this.allSpreadsheets.push(this.active);
			}
			return this.active;
		},

		openById: function (id) {
			return this.allSpreadsheets[id] || null;
		},
	},

	Moment: moment,

	__proto__: gas.globalMockDefault,

};

hooksForMocks.Moment.load = function () {};  // load is part of GAS ecosystem
var virtual = gas.require('./' + sourcePath, hooksForMocks);
virtual.executionAPIInfo = {
	"access_token":"ya29.GlsxBHe3HrGzwmsu0yCJknsX3S0BgWp419NsQUbEpWD1vwG6lr4FloqiBQpCfBcFwed4cN5Q1BCjEfrGMwMa2P7XUCND48k57mP8iORzVg_Qt5D6sw22MaSEqhJE",
	"refresh_token":"1/oHsamPj7LWdu7Qh1Bs9kmJDUB2GZ0kz48IsdfN4YjUM",
	"token_type":"Bearer",
	"expiry_date":1492522268646
};

// {
// 	apiKey: '',
// 	discovertyDocs: '',
// 	clientId: '',
// 	scope: [],
// }

// Passed into include in order to ensure templates have virtual source too
virtual.virtual = function () { 
	return gas.require('./' + sourcePath, hooksForMocks);
};

module.exports = virtual;