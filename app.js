/**
 * INTERNHUB — WORKSPACE & TESTER FEEDBACK COLLECTOR
 * Features:
 * 1. Intern Onboarding Workspace
 * 2. Manager Mode (Add tasks, examples, contacts)
 * 3. Built-in Usability Test Feedback Collector (For friends & evaluators)
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initSidebarNav();
  initManagerMode();
  initProgressiveChecklist();
  initBenchmarkLibrary();
  initAssistantChat();
  initModals();
  initFeedbackCollector();
});

/* ==========================================================
   1. THEME TOGGLE
   ========================================================== */
function initTheme() {
  const btnToggle = document.getElementById('btn-theme-toggle');
  const sunIcon = document.getElementById('theme-sun-icon');
  const moonIcon = document.getElementById('theme-moon-icon');

  const savedTheme = localStorage.getItem('hub_theme') || 'theme-light';
  document.body.className = savedTheme;
  updateThemeIcons(savedTheme);

  if (btnToggle) {
    btnToggle.addEventListener('click', () => {
      const isLight = document.body.classList.contains('theme-light');
      const newTheme = isLight ? 'theme-dark' : 'theme-light';
      document.body.className = newTheme;
      localStorage.setItem('hub_theme', newTheme);
      updateThemeIcons(newTheme);
      showToast(newTheme === 'theme-dark' ? '🌙 Dark mode active' : '☀️ Light mode active');
    });
  }

  function updateThemeIcons(theme) {
    if (!sunIcon || !moonIcon) return;
    if (theme === 'theme-dark') {
      sunIcon.classList.remove('hidden');
      moonIcon.classList.add('hidden');
    } else {
      sunIcon.classList.add('hidden');
      moonIcon.classList.remove('hidden');
    }
  }
}

/* ==========================================================
   2. SIDEBAR NAVIGATION
   ========================================================== */
