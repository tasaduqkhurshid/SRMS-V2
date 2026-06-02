export default `<div class="container-fluid">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h3 class="m-0">Results</h3>
    <button class="btn btn-primary" @click="addResult">Add Result</button>
  </div>

  <ResultList ref="resultListRef" @editResult="handleEdit" />

  <AddEditResult v-if="isEdit" :mode="mode" :resultId="selectedResultId" @close="close" @saved="onSaved" />
</div>`;