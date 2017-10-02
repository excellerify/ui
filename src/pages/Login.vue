<template lang="pug">
div
  v-dialog(:value='true', persistent='', :width='300')
    v-card(hover='', style='background:white;')
      v-card-row.deep-purple.darken-1
        v-card-title.text-center
         h5 {{$t("Login to Admin Dashboard")}}
      v-card-row
        v-card-text
          v-form(v-model='model', @submit='doLogin', :fields='fields', submitButtonText="Login")
            .flex.pb-2
              small {{$t("* Indicates required field")}}
      //- v-card-row
      //-   v-card-text.pt-2
      //-     google-signin

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
        password: ''
      },
      fields: {
        username: { label: 'Username', required: true },
        password: { label: 'Password', type: 'password', required: true }
      },
      show: true
    }
  },
  computed: {
    token() {
      return global
        .helper
        .ls
        .get('token')
    }
  },
  methods: {
    doLogin() {
      this.$http
        .post('admins/login', {
          username: this.model.username,
          password: this.model.password
        }).then(response => {
          global.store.dispatch('doLogin', { user: response.data.userId, token: response.data.id, expireTime: response.data.ttl })
        }, err => console.log(err))
    },
    doLogout() {
      this.$http
        .post('admins/logout').then(response => {
          global
            .store
            .dispatch('clearAuth')
        }, err => console.log(err))
    },
    authenticate(provider) {
      this.$auth.authenticate(provider).then(function(data) {
        // Execute application logic after successful social authentication
      })
    }
  },
  beforeMount() {
    this.getUnits()
  }
}
</script>
