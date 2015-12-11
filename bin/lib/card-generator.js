'use strict';

const PDFDocument = require('pdfkit');
const pr = require('path').resolve;

const WIDTH = 170;
const HEIGHT = 255;
const MARGIN = 10;
const LINE_HEIGHT = 14;

const VERKEHRSROT = [ 0, 100, 100, 10 ];
const WHITE = [ 0, 0, 0, 0 ];

function makePDF(card) {
  let doc = new PDFDocument({ size: [ WIDTH, HEIGHT ], margin: MARGIN });
  let y = 0;
  doc.rect(0, 0, WIDTH, HEIGHT / 2.5);
  y = HEIGHT / 2.2;

  doc.fill([ 0, 0, 0, 20 ]);

  doc.moveTo(0, HEIGHT / 2.5 + 4)
    .lineTo(WIDTH, HEIGHT / 2.5 + 4)
    .lineWidth(3)
    .stroke(VERKEHRSROT);

  doc.fill([ 0, 0, 0, 100 ]);
  doc.font(pr(__dirname, '../../src/fonts/FiraSans-Light.ttf'), 'Light');
  doc.font(pr(__dirname, '../../src/fonts/FiraSans-Book.ttf'), 'Regular');
  doc.fontSize(12);
  doc.font('Light').fill(WHITE).text(card.id, MARGIN, MARGIN, { align: 'right' });

  doc.fontSize(9);
  doc.font('Regular').text(card.name, MARGIN, y);
  y += LINE_HEIGHT * 1.5;

  doc.fontSize(8);
  card.values.forEach(category => {
    doc.font('Light').text(category.name, MARGIN, y, { continued: true });
    doc.font('Regular').text(category.value, { align: 'right' });
    y += LINE_HEIGHT;
  });

  doc.end();
  return doc;
}

module.exports = makePDF;
