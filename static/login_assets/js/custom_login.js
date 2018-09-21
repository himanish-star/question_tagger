window.onload = () => {
  const loginBtn = $('#loginBtn');

  loginBtn[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/login';
  };
};
