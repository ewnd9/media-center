import Joi from 'joi';

const createId = ({ imdb, s, ep, lang = 'en' }) => `${imdb}:${s}:${ep}:${lang}`;

const associate = () => {
  // noop
};

const schema = {
  imdb: Joi.string().required(),
  ep: Joi.number(),
  s: Joi.number(),
  lang: Joi.string().required(),
  text: Joi.string().required()
};

export default { createId, associate, schema };
