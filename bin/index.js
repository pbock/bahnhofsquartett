'use strict';

const async = require('async');
const pr = require('path').resolve;
const fs = require('fs');
const _ = require('lodash');

const pdf = require('./lib/card-generator')();

const SRC_DIR = pr(__dirname, '../src');
const DATA_DIR = pr(SRC_DIR, 'data');
const DEST_DIR = pr(__dirname, '../dist');

const ALPHABET = 'ABCDEFGHIJKMNOPQRSTUVWXYZ';

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
    find: n => _(n.elevators).map(e => +e.year).filter().min(),
    filter: n => n.elevators.length,
    format: n => n === Infinity ? '—' : n,
  },
  {
    name: 'Größte Aufzugskabine',
    find: n => _(n.elevators).map(e => e.cabin.width * e.cabin.depth * e.cabin.height / 1e9).filter(n => n < 100).max(),
    reverse: true,
    format: n => (n > 0) ? n.toFixed(1).replace('.', ',') + ' m³' : '—',
  },
  {
    name: 'Anschluss an eine Fähre',
    find: n => n.ferryNearby,
    reverse: true,
    format: n => n ? 'ja' : 'nein',
  }
  /*{
    name: 'Höchster Aufzugschacht',
    find: n => _(n.elevators).map(e => +e.wellHeight).filter().max(),
    reverse: true,
    format: n => n === -Infinity ? '—' : n.toFixed(2).replace('.', ',') + ' m',
  },*/
];

let cards = new Set();

let potentialCards = categories.map(category => {
  let filter = category.filter || (() => true);
  let results = _(stations).filter(filter).sortBy(category.find);
  if (category.reverse) results = results.reverse();
  return results.value();
});

while (cards.size < potentialCards.length * 4) {
  let group = cards.size % potentialCards.length;
  let card = potentialCards[group].shift();
  cards.add(card);
}

let jannowitz = _.findWhere(stations, { name: 'Jannowitzbrücke' });
cards.add(jannowitz);
cards.delete(_.findWhere(stations, { name: 'Anwanden' }));

cards = _(Array.from(cards)).sortBy(s => s.state).value();

let i = 0;
async.eachLimit(cards, 1, (station, cardDone) => {
  let cardID = ALPHABET[i / 4 | 0] + (i % 4 + 1);
  console.log(cardID, station.name);
  let card = {
    name: station.name,
    id: cardID,
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
  pdf.end();
  pdf.doc.pipe(fs.createWriteStream(pr(DEST_DIR, 'output.pdf')));
});
