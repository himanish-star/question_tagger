window.onload = () => {
  const tagToSearch = $('#tagToSearch');
  const tagSearchBtn = $('#tagSearchBtn');

  tagSearchBtn[0].onclick = (e) => {
    e.preventDefault();

    const tag = tagToSearch.val();

    if(!tag)
      return;

    $.post('/searchTag', {
      "tagName": tag
    },
    (data) => {
      console.log("Coming from the backend", data);
      tagToSearch.val("");
    });
  };
};
