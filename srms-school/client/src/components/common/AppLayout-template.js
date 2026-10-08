export default `
<!-- App shell: sidebar (left, full height) + right column (header, content) -->
<div class="app-shell">
  <div class="app-body">
    <!-- Sidebar column -->
    <div class="sidebar-col">
      <Sidebar ref="sidebarRef" />
    </div>

    <!-- Right column: header, main content -->
    <div class="app-main">
      <Header @toggle-sidebar="handleToggleSidebar" />

      <main class="app-content">
        <div class="container-fluid">
          <slot></slot>
        </div>
      </main>
    </div>
  </div>
</div>
`