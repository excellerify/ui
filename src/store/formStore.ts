import { http } from '@/http';
import { StoreOptions } from 'vuex';

export const formStore: StoreOptions<{}> = {
  mutations: {},
  actions: {
    async fetchFormSchema(_, { resource, subResource, id }) {
      const url = `${resource}/${subResource || 'form'}`;

      const { data } = await http.get(url, {
        params: { id },
      });

      return data && data.schema;
    },

    async fetchAutoComplete(_, { dataSource, searchVal }) {
      const search: { [key: string]: { regexp: string; plain: string } } = {};

      dataSource.searchParams.map((param: string) => {
        search[param] = {
          regexp: `/${searchVal}/i`,
          plain: searchVal,
        };
      });

      const { data } = await http.get(dataSource.url, {
        params: { filter: { where: search } },
      });

      return data && data.items;
    },
  },
};
