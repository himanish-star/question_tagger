const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const credentials = require(__dirname + '/config/credentials.json');
const https = require('https');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  res.redirect('/templates/home_page.html');
});

app.get('/getCredentials', (req, res) => {
  res.send(credentials);
})

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
      console.log(data);
      res.send('response');
    });
  });
  request.write(JSON.stringify(post_body));
  console.log(post_body);
  request.end();
});

app.listen(3000, () => {
  console.log("started at http://localhost:3000");
});
