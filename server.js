const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const credentials = require(__dirname + '/config/credentials.json');
const https = require('https');
const session = require('express-session');
const mongoUtilities = require('./mongo/mongoServer.js');
const fs = require('fs');
const fileUpload = require('express-fileupload');

app.use(session({
  secret: 'keyboard cat',
  cookie: { maxAge:  365 * 24 * 60 * 60 * 1000 },
  resave: true}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/', express.static(__dirname + '/static'));

app.use('/', (req, res, next) => {
  if(!req.session.username && req.path !== '/loginUser' && req.path !== '/login' && req.path !== '/redirect') {
    console.log('new user redirect');
    res.redirect('/loginUser');
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  if(req.session.username) {
    console.log('existing user redirect');
    res.redirect('/dashboard');
  } else {
    console.log('new user redirect');
    res.redirect('/loginUser');
  }
});

app.get('/tag', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_tag.html');
});

app.get('/testGenerate', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_testGenerator.html');
});

app.get('/markedQuestions', (req, res) => {
  const username = req.session.username;
  mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username })
    .then(data => {
      res.send(data.questionsList);
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/taggedQuestions', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_taggedDisplay.html');
});

app.get('/fetchMasterTable', (req, res) => {

});

app.get('/analyseTopics', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_analyseTopics.html');
});

app.post('/searchTag', async (req, res) => {
  const tagName = req.body.tagName;
  const username = req.session.username;
  try {
    const list = await mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username });
    let problemCodes = [];
    JSON.parse(list.questionsList).forEach(problem => {
      if(problem.tagged) {
        let found = false;
        for(let tag of problem.tags) {
          if(tag === tagName) {
            found = true;
            break;
          }
        }
        if(found)
          problemCodes.push(problem.problemcode);
      }
    });
    res.send(problemCodes);
  } catch(err) {
    console.log(err);
  }
});

app.post('/problemDescription', async (req, res) => {
  const { problemCode, contestCode } = req.body;
  const username = req.session.username;

  try {
    const tempResults = await mongoUtilities.Users.findUser({ "username": username});
    const option = {
      "host": "api.codechef.com",
      "path": `/contests/${contestCode}/problems/${problemCode}?fields=`,
      "method": "GET",
      "headers": {
        "content-Type": "application/json",
        "Authorization": `Bearer ${tempResults.access_token}`
      }
    };

    const request = https.request(option, (response) => {
      let data = "";
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', async () => {
        // fs.writeFileSync('temp.json', JSON.stringify(JSON.parse(data), null, '\t'));
        try {
          await JSON.parse(data).result.data.content;
          res.send(data);
        } catch(err) {
          console.log('120 session expired', err);
          delete req.session.username;
          res.send('session expired');
        }
      });
    });
    request.end();
  } catch(err) {
    console.log('128 session expired', err);
    delete req.session.username;
    res.send('session expired');
  }
});

app.post('/problemDetails', async (req, res) => {
  const problemcode = req.body.problemcode;
  const username = req.session.username;

  try {
    const tempResults = await mongoUtilities.Users.findUser({ "username": username});
    const option = {
      "host": "api.codechef.com",
      "path": `/submissions/?result=&year=&username=${username}&language=&problemCode=${problemcode}&contestCode=&fields=`,
      "method": "GET",
      "headers": {
        "content-Type": "application/json",
        "Authorization": `Bearer ${tempResults.access_token}`
      }
    }
    const request = https.request(option, (response) => {
      let data = "";
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', async () => {
        try {
          await JSON.parse(data).result.data.content;
          res.send(data);
        } catch(err) {
          console.log('153 session expired', err);
          delete req.session.username;
          res.send('session expired');
        }
      });
    });
    request.end();
  } catch(err) {
    console.log('161 session expired', err);
    delete req.session.username;
    res.send('session expired');
  }
});

app.post('/markQuestion', (req, res) => {
  const tags = req.body.tags;
  markQuestionBackend(req.session.username, tags, req.body.problemcode);
  res.send('marked questions in the backend');
});

