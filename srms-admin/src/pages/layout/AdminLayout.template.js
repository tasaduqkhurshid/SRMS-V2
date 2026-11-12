export default `<div class="layout">
  <div class="layout-body">
    <Sidebar :current-year="currentYear" @logout="logout" />
    <main class="content">
      <Header :token="token" :eyebrow-text="eyebrowText" :title="pageTitle" />
      <RouterView />
    </main>
  </div>
</div>`;
