const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[character])

export const sampleMarksTable = `
<table class="marks-table"><thead>
  <tr><th rowspan="2">Subject</th><th colspan="2">Unit Test-I<br>(50 Marks)</th><th colspan="2">Mid Term<br>(80 Marks)</th><th colspan="2">Pre Board<br>(80 Marks)</th><th colspan="2">Final Exam<br>(100 Marks)</th><th rowspan="2">Total</th><th rowspan="2">Grade</th></tr>
  <tr><th>Obt.</th><th>%</th><th>Obt.</th><th>%</th><th>Obt.</th><th>%</th><th>Obt.</th><th>%</th></tr>
</thead><tbody>
  <tr><td>English</td><td>38</td><td>76%</td><td>62</td><td>78%</td><td>68</td><td>85%</td><td>82</td><td>82%</td><td>250</td><td>A</td></tr>
  <tr><td>Urdu</td><td>42</td><td>84%</td><td>66</td><td>83%</td><td>70</td><td>88%</td><td>86</td><td>86%</td><td>264</td><td>A+</td></tr>
  <tr><td>Mathematics</td><td>36</td><td>72%</td><td>58</td><td>73%</td><td>64</td><td>80%</td><td>78</td><td>78%</td><td>236</td><td>A</td></tr>
  <tr><td>Science</td><td>40</td><td>80%</td><td>64</td><td>80%</td><td>66</td><td>83%</td><td>80</td><td>80%</td><td>250</td><td>A</td></tr>
  <tr><td class="summary-label">Total Marks Obtained</td><td colspan="2">288 / 350</td><td colspan="2">460 / 560</td><td colspan="2">516 / 560</td><td colspan="2">592 / 700</td><td class="grand-total">1856 / 2170</td><td></td></tr>
  <tr><td class="summary-label">Percentage</td><td colspan="2">82.29%</td><td colspan="2">82.14%</td><td colspan="2">92.14%</td><td colspan="2">84.57%</td><td class="grand-total">85.53%</td><td></td></tr>
  <tr><td class="summary-label">Grade</td><td colspan="2">A</td><td colspan="2">A</td><td colspan="2">A+</td><td colspan="2">A</td><td colspan="2" class="grade-cell">A</td></tr>
</tbody></table>`

const sampleGradeScale = '<table class="scale-table"><tbody><tr><td>91–100</td><td>A+</td></tr><tr><td>81–90</td><td>A</td></tr><tr><td>71–80</td><td>B+</td></tr><tr><td>61–70</td><td>B</td></tr><tr><td>51–60</td><td>C</td></tr><tr><td>41–50</td><td>D</td></tr><tr><td>Below 41</td><td>E</td></tr></tbody></table>'

const crestSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#c99a37" stroke-width="5"/><path d="M50 18 71 28v20c0 17-10 28-21 34C39 76 29 65 29 48V28z" fill="#15345e"/><text x="50" y="56" text-anchor="middle" font-family="Arial" font-size="18" font-weight="bold" fill="#fff">S</text></svg>')
const studentPhoto = '<div style="display:grid;place-items:center;width:100%;height:100%;background:linear-gradient(145deg,#dceafa,#b8d4ea);color:#15345e;font:bold 32px Arial">AD</div>'

export const renderMarksheetTemplatePreview = (html = '') => {
  const sampleValues = {
    school_logo: `data:image/svg+xml,${crestSvg}`,
    school_name: 'HANFIA NOOR UL AIZA ISLAMIA HIGH SCHOOL',
    school_address: 'Ara Khoshipora, Dooru, Anantnag, Jammu & Kashmir',
    school_tagline: 'Quality Education  ·  Islamic Values  ·  Bright Future',
    school_initials: 'HNA',
    session: '2026 - 27',
    class: '9th',
    section: 'A',
    student_photo: studentPhoto,
    student_name: 'Adil Ahmad Dar',
    father_name: 'Mohammad Yousuf Dar',
    mother_name: 'Shabnam Yousuf',
    roll_number: '09-012',
    admission_number: 'HNA-2024-0187',
    date_of_birth: '14-05-2011',
    exam_name: 'Annual Examination',
    date: '15-10-2026',
    current_date: '15-10-2026',
    marks_matrix: sampleMarksTable,
    marks_table: sampleMarksTable,
    remarks_matrix: '<p>Overall result: Promoted · Percentage: 85.53% · Grade: A</p>',
    total_marks: '1856',
    max_marks: '2170',
    overall_percentage: '85.53',
    overall_grade: 'A',
    result_status: 'Promoted',
    promotion_status: 'Promoted',
    performance_rating: 'Excellent',
    performance_stars: '★★★★★',
    attendance_marks: 'Recorded component marks: 0',
    exam_count: '4',
    grade_scale: sampleGradeScale,
    overall_remarks: 'has shown consistent academic performance throughout the academic year.',
    issue_date: '15-10-2026',
    marksheet_reference: 'SAMPLE-2026-0012',
    principal_name: 'Principal',
    'student.name': 'Adil Ahmad Dar',
    'student.roll_number': '09-012',
    'student.admission_number': 'HNA-2024-0187',
    'student.student_code': 'HNA-2026-0012',
    'student.father_name': 'Mohammad Yousuf Dar',
    'student.mother_name': 'Shabnam Yousuf',
    'student.dob': '14-05-2011',
    'student.gender': 'Male',
    'student.section': 'A',
    'student.address': 'Ara Khoshipora, Dooru',
    'student.pincode': '192211',
    'school.school_name': 'HANFIA NOOR UL AIZA ISLAMIA HIGH SCHOOL',
    'school.email': 'office@hanfia.example',
    'school.phone': '+91 12345 67890',
    'school.address': 'Ara Khoshipora, Dooru, Anantnag',
    'school.city': 'Anantnag',
    'school.state': 'Jammu & Kashmir',
    'school.pincode': '192211',
    'school.principal_name': 'Principal',
    'school.website': 'www.hanfia.example',
    'school.tagline': 'Quality Education · Islamic Values · Bright Future',
    'course.course_name': '9th',
    'course.course_code': '9th_grade',
    'course.description': 'Class 9',
    'academic_year.name': '2026 - 27',
    'academic_year.start_date': '01-04-2026',
    'academic_year.end_date': '31-03-2027',
    'exam.names': 'Unit Test-I, Mid Term, Pre Board, Final Exam',
    'exam.count': '4',
    'exam.max_marks': '310',
    'subject.names': 'English, Urdu, Mathematics, Science',
    'subject.count': '4',
    'result.total_marks': '1856',
    'result.max_marks': '2170',
    'result.percentage': '85.53',
    'result.theory_marks': '1720',
    'result.lab_marks': '48',
    'result.activity_marks': '36',
    'result.attendance_marks': '52'
  }

  return String(html).replace(/\{\{([a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*)*)\}\}/gi, (placeholder, key) => {
    if (!Object.prototype.hasOwnProperty.call(sampleValues, key)) return escapeHtml(`Sample ${key.replaceAll('_', ' ')}`)
    const value = sampleValues[key]
    return ['student_photo', 'marks_matrix', 'marks_table', 'remarks_matrix', 'grade_scale'].includes(key) ? value : escapeHtml(value)
  })
}
