window.onload = () => {
  const fetchAllBtn = $('#fetchAllBtn');
  const fetchSomeBtn = $('#fetchSomeBtn');

  fetchSomeBtn[0].onclick = (e) => {
    e.preventDefault();
    $.get('/fetchUserQuestionsTable', (data) => {
      console.log(data.split(','));
      localStorage.setItem('userQuestionsList', data)
    })
  };
}
