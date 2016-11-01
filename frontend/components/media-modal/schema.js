import t from 'tcomb';

import { schema } from '../../reducers/modal-reducer';
export { schema };

export const modalSchema = t.struct({
  modal: schema,

  closeModal: t.Function,
  fetchSuggestions: t.Function,
  selectSuggestion: t.Function,
  changeField: t.Function,
  playFile: t.Function,
  saveInfo: t.Function,
  setHidden: t.Function
});
