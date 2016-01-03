# express-partial-react-views
[![Build Status](https://travis-ci.org/jaydenlin/express-partial-react-views.svg?branch=master)](https://travis-ci.org/jaydenlin/express-partial-react-views)
> Express view engine which renders partial react views in a base html file.   
> Inspired by [express-react-views](https://github.com/reactjs/express-react-views)

## Concept
In some cases, you may only need React componets to **render in some parts of your page**.      
As you can see in the following image. The React componets are in a base html.

<img src="https://raw.githubusercontent.com/jaydenlin/express-partial-react-views-doc/gh-pages/images/concept.png" width="500"/>    

This module provides the view engine to help you do server-side rendering to those React componets' part.   
**By writing some custom html tags** (with `domid` and `filename` provided), the view engine will replace the part with renderred html contents.

<img src="https://raw.githubusercontent.com/jaydenlin/express-partial-react-views-doc/gh-pages/images/conceptWithCode.png" width="500"/>

## Highlight
* Provide the `propsProvider` for you to custom & load props for all componets before rendering
* Provide the `prependMarkupProvider` for you to custom prepended markup for all componets when rendering.
* Provide the `appendMarkupProvider` for you to custom appepended markup for all componets when rendering.

## Usage

#### Step 1. Install this node moudle with react
```
npm install express-partial-react-views react
```

#### Step 2. Add express settings to your app. `eg. app.js`

`app.js`
```js
var express = require('express');
var app = express();
//set up views path. the folder for the base htmls.
app.set('views', __dirname + '/src'); 
//set up the extensions for base htmls
app.set('view engine', 'html');
//set up the react component folder. the view engine will find components from here.
app.set('reactComponentFolder', __dirname + '/src/components');
//set up the view engine
app.engine('html', require('express-partial-react-views').createEngine());
```

#### Step 3. Set up the base HTML file. `eg. index.html`

`index.html`
```html
<html>
	<body>
		
		...Other parts of the html	
		
		<!--the part that need React Componet to render-->
		<script type="application/x-react-component">
		{	
			"domid":"top",
			"filename":"top.jsx"
		}
		</script>

		...Other parts of the html

		...Other parts of the html

		...Other parts of the html
	</body>
</html>
```

#### Step 4. Add route & render codes to your app. `eg. app.js`
`app.js`
```js
app.get("/", function(req, res) {
	res.render("index");
});
```

### Configuration Options

You can pass options in when creating your engine.

option | values | default
-------|--------|--------
`propsProvider` | a callback function that returns the props for all React Componets. The `filename` and `options` arguments are from the value you set in `application/x-react-component` | ```js function(domid,filename,options){ return {}; }```
`prependMarkupProvider` | a callback function that returns the prepended markup for all React Componets. The `filename` and `options` arguments are from the value you set in `application/x-react-component` | ```js function(domid,filename,options){ return ""; }```
`appendMarkupProvider` | a callback function that returns the appended markup for all React Componets. The `filename` and `options` arguments are from the value you set in `application/x-react-component` | ```js function(domid,filename,options){ return ""; }```
`useBabel` | `true`: use `babel` to apply JSX, ESNext transforms to views.<br>**Note:** if already using `babel` or `node-jsx` in your project, you should set this to `false` | `true`

The defaults are sane, but just in case you want to change something, here's how it would look:

```js
var options = { useBabel: false };
app.engine('html', require('express-partial-react-views').createEngine(options));
```
