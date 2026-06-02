const TABLES = require("../../constants/tableNames");

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // 🔥 get real school id
    const [schools] = await queryInterface.sequelize.query(
      "SELECT id FROM schools LIMIT 1;"
    );

    const schoolId = schools[0]?.id;

    if (!schoolId) {
      throw new Error("❌ No school found");
    }

    const subjects = [
      { subject_name: "English", subject_code: "english" },
      { subject_name: "Urdu", subject_code: "urdu" },
      { subject_name: "Math", subject_code: "math" },
      { subject_name: "Evs", subject_code: "evs" },
      { subject_name: "E.Rhyme", subject_code: "e_rhy" },
      { subject_name: "I.Rhyme", subject_code: "i_rhy" },
      { subject_name: "Story", subject_code: "story" },
      { subject_name: "Drawing", subject_code: "drawing" },
      { subject_name: "Al Quran", subject_code: "al_quran" }
    ];

    for (const sub of subjects) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM subjects WHERE subject_code='${sub.subject_code}'`
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert(TABLES.SUBJECTS, [
          {
            ...sub,
            has_theory: true,
            has_lab: false,
            has_attendance: false,
            has_activity: false,
            school_id: schoolId,
            created_at: now,
            updated_at: now
          }
        ]);
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(TABLES.SUBJECTS, null, {});
  }
};