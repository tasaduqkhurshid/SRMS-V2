const ModelUtils = require('../utils/ModelUtils');
const { Result, Student, Subject, Exam, AcademicYear, MarksheetTemplate } = require('../db/models');
const { getKeysFromArray } = require('../helpers/helper');

/**
 * List results with filters
 * Supports pagination and optional filters: student_id, course_id (class), subject_id, exam_id, academic_year_id
 */
const listResultsByFilters = async ({ page = 1, limit = 50, student_id = null, course_id = null, subject_id = null, exam_id = null, academic_year_id = null } = {}) => {
  const pg = Math.max(1, Number(page || 1));
  const lim = Math.max(1, Number(limit || 50));
  const skip = (pg - 1) * lim;

  const where = {};
  if (student_id) where.student_id = student_id;
  if (subject_id) where.subject_id = subject_id;
  if (exam_id) where.exam_id = exam_id;
  if (academic_year_id) where.academic_year_id = academic_year_id;

  const options = { limit: lim, skip, sort: { _id: -1 } };
  
  // Build populate array for relationships
  const populateOptions = [
    { path: 'student_id', select: 'name class roll_number' },
    { path: 'subject_id', select: 'subject_name subject_code' },
    { path: 'exam_id', select: 'exam_name max_marks' },
    { path: 'academic_year_id', select: 'name' }
  ];
  
  // If course_id filter, we need to filter students by class
  if (course_id) {
    // Find students with the given class
    const students = await ModelUtils.findAll(Student, { class: course_id }, { select: 'id _id' });
    const studentIds = students.map(s => s._id);
    if (studentIds.length) {
      where.student_id = { $in: studentIds };
    } else {
      // No students in this class, return empty result
      return {
        meta: { page: pg, limit: lim, total: 0, pages: 0 },
        results: [],
      };
    }
  }

  options.populate = populateOptions;
  const result = await ModelUtils.findAndCountAll(Result, where, options);

  return {
    meta: { page: pg, limit: lim, total: result.count, pages: Math.ceil(result.count / lim) },
    results: result.rows,
  };
};

/**
 * Get single result by id with associations
 */
const getResultById = async (id) => {
  if (!id) return null;
  return await ModelUtils.findOne(Result, { _id: id }, {
    populate: [
      { path: 'student_id', select: 'name class roll_number' },
      { path: 'subject_id', select: 'subject_name subject_code' },
      { path: 'exam_id', select: 'exam_name max_marks' },
      { path: 'academic_year_id', select: 'name' },
    ],
  });
};

/**
 * Create a single result
 */
const createNewResult = async (payload) => {
  if (!payload) return null;
  return await ModelUtils.createAndReturn(Result, payload);
};

/**
 * Update a single result
 */
const updateResultById = async (id, payload) => {
  if (!id || !payload) return null;
  const updated = await ModelUtils.updateAndReturn(Result, { _id: id }, payload);
  if (updated && updated.rows && updated.rows.length) return updated.rows[0];
  return await getResultById(id);
};

/**
 * Delete a result
 */
const deleteResultById = async (id) => {
  if (!id) return false;
  await ModelUtils.remove(Result, { _id: id });
  return true;
};

/**
 * Bulk upsert results (theory_marks, lab_marks, attendance_marks, activity_marks, etc.)
 * Expects array of { student_id, subject_id, exam_id, academic_year_id, theory_marks, lab_marks, ... }
 * Idempotent: inserts or updates existing rows
 */
