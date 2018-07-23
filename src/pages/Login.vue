<template lang="pug">
v-flex(xs10 offset-xs1 sm6 offset-sm3 md5 offset-md4 lg4 offset-lg4 style="margin-top: 50px;")
  v-card(style='background:white;')
    v-card-text.text-xs-center
      h3.title {{$t("Login to Admin Dashboard")}}
    v-card-text
      v-form.flex.pb-2(
        v-model='model'
        @submit='doLogin'
        submitButtonText="Login"
        :formFields='loginFields'
        :autoSubmit="true"
      )
        div(slot="buttons")
          small {{$t("* Indicates required field")}}
          v-alert.py-2(error, v-model='hasError')
            div {{error.message}}
          v-btn(dark, block, color="primary", @click.native="doLogin")
            span {{$t('Login')}}

</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';

@Component({ name: 'Login' })
export default class Login extends Vue {
  public show: boolean = false;

  public hasError: boolean = false;

  public model = {
    username: '',
    password: '',
  };

  public loginFields = {
    username: { label: 'Username', required: true },
    password: { label: 'Password', type: 'password', required: true },
  };

  public error = {
    message: '',
  };

  async doLogin() {
    try {
      await this.$store.dispatch('login', {
        username: this.model.username,
        password: this.model.password,
      });

      this.$router.push({ name: 'home' });
    } catch (e) {
      this.hasError = true;

      const response = e.response;

      if (response.status === 401 || response.status === 403) {
        this.error.message = 'Invalid Username or Password';
      } else {
        this.error.message = response.data.error;
      }
    }
  }
}
</script>
