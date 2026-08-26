export default `
<div>
  <div class="d-flex gap-2 mb-2">
    <input class="form-control" style="max-width: 320px" v-model="searchTerm" placeholder="Search name / code" />
    <button class="btn btn-primary" @click="getCourseList" :disabled="loading">Search</button>
  </div>

  <div>
            <div class="row">
              <div class="col-8">
                <h5 class="mb-0">Course Name</h5>
              </div>
              <div class="col-4 text-end">
                 <h5 class="mb-0">Actions</h5>
              </div>
            </div>
            <div class="accordion-list">
              <div class="mb-2" v-for="course in courses" :key="course._id">
                <div class="card shadow-sm rounded-0">
                  <div class="card-header d-flex align-items-center justify-content-between" style="cursor: pointer;" @click="toggleRow(course._id)">
                    <div>
                      <div class="h5 mb-0">{{ course.course_name }}</div>
                      <div class="small text-muted">{{ course.course_code }} · {{ course.description }}</div>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                      <div class="btn-group btn-group-sm" @click.stop>
                        <button class="btn btn-light" title="Edit" @click="$emit('edit', course._id)"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-light" title="Assign Subject" @click="openAssign(course)"><i class="fa-solid fa-plus"></i></button>
                        <button class="btn btn-light text-danger" title="Delete" @click="deleteCourse(course._id)"><i class="fa-solid fa-trash"></i></button>
                      </div>
                      <button class="btn btn-sm btn-link" @click.stop="toggleRow(course._id)">
                        <i :class="expandedRows[course._id] ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
                      </button>
                    </div>
                  </div>

                  <div v-if="expandedRows[course._id]" class="card-body">
                    <div class="mb-2">
                      <div class="row">
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Course Name</div>
                          <div>{{ course.course_name }}</div>
                        </div>
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Course Code</div>
                          <div>{{ course.course_code }}</div>
                        </div>
                        <div class="col-md-4 mb-2">
                          <div class="fw-bold small text-muted">Description</div>
                          <div>{{ course.description || '-' }}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h6 class="mb-2">Assigned Subjects</h6>
                      <div v-if="loadingSubjects[course._id]" class="text-muted">Loading subjects…</div>
                      <ul v-else class="list-group">
                        <li class="list-group-item d-flex justify-content-between align-items-center" v-for="cs in course.subjects" :key="cs.subject ? cs.subject._id : cs._id">
                          <div>
                            <strong>{{ cs.subject ? cs.subject.subject_name : cs.subject_name }}</strong>
                            <div class="small text-muted">{{ cs.subject ? cs.subject.subject_code : cs.subject_code }}</div>
                          </div>
                          <div>
                            <button class="btn btn-sm btn-danger" title="Remove subject" @click="removeSubject(course._id, cs.subject ? cs.subject._id : cs.subject_id)"><i class="fa-solid fa-trash"></i></button>
                          </div>
                        </li>
                        <li v-if="!course.subjects.length" class="list-group-item text-muted">No subjects assigned</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

    <div v-if="loading" class="text-center">Loading…</div>
  </div>
</div>
`;