/* 
    ss is the spreadsheet, if undefined uses #getActiveSpreadsheet
*/
function SpreadsheetMaker(options) {
    'use strict';

    var _ss = null;

    function _getOrCreateSpreadsheet () {
        if (_ss != null) {
            return _ss;
        }
        if (options && options.createOnInit) {
            _ss = SpreadsheetApp.create();
        } else {
            _ss = SpreadsheetApp.getActiveSpreadsheet();
        }
        return _ss;
    }

    function getAllSheets () {
        var sheets = _ss.getSheets();

        var ret = sheets.reduce(function (acc, value, index, arr) {
            var which = sheets[index];
            acc[which.getName()] = which;
            return acc;
        }, {});

        return ret;
    }

    /*
        Outfit the speadsheet, sheets, and default values
    */
    return {

        /* 
            Puts spreadsheet into initial state
        */
        initSpreadsheet: function () {
            var ss = _getOrCreateSpreadsheet();

            var allSheets = app.constants.SHEETS;

            allSheets.forEach(function (sheetTitle) {
                if (ss.getSheetByName(sheetTitle) == null) {
                    var newSheet = ss.insertSheet(sheetTitle);
                    newSheet.setFrozenRows(2);
                }
            });

            var ret = {

                spreadsheet: ss,

                /*
                    Return sheets as a named object
                */
                getAllSheets,

                getHolidaySheet: function () {
                    var all = getAllSheets();
                    return all['Holidays'];
                },

                getDataSheet: function () {
                    return getAllSheets()['Data'];
                }
            };

            var holidaySheet = ret.getHolidaySheet();

            holidaySheet.getRange(
                1, 1, 
                app.constants.NUMHEADERS_HOLIDAYSSHEET, app.constants.NUMCOLS_HOLIDAYSSHEET
            ).setValues(
                app.constants.HEADERS_HOLIDAYSSHEET
            );

            return ret;
        },
    };
}