var React = require('react/addons');
var Hello = React.createClass({
  
  render: function() {  
    return <div>Hello World Bottom!{this.props.name}</div>; 
  }
  
});
 
module.exports = Hello;