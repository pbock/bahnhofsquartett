'use strict';

const PDFDocument = require('pdfkit');
const pr = require('path').resolve;

let WIDTH = 170;
let HEIGHT = 255;
let MARGIN = 10;
let LINE_HEIGHT = 14;

function makePDF(card) {
  let doc = new PDFDocument({ size: [ WIDTH, HEIGHT ], margin: MARGIN });
  let y = 0;
  doc.rect(0, 0, WIDTH, HEIGHT / 2.5);
  y = HEIGHT / 2.2;

  doc.fill([ 0, 0, 0, 20 ]);

  doc.fill([ 0, 0, 0, 100 ]);
  doc.font(pr(__dirname, '../../src/fonts/FiraSans-Book.ttf'));
  doc.fontSize(9);
  doc.text(card.name, MARGIN, y);
  y += LINE_HEIGHT;

  doc.fontSize(8);
  card.values.forEach(category => {
    doc.text(category.name, MARGIN, y, { continued: true });
    doc.text(category.value, { align: 'right' });
    y += LINE_HEIGHT;
  });

  doc.end();
  return doc;
}

module.exports = makePDF;
