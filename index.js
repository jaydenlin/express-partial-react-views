var React = require('react');
var assign = require('object-assign');
var fs = require("fs");
var path = require("path");
var cheerio = require("cheerio");
var Promise = require("bluebird");
var __ = require("lodash");


var DEFAULT_ENGINE_OPTIONS = {
  useBabel: true
};

var DEFAULT_PROVIDER_OPTIONS = {
  propsProvider: function(componentDomId, componentFilename, componentOptions) {
    return Promise.resolve({});
  },
  prependMarkupProvider: function(componentDomId, componentFilename, componentOptions) {
    return Promise.resolve("");
  },
  appendMarkupProvider: function(componentDomId, componentFilename, componentOptions) {
    return Promise.resolve("");
  }
};
//Because the providerService may caculate servarl datas that renderFile may use.
//So I will keep the memoriedData here to prevent twice caculation.
var _memoriedData = {};


function _loadHTMLContent(filename) {
  //Load baseHTML content
  var baseHTML = fs.readFileSync(filename, {
    encoding: 'utf-8'
  });
  var contentQuery = cheerio.load(baseHTML);
  return contentQuery;
}

function _parseReactComponentConfigs(contentQuery, rawReactComponentConfigsOnHTML) {

  //Set up reactComponent Configs
  var reactComponentConfigs = rawReactComponentConfigsOnHTML.map(function(index) {

    var reactComponentConfig;
    try {
      reactComponentConfig = JSON.parse(contentQuery(this).html());
      if (typeof reactComponentConfig.filename === "undefined") {
        throw new Error("Must be a filename in application/x-react-component.");
      }
      if (typeof reactComponentConfig.domid === "undefined") {
        throw new Error("Must be a domid in application/x-react-component.");
      }
    } catch (e) {
      throw new Error("There is an error in application/x-react-component. " + e.toString());
    }
    return reactComponentConfig;
  });

  return reactComponentConfigs;

}

function createEngine(engineOptions) {

  var moduleDetectRegEx,
    reactComponentFolder,
    babelRegistered = false;

  engineOptions = assign({}, DEFAULT_ENGINE_OPTIONS, engineOptions || {});

  function renderFile(filename, options, cb) {

    if (engineOptions.useBabel && !babelRegistered) {
      // Passing a RegExp to Babel results in an issue on Windows so we'll just
      // pass the view path.
      require('babel-core/register')({
        only: options.settings.views
      });

      babelRegistered = true;
    }
    //Check the reactComponent Folder settings
    if (typeof options.settings.reactComponentFolder !== "undefined") {
      reactComponentFolder = options.settings.reactComponentFolder;
      moduleDetectRegEx = new RegExp('^' + options.settings.reactComponentFolder);
    } else {
      throw new Error('You should set a reactComponentFolder for using express-partial-react-views');
    }
    //If user used providerService the following values can be done by providerService, so read it from _memoriedData
    var contentQuery = _memoriedData._contentQuery || _loadHTMLContent(filename);
    var rawReactComponentConfigsOnHTML = _memoriedData._rawReactComponentConfigsOnHTML || contentQuery("[type='application/x-react-component']");
    var reactComponentConfigs = _memoriedData._reactComponentConfigs || _parseReactComponentConfigs(contentQuery, rawReactComponentConfigsOnHTML);

    //Replace configs with Server side rendering HTML
    rawReactComponentConfigsOnHTML.map(function(index) {
      var componentFilename = reactComponentConfigs[index].filename;
      var componentDomId = reactComponentConfigs[index].domid
      var componentOptions = reactComponentConfigs[index].options;

      var componentPath = path.join(reactComponentFolder, componentFilename);
      //setup props
      var componentProps = __.get(options, '[' + index + '][0]') || {}; //Accrding to the Promise.all order [0] is componentProps
      //setip prependMarkup
      var prependMarkup = __.get(options, '[' + index + '][1]') || ""; //Accrding to the Promise.all order [1] is prependMarkup
      //setup appendMarkup
      var appendMarkup = __.get(options, '[' + index + '][2]') || ""; //Accrding to the Promise.all order [1] is appendMarkup

      try {
        var markup = "";
        var component = require(componentPath);
        // Transpiled ES6 may export components as { default: Component }
        component = component.default || component;
        markup += React.renderToStaticMarkup(
          React.createElement(component, componentProps)
        );
        //replace with renderred React Components
        contentQuery(this).replaceWith(prependMarkup + "<div id='" + componentDomId + "'>" + markup + "</div>" + appendMarkup);

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

function providerService(app, filename, providerOptions) {
  var propsProvider,
    appendMarkupProvider,
    prependMarkupProvider;

  //Get filename meta information
  var viewPath = app.get("views");
  var viewExtrention = app.get("view engine");
  var reactComponentFolder = app.get("reactComponentFolder");

  if (typeof viewPath === "undefined") {
    throw new Error("Please set the app.set('views')");
  }
  if (typeof viewExtrention === "undefined") {
    throw new Error("Please set the app.set('view engine')");
  }
  if (typeof reactComponentFolder === "undefined") {
    throw new Error("Please set the app.set('reactComponentFolder')");
  }

  //Set up React Configs
  filename = path.join(viewPath, filename) + "." + viewExtrention;
  var contentQuery = _loadHTMLContent(filename);
  var rawReactComponentConfigsOnHTML = contentQuery("[type='application/x-react-component']");
  var reactComponentConfigs = _parseReactComponentConfigs(contentQuery, rawReactComponentConfigsOnHTML);
  //memory in _caculated data for renderFile to use.
  _memoriedData._contentQuery = contentQuery;
  _memoriedData._rawReactComponentConfigsOnHTML = rawReactComponentConfigsOnHTML;
  _memoriedData._reactComponentConfigs = reactComponentConfigs;

  //Set up Providers
  providerOptions = assign({}, DEFAULT_PROVIDER_OPTIONS, providerOptions || {});
  propsProvider = providerOptions.propsProvider;
  prependMarkupProvider = providerOptions.prependMarkupProvider;
  appendMarkupProvider = providerOptions.appendMarkupProvider;

  var providedDataPromises = [];
  reactComponentConfigs.map(function(index) {
    var componentDomId = reactComponentConfigs[index].domid;
    var componentFilename = reactComponentConfigs[index].filename;
    var componentOptions = reactComponentConfigs[index].options;

    providedDataPromises.push(Promise.all(
      [
        propsProvider(componentDomId, componentFilename, componentOptions),
        prependMarkupProvider(componentDomId, componentFilename, componentOptions),
        appendMarkupProvider(componentDomId, componentFilename, componentOptions)
      ]
    ));

  });

  return Promise.all(providedDataPromises);

}

exports.createEngine = createEngine;
exports.providerService = providerService;