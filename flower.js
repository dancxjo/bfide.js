function Flower(genFruit) {
  this.genFruit = genFruit;
}

var adder = new Flower(function () {
  var a = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return [[a, b], [a+b]];
});
