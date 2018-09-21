window.onload = () => {
  const loginBtn = $('#loginBtn');
  const logStatus = $('#logStatus');

  $.get('/getUserDetails', (data) => {
    logStatus[0].innerText = data;
  });

  loginBtn[0].addEventListener('click', () => {
    window.location.href = '/login';
  })
};
