function FormMaker() {
    'use strict';
 
    return {

    };
}

/*
    @param  sss     Spreadsheet
*/
FormMaker.createForm = function (destinationSpreadsheet, title, sections) {
    var form = FormApp.create(title);

    var item = form.addMultipleChoiceItem()
        .setTitle('Section')
        .setChoiceValues(sections)
        .setRequired(true);
    form.addTextItem()
        .setTitle('Title')
        .setRequired(true);
    form.addTextItem()
        .setTitle('Content')
        .setRequired(true);
    form.addDateTimeItem()
        .setTitle('Start Date')
        .setRequired(true);
    form.addDateTimeItem()
        .setTitle('End Date');
    form.addTextItem()
        .setTitle('Embedded Attachment');
    
    form.setDestination(FormApp.DestinationType.SPREADSHEET, destinationSpreadsheet.getId());
    destinationSpreadsheet.getSheetByName('Form Responses')
        .setName('Data');

    return form;
}