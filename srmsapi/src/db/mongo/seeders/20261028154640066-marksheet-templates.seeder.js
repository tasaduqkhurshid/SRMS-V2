"use strict";

const MARKSHEET_TEMPLATE_NAME = "A4 Professional Annual Marksheet";

const htmlContent = String.raw`<style>
@page{size:A4 portrait;margin:10mm}
*{box-sizing:border-box}
.annual-sheet{--navy:#15345e;--blue:#24639b;--ink:#182a42;--muted:#617087;--line:#d3dfec;--pale:#f4f8fc;font-family:Arial,Helvetica,sans-serif;color:var(--ink);box-sizing:border-box;width:190mm;height:277mm;min-height:277mm;max-width:190mm;margin:0 auto;display:flex;flex-direction:column;background:#fff;border:1px solid #dce6f0;border-radius:8px;overflow:hidden;font-size:10px}
.sheet-head{position:relative;overflow:hidden;padding:15px 18px 0;background:linear-gradient(115deg,#fff 0%,#eff6fc 66%,#b8d4ea 100%);border-bottom:1px solid var(--line)}
.sheet-head:before{content:"";position:absolute;right:-25px;top:-72px;width:190px;height:230px;background:linear-gradient(145deg,#1b456f,#0b2343);border-radius:0 0 0 100%;transform:rotate(8deg);opacity:.98}
.sheet-head:after{content:"";position:absolute;right:0;bottom:0;width:46%;height:65px;background:linear-gradient(150deg,transparent 0 35%,rgba(36,99,155,.24) 36% 55%,rgba(19,58,98,.92) 56%);clip-path:polygon(28% 100%,72% 0,100% 0,100% 100%)}
.brand-row{position:relative;z-index:1;display:grid;grid-template-columns:76px 1fr 86px;gap:12px;align-items:center;min-height:78px}
.school-crest{width:70px;height:70px;border:2px solid #c99a37;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;box-shadow:0 2px 8px #18395824}
.school-crest{position:relative;flex:0 0 70px}.school-crest img{position:relative;z-index:1;display:block;width:100%;height:100%;padding:5px;object-fit:contain;background:#fff}.school-crest span{position:absolute;z-index:0;inset:0;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;color:var(--navy);font-size:24px;font-weight:700;pointer-events:none}
.school-heading{text-align:center;padding-right:6px}.school-heading h1{margin:0;color:#173760;font-family:Georgia,"Times New Roman",serif;font-size:23px;line-height:1.05;text-transform:uppercase;letter-spacing:.3px}.school-address{font-size:9px;margin:5px 0 7px;color:#394c62}.school-tagline{font-size:9px;color:#38526e;font-weight:600;letter-spacing:.15px}
.session-box{position:relative;z-index:2;text-align:center;color:#fff;padding:9px 3px}.session-box small{display:block;font-size:8px;text-transform:uppercase;letter-spacing:1px}.session-box strong{display:block;font-family:Georgia,serif;font-size:17px;margin:3px 0}.session-box span{font-size:6px;letter-spacing:.5px}
.title-ribbon{position:relative;z-index:2;width:67%;margin:14px auto 0;padding:7px 12px;text-align:center;color:#fff;background:linear-gradient(90deg,#183b68,#275f91,#183b68);font-weight:800;font-size:16px;letter-spacing:1px;clip-path:polygon(5% 0,95% 0,100% 50%,95% 100%,5% 100%,0 50%);box-shadow:0 3px 8px #163c6330}
.class-line{position:relative;z-index:2;text-align:center;color:var(--navy);font-size:13px;font-weight:800;letter-spacing:.7px;padding:4px 0 9px;text-transform:uppercase}
.student-panel{min-height:35mm;margin:10px 12px 8px;padding:9px;display:grid;grid-template-columns:88px 1fr;gap:12px;background:linear-gradient(110deg,#f8fbff,#eef5fc);border:1px solid #cfdeed;border-radius:8px;box-shadow:0 2px 5px #173e6310}
.student-photo-frame{height:104px;border:2px solid #fff;border-radius:6px;background:#dceafa;box-shadow:0 0 0 1px #b7cfe7;display:flex;align-items:center;justify-content:center;overflow:hidden;color:var(--navy);font-size:27px;font-weight:700}.student-photo-frame img{width:100%;height:100%;object-fit:cover}
.student-fields{display:grid;grid-template-columns:1fr 1fr;gap:0 18px;align-content:center}.student-field{display:grid;grid-template-columns:minmax(70px,39%) 8px 1fr;gap:4px;padding:3px 0;font-size:9px;line-height:1.35}.student-field label{color:#53647a}.student-field .colon{color:#8292a5}.student-field strong{color:#172b44;font-size:9px;overflow-wrap:anywhere}
.marks-area{padding:0 12px}.marks-area h2{display:none}.marks-table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;border:1px solid #cad8e7;border-radius:6px;overflow:hidden;font-size:8px}.marks-table th,.marks-table td{border-right:1px solid #d4e0ec;border-bottom:1px solid #d4e0ec;padding:5px 3px;text-align:center;overflow-wrap:anywhere}.marks-table thead th{background:#204e7a;color:#fff;font-size:8px;line-height:1.2}.marks-table thead tr:nth-child(2) th{background:#e6eff8;color:#284761;font-weight:700}.marks-table th:first-child,.marks-table td:first-child{text-align:left;padding-left:7px;width:18%}.marks-table tbody tr:nth-child(even){background:#f3f7fb}.marks-table tbody tr:last-child td{border-bottom:0}.marks-table .summary-label{font-weight:700;background:#e6f1fb;text-align:left}.marks-table .grand-total{font-weight:800;background:#d6e9fa}.marks-table .grade-cell{font-weight:700;color:#173b63}.marks-table .exam-head{background:#245985}.marks-table .empty-mark{color:#9aa7b7}
.summary-grid{display:grid;grid-template-columns:1fr 1fr 1.05fr 1.25fr;gap:8px;margin:9px 12px 0;align-items:stretch}.summary-card{border:1px solid #d3dfeb;border-radius:6px;overflow:hidden;min-height:124px;background:#fff}.summary-card h3{margin:0;padding:7px;color:#fff;font-size:9px;letter-spacing:.35px;text-transform:uppercase;min-height:29px}.summary-card h3 span{margin-right:5px}.overall-card h3{background:#388150}.attendance-card h3{background:#2477bf}.scale-card h3{background:#654eb0}.remarks-card h3{background:#c38c1d}
.overall-body{text-align:center;padding:8px 5px}.overall-body .label{font-size:8px;color:var(--muted)}.overall-score{font-size:14px;font-weight:800;color:var(--navy);margin:2px 0}.overall-percent{font-size:20px;font-weight:800;color:#37814d;margin:2px 0}.overall-grade{font-size:15px;font-weight:800;color:var(--navy)}.performance-rating{font-size:10px;font-weight:800;color:#286a98;margin:3px 0}.performance-stars{margin:3px 0;color:#d49a1e;font-size:13px;letter-spacing:2px;line-height:1}.result-pill{display:block;margin:4px auto 0;max-width:120px;padding:4px;border-radius:20px;background:#3b8752;color:#fff;font-size:8px;font-weight:800;letter-spacing:.5px}
.attendance-body{padding:8px}.attendance-row{display:flex;justify-content:space-between;gap:5px;padding:6px 2px;border-bottom:1px solid #e6edf4;font-size:8px}.attendance-row:last-of-type{border-bottom:0}.attendance-row strong{text-align:right}.attendance-note{font-size:7px;line-height:1.3;color:var(--muted);padding:5px 2px 0}
.scale-table{width:100%;border-collapse:collapse;font-size:8px}.scale-table td{padding:3px 6px;border-bottom:1px solid #e2e9f0}.scale-table tr:last-child td{border:0}.scale-table td:last-child{text-align:center;font-weight:700;color:var(--navy)}
.remarks-body{padding:9px;font-size:8px;line-height:1.45;color:#35465a}.remarks-body strong{color:var(--navy)}.remarks-status{display:inline-block;margin-top:7px;padding:4px 8px;border-radius:12px;background:#edf4fb;color:#214f7b;font-size:7px;font-weight:800;text-transform:uppercase}
.issue-row{display:flex;justify-content:space-between;gap:8px;margin:8px 14px 4px;font-size:8px;color:#596b7e}.school-motto{text-align:center;color:#a47522;font-family:Georgia,serif;font-size:8px;margin:4px auto 7px}.signature-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;padding:2px 18px 12px;align-items:end}.signature{text-align:center;font-size:8px;color:#526176}.signature-line{height:22px;border-bottom:1px solid #8796a7;margin-bottom:4px}.signature strong{display:block;color:#263e5c;font-size:8px}
/* Distribute the content across the printable A4 area. */
.annual-sheet{width:190mm;max-width:190mm;height:277mm;min-height:277mm;display:flex;flex-direction:column}
.marks-area{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.marks-area .marks-table{flex:1 1 auto;height:100%}
.summary-grid{min-height:48mm}.summary-card{height:100%}.signature-row{margin-top:auto;min-height:25mm}
/* Slightly larger, readable type throughout the sheet. */
.annual-sheet{font-size:11px}.school-heading h1{font-size:25px}.school-address,.school-tagline{font-size:10px}.session-box small{font-size:9px}.session-box strong{font-size:18px}.session-box span{font-size:7px}.title-ribbon{font-size:17px}.class-line{font-size:14px}
.student-field{font-size:10px}.student-field strong{font-size:10px}.marks-table,.marks-table th,.marks-table td{font-size:9px}.marks-table thead th{font-size:9px}
.summary-card h3{font-size:10px}.overall-body .label{font-size:9px}.overall-score{font-size:15px}.overall-percent{font-size:22px}.overall-grade{font-size:16px}.performance-rating{font-size:11px}.performance-stars{font-size:14px}.result-pill{font-size:9px}
.attendance-row{font-size:9px}.attendance-note{font-size:8px}.scale-table{font-size:9px}.scale-table td{padding:4px 7px}.remarks-body{font-size:9px}.remarks-status{font-size:8px}.issue-row,.school-motto,.signature{font-size:9px}.signature strong{font-size:9px}
@media print{.annual-sheet{max-width:none;border-radius:0;border:0;box-shadow:none}.student-panel,.marks-table,.summary-card{break-inside:avoid}.sheet-head{-webkit-print-color-adjust:exact;print-color-adjust:exact}.marks-table th,.marks-table td,.summary-card h3,.result-pill{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style>
<article class="annual-sheet">
  <header class="sheet-head">
    <div class="brand-row">
      <div class="school-crest"><img src="{{school_logo}}" alt="School logo" onerror="this.style.display='none'"><span>{{school_initials}}</span></div>
      <div class="school-heading"><h1>{{school_name}}</h1><p class="school-address">{{school_address}}</p><div class="school-tagline">{{school_tagline}}</div></div>
      <div class="session-box"><small>Session</small><strong>{{session}}</strong><span>LEARN&nbsp; | &nbsp;GROW&nbsp; | &nbsp;SUCCEED</span></div>
    </div>
    <div class="title-ribbon">STUDENT MARK SHEET</div>
    <div class="class-line">CLASS {{class}} &nbsp; · &nbsp; SECTION {{section}}</div>
  </header>

  <section class="student-panel">
    <div class="student-photo-frame">{{student_photo}}</div>
    <div class="student-fields">
      <div class="student-field"><label>Student Name</label><span class="colon">:</span><strong>{{student_name}}</strong></div>
      <div class="student-field"><label>Father's Name</label><span class="colon">:</span><strong>{{father_name}}</strong></div>
      <div class="student-field"><label>Roll Number</label><span class="colon">:</span><strong>{{roll_number}}</strong></div>
      <div class="student-field"><label>Mother's Name</label><span class="colon">:</span><strong>{{mother_name}}</strong></div>
      <div class="student-field"><label>Admission No.</label><span class="colon">:</span><strong>{{admission_number}}</strong></div>
      <div class="student-field"><label>Date of Birth</label><span class="colon">:</span><strong>{{date_of_birth}}</strong></div>
      <div class="student-field"><label>Class</label><span class="colon">:</span><strong>{{class}}</strong></div>
      <div class="student-field"><label>Academic Year</label><span class="colon">:</span><strong>{{session}}</strong></div>
      <div class="student-field"><label>Section</label><span class="colon">:</span><strong>{{section}}</strong></div>
      <div class="student-field"><label>Examination</label><span class="colon">:</span><strong>{{exam_name}}</strong></div>
    </div>
  </section>

  <section class="marks-area">{{marks_table}}</section>

  <section class="summary-grid">
    <article class="summary-card overall-card"><h3><span>★</span> Overall Result</h3><div class="overall-body"><div class="label">Total Marks</div><div class="overall-score">{{total_marks}} / {{max_marks}}</div><div class="label">Overall Percentage</div><div class="overall-percent">{{overall_percentage}}%</div><div class="label">Overall Grade</div><div class="overall-grade">{{overall_grade}}</div><div class="label">Performance</div><div class="performance-rating">{{performance_rating}}</div><div class="performance-stars">{{performance_stars}}</div><span class="result-pill">{{promotion_status}}</span></div></article>
    <article class="summary-card attendance-card"><h3><span>▦</span> Attendance</h3><div class="attendance-body"><div class="attendance-row"><span>Attendance component</span><strong>{{attendance_marks}}</strong></div><div class="attendance-row"><span>Exams recorded</span><strong>{{exam_count}}</strong></div><div class="attendance-note">Daily working-day attendance is not stored in this marksheet data.</div></div></article>
    <article class="summary-card scale-card"><h3><span>▥</span> Grade Scale</h3>{{grade_scale}}</article>
    <article class="summary-card remarks-card"><h3><span>▤</span> Remarks</h3><div class="remarks-body"><strong>{{student_name}}</strong> {{overall_remarks}}<span class="remarks-status">{{promotion_status}}</span></div></article>
  </section>

  <div class="issue-row"><span>Date of Issue: {{issue_date}}</span><span>Marksheet Ref: {{marksheet_reference}}</span></div>
  <div class="school-motto">— &nbsp; May Allah grant you continued success &nbsp; —</div>
  <footer class="signature-row"><div class="signature"><div class="signature-line"></div><strong>Class Teacher</strong></div><div class="signature"><div class="signature-line"></div><strong>Head of Academics</strong></div><div class="signature"><div class="signature-line"></div><strong>{{principal_name}}</strong></div></footer>
</article>`;

const seedMarksheetTemplates = async (db, schoolId) => {
  if (!db?.MarksheetTemplate || !schoolId) {
    throw new Error("MarksheetTemplate model and schoolId are required");
  }

  return db.MarksheetTemplate.findOneAndUpdate(
    { school_id: schoolId, name: MARKSHEET_TEMPLATE_NAME },
    {
      $setOnInsert: {
        name: MARKSHEET_TEMPLATE_NAME,
        html_content: htmlContent,
        is_active: true,
        school_id: schoolId,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

module.exports = { seedMarksheetTemplates, MARKSHEET_TEMPLATE_NAME, htmlContent };
