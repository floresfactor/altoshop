// var fs = require('fs');
// var globSync = require('glob').sync;
// var mkdirpSync = require('mkdirp').sync;

// const locales = ['es'];
// const enFileName = 'en.json';

// // (relative to source)
// const filePattern = './src/i18n/src/**/*.json';
// const outputDir = './src/i18n/locales/';

// // ******************************************
// // Generate EN file from raeact plugin files
// // ******************************************
// let defaultMessages = globSync(filePattern)
//   .map((filename) => fs.readFileSync(filename, 'utf8'))
//   .map((file) => JSON.parse(file))
//   .reduce((collection, descriptors) => {
//     descriptors.forEach(({ id, defaultMessage }) => {
//       if (collection.hasOwnProperty(id)) {
//         throw new Error(`Duplicate message id: ${id}`);
//       }
//       collection[id] = defaultMessage;
//     });

//     return collection;
//   }, {});
// // Create a new directory that we want to write the aggregate messages to
// // mkdirpSync(outputDir);

// // Write the 'en' translations to this directory
// fs.writeFileSync(outputDir + enFileName, `{ "en": ${JSON.stringify(defaultMessages, null, 2)} }`);

// // ******************************************
// // Generate locale translation files
// // ******************************************
// locales.forEach(locale => {
//   let translations;

//   // Read translations from file if it exists
//   if (fs.existsSync(outputDir + locale + '.json'))
//     translations = JSON.parse(fs.readFileSync(outputDir + locale + '.json', 'utf8'));

//   if (!translations)
//     translations = {};

//   if (!translations[locale])
//     translations[locale] = {};

//   Object.keys(defaultMessages).forEach(key => {
//     if (defaultMessages.hasOwnProperty(key)) {
//       if (!translations[locale][key]) {
//         translations[locale][key] = ''
//       }
//     }
//   });

//   // Write/overwrite translation file
//   fs.writeFileSync(outputDir + locale + '.json', JSON.stringify(translations, null, 2));
// });

// // ******************************************
// // Write the ALL translations file
// // ******************************************
// let allLocales = {};
// allLocales.en = defaultMessages;
// locales.forEach(locale => {
//   const localeData = JSON.parse(fs.readFileSync(outputDir + locale + '.json', 'utf8'));
//   allLocales[locale] = (function (obj) {
//     let nonEmptyobj = {};
//     for (key in obj) {
//       if (obj.hasOwnProperty(key) && obj[key]) {
//         nonEmptyobj[key] = obj[key];
//       }
//     }
//     return nonEmptyobj;
//   })(localeData[locale]);
// });

// fs.writeFileSync(outputDir + 'all' + '.json', JSON.stringify(allLocales, null, 2));
// process.exit();