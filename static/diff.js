var _apply = function(text, [pos, before, after], selection) {
	if (selection) {
		var d = diff(before, after, 0);
		if (pos + d[0] <= selection[0]) {
			selection[0] += after.length - before.length;
		}
		if (pos + d[0] <= selection[1]) {
			selection[1] += after.length - before.length;
		}
	}
	return text.slice(0, pos) + after + text.slice(pos + before.length);
};

export var apply = function(text, [start, end, before, after], selection) {
	if (text.slice(start).startsWith(before)) {
		return _apply(text, [start, before, after], selection);
	}

	var best = -1;
	var bestDist = Infinity;
	for (var i = text.indexOf(before); i !== -1; i = text.indexOf(before, i + 1)) {
		var dist = Math.abs(i - start);
		if (dist < bestDist) {
			best = i;
			bestDist = dist;
		} else {
			break;
		}
	}
	if (best !== -1) {
		return _apply(text, [best, before, after], selection);
	}
	return text;
};

export var diff = function(text1, text2, ctx) {
	var start = 0;
	var end = 0;

	while (start < text1.length && start < text2.length && text1[start] === text2[start]) {
		start += 1;
	}
	while (start + end < text1.length && start + end < text2.length && text1[text1.length - 1 - end] === text2[text2.length - 1 - end]) {
		end += 1;
	}

	start = Math.max(0, start - ctx);
	end = Math.max(0, end - ctx);

	return [start, end, text1.slice(start, -end || Infinity), text2.slice(start, -end || Infinity)];
};

export var merge = function([start1, end1, before1, after1], [start2, end2, before2, after2]) {
	if (start1 + after1.length + end1 === start2 + before2.length + end2) {
		if (start2 >= start1 && after1.slice(start2 - start1).startsWith(before2)) {
			var after = _apply(after1, [start2 - start1, before2, after2]);
			return [[start1, end1, before1, after]];
		}

		if (start1 >= start2 && before2.slice(start1 - start2).startsWith(after1)) {
			var before = _apply(before2, [start1 - start2, after1, before1]);
			return [[start2, end2, before, after2]];
		}
	}

	return [
		[start1, end1, before1, after1],
		[start2, end2, before2, after2],
	];
};

export var pushChange = function(changes, change) {
	if (!changes.length) {
		changes.push(change);
	} else {
		var last = changes.pop();
		for (var m of merge(last, change)) {
			changes.push(m);
		}
	}
};
