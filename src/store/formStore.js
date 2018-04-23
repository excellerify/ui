const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchFormSchema(_, { resource, subResource, id }) {
      const url = `${resource}/${subResource || 'form'}`;

      const data = await global.$http.get(url, {
        params: { id }
      });

      return data.data.schema;
    },

    async fetchAutoComplete(_, { dataSource, searchVal }) {
      const search = {};

      dataSource.searchParams.map(param => {
        search[param] = {
          regexp: `/${searchVal}/i`,
          plain: searchVal
        };

        return search;
      });

      let { data } = await global.$http.get(dataSource.url, {
        params: { filter: { whereOr: search } }
      });

      if (data.items) {
        data = data.items;
      }

      return data;
    }
  }
};

export default store;
