const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { resource, subResource, id }) {
      try {
        const url = `${resource}/${subResource || 'form'}`;

        const data = await global.$http.get(url, {
          params: { id },
        });

        return Promise.resolve(data.data.schema);
      } catch (e) {
        return Promise.resolve(e);
      }
    },
  },
};

export default store;
