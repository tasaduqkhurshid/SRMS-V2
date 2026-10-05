window.toast = (() => {
  const containerId = "toast-container";
  let container = null;

  function ensureContainer() {
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      container.className = "position-fixed top-0 end-0 p-3";
      container.style.zIndex = 9999;
      document.body.appendChild(container);
    }
  }

  function create(message, type = "success") {
    ensureContainer();

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.role = "alert";

    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>
    `;

    container.appendChild(toast);

    const bsToast = new window.bootstrap.Toast(toast, { delay: 3000 });
    bsToast.show();

    toast.addEventListener("hidden.bs.toast", () => toast.remove());
  }

  return {
    success: (msg) => create(msg, "success"),
    error: (msg) => create(msg, "danger"),
    warning: (msg) => create(msg, "warning"),
    info: (msg) => create(msg, "info")
  };
})();
