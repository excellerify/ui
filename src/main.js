import Vue from 'vue';
import VeeValidate from 'vee-validate';
import Vuetify from 'vuetify';
import lodash from 'lodash';
import VueLodash from 'vue-lodash';
import VueTimeago from 'vue-timeago';
import Dropzone from 'vue2-dropzone';
import VueQuillEditor from 'vue-quill-editor';

import 'vuetify/src/stylus/main.styl';
import 'vuetify/src/stylus/settings/_colors.styl';

import helper from './helper';
import config from './config';
import store from './store';
import router from './router';
import i18n from './i18n/';

import App from './App.vue';
import VGrid from './components/Grid.vue';
import VForm from './components/Form.vue';
import VField from './components/Field.vue';

import './http';
import './styles/main.styl';

Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(VueLodash, lodash);

global.helper = helper;
global.config = config;
global.store = store;

// eslint-disable-next-line
const en = require('vue-timeago/locales/en-US.json');
// eslint-disable-next-line
const configLocale = require(`vue-timeago/locales/${config.locale}.json`);

Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: config.locale,
  locales: {
    en,
    [config.locale]: configLocale,
  },
});

Vue.use(VueQuillEditor);
Vue.component('dropzone', Dropzone);

Vue.component('v-grid', VGrid);
Vue.component('v-form', VForm);
Vue.component('v-field', VField);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  mounted() {},
  created() {
    global.$http = this.$http;
    global.$t = this.$t;

    // fetch menu from server
    this.$http.get('/settings/menu').then(({ data }) => {
      this.$store.commit('setMenu', data);
    });

    this.$store.dispatch('checkPageTitle', this.$route.path);

    this.$store.dispatch('checkAuth');
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
  },
  render: h => h(App),
});
