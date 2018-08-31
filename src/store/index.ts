import { authStore } from '@/store/authStore';
import { errorStore } from '@/store/errorStore';
import { formStore } from '@/store/formStore';
import { gridStore } from '@/store/gridStore';
import { mainStore } from '@/store/mainStore';
import { merge } from 'lodash';
import { Store } from 'vuex';

export const store = new Store(
  merge(mainStore, formStore, gridStore, authStore, errorStore),
);
