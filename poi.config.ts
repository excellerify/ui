import { Options } from 'poi';

const options: Options = {
  entry: './src/main.ts',
  html: {
    title: 'Vuex with TypeScript example',
    template: './index.html',
  },
  homepage: '.',
  transformModules: ['natural'],
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  plugins: [require('@poi/plugin-typescript')()],
  configureWebpack: {
    node: {
      fs: 'empty',
      child_process: 'empty',
    },
    devtool: '#eval-source-map',
  },
};

export default options;
