export default `
<section class="results-home-page">
  <header class="catalog-page-heading"><div><h1>Results</h1><p>Review, enter and publish student results</p></div></header>
  <div class="results-home-grid">
    <router-link to="/results/course-wise" class="results-home-card"><span class="results-home-icon"><i class="fa-solid fa-graduation-cap"></i></span><h2>Course-wise Results</h2><p>Review students and recorded marks by class, exam and academic year.</p><span class="results-home-link">View course results <i class="fa-solid fa-arrow-right"></i></span></router-link>
    <router-link to="/results/subject-wise" class="results-home-card"><span class="results-home-icon results-home-icon-green"><i class="fa-solid fa-book-open"></i></span><h2>Subject-wise Results</h2><p>Review marks for a subject across the selected class and exam.</p><span class="results-home-link">View subject results <i class="fa-solid fa-arrow-right"></i></span></router-link>
    <router-link to="/results/student-wise" class="results-home-card"><span class="results-home-icon results-home-icon-orange"><i class="fa-solid fa-user-graduate"></i></span><h2>Student-wise Results</h2><p>Find a student's recorded results across exams and academic years.</p><span class="results-home-link">View student results <i class="fa-solid fa-arrow-right"></i></span></router-link>
    <router-link to="/results/result-book/class-wise" class="results-home-card"><span class="results-home-icon results-home-icon-purple"><i class="fa-solid fa-pen-to-square"></i></span><h2>Result Book</h2><p>Enter and update marks for a class, subject and exam.</p><span class="results-home-link">Open result book <i class="fa-solid fa-arrow-right"></i></span></router-link>
    <router-link to="/results/generate" class="results-home-card"><span class="results-home-icon results-home-icon-blue"><i class="fa-solid fa-file-export"></i></span><h2>Generate Marksheet</h2><p>Preview student marksheets using an available template.</p><span class="results-home-link">Generate marksheets <i class="fa-solid fa-arrow-right"></i></span></router-link>
  </div>
</section>
`;
