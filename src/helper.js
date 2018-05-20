import Vue from 'vue';
import inflector from 'i';

const storage = window.localStorage;
const helper = {};

/**
 * string processor
 */
helper.i = inflector();

/**
 * localStorage
 */
helper.ls = {
  set(key, value) {
    const storedVal = JSON.stringify(value);
    storage.setItem(key, storedVal);
    return storedVal;
  },
  get(key, defaultValue) {
    let value = storage.getItem(key);
    if (value === null || value === 'undefined' || value === '') {
      value = defaultValue;
    } else {
      value = JSON.parse(value);
    }
    return value;
  }
};

/**
 * a wrapper for helper.ls
 */
helper.store = (key, value) => {
  if (arguments.length < 2) {
    return helper.ls.get(key);
  }
  return helper.ls.set(key, value);
};

Vue.directive('back', event => {
  event.onclick = () => window.history.go(-1);
});

helper.moneyFormatter = value =>
  (value
    ? Number(value)
        .toString()
        .replace(/(\d)(?=(\d{3})+(,|$))/g, '$1,')
    : null);

export default helper;
