export default `
<section class="catalog-card course-catalog-card">
  <div class="catalog-toolbar"><form class="catalog-search" @submit.prevent="getCourseList"><i class="fa-solid fa-magnifying-glass"></i><input v-model="searchTerm" placeholder="Search course name or code..." aria-label="Search courses" /><button type="submit" class="catalog-search-button" :disabled="loading"><i class="fa-solid fa-magnifying-glass"></i>Search</button></form></div>
  <div class="course-accordion-list">
    <div v-for="(course,index) in courses" :key="course._id" class="course-accordion-item">
      <div class="course-accordion-heading" role="button" tabindex="0" :aria-expanded="!!expandedRows[course._id]" @click="toggleRow(course._id)" @keydown.enter.prevent="toggleRow(course._id)" @keydown.space.prevent="toggleRow(course._id)">
        <span class="course-accordion-number">{{ index + 1 }}</span>
        <div class="course-accordion-name"><strong>{{ course.course_name }}</strong><span><b>{{ course.course_code || '—' }}</b><i>·</i>{{ course.description || 'No description' }}</span></div>
        <span class="course-accordion-subject-count">{{ course.subjects?.length || 0 }} subjects</span>
        <div class="course-accordion-actions" @click.stop><button type="button" class="catalog-icon-button" title="Assign subject" aria-label="Assign subject" @click="openAssign(course)"><i class="fa-solid fa-plus"></i></button><button type="button" class="catalog-icon-button" title="Edit course" aria-label="Edit course" @click="$emit('edit', course._id)"><i class="fa-solid fa-pen"></i></button><button type="button" class="catalog-icon-button catalog-delete-button" title="Delete course" aria-label="Delete course" @click="deleteCourse(course._id)"><i class="fa-solid fa-trash"></i></button></div>
        <span class="course-accordion-caret"><i :class="expandedRows[course._id] ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i></span>
      </div>
      <div v-if="expandedRows[course._id]" class="course-accordion-body">
        <div class="course-accordion-details"><div><small>Course Name</small><strong>{{ course.course_name }}</strong></div><div><small>Course Code</small><strong>{{ course.course_code || '—' }}</strong></div><div><small>Description</small><strong>{{ course.description || '—' }}</strong></div></div>
        <section class="course-accordion-subjects"><h3>Assigned Subjects</h3><p v-if="loadingSubjects[course._id]" class="catalog-empty">Loading subjects…</p><p v-else-if="!course.subjects.length" class="catalog-empty">No subjects assigned</p><div v-else class="course-subject-list"><div v-for="cs in course.subjects" :key="cs.subject ? cs.subject._id : cs._id" class="course-subject-item"><span><strong>{{ cs.subject ? cs.subject.subject_name : cs.subject_name }}</strong><small>{{ cs.subject ? cs.subject.subject_code : cs.subject_code }}</small></span><button type="button" title="Remove subject" aria-label="Remove subject" @click="removeSubject(course._id, cs.subject ? cs.subject._id : cs.subject_id)"><i class="fa-solid fa-trash"></i></button></div></div></section>
      </div>
    </div>
    <div v-if="!loading && courses.length === 0" class="course-accordion-empty">No courses found</div>
    <div v-if="loading" class="catalog-loading"><span class="spinner-border spinner-border-sm"></span>Loading courses…</div>
  </div>
  <footer class="catalog-footer"><span>Showing {{ courses.length }} {{ courses.length === 1 ? 'course' : 'courses' }}</span></footer>
</section>
`;
