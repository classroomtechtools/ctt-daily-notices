(function () {
	'use strict';

	let assert = require('chai').assert;
	let app = require('./virtual').app;

	describe('Initialization', function () {

		it('sets up the spreadsheet with linked form by "data"', function () {
			app.initSpreadsheet();
			var ss = app.getActive();
			assert.notEqual(ss.getSheetByName('Data'), null);
		});

	});

})();