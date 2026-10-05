// Global FormValidator with automatic DOM-watching for dynamic forms (modals, SPA components).
window.FormValidator = (() => {
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
      rules = rules.map((rule) => rule.rule === "minLength" ? { ...rule, value: min } : rule);
    }

    if (max !== null) {
      rules.push({ rule: "maxLength", value: max, errorMessage: "Too long" });
    }

    return rules;
  }

  function initForm(form) {
    if (!form) return;

    if (!form.id) {
      form.id = `vform_${Math.random().toString(36).slice(2, 9)}`;
    }
    const formSelector = `#${form.id}`;

    form.querySelectorAll("[data-vtype]").forEach((field, index) => {
      if (!field.id) field.id = `${form.id}_${index}`;
    });

    const validator = new window.JustValidate(formSelector, {
      errorFieldCssClass: "is-invalid",
      successFieldCssClass: "is-valid",
      errorLabelCssClass: "invalid-feedback"
    });

    form.querySelectorAll("[data-vtype]").forEach((field) => {
      validator.addField(`#${field.id}`, buildRules(field));
    });

    validator.onSuccess(() => {
      form.dispatchEvent(new Event("validated-submit"));
    });

    try {
      form.__justValidateInstance = validator;
    } catch (e) {
      // Ignore non-writable properties.
    }
  }

  const initialized = new WeakSet();

  function tryInitForm(form) {
    if (!form || !(form instanceof HTMLElement)) return;
    if (initialized.has(form)) return;

    try {
      initForm(form);
      initialized.add(form);

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
          form.removeEventListener("validated-submit", submitFn);
          form.addEventListener("validated-submit", submitFn);
        }
      }
    } catch (e) {
      console.warn("FormValidator.init failed for", form, e);
    }
  }

  function autoInitExisting() {
    document.querySelectorAll("form[data-vform]").forEach((form) => {
      tryInitForm(form);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitExisting);
  } else {
    autoInitExisting();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;

        if (node.matches && node.matches("form[data-vform]")) {
          tryInitForm(node);
        }

        const nestedForms = node.querySelectorAll && node.querySelectorAll("form[data-vform]");
        if (nestedForms && nestedForms.length) {
          nestedForms.forEach((form) => tryInitForm(form));
        }
      }
    }
  });

  const observeTarget = document.body || document.documentElement;
  if (observeTarget) {
    observer.observe(observeTarget, { childList: true, subtree: true });
  }

  return { init: initForm };
})();
