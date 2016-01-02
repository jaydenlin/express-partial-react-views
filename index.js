var React = require('react');
var assign = require('object-assign');
var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");

var DEFAULT_OPTIONS = {
  propsProvider: function(componentFilename, componentOptions) {
    return {};
  },
  prependMarkupProvider: function(componentFilename, componentOptions) {
    return ""
  },
  appendMarkupProvider: function(componentFilename, componentFilename, componentOptions) {
    return ""
  }
};

function createEngine(engineOptions) {

  var moduleDetectRegEx,
    reactComponentFolder,
    propsProvider,
    appendMarkupProvider,
    prependMarkupProvider;

  engineOptions = assign({}, DEFAULT_OPTIONS, engineOptions || {});

  function renderFile(filename, options, cb) {
    //Check the reactComponent Folder settings
    if (typeof options.settings.reactComponentFolder !== "undefined") {
      reactComponentFolder = options.settings.reactComponentFolder;
      moduleDetectRegEx = new RegExp('^' + options.settings.reactComponentFolder);
    } else {
      throw new Error('You should set a reactComponentFolder for using express-partial-react-views');
    }
    //Set up Providers
    propsProvider = engineOptions.propsProvider;
    prependMarkupProvider = engineOptions.prependMarkupProvider;
    appendMarkupProvider = engineOptions.appendMarkupProvider;

    //Load baseHTML content
    var baseHTML = fs.readFileSync(filename, {
      encoding: 'utf-8'
    });
    var contentQuery = cheerio.load(baseHTML);

    //Set up reactComponent Configs
    var rawReactComponentConfigsOnHTML = contentQuery("[type='application/x-react-component']");
    var reactComponentConfigs = rawReactComponentConfigsOnHTML.map(function(index) {

      var reactComponentConfig;
      try {
        reactComponentConfig = JSON.parse(contentQuery(this).html());
        if (typeof reactComponentConfig.filename === "undefined") {
          throw new Error("There is must be a filename in application/x-react-component.");
        }
      } catch (e) {
        throw new Error("There is an error in application/x-react-component. " + e.toString());
      }
      return reactComponentConfig;
    });

    //Replace configs with Server side rendering HTML
    rawReactComponentConfigsOnHTML.map(function(index) {
      var componentFilename = reactComponentConfigs[index].filename;
      var componentOptions = reactComponentConfigs[index].options;

      var componentPath = path.join(reactComponentFolder, componentFilename);
      //setup props
      var componentProps = propsProvider(componentFilename, componentOptions);
      //setip prependMarkup
      var prependMarkup = prependMarkupProvider(componentFilename, componentOptions);
      //setup appendMarkup
      var appendMarkup = appendMarkupProvider(componentFilename, componentOptions);

      try {
        var markup = "";
        var component = require(componentPath);
        // Transpiled ES6 may export components as { default: Component }
        component = component.default || component;
        markup += React.renderToStaticMarkup(
          React.createElement(component, options)
        );
        //replace 
        contentQuery(this).replaceWith(prependMarkup + markup + appendMarkup);

      } catch (e) {
        return cb(componentPath + " rendering fails. " + e.toString());
      }

    });

    if (options.settings.env === 'development') {
      // Remove all files from the module cache that are in the view folder.
      Object.keys(require.cache).forEach(function(module) {
        if (moduleDetectRegEx.test(require.cache[module].filename)) {
          delete require.cache[module];
        }
      });
    }

    cb(null, contentQuery.html({
      decodeEntities: false
    }));
  }

  return renderFile;
}

exports.createEngine = createEngine;