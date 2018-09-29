window.onload = () => {
  const listDisplay = $('#listDisplay');
  const usernameDisplay = $('#usernameDisplay');
  const logoutIcon = $('#logoutIcon');

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.reload();
  };

  usernameDisplay.text(JSON.parse(localStorage.getItem('user_data')).username);

  $.get('/fetchAllLinksOfSubmittedProblems', (data) => {
    processStatusOfLinks(JSON.parse(data));
  });

  const processStatusOfLinks = async (links) => {
    const promisifyLinks = links.map(async link => {
      const result = await fetchIndividualLinkStatus(link.problemLink);
      return { "problem": link.problemName,"result": result };
    });

    const results = await Promise.all(promisifyLinks);
    displayStatus(results);
  };

  const displayStatus = (list) => {
    listDisplay.html("");
    list.forEach(subpart => {
      const result = JSON.parse(subpart.result);
      console.log(result);
      if(result.result.data[0] !== "link") {
        listDisplay.append(`
          <div class="column">
            <div class="question card">
              <h5 class="card-header">${subpart.problem}</h5>
              <div class="card-body">
                <h5 class="card-title">Submission Details</h5>
                <br>
                <p>Input: ${result.result.data.input}</p>
                <p>Output: ${result.result.data.output}</p>
                <p>Stderr: ${result.result.data.stderr}</p>
                <p>Compiler Info: ${result.result.data.cmpinfo}</p>
              </div>
            </div>
          </div>
        `);
      } else {
        $.post('/deleteLinkOfProblem', {
          "problemName": subpart.problem
        }, (data) => {
          console.log(data);
        });
      }
    });
  }

  const fetchIndividualLinkStatus = (link) => {
    return new Promise((resolve, reject) => {
      $.post('/statusOfProblem', {
        "link": link
      }, (data) =>{
        resolve(data);
      })
    });
  };
};

/*
<div class="column">
  <div class="question card">
    <h5 id="problemcode${i}" class="card-header">${contest}/${problem}</h5>
    <div class="card-body">
      <h5 class="card-title">Submission Details</h5>
      <a href=${link} target="_blank" class="btn btn-primary">View</a>
      <a class="addForImprovement btn btn-success"><i class="material-icons">add</i></a>
    </div>
  </div>
</div>
*/
