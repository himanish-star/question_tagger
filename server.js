const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const credentials = require(__dirname + '/config/credentials.json');
const https = require('https');
const session = require('express-session');
const mongoUtilities = require('./mongo/mongoServer.js');

app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge:  365 * 24 * 60 * 60 * 1000 },
  resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/static'));

app.get('/', (req, res) => {
  if(req.session.username) {
    console.log('existing user redirect');
    res.redirect('/dashboard');
  } else {
    console.log('new user redirect');
    res.redirect('/loginUser');
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_dashboard.html');
});

app.get('/loginUser', (req, res) => {
  res.sendFile(__dirname + '/static/templates/login_index.html');
});

app.get('/logout', (req, res) => {
  //implement this part
});

app.get('/userDetails', (req, res) => {
  mongoUtilities.Users.findUser({ username: req.session.username })
    .then((data) => {
      res.send(data.fullname);
    })
    .catch((err) => {
      res.send(err);
    });
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
    response.on('end', async () => {
      data = JSON.parse(data);
      const userDetails = await getUserName(data.result.data.access_token);

      mongoUtilities.Users.findUser({ username: userDetails.username })
        .then((result) => {
          if(result) {
            mongoUtilities.Users.updateUser({
              'username': userDetails.username,
            }, {
              $set: { 'access_token': data.result.data.access_token }
            })
              .then((msg) => {
                console.log(msg);
              })
              .catch((err) => {
                console.error('update user error', err);
              });
          } else {
            mongoUtilities.Users.storeUser({
              'access_token': data.result.data.access_token,
              'username': userDetails.username,
              'fullname': userDetails.fullname
            })
              .then((msg) => {
                console.log(msg);
              })
              .catch((err) => {
                console.error('store user error');
              });
          }
        })
        .catch(err => {
          console.error('find user error');
        });
      req.session.username = userDetails.username;
      res.redirect('/dashboard');
    })
  });
  request.write(JSON.stringify(post_body));
  request.end();
});

app.listen(5000, () => {
  console.log("your server has started and the website can be viewed at http://shmdeveloper.com");
});

//functions :)

const getUserName = (access_token) => {
  return new Promise((resolve, reject) => {
    const options = {
      'method': 'GET',
      'host': 'api.codechef.com',
      'path': '/users/me',
      'headers': {
        'content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        data = JSON.parse(data);
        resolve({
          username: data.result.data.content.username,
          fullname: data.result.data.content.fullname
        });
      });
    });
    request.end();
  });
};
