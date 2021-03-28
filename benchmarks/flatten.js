const faker = require('faker');
const pull = require('../');

const bench = require('fastbench')

faker.seed(24849320);
function getRandomValues(nestLevel) {
  return Array(faker.datatype.number(1000) + 1)
  .fill(1)
  .map(e => faker.datatype.number());
}

const N=100;
const randomValues = Array(N)
  .fill(1)
  .map(e => pull.values(
    new Array(500)
    .fill(1)
    .map(e => pull.values(getRandomValues()))
  ));

let i = 0;
const run = bench([
  function flattenBench (done) {
    pull(
      randomValues[i++],
      pull.flatten(),
      pull.drain()
    );
    done();
  }]
, N)

var heap = process.memoryUsage().heapUsed
run(function () {
  console.log((process.memoryUsage().heapUsed - heap)/N)
})

