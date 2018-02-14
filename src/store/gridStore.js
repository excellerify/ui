const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchGridSchema(_, { resource, filters }) {
      try {
        const data = await global.$http.get(`${resource}/grid`, {
          params: { filters },
        });

        return Promise.resolve(data.data.schema);
      } catch (e) {
        return Promise.resolve(e);
      }
    },
  },
};

export default store;
