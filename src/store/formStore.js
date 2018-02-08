const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { url, params }) {
      const data = await global.$http.get(url, {
        params
      });

      return data.data.schema;
    }
  }
};

export default store;
