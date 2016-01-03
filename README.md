# express-partial-react-views
[![Build Status](https://travis-ci.org/jaydenlin/express-partial-react-views.svg?branch=master)](https://travis-ci.org/jaydenlin/express-partial-react-views)
> Render partial react views in a base html file   
> Inspired by [express-react-views](https://github.com/reactjs/express-react-views)

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
	"domid":"root",
	"filename":"testComponent.jsx"
}
</script>
```

## Add render route & render codes to your app
```js
app.get("/", function(req, res) {
	res.render("index");
});
```