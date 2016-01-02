var assert = require('assert');
var React = require('react/addons');
var renderEngine = require('../index');
var path = require("path");
var engineOptions = {};
require("node-jsx").install();

describe('Unit Tests', function() {
	before(function() {
		// simulate the express settings
		engineOptions = {
			settings: {
				env: 'development',
				views: __dirname,
				reactComponentFolder: __dirname
			}
		}
		console.log(__dirname);
	});
	it('should render correct html with application/x-react-component settings in base.html', function(done) {
		var render = renderEngine.createEngine();
		render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
			console.log(err);
			assert.equal(err, null);
			assert.equal(output.trim(), '<div id="root"><div>Hello World!</div></div>');
			done();
		});
	});

	it('should render correct html with props using propsProvider', function(done) {
		var render = renderEngine.createEngine({
			propsProvider: function(filename, options) {
				return {
					name: "The rendered component name is " + filename
				};
			}
		});
		render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
			console.log(err);
			assert.equal(err, null);
			assert.equal(output.trim(), '<div id="root"><div>Hello World!The rendered component name is testComponent.jsx</div></div>');
			done();
		});
	});

	it('should render correct html and prepended html using prependMarkupProvider', function(done) {
		var render = renderEngine.createEngine({
			prependMarkupProvider: function(filename, options) {
				return "<h3>The prepended html for component " + filename + "</h3>";
			}
		});
		render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
			console.log(err);
			assert.equal(err, null);
			assert.equal(output.trim(), '<h3>The prepended html for component testComponent.jsx</h3><div id="root"><div>Hello World!</div></div>');
			done();
		});
	});
	it('should render correct html and appended html using appendMarkupProvider', function(done) {
		var render = renderEngine.createEngine({
			appendMarkupProvider: function(filename, options) {
				return "<h3>The appended html for component " + filename + "</h3>";
			}
		});
		render(path.join(engineOptions.settings.views, "base.html"), engineOptions, function(err, output) {
			console.log(err);
			assert.equal(err, null);
			assert.equal(output.trim(), '<div id="root"><div>Hello World!</div></div><h3>The appended html for component testComponent.jsx</h3>');
			done();
		});
	});



});