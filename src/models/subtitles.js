import Joi from 'joi';
import Schema from 'js-schema';

const createId = ({ imdb, s, ep, lang = 'en' }) => `${imdb}:${s}:${ep}:${lang}`;

const associate = models => {
  // noop
};

const schema = {
  imdb: Joi.string().required(),
  ep: Joi.number().required(),
  s: Joi.number().required(),
  lang: Joi.string().required(),
  text: Joi.string().required()
};
// const schema = Schema({
//   imdb: String,
//   s: Number,
//   ep: Number,
//   lang: String,
//   text: String
// });

export default { createId, associate, schema };
