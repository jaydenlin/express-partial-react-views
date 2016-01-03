# express-partial-react-views
[![Build Status](https://travis-ci.org/jaydenlin/express-partial-react-views.svg?branch=master)](https://travis-ci.org/jaydenlin/express-partial-react-views)
> Render partial react views in a base html file.   
> Inspired by [express-react-views](https://github.com/reactjs/express-react-views)

## Concept
In some cases, you may only need React componets to *render in some parts of your page*.   
As you can see in the following image. The React componets are in a base html.   
![Image](https://raw.githubusercontent.com/jaydenlin/express-partial-react-views-doc/gh-pages/images/concept.png)

This module provides the view engine to help you do server-side rendering to those React componets' part.
**By writing some custom html tags** (with `domid` and `filename` provided), the view engine will replace the part with renderred html contents.

![Image](https://raw.githubusercontent.com/jaydenlin/express-partial-react-views-doc/gh-pages/images/conceptWithCode.png)

## Usage

```
npm install express-react-views react
```

## Add express settings to your app

```js
//app.js
var app = express();
app.set('views', __dirname + '/src');
app.set('view engine', 'html');
app.set('reactComponentFolder', __dirname + '/src/components');
app.engine('html', require('express-partial-react-views').createEngine();
```

## HTML file
```html
//index.html
<script type="application/x-react-component">
{	
	"domid":"top",
	"filename":"top.jsx"
}
</script>
```

## Add route & render codes to your app
```js
app.get("/", function(req, res) {
	res.render("index");
});
```