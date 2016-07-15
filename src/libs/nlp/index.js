import nlp from 'nlp_compromise';

export default text => {
  return nlp.text(text).sentences
    .map(sentence => {
      return sentence.terms;
    });
};
