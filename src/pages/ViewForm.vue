<template lang="pug">
v-layout
  v-flex(xs12)
    v-view(v-model="model", v-bind="$data")
      div(slot="buttons",class="my-4")
        v-btn(dark, class="grey",@click.native="$root.back()")
          v-icon(dark, left) chevron_left
          span {{$t('Back')}}
</template>

<script>

export default {
  data() {
    return {
      model: {},
      fields: null,
      rules: {},
      messages: {}
    }
  },
  computed: {
    resource() {
      return this.$route.params.resource
    },
    id() {
      return this.$route.params.id
    }
  },
  watch: {
    '$route': 'fetch',
    'model': 'updateFields'
  },
  methods: {
    getFieldError(fieldName) {
      for (let k in this.errors) {
        let error = this.errors[k]
        if (error.field === fieldName) {
          return error.message
        }
      }
    },
    updateFields() {

    },
    fetch() {
      this.$http.get(`${this.resource}/form`, {
        params: { id: this.id }
      }).then(({ data }) => {
        data = data.schema
        this.model = data.model
        this.fields = data.fields
        this.rules = data.rules
        this.messages = data.messages
      })
    },
    onSubmit() {

    },
    onSuccess(data) {
      this.$router.push({ name: 'grid', params: { resource: this.resource } })
      if (data.id) {
        // this.$router.go(-1)
      }
    }
  },
  created() {
    let pageTitle = `Detail ${global.helper.i.titleize(global.helper.i.singularize(this.resource))}`
    this.$store.commit('setPageTitle', pageTitle)
  },
  mounted() {
    // this.$bus.showMessage('success', 'success')
    this.fetch()
  }
}
</script>
