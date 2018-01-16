import Vue from 'vue';
import Vuex from 'vuex';
import lodash from 'lodash';

import formStore from './formStore';
import mainStore from './mainStore';

Vue.use(Vuex);

const store = lodash.merge(mainStore, formStore);

export default new Vuex.Store(store);
