const store = {
  state: {},
  mutations: {},
  actions: {
    async fetchMapAutocomplete(_, { searchVal }) {
      const result = await global.$http.get(`map/places?place=${searchVal}`);

      return result.data;
    }
  }
};

export default store;
