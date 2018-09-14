var express = require('express');
var app = express();
app.get('/', function(req, res){
   console.log(req.ip);   
   res.send("get ready! :) :(");
});
app.listen(5000, '0.0.0.0', () => {
   console.log("awesome");
});
