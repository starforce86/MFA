const { parsed: localEnv } = require('dotenv').config();
const webpack = require('webpack');
const withCSS = require('@zeit/next-css');

/* Without CSS Modules, with PostCSS */
module.exports = withCSS({
    webpack(config) {
        config.plugins.push(new webpack.EnvironmentPlugin(localEnv));

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


