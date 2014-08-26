function Fruit(input, output) {
  this.input = input;
  this.output = output;
}

function Flower(genFruit, fitness) {
  this.genFruit = genFruit;
  this.fitness = fitness;
}

Flower.prototype.test = function (script) {
	var flower = this;
  var fruit = this.genFruit();
  script.input = fruit.input;    
  
  script.getFitness = function () {  	
  	return flower.fitness(this, fruit);  	
  };
  
  script.execute();  
}

var adder = new Flower(function () {
	var a = 255;
	var b = 255;
	
	while (a+b > 255) {
	  a = Math.floor(Math.random() * 255);
	  b = Math.floor(Math.random() * 255);
	}		
	
  return new Fruit(String.fromCharCode(a) + String.fromCharCode(b), String.fromCharCode(a+b));
}, function (script, fruit) {
  var fitness = 0;
  
  if (!script.errorstate && !script.running) {
  	fitness += 10;
  }
  
  if (script.output.length == fruit.output.length) {
  	fitness += 50;
  }
  
  if (script.output.charAt(0) == String.fromCharCode(fruit.output[0])) {
  	fitness += 100;
  }
    
  if (fitness >= 160) {
  	console.log("Found perfect script " + script.source);
  }
  
  return fitness;
});

var helloFlower = new Flower(function () {	
  return new Fruit("", "Hello World");
}, function (script, fruit) {
  var fitness = 0;
    
	if (!script.errorstate && !script.running) {
		fitness += 15;
	}
	
	fitness += script.output.length / 10;	
	
	for (var i in fruit.output) {
		var c = fruit.output[i];
		var s = fruit.output.slice(0, i);
		
		if (script.output.search(c) > -1) {
			fitness += 10;
		}
		
		if (s.length > 1 && script.output.search(s) > -1) {
			fitness += 100;
		}
	}  
  
  return fitness;
});
