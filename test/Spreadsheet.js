var base_constructor = require('./base');

function transpose(a) {
	if (a.length == 0) {
		return [];
	}
    return Object.keys(a[0]).map(
        function (c) { return a.map(function (r) { return r[c]; }); }
    );
}

let defaultMdArr = [];

/**
 * Return a mocked Range
 *
 * @param {String}    raw      The values as a multi-dimentional array
 *
 * @return {Number}   row      which row in the sheet it starts at, saved state
 * @return {Number}   col      which col in the sheet it starts at, saved state
 * @param {Object}    sheet    the referenced sheet object
 *
 */
function Range(_raw, _row, _col, _sheet) {
	_raw = _raw || defaultMdArr;

	return {
		/* 
			Converts internal implementation to identical with google sheets
		*/
		getValues: function () {
			return transpose(_raw);
		},

		setValues: function (valueArray) {
			_sheet._setValues(valueArray, _row, _col);
		},

		getSheet: function () {
			return _sheet;
		},

		getColumn: function () {
			return 1;
		},

		getRow: function () {
			return 1;
		},

		getLastRow: function () {
			return _raw.length+1;
		},

		getLastColumn: function () {
			return _raw.slice(-1).length+1;
		},

	};
}

makeMDArray = function(rows, cols) {
	// currently we transpose on getValue... TODO: Don't?
	var columns = Array.from(Array(rows).keys(), () => '', []);
	return Array.from(Array(cols).keys(), () => columns, []);  // multi-dimentional array
}
const sheetDefaultMDArray = makeMDArray(1000, 26);  // Google makes A-Z cols with 1000 rows by default

/**
 * Return values in mdarr based on indexes
 *
 * @param {String}    mdarr    The multi-dimensional array
 *
 * @return {Array}    Copy of sub-section of mdarray
 * @param {Array}    indexes    Specifies from where and to where to slice
 *
 * @throws                     Error if invalid parameters
 */
mdArrIndexesToValues = function (mdarr, indexes) {
	if (mdarr === undefined) {
		throw Error("mdarr is undefined");
	}
	var verbose = false;

	if (indexes.length === 1)
		// only elements specifies one element in multi dimensional array
		return [mdarr.slice(indexes[0][0], indexes[0][0]+1)[0].slice(indexes[0][1], indexes[0][1]+1)];

	else if (indexes.length === 2) {
		verbose && console.log('mdarr', mdarr);
		verbose && console.log('indexes', indexes);

		if (indexes[1][1] < indexes[0][1])
			throw Error("Illegal parameters");
		if (indexes[1][0] < indexes[0][0])
			throw Error("Error parameters");
		if (indexes[1][1] > mdarr[0].length) {
			// Google defines overflow as being okay
			verbose && console.log('Adjust!');
			indexes[1][1] = mdarr[0].length;
			verbose && console.log(indexes);
		}
		if (indexes[0][0] < 0 || indexes[0][1] < 0)
			throw Error("Invalid parameters")

		var result = [];
		for (var i = indexes[0][0]; i <= indexes[1][0]; i++) {
			verbose && console.log('i', i);
			if (i < mdarr.length) {
				var save = mdarr.slice(i)[0].slice(indexes[0][1], indexes[1][1]+1);  // , indexes[0][1]);  // [0].slice(indexes[0][1], indexes[1][1]+1);
				verbose && console.log(save);
				result.push(save);
			}
		}
		return result;
	} else {
		throw Error("Indexes can only have at most two elements");
	}
};


