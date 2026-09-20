/**
 * INTERNHUB - WORKSPACE & TESTER FEEDBACK COLLECTOR
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
  initEdaCharts();
  initMLSimulator();
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
      showToast(newTheme === 'theme-dark' ? 'Dark mode enabled' : 'Light mode enabled');
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
  const sideAnalytics = document.getElementById('side-nav-analytics');
  const sectionAnalytics = document.getElementById('section-analytics');
  const btnQuickEda = document.getElementById('btn-quick-eda');

  function setMode(managerActive) {
    isManagerMode = managerActive;
    if (managerBar) managerBar.classList.toggle('hidden', !isManagerMode);
    if (modeText) modeText.textContent = isManagerMode ? 'Manager Mode' : 'Intern View';
    if (btnModeText) btnModeText.textContent = isManagerMode ? 'Switch to Intern View' : 'Switch to Manager Mode';
    
    creatorButtons.forEach(btn => {
      btn.classList.toggle('hidden', !isManagerMode);
    });

    // Hide Empathy EDA & ML in Intern View; reveal in Manager/Evaluator Mode
    if (sideAnalytics) sideAnalytics.classList.toggle('hidden', !isManagerMode);
    if (sectionAnalytics) sectionAnalytics.classList.toggle('hidden', !isManagerMode);

    if (isManagerMode) {
      showToast('Manager Mode active: Unlocked Empathy EDA and Content Editor.');
    } else {
      showToast('Switched to Intern View.');
      // If user was viewing analytics, navigate back to overview
      const activeBtn = document.querySelector('.side-nav-btn.active');
      if (activeBtn && activeBtn.dataset.section === 'analytics') {
        const overviewBtn = document.querySelector('.side-nav-btn[data-section="all"]');
        if (overviewBtn) overviewBtn.click();
      }
    }
  }

  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', () => {
      setMode(!isManagerMode);
    });
  }

  if (btnQuickEda) {
    btnQuickEda.addEventListener('click', () => {
      if (sectionAnalytics) {
        sectionAnalytics.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const navButtons = document.querySelectorAll('.side-nav-btn');
        navButtons.forEach(b => b.classList.remove('active'));
        if (sideAnalytics) sideAnalytics.classList.add('active');
      }
    });
  }

  // Ensure default state on load is clean Intern View
  setMode(false);
}

/* ==========================================================
   4. PROGRESSIVE DAILY CHECKLIST & DYNAMIC PHASES
   ========================================================== */
