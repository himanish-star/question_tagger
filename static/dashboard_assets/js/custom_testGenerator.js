window.onload = () => {
  const numberOfQuestions = $('#exampleFormControlSelect1');
  const timeOfTest = $('#timeOfTest');
  const phase1NextBtn = $('#phase1Next');
  const stage1 = $('#stage1');
  const stage2 = $('#stage2');
  const stage3 = $('#stage3');
  const phase2NextBtn = $('#phase2Next');
  const listDisplayRow = $('#listDisplay');

  phase1NextBtn[0].onclick = (e) => {
    e.preventDefault();
    if(!timeOfTest.val() || !numberOfQuestions.val()) {
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
    startTest();
  };

  const returnProblemDescription = (testcode) => {
    return new Promise(function(resolve, reject) {
      $.post('/problemDescription', {
        "problemCode": testcode.split('/')[1],
        "contestCode": testcode.split('/')[0]
      }, (data) => {
        resolve(data);
      });
    });
  };

  const startTest = async () => {
    const testCodes = await JSON.parse(localStorage.getItem('testCode'));
    listDisplayRow.html("");
    const questionsFittedToTemplates = testCodes.map(async testcode => {
      const data = returnProblemDescription(testcode);
      return data;
    });

    const cumulativeData = await Promise.all(questionsFittedToTemplates);
    cumulativeData.forEach((data, index) => {
      data = JSON.parse(data).result.data.content;
      const { body, problemName } = data;
      console.log(data);
      listDisplayRow.append(`
        <div class="column">
          <div class="question card">
            <h5 id="problemcode" class="card-header">${problemName}</h5>
            <div class="card-body">
              <h5 class="card-title">Submission Details</h5>
              ${body}
              <form ref='uploadCode' id='uploadCode${parseInt(index)}' action='/codeUpload' method='post' encType="multipart/form-data">
                <textarea name="testCases" id = "myTextArea"
                rows = "10"
                cols = "50"></textarea>
                <br>
                <select name="languageChosen" id="languageChoices${parseInt(index)}"><select>
                <br>
                <br>
                <input type="file" name="code" />
                <input style="display: none" type="text" value="${problemName}" name="problemName"/>
                <input type='submit' value='Submit' />
              </form>
            </div>
          </div>
        </div>
      `);
      data.languagesSupported.forEach(language => {
        $(`#languageChoices${parseInt(index)}`).append(`
          <option value="${language}">${language}<option>
        `);
      });
    });
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
};
