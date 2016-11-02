import { validate } from 'tcomb-validation';

export default createTcombMiddleware((req, res, next, error) => {
  res.status(500);
  res.json({ message: 'Validation Error', error });
});

export function createTcombMiddleware(createError) {
  return ({ query, body, params }) => (req, res, next) => {
    const error = {};

    if (query) {
      const result = validate(req.query, query);

      if (!result.isValid()) {
        error.query = result.errors;
      }
    }

    if (body) {
      const result = validate(req.body, body);

      if (!result.isValid()) {
        error.body = result.errors;
      }
    }

    if (params) {
      const result = validate(req.params, params);

      if (!result.isValid()) {
        error.params = result.errors;
      }
    }

    if (Object.keys(error).length > 0) {
      createError(req, res, next, error);
    } else {
      next();
    }
  };
}
