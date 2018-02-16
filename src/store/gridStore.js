const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchGridSchema(_, { resource, filters }) {
      const data = await global.$http.get(`${resource}/grid`, {
        params: { filters },
      });

      return data.data.schema;
    },
  },
};

export default store;
