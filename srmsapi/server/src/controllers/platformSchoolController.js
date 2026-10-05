const SchoolService = require('../services/SchoolService');
const { Student, User } = require('../db/models');

const list = async (_req, res, next) => {
  try {
    const schools = await SchoolService.listSchools();
    const [totalStudents, totalUsers] = await Promise.all([
      Student.countDocuments({}),
      User.countDocuments({ role: { $in: ['ADMIN', 'SCHOOL_ADMIN'] } }),
    ]);
    return res.json({ status: 'success', data: { schools, statistics: { schools: schools.length, activeSchools: schools.filter((s) => s.status !== 'inactive').length, inactiveSchools: schools.filter((s) => s.status === 'inactive').length, students: totalStudents, schoolAdministrators: totalUsers } } });
  } catch (error) { return next(error); }
};

const create = async (req, res, next) => {
  try {
    const school = await SchoolService.createSchoolRecord(req.body || {});
    return res.status(201).json({ status: 'success', data: school });
  } catch (error) { return res.status(400).json({ status: 'error', message: error.message }); }
};

const update = async (req, res, next) => {
  try {
    const school = await SchoolService.updatePlatformSchool(req.params.id, req.body || {});
    if (!school) return res.status(404).json({ status: 'error', message: 'School not found' });
    return res.json({ status: 'success', data: school });
  } catch (error) { return res.status(400).json({ status: 'error', message: error.message }); }
};

const getOne = async (req, res, next) => {
  try {
    const school = await SchoolService.getSchoolById(req.params.id);
    if (!school) return res.status(404).json({ status: 'error', message: 'School not found' });
    const schoolId = school._id;
    const [administrators, students, teachers] = await Promise.all([
      User.countDocuments({ school_id: schoolId, role: { $in: ['ADMIN', 'SCHOOL_ADMIN'] } }),
      Student.countDocuments({ school_id: schoolId }),
      User.countDocuments({ school_id: schoolId, role: { $regex: /^teacher$/i } }),
    ]);
    return res.json({ status: 'success', data: { ...school, statistics: { administrators, students, teachers } } });
  } catch (error) { return next(error); }
};

const listAdministrators = async (req, res, next) => {
  try {
    const administrators = await SchoolService.listSchoolAdministrators(req.params.id);
    return res.json({ status: 'success', data: administrators });
  } catch (error) { return next(error); }
};

const updateAdministratorPassword = async (req, res, next) => {
  try {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) {
      return res.status(400).json({ status: 'error', message: 'Password must be at least 8 characters' });
    }
    const updated = await SchoolService.updateSchoolAdministratorPassword(
      req.params.id,
      req.params.adminId,
      password,
    );
    if (!updated) return res.status(404).json({ status: 'error', message: 'School administrator not found' });
    return res.json({ status: 'success', message: 'School administrator password updated' });
  } catch (error) { return next(error); }
};

const createAdministrator = async (req, res, next) => {
  try {
    const school = await SchoolService.getSchoolById(req.params.id);
    if (!school) return res.status(404).json({ status: 'error', message: 'School not found' });
    const administrator = await SchoolService.createSchoolAdministrator(req.params.id, req.body || {});
    return res.status(201).json({ status: 'success', data: { id: administrator._id, username: administrator.username, email: administrator.email, role: administrator.role } });
  } catch (error) { return res.status(400).json({ status: 'error', message: error.message }); }
};

module.exports = { list, create, getOne, update, listAdministrators, createAdministrator, updateAdministratorPassword };
