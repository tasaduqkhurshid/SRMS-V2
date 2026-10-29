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
.annual-sheet{width:190mm;max-width:190mm;height:auto;min-height:277mm;display:flex;flex-direction:column;overflow:visible}
.marks-area{flex:0 0 auto;min-height:0;display:block}.marks-area .marks-table{width:100%;height:auto;flex:none}
.summary-grid{min-height:0}.summary-card{height:auto;min-height:42mm}.signature-row{margin-top:4mm;min-height:20mm}
/* Slightly larger, readable type throughout the sheet. */
.annual-sheet{font-size:11px}.school-heading h1{font-size:25px}.school-address,.school-tagline{font-size:10px}.session-box small{font-size:9px}.session-box strong{font-size:18px}.session-box span{font-size:7px}.title-ribbon{font-size:17px}.class-line{font-size:14px}
.student-field{font-size:10px}.student-field strong{font-size:10px}.marks-table,.marks-table th,.marks-table td{font-size:9px}.marks-table thead th{font-size:9px}
.summary-card h3{font-size:10px}.overall-body .label{font-size:9px}.overall-score{font-size:15px}.overall-percent{font-size:22px}.overall-grade{font-size:16px}.performance-rating{font-size:11px}.performance-stars{font-size:14px}.result-pill{font-size:9px}
.attendance-row{font-size:9px}.attendance-note{font-size:8px}.scale-table{font-size:9px}.scale-table td{padding:4px 7px}.remarks-body{font-size:9px}.remarks-status{font-size:8px}.issue-row,.school-motto,.signature{font-size:9px}.signature strong{font-size:9px}
@media print{.annual-sheet{max-width:none;border-radius:0;border:0;box-shadow:none}.student-panel,.marks-table,.summary-card{break-inside:avoid}.sheet-head{-webkit-print-color-adjust:exact;print-color-adjust:exact}.marks-table th,.marks-table td,.summary-card h3,.result-pill{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
\n/* READABILITY + EVEN SPACING OVERRIDES */
.annual-sheet{padding:5mm;gap:3mm;font-size:12px;height:auto;min-height:277mm;overflow:visible}
.sheet-head{padding:6mm 6mm 0}
.brand-row{gap:4mm}
.school-heading h1{font-size:27px;line-height:1.15}
.school-address,.school-tagline{font-size:11px;line-height:1.4}
.title-ribbon{padding:4mm;font-size:18px}
.class-line{padding:3mm;font-size:15px}
.student-panel{padding:4mm;gap:4mm;margin:4mm 4mm 3mm}
.student-field{font-size:11px;line-height:1.45;padding:2mm 0}
.student-field strong{font-size:11px}
.marks-area{padding:0 4mm}
.marks-table,.marks-table th,.marks-table td{font-size:10.5px;line-height:1.35}
.marks-table th,.marks-table td{padding:2.2mm 1.5mm}
.summary-grid{gap:3mm;margin:4mm 4mm 0;min-height:0;align-items:stretch}
.summary-card h3{padding:3mm;font-size:11px}
.overall-body,.attendance-body,.remarks-body{padding:3mm}
.overall-body .label,.attendance-row,.remarks-body{font-size:10px;line-height:1.45}
.scale-table{font-size:10px}
.scale-table td{padding:2mm 3mm}
.issue-row{margin:3mm 4mm 1mm;font-size:10px}
.school-motto{font-size:10px;margin:2mm auto 3mm}
.signature-row{gap:5mm;padding:2mm 5mm 4mm;min-height:18mm;margin-top:4mm}
.signature,.signature strong{font-size:10px}
@media print{.annual-sheet{height:auto;min-height:277mm;overflow:visible;padding:4mm}.marks-table th,.marks-table td{padding:1.8mm 1.2mm}}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}

img{max-width:100%}.student-field,.bb-fields div,.em-fields div,.mr-fields div{min-width:0}.student-field strong,.bb-fields strong,.em-fields strong,.mr-fields strong{min-width:0;overflow-wrap:anywhere}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}


/* FINAL LOGO / PHOTO SIZE REFINEMENTS */
.annual-sheet .school-crest{width:76px;height:76px;flex:0 0 76px;border-radius:50%;overflow:hidden}
.annual-sheet .student-photo-frame{height:116px;min-height:116px}
.annual-sheet .student-photo-frame img{width:100%;height:100%;object-fit:cover;object-position:center}

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

