window.onload = () => {
  const updateBtn = $('#updateBtn');
  const listOfUnmarkedQuestions = $('#listOfUnmarkedQuestions');
  const userQuestionsList = localStorage.getItem('userQuestionsList');
  const usernameDisplay = $('#usernameDisplay');
  const logoutIcon = $('#logoutIcon');

  updateBtn[0].onclick = (e) => {
    e.preventDefault();
    $('#updateStartMessage').show();
    updateList();
  };

  logoutIcon[0].onclick = (e) => {
    e.preventDefault();
    window.location.href = '/logout';
  };

  usernameDisplay.text(JSON.parse(localStorage.getItem('user_data')).username);

  const updateList = () => {
    $.get('/updateUserQuestionsTable', (msg) => {
      if(msg === "session expired") {
        alert('session expired, please login again');
        window.location.href = "/login";
      }
      $('#updateStartMessage').hide();
      $('#updateEndMessage').show();
      setTimeout(() => {
        $('#updateEndMessage').hide();
        window.location.reload();
      }, 2000);
    });
  };

  const fetchList = () => {
    $('#waitMessage').show();
    $.get('/fetchUserQuestionsTable', (data) => {
      localStorage.setItem('userQuestionsList', data);
      displayList(data);
    })
  }

  const markQuestion = (index, elem, data) => {
    let selectedTags = $(`#ms-multipleTag${index} .ms-selection .ms-selected span`);

    if(selectedTags.length === 0) {
      return;
    } else {
      let tags = [];
      selectedTags.each((i, tag) => {
        tags.push(tag.innerText);
      });
      $.post('/markQuestion', {
        "problemcode": data[index].problemcode,
        "tags": tags
      }, (data) => {
        elem.disabled = true;
        window.location.reload();
      });
    }
  };

  const displayList = (data) => {
    const host = "https://www.codechef.com";
    data = JSON.parse(JSON.parse(data));
    listOfUnmarkedQuestions.text('');
    $('#waitMessage').hide();
    data = data.filter((problem) => {
      return !problem.tagged;
    });
    data.forEach((problem, i) => {
      const sectionPath = problem.category === 'Practice Problems' ? 'problems' : problem.category + '/problems';
      listOfUnmarkedQuestions.append(`
        <tr>
          <td>${parseInt(i)+1}</td>
          <td><a href="${host}/${sectionPath}/${problem.problemcode}">${problem.problemcode}</a></td>
          <td>${problem.status}</td>
          <td>${problem.category}</td>
          <td>
          <!-- Button trigger modal -->
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter${i}">
            Select
            </button>

            <!-- Modal -->
            <div class="modal fade" id="exampleModalCenter${i}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle${i}" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title" id="exampleModalCenterTitle${i}"><i style="color: blue">Scroll down</i> to view your marked labels,
                  marked labels are shown in <i style="color: red">red</i>
                  <br>
                  <i style="color: blue">To deselect a tag, click on it again</i>
                  </h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <select id="multipleTag${i}" multiple="multiple" class="form-control">
                    <option value="Mathematics">Mathematics</option>
                    <option value="Pigeonhole">Pigeonhole</option>
                    <option value="Probability">Probability</option>
                    <option value="Matrix exponentiation">Matrix exponentiation</option>
                    <option value="Inclusion-Exclusion">Inclusion-Exclusion</option>
                    <option value="Number Theory">Number Theory</option>
                    <option value="LCM">LCM</option>
                    <option value="GCD">GCD</option>
                    <option value="Prime factorization">Prime factorization</option>
                    <option value="Totient">Totient</option>
                    <option value="Sieves">Sieves</option>
                    <option value="Mathematical Theorems">Mathematical Theorems</option>
                    <option value="Chinese Remainder Theorem">Chinese Remainder Theorem</option>
                    <option value="Euclid's method">Euclid’s method</option>
                    <option value="Linear Diophantine Equations">Linear Diophantine Equations</option>
                    <option value="Divide and Conquer">Divide and Conquer</option>
                    <option value="Binary search applications">Binary search applications</option>
                    <option value="Recursion and Backtracking">Recursion and Backtracking</option>
                    <option value="Backtracking using Bitmasks">Backtracking using Bitmasks</option>
                    <option value="Dynamic Programming">Dynamic Programming</option>
                    <option value="Linear recurrences">Linear recurrences</option>
                    <option value="2-D and 3-D DP">2-D and 3-D DP</option>
                    <option value="DP using Bitmasks">DP using Bitmasks</option>
                    <option value="Greedy Algorithms">Greedy Algorithms</option>
                    <option value="Segment trees">Segment trees</option>
                    <option value="Lazy propagation">Lazy propagation</option>
                    <option value="Fenwick tree">Fenwick tree</option>
                    <option value="Binary Indexed Tree">Binary Indexed Tree</option>
                    <option value="Graphs">Graphs</option>
                    <option value="Traversals">Traversals</option>
                    <option value="Min spanning trees">Min spanning trees</option>
                    <option value="Topological sorting">Topological sorting</option>
                    <option value="Bipartite graphs">Bipartite graphs</option>
                    <option value="Cycle detection">Cycle detection</option>
                    <option value="Union-find">Union-find</option>
                    <option value="Game Theory">Game Theory</option>
                    <option value="MO’s Algorithm">MO’s Algorithm</option>
                  </select>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Continue</button>
                </div>
              </div>
            </div>
            </div>
          </td>
          <td><button class="btn markBtns btn-success">mark</button></td>
        </tr>
      `);
      $(`#multipleTag${i}`).multiSelect();
    });
    $('.markBtns').each((i, elem) => {
      elem.onclick = (e) => {
        e.preventDefault();
        markQuestion(i, elem, data);
      };
    });
  }

  //fetch on page load
  fetchList();
  //fetchList();
}
