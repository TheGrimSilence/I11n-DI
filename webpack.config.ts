import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';

export default {
  entry: resolve(__dirname, 'sources', 'main.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: [resolve(__dirname, 'webpack.config.ts')],
        options: {
          compiler: 'ttypescript',
        },
      },
    ],
  },
  output: {
    filename: 'main.js',
    path: resolve(__dirname, 'dist'),
  },
  plugins: [],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(__dirname, 'tsconfig.json'),
      }),
    ],
  },
} as Configuration;
