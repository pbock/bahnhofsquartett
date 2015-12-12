'use strict';

const pr = require('path').resolve;
const fs = require('fs');
const _ = require('lodash');

const makePDF = require('./lib/card-generator');

const SRC_DIR = pr(__dirname, '../src');
const DATA_DIR = pr(SRC_DIR, 'data');
const DEST_DIR = pr(__dirname, '../dist');

try {
  fs.mkdirSync(DEST_DIR);
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
}

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
    format: n => n.toFixed(1).replace('.', ',') + ' m',
    reverse: true,
  },
  {
    name: 'Höchster Bahnsteig',
    find: station => _(station.platforms).map('height').max(),
    format: n => n.toFixed(2).replace('.', ',') + ' m',
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

while (cards.size < 32) {
  let card = potentialCards[cards.size % potentialCards.length].shift();
  cards.add(card);
}

let i = 0;
for (let station of cards) {
  console.log(station.name);
  let card = {
    name: station.name,
    id: 'ABCDEFGH'[i / 4 | 0] + (i % 4 + 1),
    values: [],
  };
  categories.forEach(category => {
    let format = category.format || _.identity;
    card.values.push({ name: category.name, value: format(category.find(station)) });
  });

  makePDF(card).pipe(fs.createWriteStream(pr(DEST_DIR, card.name + '.pdf')));
  i++;
}
