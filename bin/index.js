'use strict';

const pr = require('path').resolve;
const fs = require('fs');
const _ = require('lodash');

const SRC_DIR = pr(__dirname, '../src');
const DATA_DIR = pr(SRC_DIR, 'data');

let stations = JSON.parse(fs.readFileSync(pr(DATA_DIR, 'stations.json')));
let categories = [
  {
    name: 'Anzahl der Bahnsteige',
    find: station => station.platforms.length,
    reverse: true,
  },
  {
    name: 'Längster Bahnsteig',
    find: station => _(station.platforms).map('length').max(),
    reverse: true,
  },
  {
    name: 'Höchster Bahnsteig',
    find: station => _(station.platforms).map('height').max(),
    reverse: true,
  },
  {
    name: 'Kategorie',
    find: _.property('category'),
  },
];

let cards = new Set();

let potentialCards = categories.map(category => {
  let results = _(stations).sortBy(category.find);
  if (category.reverse) results = results.reverse();
  return results.value();
});

while (cards.size < 36) {
  let card = potentialCards[cards.size % potentialCards.length].shift();
  cards.add(card);
}

for (let card of cards) {
  console.log('\n' + card.name);
  categories.forEach(category => {
    console.log(`${ category.name }: ${ category.find(card) }`);
  });
}