const bulkUpsertResults = async (rows = [], schoolId = null, academicYearId = null) => {
  if (!rows || !rows.length) return [];

  const db = require('../db/models');
  const created = [];

  for (const row of rows) {
    // Use academic_year_id from row first, then fallback to parameter
    const yearId = row.academic_year_id || academicYearId;
    
    if (!yearId) {
      console.warn('Warning: academic_year_id not provided for row:', row);
      continue;
    }

    const where = {
      student_id: row.student_id,
      subject_id: row.subject_id,
      exam_id: row.exam_id,
      academic_year_id: yearId,
    };

    const existingResult = await ModelUtils.findOne(Result, where);

    const payload = {
      ...row,
      student_id: row.student_id,
      subject_id: row.subject_id,
      exam_id: row.exam_id,
      academic_year_id: yearId,
      school_id: schoolId,
      theory_marks: row.theory_marks || null,
      lab_marks: row.lab_marks || null,
      attendance_marks: row.attendance_marks || null,
      activity_marks: row.activity_marks || null,
      total_marks: row.total_marks || null,
    };

    if (existingResult) {
      const updated = await updateResultById(existingResult._id, payload);
      if (updated) created.push(updated);
    } else {
      const created_row = await createNewResult(payload);
      if (created_row) created.push(created_row);
    }
  }

  return created;
};


/* =========================
   REMARKS MATRIX
========================= */
const generateRemarksMatrix = ({ total, maxTotal }) => {

  const percentage = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : 0;

  const grade =
    percentage >= 75 ? 'Distinction' :
    percentage >= 60 ? 'A' :
    percentage >= 50 ? 'B' :
    percentage >= 40 ? 'C' :
    'D';

  const result = percentage >= 35 ? 'Qualified' : 'Not Qualified';

  const behaviour =
    percentage >= 75 ? 'Excellent' :
    percentage >= 60 ? 'Good' :
    percentage >= 50 ? 'Satisfactory' :
    percentage >= 40 ? 'Average' :
    'Poor';

  return `
    <table class="remarks-table">
      <tr><td>Result</td><td>${result}</td></tr>
      <tr><td>Percentage</td><td>${percentage}%</td></tr>
      <tr><td>Grade</td><td>${grade}</td></tr>
      <tr><td>Behaviour</td><td>${behaviour}</td></tr>
      <tr><td>Overall Performance</td><td>${behaviour}</td></tr>
    </table>
  `;
};

/* =========================
   MARKS MATRIX
========================= */
const generateMarksMatrix = (results = [], exams = []) => {
  if (!results.length || !exams.length) return '<p>No results found</p>';

  const subjectMap = {};

  results.forEach(r => {
    if (!subjectMap[r.subject_id]) {
      subjectMap[r.subject_id] = {
        name: r.subject?.subject_name || 'Subject',
        marks: {}
      };
    }

    subjectMap[r.subject_id].marks[r.exam_id] = {
      theory: r.theory_marks || 0,
      lab: r.lab_marks || 0,
      activity: r.activity_marks || 0,
      attendance: r.attendance_marks || 0
    };
  });

  const subjects = Object.values(subjectMap);

  const examTotals = {};
  exams.forEach(e => examTotals[e.id] = 0);

  let grandTotal = 0;

  let html = '<table class="marks-table"><thead><tr>';
  html += '<th>Subject</th>';

  exams.forEach(e => {
    html += `<th>${e.exam_name}</th>`;
  });

  html += '<th>Total</th></tr></thead><tbody>';

  subjects.forEach(sub => {
    let subjectTotal = 0;
    html += `<tr><td>${sub.name}</td>`;

    exams.forEach(e => {
      const m = sub.marks[e.id] || { theory: 0, lab: 0, activity: 0, attendance: 0 };
      const total = m.theory + m.lab + m.activity + m.attendance;

      html += `<td>${total}</td>`;

      subjectTotal += total;
      examTotals[e.id] += total;
    });

    html += `<td><b>${subjectTotal}</b></td></tr>`;
    grandTotal += subjectTotal;
  });

  html += `<tr><td><b>Grand Total</b></td>`;

  exams.forEach(e => {
    html += `<td><b>${examTotals[e.id]}</b></td>`;
  });

  html += `<td><b>${grandTotal}</b></td></tr>`;

  html += '</tbody></table>';

  return html;
};

