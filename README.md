# Bahnhofsquartett

Bahnhofsquartett is an automatically-generated "Quartett" game based on
open data from Deutsche Bahn and Wikimedia Commons.

![Bahnhofsquartett](https://raw.github.com/pbock/bahnhofsquartett/master/src/Bahnhofsquartett.jpg)

Most of the code came to life between 11pm and 5am at #dbhackathon in December
2015, and it certainly looks the part. Still, if you're brave enough to want
to customise it, the values on the cards are generated in `bin/index.js` and
the drawing happens in `bin/lib/card-generator.js`.

## Requirements

node.js >= 5.0.0 (might work with >=4.0.0, but not tested)

## Installing

```sh
npm install
```

## Building

```sh
npm run build
```

## Licence

The code is licensed under the [MIT License](LICENSE.md).

[Fira Sans](https://github.com/mozilla/Fira) is Copyright 2012-2015,
The Mozilla Foundation and Telefonica S.A.; licensed under the [SIL Open Font
License](https://github.com/mozilla/Fira/blob/master/LICENSE).

The data was extracted from the data sets published at
[data.deutschebahn.com](http://data.deutschebahn.com), licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/),
as well as data from the OpenStreetMap contributors,
licensed under the [ODbL](http://opendatacommons.org/licenses/odbl/).
