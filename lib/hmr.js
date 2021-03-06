'use strict'
const webpack = require('webpack')

const addEntry = (entry, newEntry) => {
  if (typeof entry === 'string') {
    return [entry, newEntry]
  } else if (Array.isArray(entry)) {
    return entry.concat(newEntry)
  }
  return entry
}

module.exports = function (config, options) {
  if (options.dev) {
    const publicPath = `http://${options.host === 'all' ? 'localhost' : options.host}:${options.port}/`
    // with electron and dev mode
    if (!options.watch && options.electron) {
      config.output.publicPath = publicPath
    }
    // with dev mode and hot reloading
    if (!options.watch && !options.live) {
      const pathToHotMiddleware = require.resolve('webpack-hot-middleware/client') + '?reload=true'

      let hmrClient
      if (options.electron) {
        // update path to middleware for electron app
        hmrClient = `${pathToHotMiddleware}&path=${publicPath}__webpack_hmr`
      } else {
        hmrClient = pathToHotMiddleware
      }

      if (Array.isArray(options.hot)) {
        // hot-ish custom entries
        options.hot.forEach(name => {
          config.entry[name] = addEntry(config.entry[name], hmrClient)
        })
      } else {
        // hot-ish client entry
        const client = typeof options.hot === 'string' ? options.hot : 'client'
        config.entry[client] = addEntry(config.entry[client], hmrClient)
      }
      config.plugins.push(new webpack.HotModuleReplacementPlugin())
    }
  }
}
