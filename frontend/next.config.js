const { parsed: localEnv } = require('dotenv').config();
const webpack = require('webpack');
const withCSS = require('@zeit/next-css');
const CKEditorWebpackPlugin = require( '@ckeditor/ckeditor5-dev-webpack-plugin' );
const { styles } = require( '@ckeditor/ckeditor5-dev-utils' );
const path = require('path');

/* Without CSS Modules, with PostCSS */
module.exports = withCSS({
    webpack(config) {
        config.plugins.push(new webpack.EnvironmentPlugin(localEnv));
        config.plugins.push(
          new CKEditorWebpackPlugin({
            // See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
            language: 'en'
          })
        );
        config.module.rules.push(
            {
              // Or /ckeditor5-[^/]+\/theme\/icons\/[^/]+\.svg$/ if you want to limit this loader
              // to CKEditor 5 icons only.
              // test: /\.svg$/,
              test: /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
              use: ['raw-loader']
            },
            {
              // Or /ckeditor5-[^/]+\/theme\/[\w-/]+\.css$/ if you want to limit this loader
              // to CKEditor 5 theme only.
              // test: /\.css$/,
              test: /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/,
              use: [
                {
                  loader: 'style-loader',
                  options: {
                    singleton: true
                  }
                },
                {
                  loader: 'postcss-loader',
                  options: styles.getPostCssConfig({
                    themeImporter: {
                      themePath: require.resolve('@ckeditor/ckeditor5-theme-lark')
                    },
                    minify: true
                  })
                },
              ]
            },
            // {
            //   loader: require.resolve('file-loader'),
            //   // Exclude `js` files to keep the "css" loader working as it injects
            //   // its runtime that would otherwise be processed through the "file" loader.
            //   // Also exclude `html` and `json` extensions so they get processed
            //   // by webpack's internal loaders.
            //   exclude: [
            //     /\.(js|mjs|jsx|ts|tsx)$/,
            //     /\.html$/,
            //     /\.json$/,
            //     /ckeditor5-[^/\\]+[/\\]theme[/\\]icons[/\\][^/\\]+\.svg$/,
            //     /ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/
            //   ],
            //   options: {
            //     name: 'static/media/[name].[hash:8].[ext]',
            //   }
            // }
        )
        config.module.rules.forEach(function(rule) {
          if(String(rule.test) === String(/\.css$/)) {
            if (!(rule.exclude instanceof Array) && typeof rule.exclude != "undefined") {
              rule.exclude = [rule.exclude]
            }
            rule.exclude = rule.exclude || []
            rule.exclude.push(/ckeditor5-[^/\\]+[/\\]theme[/\\].+\.css/)
            // rule.exclude.push(/node_modules/)
            // rule.exclude.push(/node_modules\/(?!video-react\/).*/)
          }
        })
        return config
    }
});

/* With CSS Modules */
// module.exports = withCSS({ cssModules: true })

/* With additional configuration on top of CSS Modules */
/*
module.exports = withCSS({
  cssModules: true,
  webpack: function (config) {
    return config;
  }
});
*/


