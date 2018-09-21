window.onload = () => {
  const usernameDisplay = $('#username_display');

  $.get('/userDetails', (data) => {
    usernameDisplay.text(data);
  });
};
