var chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';

export var randomString = function(length) {
	var result = [];
	for (var i = 0; i < length; i++) {
		var k = Math.floor(Math.random() * chars.length);
		result.push(chars[k]);
	}
	return result.join('');
};

export var throttled = function(fn, timeout) {
	var blocked = false;

	var wrapper = function() {
		if (!blocked) {
			blocked = true;
			setTimeout(function() {
				fn();
				blocked = false;
			}, timeout);
		}
	};

	return wrapper;
};
