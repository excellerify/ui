<template lang="pug">
div
  v-flex(xs10 offset-xs1 sm6 offset-sm3 md5 offset-md4 lg4 offset-lg4 style="margin-top: 50px;")
    v-card(style='background:white;')
      v-card-title.text-xs-center
        h3.title {{$t("Login to Admin Dashboard")}}
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
body,
.application--wrap {
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
        await this.$store.dispatch('login', {
          username: this.model.username,
          password: this.model.password,
        });
      } catch (e) {
        this.hasError = true;

        const response = e.response;

        if (response.status === 401 || response.status === 403) {
          this.error.message = 'Invalid Username or Password';
          this.$emit('error', response.status, [
            { message: this.error.message },
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
};
</script>