/* =========================
   COMPLETE MARKSHEET
========================= */
const generateCompleteMarksheet = async (studentId, examIds = [], templateId, academicYearId) => {
  try {
    // Validate inputs
    if (!studentId || !examIds.length || !templateId) {
      throw new Error('Missing required inputs: studentId, examIds (array), templateId');
    }

    const student = await ModelUtils.findOne(Student, { _id: studentId });
    if (!student) throw new Error(`Student with ID ${studentId} not found`);

    // Fetch results with all necessary includes
    const results = await ModelUtils.findAll(Result, {
      student_id: studentId,
      exam_id: { $in: examIds },
      ...(academicYearId && { academic_year_id: academicYearId })
    }, {
      populate: [
        { path: 'subject', select: 'id subject_name subject_code' },
        { path: 'exam', select: 'id exam_name max_marks' },
      ]
    });

    if (!results || !results.length) {
      throw new Error(`No results found for student ${studentId} in exams: ${examIds.join(', ')}`);
    }

    // Fetch exam details
    const exams = await ModelUtils.findAll(Exam, {
      _id: { $in: examIds }
    }, {
      select: 'id exam_name max_marks'
    });

    if (!exams || !exams.length) {
      throw new Error(`Exams not found: ${examIds.join(', ')}`);
    }

    // Fetch template
    const template = await ModelUtils.findOne(MarksheetTemplate, { _id: templateId }, {
      select: 'id name html_content'
    });
    if (!template) throw new Error(`Template with ID ${templateId} not found`);
    if (!template.html_content) throw new Error('Template HTML content is empty');

    // Fetch academic year if provided
    const academicYear = academicYearId
      ? await ModelUtils.findOne(AcademicYear, { _id: academicYearId })
      : null;

    // Generate marks matrix and remarks
    const marksMatrix = generateMarksMatrix(results, exams);

    const subjectCount = new Set(results.map(r => r.subject_id)).size;
    const maxMarksPerExam = exams[0]?.max_marks || 100;
    const maxTotal = subjectCount * exams.length * maxMarksPerExam;

    let totalMarks = 0;
    results.forEach(r => {
      totalMarks += Number(r.total_marks) || 0;
    });

    const remarksMatrix = generateRemarksMatrix({
      total: totalMarks,
      maxTotal
    });

    // Prepare HTML with replacements
    let html = template.html_content;

    const replacements = {
      '{{student_name}}': student.name || 'N/A',
      '{{roll_number}}': student.roll_number || 'N/A',
      '{{class}}': student.class || 'N/A',
      '{{marks_matrix}}': marksMatrix,
      '{{remarks_matrix}}': remarksMatrix,
      '{{exam_name}}': examIds.length > 1 ? 'Multiple Exams' : (exams[0]?.exam_name || 'N/A'),
      '{{session}}': academicYear?.name || 'N/A',
      '{{date}}': new Date().toLocaleDateString(),
      '{{school_name}}': 'School Name',
      '{{school_logo}}': 'https://your-school-logo-url.png',
      '{{current_date}}': new Date().toLocaleDateString(),
      '{{total_marks}}': String(totalMarks),
      '{{max_marks}}': String(maxTotal)
    };

    // Replace all placeholders
    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replaceAll(key, String(value || 'N/A'));
    });

    return {
      success: true,
      data: {
        html,
        metadata: {
          student: { id: student.id, name: student.name },
          exams: exams.length,
          subjects: subjectCount,
          totalMarks,
          maxMarks: maxTotal
        }
      }
    };

  } catch (error) {
    console.error('generateCompleteMarksheet error:', error.message);
    return { 
      success: false, 
      error: error.message || 'Unknown error generating marksheet'
    };
  }
};

module.exports = { listResultsByFilters, getResultById, createNewResult, updateResultById, deleteResultById, bulkUpsertResults, generateMarksMatrix, generateCompleteMarksheet, generateRemarksMatrix };
