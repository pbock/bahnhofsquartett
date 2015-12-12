'use strict';

const PDFDocument = require('pdfkit');
const cheerio = require('cheerio');
const pr = require('path').resolve;
const fs = require('fs');

const WIDTH = 170;
const HEIGHT = 255;
const MARGIN = 10;
const LINE_HEIGHT = 14;

const VERKEHRSROT = [ 0, 100, 100, 10 ];
const LICHTGRAU = [ 0, 0, 0, 20 ];
const WHITE = [ 0, 0, 0, 0 ];
const BLACK = [ 0, 0, 0, 100 ];

let $ = cheerio.load(fs.readFileSync(pr(__dirname, '../../src/backside.svg')));
function drawBackside(doc) {
  let first = true;
  $('path').each((i, path) => {
    let d = $(path).attr('d');
    doc.path(d);
    if (first) {
      first = false;
      doc.fill(VERKEHRSROT);
    } else {
      doc.strokeOpacity(0.5).lineWidth(0.5).stroke(WHITE);
    }
  });
  $('line').each((i, line) => {
    let $line = $(line);
    doc.moveTo($line.attr('x1'), $line.attr('y1'))
      .lineTo($line.attr('x2'), $line.attr('y2'))
      .strokeOpacity(0.5).lineWidth(0.5).stroke(WHITE);
  });
}

function makePDF(card) {
  let doc = new PDFDocument({ size: [ WIDTH, HEIGHT ], margin: MARGIN });
  let y = 0;
  doc.rect(0, 0, WIDTH, HEIGHT / 2.5);
  y = HEIGHT / 2.2;

  doc.fill(LICHTGRAU);

  doc.moveTo(0, HEIGHT / 2.5 + 4)
    .lineTo(WIDTH, HEIGHT / 2.5 + 4)
    .lineWidth(3)
    .strokeOpacity(1)
    .stroke(VERKEHRSROT);

  doc.fill(BLACK);
  doc.font(pr(__dirname, '../../src/fonts/FiraSans-Light.ttf'), 'Light');
  doc.font(pr(__dirname, '../../src/fonts/FiraSans-Book.ttf'), 'Regular');
  doc.fontSize(12);
  doc.font('Light').fill(WHITE).text(card.id, MARGIN, MARGIN, { align: 'right' });

  doc.fontSize(9);
  doc.font('Regular').fill(BLACK).text(card.name, MARGIN, y);
  y += LINE_HEIGHT * 1.5;

  doc.fontSize(8);
  card.values.forEach(category => {
    doc.font('Light').text(category.name, MARGIN, y, { continued: true });
    doc.font('Regular').text(category.value, { align: 'right' });
    y += LINE_HEIGHT;
  });

  doc.addPage();
  drawBackside(doc);

  doc.end();
  return doc;
}

module.exports = makePDF;