function initProgressiveChecklist() {
  const countLabel = document.getElementById('checklist-count-label');
  const percentLabel = document.getElementById('checklist-percent-label');
  const progressBar = document.getElementById('checklist-progress-bar');
  const sideBadge = document.getElementById('side-task-badge');
  const sideProgressVal = document.getElementById('side-progress-val');
  const sideProgressFill = document.getElementById('side-progress-fill');

  function getStoredCustomPhases() {
    try {
      return JSON.parse(localStorage.getItem('internhub_custom_phases')) || [];
    } catch {
      return [];
    }
  }

  function saveStoredCustomPhase(phaseObj) {
    const list = getStoredCustomPhases();
    list.push(phaseObj);
    localStorage.setItem('internhub_custom_phases', JSON.stringify(list));
  }

  function wirePhaseEvents() {
    const phaseButtons = document.querySelectorAll('.phase-btn');
    phaseButtons.forEach(btn => {
      btn.onclick = () => {
        phaseButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const phase = btn.dataset.phase;
        document.querySelectorAll('#section-checklist .tasks-group').forEach(group => {
          group.classList.toggle('hidden', group.id !== `tasks-${phase}`);
        });

        window.updateChecklistProgress();
      };
    });
  }

  window.addNewPhase = function(name, status = 'Locked', desc = '', persist = true) {
    const phaseId = 'phase-' + name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    // Check if phase button already exists
    let existingBtn = document.querySelector(`.phase-btn[data-phase="${phaseId}"]`);
    if (existingBtn) {
      existingBtn.click();
      return phaseId;
    }

    // 1. Add tab button to phase selector
    const tabsContainer = document.getElementById('phase-tabs-container') || document.querySelector('.phase-selector');
    if (tabsContainer) {
      const btn = document.createElement('button');
      btn.className = 'phase-btn';
      btn.dataset.phase = phaseId;
      btn.textContent = `${name} (${status})`;
      tabsContainer.appendChild(btn);
    }

    // 2. Add container to checklist section
    const sectionChecklist = document.getElementById('section-checklist');
    if (sectionChecklist && !document.getElementById(`tasks-${phaseId}`)) {
      const group = document.createElement('div');
      group.className = 'tasks-group hidden';
      group.id = `tasks-${phaseId}`;
      group.innerHTML = `
        <div class="locked-callout">
          <strong>${name} (${status}):</strong> ${desc || 'Milestone tasks scheduled for this phase.'}
        </div>
        <div class="tasks-empty-hint" style="padding: 1.5rem 1rem; color: var(--text-muted); font-size: 0.85rem; text-align: center;">
          No tasks added for this phase yet. Click <strong>+ Add Task</strong> above to assign responsibilities!
        </div>
      `;
      sectionChecklist.appendChild(group);
    }

    // 3. Add to Task Creator Dropdown
    const select = document.getElementById('new-task-phase');
    if (select && !select.querySelector(`option[value="${phaseId}"]`)) {
      const opt = document.createElement('option');
      opt.value = phaseId;
      opt.textContent = `${name} (${status})`;
      select.appendChild(opt);
    }

    if (persist) {
      saveStoredCustomPhase({ name, status, desc, phaseId });
    }

    wirePhaseEvents();

    const newBtn = document.querySelector(`.phase-btn[data-phase="${phaseId}"]`);
    if (newBtn && persist) {
      newBtn.click();
      const select = document.getElementById('new-task-phase');
      if (select) select.value = phaseId;
    }

    return phaseId;
  };

  function getStoredCustomTasks() {
    try {
      return JSON.parse(localStorage.getItem('internhub_custom_tasks')) || [];
    } catch {
      return [];
    }
  }

  window.saveCustomTaskToStorage = function(taskObj) {
    const list = getStoredCustomTasks();
    list.push(taskObj);
    localStorage.setItem('internhub_custom_tasks', JSON.stringify(list));
  };

  window.renderTaskRow = function(container, task) {
    const emptyHint = container.querySelector('.tasks-empty-hint');
    if (emptyHint) emptyHint.remove();

    const row = document.createElement('label');
    row.className = 'task-row';
    row.innerHTML = `
      <input type="checkbox" class="task-checkbox">
      <div class="task-info-block">
        <span class="task-title-text">${task.title}</span>
        <span class="task-meta-text">⏱️ Est: ${task.time} • <span class="tag-owner tag-lead">Owner: ${task.owner}</span></span>
      </div>
      <span class="task-badge-state">To Do</span>
    `;
    row.querySelector('.task-checkbox').addEventListener('change', window.updateChecklistProgress);
    container.appendChild(row);
  };

  // Load custom manager-created days on load
  const storedPhases = getStoredCustomPhases();
  storedPhases.forEach(p => {
    window.addNewPhase(p.name, p.status, p.desc, false);
  });

  // Load custom manager-created tasks on load
  const storedTasks = getStoredCustomTasks();
  storedTasks.forEach(task => {
    const container = document.getElementById(`tasks-${task.phase}`);
    if (container) {
      window.renderTaskRow(container, task);
    }
  });

  window.updateChecklistProgress = function() {
    const activeBtn = document.querySelector('.phase-btn.active');
    const activePhase = activeBtn ? activeBtn.dataset.phase : 'day1';
    const container = document.getElementById(`tasks-${activePhase}`) || document.getElementById('tasks-day1');
    const activeTasks = container ? container.querySelectorAll('.task-row') : [];
    const total = activeTasks.length;
    let completed = 0;

    activeTasks.forEach(row => {
      const cb = row.querySelector('.task-checkbox');
      const badge = row.querySelector('.task-badge-state');
      if (cb && cb.checked) {
        row.classList.add('completed');
        if (badge) badge.textContent = 'Done';
        completed++;
      } else if (cb) {
        row.classList.remove('completed');
        if (badge) badge.textContent = 'To Do';
      }
    });

    const activePhaseName = activeBtn ? activeBtn.textContent.split('(')[0].trim() : 'Day 1';
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    if (countLabel) countLabel.textContent = `${completed} of ${total} Tasks Completed (${activePhaseName})`;
    if (percentLabel) percentLabel.textContent = `${percent}%`;
    if (progressBar) progressBar.style.width = `${percent}%`;
    if (sideBadge) sideBadge.textContent = `${completed}/${total}`;
    if (sideProgressVal) sideProgressVal.textContent = `${percent}%`;
    if (sideProgressFill) sideProgressFill.style.width = `${percent}%`;

    if (completed === total && total > 0 && activePhase === 'day1') {
      showToast('All Day 1 tasks completed.');
    }
  };

  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', window.updateChecklistProgress);
  });

  wirePhaseEvents();
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
    tip: '<strong>Note:</strong> Always save your draft in the <code>/Team_Shared/Drafts/</code> Google Drive folder and notify your lead via WhatsApp for quick initial feedback!'
  },
  spec: {
    title: 'Task / Feature Specification (Sample from Senior Colleague)',
    owner: 'Signoff by: <strong>Sarah Jenkins (Task Lead) & Rohan Mehta (DevOps)</strong>',
    filename: 'Spec_User_Notification_Flow_v2.docx',
    structure: '1. Problem Statement • 2. Step-by-Step Flow • 3. File Directory Locations • 4. Signoff Matrix',
    why: 'Includes clear visual diagrams, explicit edge cases, and tags the exact owner for each subsystem.',
    tip: '<strong>Note:</strong> If two colleagues suggest different approaches on a spec, ask the primary task lead to clarify the target direction before writing detailed documentation.'
  },
  tracker: {
    title: 'Task Tracking Spreadsheet (Sample Standard Format)',
    owner: 'Signoff by: <strong>Core Product Operations</strong>',
    filename: '2026_Q1_Operations_Task_Tracker.xlsx',
    structure: 'Columns: Task ID | Description | Assigned Lead | Status | Google Drive Deliverable Link',
    why: 'Every completed row contains a direct link to the deliverable in Google Drive, making reviews instantaneous.',
    tip: '<strong>Note:</strong> Update your status daily at 5 PM so your lead can see your progress without having to interrupt you during deep work.'
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
   6. SCOPED AI CHAT ASSISTANT (CHATGPT-GRADE AI & MULTI-ENGINE)
   ========================================================== */
function initAssistantChat() {
  const chatStream = document.getElementById('chat-stream');
  const form = document.getElementById('assistant-form');
  const input = document.getElementById('assistant-input-field');
  const chips = document.querySelectorAll('.chip-item');
  const badgeStatus = document.getElementById('badge-llm-status');
  const btnOpenSettings = document.getElementById('btn-open-llm-settings');
  const btnSaveSettings = document.getElementById('btn-save-llm-settings');
  const engineRadios = document.querySelectorAll('input[name="assistant-engine"]');
  
  const openaiKeyContainer = document.getElementById('openai-key-container');
  const openaiKeyInput = document.getElementById('openai-api-key');
  const geminiKeyContainer = document.getElementById('gemini-key-container');
  const geminiKeyInput = document.getElementById('gemini-api-key');

  // Load saved assistant preferences (Default: 'smart')
  let activeEngine = localStorage.getItem('internhub_assistant_engine') || 'smart';
  let savedOpenAIKey = localStorage.getItem('internhub_openai_api_key') || '';
  let savedGeminiKey = localStorage.getItem('internhub_gemini_api_key') || '';

  if (openaiKeyInput && savedOpenAIKey) openaiKeyInput.value = savedOpenAIKey;
  if (geminiKeyInput && savedGeminiKey) geminiKeyInput.value = savedGeminiKey;

  // Track conversation turns for contextual chat
  const conversationHistory = [];

  function updateEngineUI() {
    engineRadios.forEach(r => {
      const isMatch = r.value === activeEngine;
      r.checked = isMatch;
      const card = r.closest('.engine-radio-card');
      if (card) card.classList.toggle('active', isMatch);
    });

    if (openaiKeyContainer) openaiKeyContainer.classList.toggle('hidden', activeEngine !== 'openai');
    if (geminiKeyContainer) geminiKeyContainer.classList.toggle('hidden', activeEngine !== 'gemini');

    if (badgeStatus) {
      if (activeEngine === 'openai') {
        badgeStatus.textContent = 'OpenAI (GPT-4o-mini)';
        badgeStatus.style.background = '#059669';
        badgeStatus.style.color = '#fff';
      } else if (activeEngine === 'gemini') {
        badgeStatus.textContent = 'Google Gemini';
        badgeStatus.style.background = '#2563eb';
        badgeStatus.style.color = '#fff';
      } else {
        badgeStatus.textContent = 'Built-in Engine';
        badgeStatus.style.background = '#1d4ed8';
        badgeStatus.style.color = '#fff';
      }
    }
  }

  updateEngineUI();

  engineRadios.forEach(r => {
    r.addEventListener('change', () => {
      const val = r.value;
      if (openaiKeyContainer) openaiKeyContainer.classList.toggle('hidden', val !== 'openai');
      if (geminiKeyContainer) geminiKeyContainer.classList.toggle('hidden', val !== 'gemini');
      document.querySelectorAll('.engine-radio-card').forEach(c => c.classList.remove('active'));
      r.closest('.engine-radio-card')?.classList.add('active');
    });
  });

  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      const modal = document.getElementById('modal-llm-settings');
      if (modal) modal.classList.remove('hidden');
    });
  }

  if (badgeStatus) {
    badgeStatus.addEventListener('click', () => {
      const modal = document.getElementById('modal-llm-settings');
      if (modal) modal.classList.remove('hidden');
    });
  }

  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      const selected = document.querySelector('input[name="assistant-engine"]:checked');
      activeEngine = selected ? selected.value : 'smart';
      localStorage.setItem('internhub_assistant_engine', activeEngine);

      if (openaiKeyInput) {
        savedOpenAIKey = openaiKeyInput.value.trim();
        localStorage.setItem('internhub_openai_api_key', savedOpenAIKey);
      }
      if (geminiKeyInput) {
        savedGeminiKey = geminiKeyInput.value.trim();
        localStorage.setItem('internhub_gemini_api_key', savedGeminiKey);
      }

      updateEngineUI();
      const modal = document.getElementById('modal-llm-settings');
      if (modal) modal.classList.add('hidden');
      
      const engineLabel = activeEngine === 'openai' ? 'OpenAI ChatGPT (GPT-4o-mini)' : (activeEngine === 'gemini' ? 'Google Gemini API' : 'Built-in Engine');
      showToast(`${engineLabel} active!`);
    });
  }

  // Simple, fast Markdown Formatter for ChatGPT-like bubbles
  function formatMarkdown(text) {
    if (!text) return '';
    let out = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks ```lang ... ```
    out = out.replace(/```(?:[a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    // Inline code `code`
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headings ### and ##
    out = out.replace(/^###\s+([^\n]+)/gm, '<h4 style="margin: 0.2rem 0 0.4rem 0; font-size: 0.92rem; font-weight: 700; color: var(--text-primary);">$1</h4>');
    out = out.replace(/^##\s+([^\n]+)/gm, '<h3 style="margin: 0.3rem 0 0.5rem 0; font-size: 1.02rem; font-weight: 700; color: var(--text-primary);">$1</h3>');

    // Bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic *text*
    out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Lists (- or • or * item)
    out = out.replace(/(?:^|\n)[-•*]\s+([^\n]+)/g, '\n<li>$1</li>');
    out = out.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
    out = out.replace(/<\/ul>\s*<ul>/g, '');

    // Numbered lists (1. item)
    out = out.replace(/(?:^|\n)\d+\.\s+([^\n]+)/g, '\n<li>$1</li>');
    
    // Double newlines into paragraphs
    const paragraphs = out.split(/\n{2,}/);
    out = paragraphs.map(p => {
      p = p.trim();
      if (!p) return '';
      if (p.startsWith('<pre>') || p.startsWith('<ul>') || p.startsWith('<ol>') || p.startsWith('<h3') || p.startsWith('<h4')) return p;
      return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');

    return out;
  }

  function addMessage(text, sender = 'user', isRawHtml = false) {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;

    const contentHtml = isRawHtml ? text : formatMarkdown(text);

    if (sender === 'ai') {
      msg.innerHTML = `
        <div class="msg-avatar">AI</div>
        <div class="msg-bubble">${contentHtml}</div>
      `;
    } else {
      msg.innerHTML = `
        <div class="msg-bubble">${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      `;
    }

    chatStream.appendChild(msg);
    chatStream.scrollTop = chatStream.scrollHeight;
    return msg;
  }

  const systemPrompt = `You are an elite, empathetic, and encouraging AI onboarding mentor in InternHub for a first-time intern named Alex Rivera at Acme Corp.
You answer ANY question-both internal Acme Corp workflows and general "out-of-the-box" technical, career, or workplace questions.

Acme Corp Specifics:
- Dedicated Mentor: Jordan Rivera (Senior Engineer, daily sync today at 4:30 PM).
- Task Lead: Sarah Jenkins (escalate conflicting lead instructions politely to her).
- IT & Tool Access: Rohan Mehta (DevOps/IT on Slack, standard turnaround ~30 mins).
- Drive Storage: /Team_Shared/Drafts/ for in-progress work, /Team_Shared/Projects/2026/ for finalized deliverables.
- File Naming: YYYY_TaskName_Version_Initials (e.g., 2026_WeeklyReport_v1_AR.pdf).
- Daily Standup: Mon-Fri 10:00 AM on Google Meet (15 mins; 3 bullet points: yesterday, today, blockers).
- Culture: Zero judgment. Asking basic questions early is celebrated.

Style: Clear, structured, encouraging, formatted with clean bullet points and bold highlights, like ChatGPT.`;

  // Live OpenAI API Execution (ChatGPT)
  async function queryOpenAILLM(queryText, bubbleElement) {
    if (!savedOpenAIKey) {
      bubbleElement.innerHTML = formatMarkdown(
        "**OpenAI API Key Not Found**\n\nPlease click **'AI Model & Key Settings'** above to enter your OpenAI key (`sk-...`). Falling back to the Smart Built-in AI:\n\n" + generateSmartAIResponse(queryText)
      );
      return;
    }

    bubbleElement.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
      <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 6px;">Consulting ChatGPT (GPT-4o-mini)...</span>
    `;

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-6),
        { role: 'user', content: queryText }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedOpenAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: messages,
          temperature: 0.7,
          max_tokens: 600
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Status ${res.status}`);
      }

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content;
      if (answer) {
        bubbleElement.innerHTML = formatMarkdown(answer);
        conversationHistory.push({ role: 'user', content: queryText });
        conversationHistory.push({ role: 'assistant', content: answer });
      } else {
        throw new Error('No completion returned');
      }
    } catch (err) {
      bubbleElement.innerHTML = formatMarkdown(
        `**OpenAI API Notice:** (${err.message}). Using Smart Built-in AI fallback:\n\n` + generateSmartAIResponse(queryText)
      );
    }
  }

  // Live Google Gemini API Execution
  async function queryGeminiLLM(queryText, bubbleElement) {
    if (!savedGeminiKey) {
      bubbleElement.innerHTML = formatMarkdown(
        "**Gemini API Key Not Found**\n\nPlease click **'AI Model & Key Settings'** above to enter your Gemini key (`AIzaSy...`). Falling back to the Smart Built-in AI:\n\n" + generateSmartAIResponse(queryText)
      );
      return;
    }

    bubbleElement.innerHTML = `
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
      <span style="font-size: 0.78rem; color: var(--text-muted); margin-left: 6px;">Generating with Gemini 1.5 Flash...</span>
    `;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${savedGeminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nIntern Alex asks: "${queryText}"` }] }
          ]
        })
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const generated = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generated) {
        bubbleElement.innerHTML = formatMarkdown(generated);
        conversationHistory.push({ role: 'user', content: queryText });
        conversationHistory.push({ role: 'assistant', content: generated });
      } else {
        throw new Error('Empty response');
      }
    } catch (err) {
      bubbleElement.innerHTML = formatMarkdown(
        `**Gemini API Notice:** (${err.message}). Using Smart Built-in AI fallback:\n\n` + generateSmartAIResponse(queryText)
      );
    }
  }

  // Comprehensive Smart In-Browser AI Engine (Answers ANY technical, workplace, or out-of-the-box question)
  function generateSmartAIResponse(queryText) {
    const q = queryText.toLowerCase().trim();

    // 1. GREETINGS & CASUAL
    if (/^(hi|hii|hiii|hello|hey|heyy|heya|yo|sup|good morning|good afternoon|good evening)\b/.test(q)) {
      return "Alex, I am your internal onboarding assistant at Acme Corp. You can ask me anything about **company workflows, where files are saved, standup format, mentor syncs, or day-to-day intern tasks** without worrying about interrupting anyone! How can I help you today?";
    }
    if (/^(thanks|thank you|thx|awesome|perfect|great|cool|understood|got it)\b/.test(q)) {
      return "You are welcome, Alex. I'm here 24/7 on your dashboard whenever you need clarification on Acme procedures, checklists, or files. Keep up the great work!";
    }
    if (/joke|make me laugh|humor/.test(q)) {
      return "First weeks involve learning team protocols and file conventions. Let me know which standard or procedure you would like to review.";
    }

    // AI IN THE CONTEXT OF ACME & INTERNHUB
    if (/\b(what is ai|what is artificial intelligence|tell me about ai|about ai)\b/.test(q)) {
      return "### AI Tools at Acme Corp\n\n" +
        "In the context of Acme Corp and your onboarding:\n\n" +
        "- **Safe-to-Ask Assistant:** That's me! I provide private, zero-judgment guidance on company processes and intern deliverables so you never have to hesitate or guess.\n" +
        "- **92% ML Risk Predictor:** InternHub includes an explainable Machine Learning classifier (viewable in **Manager Mode**) that helps leads detect onboarding friction early and prescribe automated support.\n\n" +
        "*Note:* I'm specifically customized for **Acme onboarding and your intern deliverables**. For general non-company queries, open-domain tools like ChatGPT or Gemini are best suited!";
    }

    // 2. GIT & VERSION CONTROL (Out-of-the-box Tech)
    if (/git commit|commit message|how to commit|writing commit/.test(q)) {
      return "Writing clean git commit messages is one of the fastest ways to impress senior engineers! Here is the industry benchmark:\n\n" +
        "### Standard Commit Format (`type(scope): subject`)\n" +
        "- `feat: add user authentication modal`\n" +
        "- `fix: resolve crash when checklist item is untracked`\n" +
        "- `docs: update onboarding README instructions`\n" +
        "- `refactor: clean up API client handler`\n\n" +
        "### 3 Standard Rules:\n" +
        "1. **Use imperative mood** (*'add feature'*, not *'added feature'* or *'adds feature'*).\n" +
        "2. **Keep the title under 50 characters**; leave detailed context in the body if needed.\n" +
        "3. **Never commit broken code**-always run a quick test before staging (`git status`).";
    }
    if (/git branch|create branch|git checkout|git switch/.test(q)) {
      return "Here is how to manage git branches cleanly on engineering teams:\n\n" +
        "- **Create & switch to a new branch:** `git checkout -b feature/your-feature-name` (or `git switch -c feature/name`)\n" +
        "- **See active branches:** `git branch -a`\n" +
        "- **Switch back to main:** `git checkout main` && `git pull origin main`\n" +
        "- **Push new branch to remote:** `git push -u origin feature/your-feature-name`\n\n" +
        "**Note:** Always name branches with prefixes like `feature/`, `bugfix/`, or `docs/` and never push directly to `main` without a Pull Request!";
    }
    if (/merge conflict|conflict in git|how to resolve conflict/.test(q)) {
      return "Merge conflicts occur when two branches modify overlapping lines-they just mean two people edited overlapping lines.\n\n" +
        "### Step-by-Step Resolution:\n" +
        "1. Run `git status` to see conflicting files.\n" +
        "2. Open the file in VS Code. Look for the conflict markers:\n" +
        "   `<<<<<<< HEAD` (your changes)\n" +
        "   `=======` (divider)\n" +
        "   `>>>>>>> incoming_branch` (their changes)\n" +
        "3. Pick the correct version (or combine them) and delete the markers.\n" +
        "4. Save, stage the fix with `git add <file>`, and finish with `git commit -m 'resolve merge conflict'`.\n\n" +
        "If you ever feel stuck, ping **Rohan Mehta** or ask **Jordan Rivera** during your 4:30 PM sync!";
    }
    if (/pull request|pr review|how to open a pr|code review/.test(q)) {
      return "Opening a great Pull Request (PR) makes review smooth and quick:\n\n" +
        "1. **Title:** Brief summary of the outcome (e.g. `[FEAT] Add Export CSV button to analytics`).\n" +
        "2. **Description:** Mention *Why* the change was made and *What* was tested.\n" +
        "3. **Screenshots / Loom:** If it's UI work, add a quick GIF or screenshot!\n" +
        "4. **Self-Review First:** Review your own diff on GitHub before requesting peers to review-catches 80% of accidental typos.";
    }

    // 3. APIS & WEB ARCHITECTURE (Out-of-the-box Tech)
    if (/rest api|what is an api|explain api|how do apis work|restful/.test(q)) {
      return "### REST API Architecture\n\nA **REST API** (Representational State Transfer) is how web applications talk to servers over HTTP, like ordering food at a restaurant using a menu.\n\n" +
        "### Core HTTP Methods:\n" +
        "- `GET` : Retrieve data (e.g. `GET /interns` → returns list of interns)\n" +
        "- `POST` : Create new data (e.g. `POST /tasks` with a JSON payload)\n" +
        "- `PUT` / `PATCH` : Update existing records\n" +
        "- `DELETE` : Remove a record\n\n" +
        "### Key HTTP Status Codes to Know:\n" +
        "- `200 OK` : Success\n" +
        "- `201 Created` : New resource saved.\n" +
        "- `400 Bad Request` : Missing fields in your request.\n" +
        "- `401 / 403` : Authentication or permission denied.\n" +
        "- `404 Not Found` : Endpoint or ID does not exist.\n" +
        "- `500 Server Error` : Backend bug or crash.";
    }
    if (/json|what is json/.test(q)) {
      return "**JSON** (JavaScript Object Notation) is the universal format for sending structured data across the internet:\n\n" +
        "```json\n{\n  \"intern_id\": \"INT-1001\",\n  \"name\": \"Alex Rivera\",\n  \"role\": \"Software Engineering\",\n  \"active\": true\n}\n```\n\n" +
        "- In JavaScript: Use `JSON.stringify(obj)` to send, and `JSON.parse(str)` to read.\n" +
        "- In Python: Use `json.dumps(dict)` and `json.loads(str)`.";
    }

    // 4. PROGRAMMING & DEBUGGING (Out-of-the-box Tech)
    if (/debug|how to debug|debugging tips|code not working|error in code/.test(q)) {
      return "### Systematic 4-Step Debugging Method:\n\n" +
        "1. **Read the Exact Error Message:** Scroll to the bottom of the stack trace. The line number and error name (e.g. `TypeError: Cannot read property of undefined`) tell you exactly where the chain broke.\n" +
        "2. **Isolate the Inputs:** Log the values right before the failing line (`console.log()` or `print()`). Never guess what a variable contains-verify it!\n" +
        "3. **Reproduce Minimally:** Can you trigger the bug with 1 input? If so, you've found the edge case.\n" +
        "4. **Rubber Ducking:** Explain the code line-by-line out loud (or to me right here in chat). 9 times out of 10, stating the assumption reveals the bug!";
    }
    if (/python vs|python tips|python list|list vs tuple/.test(q)) {
      return "### Python Quick Reference:\n\n" +
        "- **List `[1, 2, 3]`**: Ordered and **mutable** (can add, remove, and change items).\n" +
        "- **Tuple `(1, 2, 3)`**: Ordered and **immutable** (faster, protected from modification).\n" +
        "- **Dictionary `{'key': 'value'}`**: Key-value lookup in $O(1)$ constant time.\n" +
        "- **Set `{1, 2, 3}`**: Unordered collection of unique items.\n\n" +
        " In our `eda_and_ml_pipeline.py`, we use Pandas and NumPy arrays for vectorized speed!";
    }
    if (/docker|container|what is docker/.test(q)) {
      return "**Docker** packages an application and all its dependencies (Python version, libraries, OS configs) into a single standalone container.\n\n" +
        "- *Why teams use it:* Eliminates the classic *'It works on my machine!'* problem.\n" +
        "- *Core concepts:* **Dockerfile** (the recipe) → **Image** (the blueprint) → **Container** (the running instance).\n" +
        "- For Docker or VPN access at Acme, contact **Rohan Mehta** on Slack.";
    }

    // 5. WORKPLACE & CAREER SITUATIONS (Out-of-the-box)
    if (/imposter|impostor|anxiety|nervous|overwhelmed|scared|feeling dumb|feel stupid/.test(q)) {
      return "### Communication Standards:\n\n" +
        "In our quantitative study of **100 first-time interns**, **82%** reported feeling imposter syndrome or hesitating to ask questions in their first week.\n\n" +
        "- You were hired because the team believes in your potential and foundation.\n" +
        "- Nobody expects you to know internal company workflows or custom codebases on Day 1.\n" +
        "- Asking questions is not a sign of weakness-it's a sign of **respect for the team's time** and prevents hours of silent guesswork.\n" +
        "- Take it one checklist task at a time. You have your mentor sync with Jordan Rivera at 4:30 PM, and you're in a completely safe space here.";
    }
    if (/draft.*email|write.*email|sample email|email to mentor|ask for feedback/.test(q)) {
      return "### Email Template: Progress Check-in\n\n" +
        "**Subject:** Quick check-in & Day 1 progress - Alex Rivera\n\n" +
        "Hi Jordan,\n\n" +
        "I hope you're having a good day! I've been working through the Day 1 onboarding checklist and reviewed the sample deliverables in our shared library.\n\n" +
        "I've made initial progress on [Task Name] and placed the working draft in `/Team_Shared/Drafts/`. Whenever you have 5 minutes during our 4:30 PM sync, I'd love to get your thoughts on the approach so I can align with team standards.\n\n" +
        "Thanks so much for your guidance!\n\n" +
        "Best regards,\nAlex Rivera";
    }
    if (/draft.*standup|write.*standup|prepare standup/.test(q)) {
      return "### Daily Standup Template:\n\n" +
        "Keep it punchy (under 60 seconds):\n\n" +
        "1. **Yesterday / Day 1:** *'Set up my local development environment and reviewed the onboarding checklist and sample weekly reports.'*\n" +
        "2. **Today:** *'Drafting my first task deliverable and verifying data schemas with Sarah's specs.'*\n" +
        "3. **Blockers:** *'No blockers right now; waiting on GitHub repo permissions from Rohan Mehta, and syncing with Jordan at 4:30 PM.'*";
    }
    if (/conflicting|different advice|different instruction|two people tell/.test(q)) {
      return "### Resolving Conflicting Instructions:\n\n" +
        "In our survey, **40% of interns reported conflicting guidance** as their #1 blocker. Here is the professional way to handle it:\n\n" +
        "1. **Do not guess or try to please both secretly.**\n" +
        "2. Locate your primary **Task Lead (Sarah Jenkins)** in the 'Who to Approach' directory.\n" +
        "3. Send a polite 1-sentence clarification:\n" +
        "   > *'Hi Sarah, Lead A suggested X for the formatting, while Lead B recommended Y. To ensure I deliver the right standard, could you confirm which direction you'd prefer me to follow for this report?'*\n" +
        "4. This shows immense maturity and eliminates rework!";
    }
    if (/finished early|nothing to do|no tasks|downtime/.test(q)) {
      return "### Milestone Completion Follow-up:\n\n" +
        "1. **Inspect Completed Examples:** Look through the 'Completed Examples' tab in InternHub to study approved deliverables.\n" +
        "2. **Document What You Learned:** Note down any tricky tool setup steps-your notes can improve the onboarding doc for the next intern!\n" +
        "3. **Proactively Reach Out:** Message Jordan Rivera or Sarah Jenkins:\n" +
        "   > *'Hi Jordan, I finished the Day 1 checklist items ahead of schedule. Is there a backlog task or documentation I can read to prepare for tomorrow?'*";
    }
    if (/mistake|broke something|made an error|accidentally deleted/.test(q)) {
      return "### Incident Management & Mistake Escalation:\n\n" +
        "1. **Breathe.** Every senior engineer has dropped a table or pushed a bug. It is a rite of passage.\n" +
        "2. **Notify Immediately, Don't Hide:** Speed of communication is what builds trust.\n" +
        "3. **Use the 3-Part Communication Script:**\n" +
        "   - *What happened:* 'Hey Jordan, while running script X, I noticed Y happened.'\n" +
        "   - *Impact:* 'It affected branch Z.'\n" +
        "   - *What you're doing to fix it:* 'I halted the script and wanted to check with you before taking the next recovery step.'\n\n" +
        "The team will respect you immensely for your honesty and composure.";
    }
    if (/lunch|coffee|dress code|break|water/.test(q)) {
      return "### Workplace Collaboration & Schedules:\n\n" +
        "- **Breaks:** Taking 5-10 minute stretch and coffee breaks is completely normal and encouraged for screen fatigue.\n" +
        "- **Lunch:** Most teams take lunch between 12:30 PM - 1:30 PM. Don't hesitate to join colleagues in the lunchroom or coffee chat-it's the easiest way to make friends!\n" +
        "- **Dress Code:** Acme Corp operates on smart-casual (clean jeans, tees, sweaters, sneakers). When in doubt, mirror what your team leads wear!";
    }

    // 6. ACME CORP GROUNDED GUIDELINES
    if (/where are files|drive|save|folder|store/.test(q)) {
      return "### File Storage & Organization:\n\n" +
        "- **Working Drafts:** Save in `/Team_Shared/Drafts/` Google Drive folder.\n" +
        "- **Official Deliverables & Templates:** Stored in `/Team_Shared/Projects/2026/`.\n" +
        "- **Benchmarks:** Check the **Completed Examples** tab right here in InternHub to inspect signed-off samples.\n" +
        "- **Naming Rule:** `YYYY_TaskName_Version_Initials` (e.g. `2026_WeeklyReport_v1_AR.pdf`).";
    }
    if (/standup|meeting.*10|10 am/.test(q)) {
      return "Daily Standup is **Monday through Friday at 10:00 AM** on Google Meet (15 minutes max).\n\n" +
        "Format: 1) What you finished yesterday • 2) What you are tackling today • 3) Any blockers.";
    }
    if (/jordan|mentor|sync|4:30|check-in/.test(q)) {
      return "**Jordan Rivera (Senior Engineer)** is your dedicated mentor. Your next scheduled touchpoint is today at **4:30 PM ('Day 1 Welcome & Environment Check')**.\n\n" +
        "In InternHub, mentors are prompted to reach out to you first, so you never have to feel awkward chasing someone down!";
    }
    if (/sarah|jenkins|task lead/.test(q)) {
      return "**Sarah Jenkins** is the Core Task Lead. Approach Sarah for task specifications, project requirements, or to resolve conflicting instructions between team leads.";
    }
    if (/rohan|mehta|devops|access|vpn|github permission/.test(q)) {
      return "For GitHub repo invites, VPN setup, Docker credentials, or AWS sandbox access, ping **Rohan Mehta (DevOps/IT)** on Slack. Typical turnaround is under 30 minutes.";
    }
    if (/eda|ml|machine learning|survey|statistics|correlation/.test(q)) {
      return "### Empathy EDA & Predictive Intelligence:\n\n" +
        "- **Dataset:** $N=100$ first-time interns across 5 technical disciplines.\n" +
        "- **Key Finding:** Having benchmark completed work reduces onboarding friction by **50.9% ($p < 0.001$)** and saves **4.3 days** in time-to-deliverable.\n" +
        "- **Model:** Random Forest Classifier achieving **92.0% Accuracy** predicting at-risk intern friction.\n" +
        "- **Where to view:** Toggle **Manager Mode** at the bottom of the sidebar to inspect interactive charts, figures, and the live ML risk simulator!";
    }

    // 7. SCOPED COMPANY ONBOARDING & WORK FOCUS
    // If the question is outside company onboarding or intern work:
    return "### Acme Onboarding & Work Guide\n\n" +
      "I'm specifically focused on **Acme Corp onboarding, company procedures, and your day-to-day intern deliverables**! \n\n" +
      "Here is what I can help you with right away:\n\n" +
      "- **Acme Files & Storage:** Where to save drafts (`/Team_Shared/Drafts/`), file naming rules, and benchmark deliverables.\n" +
      "- **Daily Schedule & Milestones:** 10:00 AM daily standup format, 4:30 PM mentor sync with Jordan Rivera, and your Day 1 checklist.\n" +
      "- **Team & Escalations:** Who to ask for IT/GitHub access (Rohan Mehta), or resolving conflicting lead instructions (Sarah Jenkins).\n" +
      "- **Workplace & Engineering Skills:** Git commit standards, writing emails to mentors, and handling first-week hesitation.\n\n" +
      "*(If your question relates to an assigned project at Acme, please share a bit more detail! For general knowledge or questions outside our company workspace, open-domain tools like ChatGPT or Google Search are best suited.)*";
  }

  function handleQuery(queryText) {
    const clean = queryText.trim();
    if (!clean) return;

    addMessage(queryText, 'user');

    if (activeEngine === 'openai') {
      const loadingMsg = addMessage('...', 'ai', true);
      const bubble = loadingMsg.querySelector('.msg-bubble');
      queryOpenAILLM(clean, bubble);
    } else if (activeEngine === 'gemini') {
      const loadingMsg = addMessage('...', 'ai', true);
      const bubble = loadingMsg.querySelector('.msg-bubble');
      queryGeminiLLM(clean, bubble);
    } else {
      // Smart Built-in Engine with typing simulation for ultra-smooth ChatGPT feel
      const loadingMsg = addMessage(`
        <div class="typing-dots">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      `, 'ai', true);
      const bubble = loadingMsg.querySelector('.msg-bubble');

      setTimeout(() => {
        const responseText = generateSmartAIResponse(clean);
        bubble.innerHTML = formatMarkdown(responseText);
        chatStream.scrollTop = chatStream.scrollHeight;
        conversationHistory.push({ role: 'user', content: clean });
        conversationHistory.push({ role: 'assistant', content: responseText });
      }, 300);
    }
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
   6.1 EMPATHY SURVEY EDA & INTERACTIVE CHARTS
   ========================================================== */
function initEdaCharts() {
  // Tabs switching in EDA section
  const edaTabBtns = document.querySelectorAll('.eda-tab-btn');
  edaTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      edaTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetTab = btn.dataset.tab;
      document.querySelectorAll('.eda-tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('active');
      });

      const activeContent = document.getElementById(`tab-${targetTab}`);
      if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('active');
      }
    });
  });

  // Viva modal trigger
  const btnViva = document.getElementById('btn-open-viva-guide');
  if (btnViva) {
    btnViva.addEventListener('click', () => {
      const modal = document.getElementById('modal-viva');
      if (modal) modal.classList.remove('hidden');
    });
  }

  if (typeof Chart === 'undefined') return;

  const isDark = document.body.classList.contains('theme-dark');
  const textColor = isDark ? '#cbd5e1' : '#334155';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  // Chart 1: Friction Impact Bar Chart
  const ctxFriction = document.getElementById('canvas-friction-impact');
  if (ctxFriction) {
    new Chart(ctxFriction, {
      type: 'bar',
      data: {
        labels: ['No Benchmark Examples (Self-Guesswork)', 'Had Completed Examples (InternHub)'],
        datasets: [{
          label: 'Cognitive Friction Score (1-10)',
          data: [6.17, 3.03],
          backgroundColor: ['rgba(239, 68, 68, 0.8)', 'rgba(16, 185, 129, 0.85)'],
          borderColor: ['#dc2626', '#059669'],
          borderWidth: 1.5,
          borderRadius: 8,
          barThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Mean Friction: ${ctx.raw} / 10 (${ctx.dataIndex === 1 ? '-50.9% Drop' : 'High Friction'})`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } },
            grid: { color: gridColor },
            title: { display: true, text: 'Friction Score (1-10)', color: textColor }
          },
          x: {
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // Chart 2: Bottlenecks Donut Chart
  const ctxBottlenecks = document.getElementById('canvas-bottlenecks');
  if (ctxBottlenecks) {
    new Chart(ctxBottlenecks, {
      type: 'doughnut',
      data: {
        labels: [
          'Conflicting Guidance from Leads (40%)',
          'Fear of Obvious Questions (22%)',
          'Unclear Day-to-Day Workflow (15%)',
          'Tool Setup & File Access (12%)',
          'Delayed Mentor Access (11%)'
        ],
        datasets: [{
          data: [40, 22, 15, 12, 11],
          backgroundColor: ['#1d4ed8', '#0284c7', '#0f766e', '#10b981', '#d97706'],
          borderWidth: 2,
          borderColor: isDark ? '#111827' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 10.5 }, boxWidth: 12 }
          }
        },
        cutout: '62%'
      }
    });
  }

  // Chart 3: Machine Learning Feature Importance
  const ctxFeature = document.getElementById('canvas-feature-importance');
  if (ctxFeature) {
    new Chart(ctxFeature, {
      type: 'bar',
      data: {
        labels: [
          'Access to Completed Examples',
          'Hesitation to Ask Obvious Qs',
          'Day 1 Workflow Clarity',
          'Mentor Sync Frequency',
          'Conflicting Advice from Leads'
        ],
        datasets: [{
          label: 'Random Forest Feature Importance (%)',
          data: [26.8, 23.7, 23.3, 13.7, 12.4],
          backgroundColor: 'rgba(29, 78, 216, 0.85)',
          borderColor: '#1d4ed8',
          borderWidth: 1.5,
          borderRadius: 6,
          barThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` Relative Importance: ${ctx.raw}% of model weight`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 30,
            ticks: { color: textColor, callback: (v) => v + '%' },
            grid: { color: gridColor },
            title: { display: true, text: 'Model Decision Weight (%)', color: textColor }
          },
          y: {
            ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' } },
            grid: { display: false }
          }
        }
      }
    });
  }
}

/* ==========================================================
   6.2 INTERACTIVE MACHINE LEARNING RISK SIMULATOR
   ========================================================== */
function initMLSimulator() {
  const sliderClarity = document.getElementById('sim-clarity');
  const sliderHesitation = document.getElementById('sim-hesitation');
  const sliderSyncs = document.getElementById('sim-syncs');
  const radioExamples = document.querySelectorAll('input[name="sim-examples"]');
  const radioConflicting = document.querySelectorAll('input[name="sim-conflicting"]');

  const lblClarity = document.getElementById('sim-clarity-val');
  const lblHesitation = document.getElementById('sim-hesitation-val');
  const lblSyncs = document.getElementById('sim-syncs-val');

  const badgeRisk = document.getElementById('ml-risk-badge');
  const lblProb = document.getElementById('ml-prob-val');
  const lblFriction = document.getElementById('ml-friction-score');
  const barFriction = document.getElementById('ml-friction-bar-fill');
  const txtVerdict = document.getElementById('ml-verdict-text');
  const listIntervention = document.getElementById('ml-intervention-list');
  const outputCard = document.getElementById('ml-output-card');

  if (!sliderClarity || !sliderHesitation || !sliderSyncs) return;

  function runPrediction() {
    const clarity = parseInt(sliderClarity.value, 10);
    const hesitation = parseInt(sliderHesitation.value, 10);
    const syncs = parseInt(sliderSyncs.value, 10);
    const hasExamples = parseInt(document.querySelector('input[name="sim-examples"]:checked')?.value || '1', 10);
    const hasConflict = parseInt(document.querySelector('input[name="sim-conflicting"]:checked')?.value || '0', 10);

    if (lblClarity) lblClarity.textContent = `${clarity} / 5`;
    if (lblHesitation) lblHesitation.textContent = `${hesitation} / 5`;
    if (lblSyncs) lblSyncs.textContent = `${syncs} syncs / week`;

    // 1. Friction Score Formulation (Empirically grounded from N=100 survey):
    let rawFriction = 3.5 
      + 1.3 * hesitation 
      + 1.8 * hasConflict 
      - 2.4 * hasExamples 
      - 0.9 * clarity 
      - 0.5 * syncs;
    
    let friction = Math.min(10.0, Math.max(1.0, Math.round(rawFriction * 10) / 10));

    // 2. Logistic Regression Probability Calculation
    // z = intercept + coef1*examples + coef2*conflicting + coef3*clarity + coef4*hesitation + coef5*syncs
    const z = -2.1458 - 1.8365 * hasExamples + 0.9324 * hasConflict - 1.5174 * clarity + 1.6289 * hesitation - 0.6431 * syncs;
    const probability = 1 / (1 + Math.exp(-z));
    const confidencePct = Math.round(Math.max(probability, 1 - probability) * 100);

    // Update Score & Progress bar
    if (lblFriction) lblFriction.textContent = friction.toFixed(1);
    if (barFriction) barFriction.style.width = `${Math.min(100, Math.max(10, friction * 10))}%`;
    if (lblProb) lblProb.textContent = `${confidencePct}%`;

    // 3. Classify Risk Category
    if (friction < 4.0) {
      if (badgeRisk) {
        badgeRisk.className = 'ml-badge-pill badge-low-risk';
        badgeRisk.textContent = '🟢 LOW RISK (Optimal)';
      }
      if (outputCard) outputCard.style.borderColor = '#10b981';
      if (txtVerdict) {
        txtVerdict.textContent = 'Intern has clear benchmark guidance and psychological safety. Cognitive friction is minimal and confidence trajectory is optimal.';
      }
      if (listIntervention) {
        listIntervention.innerHTML = `
          <li>Maintain regular scheduled 4:30 PM touchpoint with Jordan Rivera.</li>
          <li>Encourage self-paced progression into Week 2 independent milestone tasks.</li>
        `;
      }
    } else if (friction < 6.0) {
      if (badgeRisk) {
        badgeRisk.className = 'ml-badge-pill badge-mod-risk';
        badgeRisk.textContent = '🟡 MODERATE FRICTION';
      }
      if (outputCard) outputCard.style.borderColor = '#f59e0b';
      if (txtVerdict) {
        txtVerdict.textContent = 'Mild procedural uncertainty detected. The intern is spending cognitive energy retracing steps and second-guessing file expectations.';
      }
      if (listIntervention) {
        listIntervention.innerHTML = `
          <li>Point intern directly to the Completed Work Benchmark Vault on the dashboard.</li>
          <li>Mentor should proactively ask: "What instructions felt ambiguous today?" during sync.</li>
        `;
      }
    } else {
      if (badgeRisk) {
        badgeRisk.className = 'ml-badge-pill badge-high-risk';
        badgeRisk.textContent = 'High Friction Risk';
      }
      if (outputCard) outputCard.style.borderColor = '#ef4444';
      if (txtVerdict) {
        txtVerdict.textContent = 'Critical friction detected! The intern is suffering from lack of benchmarks, conflicting verbal advice, or severe fear of asking obvious questions.';
      }
      if (listIntervention) {
        listIntervention.innerHTML = `
          <li><strong>Recommended Action:</strong> Prompt mentor Jordan Rivera to initiate a 15-min sync within 2 hours.</li>
          <li>Provide immediate link to standard report template to eliminate deliverable guesswork.</li>
          <li>Explicitly confirm the primary Task Lead (Sarah Jenkins) to resolve conflicting advice.</li>
        `;
      }
    }
  }

  [sliderClarity, sliderHesitation, sliderSyncs].forEach(s => s.addEventListener('input', runPrediction));
  radioExamples.forEach(r => r.addEventListener('change', runPrediction));
  radioConflicting.forEach(r => r.addEventListener('change', runPrediction));

  // Run initial prediction
  runPrediction();
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
          No feedback logged yet. Ask your friends to click <strong>"Submit Feedback"</strong> in the top bar to test the tool!
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
Reporter: ${name}
⭐ Rating: ${rating}/5 Stars
Category: ${favorite}
 What Worked (Likes +): "${likes}"
Description: "${wishes}"
 Date: ${newEntry.date}`;

      if (successName) successName.textContent = `Feedback Recorded: ${name}`;
      if (previewContent) previewContent.textContent = lastReviewText;

      formFeedback.classList.add('hidden');
      if (successState) successState.classList.remove('hidden');

      showToast(`Feedback report logged.`);
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
        showToast('Report copied to clipboard.');
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
        showToast('Feedback log copied.');
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

  const btnAddPhase = document.getElementById('btn-quick-add-phase');
  const btnAddPhaseInline = document.getElementById('btn-add-phase-inline');
  if (btnAddPhase) btnAddPhase.addEventListener('click', () => openModal('modal-add-phase'));
  if (btnAddPhaseInline) btnAddPhaseInline.addEventListener('click', () => openModal('modal-add-phase'));

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

  // SUBMIT: ADD PHASE / DAY
  const formPhase = document.getElementById('form-create-phase');
  if (formPhase) {
    formPhase.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-phase-name').value.trim();
      const status = document.getElementById('new-phase-status').value;
      const desc = document.getElementById('new-phase-desc').value.trim();

      if (window.addNewPhase) {
        window.addNewPhase(name, status, desc, true);
        closeModal('modal-add-phase');
        formPhase.reset();
        showToast(`Added phase: ${name}`);
      }
    });
  }

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
        if (window.renderTaskRow) {
          window.renderTaskRow(container, { title, owner, time });
        }
        if (window.saveCustomTaskToStorage) {
          window.saveCustomTaskToStorage({ phase, title, owner, time });
        }

        closeModal('modal-add-task');
        formTask.reset();
        window.updateChecklistProgress();
        showToast(`Added task: ${title}`);
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
        tip: `<strong>Note:</strong> ${tip}`
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
      showToast(`Added benchmark: ${label}`);
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
        showToast(`Added contact: ${name}`);
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
