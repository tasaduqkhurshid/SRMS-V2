export default `
<p v-if="supportError" class="alert error">{{ supportError }}</p>
<p v-if="supportSuccess" class="alert success">{{ supportSuccess }}</p>

<!-- Dashboard - shown on /support/dashboard -->
<SupportDashboard
  v-if="route.name === 'support-dashboard'"
  :statistics="supportStatistics"
/>

<!-- Ticket List - shown on /support/tickets -->
<SupportTicketList
  v-if="route.name === 'support-tickets'"
  :api="api"
  :schools="[]"
  :subjects="supportSubjects"
  :services="supportServices"
  :statuses="supportStatuses"
  @refresh="handleSupportRefresh"
/>

<!-- Create Ticket -->
<CreateSupportTicketAdmin
  v-else-if="route.name === 'support-tickets-create'"
  :api="api"
  :schools="[]"
  :subjects="supportSubjects"
  :services="supportServices"
  @created="handleSupportTicketCreated"
/>

<!-- Subjects Management -->
<SupportSubjectManagement
  v-else-if="route.name === 'support-subjects'"
  :api="api"
  :items="supportSubjects"
  @refresh="handleSupportConfigRefresh"
/>

<!-- Services Management -->
<SupportServiceManagement
  v-else-if="route.name === 'support-services'"
  :api="api"
  :items="supportServices"
  @refresh="handleSupportConfigRefresh"
/>

<!-- Statuses Management -->
<SupportStatusManagement
  v-else-if="route.name === 'support-statuses'"
  :api="api"
  :items="supportStatuses"
  @refresh="handleSupportConfigRefresh"
/>

<footer class="content-footer">© {{ currentYear }} Hubi-Infotech. All rights reserved.</footer>`;
