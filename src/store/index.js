import Vue from 'vue';
import Vuex from 'vuex';
import lodash from 'lodash';

import authStore from './authStore';
import formStore from './formStore';
import mainStore from './mainStore';

Vue.use(Vuex);

const store = lodash.merge(mainStore, formStore, authStore);

export default new Vuex.Store(store);
