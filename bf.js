function Script(source, input) {
	this.source = source;
	this.data = [];
	this.input = input || "";
	this.output = "";
	this.dp = 0;
	this.ip = 0;
	this.inputp = 0;
	this.cs = [];
	this.running = false;
	this.timeout = null;
	this.errorstate = 0;
	this.steps = 0;
	this.watchdog = undefined;
	this.delay = 0;
	this.wrap = true;
}

Script.prototype.onstart = function () {
}

Script.prototype.throw = function (e) {
	this.errorstate = e;
	//this.terminate();
	this.onerror(e);
}

Script.prototype.onerror = function (e) {
}

Script.prototype.onend = function () {
}

Script.prototype.onstep = function () {
}

Script.prototype.getFitness = function () {
	return;
}

Script.prototype.makeEgg = function (that) {	
	this.mateCount++;
	that.mateCount++;
	
	var src = "";
		
	for (var n = 0; n < Math.max(this.source.length, that.source.length); n++) {
		var c = this.source.charAt(n); 
		var d = that.source.charAt(n);
		var f = "[].,+-<>".charAt(Math.floor(Math.random() * 9));
		var e = Math.random() > 0.9 ? f : Math.random() > 0.5 ? c : d;
		src += e !== undefined ? e : "";
	}
	
	return src;
}

Script.prototype.terminate = function () {
	this.running = false;
	if (this.timeout !== null) {
		window.clearTimeout(this.timeout);
	}
	this.onend();
}

Script.prototype.execute = function (continuing) {
	/*
	var il;
	if ((il = this.source.search("[]")) > -1) {
		console.log("Infinite loop detected");
		this.onerror(new Error("Infinite loop at " + il));
		this.terminate();
	}
	*/
	if (this.ip >= this.source.length || this.errorstate) {
		this.terminate();
	} else {
		if (!this.running) {
			if (!continuing) {
				this.ip = 0;
				this.starttime = window.performance.now();
				this.onstart();
			}
			this.running = true;
		}
		
		this.step();
		this.steps++;
		this.runtime = window.performance.now() - this.starttime;
		this.onstep();
		
		if (!this.watchdog || this.steps <= this.watchdog) {
			var self = this;
			this.timeout = window.setTimeout(function(){self.execute();}, this.delay);
		} else {
			this.throw(new Error("Watchdog exceeded"));
			this.terminate();
		}
	}
}

Script.prototype.rawExecute = function () {
	var n = 0;
	var start = window.performance.now();
	while (this.ip < this.source.length) {		
		this.step();
		n++;
		console.log("Step " + n + ": " + JSON.stringify(this));
	}
	return [window.performance.now() - start, n, this.output];
}

Script.prototype.highlightCode = function (el, attr, offset) {
	if (!el) {
		el = "span";
		attr = {class: "bg-primary"};
	}
	var s = "";
	var h = this.source.substr(0, this.ip + offset);
	var m = this.source[this.ip + offset];
	var t = this.source.substr(this.ip + 1 + offset);
	
	s += h ? h : "";
	s += "<" + el;
	for (var key in attr) {
		s += " " + key + "=\"" + attr[key] + "\"";
	}
	s += ">";
	s += m ? m : "";
	s += "</" + el + ">";
	s += t ? t : "";
	return s;
}

Script.prototype.step = function () {	
	var op = this.source[this.ip];
	
	if (!this.data[this.dp]) this.data[this.dp] = 0;
	
	switch (op) {
		case '>':
			this.dp++;									
			break;		
		case '<':
			this.dp--;						
			break;
		case '+':			
			this.data[this.dp]++;			
			break;
		case '-':			
			this.data[this.dp]--;			
			break;
		case '.':
			this.output += String.fromCharCode(this.data[this.dp]);			
			break;
		case ',':
			try {
				var v = 0;
				if (this.inputp < this.input.length) {
					v = this.input[this.inputp++].charCodeAt(0);
				}

				this.data[this.dp] = v;			
			} catch (e) {
				this.throw(e);
			}
			break;
		case '[':
			if (!this.data[this.dp]) {
				var origp = this.ip;
				var nextOp = this.source[this.ip++];
				var depth = 1;
				while (depth > 0 && this.ip < this.source.length) {
					
					nextOp = this.source[this.ip++];
					switch (nextOp) {
						case '[': depth++; break;
						case ']': depth--; break;
					}
				}	
				if (this.ip >= this.source.length && depth > 0)
					this.throw(new SyntaxError("Unmatched [ at "+origp));				
			} else {
				this.cs.push(this.ip);
			}			
			break;
		case ']':
			if (this.cs.length == 0)
				this.throw(new SyntaxError("Unmatched ] at "+this.ip));
			if (!this.data[this.dp]) {
				this.cs.pop();				
			} else {
				this.ip = this.cs.pop();
				this.cs.push(this.ip);
			}
			break;
	}	
	
	if (this.dp < 0) {
		this.throw(new RangeError("Out of data bounds at "+this.ip));
	}

	if (this.wrap) {
		while (this.data[this.dp] > 255) {
			this.data[this.dp] -= 256;
		}
		while (this.data[this.dp] < 0) {
			this.data[this.dp] += 256;
		}
	}
	
	this.ip++;
	

}

function randomSource() {
	var len = Math.random() * 255;
	var chars = "[]<>+-.,";
	var script = "";
	for (var i = 0; i < len; i++) {
		script += chars[Math.floor(Math.random()*chars.length)];
	}
	return script;
}
