export default `
<!-- App shell: header (full width) -> content row (sidebar + main) -> footer (full width) -->
<div class="app-shell d-flex flex-column min-vh-100">

  <!-- Full-width header wrapper -->
  <div class="header-full w-100">
    <!-- Header component renders its own inner content; wrapper ensures full page width -->
    <Header :user="user" />
  </div>

  <!-- Content row: sidebar + main. main contains a container for aligned page content -->
  <div class="content-row d-flex flex-grow-1">
    <!-- Sidebar column (keeps sidebar between header & footer) -->
    <div class="sidebar-col">
      <Sidebar />
    </div>

    <!-- Main content area: keep content aligned using container / container-fluid -->
    <main class="main-content flex-fill p-4">
      <div class="container-fluid">
        <slot></slot>
      </div>
    </main>
  </div>

  <!-- Full-width footer wrapper -->
  <div class="footer-full w-100">
    <Footer />
  </div>

</div>
`
