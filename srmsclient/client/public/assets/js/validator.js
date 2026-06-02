// validator.js
// Global FormValidator with automatic DOM-watching for dynamic forms (modals, SPA components)
// Depends on JustValidate being loaded globally.
// Usage in templates: <form id="studentForm" data-vform @validated-submit="saveStudentDetails">...</form>

window.FormValidator = (() => {
  // ---------- Rule definitions ----------
  const TYPE_RULES = {
    text: [
      { rule: "required", errorMessage: "This field is required" },
      { rule: "minLength", value: 2, errorMessage: "Too short" }
    ],
    email: [
      { rule: "required", errorMessage: "This field is required" },
      { rule: "email", errorMessage: "Invalid email address" }
    ],
    number: [
      { rule: "required", errorMessage: "This field is required" },
      { rule: "number", errorMessage: "Must be a number" }
    ],
    date: [
      { rule: "required", errorMessage: "This field is required" }
    ],
    select: [
      { rule: "required", errorMessage: "This field is required" }
    ]
  };

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  function buildRules(field) {
    const type = field.dataset.vtype;
    let rules = clone(TYPE_RULES[type] || []);

    const min = field.dataset.vmin ? Number(field.dataset.vmin) : null;
    const max = field.dataset.vmax ? Number(field.dataset.vmax) : null;

    if (min !== null) {
      // adjust minLength rule if present
      rules = rules.map(r => r.rule === "minLength" ? { ...r, value: min } : r);
    }

    if (max !== null) {
      rules.push({ rule: "maxLength", value: max, errorMessage: "Too long" });
    }

    return rules;
  }

  // ---------- Initialize a single form ----------
  function initForm(form) {
    if (!form) return;

    // ensure form has an id (JustValidate expects a selector)
    if (!form.id) {
      form.id = `vform_${Math.random().toString(36).slice(2, 9)}`;
    }
    const formSelector = `#${form.id}`;

    // ensure fields have ids
    form.querySelectorAll("[data-vtype]").forEach((field, i) => {
      if (!field.id) field.id = `${form.id}_${i}`;
    });

    // create JustValidate instance
    const validator = new JustValidate(formSelector, {
      errorFieldCssClass: "is-invalid",
      successFieldCssClass: "is-valid",
      errorLabelCssClass: "invalid-feedback"
    });

    // add fields
    form.querySelectorAll("[data-vtype]").forEach(field => {
      validator.addField(`#${field.id}`, buildRules(field));
    });

    // on successful validation dispatch a custom event the app listens to
    validator.onSuccess(() => {
      form.dispatchEvent(new Event("validated-submit"));
    });

    // store validator instance on the form for potential future use
    try {
      form.__justValidateInstance = validator;
    } catch (e) {
      // ignore non-writable properties
    }
  }

  // ---------- Auto-init and MutationObserver ----------
  const _initialized = new WeakSet(); // track initialized form nodes

  function tryInitForm(form) {
    if (!form || !(form instanceof HTMLElement)) return;
    if (_initialized.has(form)) return;

    try {
      initForm(form);
      _initialized.add(form);

      // If form is inside a Vue component, wire common handler names automatically
      const comp = form.__vueParentComponent?.exposed;
      if (comp) {
        const submitFn =
          comp.handleLogin ||
          comp.onSubmit ||
          comp.save ||
          comp.submit ||
          comp.saveStudentDetails ||
          comp.saveStudent ||
          comp.saveHandler;
        if (submitFn && typeof submitFn === "function") {
          // avoid duplicate listeners
          form.removeEventListener("validated-submit", submitFn);
          form.addEventListener("validated-submit", submitFn);
        }
      }
    } catch (e) {
      // keep going; one bad form shouldn't break others
      // eslint-disable-next-line no-console
      console.warn("FormValidator.init failed for", form, e);
    }
  }

  function autoInitExisting() {
    document.querySelectorAll("form[data-vform]").forEach(form => {
      tryInitForm(form);
    });
  }

  // run once immediately (or on DOMContentLoaded if still loading)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitExisting);
  } else {
    autoInitExisting();
  }

  // Observe DOM for newly added forms (useful for modals / dynamically rendered components)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        // if node itself is a form[data-vform]
        if (node.matches && node.matches("form[data-vform]")) {
          tryInitForm(node);
        }

        // or if it contains forms
        const nestedForms = node.querySelectorAll && node.querySelectorAll("form[data-vform]");
        if (nestedForms && nestedForms.length) {
          nestedForms.forEach(f => tryInitForm(f));
        }
      }
    }
  });

  // Start observing body (fallback to documentElement)
  const observeTarget = document.body || document.documentElement;
  if (observeTarget) {
    observer.observe(observeTarget, { childList: true, subtree: true });
  }

  // expose manual init for programmatic use
  return { init: initForm };
})();
