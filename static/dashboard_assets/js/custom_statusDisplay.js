window.onload = () => {
  const listDisplay = $('#listDisplay');
  const usernameDisplay = $('#usernameDisplay');
  const logoutIcon = $('#logoutIcon');

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
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
    if(list.length === 0) {
      alert("No Question Has Been Submitted Yet");
    }
    listDisplay.html("");
    list.forEach(subpart => {
      const result = JSON.parse(subpart.result);
      console.log(result);
      if(result.result.data[0] !== "link") {
        listDisplay.append(`
          <div class="column">
            <div class="question card">
              <h5 style="color: red; font-weight: bold;" class="card-header">${subpart.problem}</h5>
              <div class="card-body">
                <p><span style="color: blue; font-weight: bold;">Input: </span>${result.result.data.input}</p>
                <p><span style="color: blue; font-weight: bold;">Output: </span>${result.result.data.output}</p>
                <p><span style="color: blue; font-weight: bold;">Error: </span>${result.result.data.stderr}</p>
                <p><span style="color: blue; font-weight: bold;">Compiler Info: </span>${result.result.data.cmpinfo}</p>
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
        if(data === 'session expired') {
          alert('session expired, please login again');
          window.location.href = '/';
        }
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

