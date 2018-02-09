const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { url, params }) {
      try {
        const data = await global.$http.get(url, {
          params
        });

        return Promise.resolve(data.data.schema);
      } catch (e) {
        return Promise.resolve(e);
      }
    }
  }
};

export default store;
