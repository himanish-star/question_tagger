window.onload = () => {
  const markedQuestionsListUl = $('#taggedQuestionsList');

  $.get('/markedQuestions', (data) => {
    let markedQuestionsList = JSON.parse(data);
    markedQuestionsList = markedQuestionsList.filter(question => {
      return question.tagged;
    });
    markedQuestionsListUl.text("");
    markedQuestionsList.forEach((question, index) => {
      markedQuestionsListUl.append(`
        <tr>
          <td>${parseInt(index) + 1}</td>
          <td>${question.problemcode}</td>
          <td>${question.tags.join(", ")}</td>
        </tr>
      `);
    });
  });
};
