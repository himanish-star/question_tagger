window.onload = () => {
  const usernameDisplay = $('#username_display');
  const logoutIcon = $('#logoutIcon');

  $.get('/userDetails', (data) => {
    console.log("check debug");
    usernameDisplay.text(data.username);
    localStorage.setItem('user_data', JSON.stringify(data));
  });

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
  };
};
