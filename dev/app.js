/*
  main program
  Builds an app object on the global context; all properties are functions
  Which means no actual code (other than assignments) is executed at initial loading

  All application specific code goes here
*/

/*
  Build upon the globalContext (passed as this below) to define all our variables in the "app" variable
  We'll have all the virtualized stuff there in the local stack (thus, name conflicts are still possible)
*/
(function (globalContext) {
    'use strict';

    globalContext.app = {};
    app.name = 'App';

    app.onOpen = function (ui) {
        var html = HtmlService.createTemplateFromFile('Sidebar').evaluate()
                .setTitle(app.name);

        ui.showSidebar(html);
    };

    app.doGet = function () {
        return HtmlService.createTemplateFromFile('Main').evaluate()
          .setTitle(app.name);
    };

    app.load = function () {
    };

    app.getActive = function () {
      return SpreadsheetApp.getActiveSpreadsheet();
    };

    app.initSpreadsheet = function () {
      var SpreadSheetMaker = SpreadsheetMaker();
      var sss = SpreadSheetMaker.initSpreadsheet();
      var sections = app.constants.SHEETS;
      FormMaker.createForm(sss.spreadsheet, 'Daily Notices', sections);
    };

    app.constants = {};
    app.constants.SHEETS = ['Archive', 'Admin', 'Holidays', 'Repeats', 'Sections', 'Language', 'Permissions'];
    app.constants.NUM_SHEETS = app.constants.SHEETS.length;
    app.constants.HEADERS_DATASHEET = [["Timestamp","Email Address","Section","Title","Content","Start Date","End Date","Embedded Attachment","CANCEL","End Date Calc","Archive","Started?","Expired?","Days","Edit Url","LinkToSite","Cancel","Unique ID"],["", "", "ValidatePermissions(Sticky,Admin!B1)","ValidateCharLength(<=50) ValidateNotUpper()","ValidateCharLength(<=1000) ValidateNotUpper()","ValidateIFTE(ignoreAbsences) ValidateIFTE(noChangeAfterPublished) ValidateIFTE(notHoliday) ValidateIFTE(firstAfterLastUpdated)","ValidateDate(ignoreEmpty) ValidateDate(>=F)","ValidateOpen(ignoreEmpty)","ValidateCancel()","FillDown","FillDown","FillDown","FillDown","FillDown","", "FillDown","FillDown","UniqueID"]];
    app.constants.FIRSTROW_DATASHEET = [["01/01/2017 00:00:00", "someone@example.com", "Secondary School", "Filler", "This is just a filler please do not delete this row.", "01/01/2017", "01/01/2017", "", "", "=if(isblank(G3),F3,G3)", '=IF(F3 > Archive!$A$2, "97 All those to be published in the future",IF(DATEDIF(F3, Archive!$A$2, "D") <= 14, TEXT(DATEDIF(F3, Archive!$A$2, "D"), "00") & " days ago: " & TEXT(F3,"dddd mmmm yyyy") & ", 98 All those within the last two weeks","99 All those more than two weeks ago"))', "=F3<=Archive!$A$2", "=IF(ISBLANK(G3), F3<Archive!$A$2, G3<Archive!$A$2)", '=IF(ISBLANK(G3), IF(ISBLANK(F3), 0, 1), NETWORKDAYS.INTL(F3,J3, "0000000", Holidays!G2:G))', "https://docs.google.com/a/example.com/forms/d/fakeidnumber/viewform?blahblah", "https://sites.google.com/a/example.com/siteslug/sitesarea/fakedate", '=IF(LEN(I3)>0, LEFT(I3, LEN({"Undo"}))<>"Undo", false)', "00001"]];
    app.constants.HEADERS_HOLIDAYSSHEET = [["Start Date", "All days after Start Date", "First Day of Long Hol", "Last Day of Long Hol", "Long Holidays", "Day Holidays", "Day Holidays & Long Holidays & Weekends ", "Raw weekends", "Weekend Summary", "Weekend Days We Must Work"]];
    app.constants.NUMHEADERS_DATASHEET = app.constants.HEADERS_DATASHEET.length;
    app.constants.NUMHEADERS_HOLIDAYSSHEET = app.constants.HEADERS_HOLIDAYSSHEET.length;
    app.constants.NUMCOLS_HOLIDAYSSHEET = app.constants.HEADERS_HOLIDAYSSHEET[0].length;
    app.constants.NUMCOLS_DATASHEET = app.constants.HEADERS_DATASHEET[0].length;
    app.constants.NUMROWS_FIRSTROW_DATASHEET = app.constants.FIRSTROW_DATASHEET.length;
})(this);
