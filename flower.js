function Fruit(input, output) {
  this.input = input;
  this.output = output;
}

function Flower(genFruit, fitness) {
  this.genFruit = genFruit;
  this.fitness = fitness;
}

Flower.prototype.test = function (script) {
  var fruit = this.genFruit();
  var results = script.execute(fruit.input);
  return this.fitness(results, fruit.output);
}

var adder = new Flower(function () {
  var a = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return new Fruit([a, b], [a+b]);
}, function (results, output) {
  return output[0] - results.output[0] / results.time;
});
