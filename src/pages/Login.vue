<template lang="pug">
div
  v-dialog(:value='true', persistent='', :width='300')
    v-card(hover='', style='background:white;')
      v-card-row.deep-purple.darken-1
        v-card-title.text-center
         h5(style='text-align: center;') {{$t("Login to Admin Dashboard")}}
      v-card-row
        v-card-text
          v-form(v-model='model',
            @submit='doLogin',
            :FormFields='loginFields',
            submitButtonText="Login",
            :autoSubmit="true")
            .flex.pb-2
              small {{$t("* Indicates required field")}}
      v-card-row
        v-alert.py-2(error, v-model='hasError')
          div {{error.message}}
</template>

<style>
body {
  background: #666 !important;
}
</style>

<script>
export default {
  data() {
    return {
      model: {
        username: '',
        password: '',
      },
      loginFields: {
        username: { label: 'Username', required: true },
        password: { label: 'Password', type: 'password', required: true },
      },
      show: true,
      hasError: false,
      error: {
        message: '',
      },
    };
  },
  computed: {},
  methods: {
    doLogin: async function() {
      try {
        debugger;
        await this.$store.dispatch('login', {
          username: this.model.username,
          password: this.model.password,
        });
      } catch (e) {
        console.log(e);

        this.hasError = true;

        const response = e.response;

        if (response.status === 401 || response.status === 403) {
          this.error.message = 'invalid username or password';
          this.$emit('error', response.status, [
            { message: 'invalid username or password' },
          ]);
        } else {
          this.error = response.data.error;
          this.$emit('error', response.status, response.data.error);
        }
      }
    },
    authenticate: provider => {
      this.$auth.authenticate(provider);
    },
  },
  beforeMount() {
    this.getUnits();
  },
};
</script>
