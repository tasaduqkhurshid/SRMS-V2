export default `
<div class="app-shell">
  <Header @toggle-sidebar="handleToggleSidebar" />
  <div class="app-body">
    <div class="sidebar-col">
      <Sidebar ref="sidebarRef" />
    </div>

    <div class="app-main">
      <main class="app-content">
        <div class="container-fluid">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</div>
`