function Sheet(_name, _mdarr) {
	_mdarr = _mdarr || sheetDefaultMDArray;
	_frozenRows = 0;

	return {

		getName: function () {
			return _name;
		},

		setName: function (name) {
			_name = name;
		},

		getRange: function(first, second, third, fourth) {
			var verbose = false; 
			verbose && console.log('getRange args: ', arguments);
			verbose && console.log('name: ', _name);

			// If arguments sent are > 1, it's a simple calculation:
			if (arguments.length == 4)
				return this.getRangeByFourNumbers(first, second, third, fourth);
			if (arguments.length == 3)
				return this.getRangeByThreeNumbers(first, second, third);
			if (arguments.length == 2)
				return this.getRangeByTwoNumbers(first, second);

			// If arguments == 1, we have A1Notation (sighs):
			var a1Notation = first;
			var split = a1Notation.split(':');
			var stepArray = split.length == 1 ? [0] : [0, 1];
			var indexes = split.length == 1 ? [ [] ] : [ [], [] ];
			stepArray.forEach(function (i) {
				var str = split[i];
				if (!str)
					str = 'A1';
				var columnLabel = str.match(/[A-Z]+/);
				if (columnLabel==undefined)
					columnLabel = ['A'];
				var columnLabel = columnLabel[0];
				var columnIndex = this.colA1ToIndex(columnLabel);
				indexes[i].push(columnIndex);
				var rowLabel = str.match(/[0-9]+/);
				if (rowLabel == null)
					rowLabel = [Number.MAX_SAFE_INTEGER];  // Arrays with values > length will end up filling out
				var rowLabel = rowLabel[0];
				indexes[i].push(parseInt(rowLabel) - 1);
			}.bind(this));

			var result = mdArrIndexesToValues(_mdarr, indexes);
			return Range(result, first, second, this);
		},

		getRangeByTwoNumbers: function(row, column) {
			return Range(
				mdArrIndexesToValues(
					_mdarr, [ [column-1, row-1], [column-1, row-1] ]
				), 
				row, 
				column,
				this
			);
		},

		getRangeByThreeNumbers: function(row, column, numRows) {
			return Range(
				mdArrIndexesToValues(
					_mdarr, 
					[ [column-1, row-1], [column-1, row-1+numRows] ]
				),
				row,
				column,
				this
			);
		},

		getRangeByFourNumbers: function(row, column, numRows, numColumns) {
			var verbose = false;
			var indexes = [ [column-1, row-1], [column-2+numColumns, row-2+numRows] ];
			verbose && console.log('indexes', indexes);	
			return Range(
				mdArrIndexesToValues(
					_mdarr, 
					indexes
				),
				row,
				column,
				this
			);
		},

		clear: function() {
			_mdarr = sheetDefaultMDArray;  // TODO: Or should this retain maxcol and mincol?
		},

		getFrozenRows: () => _frozenRows,

		setFrozenRows: (num) => _frozenRows = num,

		getLastColumn: function () {
			return _mdarr.length + 1;
		},

		getLastRow: function () {
			var maxLength = 0;
			_mdarr.forEach(function (column) {
				if (column.length + 1 > maxLength) {
					maxLength = column.length + 1;
				}
			});
			return maxLength;
		},

		appendRow: function (row) {
			var temp = transpose(_mdarr);
			temp.push(row);
			_mdarr = transpose(temp);
		},

		getDataRange: function () {
			let maxRows = this.getLastRow(),
				maxCols = this.getLastColumn();
			return Range(_mdarr, 1, 1, this);
		},

		/*
			Private method that sets the values
		*/
		_setValues: function (values, row, col) {
			var verbose = false;
			var arr = transpose(_mdarr);
			for (r=0; r < values.length; r++) {
				for (c=0; c < values[r].length; c++) {
					verbose && console.log(r + row - 1, c + col - 1);
					verbose && console.log(arr[r+row-1][0]);
					verbose && console.log('values', values, r, c);
					arr[r+row-1][c+col-1] = values[r][c];
				}
			}
			_mdarr = transpose(arr);
		}
	}
}

/* 
		
*/
function Spreadsheet(_id = 0, _name = 'Untitled', _rows = 1000, _columns = 26) {
	var _sheets = [];

	function getSheetByName (name) {
		for (var i = 0; i < _sheets.length; i++) {
			var sheet = _sheets[i];
			if (sheet.getName() === name) {
				return sheet;
			}
		}
		// If cannot find, returns null
		return null;
	}

	me = base_constructor();

	me.getName =function () {
		return _name;
	};

	/* 
		Need to use 'this' because it is assigned after
	*/
	me.getId =function () {
		return _id;
	};

	me.getSheets =function () {
		return _sheets;
	};

	me.getRange =function (a1Notation) {
		var split = a1Notation.split('!');
		var sheetName = split[0];
		return getSheetByName(sheetName).getRange(split[1]);
	};

	/*

	*/
	me.insertSheet =function(sheetName) {
		var newSheet = Sheet(sheetName);
		_sheets.push(newSheet);
		return newSheet;
	};

	me.getSheetByName = getSheetByName;

	me.getNumSheets = function () {
		return _sheets.length;
	};

	return me;
}

/*
	Convenience to constructors
*/
Spreadsheet.makeSheet = function(title, mdarr) {
	return Sheet(title, mdarr);
};
Spreadsheet.makeRange = function(raw, sheet) {
	return Range(raw, 1, 1, sheet);
};

module.exports = Spreadsheet;
