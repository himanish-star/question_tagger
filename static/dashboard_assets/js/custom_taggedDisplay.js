window.onload = () => {
  const markedQuestionsListUl = $('#taggedQuestionsList');
  const usernameDisplay = $('#usernameDisplay');
  const logoutIcon = $('#logoutIcon');

  usernameDisplay.text(JSON.parse(localStorage.getItem('user_data')).username);

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
  };

  $.get('/markedQuestions', (data) => {
    let markedQuestionsList = JSON.parse(data);
    markedQuestionsList = markedQuestionsList.filter(question => {
      return question.tagged;
    });
    if(markedQuestionsList.length === 0) {
      alert("No Questions Marked yet");
    }
    markedQuestionsListUl.text("");
    markedQuestionsList.forEach((question, index) => {
      markedQuestionsListUl.append(`
        <tr>
          <td>${parseInt(index) + 1}</td>
          <td id="problemCodeToUnmark${index}">${question.problemcode}</td>
          <td>${question.tags.join(", ")}</td>
          <td><button class="btn btn-danger" id="unmarkBtn${index}">unmark</button><td>
        </tr>
      `);
      $(`#unmarkBtn${index}`)[0].onclick = (e) => {
        e.preventDefault();
        $.post('/unmarkQuestion', {
          "problemCode": $(`#problemCodeToUnmark${index}`).text()
        }, (data) => {
          window.location.reload();
        });
      };
    });
  });
};

