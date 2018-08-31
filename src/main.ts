import * as _ from 'lodash';
import VeeValidate from 'vee-validate';
import Vue from 'vue';
import VueLodash from 'vue-lodash';
import VueQuillEditor from 'vue-quill-editor';
import VueTimeago from 'vue-timeago';
import Dropzone from 'vue2-dropzone';
import * as VueGoogleMaps from 'vue2-google-maps';
import Vuetify from 'vuetify';
import Vuex from 'vuex';

Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(VueQuillEditor);
Vue.use(VueLodash, _);
Vue.use(Vuex);

import 'vuetify/dist/vuetify.min.css';
import './styles/main.css';

import { config } from '@/config';
import { helper } from '@/helper';
import { http } from '@/http';
import { i18n } from '@/i18n';
import { IMenu } from '@/interfaces/menu.interface';
import { router } from '@/router';
import { store } from '@/store';

import App from '@/App.vue';
import VField from 'components/Field.vue';
import VGoogleMap from 'components/fields/GoogleMap.vue';
import VForm from 'components/Form.vue';
import VGrid from 'components/Grid.vue';

Vue.prototype.$http = http;

/* tslint:disable */
global.helper = helper;
global.config = config;
global.store = store;
/* tslint:enable */

import * as en from 'vue-timeago/locales/en-US.json';
const configLocale = import(`vue-timeago/locales/${config.locale}.json`);

Vue.use(VueTimeago, {
  name: 'timeago',
  locale: config.locale,
  locales: {
    en,
    // [config.locale]: configLocale,
  },
});

Vue.component('dropzone', Dropzone);
Vue.component('v-grid', VGrid);
Vue.component('v-form', VForm);
Vue.component('v-field', VField);
Vue.component('v-field-google-map', VGoogleMap);

const setupGoogleMap = async () => {
  await http.get(`${config.api}settings/googleApiKey`).then(
    ({ data }) => {
      Vue.use(VueGoogleMaps, {
        load: {
          key: data.googleApiKey,
          v: '3.26',
          libraries: 'places',
        },
      });
    },
    error => {
      console.error('Google map setup error', error);
    },
  );
};

// tslint:disable-next-line:no-unused-expression
new Vue({
  el: '#app',
  store,
  i18n,
  router,
  async created() {
    // setupGoogleMap();

    // utils.http = this.$http;
    // utils.t = this.$t;

    // fetch menu from server
    await http.get('/settings/menu').then(({ data }: { data: IMenu[] }) => {
      this.$store.commit('setMenu', data);

      const mainHeader = _.find(
        data.map(val => {
          return !!val.mainHeader && val.mainHeader;
        }),
      );

      config.appTitle = mainHeader || 'MagiShift';
    });

    this.$store.dispatch('checkPageTitle', { path: this.$route.path });

    this.$store.dispatch('checkAuth');
  },
  methods: {
    back() {
      this.$router.go(-1);
    },
  },
  render: h => h(App),
});
