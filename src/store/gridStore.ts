import { StoreOptions } from 'vuex';
import { http } from '../http';

export const gridStore: StoreOptions<{}> = {
  state: {},
  mutations: {},
  actions: {
    async fetchGridSchema(_, { resource, filters }) {
      const result = await http.get(`${resource}/grid`, {
        params: { filters },
      });

      return result.data.schema;
    },
  },
};