const blueBookletHtmlContent = String.raw`<style>
@page{size:A3 landscape;margin:10mm}*{box-sizing:border-box}
.blue-booklet{--navy:#12345a;--blue:#245f8d;--gold:#c49739;--ink:#1d2d40;--line:#c9d8e7;font-family:Arial,Helvetica,sans-serif;color:var(--ink);width:400mm;height:277mm;min-height:277mm;margin:0 auto;padding:5mm;background:linear-gradient(145deg,#fff 0%,#f4f8fb 62%,#e6eef5 100%);border:2px solid var(--navy);border-radius:12px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto auto;gap:4mm;overflow:hidden}
.bb-head{position:relative;padding:5mm 6mm 0;border:1px solid #d6e0e9;border-radius:8px;background:linear-gradient(120deg,#fff,#eaf3fa);overflow:hidden}.bb-head:after{content:"";position:absolute;right:-20mm;top:-22mm;width:68mm;height:68mm;border-radius:50%;background:linear-gradient(140deg,#1d4f7a,#102b4c)}.bb-brand{position:relative;z-index:1;display:grid;grid-template-columns:22mm 1fr 25mm;align-items:center;gap:4mm;min-height:26mm}.school-crest{width:20mm;height:20mm}.bb-title{text-align:center;color:var(--navy);font:700 18px Georgia,serif;letter-spacing:.4px}.bb-title small{display:block;margin-top:2mm;color:#647386;font:600 8px Arial,sans-serif;letter-spacing:.5px}.bb-session{z-index:1;color:white;text-align:center;font-size:8px}.bb-session strong{display:block;font:700 17px Georgia,serif}.bb-ribbon{position:relative;z-index:2;width:72%;margin:3mm auto 0;padding:3mm;text-align:center;color:#fff;background:var(--navy);border-radius:18px 18px 0 0;font-weight:800;font-size:15px;letter-spacing:1px}.bb-class{text-align:center;padding:2mm;color:var(--navy);font-weight:800;font-size:12px}
.bb-student{display:grid;grid-template-columns:27mm 1fr 34mm;gap:4mm;align-items:stretch;padding:4mm;border:1px solid var(--line);border-radius:8px;background:#fff}.bb-photo{height:34mm;display:grid;place-items:center;overflow:hidden;border:1px solid #b9cce0;border-radius:6px;background:#e9f2fa}.bb-photo img{width:100%;height:100%;object-fit:cover}.bb-fields{display:grid;grid-template-columns:1fr 1fr;align-content:center;gap:1.2mm 5mm}.bb-fields div{display:grid;grid-template-columns:24mm 4mm 1fr;gap:1mm;font-size:8px}.bb-fields label{color:#617286}.bb-fields strong{overflow-wrap:anywhere;color:#1e2e42}.bb-quote{align-self:center;padding:3mm;border-left:2px solid var(--gold);color:#5e6d7b;font:italic 10px/1.5 Georgia,serif}
.bb-marks{flex:1 1 auto;min-height:0;padding:0 1mm;display:flex;flex-direction:column}.bb-marks h2{margin:0 0 2mm;padding:2.5mm;text-align:center;background:var(--navy);color:#fff;border-radius:6px;font-size:11px;letter-spacing:.7px}.bb-marks .marks-table{flex:1;height:100%;width:100%;border-collapse:collapse;table-layout:fixed;font-size:7.5px}.bb-marks .marks-table th,.bb-marks .marks-table td{padding:1.5mm .7mm;border:1px solid #c7d5e2;text-align:center;overflow-wrap:anywhere}.bb-marks .marks-table th{background:#214f78;color:white}.bb-marks .marks-table td:first-child,.bb-marks .marks-table th:first-child{text-align:left}.bb-marks .marks-table tbody tr:nth-child(even){background:#eef4f9}
.bb-summary{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:3mm}.bb-card{border:1px solid #cbd9e6;border-radius:6px;overflow:hidden;background:white}.bb-card h3{margin:0;padding:2mm;background:linear-gradient(90deg,#173b65,#28628f);color:white;font-size:9px;text-transform:uppercase}.bb-card-body{padding:2mm;font-size:8px;line-height:1.45}.bb-card-body strong{color:var(--navy)}.bb-rating{color:#c28c20;letter-spacing:1px;font-size:12px}.bb-footer{display:flex;justify-content:space-between;align-items:end;gap:4mm;padding:2mm 3mm 0;border-top:1px solid #d8e0e8;font-size:8px}.bb-signatures{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7mm;flex:1;text-align:center}.bb-sign-line{height:9mm;border-bottom:1px solid #7b8997;margin-bottom:1mm}.bb-signatures strong{font-size:8px}
.bb-head{grid-column:1;grid-row:1;box-shadow:inset 0 0 0 1px #e8d5aa}.bb-student{grid-column:1;grid-row:2/4;display:flex;flex-direction:column;border-color:#c99536;border-radius:2px;box-shadow:inset 0 0 0 1px #ead5a8;padding:7mm;background:linear-gradient(180deg,#fff 0%,#f7f9fb 72%,#eaf1f6 100%)}.bb-photo{height:57mm;width:39mm;max-width:100%;align-self:center;border:2px solid #dfbd73;border-radius:5px}.bb-fields{grid-template-columns:1fr;gap:2.2mm}.bb-fields div{grid-template-columns:31mm 4mm 1fr;font-size:9px}.bb-quote{position:relative;margin-top:auto;text-align:center;font-size:14px;background:linear-gradient(0deg,#e9f0f5,transparent);padding:9mm 5mm;border-top:1px solid #d9e2e9}.bb-quote:before{content:'KNOWLEDGE · FAITH · CHARACTER';display:block;margin-bottom:4mm;color:#9a742e;font:700 7px Arial,sans-serif;letter-spacing:1px}.bb-marks{grid-column:2;grid-row:1/3;min-height:0;padding:3mm;border:1px solid #c99536;background:linear-gradient(180deg,#fff 0%,#fffdf8 100%);box-shadow:inset 0 0 0 1px #f0dfbd}.bb-marks h2{font-size:14px;letter-spacing:1px;border-radius:12px 12px 0 0}.bb-summary{grid-column:2;grid-row:3;grid-template-columns:1fr 1fr 1fr}.bb-footer{grid-column:2;grid-row:4;border-top:1px solid #c99536;padding-top:3mm}.bb-card h3{letter-spacing:.5px}.bb-card-body{line-height:1.55}.bb-book-spine{position:absolute;z-index:6;top:0;bottom:0;left:50%;width:3mm;transform:translateX(-50%);background:linear-gradient(90deg,#b27b22,#f4dc99 38%,#9f691d 62%,#e8c979);box-shadow:0 0 6mm #112b4650;pointer-events:none}
@media screen{.blue-booklet{position:relative;width:calc(100vw - 30px);height:auto;min-height:75vh;aspect-ratio:400/277;margin:10px auto;background:linear-gradient(90deg,#f3f7fa 0 49.7%,#c7a157 49.85%,#f2e5c2 50%,#a6792e 50.15%,#f3f7fa 50.3%)}.bb-student{min-height:0}.bb-fields div{font-size:clamp(7px,.75vw,9px)}.bb-quote{font-size:clamp(10px,1.1vw,14px)}}
\n/* READABILITY + EVEN SPACING OVERRIDES */
.blue-booklet{padding:7mm;gap:5mm;font-size:12px;min-height:277mm}
.bb-head{padding:6mm}
.bb-brand{gap:5mm}
.bb-title{font-size:22px;line-height:1.3}
.bb-title small{font-size:11px;line-height:1.5}
.bb-ribbon{padding:4mm;font-size:18px}
.bb-class{padding:3mm;font-size:14px}
.bb-student{padding:8mm;gap:5mm}
.bb-fields{gap:4mm}
.bb-fields div{grid-template-columns:32mm 4mm minmax(0,1fr);font-size:12px;line-height:1.5}
.bb-quote{font-size:16px;line-height:1.7;padding:10mm 6mm}
.bb-marks{padding:5mm}
.bb-marks h2{padding:4mm;font-size:16px}
.bb-marks .marks-table{font-size:11px}
.bb-marks .marks-table th,.bb-marks .marks-table td{padding:3mm 2mm;line-height:1.4}
.bb-summary{gap:4mm}
.bb-card h3{padding:3mm;font-size:12px}
.bb-card-body{padding:4mm;font-size:11px;line-height:1.7}
.bb-footer{padding:4mm;gap:5mm;font-size:11px}
.bb-signatures strong{font-size:11px}
@media screen{.bb-fields div{font-size:12px}.bb-quote{font-size:14px}}
@media print{.blue-booklet{height:auto;min-height:277mm;overflow:visible;padding:6mm}.bb-marks .marks-table th,.bb-marks .marks-table td{padding:2mm 1.2mm}}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}

img{max-width:100%}.student-field,.bb-fields div,.em-fields div,.mr-fields div{min-width:0}.student-field strong,.bb-fields strong,.em-fields strong,.mr-fields strong{min-width:0;overflow-wrap:anywhere}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}


/* FINAL LOGO / PHOTO SIZE REFINEMENTS */
.blue-booklet .school-crest{width:23mm;height:23mm;flex:0 0 23mm;border-radius:50%;overflow:hidden}
.blue-booklet .bb-photo{width:43mm;height:62mm;max-width:100%;align-self:center;overflow:hidden}
.blue-booklet .bb-photo img{width:100%;height:100%;object-fit:cover;object-position:center}

</style><article class="blue-booklet"><header class="bb-head"><div class="bb-brand"><div class="school-crest"><img src="{{school_logo}}" alt="School logo" onerror="this.style.display='none'"><span>{{school_initials}}</span></div><div class="bb-title">{{school_name}}<small>{{school_address}} · {{school_tagline}}</small></div><div class="bb-session">SESSION<strong>{{session}}</strong></div></div><div class="bb-ribbon">STUDENT MARK SHEET</div><div class="bb-class">CLASS {{class}} · SECTION {{section}} · {{exam_name}}</div></header>
<section class="bb-student"><div class="bb-photo">{{student_photo}}</div><div class="bb-fields"><div><label>Student</label><span>:</span><strong>{{student_name}}</strong></div><div><label>Father</label><span>:</span><strong>{{father_name}}</strong></div><div><label>Roll Number</label><span>:</span><strong>{{roll_number}}</strong></div><div><label>Mother</label><span>:</span><strong>{{mother_name}}</strong></div><div><label>Admission No.</label><span>:</span><strong>{{admission_number}}</strong></div><div><label>Date of Birth</label><span>:</span><strong>{{date_of_birth}}</strong></div><div><label>Academic Year</label><span>:</span><strong>{{session}}</strong></div><div><label>Issue Date</label><span>:</span><strong>{{issue_date}}</strong></div></div><div class="bb-quote">“Education is the light that guides us towards a better tomorrow.”</div></section>
<section class="bb-marks"><h2>ACADEMIC PERFORMANCE</h2>{{marks_table}}</section>
<section class="bb-summary"><article class="bb-card"><h3>OVERALL RESULT</h3><div class="bb-card-body">Total: <strong>{{total_marks}} / {{max_marks}}</strong><br>Percentage: <strong>{{overall_percentage}}%</strong><br>Grade: <strong>{{overall_grade}}</strong><br>{{performance_rating}} · <span class="bb-rating">{{performance_stars}}</span><br><strong>{{promotion_status}}</strong></div></article><article class="bb-card"><h3>GRADE SCALE</h3><div class="bb-card-body">{{grade_scale}}</div></article><article class="bb-card"><h3>REMARKS</h3><div class="bb-card-body">{{overall_remarks}}</div></article></section>
<footer class="bb-footer"><span>Ref: {{marksheet_reference}}</span><div class="bb-signatures"><div><div class="bb-sign-line"></div><strong>Class Teacher</strong></div><div><div class="bb-sign-line"></div><strong>Head of Academics</strong></div><div><div class="bb-sign-line"></div><strong>{{principal_name}}</strong></div></div></footer><div class="bb-book-spine" aria-hidden="true"></div></article>`;

