import { resolve } from 'path';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { Configuration } from 'webpack';
import { Options as TsLoaderOptions } from 'ts-loader';

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
          compilerOptions: {
            removeComments: false,
          },
        } as TsLoaderOptions,
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
