window.onload = () => {
  const numberOfQuestions = $('#exampleFormControlSelect1');
  const timeOfTest = $('#timeOfTest');
  const phase1NextBtn = $('#phase1Next');
  const stage1 = $('#stage1');
  const stage2 = $('#stage2');
  const stage3 = $('#stage3');
  const testStopBtn = $('#testStopBtn');
  const phase2NextBtn = $('#phase2Next');
  const listDisplayRow = $('#listDisplay');
  const usernameDisplay = $('#usernameDisplay');
  const clearImprovementList = $('#clearImprovementList');
  const logoutIcon = $('#logoutIcon');
  const waitMessage = $('#waitMessage');

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
  };

  clearImprovementList[0].onclick = (e) => {
    e.preventDefault();
    localStorage.removeItem('questionsForImprovement');
  };

  usernameDisplay.text(JSON.parse(localStorage.getItem('user_data')).username);

  testStopBtn[0].onclick = (e) => {
    e.preventDefault();
    localStorage.setItem('testProgress', false);
    localStorage.removeItem('cumulativeData');
    window.location.reload();
  };

  phase1NextBtn[0].onclick = (e) => {
    e.preventDefault();
    if(!numberOfQuestions.val()) {
      return;
    }
    if(!localStorage.getItem('questionsForImprovement')) {
      alert('add questions for improvement!');
      return;
    }
    stage1.hide();
    displayStage2(numberOfQuestions.val(), timeOfTest.val());
  };

  phase2NextBtn[0].onclick = (e) => {
    e.preventDefault();
    const noq = numberOfQuestions.val();
    let testCodes = [];
    for(let i = 1; i <= noq; i++) {
      testCodes.push($(`#optionLister${i}`).val());
    }
    localStorage.setItem('testCode', JSON.stringify(testCodes));
    stage2.hide();
    waitMessage.show();
    startTest();
  };

  const returnProblemDescription = (testcode) => {
    return new Promise(function(resolve, reject) {
      $.post('/problemDescription', {
        "problemCode": testcode.split('/')[1],
        "contestCode": testcode.split('/')[0]
      }, (data) => {
        if(data === 'session expired') {
          alert('session expired, please login again');
          window.location.href = '/';
        }
        resolve(data);
      });
    });
  };

  const tempDisplay = async (cumulativeData) => {
    stage3.show();
    listDisplayRow.show();
    waitMessage.hide();
    const promiseList = cumulativeData.map(async (data, index) => {
      data = JSON.parse(data).result.data.content;
      let { body, problemName } = data;
      listDisplayRow.append(`
        <div class="column">
          <div class="question card">
            <h1 id="problemcode" class="card-header">${problemName}</h1>
            <div class="card-body">
              <h5 class="card-title">Problem Details</h5>
              <div class="hideH3" id="markedContent${index}"></div>
              <form ref='uploadCode' id='uploadCode${parseInt(index)}' action='/codeUpload' method='post' encType="multipart/form-data">
                <textarea class="column" name="testCases" id = "myTextArea"
                rows = "10"></textarea>
                <br>
                <select class="btn btn-primary" name="languageChosen" id="languageChoices${parseInt(index)}"><select>
                <br>
                <br>
                <input type="file" name="code" />
                <input style="display: none" type="text" value="${problemName}" name="problemName"/>
                <input class="btn btn-success" type='submit' value='Submit' />
              </form>
            </div>
          </div>
        </div>
      `);
      document.getElementById(`markedContent${index}`).innerHTML = body;
      data.languagesSupported.forEach(language => {
        $(`#languageChoices${parseInt(index)}`).append(`
          <option value="${language}">${language}<option>
        `);
      });
      const converter = new showdown.Converter(),
          text      = document.getElementById(`markedContent${index}`).innerText,
          html      = await converter.makeHtml(text);
      document.getElementById(`markedContent${index}`).innerHTML = html;
      console.log(text === document.getElementById(`markedContent${index}`).innerText);
      return html;
    });
    await Promise.all(promiseList);
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML-full';
    document.head.appendChild(script);
  };

  const startTest = async () => {
    localStorage.setItem('testProgress', true);
    const testCodes = await JSON.parse(localStorage.getItem('testCode'));
    listDisplayRow.html("");
    const questionsFittedToTemplates = testCodes.map(async testcode => {
      const data = await returnProblemDescription(testcode);
      return data;
    });

    const cumulativeData = await Promise.all(questionsFittedToTemplates);
    await localStorage.setItem('cumulativeData', JSON.stringify(cumulativeData));
    tempDisplay(cumulativeData);
  };

  const displayStage2 = async (noq, tot) => {
    if(localStorage.getItem('questionsForImprovement') && noq !== 0) {
      const list = $('#progressFilling');
      const questionsForImprovement = await localStorage.getItem('questionsForImprovement');
      const parElement = $(`
        <div class="form-group">
          <label for="selectProblemCodes">Choose Question</label>
          <select class="testQuestionOptions form-control" id="optionLister${noq}">
          </select>
        </div>
      `);
      list.append(parElement);
      const promiseList = JSON.parse(questionsForImprovement).map(async elem => {
        const htmlElem = await $(`#optionLister${noq}`).append(`
          <option>${elem}</option>
        `);
        return htmlElem;
      });
      await Promise.all(promiseList);
      if(parseInt(noq) === 1) {
        phase2NextBtn.show();
      }
      displayStage2(noq-1, tot);
    } else {
      return;
    }
  };

  if(JSON.parse(localStorage.getItem('cumulativeData'))[0] === "session expired") {
    localStorage.removeItem('cumulativeData');
    localStorage.removeItem('testProgress');
  }

  if(localStorage.getItem('cumulativeData') && localStorage.getItem('testProgress') === 'true') {
    stage1.hide();
    stage2.hide();
    tempDisplay(JSON.parse(localStorage.getItem('cumulativeData')));
  }
};