const emeraldIslamicHtmlContent = String.raw`<style>
@page{size:A3 landscape;margin:10mm}*{box-sizing:border-box}
.emerald-sheet{--green:#176044;--dark:#104b38;--gold:#c99a3a;--ink:#24352e;--line:#c8d9ce;font-family:Georgia,"Times New Roman",serif;color:var(--ink);width:400mm;height:277mm;min-height:277mm;margin:0 auto;padding:5mm;background:#fbfaf4;border:2px solid #315f48;outline:1px solid #d0b56c;outline-offset:-3mm;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:auto minmax(0,1fr) auto auto;gap:4mm;overflow:hidden}
.em-head{position:relative;text-align:center;padding:3mm 5mm 0;border-bottom:2px solid var(--gold);background:linear-gradient(#fffdf8,#f5f2e7)}.em-head:before,.em-head:after{content:"❧";position:absolute;top:2mm;color:#567d5c;font-size:28px}.em-head:before{left:4mm}.em-head:after{right:4mm;transform:scaleX(-1)}.em-brand{display:grid;grid-template-columns:23mm 1fr 20mm;align-items:center;gap:3mm}.school-crest{width:19mm;height:19mm;border-color:var(--gold)}.em-school{color:#1e4835;font:bold 18px Georgia,serif;text-transform:uppercase;line-height:1.1}.em-school small{display:block;margin-top:2mm;color:#536458;font:8px Arial,sans-serif;text-transform:none}.em-session{color:#fff;background:var(--green);border-radius:20px;padding:2mm;font:700 8px Arial,sans-serif}.em-session strong{display:block;font:700 14px Georgia,serif}.em-ribbon{display:inline-block;margin:3mm auto 0;padding:2.5mm 13mm;color:white;background:var(--green);clip-path:polygon(5% 0,95% 0,100% 50%,95% 100%,5% 100%,0 50%);font:bold 14px Arial,sans-serif;letter-spacing:.8px}.em-class{padding:1.5mm;color:var(--dark);font:bold 11px Arial,sans-serif}.em-student{display:grid;grid-template-columns:28mm 1fr;gap:4mm;padding:4mm;border:1px solid #c5d5c8;border-radius:7px;background:#fff}.em-photo{height:33mm;border:2px solid #e6eadf;border-radius:50%;overflow:hidden;background:#eef3e9}.em-photo img{width:100%;height:100%;object-fit:cover}.em-fields{display:grid;grid-template-columns:1fr 1fr;gap:1mm 5mm;align-content:center}.em-fields div{display:grid;grid-template-columns:24mm 4mm 1fr;gap:1mm;font:8px Arial,sans-serif}.em-fields label{color:#637368}.em-fields strong{color:#20382b;overflow-wrap:anywhere}.em-blessing{text-align:center;color:#286345;font-size:15px;padding:1mm}
.em-marks{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.em-section-title{text-align:center;margin:0 0 2mm;padding:2.5mm;background:var(--green);color:#fff;border-radius:5px;font:bold 10px Arial,sans-serif;letter-spacing:.8px}.em-marks .marks-table{width:100%;height:100%;flex:1;border-collapse:collapse;table-layout:fixed;font:7.5px Arial,sans-serif}.em-marks .marks-table th,.em-marks .marks-table td{padding:1.4mm .7mm;text-align:center;border:1px solid #bdcec1;overflow-wrap:anywhere}.em-marks .marks-table th{background:#286b4d;color:white}.em-marks .marks-table td:first-child,.em-marks .marks-table th:first-child{text-align:left}.em-marks .marks-table tbody tr:nth-child(even){background:#edf4ee}
.em-bottom{display:grid;grid-template-columns:1.2fr .9fr 1fr;gap:3mm}.em-card{border:1px solid #bfd0c1;border-radius:5px;overflow:hidden;background:#fff}.em-card h3{margin:0;padding:2mm;background:#256448;color:white;font:bold 8px Arial,sans-serif;text-align:center}.em-card-body{padding:2mm;font:7.5px/1.45 Arial,sans-serif}.em-card-body .performance-stars{color:#c2932d;letter-spacing:1px}.em-result-grid{display:grid;grid-template-columns:1fr auto;gap:1mm 3mm}.em-footer{display:flex;align-items:end;justify-content:space-between;gap:4mm;padding:2mm 2mm 0;border-top:1px solid #c8d5c9;font:7px Arial,sans-serif}.em-quote{color:#49644f;font:italic 9px Georgia,serif}.em-signs{display:grid;grid-template-columns:repeat(3,1fr);gap:6mm;flex:1;text-align:center}.em-sign-line{height:8mm;border-bottom:1px solid #617567;margin-bottom:1mm}.em-signs strong{font-size:7px}
.em-head{grid-column:1;grid-row:1;padding:4mm 3mm 0;border:1px solid #b8c9aa;background:linear-gradient(145deg,#fdfcf5,#e8efe0)}.em-student{grid-column:1;grid-row:2;border-color:#aebf9d;border-radius:2px;background:linear-gradient(180deg,#fffdf8,#f6f3e7);box-shadow:inset 0 0 0 1px #e8dfc6}.em-photo{height:55mm;width:40mm;max-width:100%;justify-self:center;border:2px solid #b38a3b;border-radius:50%}.em-fields{grid-template-columns:1fr;gap:2.2mm}.em-fields div{grid-template-columns:31mm 4mm 1fr;font-size:9px}.em-blessing{grid-column:1;grid-row:3;align-self:center;text-align:center;font-size:22px;padding:7mm;color:#184b34;border-top:1px solid #c7a85a;background:linear-gradient(0deg,#f0efdf,transparent)}.em-marks{grid-column:2;grid-row:1/3;min-height:0;padding:3mm;border:1px solid #b99042;background:#fffefa;box-shadow:inset 0 0 0 1px #eee0bd}.em-marks h2{font:bold 12px Arial,sans-serif;text-align:center;color:#fff;background:#176044;padding:2.5mm;margin:0 0 2mm}.em-bottom{grid-column:2;grid-row:3;grid-template-columns:1.2fr .8fr 1fr}.em-footer{grid-column:1/-1;grid-row:4;border-top:1px solid #b99042}.em-book-spine{position:absolute;z-index:6;top:0;bottom:0;left:50%;width:3mm;transform:translateX(-50%);background:linear-gradient(90deg,#8a6325,#f0dfa6 40%,#8a6325 64%,#e8d48a);box-shadow:0 0 6mm #21432b45;pointer-events:none}
@media screen{.emerald-sheet{position:relative;width:calc(100vw - 30px);height:auto;min-height:75vh;aspect-ratio:400/277;margin:10px auto;background:linear-gradient(90deg,#fbfaf4 0 49.7%,#c3a15b 49.85%,#f5ebce 50%,#9c7838 50.15%,#fbfaf4 50.3%)}.em-fields div{font-size:clamp(7px,.75vw,9px)}.em-blessing{font-size:clamp(15px,1.7vw,22px)}}
\n/* READABILITY + EVEN SPACING OVERRIDES */
.emerald-sheet{padding:7mm;gap:5mm;font-size:12px}
.em-head{padding:6mm}
.em-brand{gap:5mm}
.em-school{font-size:22px;line-height:1.3}
.em-school small{font-size:11px;line-height:1.5}
.em-ribbon{padding:4mm 12mm;font-size:18px}
.em-class{padding:3mm;font-size:14px}
.em-student{padding:8mm;gap:5mm}
.em-fields{gap:4mm}
.em-fields div{grid-template-columns:32mm 4mm minmax(0,1fr);font-size:12px;line-height:1.5}
.em-blessing{padding:9mm 5mm;font-size:24px;line-height:1.7}
.em-marks{padding:5mm}
.em-section-title,.em-marks h2{padding:4mm;font-size:15px}
.em-marks .marks-table{font-size:11px}
.em-marks .marks-table th,.em-marks .marks-table td{padding:3mm 2mm;line-height:1.4}
.em-bottom{gap:4mm}
.em-card h3{padding:3mm;font-size:11px}
.em-card-body{padding:4mm;font-size:11px;line-height:1.7}
.em-footer{padding:4mm;gap:5mm;font-size:10px}
.em-signs strong{font-size:10px}
@media screen{.em-fields div{font-size:12px}.em-blessing{font-size:20px}}
@media print{.emerald-sheet{padding:6mm}.em-marks .marks-table th,.em-marks .marks-table td{padding:2mm 1.2mm}}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}

img{max-width:100%}.student-field,.bb-fields div,.em-fields div,.mr-fields div{min-width:0}.student-field strong,.bb-fields strong,.em-fields strong,.mr-fields strong{min-width:0;overflow-wrap:anywhere}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}


/* FINAL LOGO / PHOTO SIZE + TABLE WATERMARK */
.emerald-sheet .em-brand{grid-template-columns:26mm minmax(0,1fr) 20mm;gap:3mm}
.emerald-sheet .school-crest{width:23mm;height:23mm;flex:0 0 23mm;border-radius:50%;overflow:hidden}
.emerald-sheet .em-student{grid-template-columns:31mm minmax(0,1fr);align-items:center}
.emerald-sheet .em-photo{width:44mm;height:44mm;aspect-ratio:1/1;justify-self:center;align-self:center;flex:0 0 44mm;border-radius:50%;overflow:hidden;clip-path:circle(50% at 50% 50%)}
.emerald-sheet .em-photo img{display:block;width:100%;height:100%;aspect-ratio:1/1;object-fit:cover;object-position:center;border-radius:50%}
.emerald-sheet .em-marks{position:relative;isolation:isolate}
.emerald-sheet .em-marks:after{content:"";position:absolute;z-index:0;pointer-events:none;inset:14mm 8mm 10mm;background-image:url("{{school_logo}}");background-repeat:no-repeat;background-position:center;background-size:48mm auto;opacity:.075}
.emerald-sheet .em-marks>*{position:relative;z-index:1}
.emerald-sheet .em-marks .marks-table{position:relative;z-index:1;background-color:transparent}

</style><article class="emerald-sheet"><header class="em-head"><div class="em-brand"><div class="school-crest"><img src="{{school_logo}}" alt="School logo" onerror="this.style.display='none'"><span>{{school_initials}}</span></div><div class="em-school">{{school_name}}<small>{{school_address}} · {{school_tagline}}</small></div><div class="em-session">SESSION<strong>{{session}}</strong></div></div><div class="em-ribbon">STUDENT MARK SHEET</div><div class="em-class">ACADEMIC SESSION · {{session}} · CLASS {{class}} · SECTION {{section}}</div></header>
<section class="em-student"><div class="em-photo">{{student_photo}}</div><div class="em-fields"><div><label>Student Name</label><span>:</span><strong>{{student_name}}</strong></div><div><label>Father's Name</label><span>:</span><strong>{{father_name}}</strong></div><div><label>Roll Number</label><span>:</span><strong>{{roll_number}}</strong></div><div><label>Mother's Name</label><span>:</span><strong>{{mother_name}}</strong></div><div><label>Admission No.</label><span>:</span><strong>{{admission_number}}</strong></div><div><label>Date of Birth</label><span>:</span><strong>{{date_of_birth}}</strong></div></div></section>
<div class="em-blessing" lang="ar" dir="rtl">رَبِّ زِدْنِي عِلْمًا · My Lord, increase me in knowledge</div><section class="em-marks"><h2 class="em-section-title">SUBJECT WISE MARKS · {{exam_name}}</h2>{{marks_table}}</section>
<section class="em-bottom"><article class="em-card"><h3>RESULT SUMMARY</h3><div class="em-card-body em-result-grid"><span>Total Marks</span><strong>{{total_marks}} / {{max_marks}}</strong><span>Percentage</span><strong>{{overall_percentage}}%</strong><span>Overall Grade</span><strong>{{overall_grade}}</strong><span>Performance</span><strong>{{performance_rating}} · <span class="performance-stars">{{performance_stars}}</span></strong><span>Status</span><strong>{{promotion_status}}</strong></div></article><article class="em-card"><h3>ATTENDANCE</h3><div class="em-card-body">Recorded attendance marks: <strong>{{attendance_marks}}</strong><br>Exams included: <strong>{{exam_count}}</strong></div></article><article class="em-card"><h3>GRADE SCALE & REMARKS</h3><div class="em-card-body">{{grade_scale}}<br>{{overall_remarks}}</div></article></section>
<footer class="em-footer"><div><div class="em-quote">Knowledge · Faith · Character</div><div>Date: {{issue_date}} · Ref: {{marksheet_reference}}</div></div><div class="em-signs"><div><div class="em-sign-line"></div><strong>Class Teacher</strong></div><div><div class="em-sign-line"></div><strong>Head of Academics</strong></div><div><div class="em-sign-line"></div><strong>{{principal_name}}</strong></div></div></footer><div class="em-book-spine" aria-hidden="true"></div></article>`;

