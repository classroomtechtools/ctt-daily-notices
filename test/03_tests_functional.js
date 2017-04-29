(function () {
	'use strict';

	let assert = require('chai').assert;
	let app = require('./virtual').app;
	let Browser = require('zombie');

	let Spreadsheet = require('./Spreadsheet');

	var webdriver = require('selenium-webdriver'),
	    By = webdriver.By;

	var server = require('./server.js');
	server.create();

	describe('', function () {

		before(function (done) {
			this.driver = new webdriver.Builder()
				.forBrowser('chrome')
				.build();
			this.driver.get('localhost:8888/Main');
			done();
		});

		describe('', function () {

			it("");

		});

		after(function () {
			this.driver.quit();
		});

	});

})();