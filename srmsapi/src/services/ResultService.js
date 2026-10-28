"use strict";

const ModelUtils = require("../utils/ModelUtils");
const { Result, Student, Subject, Exam, AcademicYear, MarksheetTemplate, School, CourseSubject, Course } = require("../db/models");
const { getKeysFromArray } = require("../helpers/helper");
const logger = require("../utils/logger");
const { ValidationError, NotFoundError } = require("../utils/applicationErrors");
const { success, failure } = require("../utils/serviceResult");
const { brandingAssetUrl } = require("../utils/brandingUrls");
const { resolveTemplateEntityField } = require("./marksheetTemplateEntities");

const markFields = ["theory_marks", "lab_marks", "attendance_marks", "activity_marks"];
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[char]);

const validateResultPayload = async (payload = {}, references = null) => {
  if (!payload.student_id || !payload.subject_id || !payload.exam_id || !payload.academic_year_id) {
    throw new ValidationError("student_id, subject_id, exam_id and academic_year_id are required");
  }

  const [student, subject, exam, academicYear] = references
    ? [
        references.students.get(String(payload.student_id)),
        references.subjects.get(String(payload.subject_id)),
        references.exams.get(String(payload.exam_id)),
        references.academicYears.get(String(payload.academic_year_id)),
      ]
    : await Promise.all([
        ModelUtils.findOne(Student, { _id: payload.student_id }, { select: "_id class academic_year_id" }),
        ModelUtils.findOne(Subject, { _id: payload.subject_id }, { select: "_id has_theory has_lab has_attendance has_activity" }),
        ModelUtils.findOne(Exam, { _id: payload.exam_id }, { select: "_id max_marks academic_year_id" }),
        ModelUtils.findOne(AcademicYear, { _id: payload.academic_year_id }, { select: "_id" }),
      ]);
  if (!student) throw new NotFoundError("Student");
  if (!subject) throw new NotFoundError("Subject");
  if (!exam) throw new NotFoundError("Exam");
  if (!academicYear) throw new NotFoundError("Academic year");
  const courseSubjectAssigned = references
    ? references.courseSubjects.has(`${String(student.class || "")}:${String(payload.subject_id)}`)
    : !!(student.class && await ModelUtils.findOne(CourseSubject, { course_id: student.class, subject_id: payload.subject_id }));
  const existingResult = !courseSubjectAssigned ? await ModelUtils.findOne(Result, {
    student_id: payload.student_id,
    subject_id: payload.subject_id,
    exam_id: payload.exam_id,
    academic_year_id: payload.academic_year_id,
  }) : null;
  if (!courseSubjectAssigned && !existingResult) {
    throw new ValidationError("The selected subject is not assigned to the student's course");
  }

  if (exam.academic_year_id && String(exam.academic_year_id) !== String(payload.academic_year_id)) {
    throw new ValidationError("The selected exam does not belong to the selected academic year");
  }

  const maxMarks = Number(exam.max_marks || 100);
  let total = 0;
  let hasAnyMark = false;
  const normalized = { ...payload };
  for (const field of markFields) {
    const raw = payload[field];
    if (raw === null || raw === undefined || raw === "") {
      normalized[field] = null;
      continue;
    }
    const mark = Number(raw);
    if (!Number.isFinite(mark) || mark < 0 || mark > maxMarks) {
      throw new ValidationError(`${field} must be between 0 and ${maxMarks}`);
    }
    normalized[field] = mark;
    total += mark;
    hasAnyMark = true;
  }
  const subjectComponents = [
    ["theory_marks", subject.has_theory !== false],
    ["lab_marks", !!subject.has_lab],
    ["attendance_marks", !!subject.has_attendance],
    ["activity_marks", !!subject.has_activity],
  ];
  for (const [field, enabled] of subjectComponents) {
    if (!enabled && normalized[field] !== null) throw new ValidationError(`${field} is not enabled for the selected subject`);
  }
  if (total > maxMarks) throw new ValidationError(`Total marks cannot exceed ${maxMarks}`);
  normalized.total_marks = hasAnyMark ? total : null;
  return normalized;
};

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
    const existing = await ModelUtils.findOne(Result, {
      student_id: payload.student_id,
      subject_id: payload.subject_id,
      exam_id: payload.exam_id,
      academic_year_id: payload.academic_year_id,
    });
    if (existing) return await updateResultById(existing._id, payload);
    const validated = await validateResultPayload(payload);
    const result = await ModelUtils.createAndReturn(Result, validated);
    return success(result);
  } catch (error) {
    return failure(error);
  }
};