const maroonPremiumHtmlContent = String.raw`<style>
@page{size:A4 portrait;margin:10mm}*{box-sizing:border-box}
.maroon-sheet{--maroon:#721d2a;--deep:#51131e;--gold:#c89535;--ink:#2b2b2b;--line:#dfd1c7;font-family:Arial,Helvetica,sans-serif;color:var(--ink);width:190mm;height:277mm;min-height:277mm;margin:0 auto;padding:5mm;background:#fffdfa;border:1px solid #d9c8bd;display:flex;flex-direction:column;gap:4mm;overflow:hidden;position:relative}.maroon-sheet:before,.maroon-sheet:after{content:"";position:absolute;left:0;right:0;height:5mm;background:linear-gradient(90deg,var(--deep),var(--maroon),var(--gold),var(--maroon),var(--deep));z-index:0}.maroon-sheet:before{top:0}.maroon-sheet:after{bottom:0}
.mr-head{position:relative;z-index:1;display:grid;grid-template-columns:23mm 1fr 25mm;gap:4mm;align-items:center;padding:4mm 5mm 3mm;background:linear-gradient(100deg,#fff,#fcf5f0);border:1px solid #eadbd1;border-radius:7px}.school-crest{width:20mm;height:20mm;border-color:var(--gold)}.mr-school{text-align:center;color:var(--maroon);font:bold 19px Georgia,serif;text-transform:uppercase;line-height:1.1}.mr-school small{display:block;margin-top:2mm;color:#555;font:8px Arial,sans-serif;text-transform:none}.mr-session{padding:2mm;border-radius:6px;text-align:center;color:white;background:var(--deep);font-size:8px}.mr-session strong{display:block;font:bold 16px Georgia,serif}.mr-title{position:relative;z-index:2;width:70%;margin:-1mm auto 0;padding:2.5mm;text-align:center;color:#fff;background:var(--maroon);font:bold 14px Arial,sans-serif;letter-spacing:1px;clip-path:polygon(4% 0,96% 0,100% 50%,96% 100%,4% 100%,0 50%)}.mr-class{text-align:center;padding:1.5mm 8mm;border-radius:20px;background:#f4dfb7;color:#2c2722;font:bold 11px Arial,sans-serif;align-self:center}
.mr-student{display:grid;grid-template-columns:27mm 1fr;gap:4mm;padding:3.5mm;border:1px solid var(--line);border-radius:7px;background:#fff}.mr-photo{height:33mm;border:2px solid #f3e6d9;border-radius:5px;overflow:hidden;background:#e5eff7}.mr-photo img{width:100%;height:100%;object-fit:cover}.mr-fields{display:grid;grid-template-columns:1fr 1fr;gap:1mm 6mm;align-content:center}.mr-fields div{display:grid;grid-template-columns:25mm 4mm 1fr;font:8px Arial,sans-serif}.mr-fields label{color:#6d625d}.mr-fields strong{overflow-wrap:anywhere;color:#342b29}
.mr-marks{flex:1 1 auto;min-height:0;display:flex;flex-direction:column}.mr-marks .marks-table{width:100%;height:100%;flex:1;border-collapse:collapse;table-layout:fixed;font:7.5px Arial,sans-serif}.mr-marks .marks-table th,.mr-marks .marks-table td{padding:1.4mm .7mm;border:1px solid #dfd2c9;text-align:center;overflow-wrap:anywhere}.mr-marks .marks-table th{background:var(--maroon);color:#fff}.mr-marks .marks-table thead tr:nth-child(2) th{background:#f4e9de;color:#4c3834}.mr-marks .marks-table td:first-child,.mr-marks .marks-table th:first-child{text-align:left}.mr-marks .marks-table tbody tr:nth-child(even){background:#fbf5f0}
.mr-summary{display:grid;grid-template-columns:1fr .9fr .9fr 1.1fr;gap:3mm}.mr-card{border:1px solid var(--line);border-radius:6px;overflow:hidden;background:#fff}.mr-card h3{margin:0;padding:2mm;background:var(--maroon);color:#fff;font:bold 8px Arial,sans-serif;text-transform:uppercase}.mr-card-body{padding:2.5mm;font:8px/1.45 Arial,sans-serif}.mr-overall{text-align:center}.mr-overall .big-percent{color:var(--maroon);font:bold 21px Georgia,serif}.mr-overall .mr-grade{font:bold 14px Georgia,serif;color:#302522}.mr-stars{color:var(--gold);font-size:12px;letter-spacing:1px}.mr-status{display:block;margin:1mm auto 0;padding:1.5mm;border-radius:20px;max-width:35mm;background:var(--maroon);color:#fff;font-weight:bold}.mr-attendance div{display:flex;justify-content:space-between;gap:2mm;padding:1mm 0;border-bottom:1px solid #eee}.mr-attendance div:last-child{border:0}.mr-remarks{color:#544943}.mr-footer{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5mm;align-items:end;padding:2mm 3mm 4mm;text-align:center;font:7.5px Arial,sans-serif}.mr-sign-line{height:8mm;border-bottom:1px solid #82766f;margin-bottom:1mm}.mr-footer strong{font-size:8px}.mr-ref{grid-column:1/-1;text-align:left;color:#665b55}
\n/* READABILITY + EVEN SPACING OVERRIDES */
.maroon-sheet{padding:6mm;gap:4mm;font-size:12px}
.mr-head{padding:5mm;gap:5mm}
.mr-school{font-size:22px;line-height:1.25}
.mr-school small{font-size:11px;line-height:1.5}
.mr-title{padding:4mm;font-size:18px}
.mr-class{padding:3mm;font-size:14px}
.mr-student{padding:4mm;gap:4mm}
.mr-fields{gap:2mm 5mm}
.mr-fields div{grid-template-columns:28mm 4mm minmax(0,1fr);font-size:11px;line-height:1.5}
.mr-marks .marks-table{font-size:10.5px}
.mr-marks .marks-table th,.mr-marks .marks-table td{padding:2.2mm 1.5mm;line-height:1.4}
.mr-summary{gap:3mm}
.mr-card h3{padding:3mm;font-size:11px}
.mr-card-body{padding:3mm;font-size:10.5px;line-height:1.6}
.mr-footer{gap:5mm;padding:3mm 3mm 5mm;font-size:10px}
.mr-footer strong{font-size:10px}
@media print{.maroon-sheet{height:auto;min-height:277mm;overflow:visible;padding:5mm}.mr-marks .marks-table th,.mr-marks .marks-table td{padding:1.8mm 1.2mm}}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}

img{max-width:100%}.student-field,.bb-fields div,.em-fields div,.mr-fields div{min-width:0}.student-field strong,.bb-fields strong,.em-fields strong,.mr-fields strong{min-width:0;overflow-wrap:anywhere}

/* SCHOOL LOGO: keep the complete logo visible; initials appear only if image fails. */
.school-crest{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.school-crest img{position:relative;z-index:2;display:block;width:100%;height:100%;max-width:100%;max-height:100%;padding:3px;object-fit:contain;object-position:center;background:#fff}
.school-crest span{position:absolute;z-index:1;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;font-size:clamp(12px,1.2vw,22px);font-weight:700;line-height:1.1;background:#fff;color:#173760}


/* FINAL LOGO / PHOTO SIZE REFINEMENTS */
.maroon-sheet .school-crest{width:23mm;height:23mm;flex:0 0 23mm;border-radius:50%;overflow:hidden}
.maroon-sheet .mr-student{grid-template-columns:31mm minmax(0,1fr)}
.maroon-sheet .mr-photo{height:38mm;width:29mm;max-width:100%;overflow:hidden}
.maroon-sheet .mr-photo img{width:100%;height:100%;object-fit:cover;object-position:center}

</style><article class="maroon-sheet"><header class="mr-head"><div class="school-crest"><img src="{{school_logo}}" alt="School logo" onerror="this.style.display='none'"><span>{{school_initials}}</span></div><div class="mr-school">{{school_name}}<small>{{school_address}} · {{school_tagline}}</small></div><div class="mr-session">SESSION<strong>{{session}}</strong>LEARN · GROW · SUCCEED</div></header><div class="mr-title">STUDENT MARK SHEET</div><div class="mr-class">CLASS {{class}} · SECTION {{section}} · {{exam_name}}</div>
<section class="mr-student"><div class="mr-photo">{{student_photo}}</div><div class="mr-fields"><div><label>Student Name</label><span>:</span><strong>{{student_name}}</strong></div><div><label>Father's Name</label><span>:</span><strong>{{father_name}}</strong></div><div><label>Roll Number</label><span>:</span><strong>{{roll_number}}</strong></div><div><label>Mother's Name</label><span>:</span><strong>{{mother_name}}</strong></div><div><label>Admission No.</label><span>:</span><strong>{{admission_number}}</strong></div><div><label>Date of Birth</label><span>:</span><strong>{{date_of_birth}}</strong></div><div><label>Academic Year</label><span>:</span><strong>{{session}}</strong></div><div><label>Issue Date</label><span>:</span><strong>{{issue_date}}</strong></div></div></section>
<section class="mr-marks">{{marks_table}}</section><section class="mr-summary"><article class="mr-card"><h3>Overall Result</h3><div class="mr-card-body mr-overall">Total Marks<br><strong>{{total_marks}} / {{max_marks}}</strong><div class="big-percent">{{overall_percentage}}%</div>Overall Grade<div class="mr-grade">{{overall_grade}}</div><div>{{performance_rating}}</div><div class="mr-stars">{{performance_stars}}</div><span class="mr-status">{{promotion_status}}</span></div></article><article class="mr-card"><h3>Attendance</h3><div class="mr-card-body mr-attendance"><div><span>Attendance marks</span><strong>{{attendance_marks}}</strong></div><div><span>Exams recorded</span><strong>{{exam_count}}</strong></div></div></article><article class="mr-card"><h3>Grade Scale</h3><div class="mr-card-body">{{grade_scale}}</div></article><article class="mr-card"><h3>Remarks</h3><div class="mr-card-body mr-remarks">{{student_name}} {{overall_remarks}}</div></article></section>
<footer class="mr-footer"><div><div class="mr-sign-line"></div><strong>Class Teacher</strong></div><div><div class="mr-sign-line"></div><strong>Head of Academics</strong></div><div><div class="mr-sign-line"></div><strong>{{principal_name}}</strong></div><div class="mr-ref">Date of Issue: {{issue_date}} · Marksheet Ref: {{marksheet_reference}}</div></footer></article>`;

const MARKSHEET_TEMPLATES = [
  { name: MARKSHEET_TEMPLATE_NAME, html_content: htmlContent },
  {
    name: "Blue & Gold Booklet Marksheet",
    html_content: blueBookletHtmlContent,
  },
  {
    name: "Emerald Islamic Marksheet",
    html_content: emeraldIslamicHtmlContent,
  },
  { name: "Maroon Premium Marksheet", html_content: maroonPremiumHtmlContent },
];

const seedMarksheetTemplates = async (db, schoolId) => {
  if (!db?.MarksheetTemplate || !schoolId) {
    throw new Error("MarksheetTemplate model and schoolId are required");
  }

  const seededTemplates = [];

  for (const { name, html_content } of MARKSHEET_TEMPLATES) {
    const template = await db.MarksheetTemplate.findOneAndUpdate(
      { school_id: schoolId, name },
      {
        $set: { html_content },
        $setOnInsert: {
          school_id: schoolId,
          name,
          is_active: true,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    seededTemplates.push(template);
  }

  return seededTemplates;
};
module.exports = {
  seedMarksheetTemplates,
  MARKSHEET_TEMPLATE_NAME,
  MARKSHEET_TEMPLATES,
  htmlContent,
};
