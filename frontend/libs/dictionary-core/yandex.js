import request from 'superagent';

function Yandex(translateKey, dictionaryKey) {
  this.translateKey = translateKey;
  this.dictionaryKey = dictionaryKey;
}

const get = (url, query) => request.get(url).query(query).then(_ => _.body);

// https://tech.yandex.ru/translate/doc/dg/reference/translate-docpage/
Yandex.prototype.translate = function(fromLang, toLang, text) {
  return get('https://translate.yandex.net/api/v1.5/tr.json/translate', {
    key: this.translateKey,
    lang: `${fromLang}-${toLang}`,
    text
  })
  .then(_ => _.text.join(' '));
};

// https://tech.yandex.ru/dictionary/doc/dg/reference/lookup-docpage/
Yandex.prototype.dictionary = function(fromLang, toLang, text) {
  return get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup', {
    key: this.dictionaryKey,
    lang: `${fromLang}-${toLang}`,
    ui: 'en',
    flags: 4, // MORPHO = 0x0004 - включает поиск по форме слова;
    text
  })
  .then(_ => _.def);
};

Yandex.prototype.spellCheck = function(lang, text) {
  return get('https://speller.yandex.net/services/spellservice.json/checkText', {
    options: 256,
    lang,
    text
  })
  .then(corrections => {
    if (corrections.length > 0) {
      let prev = 0;
      let result = '';

      corrections.forEach(correction => {
        result += text.slice(prev, correction.pos);
        result += correction.s;

        prev = correction.pos + correction.len;
      });

      return result;
    } else {
      return text;
    }
  });
};

export default Yandex;
