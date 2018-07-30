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
export { default } from './Login.controller';
</script>
