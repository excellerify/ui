import { authStore } from '@/store/authStore';
import { errorStore } from '@/store/errorStore';
import { formStore } from '@/store/formStore';
import { gridStore } from '@/store/gridStore';
import { mainStore } from '@/store/mainStore';
import * as _ from 'lodash';
import { Store } from 'vuex';

export const store = new Store(
  _.merge(mainStore, formStore, gridStore, authStore, errorStore),
);
