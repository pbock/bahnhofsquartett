'use strict';

const sizeOf = require('image-size');
const request = require('request');
const cheerio = require('cheerio');
const YAML = require('js-yaml');
const slug = require('slug');
const pr = require('path').resolve;
const fs = require('fs');

const DATA_DIR = pr(__dirname, '../../src/data');
let images = YAML.safeLoad(fs.readFileSync(pr(DATA_DIR, 'images.yaml')));

const CACHE_DIR = pr(__dirname, '../../.cache');
try {
  fs.mkdirSync(CACHE_DIR);
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
}

function findImage(station) {
  return new Promise((resolve, reject) => {
    let name = station.name;
    let url = images[name];
    if (!url) return resolve(null);
    url = url.replace(/uselang=..&?/, 'uselang=en');
    console.log(url);

    let metadataPath = pr(CACHE_DIR, slug(name) + '.json');
    let imagePath = pr(CACHE_DIR, slug(name) + '.jpg');

    // See if we have stuff in the cache
    try {
      let imageBuffer = fs.readFileSync(imagePath);
      let metadataBuffer = fs.readFileSync(metadataPath);
      if (imageBuffer && metadataBuffer) {
        resolve({
          image: imageBuffer,
          metadata: JSON.parse(metadataBuffer),
          dimensions: sizeOf(imageBuffer),
        });
        return;
      }
    } catch (e) {
      if (e.code !== 'ENOENT') return reject(e);
      console.log('Image not found in cache');
    }

    request(url, function (error, response, body) {
      if (error || response.statusCode !== 200) {
        return reject(error);
      }
      let $ = cheerio.load(body);
      let $rows = $('.commons-file-information-table tr');
      let metadata = {};
      $rows.each((i, row) => {
        let $row = $(row);
        let key = $row.find('td:first-child').text().trim();
        let value = $row.find('td:not(:first-child)').text().trim();
        metadata[key] = value;
      });
      metadata.url = url;
      fs.writeFileSync(metadataPath, JSON.stringify(metadata));

      console.log('Fetching image from %s', url);
      let imageUrl = $('.fullImageLink a').attr('href');
      request(imageUrl, { encoding: null }, function (error, res, buffer) {
        if (error || res.statusCode !== 200) {
          return reject(error);
        }
        console.log('Fetched image from %s', url);
        let imageBuffer = buffer;
        fs.writeFileSync(imagePath, buffer);
        resolve({
          image: imageBuffer,
          metadata: metadata,
          dimensions: sizeOf(imageBuffer),
        });
      });
    });
  });
}

module.exports = findImage;
