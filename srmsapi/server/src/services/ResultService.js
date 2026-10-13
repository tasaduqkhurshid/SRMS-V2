"use strict";

const ModelUtils = require("../utils/ModelUtils");
const { Result, Student, Subject, Exam, AcademicYear, MarksheetTemplate } = require("../db/models");
const { getKeysFromArray } = require("../helpers/helper");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");

const listResultsByFilters = async ({ page = 1, limit = 50, student_id = null, course_id = null, subject_id = null, exam_id = null, academic_year_id = null } = {}) => {
  try {
    const pg = Math.max(1, Number(page || 1));
    const lim = Math.max(1, Number(limit || 50));
    const skip = (pg - 1) * lim;

    const where = {};
    if (student_id) where.student_id = student_id;
    if (subject_id) where.subject_id = subject_id;
    if (exam_id) where.exam_id = exam_id;
    if (academic_year_id) where.academic_year_id = academic_year_id;

    const options = { limit: lim, skip, sort: { _id: -1 } };

    const populateOptions = [
      { path: "student_id", select: "name class roll_number" },
      { path: "subject_id", select: "subject_name subject_code" },
      { path: "exam_id", select: "exam_name max_marks" },
      { path: "academic_year_id", select: "name" },
    ];

    if (course_id) {
      const students = await ModelUtils.findAll(Student, { class: course_id }, { select: "id _id" });
      const studentIds = students.map((s) => s._id);
      if (studentIds.length) {
        where.student_id = { $in: studentIds };
      } else {
        return success({
          meta: { page: pg, limit: lim, total: 0, pages: 0 },
          results: [],
        });
      }
    }

    options.populate = populateOptions;
    const result = await ModelUtils.findAndCountAll(Result, where, options);

    return success({
      meta: { page: pg, limit: lim, total: result.count, pages: Math.ceil(result.count / lim) },
      results: result.rows,
    });
  } catch (error) {
    return failure(error);
  }
};

const getResultById = async (id) => {
  try {
    if (!id) return success(null);
    const result = await ModelUtils.findOne(Result, { _id: id }, {
      populate: [
        { path: "student_id", select: "name class roll_number" },
        { path: "subject_id", select: "subject_name subject_code" },
        { path: "exam_id", select: "exam_name max_marks" },
        { path: "academic_year_id", select: "name" },
      ],
    });
    return success(result);
  } catch (error) {
    return failure(error);
  }
};

const createNewResult = async (payload) => {
  try {
    if (!payload) return success(null);
    const result = await ModelUtils.createAndReturn(Result, payload);
    return success(result);
  } catch (error) {
    return failure(error);
  }
};

const updateResultById = async (id, payload) => {
  try {
    if (!id || !payload) return success(null);
    const updated = await ModelUtils.updateAndReturn(Result, { _id: id }, payload);
    if (updated && updated.rows && updated.rows.length) return success(updated.rows[0]);
    return await getResultById(id);
  } catch (error) {
    return failure(error);
  }
};

const deleteResultById = async (id) => {
  try {
    if (!id) return success(false);
    await ModelUtils.remove(Result, { _id: id });
    return success(true);
  } catch (error) {
    return failure(error);
  }
};

const bulkUpsertResults = async (rows = [], schoolId = null, academicYearId = null) => {
  try {
    if (!rows || !rows.length) return success([]);

    const created = [];

    for (const row of rows) {
      const yearId = row.academic_year_id || academicYearId;

      if (!yearId) {
        logger.warn("Warning: academic_year_id not provided for row:", row);
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
        const updatedResult = await updateResultById(existingResult._id, payload);
        if (updatedResult.error) return failure(updatedResult.error);
        if (updatedResult.data) created.push(updatedResult.data);
      } else {
        const createdResult = await createNewResult(payload);
        if (createdResult.error) return failure(createdResult.error);
        if (createdResult.data) created.push(createdResult.data);
      }
    }

    return success(created);
  } catch (error) {
    return failure(error);
  }
};

