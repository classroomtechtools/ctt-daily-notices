module.exports = function (_id = 0) {
	me = {};

	me.getId = () => _id;

	return me;
};