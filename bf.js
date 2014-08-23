function Script(source, input) {
	this.source = source;
	this.data = [];
	this.input = input || "";
	this.output = "";
	this.dp = 0;
	this.ip = 0;
	this.inputp = 0;
	this.cs = [];
	this.runing = false;
	this.timeout = null;
	this.errorstate = 0;
	this.steps = 0;
	this.watchdog = undefined;
}

Script.prototype.onstart = function () {
}

Script.prototype.onerror = function (e) {
	this.errorstate = e;
	this.terminate();
}

Script.prototype.onend = function () {
}

Script.prototype.onstep = function () {
}

Script.prototype.terminate = function () {
	this.running = false;
	if (this.timeout !== null) {
		window.clearTimeout(this.timeout);
	}
	this.onend();
}

Script.prototype.execute = function (continuing) {
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
			this.timeout = window.setTimeout(function(){self.execute();}, 0);
		} else {
			this.onerror(new Error("Watchdog exceeded"));
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
				this.onerror(e);
			}
			break;
		case '[':
			if (!this.data[this.dp]) {
				var nextOp = this.source[this.ip++];
				var depth = 1;
				while (depth > 0) {
					if (this.ip >= this.source.length)
						this.onerror(new SyntaxError("Unmatched [ at "+this.ip));
					nextOp = this.source[this.ip++];
					switch (nextOp) {
						case '[': depth++; break;
						case ']': depth--; break;
					}					
				}				
			} else {
				this.cs.push(this.ip);
			}			
			break;
		case ']':
			if (this.cs.length == 0)
				this.onerror(new SyntaxError("Unmatched ] at "+this.ip));
			if (!this.data[this.dp]) {
				this.cs.pop();				
			} else {
				this.ip = this.cs.pop();
				this.cs.push(this.ip);
			}
			break;
	}	

	if (this.dp < 0) {
		this.onerror(new RangeError("Unmatched [ at "+this.ip));
	}

	this.ip++;
	

}
