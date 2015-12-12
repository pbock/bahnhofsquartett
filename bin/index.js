'use strict';

const async = require('async');
const pr = require('path').resolve;
const fs = require('fs');
const _ = require('lodash');

const pdf = require('./lib/card-generator')();

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
    format: n => n.toFixed(2).replace('.', ',') + ' m',
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
  {
    name: 'Anzahl der Aufzüge',
    find: n => n.elevators.length,
    reverse: true,
  },
  {
    name: 'Ältester Aufzug',
    find: n => _(n.elevators).map(e => +e.year).min(),
    reverse: true,
    format: n => n === Infinity ? '—' : n,
  },
  {
    name: 'Neuester Aufzug',
    find: n => _(n.elevators).map(e => +e.year).max(),
    reverse: true,
    format: n => n === -Infinity ? '—' : n,
  },
  {
    name: 'Höchster Aufzugschacht',
    find: n => _(n.elevators).map(e => +e.wellHeight).filter().max(),
    reverse: true,
    format: n => n === -Infinity ? '—' : n.toFixed(2).replace('.', ',') + ' m',
  },
];

let cards = new Set();

let potentialCards = categories.map(category => {
  let results = _(stations).sortBy(category.find);
  if (category.reverse) results = results.reverse();
  return results.value();
});

while (cards.size < potentialCards.length * 4) {
  let card = potentialCards[cards.size % potentialCards.length].shift();
  cards.add(card);
}

cards = Array.from(cards);

let i = 0;
async.eachLimit(cards, 1, (station, cardDone) => {
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

  pdf.add(card).then(cardDone)
  .catch((err) => {
    console.error(err);
    cardDone(err);
  });
  i++;
}, function () {
  pdf.doc.end();
  pdf.doc.pipe(fs.createWriteStream(pr(DEST_DIR, 'output.pdf')));
});
