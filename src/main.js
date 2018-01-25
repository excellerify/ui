import Vue from 'vue';

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

import Vuetify from 'vuetify';
Vue.use(Vuetify);

import lodash from 'lodash';
import VueLodash from 'vue-lodash';
Vue.use(VueLodash, lodash);

import helper from './helper';
import config from './config';
import store from './store';

global.helper = helper;
global.config = config;
global.store = store;

import router from './router';
import i18n from './i18n/';
import './http';

import VueTimeago from 'vue-timeago';

Vue.use(VueTimeago, {
  name: 'timeago', // component name, `timeago` by default
  locale: config.locale,
  locales: {
    'en': require('vue-timeago/locales/en-US.json'),
    [config.locale]: require(`vue-timeago/locales/${config.locale}.json`)
  }
});

import 'vuetify/src/stylus/main.styl';
import 'vuetify/src/stylus/settings/_colors.styl';
import '@/styles/main.styl';

import App from './App.vue';

import Dropzone from 'vue2-dropzone';
import VueQuillEditor from 'vue-quill-editor';
Vue.use(VueQuillEditor);
Vue.component('dropzone', Dropzone);

import VGrid from './components/Grid.vue';
import VForm from './components/Form.vue';
import VField from './components/Field.vue';

// import Modal from './components/Modal' Vue.use(Modal)
Vue.component('v-grid', VGrid);
Vue.component('v-form', VForm);
Vue.component('v-field', VField);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  mounted () {},
  created () {
    // this.$http.get('/users/1').then(({data}) => console.log(data))
    global.$http = this.$http;
    global.$t = this.$t;
    // fetch menu from server
    this
      .$http
      .get('/settings/menu')
      .then(({data}) => {
        this
          .$store
          .commit('setMenu', data);
      });

    this
      .$store
      .dispatch('checkPageTitle', this.$route.path);

    this
      .$store
      .dispatch('checkAuth');
  },
  methods: {
    back () {
      this.$router.go(-1);
    }
  },
  render: h => h(App)
});
