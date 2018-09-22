window.onload = () => {
  const fetchAllBtn = $('#fetchAllBtn');
  const fetchSomeBtn = $('#fetchSomeBtn');
  const mainPanel = $('#mainPanel');
  const sidebarCollapsible = $('#sidebarCollapsible');
  const sidebarCollapsibleIcon = $('#sidebarCollapsibleIcon');
  const listOfUnmarkedQuestions = $('#listOfUnmarkedQuestions');

  sidebarCollapsibleIcon[0].onclick = (e) => {
    e.preventDefault();
    if(sidebarCollapsible[0].style.display !== 'none') {
      sidebarCollapsible.hide();
      mainPanel[0].style.width = 'calc(100%)';
    } else {
      sidebarCollapsible.show();
      mainPanel[0].style.width = 'calc(100% - 260px)';
    }
  }

  fetchSomeBtn[0].onclick = (e) => {
    e.preventDefault();
    fetchList();
  };

  const fetchList = () => {
    $.get('/fetchUserQuestionsTable', (data) => {
      localStorage.setItem('userQuestionsList', data);
      displayList(data);
    })
  }

  const displayList = (data) => {
    data = JSON.parse(data);
    data.forEach((problem, i) => {
      listOfUnmarkedQuestions.append(`
        <tr>
          <td>${parseInt(i)+1}</td>
          <td>${problem.problemcode}</td>
          <td>${problem.status}</td>
          <td>${problem.category}</td>
          <td>
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
          </td>
          <td><button class="btn btn-warn">mark</button></td>
        </tr>
      `);
      $(`#multipleTag${i}`).multiselect();
    });
    $('.multiselect-container').each((i, parElem) => {
      Array(parElem.getElementsByTagName('label')).forEach(elem => {
        for(let index=0; index<elem.length; index++) {
          elem[index].style.width = '200px';
        }
      });
    });
  }

  //fetch on page load
  fetchList();
}
