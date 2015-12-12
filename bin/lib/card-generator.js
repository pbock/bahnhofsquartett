'use strict';

const PDFDocument = require('pdfkit');
const pr = require('path').resolve;

const findImage = require('./find-image');

const BLEED = 3
const WIDTH = 170 + 2 * BLEED;
const HEIGHT = 255 + 2 * BLEED;
const MARGIN = 10 + 2 * BLEED;
const LINE_HEIGHT = 14;

const VERKEHRSROT = [ 0, 100, 100, 10 ];
const LICHTGRAU = [ 0, 0, 0, 20 ];
const WHITE = [ 0, 0, 0, 0 ];
const BLACK = [ 0, 0, 0, 100 ];

function makePDF(card) {
  let doc = new PDFDocument({ size: 'a4', margin: 15 });
  let i = 0;
  return {
    doc: doc,
    add: (card) => new Promise((resolve, reject) => {
      let pageX = MARGIN + ((i / 3 | 0) % 3) * (WIDTH + MARGIN);
      let pageY = MARGIN + (i % 3) * (HEIGHT + MARGIN);

      findImage(card).then(image => {
        let y = 0;
        doc.rect(pageX + 0, pageY + 0, WIDTH, HEIGHT / 2.5);
        y = HEIGHT / 2.2;

        // Declare fonts
        doc.font(pr(__dirname, '../../src/fonts/FiraSans-Light.ttf'), 'Light');
        doc.font(pr(__dirname, '../../src/fonts/FiraSans-Book.ttf'), 'Regular');

        let placeholderAspectRatio = WIDTH / (HEIGHT / 2.5);

        if (image) {
          // Find out which dimension we need to pass to PDFKit to make sure
          // that the image covers its placeholder.
          let imageSize;
          let imageAspectRatio = image.dimensions.width / image.dimensions.height;
          if (imageAspectRatio > placeholderAspectRatio) {
            imageSize = { height: HEIGHT / 2.5 };
          } else {
            imageSize = { width: WIDTH };
          }
          doc.save()
            .clip()
            .image(image.image, pageX + 0, pageY + 0, imageSize)
            .restore();

          // Attribution
          doc.fontSize(5)
            .fill(WHITE)
            .text(
              image.metadata.Author || image.metadata.url,
              pageX + MARGIN / 2 + 2,
              pageY + HEIGHT / 2.5 - 8);
        } else {
          doc.fill(LICHTGRAU);
        }

        doc.moveTo(pageX + 0, pageY + HEIGHT / 2.5 + 4)
          .lineTo(pageX + WIDTH, pageY + HEIGHT / 2.5 + 4)
          .lineWidth(3)
          .strokeOpacity(1)
          .stroke(VERKEHRSROT);

        doc.fill(BLACK);
        doc.circle(pageX + WIDTH - MARGIN - 5, pageY + MARGIN + 7, 10).fill(BLACK);
        doc.fontSize(12);
        doc.font('Light').fill(WHITE).text(card.id, pageX - 2 * (MARGIN + BLEED) + WIDTH - 23, pageY + MARGIN, { width: 80, align: 'center' });

        doc.fontSize(9);
        doc.font('Regular').fill(BLACK).text(card.name, pageX + MARGIN, pageY + y);
        y += LINE_HEIGHT * 1.5;

        doc.fontSize(8);
        card.values.forEach(category => {
          doc.font('Light').text(category.name, pageX + MARGIN, pageY + y);
          doc.font('Regular').text(category.value, pageX + MARGIN, pageY + y, { width: WIDTH - 2 * MARGIN, align: 'right' });
          y += LINE_HEIGHT;
        });

        doc.lineWidth(0.5);

        // Draw cutting marks
        doc.moveTo(pageX + BLEED, pageY - 4)
          .lineTo(pageX + BLEED, pageY + BLEED)
          .lineTo(pageX - 4, pageY + BLEED)
          .stroke();
        doc.moveTo(pageX - BLEED + WIDTH, pageY - 4)
          .lineTo(pageX - BLEED + WIDTH, pageY + BLEED)
          .lineTo(pageX + WIDTH + 4, pageY + BLEED)
          .stroke();
        doc.moveTo(pageX - BLEED + WIDTH, pageY + BLEED + HEIGHT + 4)
          .lineTo(pageX - BLEED + WIDTH, pageY + HEIGHT)
          .lineTo(pageX + WIDTH + 4, pageY + HEIGHT)
          .stroke();
        doc.moveTo(pageX + BLEED, pageY + BLEED + HEIGHT + 4)
          .lineTo(pageX + BLEED, pageY + HEIGHT)
          .lineTo(pageX - 4, pageY + HEIGHT)
          .stroke();

        i++;
        if (i % 9 === 0) {
          doc.addPage();
          doc.rect(0, 0, 595, 842).fill(VERKEHRSROT);
          doc.addPage();
        }

        resolve();
      }).catch(reject);
    }),
  }
}

module.exports = makePDF;
