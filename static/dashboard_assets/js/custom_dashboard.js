window.onload = () => {
  const usernameDisplay = $('#username_display');

  $.get('/userDetails', (data) => {
    console.log("check debug");
    usernameDisplay.text(data.username);
    localStorage.setItem('user_data', JSON.stringify(data));
  });

};
