import $ from 'jquery';
const d3 = require('d3');

// Color related utility functions go in this object
export const bnbColors = [
  '#ff5a5f', // rausch
  '#7b0051', // hackb
  '#007A87', // kazan
  '#00d1c1', // babu
  '#8ce071', // lima
  '#ffb400', // beach
  '#b4a76c', // barol
  '#ff8083',
  '#cc0086',
  '#00a1b3',
  '#00ffeb',
  '#bbedab',
  '#ffd266',
  '#cbc29a',
  '#ff3339',
  '#ff1ab1',
  '#005c66',
  '#00b3a5',
  '#55d12e',
  '#b37e00',
  '#988b4e',
];

const spectrums = {
  blue_white_yellow: [
    '#00d1c1',
    'white',
    '#ffb400',
  ],
  fire: [
    'white',
    'yellow',
    'red',
    'black',
  ],
  white_black: [
    'white',
    'black',
  ],
  black_white: [
    'black',
    'white',
  ],
};

const greenspectrum = [
    // '#55d12e',
    '#32CD32'
   /* '#3F9526',
    '#7B9530',
    '#5A7129',
    '#5F9129',
    '#59A12e',
    '#45b123'*/
];

const yellowspectrum = [
    /*'#ffd266',
    '#f3c266',
    '#ffdfa6',*/
    '#FFFF33'
    /*'#eed2b6',
    '#ffd999'*/
];

const orangespectrum = [
    // '#ffb400',
    '#FFA500'
    /*'#fac400',
    '#efa910',
    '#ff8400',
    '#fe8840',*/
];

export const category21 = (function () {
  // Color factory
  const seen = {};
  return function (s) {
    if (!s) {
      return;
    }
    let stringifyS = String(s);
    // next line is for superset series that should have the same color
    stringifyS = stringifyS.replace('---', '');
    if (seen[stringifyS] === undefined) {
      seen[stringifyS] = Object.keys(seen).length;
    }
    /* eslint consistent-return: 0 */
    return bnbColors[seen[stringifyS] % bnbColors.length];
  };
}());

export const okspectrumcolors = (function () {
    // Color factory
    const seen = {};
    return function (s) {
        if (!s) {
            return;
        }
        let stringifyS = String(s);
        // next line is for superset series that should have the same color
        stringifyS = stringifyS.replace('---', '');
        if (seen[stringifyS] === undefined) {
            seen[stringifyS] = Object.keys(seen).length;
        }
        return greenspectrum[seen[stringifyS] % greenspectrum.length];
    };
}());

export const warningspectrumcolors = (function () {
    // Color factory
    const seen = {};
    return function (s) {
        if (!s) {
            return;
        }
        let stringifyS = String(s);
        // next line is for superset series that should have the same color
        stringifyS = stringifyS.replace('---', '');
        if (seen[stringifyS] === undefined) {
            seen[stringifyS] = Object.keys(seen).length;
        }
        return yellowspectrum[seen[stringifyS] % yellowspectrum.length];
    };
}());

export const errorspectrumcolors = (function () {
    // Color factory
    const seen = {};
    return function (s) {
        if (!s) {
            return;
        }
        let stringifyS = String(s);
        // next line is for superset series that should have the same color
        stringifyS = stringifyS.replace('---', '');
        if (seen[stringifyS] === undefined) {
            seen[stringifyS] = Object.keys(seen).length;
        }
        return orangespectrum[seen[stringifyS] % orangespectrum.length];
    };
}());

export const colorScalerFactory = function (colors, data, accessor) {
  // Returns a linear scaler our of an array of color
  if (!Array.isArray(colors)) {
    /* eslint no-param-reassign: 0 */
    colors = spectrums[colors];
  }
  let ext = [0, 1];
  if (data !== undefined) {
    ext = d3.extent(data, accessor);
  }
  const points = [];
  const chunkSize = (ext[1] - ext[0]) / colors.length;
  $.each(colors, function (i) {
    points.push(i * chunkSize);
  });
  return d3.scale.linear().domain(points).range(colors);
};
