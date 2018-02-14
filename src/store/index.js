import Vue from 'vue';
import Vuex from 'vuex';
import lodash from 'lodash';

import authStore from './authStore';
import formStore from './formStore';
import gridStore from './gridStore';
import mainStore from './mainStore';

Vue.use(Vuex);

const store = lodash.merge(mainStore, formStore, gridStore, authStore);

export default new Vuex.Store(store);
