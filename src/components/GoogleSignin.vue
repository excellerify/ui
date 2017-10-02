<template>
  <div ref="signinBtn" class="btn-sign-in">
    Sign In</div>
</template>

<script>
export default {
  name: 'google-signin',
  methods: {
    onUserLoggedIn(user) {
      console.log(user)
    }
  },
  mounted() {
    window.gapi.load('auth2', () => {
      const auth2 = window.gapi.auth2.init({
        client_id: '688861182330-6kf005u20kai8mrdmmk3fbv9t9sj67d4.apps.googleusercontent.com',
        cookiepolicy: 'single_host_origin'
      })
      auth2.attachClickHandler(this.$refs.signinBtn, {}, googleUser => {
        this.$emit('done', googleUser)
      }, error => console.log(error))
    })
  }
}
</script>
