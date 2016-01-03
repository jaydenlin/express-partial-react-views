var assert = require('assert');
var React = require('react/addons');
var path = require("path");
var assign = require('object-assign');
var Promise = require("bluebird");
var renderEngine = require('../index');
var engineOptions = {};
var mockApp = {}
	//require("node-jsx").install();

describe('Unit Tests', function() {
	before(function() {
		this.timeout(50000);
		// simulate the express settings
		engineOptions = {
			settings: {
				env: 'development',
				views: __dirname,
				reactComponentFolder: __dirname,
				'view engine': "html"
			}
		};
		mockApp = {
			get: function(name) {
				return engineOptions.settings[name];
			}
		};

	});
	it('should render correct html with application/x-react-component settings in base.html', function(done) {
		var render = renderEngine.createEngine();
		render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
			console.log(err);
			assert.equal(err, null);
			assert.equal(output.trim(), '<div id="top"><div>Hello World!</div></div>');
			done();
		});
	});

	it('should render correct html with props using propsProvider', function(done) {
		var render = renderEngine.createEngine({});
		renderEngine.providerService(mockApp, "base", {
			propsProvider: function(domid, filename, options) {
				return Promise.resolve({
					name: "The rendered component name is " + filename
				});
			}
		}).then(function(result) {
			//assign data from providerService
			engineOptions = assign({}, engineOptions, result);
			render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
				console.log(err);
				assert.equal(err, null);
				assert.equal(output.trim(), '<div id="top"><div>Hello World!The rendered component name is top.jsx</div></div>');
				done();
			});
		});



	});

	it('should render correct html and prepended html using prependMarkupProvider', function(done) {
		var render = renderEngine.createEngine({});
		renderEngine.providerService(mockApp, "base", {
			prependMarkupProvider: function(domid, filename, options) {
				return Promise.resolve("<h3>The prepended html for component " + filename + "</h3>");
			}
		}).then(function(result) {
			//assign data from providerService
			engineOptions = assign({}, engineOptions, result);
			render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
				console.log(err);
				assert.equal(err, null);
				assert.equal(output.trim(), '<h3>The prepended html for component top.jsx</h3><div id="top"><div>Hello World!</div></div>');
				done();
			});
		});
	});
	it('should render correct html and appended html using appendMarkupProvider', function(done) {
		var render = renderEngine.createEngine({});
		renderEngine.providerService(mockApp, "base", {
			appendMarkupProvider: function(domid, filename, options) {
				return Promise.resolve("<h3>The appended html for component " + filename + "</h3>");
			}

		}).then(function(result) {
			//assign data from providerService
			engineOptions = assign({}, engineOptions, result);
			render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
				console.log(err);
				assert.equal(err, null);
				assert.equal(output.trim(), '<div id="top"><div>Hello World!</div></div><h3>The appended html for component top.jsx</h3>');
				done();
			});
		});
	});



});