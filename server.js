var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser')

// app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


//Root route for loading
app.use('/', express.static(path.join(__dirname, 'public')));

//View all favorites
app.get('/favorites', function(req, res){
  var data = fs.readFileSync('./data.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

//Post (Save) new favorite
app.post('/favorites', function(req, res){
  if (!req.body.name || !req.body.oid) {
    res.send("Error");
    return
  }

  var data = JSON.parse(fs.readFileSync('./data.json'));
  //Check favorites before adding then to our data.json. This is to prevent duplicates being added.
  var exsitingValue = data.find(function(favoriteMove){
    return favoriteMove.oid === req.body.oid
  });

  if (!exsitingValue) {
    data.push(req.body);
  }

  fs.writeFile('./data.json', JSON.stringify(data));
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
});

app.listen(3000, function(){
  console.log("Listening on port 3000");
});