const generateRemarksMatrix = ({ total, maxTotal }) => {
  const percentage = maxTotal > 0 ? ((total / maxTotal) * 100).toFixed(2) : 0;

  const grade =
    percentage >= 75 ? "Distinction" :
    percentage >= 60 ? "A" :
    percentage >= 50 ? "B" :
    percentage >= 40 ? "C" :
    "D";

  const result = percentage >= 35 ? "Qualified" : "Not Qualified";

  const behaviour =
    percentage >= 75 ? "Excellent" :
    percentage >= 60 ? "Good" :
    percentage >= 50 ? "Satisfactory" :
    percentage >= 40 ? "Average" :
    "Poor";

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

const generateMarksMatrix = (results = [], exams = []) => {
  if (!results.length || !exams.length) return "<p>No results found</p>";

  const subjectMap = {};

  results.forEach((r) => {
    if (!subjectMap[r.subject_id]) {
      subjectMap[r.subject_id] = {
        name: r.subject?.subject_name || "Subject",
        marks: {},
      };
    }

    subjectMap[r.subject_id].marks[r.exam_id] = {
      theory: r.theory_marks || 0,
      lab: r.lab_marks || 0,
      activity: r.activity_marks || 0,
      attendance: r.attendance_marks || 0,
    };
  });

  const subjects = Object.values(subjectMap);

  const examTotals = {};
  exams.forEach((e) => {
    const eid = e._id || e.id;
    examTotals[eid] = 0;
  });

  let grandTotal = 0;

  let html = '<table class="marks-table"><thead><tr>';
  html += "<th>Subject</th>";

  exams.forEach((e) => {
    html += `<th>${e.exam_name}</th>`;
  });

  html += "<th>Total</th></tr></thead><tbody>";

  subjects.forEach((sub) => {
    let subjectTotal = 0;
    html += `<tr><td>${sub.name}</td>`;

    exams.forEach((e) => {
      const eid = e._id || e.id;
      const m = sub.marks[eid] || { theory: 0, lab: 0, activity: 0, attendance: 0 };
      const total = m.theory + m.lab + m.activity + m.attendance;

      html += `<td>${total}</td>`;

      subjectTotal += total;
      examTotals[eid] = (examTotals[eid] || 0) + total;
    });

    html += `<td><b>${subjectTotal}</b></td></tr>`;
    grandTotal += subjectTotal;
  });

  html += `<tr><td><b>Grand Total</b></td>`;

  exams.forEach((e) => {
    const eid = e._id || e.id;
    html += `<td><b>${examTotals[eid] || 0}</b></td>`;
  });

  html += `<td><b>${grandTotal}</b></td></tr>`;

  html += "</tbody></table>";

  return html;
};

const generateCompleteMarksheet = async (studentId, examIds = [], templateId, academicYearId) => {
  try {
    if (!studentId || !examIds.length || !templateId) {
      throw new ValidationError("Missing required inputs: studentId, examIds (array), templateId");
    }

    const student = await ModelUtils.findOne(Student, { _id: studentId });
    if (!student) throw new NotFoundError("Student");

    const results = await ModelUtils.findAll(Result, {
      student_id: studentId,
      exam_id: { $in: examIds },
      ...(academicYearId && { academic_year_id: academicYearId }),
    }, {
      populate: [
        { path: "subject", select: "id subject_name subject_code" },
        { path: "exam", select: "id exam_name max_marks" },
      ],
    });

    if (!results || !results.length) {
      throw new NotFoundError("Results");
    }

    const exams = await ModelUtils.findAll(Exam, {
      _id: { $in: examIds },
    }, {
      select: "id exam_name max_marks",
    });

    if (!exams || !exams.length) {
      throw new NotFoundError("Exams");
    }

    const template = await ModelUtils.findOne(MarksheetTemplate, { _id: templateId }, {
      select: "id name html_content",
    });
    if (!template) throw new NotFoundError("Template");
    if (!template.html_content) throw new ValidationError("Template HTML content is empty");

    const academicYear = academicYearId
      ? await ModelUtils.findOne(AcademicYear, { _id: academicYearId })
      : null;

    const marksMatrix = generateMarksMatrix(results, exams);

    const subjectCount = new Set(results.map((r) => r.subject_id)).size;
    const maxMarksPerExam = exams[0]?.max_marks || 100;
    const maxTotal = subjectCount * exams.length * maxMarksPerExam;

    let totalMarks = 0;
    results.forEach((r) => {
      totalMarks += Number(r.total_marks) || 0;
    });

    const remarksMatrix = generateRemarksMatrix({
      total: totalMarks,
      maxTotal,
    });

    let html = template.html_content;

    const replacements = {
      "{{student_name}}": student.name || "N/A",
      "{{roll_number}}": student.roll_number || "N/A",
      "{{class}}": student.class || "N/A",
      "{{marks_matrix}}": marksMatrix,
      "{{remarks_matrix}}": remarksMatrix,
      "{{exam_name}}": examIds.length > 1 ? "Multiple Exams" : (exams[0]?.exam_name || "N/A"),
      "{{session}}": academicYear?.name || "N/A",
      "{{date}}": new Date().toLocaleDateString(),
      "{{school_name}}": "School Name",
      "{{school_logo}}": "https://your-school-logo-url.png",
      "{{current_date}}": new Date().toLocaleDateString(),
      "{{total_marks}}": String(totalMarks),
      "{{max_marks}}": String(maxTotal),
    };

    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replaceAll(key, String(value || "N/A"));
    });

    return success({
      html,
      metadata: {
        student: { id: student._id, name: student.name },
        exams: exams.length,
        subjects: subjectCount,
        totalMarks,
        maxMarks: maxTotal,
      },
    });
  } catch (error) {
    return failure(error);
  }
};

module.exports = {
  listResultsByFilters,
  getResultById,
  createNewResult,
  updateResultById,
  deleteResultById,
  bulkUpsertResults,
  generateMarksMatrix,
  generateCompleteMarksheet,
  generateRemarksMatrix,
};