
(() => {
  'use strict';

  /* =====================================
     1. NOTIFICATION / TOAST MESSAGE
  ===================================== */

  function showToast(message) {
    const oldToast = document.querySelector('.toast-message');

    if (oldToast) {
      oldToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.setAttribute('role', 'status');
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }


  /* =====================================
     2. MODAL FUNCTIONS
  ===================================== */

  function openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add('open');
    document.body.classList.add('modal-open');

    const firstInput = modal.querySelector(
      'input, select, textarea, button'
    );

    if (firstInput) {
      setTimeout(() => firstInput.focus(), 50);
    }
  }

  function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove('open');

    if (!document.querySelector('.modal-backdrop.open')) {
      document.body.classList.remove('modal-open');
    }
  }


  /* =====================================
     3. TAB SWITCHING
  ===================================== */

  function activateTab(button) {
    const tabId = button.dataset.tab;

    const tabGroup = button.closest('.tabs');

    const scope = tabGroup
      ? tabGroup.parentElement
      : button.parentElement;

    if (!scope) return;

    const buttons = scope.querySelectorAll(
      '.tab-button[data-tab]'
    );

    buttons.forEach(btn => {
      btn.classList.toggle('active', btn === button);
    });

    const panels = scope.querySelectorAll('.tab-panel');

    panels.forEach(panel => {
      panel.classList.toggle(
        'active',
        panel.id === tabId
      );
    });
  }


  /* =====================================
     4. TABLE SEARCH AND FILTERING
  ===================================== */

  function filterTable(tableId) {
    const table = document.getElementById(tableId);

    if (!table) return;

    const searchInput = document.querySelector(
      `[data-table-search="${CSS.escape(tableId)}"]`
    );

    const filterSelect = document.querySelector(
      `[data-table-filter="${CSS.escape(tableId)}"]`
    );

    const searchValue = searchInput
      ? searchInput.value.trim().toLowerCase()
      : '';

    const selectedValue = filterSelect
      ? filterSelect.value.toLowerCase()
      : '';

    const filterColumn = Number(
      filterSelect?.dataset.filterColumn || 0
    );

    let visibleRows = 0;

    table.querySelectorAll('tbody tr').forEach(row => {

      const rowText = row.textContent.toLowerCase();

      const searchMatch =
        !searchValue || rowText.includes(searchValue);

      const cell = row.cells[filterColumn];

      const filterMatch =
        !selectedValue ||
        (cell && cell.textContent.toLowerCase().includes(selectedValue));

      const showRow = searchMatch && filterMatch;

      row.hidden = !showRow;

      if (showRow) {
        visibleRows++;
      }

    });

    const container = table.parentElement;

    let emptyMessage = container.querySelector('.empty-state');

    if (visibleRows === 0) {

      if (!emptyMessage) {
        emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.textContent = 'No matching records found.';

        container.appendChild(emptyMessage);
      }

    } else if (emptyMessage) {

      emptyMessage.remove();

    }
  }


  /* =====================================
     5. EXPORT TABLE TO CSV
  ===================================== */

  function exportTable(button) {

    const panel =
      button.closest('.tab-panel') ||
      button.closest('.panel') ||
      document;

    const table =
      panel.querySelector('table') ||
      document.querySelector('.tab-panel.active table') ||
      document.querySelector('table');

    if (!table) {
      showToast('No table available to export.');
      return;
    }

    const rows = [
      ...table.querySelectorAll('tr')
    ].filter(row => !row.hidden);

    const csv = rows.map(row => {

      const cells = [
        ...row.querySelectorAll('th, td')
      ];

      return cells.map(cell => {

        const value = (cell.innerText || '')
          .replace(/\s+/g, ' ')
          .trim();

        return `"${value.replace(/"/g, '""')}"`;

      }).join(',');

    }).join('\r\n');

    const blob = new Blob(
      ['\uFEFF' + csv],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download =
      (document.title || 'county-hub')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') + '.csv';

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast('CSV export downloaded.');
  }


  /* =====================================
     6. ADD NEW TABLE ROW
  ===================================== */

  function addTableRow() {

    const target =
      document.querySelector('[data-order-items]') ||
      document.querySelector('#order-items') ||
      document.querySelector('.order-items tbody');

    if (!target) {
      showToast('No editable order-items section found.');
      return;
    }

    const row = document.createElement('tr');

    row.innerHTML = `
      <td>
        <input
          type="text"
          aria-label="Item description"
          placeholder="Item description">
      </td>

      <td>
        <input
          type="number"
          min="1"
          value="1"
          aria-label="Quantity">
      </td>

      <td>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          aria-label="Unit price">
      </td>

      <td>
        <button
          type="button"
          class="text-button"
          data-remove-row>
          Remove
        </button>
      </td>
    `;

    target.appendChild(row);

    showToast('New order line added.');
  }


  /* =====================================
     7. REMOVE TABLE ROW
  ===================================== */

  function removeTableRow(button) {

    const row = button.closest('tr');

    if (row) {
      row.remove();
      showToast('Row removed successfully.');
    }

  }


  /* =====================================
     8. FORM SUBMISSION
  ===================================== */

  function handleFormSubmit(form, event) {

    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const heading =
      form.querySelector('h2')?.textContent.trim() ||
      'Form';

    showToast(
      heading + ' saved successfully (demo only).'
    );

    form.reset();

    closeModal(
      form.closest('.modal-backdrop')
    );
  }


  /* =====================================
     9. AUTOMATIC NAVIGATION HIGHLIGHT
  ===================================== */

  function highlightNavigation() {

    const currentPage =
      location.pathname.split('/').pop();

    document.querySelectorAll('.nav-link').forEach(link => {

      const linkPage = link.getAttribute('href');

      if (linkPage === currentPage) {

        link.classList.add('active');

      } else {

        link.classList.remove('active');

      }

    });

  }


  /* =====================================
     10. EVENT LISTENERS
  ===================================== */

  document.addEventListener('click', function(event) {

    /* Open Modal */

    const openButton = event.target.closest(
      '[data-open-modal]'
    );

    if (openButton) {
      openModal(openButton.dataset.openModal);
      return;
    }


    /* Close Modal */

    const closeButton = event.target.closest(
      '[data-close-modal]'
    );

    if (closeButton) {
      closeModal(
        closeButton.closest('.modal-backdrop')
      );
      return;
    }


    /* Close Modal By Clicking Outside */

    if (
      event.target.classList.contains('modal-backdrop')
    ) {
      closeModal(event.target);
      return;
    }


    /* Tab Switching */

    const tabButton = event.target.closest(
      '.tab-button[data-tab]'
    );

    if (tabButton) {
      activateTab(tabButton);
      return;
    }


    /* Export CSV */

    const exportButton = event.target.closest(
      '[data-action="export"]'
    );

    if (exportButton) {
      exportTable(exportButton);
      return;
    }


    /* Add Table Row */

    if (event.target.closest('[data-add-row]')) {
      addTableRow();
      return;
    }


    /* Remove Table Row */

    const removeButton = event.target.closest(
      '[data-remove-row]'
    );

    if (removeButton) {
      removeTableRow(removeButton);
      return;
    }


    /* Demo Actions */

    const demoButton = event.target.closest(
      '[data-demo-action]'
    );

    if (demoButton) {
      showToast(
        demoButton.dataset.demoAction ||
        'Action completed (demo).'
      );
      return;
    }


    /* Alert Details */

    if (event.target.closest('[data-show-alert]')) {

      const alertSection =
        document.getElementById('alert-detail');

      if (alertSection) {
        alertSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      showToast('Alert details displayed.');
      return;
    }


    /* Purchase Order Review */

    if (event.target.closest('[data-show-review]')) {

      const reviewSection =
        document.getElementById('review-detail') ||
        document.querySelector('.review-detail');

      if (reviewSection) {
        reviewSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }

      showToast('Purchase order review opened.');
      return;
    }

  });


  /* =====================================
     11. KEYBOARD SUPPORT
  ===================================== */

  document.addEventListener('keydown', function(event) {

    if (event.key === 'Escape') {

      document
        .querySelectorAll('.modal-backdrop.open')
        .forEach(modal => closeModal(modal));

    }

  });


  /* =====================================
     12. FORM EVENT HANDLER
  ===================================== */

  document.addEventListener('submit', function(event) {

    const form = event.target.closest('[data-demo-form]');

    if (!form) return;

    handleFormSubmit(form, event);

  });


  /* =====================================
     13. SEARCH EVENT HANDLER
  ===================================== */

  document.addEventListener('input', function(event) {

    const input = event.target.closest(
      '[data-table-search]'
    );

    if (!input) return;

    filterTable(input.dataset.tableSearch);

  });


  /* =====================================
     14. FILTER EVENT HANDLER
  ===================================== */

  document.addEventListener('change', function(event) {

    const filter = event.target.closest(
      '[data-table-filter]'
    );

    if (!filter) return;

    filterTable(filter.dataset.tableFilter);

  });


  /* =====================================
     15. ACCESSIBILITY LABELS
  ===================================== */

  document.querySelectorAll('input[placeholder]').forEach(input => {

    if (
      !input.getAttribute('aria-label') &&
      !input.labels?.length
    ) {

      input.setAttribute(
        'aria-label',
        input.placeholder
      );

    }

  });


  /* =====================================
     16. INITIALIZE APPLICATION
  ===================================== */

  function initializeApp() {

    highlightNavigation();

    console.log(
      'County Hub JavaScript initialized successfully.'
    );

  }

  if (document.readyState === 'loading') {

    document.addEventListener(
      'DOMContentLoaded',
      initializeApp
    );

  } else {

    initializeApp();

  }

})();