function initSidebarNav() {
  const navButtons = document.querySelectorAll('.side-nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = btn.dataset.section;
      if (target === 'all') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(`section-${target}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* ==========================================================
   3. MANAGER / CREATOR MODE TOGGLE
   ========================================================== */
let isManagerMode = false;

function initManagerMode() {
  const btnToggleMode = document.getElementById('btn-toggle-mode');
  const modeText = document.getElementById('mode-text');
  const btnModeText = document.getElementById('btn-mode-text');
  const managerBar = document.getElementById('manager-bar');
  const creatorButtons = document.querySelectorAll('.btn-creator-inline');

  function setMode(managerActive) {
    isManagerMode = managerActive;
    if (managerBar) managerBar.classList.toggle('hidden', !isManagerMode);
    if (modeText) modeText.textContent = isManagerMode ? 'Manager Mode ⚙️' : 'Intern View';
    if (btnModeText) btnModeText.textContent = isManagerMode ? 'Switch to Intern View' : 'Switch to Manager Mode';
    
    creatorButtons.forEach(btn => {
      btn.classList.toggle('hidden', !isManagerMode);
    });

    if (isManagerMode) {
      showToast('⚙️ Manager Mode active: You can now add & customize content or view tester feedback!');
    } else {
      showToast('👀 Switched to Intern View — previewing intern experience.');
    }
  }

  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', () => {
      setMode(!isManagerMode);
    });
  }
}

/* ==========================================================
   4. PROGRESSIVE DAILY CHECKLIST
   ========================================================== */
function initProgressiveChecklist() {
  const phaseButtons = document.querySelectorAll('.phase-btn');
  const day1Container = document.getElementById('tasks-day1');
  const day3Container = document.getElementById('tasks-day3');
  const week2Container = document.getElementById('tasks-week2');

  const countLabel = document.getElementById('checklist-count-label');
  const percentLabel = document.getElementById('checklist-percent-label');
  const progressBar = document.getElementById('checklist-progress-bar');
  const sideBadge = document.getElementById('side-task-badge');
  const sideProgressVal = document.getElementById('side-progress-val');
  const sideProgressFill = document.getElementById('side-progress-fill');

  phaseButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      phaseButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const phase = btn.dataset.phase;
      if (day1Container) day1Container.classList.toggle('hidden', phase !== 'day1');
      if (day3Container) day3Container.classList.toggle('hidden', phase !== 'day3');
      if (week2Container) week2Container.classList.toggle('hidden', phase !== 'week2');
    });
  });

  window.updateChecklistProgress = function() {
    const activeTasks = document.querySelectorAll('#tasks-day1 .task-row');
    const total = activeTasks.length;
    let completed = 0;

    activeTasks.forEach(row => {
      const cb = row.querySelector('.task-checkbox');
      const badge = row.querySelector('.task-badge-state');
      if (cb && cb.checked) {
        row.classList.add('completed');
        if (badge) badge.textContent = 'Done ✓';
        completed++;
      } else if (cb) {
        row.classList.remove('completed');
        if (badge) badge.textContent = 'To Do';
      }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (countLabel) countLabel.textContent = `${completed} of ${total} Tasks Completed`;
    if (percentLabel) percentLabel.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (sideBadge) sideBadge.textContent = `${completed}/${total}`;
    if (sideProgressVal) sideProgressVal.textContent = `${percent}%`;
    if (sideProgressFill) sideProgressFill.style.width = `${percent}%`;

    if (completed === total && total > 0) {
      showToast('🎉 All Day 1 Tasks Completed! Excellent start, Alex!');
    }
  };

  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', window.updateChecklistProgress);
  });

  window.updateChecklistProgress();
}

/* ==========================================================
   5. BENCHMARK EXAMPLES LIBRARY
   ========================================================== */
const defaultBenchmarks = {
  report: {
    title: 'Weekly Task Progress Report (Sample from Previous Intern)',
    owner: 'Signoff by: <strong>Sarah Jenkins (Task Lead)</strong>',
    filename: '2026_W03_Intern_Task_Report_Final.pdf',
    structure: '1. Summary of Completed Tasks • 2. Blockers Encountered • 3. Next Week Priorities',
    why: 'Clear bullet points, links to all raw files in Google Drive, and proactive escalation of blockers.',
    tip: '💡 <strong>Intern Tip:</strong> Always save your draft in the <code>/Team_Shared/Drafts/</code> Google Drive folder and notify your lead via WhatsApp for quick initial feedback!'
  },
  spec: {
    title: 'Task / Feature Specification (Sample from Senior Colleague)',
    owner: 'Signoff by: <strong>Sarah Jenkins (Task Lead) & Rohan Mehta (DevOps)</strong>',
    filename: 'Spec_User_Notification_Flow_v2.docx',
    structure: '1. Problem Statement • 2. Step-by-Step Flow • 3. File Directory Locations • 4. Signoff Matrix',
    why: 'Includes clear visual diagrams, explicit edge cases, and tags the exact owner for each subsystem.',
    tip: '💡 <strong>Intern Tip:</strong> If two colleagues suggest different approaches on a spec, ask the primary task lead to clarify the target direction before writing detailed documentation.'
  },
  tracker: {
    title: 'Task Tracking Spreadsheet (Sample Standard Format)',
    owner: 'Signoff by: <strong>Core Product Operations</strong>',
    filename: '2026_Q1_Operations_Task_Tracker.xlsx',
    structure: 'Columns: Task ID | Description | Assigned Lead | Status | Google Drive Deliverable Link',
    why: 'Every completed row contains a direct link to the deliverable in Google Drive, making reviews instantaneous.',
    tip: '💡 <strong>Intern Tip:</strong> Update your status daily at 5 PM so your lead can see your progress without having to interrupt you during deep work.'
  }
};

window.benchmarksData = { ...defaultBenchmarks };

function initBenchmarkLibrary() {
  const tabsContainer = document.getElementById('example-tabs-container');
  const titleEl = document.getElementById('bm-title');
  const ownerEl = document.getElementById('bm-owner');
  const filenameEl = document.getElementById('bm-filename');
  const structureEl = document.getElementById('bm-structure');
  const whyEl = document.getElementById('bm-why');
  const tipEl = document.getElementById('bm-tip');

  window.renderBenchmark = function(key) {
    const data = window.benchmarksData[key];
    if (!data) return;

    if (titleEl) titleEl.textContent = data.title;
    if (ownerEl) ownerEl.innerHTML = data.owner;
    if (filenameEl) filenameEl.textContent = data.filename;
    if (structureEl) structureEl.textContent = data.structure;
    if (whyEl) whyEl.textContent = data.why;
    if (tipEl) tipEl.innerHTML = data.tip;

    const pills = document.querySelectorAll('.ex-pill');
    pills.forEach(p => p.classList.toggle('active', p.dataset.ex === key));
  };

  if (tabsContainer) {
    tabsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.ex-pill');
      if (pill) {
        window.renderBenchmark(pill.dataset.ex);
        showToast(`Viewing sample: ${pill.textContent}`);
      }
    });
  }
}

/* ==========================================================
   6. SCOPED AI CHAT ASSISTANT
   ========================================================== */
function initAssistantChat() {
  const chatStream = document.getElementById('chat-stream');
  const form = document.getElementById('assistant-form');
  const input = document.getElementById('assistant-input-field');
  const chips = document.querySelectorAll('.chip-item');

  const knowledgeBase = [
    {
      keywords: ['conflict', 'conflicting', 'different instruction', 'different people', 'two people'],
      response: "If you receive conflicting instructions from different people, don't guess! Always escalate politely to the primary Task Lead (Sarah Jenkins). Say: 'Person A suggested X and Person B suggested Y—which path should I follow for this sprint?' This is completely normal and shows high professionalism."
    },
    {
      keywords: ['where are files', 'where to find', 'drive', 'stored', 'folder'],
      response: "All active projects, raw files, and deliverables are located in the shared Google Drive at '/Team_Shared/Projects/2026/'. For past intern reports and templates, inspect the Completed Work Library right above on your dashboard!"
    },
    {
      keywords: ['naming', 'file naming', 'name format'],
      response: "Standard file naming convention: YYYY_TaskName_Version_Initials (e.g. 2026_WeeklyReport_v1_AR.pdf). Avoid vague names like 'Final_doc.pdf'!"
    },
    {
      keywords: ['standup', 'daily standup', 'meeting'],
      response: "Daily standup happens Monday through Friday at 10:00 AM on Google Meet (15 minutes). The format is: 1. What you completed yesterday, 2. What you're working on today, 3. Any blockers."
    },
    {
      keywords: ['access', 'permission', 'github', 'login', 'tools'],
      response: "For any software access, GitHub repo invites, or Docker permissions, ping Rohan Mehta (DevOps/IT) on Slack. Most permissions are granted within 30 minutes."
    },
    {
      keywords: ['obvious', 'dumb question', 'embarrassed', 'hesitate'],
      response: "Never hesitate! No question is considered too obvious during your first month. You can ask me privately anytime, or ask your mentor Jordan during your 4:30 PM sync."
    }
  ];

  function addMessage(text, sender = 'user') {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;

    if (sender === 'ai') {
      msg.innerHTML = `
        <div class="msg-avatar">🤖</div>
        <div class="msg-bubble">${text}</div>
      `;
    } else {
      msg.innerHTML = `
        <div class="msg-bubble">${text}</div>
      `;
    }

    chatStream.appendChild(msg);
    chatStream.scrollTop = chatStream.scrollHeight;
  }

  function handleQuery(queryText) {
    const clean = queryText.toLowerCase().trim();
    if (!clean) return;

    addMessage(queryText, 'user');

    setTimeout(() => {
      let reply = null;
      for (const item of knowledgeBase) {
        if (item.keywords.some(k => clean.includes(k))) {
          reply = item.response;
          break;
        }
      }

      if (!reply) {
        reply = "Great question! According to company guidelines, check the Completed Work Library on your dashboard, save drafts in '/Team_Shared/Drafts/' Drive folder, or ping your mentor Jordan Rivera during your 4:30 PM sync.";
      }

      addMessage(reply, 'ai');
    }, 400);
  }

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        handleQuery(val);
        input.value = '';
      }
    });
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.dataset.q;
      if (q) handleQuery(q);
    });
  });
}

/* ==========================================================
   7. USABILITY TEST FEEDBACK COLLECTOR (FOR FRIENDS)
   ========================================================== */
function initFeedbackCollector() {
  const btnOpenFeedback = document.getElementById('btn-open-feedback');
  const btnViewFeedbackLog = document.getElementById('btn-view-feedback-log');
  const formFeedback = document.getElementById('form-tester-feedback');
  const feedbackContainer = document.getElementById('feedback-cards-container');
  const feedbackCountBadge = document.getElementById('feedback-count-badge');
  const btnExport = document.getElementById('btn-export-feedback');

  function getStoredFeedback() {
    try {
      return JSON.parse(localStorage.getItem('internhub_tester_feedback')) || [];
    } catch {
      return [];
    }
  }

  function saveFeedback(list) {
    localStorage.setItem('internhub_tester_feedback', JSON.stringify(list));
    updateFeedbackBadge();
  }

  function updateFeedbackBadge() {
    const list = getStoredFeedback();
    if (feedbackCountBadge) {
      feedbackCountBadge.textContent = list.length;
    }
  }

  function renderFeedbackLog() {
    const list = getStoredFeedback();
    if (!feedbackContainer) return;

    if (list.length === 0) {
      feedbackContainer.innerHTML = `
        <div class="fb-empty-state">
          No feedback logged yet. Ask your friends to click <strong>"💬 Give Feedback"</strong> in the top bar to test the tool!
        </div>
      `;
      return;
    }

    feedbackContainer.innerHTML = list.map((item, idx) => `
      <div class="fb-log-card">
        <div class="fb-log-header">
          <span class="fb-log-name">Tester #${idx + 1}: ${escapeHtml(item.name)}</span>
          <span class="fb-log-rating">${'⭐'.repeat(parseInt(item.rating, 10))} (${item.rating}/5)</span>
        </div>
        <div class="fb-log-body">
          <p><strong>Most Useful Feature:</strong> ${escapeHtml(item.favorite)}</p>
          <p><strong>What Worked (Likes +):</strong> "${escapeHtml(item.likes)}"</p>
          <p><strong>What to Improve (Wishes Δ):</strong> "${escapeHtml(item.wishes)}"</p>
          <p class="text-muted" style="font-size:0.7rem; margin-top:4px;">Submitted: ${item.date || 'Today'}</p>
        </div>
      </div>
    `).join('');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  const successState = document.getElementById('feedback-success-state');
  const previewContent = document.getElementById('fb-preview-content');
  const successName = document.getElementById('fb-success-name');
  const btnShareWhatsApp = document.getElementById('btn-share-whatsapp');
  const btnCopyReview = document.getElementById('btn-copy-review');
  const btnDoneFeedback = document.getElementById('btn-done-feedback');

  let lastReviewText = '';

  if (btnOpenFeedback) {
    btnOpenFeedback.addEventListener('click', () => {
      const modal = document.getElementById('modal-feedback');
      if (modal) {
        modal.classList.remove('hidden');
        if (formFeedback) formFeedback.classList.remove('hidden');
        if (successState) successState.classList.add('hidden');
      }
    });
  }

  if (btnViewFeedbackLog) {
    btnViewFeedbackLog.addEventListener('click', () => {
      renderFeedbackLog();
      const modal = document.getElementById('modal-feedback-log');
      if (modal) modal.classList.remove('hidden');
    });
  }

  if (formFeedback) {
    formFeedback.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('tester-name').value.trim();
      const rating = document.getElementById('tester-rating').value;
      const favorite = document.getElementById('tester-favorite').value;
      const likes = document.getElementById('tester-like').value.trim();
      const wishes = document.getElementById('tester-wish').value.trim();

      const newEntry = {
        name,
        rating,
        favorite,
        likes,
        wishes,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const current = getStoredFeedback();
      current.push(newEntry);
      saveFeedback(current);

      lastReviewText = `*InternHub Usability Test Feedback*
👤 Tester: ${name}
⭐ Rating: ${rating}/5 Stars
🌟 Most Useful Feature: ${favorite}
👍 What Worked (Likes +): "${likes}"
💡 Suggestions (Wishes Δ): "${wishes}"
📅 Date: ${newEntry.date}`;

      if (successName) successName.textContent = `Thank You, ${name}! 🎉`;
      if (previewContent) previewContent.textContent = lastReviewText;

      formFeedback.classList.add('hidden');
      if (successState) successState.classList.remove('hidden');

      showToast(`🎉 Feedback recorded for Stage 5 Testing!`);
    });
  }

  if (btnShareWhatsApp) {
    btnShareWhatsApp.addEventListener('click', () => {
      const text = encodeURIComponent(lastReviewText);
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
      showToast('Opening WhatsApp with your review...');
    });
  }

  if (btnCopyReview) {
    btnCopyReview.addEventListener('click', () => {
      navigator.clipboard.writeText(lastReviewText).then(() => {
        showToast('📋 Review copied to clipboard!');
      }).catch(() => {
        showToast('Review ready in console.');
      });
    });
  }

  if (btnDoneFeedback) {
    btnDoneFeedback.addEventListener('click', () => {
      const modal = document.getElementById('modal-feedback');
      if (modal) modal.classList.add('hidden');
      if (formFeedback) {
        formFeedback.reset();
        formFeedback.classList.remove('hidden');
      }
      if (successState) successState.classList.add('hidden');
    });
  }

  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const list = getStoredFeedback();
      if (list.length === 0) {
        showToast('No feedback to export yet.');
        return;
      }

      const md = list.map((item, i) => `### Tester #${i + 1}: ${item.name} (${item.rating}/5 Stars)
- **Most Useful Feature:** ${item.favorite}
- **Likes (+):** ${item.likes}
- **Wishes (Δ):** ${item.wishes}
- **Date:** ${item.date}
`).join('\n');

      navigator.clipboard.writeText(md).then(() => {
        showToast('📋 Tester feedback copied to clipboard in Markdown format!');
      }).catch(() => {
        showToast('Feedback generated (check console).');
        console.log(md);
      });
    });
  }

  updateFeedbackBadge();
}

/* ==========================================================
   8. MODALS & MANAGER CREATION HANDLERS
   ========================================================== */
function initModals() {
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
  }

  document.querySelectorAll('.modal-close, [data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetId = btn.dataset.modal || btn.closest('.modal-backdrop').id;
      if (targetId) closeModal(targetId);
    });
  });

  const btnAddTask = document.getElementById('btn-quick-add-task');
  const btnAddTaskInline = document.getElementById('btn-add-task-inline');
  if (btnAddTask) btnAddTask.addEventListener('click', () => openModal('modal-add-task'));
  if (btnAddTaskInline) btnAddTaskInline.addEventListener('click', () => openModal('modal-add-task'));

  const btnAddExample = document.getElementById('btn-quick-add-example');
  const btnAddExampleInline = document.getElementById('btn-add-example-inline');
  if (btnAddExample) btnAddExample.addEventListener('click', () => openModal('modal-add-example'));
  if (btnAddExampleInline) btnAddExampleInline.addEventListener('click', () => openModal('modal-add-example'));

  const btnAddContact = document.getElementById('btn-quick-add-contact');
  const btnAddContactInline = document.getElementById('btn-add-contact-inline');
  if (btnAddContact) btnAddContact.addEventListener('click', () => openModal('modal-add-contact'));
  if (btnAddContactInline) btnAddContactInline.addEventListener('click', () => openModal('modal-add-contact'));

  const btnViewDoc = document.getElementById('btn-view-doc');
  if (btnViewDoc) btnViewDoc.addEventListener('click', () => openModal('modal-report'));

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  });

  // SUBMIT: ADD TASK
  const formTask = document.getElementById('form-create-task');
  if (formTask) {
    formTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('new-task-title').value.trim();
      const phase = document.getElementById('new-task-phase').value;
      const owner = document.getElementById('new-task-owner').value.trim();
      const time = document.getElementById('new-task-time').value.trim();

      const container = document.getElementById(`tasks-${phase}`);
      if (container) {
        const row = document.createElement('label');
        row.className = 'task-row';
        row.innerHTML = `
          <input type="checkbox" class="task-checkbox">
          <div class="task-info-block">
            <span class="task-title-text">${title}</span>
            <span class="task-meta-text">⏱️ Est: ${time} • <span class="tag-owner tag-lead">Owner: ${owner}</span></span>
          </div>
          <span class="task-badge-state">To Do</span>
        `;
        
        row.querySelector('.task-checkbox').addEventListener('change', window.updateChecklistProgress);
        container.appendChild(row);

        closeModal('modal-add-task');
        formTask.reset();
        window.updateChecklistProgress();
        showToast(`✅ Added new task: "${title}" to ${phase.toUpperCase()}!`);
      }
    });
  }

  // SUBMIT: ADD EXAMPLE
  const formExample = document.getElementById('form-create-example');
  if (formExample) {
    formExample.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('new-ex-id').value.trim().toLowerCase();
      const label = document.getElementById('new-ex-label').value.trim();
      const title = document.getElementById('new-ex-title').value.trim();
      const filename = document.getElementById('new-ex-filename').value.trim();
      const structure = document.getElementById('new-ex-structure').value.trim();
      const why = document.getElementById('new-ex-why').value.trim();
      const tip = document.getElementById('new-ex-tip').value.trim();

      window.benchmarksData[id] = {
        title,
        owner: 'Signoff by: <strong>Team Lead</strong>',
        filename,
        structure,
        why,
        tip: `💡 <strong>Intern Tip:</strong> ${tip}`
      };

      const tabsContainer = document.getElementById('example-tabs-container');
      if (tabsContainer) {
        const btn = document.createElement('button');
        btn.className = 'ex-pill';
        btn.dataset.ex = id;
        btn.textContent = label;
        tabsContainer.appendChild(btn);
      }

      window.renderBenchmark(id);
      closeModal('modal-add-example');
      formExample.reset();
      showToast(`✅ Added new benchmark example: "${label}"!`);
    });
  }

  // SUBMIT: ADD CONTACT
  const formContact = document.getElementById('form-create-contact');
  if (formContact) {
    formContact.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-c-name').value.trim();
      const role = document.getElementById('new-c-role').value.trim();
      const duty = document.getElementById('new-c-duty').value.trim();

      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'TM';
      const container = document.getElementById('contacts-container');
      if (container) {
        const card = document.createElement('div');
        card.className = 'contact-card';
        card.innerHTML = `
          <div class="c-av av-custom">${initials}</div>
          <div class="c-info">
            <div class="c-name">${name}</div>
            <div class="c-role">${role}</div>
            <div class="c-duty">Approach for: <strong>${duty}</strong></div>
          </div>
          <button class="c-ping-btn" onclick="alert('Simulated: Pinging ${name}')">Message</button>
        `;
        container.appendChild(card);
        closeModal('modal-add-contact');
        formContact.reset();
        showToast(`✅ Added contact: ${name} to directory!`);
      }
    });
  }
}

/* ==========================================================
   9. TOAST NOTIFICATION UTILITY
   ========================================================== */
function showToast(message, duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }, duration);
}
