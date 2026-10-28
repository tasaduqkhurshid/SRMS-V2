"use strict";

const MARKSHEET_ENTITIES = [
  { key: "student", label: "Student", fields: [
    ["name", "Student name"], ["roll_number", "Roll number"], ["admission_number", "Admission number"],
    ["student_code", "Student ID"], ["father_name", "Father name"], ["mother_name", "Mother name"],
    ["dob", "Date of birth"], ["gender", "Gender"], ["section", "Section"], ["address", "Address"], ["pincode", "PIN code"],
  ] },
  { key: "school", label: "School", fields: [
    ["school_name", "School name"], ["email", "Email"], ["phone", "Phone"], ["address", "Address"],
    ["city", "City"], ["state", "State"], ["pincode", "PIN code"], ["principal_name", "Principal name"],
    ["website", "Website"], ["tagline", "Tagline"],
  ] },
  { key: "course", label: "Class / Course", fields: [["course_name", "Course name"], ["course_code", "Course code"], ["description", "Description"]] },
  { key: "academic_year", label: "Academic year", fields: [["name", "Year name"], ["start_date", "Start date"], ["end_date", "End date"]] },
  { key: "exam", label: "Selected exams", fields: [["names", "Exam names"], ["count", "Exam count"], ["max_marks", "Maximum marks total"]] },
  { key: "subject", label: "Subjects", fields: [["names", "Subject names"], ["count", "Subject count"]] },
  { key: "result", label: "Results", fields: [
    ["total_marks", "Total marks"], ["max_marks", "Maximum marks"], ["percentage", "Percentage"],
    ["theory_marks", "Theory marks"], ["lab_marks", "Lab marks"], ["activity_marks", "Activity marks"],
    ["attendance_marks", "Attendance component marks"],
  ] },
].map((entity) => ({ ...entity, fields: entity.fields.map(([key, label]) => ({ key, label })) }));

const entityByKey = new Map(MARKSHEET_ENTITIES.map((entity) => [entity.key, entity]));

const normalizeTemplateEntities = (selections = []) => {
  if (selections == null) return [];
  if (!Array.isArray(selections)) throw new Error("Template entities must be an array");
  const normalized = [];
  for (const selection of selections) {
    const entity = entityByKey.get(String(selection?.entity || ""));
    if (!entity) throw new Error(`Unsupported marksheet entity: ${selection?.entity || "(empty)"}`);
    const allowed = new Set(entity.fields.map((field) => field.key));
    const fields = [...new Set((Array.isArray(selection.fields) ? selection.fields : []).map(String))];
    const invalid = fields.find((field) => !allowed.has(field));
    if (invalid) throw new Error(`Unsupported ${entity.label} field: ${invalid}`);
    if (fields.length) normalized.push({ entity: entity.key, fields });
  }
  return [...new Map(normalized.map((selection) => [selection.entity, selection])).values()];
};

const sumField = (rows, field) => rows.reduce((sum, row) => sum + (Number(row?.[field]) || 0), 0);
const formatDate = (value) => value ? new Date(value).toLocaleDateString("en-GB") : "";

const resolveTemplateEntityField = (entity, field, context) => {
  const { student, school, course, academicYear, exams = [], subjects = [], results = [], totalMarks = 0, maxTotal = 0 } = context;
  const resolvers = {
    student: {
      name: () => student?.name, roll_number: () => student?.roll_number, admission_number: () => student?.admission_number,
      student_code: () => student?.student_code, father_name: () => student?.father_name, mother_name: () => student?.mother_name,
      dob: () => formatDate(student?.dob), gender: () => student?.gender, section: () => student?.section,
      address: () => student?.address, pincode: () => student?.pincode,
    },
    school: {
      school_name: () => school?.school_name || school?.name, email: () => school?.email, phone: () => school?.phone || school?.contact_number,
      address: () => school?.address, city: () => school?.city, state: () => school?.state, pincode: () => school?.pincode,
      principal_name: () => school?.principal_name, website: () => school?.website, tagline: () => school?.branding?.tagline,
    },
    course: { course_name: () => course?.course_name || student?.class, course_code: () => course?.course_code, description: () => course?.description },
    academic_year: { name: () => academicYear?.name, start_date: () => formatDate(academicYear?.start_date), end_date: () => formatDate(academicYear?.end_date) },
    exam: {
      names: () => exams.map((exam) => exam.exam_name).filter(Boolean).join(", "),
      count: () => exams.length,
      max_marks: () => exams.reduce((sum, exam) => sum + Number(exam.max_marks || 0), 0),
    },
    subject: {
      names: () => subjects.map((row) => (row.subject_id || row.subject || row)?.subject_name).filter(Boolean).join(", "),
      count: () => subjects.length,
    },
    result: {
      total_marks: () => totalMarks,
      max_marks: () => maxTotal,
      percentage: () => maxTotal ? ((totalMarks / maxTotal) * 100).toFixed(2) : "0.00",
      theory_marks: () => sumField(results, "theory_marks"),
      lab_marks: () => sumField(results, "lab_marks"),
      activity_marks: () => sumField(results, "activity_marks"),
      attendance_marks: () => sumField(results, "attendance_marks"),
    },
  };
  return resolvers[entity]?.[field]?.() ?? "";
};

module.exports = { MARKSHEET_ENTITIES, normalizeTemplateEntities, resolveTemplateEntityField };
