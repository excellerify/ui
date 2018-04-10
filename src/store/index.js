import Vue from 'vue';
import Vuex from 'vuex';
import lodash from 'lodash';

import authStore from './authStore';
import formStore from './formStore';
import gridStore from './gridStore';
import mapStore from './mapStore';
import mainStore from './mainStore';
import errorStore from './errorStore';

Vue.use(Vuex);

const store = lodash.merge(mainStore, formStore, gridStore, authStore, errorStore, mapStore);

export default new Vuex.Store(store);
