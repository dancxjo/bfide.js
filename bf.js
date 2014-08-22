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
}

Script.prototype.execute = function () {
	if (this.ip >= this.source.length) {
		this.running = false;
		if (this.timeout !== null) {
			window.clearTimeout(this.timeout);
		}
	} else {
		this.running = true;
		var self = this;
		this.step();
		this.timeout = window.setTimeout(function(){self.execute();}, 0);
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
			this.data[this.dp] = this.input[this.inputp++].charCodeAt(0);			
			break;
		case '[':
			if (!this.data[this.dp]) {
				console.log("Skipping this loop");
				var nextOp = this.source[this.ip++];
				var depth = 1;
				while (depth > 0) {
					if (this.ip >= this.source.length)
						throw new SyntaxError("Unmatched [ at "+this.ip);
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
				throw new SyntaxError("Unmatched ] at "+this.ip);
			if (!this.data[this.dp]) {
				this.cs.pop();				
			} else {
				this.ip = this.cs.pop();
				this.cs.push(this.ip);
			}
			break;
	}	
	this.ip++;	
}
