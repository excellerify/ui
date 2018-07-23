import * as _ from 'lodash';
import { Store } from 'vuex';
import { authStore } from './authStore';
import { errorStore } from './errorStore';
import { formStore } from './formStore';
import { gridStore } from './gridStore';
import { mainStore } from './mainStore';

export const store = new Store(
  _.merge(mainStore, formStore, gridStore, authStore, errorStore),
);
