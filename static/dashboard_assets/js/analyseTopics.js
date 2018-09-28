window.onload = () => {
  const tagToSearch = $('#tagToSearch');
  const tagSearchBtn = $('#tagSearchBtn');
  const waitMessage = $('#waitMessage');
  const listDisplayRow = $('#listDisplay');

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

  const fetchAndDisplayDetails = async (problemCodes) => {
    const promiseArray = problemCodes.map(async problemCode => {
      const text = await fetchProblemStatus(problemCode);
      return JSON.parse(text);
    });
    const completeData = await Promise.all(promiseArray);
    localStorage.setItem('analysedTopic', JSON.stringify(completeData));
    displayDetails(completeData);
  };

  const displayDetails = (dataList) => {
    console.log(dataList);
    listDisplayRow.html('');
    dataList.forEach(async data => {
      const { AC, WA, RE, CTE, others, contest, problem} = await dataManipulate(data);
      const link = contest == "practice" ? `https://codechef.com/problems/${problem}`  :
        `https://codechef.com/${contest}/problems/${problem}`;
      listDisplayRow.append(`
        <div class="column">
          <div class="question card">
            <h5 class="card-header">${contest}/${problem}</h5>
            <div class="card-body">
              <h5 class="card-title">Submission Details</h5>
              <table class="table table-striped">
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>Accepted</td>
                    <td>${AC}</td>
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>Wrong Answer</td>
                    <td>${WA}</td>
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>Run Time Error</td>
                    <td>${RE}</td>
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td>Compile Time Error</td>
                    <td>${CTE}</td>
                  </tr>
                  <tr>
                    <th scope="row">5</th>
                    <td>Others</td>
                    <td>${others}</td>
                  </tr>
                </tbody>
              </table>
              <a href=${link} target="_blank" class="btn btn-primary">View</a>
            </div>
          </div>
        </div>
      `);
    });
  };

  const dataManipulate = (data) => {
    return new Promise((resolve, reject) => {
      const content = data.result.data.content;
      let AC = 0;
      let WA = 0;
      let RE = 0;
      let CTE = 0;
      let others = 0;
      let contest, problem;
      content.forEach(frags => {
        contest = frags.contestCode;
        problem = frags.problemCode;
        if(frags.result === 'AC')
          AC++;
        else if(frags.result === 'WA')
          WA++;
        else if(frags.result === 'RE')
          RE++;
        else if(frags.result === 'CTE')
          CTE++;
        else
          others++;
      });
      resolve({
        "AC": AC,
        "WA": WA,
        "RE": RE,
        "CTE": CTE,
        "others": others,
        "contest": contest,
        "problem": problem
      });
    });
  };

  const fetchProblemStatus = (problemcode) => {
    return new Promise((resolve, reject) => {
      $.post('/problemDetails', {
        "problemcode": problemcode
      },
      (data) => {
        resolve(data);
      });
    });
  }

  //so that we can use local storage as a cache
  if(localStorage.getItem('analysedTopic')) {
    displayDetails(JSON.parse(localStorage.getItem('analysedTopic')));
  }
};
/*
<div class="column">
  <div class="question card">
    <h5 class="card-header">Featured</h5>
    <div class="card-body">
      <h5 class="card-title">Special title treatment</h5>
      <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
      <a href="#" class="btn btn-primary">View</a>
    </div>
  </div>
</div>
*/