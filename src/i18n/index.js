import Vue from 'vue';
import VueI18n from 'vue-i18n';

import config from '../config';
import helper from '../helper';

const locales = ['en-US'];

Vue.use(VueI18n);

const messages = {};
locales.forEach(v => {
  // eslint-disable-next-line
  messages[v] = require(`./${v}/index`).default;
});
const i18n = new VueI18n({
  locale: helper.ls.get('locale', config.locale),
  silentTranslationWarn: true,
  messages,
});

export default i18n;