app.post('/unmarkQuestion', (req, res) => {
  const problemcode = req.body.problemCode;
  const username = req.session.username;

  mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username })
    .then(data => {
      let found = false;
      let questionsList = JSON.parse(data.questionsList);
      let newQuestionsList = [];
      for(let question of questionsList) {
        if(question.problemcode === problemcode) {
          question.tagged = false;
          delete question.tags;
          found = true;
        }
        newQuestionsList.push(question);
      }
      if(found) {
        mongoUtilities.UserTaggingStatus.updateQuestions({
          "username": username
        }, {
          $set: {
            "questionsList": JSON.stringify(newQuestionsList)
          }
        })
          .then((data) => {
            console.log('question unmarked successfully');
            res.send('success');
          })
          .catch((err) => {
            console.log(err);
            res.send(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
});

app.get('/fetchUserQuestionsTable', (req, res) => {
  const username = req.session.username;
  mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username })
    .then((data) => {
      res.send(JSON.stringify(data.questionsList));
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get('/updateUserQuestionsTable', async (req, res) => {
  const username = req.session.username;
  try {
    const tempResults = await mongoUtilities.Users.findUser({ "username": username});
    const options = {
      "host": "api.codechef.com",
      "path": `/users/${username}`,
      "method": "GET",
      "headers": {
        "content-Type": "application/json",
        "Authorization": `Bearer ${tempResults.access_token}`
      }
    }
    const request = https.request(options, response => {
      let data = '';
      response.on('data', chunk => {
        data += chunk;
      });
      response.on('end', async () => {
        data = JSON.parse(data);
        try {
          const list = await extractListOfQuestions(data.result.data.content.problemStats);
          readUserQuestionListFromDatabase(list, username);
          res.send('updation done');
        } catch(err) {
          console.log('243 session expired', err);
          delete req.session.username;
          res.send('session expired');
        }
      });
    })
    request.end();
  } catch(err) {
    console.log('254 session expired', err);
    delete req.session.username;
    res.send('session expired');
  };
});

app.get('/dashboard', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_dashboard.html');
});

app.get('/loginUser', (req, res) => {
  res.sendFile(__dirname + '/static/templates/login_index.html');
});

app.get('/logout', (req, res) => {
  delete req.session.username;
  res.redirect('/loginUser');
});

app.get('/userDetails', (req, res) => {
  mongoUtilities.Users.findUser({ username: req.session.username })
    .then((data) => {
      res.send(data);
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
      try {
        const userDetails = await getUserName(data.result.data.access_token);

        mongoUtilities.Users.findUser({ username: userDetails.username })
          .then((result) => {
            if(result) {
              mongoUtilities.Users.updateUser({
                'username': userDetails.username,
              }, {
                $set: {
                  'access_token': data.result.data.access_token,
                  'refresh_token': data.result.data.refresh_token }
              })
                .then((msg) => {
                  console.log(msg);
                })
                .catch((err) => {
                  console.error(err);
                });
            } else {
              mongoUtilities.Users.storeUser({
                'access_token': data.result.data.access_token,
                'username': userDetails.username,
                'fullname': userDetails.fullname,
                'refresh_token': data.result.data.refresh_token
              })
                .then((msg) => {
                  console.log(msg);
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          })
          .catch(err => {
            console.error(err);
          });
        req.session.username = userDetails.username;
        res.redirect('/dashboard');
      } catch(err) {
        console.log('349 session expired', err);
        delete req.session.username;
        res.send('session expired');
      }
    })
  });
  request.write(JSON.stringify(post_body));
  request.end();
});

app.get('/fetchAllLinksOfSubmittedProblems', async (req, res) => {
  const username = req.session.username;
  try {
    const result = await mongoUtilities.ProblemLinks.extractLinks({ "username": username });
    if(!result) {
      res.send(JSON.stringify([]));
    } else {
      res.send(result.listOfLinks);
    }
  } catch(err) {
    console.log(err);
  }
});

app.get('/checkStatus', (req, res) => {
  res.sendFile(__dirname + '/static/templates/d_statusDisplay.html');
});


app.post('/deleteLinkOfProblem', async (req, res) => {
  const username = req.session.username;
  const problemName = req.body.problemName;

  try {
    const result = await mongoUtilities.ProblemLinks.extractLinks({ "username": username });
    const linksList = JSON.parse(result.listOfLinks);
    let newLinksList = [];
    linksList.forEach(elem => {
      if(elem.problemName !== problemName) {
        newLinksList.push(elem);
      }
    });
    await mongoUtilities.ProblemLinks.updateLinks({
      "username": username
    },{
      $set: {
        "listOfLinks": JSON.stringify(newLinksList)
      }
    });
    res.send('deletion of problem name done');
  } catch(err) {
    console.log(err);
  }
});

app.post('/statusOfProblem', async (req, res) => {
  const username = req.session.username;
  try {
    const temp_results = await mongoUtilities.Users.findUser({ "username": username });
    const options = {
      'method': 'GET',
      'host': 'api.codechef.com',
      'path': `/ide/status?link=${req.body.link}`,
      'headers': {
        'content-Type': 'application/json',
        'Authorization': `Bearer ${temp_results.access_token}`
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', async () => {
        try {
          await JSON.parse(data).result.data.langName;
          res.send(data);
        } catch(err) {
          console.log('441 session expired', err);
          delete req.session.username;
          res.send('session expired');
        }
      });
    });
    request.end();
  } catch(err) {
    console.log('430 session expired', err);
    delete req.session.username;
    res.send('session expired');
  }
});

app.use(fileUpload());
app.post('/codeUpload', async (req, res) => {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  const code = req.files.code;
  const submitCode = code.data.toString();
  const inputTestCases = req.body.testCases;
  const languageOfSubmission = req.body.languageChosen;
  const username = req.session.username;
  try {
    const tempResults = await mongoUtilities.Users.findUser({ "username": username});
    const problemName = req.body.problemName;

    const options = {
      'method': 'POST',
      'host': 'api.codechef.com',
      'path': '/ide/run',
      'headers': {
        'content-Type': 'application/json',
        'Authorization': `Bearer ${tempResults.access_token}`
      }
    };

    const postBody = {
      "sourceCode": submitCode,
      "language": languageOfSubmission,
      "input": inputTestCases
    };

    const request = https.request(options, (response) => {
      let data = "";
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', async () => {
        // console.log(username, data, problemName);
        try {
          await updateLinks(username, data, problemName);
          res.redirect('/testGenerate');
        } catch(err) {
          console.log('489 session expired', err);
          delete req.session.username;
          res.redirect('/');
        }
      });
    });
    request.write(JSON.stringify(postBody));
    request.end();
  } catch(err) {
    console.log('485 session expired', err);
    delete req.session.username;
    res.redirect('/login');
  }
});

app.listen(5000, credentials.private_ip, () => {
  console.log("your server has started and the website can be viewed at http://shmdeveloper.com");
});

//functions :)

const updateLinks = async (username, data, problemName) => {
  const link = await JSON.parse(data).result.data.link;
  try {
    const result = await mongoUtilities.ProblemLinks.extractLinks({ "username": username });
    if(!result) {
      let linksList = [];
      linksList.push({
        "problemName": problemName,
        "problemLink": link
      });
      mongoUtilities.ProblemLinks.insertLinks({
        "username": username,
        "listOfLinks": JSON.stringify(linksList)
      });
    } else {
      let linksList = JSON.parse(result.listOfLinks);
      linksList.push({
        "problemName": problemName,
        "problemLink": link
      });
      mongoUtilities.ProblemLinks.updateLinks({
        "username": username
      }, {
        $set: {
          "listOfLinks": JSON.stringify(linksList)
        }
      });
    }
  } catch(err) {
    console.log(err);
  }
};

const markQuestionBackend = (username, tags, problemcode) => {
  mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username })
    .then(data => {
      let found = false;
      let questionsList = JSON.parse(data.questionsList);
      for(let question of questionsList) {
        if(question.problemcode === problemcode) {
          question.tagged = true;
          question.tags = tags;
          found = true;
          break;
        }
      }
      if(found) {
        mongoUtilities.UserTaggingStatus.updateQuestions({
          "username": username
        }, {
          $set: {
            "questionsList": JSON.stringify(questionsList)
          }
        })
          .then((data) => {
            console.log('question marked successfully');
          })
          .catch((err) => {
            console.log(err);
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

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

const extractListOfQuestions = (problemStats) => {
  return new Promise((res, rej) => {
    let list = [];
    Object.keys(problemStats).forEach(stat => {
      Object.keys(problemStats[`${stat}`]).forEach(substat => {
        problemStats[`${stat}`][`${substat}`].forEach(problemcode => {
          list.push({
            "problemcode": problemcode,
            "status": stat,
            "category": substat
          });
        })
      });
    });
    console.log('user request for list fetch');
    const uniqueList = new Set(list);
    list = Array.from(uniqueList.values());
    list.sort((a, b) => {
      return a.problemcode.localeCompare(b.problemcode);
    });

    let reduceList = [];
    let lastElem = list[0];
    for(let i=1; i<list.length; i++) {
      if(lastElem.problemcode === list[i].problemcode) {
        if(list[i].status === 'solved')
          lastElem = list[i];
      } else {
        reduceList.push(lastElem);
        lastElem = list[i];
      }
    }
    res(reduceList);
  });
};

//function to regenerateAccessToken
const regenerateAccessToken = (refresh_token, username) => {
  const options = {
    'method': 'POST',
    'host': 'api.codechef.com',
    'path': '/oauth/token',
    'headers': {
      'content-Type': 'application/json'
    }
  };
  const post_body = {
    "grant_type": "refresh_token",
    "refresh_token": refresh_token,
    "client_id": credentials['Client ID'],
    "client_secret": credentials['Client Secret'],
  };
  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', async () => {
      data = JSON.parse(data);
      mongoUtilities.Users.updateUser({
        'username': username,
      }, {
        $set: {
          'access_token': data.result.data.access_token,
          'refresh_token': data.result.data.refresh_token }
      })
        .then((msg) => {
          console.log(msg);
        })
        .catch((err) => {
          console.error(err);
        });
    })
  });
  request.write(JSON.stringify(post_body));
  request.end();
}

const updateBackendWithOnline = (backendList, onlineList) => {
  return new Promise((res, rej) => {
    onlineList.forEach(onlineData => {
      onlineData.tagged = false;
      let found = false;
      backendList.forEach(backendData => {
        if(!found && onlineData.problemcode === backendData.problemcode) {
          found = true;
        }
      });
      if(!found) {
        backendList.push(onlineData);
      }
    });
    res(backendList);
  });
}

const readUserQuestionListFromDatabase = (onlineList, username) => {
  mongoUtilities.UserTaggingStatus.extractQuestions({ "username": username })
    .then(async (data) => {
      if(!data) {
        onlineList.forEach(elem => {
          elem.tagged = false;
        });
        mongoUtilities.UserTaggingStatus.insertQuestions({
          "username": username,
          "questionsList": JSON.stringify(onlineList)
        });
      } else {
        backendList = JSON.parse(data.questionsList);
        try {
          backendList = await updateBackendWithOnline(backendList, onlineList);
          mongoUtilities.UserTaggingStatus.updateQuestions({
            "username": username
          },{
            $set: {
              "questionsList": JSON.stringify(backendList)
            }
          })
            .then((data) => {
              console.log("Backend updated with Online List");
            })
            .catch((msg) => {
              console.log(msg);
            });
        } catch(e) {
          console.log("error occurred while updating the backend list with the online list");
        }
      }
    })
    .catch((err) => {
      console.log(err);
    })
}
