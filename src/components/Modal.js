import VModal from './Modal.vue';

const modal = Vue => {
  Vue.component('v-modal', VModal);
  const ModalComponent = Vue.extend(VModal);
  const component = new ModalComponent().$mount();

  const $app = () => document.getElementById('app');
  Vue.prototype.$showModal = (title, text, cancel, ok, success) => {
    component.title = title;
    component.text = text;

    // cancel && (component.cancel = cancel);
    // ok && (component.ok = ok);
    component.success = success;

    component.value = true;
    $app().appendChild(component.$el);
  };
  Vue.prototype.$closeModal = () => {
    $app().removeChild(component.$el);
  };
};

export default {
  modal,
};
