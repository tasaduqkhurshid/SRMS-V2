"use strict";

const TEMPLATE_1 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: Arial; margin: 20px; }

.container { max-width: 950px; margin: auto; border: 2px solid #333; padding: 20px; }

/* HEADER */
.header {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #333;
  padding-bottom: 10px;
}

.logo img { width: 70px; height: 70px; }

.school-title {
  flex: 1;
  text-align: center;
}

/* MAIN */
.main {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

/* MARKS */
.marks-area {
  flex: 3;
  position: relative;
}

.marks-area::before {
  content: "";
  position: absolute;
  background: url('{{school_logo}}') no-repeat center;
  background-size: 200px;
  opacity: 0.05;
  width: 100%;
  height: 100%;
}

.marks-table {
  border-collapse: collapse;
  width: 100%;
  position: relative;
}

.marks-table th, .marks-table td {
  border: 1px solid #333;
  padding: 8px;
  text-align: center;
}

.marks-table td:first-child { text-align: left; }

/* REMARKS */
.remarks-area { flex: 1.5; }

.remarks-table {
  width: 100%;
  border-collapse: collapse;
}

.remarks-table td {
  border: 1px solid #333;
  padding: 8px;
}

.remarks-table td:first-child {
  font-weight: bold;
  background: #f0f0f0;
}

/* FOOTER */
.footer {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  text-align: center;
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <div class="logo"><img src="{{school_logo}}" /></div>
    <div class="school-title">
      <h2>{{school_name}}</h2>
      <div>{{exam_name}} - {{session}}</div>
    </div>
  </div>

  <div class="main">
    <div class="marks-area">
      {{marks_matrix}}
    </div>

    <div class="remarks-area">
      {{remarks_matrix}}
    </div>
  </div>

  <div class="footer">
    <div>Teacher</div>
    <div>Principal</div>
    <div>Parent</div>
  </div>

</div>
</body>
</html>`;

const TEMPLATE_2 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { font-family: 'Segoe UI'; background: #f5f5f5; padding: 20px; }

.container { max-width: 900px; margin: auto; background: white; padding: 30px; border-radius: 8px; }

.header {
  display: flex;
  align-items: center;
  border-bottom: 3px solid #3498db;
  padding-bottom: 10px;
}

.logo img { width: 60px; }

.school-title { flex: 1; text-align: center; color: #2c3e50; }

.main { display: flex; gap: 20px; margin-top: 20px; }

.marks-area { flex: 3; position: relative; }

.marks-area::before {
  content: "";
  position: absolute;
  background: url('{{school_logo}}') no-repeat center;
  background-size: 200px;
  opacity: 0.05;
  width: 100%;
  height: 100%;
}

.marks-table {
  border-collapse: collapse;
  width: 100%;
}

.marks-table th {
  background: linear-gradient(#3498db,#2980b9);
  color: white;
  padding: 10px;
}

.marks-table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.remarks-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.footer { margin-top: 30px; text-align: center; }
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <div class="logo"><img src="{{school_logo}}" /></div>
    <div class="school-title">
      <h2>{{school_name}}</h2>
      <div>{{exam_name}}</div>
    </div>
  </div>

  <div class="main">
    <div class="marks-area">
      {{marks_matrix}}
    </div>

    <div class="remarks-area">
      {{remarks_matrix}}
    </div>
  </div>

  <div class="footer">
    Generated on {{current_date}}
  </div>

</div>
</body>
</html>`;

const TEMPLATE_3 = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
  font-family: 'Roboto';
  background: linear-gradient(135deg,#667eea,#764ba2);
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: auto;
  background: white;
  padding: 40px;
  border-radius: 10px;
}

.header {
  display: flex;
  align-items: center;
  border-bottom: 3px solid #667eea;
  padding-bottom: 10px;
}

.logo img { width: 60px; }

.school-title { flex: 1; text-align: center; color: #667eea; }

.main { display: flex; gap: 20px; margin-top: 20px; }

.marks-area { flex: 3; position: relative; }

.marks-area::before {
  content: "";
  position: absolute;
  background: url('{{school_logo}}') no-repeat center;
  background-size: 200px;
  opacity: 0.05;
  width: 100%;
  height: 100%;
}

.marks-table {
  border-collapse: collapse;
  width: 100%;
}

.marks-table th {
  background: linear-gradient(#667eea,#764ba2);
  color: white;
  padding: 10px;
}

.marks-table td {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.remarks-table td {
  border: 1px solid #ccc;
  padding: 8px;
}

.footer {
  margin-top: 30px;
  text-align: center;
}
</style>
</head>

<body>
<div class="container">

  <div class="header">
    <div class="logo"><img src="{{school_logo}}" /></div>
    <div class="school-title">
      <h2>{{school_name}}</h2>
      <div>{{exam_name}} - {{session}}</div>
    </div>
  </div>

  <div class="main">
    <div class="marks-area">
      {{marks_matrix}}
    </div>

    <div class="remarks-area">
      {{remarks_matrix}}
    </div>
  </div>

  <div class="footer">
    Generated on {{current_date}}
  </div>

</div>
</body>
</html>`;

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert("marksheet_templates", [
      { name: "Professional Classic", html_content: TEMPLATE_1, school_id: 1001, created_at: now, updated_at: now },
      { name: "Modern Blue", html_content: TEMPLATE_2, school_id: 1001, created_at: now, updated_at: now },
      { name: "Gradient Premium", html_content: TEMPLATE_3, school_id: 1001, created_at: now, updated_at: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("marksheet_templates", { school_id: 1001 });
  }
};