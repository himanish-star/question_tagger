$(document).ready(function() {
  $().ready(function() {
    const usernameDisplay = $('#username_display');
    const logoutIcons = $('.logoutIcon');

    $.get('/userDetails', (data) => {
      console.log("check debug");
      usernameDisplay.text(data.username);
      localStorage.setItem('user_data', JSON.stringify(data));
    });

    console.log(logoutIcons);
    logoutIcons.each((i, icon) => {
      icon.onclick = (e) => {
        e.preventDefault();
        window.location.href = '/logout';
      };
    });
  });
});
