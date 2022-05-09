import * as utils from './utils.js';
import * as diff from './diff.js';

if (!location.hash) {
	location.hash = utils.randomString(6);
}

var url = 'https://via.ce9e.org/hmsg/pad/' + location.hash.slice(1);
var id = utils.randomString(6);

var el = document.querySelector('textarea');
var old = el.value;

var localChanges = [];
var stagedChanges = [];

document.title = location.hash.slice(1) + ' | Note';

var sendChanges = utils.throttled(function() {
	if (stagedChanges.length) {
		setTimeout(sendChanges, 500);
	} else {
		stagedChanges = localChanges;
		localChanges = [];
		var data = [id, 'changes', stagedChanges];
		return fetch(url, {
			method: 'POST',
			body: JSON.stringify(data),
		}).catch(() => {
			localChanges = stagedChanges.concat(localChanges);
			stagedChanges = [];
			sendChanges();
		});
	}
}, 500);

var applyChanges = function(changes) {
	var change;

	var selection = [el.selectionStart, el.selectionEnd, el.selectionDirection];
	var text = el.value;
	var myChanges = [].concat(stagedChanges, localChanges);

	for (var i = myChanges.length - 1; i >= 0; i--) {
		change = myChanges[i];
		text = diff.apply(text, [change[0], change[1], change[3], change[2]], selection);
	}

	for (change of changes) {
		text = diff.apply(text, change, selection);
	}

	for (change of myChanges) {
		text = diff.apply(text, change, selection);
	}

	if (text !== el.value) {
		var scrollTop = el.scrollTop;
		el.value = text;
		el.selectionStart = selection[0];
		el.selectionEnd = selection[1];
		el.selectionDirection = selection[2];
		requestAnimationFrame(function() {
			el.scrollTop = scrollTop;
		});
		old = text;
	}
};

var handleMessage = function(msg) {
	if (msg[1] === 'changes') {
		if (msg[0] === id) {
			stagedChanges = [];
		} else {
			applyChanges(msg[2]);
		}
	}
};

var optimize = function(lastEventId) {
	var change = diff.diff('', el.value, 3);
	var data = [id, 'changes', [change]];
	fetch(url, {
		method: 'PUT',
		body: JSON.stringify(data),
		headers: {'Last-Event-ID': lastEventId},
	});
};

el.addEventListener('input', function() {
	var change = diff.diff(old, el.value, 3);
	diff.pushChange(localChanges, change);
	old = el.value;
	sendChanges();
});

window.addEventListener('offline', function() {
	el.readOnly = true;
});

var evtSource = new EventSource(url);
evtSource.onopen = function() {
	el.readOnly = false;
};
evtSource.onmessage = function(event) {
	if (!el.readOnly) {
		handleMessage(JSON.parse(event.data));

		if (Math.random() < 0.05) {
			optimize(event.lastEventId);
		}
	}
};