const updateResultById = async (id, payload) => {
  try {
    if (!id || !payload) return success(null);
    const existing = await ModelUtils.findOne(Result, { _id: id });
    if (!existing) throw new NotFoundError("Result");
    const validated = await validateResultPayload({ ...existing, ...payload });
    const updated = await ModelUtils.updateAndReturn(Result, { _id: id }, validated);
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
    const rowsWithYear = rows.map(row => {
      const yearId = row.academic_year_id || academicYearId;
      if (!yearId) throw new ValidationError("academic_year_id is required for every result row");
      return { ...row, academic_year_id: yearId };
    });
    const studentIds = [...new Set(rowsWithYear.map(row => String(row.student_id || "")).filter(Boolean))];
    const subjectIds = [...new Set(rowsWithYear.map(row => String(row.subject_id || "")).filter(Boolean))];
    const examIds = [...new Set(rowsWithYear.map(row => String(row.exam_id || "")).filter(Boolean))];
    const yearIds = [...new Set(rowsWithYear.map(row => String(row.academic_year_id || "")).filter(Boolean))];
    const [studentRows, subjectRows, examRows, yearRows] = await Promise.all([
      ModelUtils.findAll(Student, { _id: { $in: studentIds } }, { select: "_id class academic_year_id" }),
      ModelUtils.findAll(Subject, { _id: { $in: subjectIds } }, { select: "_id has_theory has_lab has_attendance has_activity" }),
      ModelUtils.findAll(Exam, { _id: { $in: examIds } }, { select: "_id max_marks academic_year_id" }),
      ModelUtils.findAll(AcademicYear, { _id: { $in: yearIds } }, { select: "_id" }),
    ]);
    const references = {
      students: new Map(studentRows.map(row => [String(row._id), row])),
      subjects: new Map(subjectRows.map(row => [String(row._id), row])),
      exams: new Map(examRows.map(row => [String(row._id), row])),
      academicYears: new Map(yearRows.map(row => [String(row._id), row])),
      courseSubjects: new Set(),
    };
    const courseIds = [...new Set(studentRows.map(row => String(row.class || "")).filter(Boolean))];
    const courseSubjectRows = courseIds.length && subjectIds.length
      ? await ModelUtils.findAll(CourseSubject, { course_id: { $in: courseIds }, subject_id: { $in: subjectIds } }, { select: "course_id subject_id" })
      : [];
    courseSubjectRows.forEach(row => references.courseSubjects.add(`${String(row.course_id)}:${String(row.subject_id)}`));

    const normalizedRows = [];
    for (const row of rowsWithYear) {
      const validated = await validateResultPayload(row, references);
      normalizedRows.push({ ...validated, school_id: schoolId });
    }

    for (const payload of normalizedRows) {

      const where = {
        student_id: payload.student_id,
        subject_id: payload.subject_id,
        exam_id: payload.exam_id,
        academic_year_id: payload.academic_year_id,
      };

      const existingResult = await ModelUtils.findOne(Result, where);

      if (existingResult) {
        const updatedResult = await ModelUtils.updateAndReturn(Result, { _id: existingResult._id }, payload);
        const savedResult = updatedResult.rows?.[0] || await ModelUtils.findOne(Result, { _id: existingResult._id });
        if (savedResult) created.push(savedResult);
      } else {
        const createdResult = await ModelUtils.createAndReturn(Result, payload);
        if (createdResult) created.push(createdResult);
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

const generateMarksMatrix = (results = [], exams = [], courseSubjects = []) => {
  if (!exams.length) return "<p>No exams found</p>";

  const subjectMap = new Map();
  courseSubjects.forEach((row) => {
    const subject = row?.subject_id || row?.subject || row;
    const subjectId = String(subject?._id || "");
    if (subjectId) subjectMap.set(subjectId, { name: subject.subject_name || "Subject", marks: new Map() });
  });

  results.forEach((r) => {
    const subject = r.subject_id && typeof r.subject_id === "object" ? r.subject_id : null;
    const subjectId = String(subject?._id || r.subject_id || "");
    const exam = r.exam_id && typeof r.exam_id === "object" ? r.exam_id : null;
    const examId = String(exam?._id || r.exam_id || "");
    if (!subjectId || !examId) return;
    if (!subjectMap.has(subjectId)) subjectMap.set(subjectId, { name: subject?.subject_name || "Subject", marks: new Map() });
    const components = [r.theory_marks, r.lab_marks, r.activity_marks, r.attendance_marks];
    const entered = components.some(value => value !== null && value !== undefined);
    const total = r.total_marks !== null && r.total_marks !== undefined
      ? Number(r.total_marks)
      : entered ? components.reduce((sum, value) => sum + (Number(value) || 0), 0) : null;
    subjectMap.get(subjectId).marks.set(examId, total);
  });

  const subjects = Array.from(subjectMap.values());
  const examTotals = new Map(exams.map(e => [String(e._id || e.id), 0]));
  const examsWithMarks = new Set();
  let grandTotal = 0;
  let grandHasMarks = false;

  let html = '<table class="marks-table"><thead><tr>';
  html += "<th>Subject</th>";

  exams.forEach((e) => {
    html += `<th>${escapeHtml(e.exam_name || "Exam")}</th>`;
  });

  html += "<th>Total</th></tr></thead><tbody>";

  subjects.forEach((sub) => {
    let subjectTotal = 0;
    let subjectHasMarks = false;
    html += `<tr><td>${escapeHtml(sub.name)}</td>`;

    exams.forEach((e) => {
      const eid = String(e._id || e.id);
      const total = sub.marks.has(eid) ? sub.marks.get(eid) : null;
      html += `<td>${total === null ? "—" : total}</td>`;
      if (total !== null) {
        subjectHasMarks = true;
        grandHasMarks = true;
        subjectTotal += total;
        examTotals.set(eid, (examTotals.get(eid) || 0) + total);
        examsWithMarks.add(eid);
      }
    });

    html += `<td><b>${subjectHasMarks ? subjectTotal : "—"}</b></td></tr>`;
    if (subjectHasMarks) grandTotal += subjectTotal;
  });

  html += `<tr><td><b>Grand Total</b></td>`;

  exams.forEach((e) => {
    const eid = String(e._id || e.id);
    html += `<td><b>${examsWithMarks.has(eid) ? examTotals.get(eid) : "—"}</b></td>`;
  });

  html += `<td><b>${grandHasMarks ? grandTotal : "—"}</b></td></tr>`;

  html += "</tbody></table>";

  return html;
};

const gradeForPercentage = (percentage) => {
  if (percentage >= 91) return "A+";
  if (percentage >= 81) return "A";
  if (percentage >= 71) return "B+";
  if (percentage >= 61) return "B";
  if (percentage >= 51) return "C";
  if (percentage >= 41) return "D";
  return "E";
};

const generateDetailedMarksTable = (results = [], exams = [], courseSubjects = []) => {
  const subjectMap = new Map();
  courseSubjects.forEach((row) => {
    const subject = row?.subject_id || row?.subject || row;
    const id = String(subject?._id || "");
    if (id) subjectMap.set(id, { name: subject.subject_name || "Subject", marks: new Map() });
  });
  results.forEach((result) => {
    const subject = result.subject_id && typeof result.subject_id === "object" ? result.subject_id : null;
    const subjectId = String(subject?._id || result.subject_id || "");
    const exam = result.exam_id && typeof result.exam_id === "object" ? result.exam_id : null;
    const examId = String(exam?._id || result.exam_id || "");
    if (!subjectId || !examId) return;
    if (!subjectMap.has(subjectId)) subjectMap.set(subjectId, { name: subject?.subject_name || "Subject", marks: new Map() });
    const raw = result.total_marks !== null && result.total_marks !== undefined
      ? Number(result.total_marks)
      : markFields.reduce((sum, field) => sum + (Number(result[field]) || 0), 0);
    const hasMarks = result.total_marks !== null && result.total_marks !== undefined || markFields.some((field) => result[field] !== null && result[field] !== undefined);
    subjectMap.get(subjectId).marks.set(examId, hasMarks && Number.isFinite(raw) ? raw : null);
  });
  if (!exams.length) return "<p>No exams found</p>";

  const totals = new Map(exams.map((exam) => [String(exam._id || exam.id), { marks: 0, maximum: 0, hasMarks: false }]));
  let grandTotal = 0;
  let grandMaximum = 0;
  const examHeaders = exams.map((exam) => `<th class="exam-head" colspan="2">${escapeHtml(exam.exam_name || "Exam")}<br>(${escapeHtml(exam.max_marks || 100)} Marks)</th>`).join("");
  let body = "";
  for (const subject of subjectMap.values()) {
    let subjectTotal = 0;
    let subjectMaximum = 0;
    let subjectHasMarks = false;
    let cells = "";
    for (const exam of exams) {
      const id = String(exam._id || exam.id);
      const maximum = Number(exam.max_marks || 100);
      const mark = subject.marks.get(id);
      const percent = mark === null || mark === undefined ? null : Math.round((mark / maximum) * 100);
      cells += `<td>${mark === null || mark === undefined ? "—" : escapeHtml(mark)}</td><td>${percent === null ? "—" : `${percent}%`}</td>`;
      subjectMaximum += maximum;
      totals.get(id).maximum += maximum;
      if (mark !== null && mark !== undefined) {
        subjectTotal += mark;
        subjectHasMarks = true;
        const examTotal = totals.get(id);
        examTotal.marks += mark;
        examTotal.hasMarks = true;
      }
    }
    const subjectPercent = subjectMaximum ? `${Math.round((subjectTotal / subjectMaximum) * 100)}%` : "—";
    body += `<tr><td>${escapeHtml(subject.name)}</td>${cells}<td><b>${subjectHasMarks ? escapeHtml(subjectTotal) : "—"}</b></td><td>${subjectPercent}</td><td class="grade-cell">${subjectMaximum ? gradeForPercentage(subjectTotal / subjectMaximum * 100) : "—"}</td></tr>`;
    grandMaximum += subjectMaximum;
    if (subjectHasMarks) grandTotal += subjectTotal;
  }

  let examTotalCells = "";
  let examPercentCells = "";
  let examGradeCells = "";
  for (const exam of exams) {
    const total = totals.get(String(exam._id || exam.id));
    examTotalCells += `<td colspan="2">${total.hasMarks ? `${escapeHtml(total.marks)} / ${escapeHtml(total.maximum)}` : "—"}</td>`;
    const percent = total.maximum ? total.marks / total.maximum * 100 : 0;
    examPercentCells += `<td colspan="2">${total.hasMarks ? `${percent.toFixed(2)}%` : "—"}</td>`;
    examGradeCells += `<td colspan="2" class="grade-cell">${total.hasMarks ? gradeForPercentage(percent) : "—"}</td>`;
  }
  const overallPercent = grandMaximum ? grandTotal / grandMaximum * 100 : 0;
  body += `<tr><td class="summary-label">Total Marks Obtained</td>${examTotalCells}<td class="grand-total">${grandTotal} / ${grandMaximum}</td><td></td><td></td></tr>`;
  body += `<tr><td class="summary-label">Percentage</td>${examPercentCells}<td class="grand-total">${grandMaximum ? `${overallPercent.toFixed(2)}%` : "—"}</td><td></td><td></td></tr>`;
  body += `<tr><td class="summary-label">Grade</td>${examGradeCells}<td colspan="2" class="grade-cell">${grandMaximum ? gradeForPercentage(overallPercent) : "—"}</td></tr>`;
  return `<table class="marks-table"><thead><tr><th rowspan="2">Subject</th>${examHeaders}<th rowspan="2">Total</th><th rowspan="2">%</th><th rowspan="2">Grade</th></tr><tr>${exams.map(() => "<th>Obt.</th><th>%</th>").join("")}</tr></thead><tbody>${body}</tbody></table>`;
};

const generateCompleteMarksheet = async (studentId, examIds = [], templateId, academicYearId, promoted = false) => {
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
        { path: "subject_id", select: "id subject_name subject_code" },
        { path: "exam_id", select: "id exam_name max_marks" },
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
      select: "id name html_content is_active entities",
    });
    if (!template) throw new NotFoundError("Template");
    if (template.is_active === false) throw new ValidationError("This marksheet template is inactive");
    if (!template.html_content) throw new ValidationError("Template HTML content is empty");

    const resolvedAcademicYearId = academicYearId || results[0]?.academic_year_id || student.academic_year_id;
    const academicYear = resolvedAcademicYearId
      ? await ModelUtils.findOne(AcademicYear, { _id: resolvedAcademicYearId, school_id: student.school_id })
      : null;

    const school = student.school_id ? await ModelUtils.findOne(School, { _id: student.school_id }) : null;
    const classIsCourseId = /^[a-f\d]{24}$/i.test(String(student.class || ""));
    const course = student.class
      ? await ModelUtils.findOne(Course, {
          school_id: student.school_id,
          ...(classIsCourseId ? { _id: student.class } : { course_name: student.class }),
        }, { select: "course_name course_code" })
      : null;

    const courseSubjects = classIsCourseId
      ? await ModelUtils.findAll(CourseSubject, { course_id: student.class }, {
          populate: { path: "subject_id", select: "subject_name subject_code" },
        })
      : [];
    const validCourseSubjects = courseSubjects.filter(row => row.subject_id);
    const marksMatrix = generateMarksMatrix(results, exams, validCourseSubjects);

    const subjectCount = validCourseSubjects.length || new Set(results.map((r) => String(r.subject_id?._id || r.subject_id))).size;
    const maxTotal = subjectCount * exams.reduce((sum, exam) => sum + Number(exam.max_marks || 100), 0);
    const marksTable = generateDetailedMarksTable(results, exams, validCourseSubjects);

    let totalMarks = 0;
    const hasRecordedMarks = results.some(result => result.total_marks !== null && result.total_marks !== undefined || markFields.some(field => result[field] !== null && result[field] !== undefined));
    results.forEach((result) => {
      const rowTotal = result.total_marks !== null && result.total_marks !== undefined
        ? Number(result.total_marks)
        : markFields.reduce((sum, field) => sum + (Number(result[field]) || 0), 0);
      totalMarks += Number.isFinite(rowTotal) ? rowTotal : 0;
    });
    const remarksMatrix = hasRecordedMarks
      ? generateRemarksMatrix({ total: totalMarks, maxTotal })
      : "<p>No marks recorded</p>";
    const percentage = maxTotal > 0 ? (totalMarks / maxTotal) * 100 : 0;
    const attendanceMarks = results.reduce((sum, result) => sum + (Number(result.attendance_marks) || 0), 0);
    const gradeScale = `<table class="scale-table"><tbody>${[["91–100", "A+"], ["81–90", "A"], ["71–80", "B+"], ["61–70", "B"], ["51–60", "C"], ["41–50", "D"], ["Below 41", "E"]].map(([range, grade]) => `<tr><td>${range}</td><td>${grade}</td></tr>`).join("")}</tbody></table>`;
    const performanceRating = !hasRecordedMarks ? "Not Rated" : percentage >= 75 ? "Excellent" : percentage >= 50 ? "Good" : "Average";
    const performanceStarCount = !hasRecordedMarks ? 0 : percentage >= 90 ? 5 : percentage >= 75 ? 4 : percentage >= 60 ? 3 : percentage >= 40 ? 2 : 1;
    const performanceStars = `${"★".repeat(performanceStarCount)}${"☆".repeat(5 - performanceStarCount)}`;
    const promotionStatus = promoted ? "Promoted" : "Not Promoted";
    const overallRemarks = !hasRecordedMarks
      ? "No marks have been recorded; performance is not rated."
      : `Performance: ${performanceRating}. ${percentage >= 91 ? "Outstanding academic work." : percentage >= 75 ? "Strong academic work." : percentage >= 50 ? "Steady academic progress." : "Continue working consistently to improve academic progress."}`;
    const issueDate = new Date().toLocaleDateString("en-GB");
    let studentPhoto = "";
    try {
      const photoResult = await require("./StudentService").getStudentImage(student._id, student.school_id);
      const photo = photoResult?.data;
      if (photo?.buffer?.length) {
        const mimeType = /^image\/(png|jpeg|webp|gif)$/i.test(photo.mimeType || "") ? photo.mimeType : "image/jpeg";
        studentPhoto = `<img src="data:${mimeType};base64,${photo.buffer.toString("base64")}" alt="Student photo">`;
      }
    } catch (photoError) {
      logger.warn("Could not load student photo for marksheet", { studentId: String(student._id), message: photoError.message });
    }

    let html = template.html_content;

    const replacements = {
      "{{student_name}}": escapeHtml(student.name || "N/A"),
      "{{roll_number}}": escapeHtml(student.roll_number || "N/A"),
      "{{class}}": escapeHtml(course?.course_name || student.class || "N/A"),
      "{{marks_matrix}}": marksMatrix,
      "{{marks_table}}": marksTable,
      "{{remarks_matrix}}": remarksMatrix,
      "{{exam_name}}": escapeHtml(examIds.length > 1 ? "Multiple Exams" : (exams[0]?.exam_name || "N/A")),
      "{{session}}": escapeHtml(academicYear?.name || "N/A"),
      "{{date}}": escapeHtml(new Date().toLocaleDateString()),
      "{{school_name}}": escapeHtml(school?.school_name || school?.name || ""),
      "{{school_logo}}": escapeHtml(brandingAssetUrl(school, "logo") || school?.logo_url || school?.logo_path || ""),
      "{{current_date}}": escapeHtml(new Date().toLocaleDateString()),
      "{{total_marks}}": hasRecordedMarks ? escapeHtml(totalMarks) : "—",
      "{{max_marks}}": escapeHtml(maxTotal),
      "{{school_address}}": escapeHtml([school?.address, school?.city, school?.state, school?.pincode].filter(Boolean).join(", ")),
      "{{school_tagline}}": escapeHtml(school?.branding?.tagline || ""),
      "{{school_initials}}": escapeHtml(String(school?.school_name || school?.name || "S").split(/[^\p{L}\p{N}]+/u).filter(Boolean).map((word) => Array.from(word)[0]).join("").slice(0, 4) || "S"),
      "{{student_photo}}": studentPhoto,
      "{{father_name}}": escapeHtml(student.father_name || "N/A"),
      "{{mother_name}}": escapeHtml(student.mother_name || "N/A"),
      "{{admission_number}}": escapeHtml(student.admission_number || "N/A"),
      "{{date_of_birth}}": escapeHtml(student.dob ? new Date(student.dob).toLocaleDateString("en-GB") : "N/A"),
      "{{section}}": escapeHtml(student.section || "N/A"),
      "{{overall_percentage}}": hasRecordedMarks ? percentage.toFixed(2) : "0.00",
      "{{overall_grade}}": hasRecordedMarks ? gradeForPercentage(percentage) : "—",
      "{{result_status}}": escapeHtml(promotionStatus),
      "{{promotion_status}}": escapeHtml(promotionStatus),
      "{{performance_rating}}": escapeHtml(performanceRating),
      "{{performance_stars}}": escapeHtml(performanceStars),
      "{{attendance_marks}}": attendanceMarks,
      "{{exam_count}}": exams.length,
      "{{grade_scale}}": gradeScale,
      "{{overall_remarks}}": escapeHtml(overallRemarks),
      "{{issue_date}}": escapeHtml(issueDate),
      "{{marksheet_reference}}": escapeHtml(String(student._id)),
      "{{principal_name}}": escapeHtml(school?.principal_name || "Principal"),
    };

    Object.entries(replacements).forEach(([key, value]) => {
      html = html.replaceAll(key, String(value ?? "N/A"));
    });

    if (!template.html_content.includes("{{performance_stars}}")) {
      const starsHtml = `<div class="performance-stars" aria-label="${performanceStarCount} out of 5 stars">${performanceStars}</div>`;
      const ratingRow = html.match(/<div class=["']performance-rating["'][^>]*>[\s\S]*?<\/div>/i);
      const percentageRow = html.match(/<div class=["']overall-percent["'][^>]*>[\s\S]*?<\/div>/i);
      const anchor = ratingRow || percentageRow;
      if (anchor) html = html.replace(anchor[0], `${anchor[0]}${starsHtml}`);
    }

    const fallbackSubjects = [...new Map(results.map((result) => {
      const subject = result.subject_id && typeof result.subject_id === "object" ? result.subject_id : null;
      return [String(subject?._id || result.subject_id), { subject_id: subject }];
    })).values()].filter((row) => row.subject_id);
    const entityContext = {
      student,
      school,
      course,
      academicYear,
      exams,
      subjects: validCourseSubjects.length ? validCourseSubjects : fallbackSubjects,
      results,
      totalMarks,
      maxTotal,
    };
    for (const selection of template.entities || []) {
      for (const field of selection.fields || []) {
        const placeholder = `{{${selection.entity}.${field}}}`;
        const value = resolveTemplateEntityField(selection.entity, field, entityContext);
        html = html.replaceAll(placeholder, escapeHtml(value ?? ""));
      }
    }

    // Keep logo sizing/fallback consistent for older saved templates as well
    // as templates created from the current seed.
    const logoLayoutStyle = '<style>.school-crest{position:relative!important;overflow:hidden!important}.school-crest img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;padding:5px!important;object-fit:contain!important;background:#fff!important}.school-crest span{position:absolute!important;inset:0!important;display:flex!important;align-items:center!important;justify-content:center!important;pointer-events:none!important;z-index:0!important}.school-crest img{position:relative!important;z-index:1!important}.performance-stars{margin:3px 0;color:#d49a1e;font-size:13px;letter-spacing:2px;line-height:1}</style>';
    const a4PageLayoutStyle = /class=["'][^"']*\bannual-sheet\b/i.test(html)
      ? '<style>@page{size:A4 portrait;margin:10mm}.annual-sheet{box-sizing:border-box!important;width:190mm!important;max-width:190mm!important;height:277mm!important;min-height:277mm!important;display:flex!important;flex-direction:column!important;font-size:11px!important}.student-panel{min-height:35mm!important}.marks-area{flex:1 1 auto!important;min-height:0!important;display:flex!important;flex-direction:column!important}.marks-area .marks-table{flex:1 1 auto!important;height:100%!important}.summary-grid{min-height:48mm!important}.summary-card{height:100%!important}.signature-row{margin-top:auto!important;min-height:25mm!important}.school-heading h1{font-size:25px!important}.school-address,.school-tagline{font-size:10px!important}.session-box small{font-size:9px!important}.session-box strong{font-size:18px!important}.session-box span{font-size:7px!important}.title-ribbon{font-size:17px!important}.class-line{font-size:14px!important}.student-field{font-size:10px!important}.student-field strong{font-size:10px!important}.marks-table,.marks-table th,.marks-table td,.marks-table thead th{font-size:9px!important}.summary-card h3{font-size:10px!important}.overall-body .label{font-size:9px!important}.overall-score{font-size:15px!important}.overall-percent{font-size:22px!important}.overall-grade{font-size:16px!important}.performance-rating{font-size:11px!important}.performance-stars{font-size:14px!important}.result-pill{font-size:9px!important}.attendance-row{font-size:9px!important}.attendance-note{font-size:8px!important}.scale-table{font-size:9px!important}.scale-table td{padding:4px 7px!important}.remarks-body{font-size:9px!important}.remarks-status{font-size:8px!important}.issue-row,.school-motto,.signature{font-size:9px!important}.signature strong{font-size:9px!important}</style>'
      : '';
    const renderLayoutStyle = `${a4PageLayoutStyle}${logoLayoutStyle}`;
    if (/<\/head\s*>/i.test(html)) {
      html = html.replace(/<\/head\s*>/i, `${renderLayoutStyle}</head>`);
    } else if (/<\/style\s*>/i.test(html)) {
      html = html.replace(/<\/style\s*>/i, (closeStyle) => `${closeStyle}${renderLayoutStyle}`);
    } else {
      html = `${renderLayoutStyle}${html}`;
    }

    return success({
      html,
      metadata: {
        student: { id: student._id, name: student.name },
        exams: exams.length,
        subjects: subjectCount,
        totalMarks: hasRecordedMarks ? totalMarks : null,
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
