import t from 'tcomb';
import { validate } from 'tcomb-validation';

import { schema as fileSchema } from '../../src/models/file';
import { schema as markSchema } from '../../src/models/mark';

export const fileScrobbleRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema
});

export const filePositionRequestSchema = t.struct({
  filename: t.String,
  media: fileSchema,
  position: t.Number,
  duration: t.Number
});

export const fileResponseSchema = t.struct({
  file: fileSchema
});

export const statusStringResponse = t.struct({
  status: t.String
});

export const markRequestSchema = t.struct({
  mark: t.struct({
    media: fileSchema,
    position: t.Number,
    duration: t.Number,
    progress: t.Number,
    file: t.String
  })
});

export const markResponseSchema = markSchema;
// export const markResponseSchema = t.struct({ mark: markSchema });

export const marksArrayResponseSchema = t.list(markSchema);
