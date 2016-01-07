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
* Provide the `propsProvider` for you to custom & load props for all componets before rendering (Promise support!)
* Provide the `prependMarkupProvider` for you to custom prepended markup for all componets when rendering.(Promise support!)
* Provide the `appendMarkupProvider` for you to custom appepended markup for all componets when rendering.(Promise support!)

## Usage

#### Step 1. Install this node module with react
```
npm install express-partial-react-views react@0.13.3
```

#### Step 2. Add express settings to your app. `eg. app.js`

`app.js`
```js
var express = require('express');
var app = express();
var engine=require('express-partial-react-views');
//set up views path. the folder for the base htmls.
app.set('views', __dirname + '/src'); 
//set up the extensions for base htmls
app.set('view engine', 'html');
//set up the react component folder. the view engine will find components from here.
app.set('reactComponentFolder', __dirname + '/src/components');
//set up the view engine
app.engine('html', engine.createEngine());
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

### View Engine Options

You can pass options in when creating your engine.

option | values                                          | default
-------|-------------------------------------------------|--------
useBabel | **true**: use **babel** to apply JSX, ESNext transforms to views.<br>**Note:** if already using **babel** or **node-jsx** in your project, you should set this to `false` | `true`

The defaults are sane, but just in case you want to change something, here's how it would look:

```js
var options = { useBabel: false };
var engine=require('express-partial-react-views');
app.engine('html', engine.createEngine(options));

```

## Advanced Usage
In real world, you may not simply render the React Components but also need to **load the props** via api fetch.   
Or somethimes you need to prepend and append some html tags to your React Components. (style/js codes ..etc).   
So this module provides a `providerService` funciton for you to do those stuffs.

* `providerService` funciton will wrap the `res.render` and return a Promise.
```js
var engine=require('express-partial-react-views');
app.get("/", function(req, res) {
    //wrap the res.render with providerService
    engine.providerService(req.app, "index", {
        //Provider Service Options here...
    }).then(function(result) {
        res.render("index", result);
    });

});
```
* There are `Provider Service Options` for you to set custom functions. Those funcitons have to return a Promise.

### Provider Service Options
You can pass options in when creating your own `providerService`.

option | values                                          | default
-------|-------------------------------------------------|--------
propsProvider | A callback function that returns a Promise with props for React Componets. The **domid**,**filename** and **options** arguments are from the value you set in **application/x-react-component** | function(domid,filename,options){ return Promise.resolve({}); }
prependMarkupProvider | A callback function that returns a Promise with the prepended markup for React Componets. The **domid**,**filename** and **options** arguments are from the value you set in **application/x-react-component** | function(domid,filename,options){ return Promise.resolve(""); }
appendMarkupProvider | A callback function that returns a Promise with the appended markup for React Componets. The **domid**,**filename** and **options** arguments are from the value you set in **application/x-react-component** | function(domid,filename,options){ return Promise.resolve(""); }

The defaults are sane, but just in case you want to change something, here's how it would look:

```js
var engine = require('express-partial-react-views');
app.get("/", function(req, res) {
    //wrap the res.render with providerService
    engine.providerService(req.app, "index", {
        //Set your own providers here
        propsProvider: function(componentDomId, componentFilename, componentOptions) {
            return Promise.resolve({
                name: componentDomId
            });
        }
    }).then(function(result) {
        res.render("index", result);
    });

});
```
> NOTE: The custom Provider functions you set will apply to **all React Components** with different **domid**,**filename** and **options** arguments from the value you set in **application/x-react-component**. 

### propsProvider
You can see `example/e02-usage-with-props` for the usage.
### prependMarkupProvider
You can see `example/e03-usage-with-prependMarkup` for the usage.
### appendMarkupProvider
You can see `example/e04-usage-with-appendMarkup` for the usage.




