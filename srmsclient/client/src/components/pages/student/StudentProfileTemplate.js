export default `
<div 
  class="modal fade show d-block" 
  tabindex="-1"
  style="background: rgba(0,0,0,0.5);" 
  role="dialog"
  aria-modal="true"
  v-if="isFetched"
>
  <div class="modal-dialog modal-xl modal-dialog-centered">
    <div class="modal-content shadow-lg">

      <!-- Modal Header -->
      <div class="modal-header">
        <h5 class="modal-title">Student Profile</h5>
        <button type="button" class="btn-close" @click="$emit('close')"></button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body p-0">
        <div class="student-profile py-3 px-3">

          <div class="container-fluid">
            <div class="row">

              <!-- Left: Photo + quick info -->
              <div class="col-lg-4 mb-3">
                <div class="card shadow-sm">
                  <div class="card-header bg-transparent text-center">
                    <img 
                      class="profile_img img-fluid rounded border"
                      :src="photoUrl || placeholderImg"
                      alt="student photo"
                      style="width: 100%; max-width: 260px; object-fit: cover;"
                    >
                    <h3 class="mt-2">{{ student?.name || '—' }}</h3>
                  </div>
                  <div class="card-body">
                    <p class="mb-2"><strong class="me-1">Student ID:</strong>{{ student?.id ?? '—' }}</p>
                    <p class="mb-2">
                      <strong class="me-1">Class:</strong>{{ student?.class || '—' }}
                      <strong class="ms-3 me-1">Section:</strong>{{ student?.section || '—' }}
                    </p>
                    <p class="mb-2"><strong class="me-1">Admission #:</strong>{{ student?.admission_number || '—' }}</p>
                    <p class="mb-0"><strong class="me-1">Roll:</strong>{{ student?.roll_number || '—' }}</p>
                  </div>
                </div>
              </div>

              <!-- Right: Details -->
              <div class="col-lg-8">
                <div class="card shadow-sm mb-3">
                  <div class="card-header bg-transparent border-0">
                    <h3 class="mb-0">
                      <i class="far fa-clone me-1"></i> General Information
                    </h3>
                  </div>
                  <div class="card-body pt-0">
                    <table class="table table-bordered mb-0">
                      <tbody>
                        <tr>
                          <th width="30%">Roll</th>
                          <td width="2%">:</td>
                          <td>{{ student?.roll_number || '—' }}</td>
                        </tr>

                        <tr>
                          <th>Gender</th>
                          <td>:</td>
                          <td>{{ student?.gender || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Religion</th>
                          <td>:</td>
                          <td>{{ student?.religion || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Blood Group</th>
                          <td>:</td>
                          <td>{{ student?.blood_group || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Date of Birth</th>
                          <td>:</td>
                          <td>{{ student?.dob ? student.dob.slice(0,10) : '—' }}</td>
                        </tr>
                        <tr>
                          <th>Contact</th>
                          <td>:</td>
                          <td>{{ student?.contact || '—' }}</td>
                        </tr>
                        <tr>
                          <th>Address</th>
                          <td>:</td>
                          <td>{{ student?.address || '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="card shadow-sm">
                  <div class="card-header bg-transparent border-0 d-flex align-items-center justify-content-between">
                    <h3 class="mb-0">
                      <i class="far fa-clone me-1"></i> Other Information
                    </h3>
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-secondary btn-sm" @click="$emit('close')">Back to list</button>
                      <button class="btn btn-primary btn-sm" @click="editStudent(student.id)">Edit</button>
                    </div>
                  </div>
                  <div class="card-body pt-0">
                    <div class="mb-2">
                      <h6>Subjects</h6>
                      <div v-if="assignedSubjects && assignedSubjects.length">
                        <span class="badge bg-secondary me-1" v-for="s in assignedSubjects" :key="s.id">{{ s.subject_name }}</span>
                      </div>
                      <div v-else class="text-muted">No subjects assigned</div>
                    </div>

                    <p class="mb-0" v-if="student?.notes">{{ student.notes }}</p>
                    <p class="mb-0 text-muted" v-else>No additional notes.</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>
`;
