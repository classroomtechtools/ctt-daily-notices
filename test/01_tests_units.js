(function () {
	'use strict';

	let assert = require('chai').assert;
	let virtual = require('./virtual');
	let app = virtual.app;

	// UNIT TESTS

	describe("Spreadsheet Maker", function () {

		var SpreadsheetMaker = virtual.SpreadsheetMaker({
			createOnInit: true
		});

		it('has a wrapped spreadsheet property', function () {
			var sss = SpreadsheetMaker.initSpreadsheet();
			assert.notEqual(typeof sss.spreadsheet, 'undefined');
		});

		it('opens the same spreadsheet by id', function () {
			var sss = SpreadsheetMaker.initSpreadsheet();
			var ss = virtual.SpreadsheetApp.openById(sss.spreadsheet.getId());
			assert.equal(sss.spreadsheet, ss);
		});

		describe('makes blank spreadsheets', function () {

			var sss = null;

			beforeEach('Ensure a completely blank spreadsheet on each test', function () {
				sss = SpreadsheetMaker.initSpreadsheet();				
			});

			it('that have the correct # of sheets', function () {
				var sheets = sss.getAllSheets();

				app.constants.SHEETS.forEach(function (name) {
					assert.notEqual(typeof sheets[name], 'undefined');	
				});

				assert.equal(sss.spreadsheet.getSheets().length, app.constants.SHEETS.length);
			});

			it('with two header rows on each sheet', function () {
				sss.spreadsheet.getSheets()
					.forEach( (sheet) => assert.equal(sheet.getFrozenRows(), 2) );
			});

			it('with a holiday sheet with the correct values', function () {

	            var holidaySheet = sss.getHolidaySheet();

				var values = holidaySheet.getRange(
					1, 1,
					app.constants.NUMHEADERS_HOLIDAYSSHEET, app.constants.NUMCOLS_HOLIDAYSSHEET
				).getValues();

				assert.deepEqual(
					values,
					app.constants.HEADERS_HOLIDAYSSHEET
				);

			});
		});
	});

	describe("Form Maker", function () {
		var FormMaker = virtual.FormMaker;
		var form = null;

		beforeEach("Create new one on each iteration", function () {
			var sss = virtual.SpreadsheetMaker({createOnInit:true}).initSpreadsheet('test');
			var sections = ['Whole School', 'Secondary School', "Elementary School"];
			form = FormMaker.createForm(sss.spreadsheet, 'Daily Notices', sections);
		});

		it('makes six items', function () {
			var items = form.getItems();
			assert.equal(items.length, 6)
		});

		it('defines a destination', function () {
			assert.notEqual(form.getDestinationType(), null);
		});

	});

})();