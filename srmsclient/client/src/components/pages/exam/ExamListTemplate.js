export default `<div>
  <div v-if="loading" class="text-center py-4">Loading...</div>
  <table v-else class="table table-striped">
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Max Marks</th>
        <th>Academic Year</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="exam in exams" :key="exam.id">
        <td>{{ exam.id }}</td>
        <td>{{ exam.exam_name }}</td>
        <td>{{ exam.max_marks }}</td>
        <td>{{ exam.academic_year && exam.academic_year.name ? exam.academic_year.name : '-' }}</td>
        <td>
          <button class="btn btn-sm btn-outline-secondary" @click="editExam(exam.id)">Edit</button>
        </td>
      </tr>
      <tr v-if="exams.length === 0">
        <td colspan="5" class="text-center text-muted">No exams found</td>
      </tr>
    </tbody>
  </table>
</div>`;
