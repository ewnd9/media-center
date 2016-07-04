function WordsService({ Word }) {
  this.Word = Word;
}

WordsService.prototype.findAll = function(limit, since) {
  return this.Word.findAllDocs({ limit, since });
};

WordsService.prototype.addWord = function(word, example) {
  return this.Word
    .findOne(word)
    .then(
      word => {
        const isAdded = word.examples.find(_ => _.text === example.text);

        if (!isAdded) {
          word.examples.add(example);
        }

        return this.Word.put(word);
      },
      err => this.Word.onNotFound(err, () => {
        word.examples = [example];
        return this.Word.put(word);
      })
    );
};

WordsService.prototype.removeWord = function(wordId) {
  return this.Word
    .findById(wordId)
    .then(word => {
      word.isHidden = true;
      return this.Word.put(word);
    });
};

export default function(models) {
  return new WordsService(models);
}
