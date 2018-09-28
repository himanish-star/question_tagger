window.onload = () => {
  const tagToSearch = $('#tagToSearch');
  const tagSearchBtn = $('#tagSearchBtn');

  tagSearchBtn[0].onclick = (e) => {
    e.preventDefault();
    const tag = tagToSearch.val();

    if(!tag || tag === 'NA')
      return;

    $.post('/searchTag', {
      "tagName": tag
    },
    (data) => {
      fetchAndDisplayDetails(data);
      tagToSearch.val("");
    });
  };

  const fetchAndDisplayDetails = (problemCodes) => {
    
  };
};
