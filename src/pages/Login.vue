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
            :FormFields='fields',
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
        username: "",
        password: ""
      },
      fields: {
        username: { label: "Username", required: true },
        password: { label: "Password", type: "password", required: true }
      },
      show: true,
      hasError: false,
      error: {
        message: ""
      }
    };
  },
  computed: {
    token() {
      return global.helper.ls.get("token");
    }
  },
  methods: {
    doLogin() {
      this.$http
        .post("admins/login", {
          username: this.model.username,
          password: this.model.password
        })
        .then(
          response => {
            global.store.dispatch("doLogin", {
              user: response.data.userId,
              token: response.data.id,
              expireTime: response.data.ttl
            });
          },
          ({ response }) => {
            this.hasError = true;

            if (response.status === 401 || response.status === 403) {
              this.error.message = "invalid username or password";
              this.$emit("error", response.status, [
                { message: "invalid username or password" }
              ]);
            } else {
              this.error = response.data.error;
              this.$emit("error", response.status, response.data.error);
            }
          }
        );
    },
    doLogout() {
      this.$http.post("admins/logout").then(
        response => {
          global.store.dispatch("clearAuth");
        },
        err => console.log(err)
      );
    },
    authenticate(provider) {
      this.$auth.authenticate(provider).then(function(data) {
        // Execute application logic after successful social authentication
      });
    }
  },
  beforeMount() {
    this.getUnits();
  }
};
</script>
