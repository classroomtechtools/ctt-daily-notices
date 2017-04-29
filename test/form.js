function TextItem (_index, _items) {
	var textItem = Item(_index, _items);
	textItem.type = "TEXT";

	return textItem;
}

function DateTimeItem (_index, _items) {
	var dateTimeItem = Item(_index, _items);
	dateTimeItem.type = "DATETIME";

	// more?

	return dateTimeItem;
}

function ParagraphTextItem (_index, _items) {
	var paragraphTextItem = Item(_index, _items);
	paragraphTextItem.type = 'PARAGRAPH';

	return paragraphTextItem;
}

function MultipleChoiceItem (_index, _items) {
	var multipleChoiceItem = Item(_index, _items);
	_type = "MULTIPLECHOICE";
	_choices = [];

	multipleChoiceItem.createChoice = function (value) {

	};

	multipleChoiceItem.createResponse = function (response) {

	};

	multipleChoiceItem.setChoices = function (choices) {
		_choices = choices;
	};

	multipleChoiceItem.setChoiceValues = function (choices) {
		_choices = choices;
		return _items.getItem(_index);
	};

	return multipleChoiceItem;
}

/* 
	Collection of items
*/
function Items () {
	_these = [];

	return {
		add: function (item) {
			_these.push(item);
		},

		get: function () {
			return _these;
		},

		getItem: function (index) {
			if (typeof index !== 'number') {
				throw Error("index is " + typeof index + " expecting a number");
			}
			if (index >= _these.length) {
				throw Error("Index " + index.toString() + " is out of bounds");
			}
			return _these[index];
		},

		getLength: function () {
			return _these.length;
		},
	};
}

function Item (_index, _items) {
	_type = 'ITEM';
	_required = false;
	_title = '';
	_description = '';

	return {

		getType: function () {
			return _type;
		},

		asTextItem: function () {
			return _items.getItem(_index);
		},

		isRequired: function () {
			return _required;
		},

		setRequired: function (required) {
			_required = required;
			return _items.getItem(_index);
		},

		setTitle: function (title) {
			_title = title;
			return _items.getItem(_index);
		},

		getTitle: function () {
			return _title;
		},

		getIndex: function () {
			return _index;
		},

		setHelpText: function (description) {
			_description = description;
			return _items.getItem(_index);
		},
	}
}

function Form (_title) {
	_items = Items();
	_destination = {
		type: null,
		id: null
	};

	function addItem (klass) {
		var index = _items.getLength();
		var item = klass(index, _items);
		_items.add(item);
		return item;
	}

	function addMultipleChoiceItem() {
		return addItem(MultipleChoiceItem);
	}

	function addDateTimeItem() {
		return addItem(DateTimeItem);
	}

	return {

		getItems: function () {
			return _items.get();
		},

		addTextItem: function () {
			return this.addItem(TextItem);
		},

		setDestination: function (destType, destId) {
			// circular dependency
			let virtual = require('./virtual');
			var ss = virtual.SpreadsheetApp.openById(destId);
			_destination = {type:destType, id:destId};
			ss.insertSheet('Form Responses');
		},

		getDestinationType: function () {
			return _destination.type;
		},

		getDestinationId: function () {
			return _destination.id;
		},

		addItem,

		addDateTimeItem,

		addMultipleChoiceItem
	};
}

module.exports = Form;