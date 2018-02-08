const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { url }) {
      const data = await this.$http.get(url, {
        params: { id: this.id }
      });

      return data.data.schema;
    }
  }
};

export default store;
