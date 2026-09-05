(() => {
  const today = new Date().toLocaleDateString('en-CA');
  const $ = (selector) => document.querySelector(selector);

  const guestForm = $('#checkinForm');
  if (guestForm) {
    const date = $('#date');
    if (date) date.value = today;
    guestForm.addEventListener('submit', () => window.setTimeout(() => {
      const message = $('#submission-success');
      if (message) { message.hidden = false; message.focus(); }
    }, 450));
  }

  const quickForm = $('#quickCheckinForm');
  if (quickForm) {
    const key = `yufgc-express-${today}`;
    const count = () => JSON.parse(localStorage.getItem(key) || '[]').length;
    const countLabel = $('#quick-count');
    if (countLabel) countLabel.textContent = count();
    quickForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(quickForm);
      const entries = JSON.parse(localStorage.getItem(key) || '[]');
      entries.push({ name: data.get('name').trim(), discord: data.get('discord').trim(), updates: data.get('updates') === 'on', checkedInAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(entries));
      quickForm.reset();
      if (countLabel) countLabel.textContent = count();
      const success = $('#quick-success');
      if (success) { success.hidden = false; success.focus(); }
    });
  }

  const kioskForm = $('#kioskCheckinForm');
  if (kioskForm) {
    const key = `yufgc-kiosk-${today}`;
    const list = $('#roster-list'), empty = $('#roster-empty'), rosterCount = $('#roster-count');
    const exportButton = $('#export-roster'), clearButton = $('#clear-roster');
    const entries = () => JSON.parse(localStorage.getItem(key) || '[]');
    const displayTime = (stamp) => new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' }).format(new Date(stamp));
    const renderRoster = () => {
      const roster = entries(); list.innerHTML = '';
      roster.forEach((entry) => { const item = document.createElement('li'); item.innerHTML = `<strong>${escapeHtml(entry.name)}</strong><span>${escapeHtml(entry.type)} · ${displayTime(entry.checkedInAt)}</span>`; list.append(item); });
      empty.hidden = roster.length > 0; rosterCount.textContent = roster.length; exportButton.disabled = roster.length === 0; clearButton.hidden = roster.length === 0;
    };
    kioskForm.addEventListener('submit', (event) => {
      event.preventDefault(); const data = new FormData(kioskForm); const roster = entries();
      roster.push({ name: data.get('name').trim(), type: data.get('type'), discord: data.get('discord').trim(), contact: data.get('contact').trim(), checkedInAt: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(roster)); kioskForm.reset(); renderRoster();
      const success = $('#kiosk-success'); if (success) { success.hidden = false; success.focus(); } $('#kiosk-name').focus();
    });
    exportButton.addEventListener('click', () => {
      const header = ['Name', 'Attendance type', 'Discord', 'Contact', 'Checked in at'];
      const rows = entries().map((entry) => [entry.name, entry.type, entry.discord, entry.contact, entry.checkedInAt]);
      const csv = [header, ...rows].map((row) => row.map(csvField).join(',')).join('\n');
      const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' })); link.download = `yufgc-roster-${today}.csv`; link.click(); URL.revokeObjectURL(link.href);
    });
    clearButton.addEventListener('click', () => { if (window.confirm('Clear this device’s roster for today? Download it first if you need a copy.')) { localStorage.removeItem(key); renderRoster(); } });
    renderRoster();
  }
  function csvField(value) { return `"${String(value).replaceAll('"', '""')}"`; }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]); }
})();
