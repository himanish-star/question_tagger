const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const credentials = require(__dirname + '/config/credentials.json');
const https = require('https');
const session = require('express-session');
const mongoUtilities = require('./mongo/mongoServer.js');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: credentials.secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.redirect('/templates/home_page.html');
});

app.get('/login', (req,res) => {
  res.redirect(`https://api.codechef.com/oauth/authorize?response_type=code&client_id=${credentials['Client ID']}&state=xyz&redirect_uri=${credentials.redirectURL}`);
});

app.get('/redirect', (req, res) => {
  const options = {
    'method': 'POST',
    'host': 'api.codechef.com',
    'path': '/oauth/token',
    'headers': {
      'content-Type': 'application/json'
    }
  };
  const post_body = {
    "grant_type": "authorization_code",
    "code": req.query.code,
    "client_id": credentials['Client ID'],
    "client_secret": credentials['Client Secret'],
    "redirect_uri": credentials.redirectURL
  };
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      data = JSON.parse(data);
      console.log(data);
      mongoUtilities.Users.storeUser({
        'sessionID': req.sessionID,
        'access_token': data.result.data.access_token
      })
        .then((msg) => {
          console.log(msg);
        });
      res.redirect(`/templates/home_page.html?access_token=${data.result.data.access_token}`);
    });
  });
  request.write(JSON.stringify(post_body));
  console.log(post_body, req.sessionID);
  request.end();
});

app.listen(5000,'172.31.21.111', () => {
  console.log("your server has started and the website can be viewed at http://shmdeveloper.com");
});
