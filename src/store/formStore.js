const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { resource, subResource, id }) {
      const url = `${resource}/${subResource || 'form'}`;

      const data = await global.$http.get(url, {
        params: { id },
      });

      return data.data.schema;
    },
  },
};

export default store;
