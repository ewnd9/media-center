import { agent } from 'supertest';
import { validate } from 'tcomb-validation';

export default server => {
  const request = agent(server);

  return {
    get: (url, query, responseSchema) => {
      if (!responseSchema) {
        return Promise.reject('responseSchema is missing');
      }

      return validatePromise(request.get(url).query(query), responseSchema);
    },
    post: (url, body, requestSchema, responseSchema) => {
      if (!requestSchema) {
        return Promise.reject('requestSchema is missing');
      }

      if (!responseSchema) {
        return Promise.reject('responseSchema is missing');
      }

      const requestValidation = validate(body, requestSchema, { strict: true });

      if (!requestValidation.isValid()) {
        return Promise.reject(errorMessage(body, requestValidation.errors));
      }

      return validatePromise(request.post(url).send(body), responseSchema);
    }
  };
}

function errorMessage(obj, errors) {
  return new Error(`${JSON.stringify(obj, null, 2)}\n${errors.map(_ => _.message).join('\n')}`);
}

function validatePromise(request, responseSchema) {
  return new Promise((resolve, reject) => {
    request.end((error, response) => {
      if (error) {
        reject(error);
      } else {
        const responseValidation = validate(response.body, responseSchema, { strict: true });

        if (!responseValidation.isValid()) {
          reject(errorMessage(response.body, responseValidation.errors));
        } else {
          resolve(response);
        }
      }
    });
  });
}
