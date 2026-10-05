
import Dashboard from '../components/pages/dashboard/Dashboard';
import Login from '../components/pages/login/Login.js'
import StudentsIndex from '../components/pages/student/Index.js';
import SubjectsIndex from '../components/pages/subject/Index.js';
import CoursesIndex from '../components/pages/course/Index.js';
import ExamsIndex from '../components/pages/exam/Index.js';
import ResultsIndex from '../components/pages/result/Index.js';
import StudentWiseResults from '../components/pages/result/StudentWiseResults.js';
import CourseWiseResults from '../components/pages/result/CourseWiseResults.js';
import SubjectWiseResults from '../components/pages/result/SubjectWiseResults.js';
import GenerateMarksheet from '../components/pages/result/GenerateMarksheet.js';
import MarksheetTemplatesList from '../components/pages/template/MarksheetTemplatesList.js';
import AddEditMarksheetTemplate from '../components/pages/template/AddEditMarksheetTemplate.js';
import StudentImport from '../components/pages/import/StudentImport.js';
import ResultBook from '../components/pages/resultbook/ResultBook.js';
import SchoolProfile from '../components/pages/school/SchoolProfile.js';

const routes = [
  { path: '/', component: Login },
  { path: '/dashboard', component: Dashboard },
  { path: '/login', component: Login },

  // student routes
  { path: "/students", component: StudentsIndex },
  { path: "/students/import", component: StudentImport },
  // subjects
  { path: "/subjects", component: SubjectsIndex },
  // courses
  { path: "/courses", component: CoursesIndex },
  // exams
  { path: "/exams", component: ExamsIndex },
  // results
  { path: "/results", component: ResultsIndex },
  { path: "/results/student-wise", component: StudentWiseResults },
  { path: "/results/course-wise", component: CourseWiseResults },
  { path: "/results/subject-wise", component: SubjectWiseResults },
  { path: "/results/generate", component: GenerateMarksheet },
  { path: "/results/result-book", component: ResultBook },
  { path: "/results/result-book/class-wise", component: ResultBook },
  { path: "/results/result-book/student-wise", component: ResultBook },
  // templates
  { path: "/templates/marksheets", component: MarksheetTemplatesList },
  { path: "/templates/marksheets/add", component: AddEditMarksheetTemplate },
  { path: "/templates/marksheets/:id/edit", component: AddEditMarksheetTemplate },
  // school profile
  { path: "/school/profile", component: SchoolProfile },

];

export default routes;
