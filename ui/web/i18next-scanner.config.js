// eslint-disable-next-line @typescript-eslint/no-require-imports
var fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
var chalk = require('chalk');
// eslint-disable-next-line @typescript-eslint/no-require-imports
var crypto = require('crypto');

function generateKey(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

module.exports = {
  input: [
    'src/**/*.{ts,tsx}', 
    '!src/**/*.spec.{ts,tsx}',
    '!src/i18n/**',
    '!**/node_modules/**'
  ],
  output: './src/assets',
  options: {
    compatibilityJSON: 'v3',
    debug: true,
    func: {
      list: ['$t'],
      extensions: ['.ts', '.tsx']
    },
    lngs: ['en', 'de'],
    ns: ['resource'],
    defaultLng: 'en',
    defaultNs: 'resource',
    // defaultValue ban đầu là rỗng (sẽ được ghi đè sau trong transform)
    defaultValue: '',
    resource: {
      loadPath: 'i18n/{{lng}}/{{ns}}.json',
      savePath: 'i18n/{{lng}}/{{ns}}.json',
      jsonIndent: 2,
      lineEnding: '\n'
    },
    nsSeparator: false,
    keySeparator: false,
    interpolation: {
      prefix: '{{',
      suffix: '}}'
    }
  },
  transform: function customTransform(file, enc, done) {
    "use strict";
    const parser = this.parser;
    const content = fs.readFileSync(file.path, enc);
    let count = 0;
    const tagTemplateLiteralPattern = /\$t`([^`]+)`/g;
    let match;
    if (!parser.keyMessageMap) {
      parser.keyMessageMap = {};
    }
    while ((match = tagTemplateLiteralPattern.exec(content)) !== null) {
      const message = match[1].trim();
      const key = generateKey(message);
      parser.keyMessageMap[key] = message;
      parser.set(key, { nsSeparator: false, keySeparator: false }, message);
      ++count;
    }
    parser.options.defaultValue = function(lng, ns, key) {
      return lng === 'en'
        ? (parser.keyMessageMap[key] || key)
        : '--TRAN---';
    };

    if (count > 0) {
      console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`);
    }
    done();
  }
};
