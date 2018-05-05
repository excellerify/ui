<template lang="pug">
v-flex(xs10 offset-xs1 sm6 offset-sm3 md5 offset-md4 lg4 offset-lg4 style="margin-top: 50px;")
  v-card(style='background:white;')
    v-card-title.text-xs-center
      h3.title {{$t("Login to Admin Dashboard")}}
    v-card-row
      v-card-text
        v-form.flex.pb-2(v-model='model',
          @submit='doLogin',
          submitButtonText="Login",
          :formFields='loginFields',
          :autoSubmit="true")
            small {{$t("* Indicates required field")}}

    v-card-row
      v-alert.py-2(error, v-model='hasError')
        div {{error.message}}
</template>

<script>
export default {
  data() {
    return {
      show: true,
      hasError: false,
      model: {
        username: "",
        password: ""
      },
      loginFields: {
        username: { label: "Username", required: true },
        password: { label: "Password", type: "password", required: true }
      },
      error: {
        message: ""
      }
    };
  },
  methods: {
    doLogin: async function() {
      try {
        await this.$store.dispatch("login", {
          username: this.model.username,
          password: this.model.password
        });
      } catch (e) {
        this.hasError = true;

        const response = e.response;

        if (response.status === 401 || response.status === 403) {
          this.error.message = "Invalid Username or Password";
        } else {
          this.error.message = response.data.error;
        }
      }
    },
    authenticate: provider => {
      this.$auth.authenticate(provider);
    }
  }
};
</script>
