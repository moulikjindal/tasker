// ══════════════════════════════════════════════════════════════
//  BUBBLETASKER — CARD-BASED VISUAL ISSUE TRACKER v3
//  Features: Canvas, List, Kanban, Calendar, Activity History,
//  Quick Filters, Theme Toggle, Assignee Avatars
// ══════════════════════════════════════════════════════════════

// ═══════ CONSTANTS ═══════
const MOCK_IDS = new Set(['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10','m11','m12','m13','m14','m15']);
const COLOR = { open:'#3b82f6', in_progress:'#f59e0b', done:'#10b981' };
const CARD = { high:{w:164,h:50}, medium:{w:142,h:44}, low:{w:122,h:40} };
const IDLE_SCALE = 0.86;
const COMPACT_S = 0.65;
const STATUS_MAP = { '1':'open', '2':'in_progress', '3':'done' };
const PRIORITY_ORD = { high:3, medium:2, low:1 };
const STATUS_LABEL = { open:'Open', in_progress:'In Progress', done:'Done' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#06b6d4','#3b82f6'];

const MOCKS = [
    { id:'m1', num:1, title:'Design System', description:'Build core design tokens:\n• Color palette\n• Typography scale\n• Spacing system\n• Component library', status:'done', priority:'high', category:'Design', tags:['design','ui','tokens'], assignee:'Alex', date:new Date(Date.now()-864e5*14).toISOString(), dueDate:new Date(Date.now()-864e5*3).toISOString().slice(0,10), subtasks:[{text:'Color palette',done:true},{text:'Typography scale',done:true},{text:'Spacing tokens',done:true}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*14).toISOString()},{action:'Status',detail:'Open → Done',at:new Date(Date.now()-864e5*3).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*3).toISOString() },
    { id:'m2', num:2, title:'Navbar Component', description:'Responsive navbar with mobile hamburger drawer, sticky scroll behavior, and keyboard navigation support.', status:'in_progress', priority:'medium', category:'Feature', tags:['frontend','react','a11y'], assignee:'Rahul', date:new Date(Date.now()-864e5*10).toISOString(), dueDate:new Date(Date.now()+864e5*2).toISOString().slice(0,10), subtasks:[{text:'Desktop layout',done:true},{text:'Mobile drawer',done:false},{text:'Keyboard nav',done:false}], dependencies:['m1'], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*10).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*4).toISOString() },
    { id:'m3', num:3, title:'Fix Auth Bypass', description:'Token expiration not validated on page refresh — users can hijack sessions after idle timeout. Fix requires both backend token rotation and frontend cookie handling update.', status:'open', priority:'high', category:'Bug', tags:['backend','security','critical'], assignee:'Sarah', date:new Date(Date.now()-864e5*2).toISOString(), dueDate:new Date(Date.now()-864e5).toISOString().slice(0,10), subtasks:[{text:'Investigate token flow',done:true},{text:'Backend rotation',done:false},{text:'Frontend cookie update',done:false}], dependencies:[], starred:true, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*2).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*2).toISOString() },
    { id:'m4', num:4, title:'Postgres Indexing', description:'Add composite indices for dashboard queries to improve load time from 3.2s → 400ms. Benchmark before and after.', status:'done', priority:'high', category:'DevOps', tags:['backend','db','performance'], assignee:'Mike', date:new Date(Date.now()-864e5*12).toISOString(), dueDate:new Date(Date.now()-864e5*2).toISOString().slice(0,10), subtasks:[{text:'Identify slow queries',done:true},{text:'Create indices',done:true},{text:'Benchmark',done:true}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*12).toISOString()},{action:'Status',detail:'Open → Done',at:new Date(Date.now()-864e5*2).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*2).toISOString() },
    { id:'m5', num:5, title:'Landing Page v2', description:'New hero section with scroll animations, updated copy, and customer testimonials carousel.', status:'open', priority:'low', category:'Feature', tags:['marketing','frontend'], assignee:'Unassigned', date:new Date(Date.now()-864e5*5).toISOString(), dueDate:new Date(Date.now()+864e5*12).toISOString().slice(0,10), subtasks:[], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*5).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*5).toISOString() },
    { id:'m6', num:6, title:'API Rate Limiter', description:'Implement per-user rate limiting on all public endpoints. Use token bucket algorithm with Redis backing store.', status:'in_progress', priority:'high', category:'Feature', tags:['backend','api','security'], assignee:'Sarah', date:new Date(Date.now()-864e5*3).toISOString(), dueDate:new Date(Date.now()+864e5*1).toISOString().slice(0,10), subtasks:[{text:'Redis setup',done:true},{text:'Middleware implementation',done:true},{text:'Per-route config',done:false},{text:'Dashboard metrics',done:false}], dependencies:[], starred:true, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*3).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*1).toISOString() },
    { id:'m7', num:7, title:'Dark Mode Flicker', description:'Page flashes white for ~200ms on load in dark mode. Need to inline critical theme CSS or use a blocking script.', status:'open', priority:'medium', category:'Bug', tags:['frontend','ui','ux'], assignee:'Alex', date:new Date(Date.now()-864e5*1).toISOString(), dueDate:new Date(Date.now()+864e5*3).toISOString().slice(0,10), subtasks:[], dependencies:['m1'], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*1).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*1).toISOString() },
    { id:'m8', num:8, title:'User Onboarding Flow', description:'Multi-step wizard: welcome screen → workspace setup → invite team → first project. Track completion rate.', status:'open', priority:'medium', category:'Feature', tags:['frontend','ux','growth'], assignee:'Priya', date:new Date(Date.now()-864e5*4).toISOString(), dueDate:new Date(Date.now()+864e5*7).toISOString().slice(0,10), subtasks:[{text:'Welcome screen',done:false},{text:'Workspace setup',done:false},{text:'Team invite',done:false},{text:'First project wizard',done:false},{text:'Analytics tracking',done:false}], dependencies:['m2'], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*4).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*4).toISOString() },
    { id:'m9', num:9, title:'CI Pipeline Optimization', description:'Build times are 12min average. Target: under 5min. Investigate caching, parallelism, and selective test runs.', status:'in_progress', priority:'medium', category:'DevOps', tags:['ci','performance','dx'], assignee:'Mike', date:new Date(Date.now()-864e5*6).toISOString(), dueDate:new Date(Date.now()+864e5*4).toISOString().slice(0,10), subtasks:[{text:'Audit current pipeline',done:true},{text:'Add dependency caching',done:true},{text:'Parallelize test suites',done:false},{text:'Selective test runs',done:false}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*6).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*2).toISOString() },
    { id:'m10', num:10, title:'API Documentation', description:'OpenAPI 3.0 spec for all endpoints. Auto-generate from code annotations. Host on /docs with Swagger UI.', status:'done', priority:'low', category:'Docs', tags:['backend','api','documentation'], assignee:'Jordan', date:new Date(Date.now()-864e5*15).toISOString(), dueDate:new Date(Date.now()-864e5*5).toISOString().slice(0,10), subtasks:[{text:'Annotate endpoints',done:true},{text:'Generate spec',done:true},{text:'Deploy Swagger UI',done:true}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*15).toISOString()},{action:'Status',detail:'Open → Done',at:new Date(Date.now()-864e5*5).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*5).toISOString() },
    { id:'m11', num:11, title:'Memory Leak in WebSocket', description:'Server memory grows ~50MB/hr under sustained connections. Likely caused by uncleared event listeners on disconnect.', status:'open', priority:'high', category:'Bug', tags:['backend','websocket','critical'], assignee:'Jordan', date:new Date(Date.now()-864e5*1).toISOString(), dueDate:new Date(Date.now()).toISOString().slice(0,10), subtasks:[{text:'Reproduce locally',done:true},{text:'Heap snapshot analysis',done:false},{text:'Fix & verify',done:false}], dependencies:[], starred:true, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*1).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*1).toISOString() },
    { id:'m12', num:12, title:'Accessibility Audit', description:'WCAG 2.1 AA compliance check across all pages. Focus on color contrast, screen reader support, and keyboard navigation.', status:'open', priority:'medium', category:'Research', tags:['a11y','ux','compliance'], assignee:'Priya', date:new Date(Date.now()-864e5*3).toISOString(), dueDate:new Date(Date.now()+864e5*10).toISOString().slice(0,10), subtasks:[{text:'Automated scan (axe)',done:false},{text:'Manual keyboard test',done:false},{text:'Screen reader test',done:false},{text:'Report & prioritize',done:false}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*3).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*3).toISOString() },
    { id:'m13', num:13, title:'Email Notification System', description:'Transactional emails for: signup, password reset, task assigned, weekly digest. Use SendGrid + templating engine.', status:'in_progress', priority:'medium', category:'Feature', tags:['backend','email','notifications'], assignee:'Lena', date:new Date(Date.now()-864e5*8).toISOString(), dueDate:new Date(Date.now()+864e5*3).toISOString().slice(0,10), subtasks:[{text:'SendGrid integration',done:true},{text:'Template engine',done:true},{text:'Signup email',done:true},{text:'Password reset',done:false},{text:'Task assigned',done:false},{text:'Weekly digest',done:false}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*8).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*3).toISOString() },
    { id:'m14', num:14, title:'Mobile Responsive Overhaul', description:'Dashboard, settings, and project views need responsive layouts for tablet and phone breakpoints.', status:'done', priority:'low', category:'Design', tags:['frontend','responsive','mobile'], assignee:'Rahul', date:new Date(Date.now()-864e5*18).toISOString(), dueDate:new Date(Date.now()-864e5*4).toISOString().slice(0,10), subtasks:[{text:'Breakpoint audit',done:true},{text:'Dashboard responsive',done:true},{text:'Settings responsive',done:true},{text:'Project views responsive',done:true}], dependencies:['m1','m2'], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*18).toISOString()},{action:'Status',detail:'Open → Done',at:new Date(Date.now()-864e5*4).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*4).toISOString() },
    { id:'m15', num:15, title:'Search Infrastructure', description:'Full-text search across projects, tasks, and comments. Evaluate Elasticsearch vs Meilisearch for our scale.', status:'done', priority:'low', category:'Research', tags:['backend','search','infrastructure'], assignee:'Unassigned', date:new Date(Date.now()-864e5*20).toISOString(), dueDate:new Date(Date.now()-864e5*8).toISOString().slice(0,10), subtasks:[{text:'Evaluate Elasticsearch',done:true},{text:'Evaluate Meilisearch',done:true},{text:'Write comparison doc',done:true}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*20).toISOString()},{action:'Status',detail:'Open → Done',at:new Date(Date.now()-864e5*8).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*8).toISOString() }
];

// ═══════ DATA LAYER ═══════
const raw = localStorage.getItem('bubbleTaskerIssues');
let issues = raw ? JSON.parse(raw) : structuredClone(MOCKS);
issues = issues.map(i => ({
    subtasks:[], dependencies:[], dueDate:null, statusChangedAt:i.date, starred:false, history:[],
    recurrence:null, timeEntries:[], snoozedUntil:null, whiteboardPos:null,
    ...i
}));

// Templates store
let templates = JSON.parse(localStorage.getItem('btTemplates') || '[]');
function saveTemplates() { localStorage.setItem('btTemplates', JSON.stringify(templates)); }

// Settings store
const settings = Object.assign({
    accent: '#6366f1',
    notifications: false,
    soundOn: true,
    confettiOn: true,
    lastReviewDate: null
}, JSON.parse(localStorage.getItem('btSettings') || '{}'));
function saveSettings() { localStorage.setItem('btSettings', JSON.stringify(settings)); }

let _nextNum = parseInt(localStorage.getItem('btNextNum')) || 1;
for (const i of issues) { if (!i.num) { i.num = _nextNum++; } else { _nextNum = Math.max(_nextNum, i.num + 1); } }
localStorage.setItem('btNextNum', _nextNum);

let deletedStack = [];
const issueMap = new Map();
const reverseDeps = new Map();
function rebuildMap() {
    issueMap.clear(); reverseDeps.clear();
    for (const i of issues) {
        issueMap.set(i.id, i);
        if (i.dependencies) for (const did of i.dependencies) {
            if (!reverseDeps.has(did)) reverseDeps.set(did, []);
            reverseDeps.get(did).push(i.id);
        }
    }
}
rebuildMap();
function getI(id) { return issueMap.get(id); }

function cw(p) { return isCompact ? (CARD[p].w * COMPACT_S) | 0 : CARD[p].w; }
function ch(p) { return isCompact ? (CARD[p].h * COMPACT_S) | 0 : CARD[p].h; }
function colR(p) { return ((cw(p) * IDLE_SCALE) >> 1) + 4; }
function cardHash(d) {
    const sc = d.subtasks ? d.subtasks.map(s=>s.done?1:0).join('') : '';
    return `${d.status}|${d.priority}|${d.title}|${d.category}|${d.assignee}|${d.starred?1:0}|${d.dueDate||''}|${sc}|${d.isPinned?1:0}|${isCompact?1:0}`;
}
function avatarColor(name) { let h = 0; for(let i=0;i<name.length;i++) h = name.charCodeAt(i)+((h<<5)-h); return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]; }
function initials(name) { if(!name||name==='Unassigned') return ''; const p=name.split(' '); return p.length>1?(p[0][0]+p[p.length-1][0]).toUpperCase():name.slice(0,2).toUpperCase(); }

// ═══════ CACHED DOM ═══════
const $ = id => document.getElementById(id);
const dom = {};
function cacheDom() {
    ['save-indicator','toasts','search-input','clear-search','search-kbd',
     'filter-status','filter-priority','filter-category','filter-assignee','group-by','compact-toggle',
     'panel-badge','panel-num','panel-status-strip','panel-title','panel-desc',
     'edit-status','edit-priority','edit-category','edit-assignee','edit-due-date',
     'panel-meta-time','tags-container','subtask-list','subtask-badge','due-smart',
     'dep-list','stat-total','stat-open','stat-progress','stat-done',
     'add-tag-input','add-subtask-input','add-dep-input',
     'bulk-bar','bulk-count','bulk-status','bulk-priority',
     'category-datalist','assignee-datalist','dep-datalist',
     'issue-title','issue-priority','issue-category','issue-assignee',
     'issue-due-date','issue-tags','import-file',
     'cmd-input','cmd-results','zoom-level','star-btn',
     'list-view','list-body','kanban-view',
     'kanban-open','kanban-progress','kanban-done',
     'kanban-count-open','kanban-count-progress','kanban-count-done',
     'activity-list','calendar-view','cal-body','cal-title','cal-unscheduled',
     'whiteboard-view','whiteboard-canvas',
     'active-filter-badge','theme-toggle',
     'edit-recurrence','time-total','time-focus-btn',
     'panel-desc-view','md-view-btn','md-edit-btn'
    ].forEach(id => { dom[id] = $(id); });
}

// ═══════ STATE ═══════
let fStatus='all', fPriority='all', fCategory='all', fAssignee='all';
let searchQ='', groupBy='category', activeQF=null;
let sim=null, selId=null, hovId=null, ctxId=null;
let isCompact=false, isPresent=false;
let cmdOpen=false, cmdIdx=0, cmdList=[];
let currentView = localStorage.getItem('btCurrentView') || 'canvas';
let listSort={ col:'num', dir:1 };
let calYear, calMonth;
const phys = new Map(), selected = new Set();

// Init calendar to current month
const _now = new Date(); calYear = _now.getFullYear(); calMonth = _now.getMonth();

// ═══════ THEME ═══════
let currentTheme = localStorage.getItem('btTheme') || 'dark';
function applyTheme(theme) {
    currentTheme = theme;
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('btTheme', theme);
    if (dom['theme-toggle']) dom['theme-toggle'].textContent = theme === 'dark' ? '🌙' : '☀️';
}

// ═══════ SVG REFS ═══════
const svgBox = $('svg-container'), labelsBox = $('group-labels');
const panelEl = $('issue-panel'), modalEl = $('add-modal'), formEl = $('add-issue-form');
const tip = d3.select('#tooltip'), emptyEl = $('empty-state');
const ctxEl = $('context-menu'), cmdEl = $('cmd-palette'), dmEl = $('data-manager');
const wbEmptyCtxEl = $('wb-empty-ctx');

let W = svgBox.clientWidth, H = svgBox.clientHeight;
const svg = d3.select('#svg-container').append('svg').attr('width','100%').attr('height','100%');
const g = svg.append('g');
const labelLayer = g.append('g'), linkLayer = g.append('g'), nodeLayer = g.append('g');
const zoomB = d3.zoom().scaleExtent([0.12,5]).on('zoom', e => {
    g.attr('transform', e.transform);
    const p = Math.round(e.transform.k * 100);
    if (dom['zoom-level'] && currentView === 'canvas') dom['zoom-level'].textContent = p + '%';
});
svg.call(zoomB).on('dblclick.zoom', null);
const defs = svg.append('defs');

// ═══════ PERSISTENCE ═══════
let _saveT = null, _renderRAF = null, _diskTimer = null;
const MAX_UNDO = 50;
function scheduleDiskWrite() {
    clearTimeout(_diskTimer);
    _diskTimer = setTimeout(() => {
        localStorage.setItem('bubbleTaskerIssues', JSON.stringify(issues));
        localStorage.setItem('btNextNum', _nextNum);
    }, 300);
}
function persist(render = true) {
    invalidateFilterCache();
    rebuildMap(); scheduleDiskWrite(); updateOptions(); updateStats(); flashSave(); updateFilterBadge();
    if (deletedStack.length > MAX_UNDO) deletedStack.length = MAX_UNDO;
    if (render) {
        if (currentView === 'canvas') { cancelAnimationFrame(_renderRAF); _renderRAF = requestAnimationFrame(renderGraph); }
        else if (currentView === 'list') renderList();
        else if (currentView === 'kanban') renderKanban();
        else if (currentView === 'calendar') renderCalendar();
        else if (currentView === 'whiteboard') renderWhiteboard();
    }
}
function flashSave() {
    const el = dom['save-indicator']; if (!el) return;
    el.classList.add('visible'); clearTimeout(_saveT);
    _saveT = setTimeout(() => el.classList.remove('visible'), 1200);
}

// ═══════ TOAST ═══════
function toast(msg, type='info', undoable=false) {
    const c = dom['toasts'] || $('toasts'), t = document.createElement('div');
    t.className = `toast ${type}`;
    if (undoable) {
        t.innerHTML = `${msg} <span class="toast-undo">Undo</span>`;
        c.appendChild(t);
        t.querySelector('.toast-undo').onclick = () => { undoDelete(); t.remove(); };
        setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 5000);
    } else { t.textContent = msg; c.appendChild(t); setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 2200); }
}
function toastAction(msg, btnText, fn) {
    const c = dom['toasts'] || $('toasts'), t = document.createElement('div');
    t.className = 'toast ok';
    t.innerHTML = `${msg} <span class="toast-undo">${btnText}</span>`;
    c.appendChild(t);
    t.querySelector('.toast-undo').onclick = () => { fn(); t.remove(); };
    setTimeout(() => { t.style.opacity='0'; setTimeout(() => t.remove(), 300); }, 5000);
}

// ═══════ UTILS ═══════
function timeAgo(d) {
    const s = (Date.now() - new Date(d).getTime()) / 1000 | 0;
    if (s < 60) return 'just now';
    const m = s/60|0; if (m<60) return m+'m ago';
    const h = m/60|0; if (h<24) return h+'h ago';
    const days = h/24|0; if (days<30) return days+'d ago';
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
}
function autoExpand(el) { el.style.height='auto'; el.style.height=el.scrollHeight+'px'; }
function smartDue(dateStr) {
    if (!dateStr) return { text:'', cls:'' };
    const due = new Date(dateStr + 'T00:00:00'), now = new Date();
    now.setHours(0,0,0,0);
    const diff = Math.round((due - now) / 864e5);
    if (diff < -1) return { text:`${Math.abs(diff)}d overdue`, cls:'overdue' };
    if (diff === -1) return { text:'1d overdue', cls:'overdue' };
    if (diff === 0) return { text:'Due today', cls:'today' };
    if (diff === 1) return { text:'Due tomorrow', cls:'soon' };
    if (diff <= 7) return { text:`Due in ${diff}d`, cls:'soon' };
    return { text:`Due in ${diff}d`, cls:'safe' };
}
function todayStr() { const d = new Date(); return d.toISOString().slice(0,10); }

// ═══════ RECURRENCE ═══════
const RECUR_LABELS = { daily:'Every day', weekly:'Every week', biweekly:'Every 2 weeks', monthly:'Every month', weekdays:'Weekdays only' };
function nextRecurrenceDate(rule, fromDateStr) {
    const base = fromDateStr ? new Date(fromDateStr + 'T00:00:00') : new Date();
    base.setHours(0,0,0,0);
    const fmt = d => d.toISOString().slice(0,10);
    switch (rule) {
        case 'daily':    base.setDate(base.getDate() + 1); return fmt(base);
        case 'weekly':   base.setDate(base.getDate() + 7); return fmt(base);
        case 'biweekly': base.setDate(base.getDate() + 14); return fmt(base);
        case 'monthly':  base.setMonth(base.getMonth() + 1); return fmt(base);
        case 'weekdays': {
            do { base.setDate(base.getDate() + 1); } while (base.getDay() === 0 || base.getDay() === 6);
            return fmt(base);
        }
    }
    return null;
}
function spawnRecurrence(issue) {
    if (!issue.recurrence) return null;
    const nextDue = nextRecurrenceDate(issue.recurrence, issue.dueDate || todayStr());
    if (!nextDue) return null;
    const now = new Date().toISOString();
    const clone = {
        ...structuredClone(issue),
        id: Date.now().toString() + Math.random().toString(36).slice(2,5),
        num: _nextNum++,
        status: 'open',
        date: now,
        statusChangedAt: now,
        dueDate: nextDue,
        snoozedUntil: null,
        timeEntries: [],
        subtasks: (issue.subtasks || []).map(s => ({ ...s, done: false })),
        history: [{ action:'Created', detail:`Recurring (${RECUR_LABELS[issue.recurrence]})`, at: now }]
    };
    issues.push(clone);
    return clone;
}

// ═══════ SMART INPUT PARSER ═══════
// Turns "Buy milk tomorrow !! #shopping *" into structured fields.
// Modifiers (any combination, any position):
//   *  prefix or suffix word    → starred
//   !!  or  !!!                 → priority (! = low, !! = medium, !!! = high)
//   #word                       → category
//   today | tomorrow | tmrw     → due date
//   mon..sun  /  next monday    → due date (next occurrence)
//   in N days/d                 → due date
const _DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
function parseSmartInput(raw) {
    let s = ' ' + (raw || '').trim() + ' ';
    const result = { title:'', priority:null, dueDate:null, category:null, starred:false };

    // Star markers
    if (/(^|\s)\*(\s|$)/.test(s)) { result.starred = true; s = s.replace(/(^|\s)\*(\s|$)/g, ' '); }

    // Priority bangs (!!! high, !! medium, ! low) — only standalone tokens
    const priM = s.match(/(?:^|\s)(!{1,3})(?=\s|$)/);
    if (priM) {
        result.priority = priM[1].length === 3 ? 'high' : priM[1].length === 2 ? 'medium' : 'low';
        s = s.replace(priM[0], ' ');
    }

    // Category #word
    const catM = s.match(/(?:^|\s)#([\w-]+)/);
    if (catM) {
        result.category = catM[1].charAt(0).toUpperCase() + catM[1].slice(1);
        s = s.replace(catM[0], ' ');
    }

    // Due dates
    const today = new Date(); today.setHours(0,0,0,0);
    const fmt = d => d.toISOString().slice(0,10);
    const lower = ' ' + s.toLowerCase().trim() + ' ';

    let dueMatch = null;
    let m;
    if ((m = lower.match(/\s(today)\s/)))            dueMatch = { phrase: m[1], days: 0 };
    else if ((m = lower.match(/\s(tomorrow|tmrw|tmr)\s/))) dueMatch = { phrase: m[1], days: 1 };
    else if ((m = lower.match(/\s(next\s+week)\s/)))   dueMatch = { phrase: m[1], days: 7 };
    else if ((m = lower.match(/\s(in\s+\d{1,3}\s*d(?:ays?)?)\s/))) dueMatch = { phrase: m[1], days: parseInt(m[1].match(/\d+/)[0]) };
    else {
        for (let i = 0; i < 7; i++) {
            const dn = _DAYS[i];
            const re = new RegExp(`\\s(next\\s+${dn}|${dn})\\s`);
            const dm = lower.match(re);
            if (dm) {
                const isNext = /^next\s/.test(dm[1]);
                let diff = (i - today.getDay() + 7) % 7;
                if (diff === 0) diff = 7;
                if (isNext && diff < 7) diff += 7;
                dueMatch = { phrase: dm[1], days: diff };
                break;
            }
        }
    }
    if (dueMatch) {
        const due = new Date(today); due.setDate(due.getDate() + dueMatch.days);
        result.dueDate = fmt(due);
        const re = new RegExp('(?:^|\\s)' + dueMatch.phrase.replace(/\s+/g, '\\s+') + '(?=\\s|$)', 'i');
        s = s.replace(re, ' ');
    }

    result.title = s.replace(/\s+/g, ' ').trim();
    return result;
}

// ═══════ ACTIVE FILTER BADGE ═══════
function updateFilterBadge() {
    const badge = dom['active-filter-badge']; if (!badge) return;
    let count = 0;
    if (fStatus !== 'all') count++;
    if (fPriority !== 'all') count++;
    if (fCategory !== 'all') count++;
    if (fAssignee !== 'all') count++;
    if (searchQ) count++;
    if (activeQF) count++;
    if (count) { badge.textContent = count; badge.style.display = ''; }
    else badge.style.display = 'none';
}

// ═══════ ACTIVITY LOGGING ═══════
// Only log meaningful events; small edits (tags, subtasks, stars) are skipped to keep noise low.
const _LOG_ACTIONS = new Set(['Created','Status','Priority','Cloned','Restored']);
function logActivity(id, action, detail) {
    if (!_LOG_ACTIONS.has(action)) return;
    const i = getI(id); if (!i) return;
    if (!i.history) i.history = [];
    i.history.unshift({ action, detail, at: new Date().toISOString() });
    if (i.history.length > 20) i.history.length = 20;
}
function renderActivity() {
    const el = dom['activity-list']; if (!el) return;
    const i = getI(selId);
    if (!i || !i.history?.length) { el.innerHTML = '<div class="activity-empty">No activity yet</div>'; return; }
    el.innerHTML = i.history.slice(0, 20).map(h => {
        const cls = h.action === 'Status' ? 'a-status' : h.action === 'Priority' ? 'a-priority' : h.action === 'Created' ? 'a-create' : '';
        return `<div class="activity-item ${cls}"><div class="activity-content"><span class="activity-action">${h.action}</span>${h.detail ? `<span class="activity-detail">${h.detail}</span>` : ''}<span class="activity-time">${timeAgo(h.at)}</span></div></div>`;
    }).join('');
}

// ═══════ QUICK FILTER ═══════
function applyQuickFilter(qf) {
    invalidateFilterCache();
    if (activeQF === qf) { activeQF = null; searchQ = ''; fStatus = 'all'; fPriority = 'all'; fAssignee = 'all'; }
    else {
        activeQF = qf; fStatus = 'all'; fPriority = 'all'; fAssignee = 'all'; searchQ = '';
    }
    document.querySelectorAll('.qf-btn,.qf-pill').forEach(b => b.classList.toggle('active', b.dataset.qf === activeQF));
    dom['filter-status'].value = fStatus; dom['filter-priority'].value = fPriority;
    dom['search-input'].value = searchQ;
    persist();
}
let _filterCache = null;
function invalidateFilterCache() { _filterCache = null; }
function filterIssues() {
    if (_filterCache) return _filterCache;
    const qLow = searchQ ? searchQ.toLowerCase() : '';
    const today = todayStr();
    const now = new Date(); now.setHours(0,0,0,0);
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    const filtered = [];
    for (const i of issues) {
        // Quick filters
        if (activeQF) {
            if (activeQF === 'starred' && !i.starred) continue;
            if (activeQF === 'overdue' && (!i.dueDate || new Date(i.dueDate+'T00:00:00') >= now || i.status === 'done')) continue;
            if (activeQF === 'due-today' && i.dueDate !== today) continue;
            if (activeQF === 'no-assignee' && i.assignee !== 'Unassigned') continue;
            if (activeQF === 'high-pri' && i.priority !== 'high') continue;
            if (activeQF === 'due-week') {
                if (!i.dueDate) continue;
                const d = new Date(i.dueDate+'T00:00:00');
                if (d < now || d > weekEnd) continue;
            }
        }
        // Standard filters
        if (fStatus === 'active' && i.status === 'done') continue;
        if (fStatus !== 'all' && fStatus !== 'active' && i.status !== fStatus) continue;
        if (fPriority !== 'all' && i.priority !== fPriority) continue;
        if (fCategory !== 'all' && i.category !== fCategory) continue;
        if (fAssignee !== 'all' && i.assignee !== fAssignee) continue;
        if (qLow && !i.title.toLowerCase().includes(qLow) && !i.tags.some(t => t.toLowerCase().includes(qLow)) && !(('#'+i.num).includes(qLow))) continue;
        filtered.push(i);
    }
    _filterCache = filtered;
    return filtered;
}

// ═══════ VIEW SYSTEM ═══════
function setView(view) {
    currentView = view;
    localStorage.setItem('btCurrentView', view);
    svgBox.style.display = view === 'canvas' ? '' : 'none';
    labelsBox.style.display = view === 'canvas' ? '' : 'none';
    dom['list-view'].style.display = view === 'list' ? '' : 'none';
    dom['kanban-view'].style.display = view === 'kanban' ? '' : 'none';
    dom['calendar-view'].style.display = view === 'calendar' ? '' : 'none';
    dom['whiteboard-view'].style.display = view === 'whiteboard' ? '' : 'none';
    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'canvas') renderGraph();
    else if (view === 'list') renderList();
    else if (view === 'kanban') renderKanban();
    else if (view === 'calendar') renderCalendar();
    else if (view === 'whiteboard') renderWhiteboard();
}

// ═══════ CANVAS INTERACTIONS ═══════
function createIssueAt(x, y) {
    const id = Date.now().toString(), num = _nextNum++;
    const issue = { id, num, title:'New Task', description:'', status:'open', priority:'medium', category:'Task', tags:[], assignee:'Unassigned', date:new Date().toISOString(), dueDate:null, subtasks:[], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date().toISOString()}], statusChangedAt:new Date().toISOString() };
    issues.push(issue);
    phys.set(id, { id, x, y, vx:0, vy:0 });
    persist(); openPanel(id);
    setTimeout(() => { dom['panel-title'].focus(); dom['panel-title'].select(); }, 400);
}

svg.on('dblclick', e => { if (e.target.tagName !== 'svg') return; const [x,y] = d3.zoomTransform(svg.node()).invert([e.offsetX, e.offsetY]); createIssueAt(x, y); });
svg.on('click', e => { if (e.target.tagName === 'svg') { hideCtx(); selected.clear(); updateBulk(); closePanel(); }});

let _resizeRAF = null;
window.addEventListener('resize', () => { if (_resizeRAF) return; _resizeRAF = requestAnimationFrame(() => { _resizeRAF = null; W = svgBox.clientWidth; H = svgBox.clientHeight; if (sim) sim.alpha(.3).restart(); }); });

// ═══════ INIT ═══════
function init() {
    cacheDom(); applyTheme(currentTheme); applyAccent(settings.accent);
    wire(); updateOptions(); updateStats(); updateFilterBadge(); setView(currentView);
    // Service worker for offline + installable
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    // Periodic notification check (every 5 min)
    if (settings.notifications) scheduleNotifications();
    setInterval(() => { if (settings.notifications) scheduleNotifications(); }, 5*60*1000);
    // Daily review prompt — once per day, only if user has issues
    setTimeout(() => {
        if (issues.length > 3 && settings.lastReviewDate !== todayStr() && !modalOpen()) {
            const overdue = issues.filter(i => i.status !== 'done' && i.dueDate && i.dueDate < todayStr()).length;
            const dueT = issues.filter(i => i.dueDate === todayStr() && i.status !== 'done').length;
            if (overdue + dueT > 0) toastAction(`☀️ Good day — ${overdue+dueT} task${overdue+dueT!==1?'s':''} for today`, 'Open Review', openDailyReview);
        }
    }, 1500);
}
function modalOpen() { return document.querySelector('.modal.active') !== null; }

// ──── MODAL OPENERS ────
function openStats() {
    const m = $('stats-modal'); if (!m) return;
    const total = issues.length;
    const done = issues.filter(i => i.status === 'done').length;
    const open = issues.filter(i => i.status !== 'done').length;
    const overdue = issues.filter(i => i.status !== 'done' && i.dueDate && i.dueDate < todayStr()).length;
    const completionRate = total ? Math.round((done/total)*100) : 0;
    $('stats-summary').innerHTML = `
        <div class="stats-card"><div class="stats-card-num">${total}</div><div class="stats-card-lbl">Total</div></div>
        <div class="stats-card"><div class="stats-card-num">${done}</div><div class="stats-card-lbl">Done</div></div>
        <div class="stats-card"><div class="stats-card-num">${completionRate}%</div><div class="stats-card-lbl">Completion</div></div>
        <div class="stats-card"><div class="stats-card-num">${getStreak()}</div><div class="stats-card-lbl">Streak</div></div>`;
    renderHeatmap($('heatmap-wrap'));
    m.classList.add('active');
}
function closeStats() { $('stats-modal').classList.remove('active'); }

function openTemplates() {
    const m = $('templates-modal'); if (!m) return;
    renderTemplatesList(); m.classList.add('active');
}
function closeTemplates() { $('templates-modal').classList.remove('active'); }
function renderTemplatesList() {
    const list = $('templates-list');
    if (!templates.length) { list.innerHTML = `<div class="tpl-empty">No templates yet. Right-click any task and pick "Save as Template".</div>`; return; }
    list.innerHTML = templates.map(t => `
        <div class="tpl-item" data-id="${t.id}">
            <div class="tpl-info">
                <div class="tpl-name">${escapeHtml(t.name)}</div>
                <div class="tpl-meta">${escapeHtml(t.title)} · ${t.priority}${t.category ? ' · #'+escapeHtml(t.category) : ''}${t.subtasks?.length ? ' · '+t.subtasks.length+' subtasks' : ''}${t.recurrence ? ' · 🔁' : ''}</div>
            </div>
            <div class="tpl-actions">
                <button class="tpl-spawn" data-spawn="${t.id}">Add</button>
                <button class="tpl-del" data-del="${t.id}" title="Delete">✕</button>
            </div>
        </div>`).join('');
    list.querySelectorAll('[data-spawn]').forEach(b => b.onclick = () => { spawnFromTemplate(b.dataset.spawn); closeTemplates(); });
    list.querySelectorAll('[data-del]').forEach(b => b.onclick = () => { if (confirm('Delete this template?')) { deleteTemplate(b.dataset.del); renderTemplatesList(); } });
}

function openSettings() {
    const m = $('settings-modal'); if (!m) return;
    $('set-notif').checked = !!settings.notifications;
    $('set-sound').checked = !!settings.soundOn;
    $('set-confetti').checked = !!settings.confettiOn;
    document.querySelectorAll('.swatch[data-color]').forEach(s => s.classList.toggle('active', s.dataset.color.toLowerCase() === settings.accent.toLowerCase()));
    if ($('accent-custom')) $('accent-custom').value = settings.accent;
    m.classList.add('active');
}
function closeSettings() { $('settings-modal').classList.remove('active'); }

// ═══════ OPTIONS ═══════
let _prevCatKey = '', _prevAsnKey = '';
function updateOptions() {
    const cats = new Set(), asns = new Set();
    for (const i of issues) { if (i.category) cats.add(i.category); if (i.assignee) asns.add(i.assignee); }
    const ca = [...cats].sort(), aa = [...asns].sort();
    const ck = ca.join('|'), ak = aa.join('|');
    if (ck !== _prevCatKey) { _prevCatKey = ck; dom['category-datalist'].innerHTML = ca.map(c => `<option value="${c}">`).join(''); refillSel('filter-category', ca, fCategory); }
    if (ak !== _prevAsnKey) { _prevAsnKey = ak; dom['assignee-datalist'].innerHTML = aa.map(a => `<option value="${a}">`).join(''); refillSel('filter-assignee', aa, fAssignee); }
}
function refillSel(id, list, cur) {
    const el = dom[id], safe = list.includes(cur) ? cur : 'all';
    if (id === 'filter-category') fCategory = safe; else fAssignee = safe;
    el.innerHTML = `<option value="all">${id === 'filter-assignee' ? 'Everyone' : 'All'}</option>` + list.map(o => `<option value="${o}"${o === safe ? ' selected' : ''}>${o}</option>`).join('');
}

// ═══════ STATS ═══════
function updateStats() {
    let o = 0, p = 0, d = 0;
    for (const i of issues) { if (i.status === 'open') o++; else if (i.status === 'in_progress') p++; else d++; }
    animNum(dom['stat-total'], issues.length);
    dom['stat-open'].textContent = o;
    dom['stat-progress'].textContent = o + p;
    dom['stat-done'].textContent = d;
    updateQfCounts();
}
function updateQfCounts() {
    const today = todayStr();
    const now = new Date(); now.setHours(0,0,0,0);
    const weekEnd = new Date(now); weekEnd.setDate(weekEnd.getDate() + 7);
    let cToday = 0, cWeek = 0, cOver = 0, cStar = 0;
    for (const i of issues) {
        if (i.status === 'done') continue;
        if (i.starred) cStar++;
        if (i.dueDate) {
            if (i.dueDate === today) cToday++;
            const dd = new Date(i.dueDate + 'T00:00:00');
            if (dd < now) cOver++;
            else if (dd <= weekEnd) cWeek++;
        }
    }
    const setN = (id, n) => { const el = $(id); if (el) el.textContent = n || ''; };
    setN('qf-num-today', cToday);
    setN('qf-num-week', cWeek + cToday);
    setN('qf-num-overdue', cOver);
    setN('qf-num-starred', cStar);
}
function animNum(el, target) {
    if (!el) return; const start = +el.textContent || 0; if (start === target) { el.textContent = target; return; }
    const dur = 220, t0 = performance.now();
    const step = now => { const f = Math.min((now-t0)/dur,1); el.textContent = (start+(target-start)*f)|0; if (f<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
}

// ═══════ ZOOM TO FIT ═══════
function zoomToFit() {
    if (currentView === 'whiteboard' && window._wbZoom) {
        const filtered = filterIssues();
        if (!filtered.length) return;
        let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
        for (const i of filtered) {
            const p = i.whiteboardPos; if(!p) continue;
            if(p.x<x0) x0=p.x; if(p.y<y0) y0=p.y;
            if(p.x+240>x1) x1=p.x+240; if(p.y+120>y1) y1=p.y+120;
        }
        if(x0===Infinity) return;
        const pad=100; x0-=pad;y0-=pad;x1+=pad;y1+=pad;
        const dx=x1-x0,dy=y1-y0, scale=Math.min(W/dx,H/dy,2), tx=W/2-(x0+x1)/2*scale, ty=H/2-(y0+y1)/2*scale;
        d3.select(dom['whiteboard-view']).transition().duration(600).call(window._wbZoom.transform, d3.zoomIdentity.translate(tx,ty).scale(scale));
        return;
    }
    if (!phys.size || currentView !== 'canvas') return;
    let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
    for (const [,n] of phys) { const hw=cw(n.priority||'medium')/2,hh=ch(n.priority||'medium')/2; if(n.x-hw<x0)x0=n.x-hw; if(n.y-hh<y0)y0=n.y-hh; if(n.x+hw>x1)x1=n.x+hw; if(n.y+hh>y1)y1=n.y+hh; }
    const pad=80; x0-=pad;y0-=pad;x1+=pad;y1+=pad;
    const dx=x1-x0,dy=y1-y0, scale=Math.min(W/dx,H/dy,2), tx=W/2-(x0+x1)/2*scale, ty=H/2-(y0+y1)/2*scale;
    svg.transition().duration(600).call(zoomB.transform, d3.zoomIdentity.translate(tx,ty).scale(scale));
}

function zoomBy(factor) {
    if (currentView === 'canvas' && window._zoom) window._zoom.scaleBy(svg.transition().duration(250), factor);
    else if (currentView === 'whiteboard' && window._wbZoom) window._wbZoom.scaleBy(d3.select(dom['whiteboard-view']).transition().duration(250), factor);
}

// ═══════════════════════════════════════════════════════
//  RENDER — CANVAS VIEW
// ═══════════════════════════════════════════════════════
function renderGraph() {
    const filtered = filterIssues();
    if (!filtered.length) {
        const hasIssues = issues.length > 0;
        const titleEl = $('empty-title'), msgEl = $('empty-msg'), actsEl = $('empty-actions');
        if (hasIssues) {
            titleEl.textContent = 'No matches';
            msgEl.textContent = searchQ ? `Nothing matches "${searchQ}".` : activeQF ? 'No tasks match this quick filter.' : 'Try clearing your filters.';
            actsEl.style.display = 'none';
        } else {
            titleEl.textContent = 'Your canvas awaits';
            msgEl.textContent = "Capture anything that's on your mind — tasks, ideas, reminders.";
            actsEl.style.display = '';
        }
        emptyEl.style.display = 'block';
        nodeLayer.selectAll('*').remove(); linkLayer.selectAll('*').remove();
        labelLayer.selectAll('*').remove(); if (sim) sim.stop(); phys.clear(); return;
    }
    emptyEl.style.display = 'none';

    const fIds = new Set(filtered.map(i => i.id));
    const nodes = filtered.map(d => {
        const n = { ...d }, o = phys.get(d.id);
        if (o) { n.x=o.x;n.y=o.y;n.vx=o.vx;n.vy=o.vy; if(o.isPinned){n.fx=o.fx;n.fy=o.fy;n.isPinned=true;} }
        else { n.x = W/2+(Math.random()-.5)*80; n.y = H/2+(Math.random()-.5)*80; }
        return n;
    });
    phys.clear(); for (const n of nodes) phys.set(n.id, n);
    defs.selectAll('clipPath').each(function() { if (!fIds.has(this.id.slice(3))) this.remove(); });

    const deps = [];
    for (const n of nodes) if (n.dependencies) for (const did of n.dependencies) if (fIds.has(did)) deps.push({source:n.id, target:did});
    linkLayer.selectAll('.dep-link').data(deps, d=>d.source+'-'+d.target).join('line').attr('class','dep-link');

    const cards = nodeLayer.selectAll('.card').data(nodes, d=>d.id).join(
        enter => {
            const e = enter.append('g').attr('class','card').style('opacity',0)
                .attr('transform', d=>`translate(${d.x},${d.y})`)
                .on('click',onClickCard).on('contextmenu',onCtxCard)
                .on('mouseover',onOver).on('mousemove',onMove).on('mouseout',onOut)
                .call(d3.drag().on('start',dragS).on('drag',dragM).on('end',dragE));
            e.transition().duration(350).style('opacity',1);
            return e;
        },
        update => update,
        exit => exit.transition().duration(200).style('opacity',0).remove()
    );

    cards.classed('selected', d=>selected.has(d.id));
    cards.classed('done-card', d=>d.status==='done');

    cards.each(function(d) {
        const el = d3.select(this);
        const hash = cardHash(d);
        if (el.attr('data-hash') === hash) return;
        el.attr('data-hash', hash);
        el.selectAll('*').remove();
        defs.select('#cr-'+d.id).remove();
        const inner = el.append('g').attr('class','card-scale');
        const w=cw(d.priority), h=ch(d.priority), rx=isCompact?8:11, x0=-w/2, y0=-h/2;
        const now = Date.now();
        el.attr('data-priority', d.priority);

        inner.append('rect').attr('class','card-bg').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx)
            .attr('fill','rgba(14,16,22,0.92)').attr('stroke',COLOR[d.status]).attr('stroke-opacity',.16).attr('stroke-width',1);

        const clipId = `cr-${d.id}`;
        defs.append('clipPath').attr('id',clipId).append('rect').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx);

        const accent = inner.append('rect').attr('class','card-accent').attr('x',x0).attr('y',y0).attr('width',5).attr('height',h).attr('fill',COLOR[d.status]).attr('clip-path',`url(#${clipId})`).style('cursor','pointer').on('click', function(ev){ ev.stopPropagation(); cycleStatus(d.id); });
        accent.append('title').text('Click to cycle status');

        if (d.isPinned) inner.append('rect').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx).attr('fill','none').attr('stroke',COLOR[d.status]).attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('stroke-opacity',.3).attr('clip-path',`url(#${clipId})`);

        if (!isCompact) inner.append('text').attr('class','card-num').attr('x',x0+w-10).attr('y',y0+11).attr('text-anchor','end').text(`#${d.num||'?'}`);

        if (d.starred) inner.append('text').attr('class','card-star').attr('x',x0+12).attr('y',y0+11).attr('font-size','8px').text('★');

        const fs = isCompact?9:(d.priority==='high'?12.5:11.5);
        const maxChars = ((w-24)/(fs*0.56))|0;
        let title = d.title; if(title.length>maxChars) title=title.slice(0,maxChars-1)+'…';
        inner.append('text').attr('class','card-title').attr('x',x0+13).attr('y',isCompact?2:(h>38?-3:-1)).attr('font-size',fs+'px').text(title);

        if (!isCompact && h > 38) {
            const ini = initials(d.assignee);
            if (ini) {
                const avX = x0 + w - 20, avY = 7;
                inner.append('circle').attr('class','assignee-avatar').attr('cx',avX).attr('cy',avY).attr('r',7).attr('fill',avatarColor(d.assignee)).attr('opacity',.85);
                inner.append('text').attr('class','assignee-avatar').attr('x',avX).attr('y',avY+3).attr('text-anchor','middle').attr('font-size','6.5px').attr('font-weight','700').attr('fill','#fff').text(ini);
            }
            let meta = d.category;
            const metaMax = ((w - (ini?40:24)) / 5.2) | 0;
            if(meta.length>metaMax) meta=meta.slice(0,metaMax-1)+'…';
            inner.append('text').attr('class','card-meta').attr('x',x0+13).attr('y',14).attr('font-size','9px').text(meta);
        }

        const subs = d.subtasks;
        if (subs?.length) {
            const done=subs.filter(s=>s.done).length, pct=done/subs.length;
            if (!isCompact) inner.append('text').attr('class','card-count').attr('x',x0+w-10).attr('y',-3).attr('fill',pct===1?'#10b981':'rgba(255,255,255,0.3)').attr('font-size','9px').attr('font-weight',600).attr('text-anchor','end').text(pct===1?'✓':`${done}/${subs.length}`);
            const barW=w-10, barY=y0+h-5;
            inner.append('rect').attr('x',x0+5).attr('y',barY).attr('width',barW).attr('height',2).attr('rx',1).attr('fill','rgba(255,255,255,0.03)');
            if(pct>0) inner.append('rect').attr('x',x0+5).attr('y',barY).attr('width',barW*pct).attr('height',2).attr('rx',1).attr('fill','#10b981').attr('opacity',.7);
        }

        if (d.dueDate && new Date(d.dueDate)<now && d.status!=='done') inner.append('circle').attr('cx',x0+w-8).attr('cy',y0+8).attr('r',3.5).attr('fill','#ef4444').attr('class','pulse-dot');
        else if(d.status==='in_progress'&&(now-new Date(d.statusChangedAt||d.date).getTime())/36e5>48) inner.append('circle').attr('cx',x0+w-8).attr('cy',y0+8).attr('r',3).attr('fill','#f59e0b').attr('class','pulse-dot');
    });

    const links = linkLayer.selectAll('.dep-link');
    const centers = getCenters(filtered);
    if (sim) sim.stop();
    sim = d3.forceSimulation(nodes)
        .alphaDecay(0.05)
        .alphaMin(0.04)
        .velocityDecay(0.35)
        .force('charge', d3.forceManyBody().strength(d => -colR(d.priority)*0.9))
        .force('collide', d3.forceCollide().radius(d => colR(d.priority)).iterations(2))
        .on('tick', () => {
            cards.attr('transform', d => { const hw=cw(d.priority)/2,hh=ch(d.priority)/2; d.x=Math.max(hw,Math.min(W-hw,d.x)); d.y=Math.max(hh,Math.min(H-hh,d.y)); phys.set(d.id,d); return `translate(${d.x},${d.y})`; });
            links.attr('x1',d=>phys.get(d.source)?.x||0).attr('y1',d=>phys.get(d.source)?.y||0).attr('x2',d=>phys.get(d.target)?.x||0).attr('y2',d=>phys.get(d.target)?.y||0);
        });

    if (groupBy!=='none'&&Object.keys(centers).length) {
        sim.force('x',d3.forceX().x(d=>centers[d[groupBy]]?.x||W/2).strength(.55));
        sim.force('y',d3.forceY().y(d=>centers[d[groupBy]]?.y||H/2).strength(.55));
        sim.force('contain', forceContain(centers, groupBy));
    } else sim.force('center',d3.forceCenter(W/2,H/2).strength(.05));
    updateLabels(centers);
}

// ═══════════════════════════════════════════════════════
//  RENDER — LIST VIEW (enriched with tags, subtasks)
// ═══════════════════════════════════════════════════════
function renderList() {
    const filtered = filterIssues();
    const sorted = [...filtered].sort((a, b) => {
        let va=a[listSort.col], vb=b[listSort.col];
        if(listSort.col==='priority'){va=PRIORITY_ORD[va]||0;vb=PRIORITY_ORD[vb]||0;}
        if(listSort.col==='status'){const o={open:1,in_progress:2,done:3};va=o[va]||0;vb=o[vb]||0;}
        if(va==null)va='';if(vb==null)vb='';
        if(va<vb)return -listSort.dir;if(va>vb)return listSort.dir;return 0;
    });
    const tbody = dom['list-body'];
    if (!sorted.length) { tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-3)">${issues.length?'No matches':'No issues yet'}</td></tr>`; return; }

    tbody.innerHTML = sorted.map(i => {
        const sd = smartDue(i.dueDate);
        const statusDot = i.status==='open'?'dot-open':i.status==='in_progress'?'dot-active':'dot-done';
        const ini = initials(i.assignee);
        const subInfo = i.subtasks.length ? `<span class="list-subtasks">${i.subtasks.filter(s=>s.done).length}/${i.subtasks.length}</span>` : '';
        const tagPills = i.tags.length ? `<div class="list-tags">${i.tags.map(t=>`<span class="list-tag">${escapeHtml(t)}</span>`).join('')}</div>` : '';
        return `<tr class="list-row${selId===i.id?' list-selected':''}" data-id="${i.id}" style="${i.status==='done'?'opacity:.55':''}">
            <td class="list-num">#${i.num}</td>
            <td class="list-title-cell">
                <span class="dot ${statusDot}" style="width:7px;height:7px;display:inline-block;margin-right:6px;flex-shrink:0"></span>${i.starred?'<span class="list-star">★</span>':''}${escapeHtml(i.title)}
                ${subInfo}${tagPills}
            </td>
            <td><span class="list-status" style="color:${COLOR[i.status]}">${STATUS_LABEL[i.status]}</span></td>
            <td class="list-priority-${i.priority}">${i.priority}</td>
            <td>${escapeHtml(i.category)}</td>
            <td>${ini?`<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:16px;height:16px;border-radius:50%;background:${avatarColor(i.assignee)};display:inline-grid;place-items:center;font-size:7px;font-weight:700;color:#fff;flex-shrink:0">${escapeHtml(ini)}</span>${escapeHtml(i.assignee)}</span>`:`<span style="color:var(--text-3)">—</span>`}</td>
            <td class="list-due ${sd.cls}">${sd.text||(i.dueDate||'—')}</td>
        </tr>`;
    }).join('');
}

// ═══════════════════════════════════════════════════════
//  RENDER — KANBAN VIEW (sorted by priority)
// ═══════════════════════════════════════════════════════
function renderKanban() {
    const filtered = filterIssues();
    const cols = { open:[], in_progress:[], done:[] };
    for (const i of filtered) cols[i.status].push(i);

    // Sort each column by priority desc
    const priSort = (a,b) => (PRIORITY_ORD[b.priority]||0) - (PRIORITY_ORD[a.priority]||0);
    cols.open.sort(priSort); cols.in_progress.sort(priSort); cols.done.sort(priSort);

    const renderCol = (items, container, countEl) => {
        countEl.textContent = items.length;
        if (!items.length) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:10px">Drop here</div>'; return; }
        container.innerHTML = items.map(i => {
            const sd = smartDue(i.dueDate), subs=i.subtasks, subPct=subs?.length?subs.filter(s=>s.done).length/subs.length:0;
            const ini = initials(i.assignee);
            return `<div class="kanban-card" draggable="true" data-id="${i.id}" style="${i.status==='done'?'opacity:.6':''}">
                <div class="kanban-card-head"><span class="kanban-card-num">#${i.num}</span><span class="kanban-card-priority p-${i.priority}">${i.priority}</span></div>
                <div class="kanban-card-title">${i.starred?'★ ':''}${escapeHtml(i.title)}</div>
                <div class="kanban-card-meta"><span>${escapeHtml(i.category)}</span>${ini?`<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:14px;height:14px;border-radius:50%;background:${avatarColor(i.assignee)};display:inline-grid;place-items:center;font-size:6px;font-weight:700;color:#fff">${escapeHtml(ini)}</span>${escapeHtml(i.assignee)}</span>`:''}</div>
                ${sd.text?`<div class="kanban-card-due ${sd.cls}">${sd.text}</div>`:''}
                ${i.tags.length?`<div class="kanban-card-tags">${i.tags.map(t=>`<span class="kanban-card-tag">${escapeHtml(t)}</span>`).join('')}</div>`:''}
                ${subs?.length?`<div class="kanban-card-progress"><div class="kanban-card-progress-fill" style="width:${subPct*100}%"></div></div>`:''}
            </div>`;
        }).join('');
    };
    renderCol(cols.open, dom['kanban-open'], dom['kanban-count-open']);
    renderCol(cols.in_progress, dom['kanban-progress'], dom['kanban-count-progress']);
    renderCol(cols.done, dom['kanban-done'], dom['kanban-count-done']);
}

// ═══════════════════════════════════════════════════════
//  RENDER — CALENDAR VIEW
// ═══════════════════════════════════════════════════════
function renderCalendar() {
    const body = dom['cal-body'], unsched = dom['cal-unscheduled'];
    dom['cal-title'].textContent = `${MONTHS[calMonth]} ${calYear}`;

    // Build month grid
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startPad = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();
    const today = todayStr();

    // Map issues to dates
    const filtered = filterIssues();
    const dateMap = {};
    const unscheduled = [];
    for (const i of filtered) {
        if (i.dueDate) {
            if (!dateMap[i.dueDate]) dateMap[i.dueDate] = [];
            dateMap[i.dueDate].push(i);
        } else {
            unscheduled.push(i);
        }
    }

    // Build cells
    let html = '';
    const totalCells = Math.ceil((startPad + totalDays) / 7) * 7;

    for (let c = 0; c < totalCells; c++) {
        const dayNum = c - startPad + 1;
        const isOther = dayNum < 1 || dayNum > totalDays;
        const dateObj = new Date(calYear, calMonth, dayNum);
        const dateKey = dateObj.toISOString().slice(0, 10);
        const isToday = dateKey === today;
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

        let cls = 'cal-day';
        if (isOther) cls += ' other-month';
        if (isToday) cls += ' today';
        if (isWeekend && !isOther) cls += ' weekend';

        const chips = (dateMap[dateKey] || []).map(i => {
            const sCls = i.status === 'open' ? 's-open' : i.status === 'in_progress' ? 's-progress' : 's-done';
            const isOverdue = i.dueDate && new Date(i.dueDate+'T00:00:00') < new Date() && i.status !== 'done';
            return `<div class="cal-chip ${sCls}${isOverdue?' overdue':''}" data-id="${i.id}" title="#${i.num} ${escapeHtml(i.title)}">${i.starred?'★ ':''}#${i.num} ${escapeHtml(i.title)}</div>`;
        }).join('');

        const displayNum = isOther ? dateObj.getDate() : dayNum;
        html += `<div class="${cls}"><span class="cal-day-num">${displayNum}</span>${chips}</div>`;
    }
    body.innerHTML = html;

    // Unscheduled section
    if (unscheduled.length) {
        unsched.innerHTML = `<div class="cal-unsched-title">No due date (${unscheduled.length})</div><div class="cal-unsched-list">${unscheduled.map(i => `<div class="cal-unsched-chip" data-id="${i.id}">#${i.num} ${escapeHtml(i.title)}</div>`).join('')}</div>`;
        unsched.style.display = '';
    } else {
        unsched.style.display = 'none';
    }
}

function wbForceRect() {
    let nodes;
    function force(alpha) {
        const padding = 12; // Reduced padding
        for (let i = 0, n = nodes.length; i < n; ++i) {
            const a = nodes[i];
            if (!a.whiteboardPos) continue;
            const wA = a._w || 240;
            const hA = a._h || 120;
            
            for (let j = i + 1; j < n; ++j) {
                const b = nodes[j];
                if (!b.whiteboardPos) continue;
                
                const wB = b._w || 240;
                const hB = b._h || 120;
                
                const cAx = a.x + wA / 2;
                const cAy = a.y + hA / 2;
                const cBx = b.x + wB / 2;
                const cBy = b.y + hB / 2;
                
                let dx = cAx - cBx;
                let dy = cAy - cBy;
                if (dx === 0) dx = (Math.random() - 0.5) * 1e-2;
                if (dy === 0) dy = (Math.random() - 0.5) * 1e-2;
                const absX = Math.abs(dx);
                const absY = Math.abs(dy);
                
                const minDistanceX = (wA + wB) / 2 + padding;
                const minDistanceY = (hA + hB) / 2 + padding;
                
                if (absX < minDistanceX && absY < minDistanceY) {
                    const overlapX = minDistanceX - absX;
                    const overlapY = minDistanceY - absY;
                    const weightA = a.fx != null ? 0 : (b.fx != null ? 1 : 0.5);
                    const weightB = b.fx != null ? 0 : (a.fx != null ? 1 : 0.5);
                    if (weightA === 0 && weightB === 0) continue;
                    
                    if (overlapX < overlapY) {
                        const push = overlapX * alpha;
                        if (dx > 0) { a.x += push * weightA; b.x -= push * weightB; } 
                        else { a.x -= push * weightA; b.x += push * weightB; }
                    } else {
                        const push = overlapY * alpha;
                        if (dy > 0) { a.y += push * weightA; b.y -= push * weightB; } 
                        else { a.y -= push * weightA; b.y += push * weightB; }
                    }
                }
            }
        }
    }
    force.initialize = _ => nodes = _;
    return force;
}

// ═══════ WHITEBOARD VIEW ═══════
const WB_COLORS = ['c-yellow', 'c-blue', 'c-pink', 'c-green', 'c-purple'];
let wbSim = null;
function renderWhiteboard() {
    const canvas = dom['whiteboard-canvas'];
    if (!canvas) return;

    const filtered = filterIssues();
    let html = '';
    
    const hashCode = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

    const wW = canvas.parentElement.clientWidth || window.innerWidth;
    const wH = canvas.parentElement.clientHeight || window.innerHeight;
    const cx = (wW / 2 - wbZoomTransform.x) / wbZoomTransform.k;
    const cy = (wH / 2 - wbZoomTransform.y) / wbZoomTransform.k;

    filtered.forEach(d => {
        if (!d.whiteboardPos) d.whiteboardPos = { x: cx - 120 + Math.random() * 60 - 30, y: cy - 60 + Math.random() * 60 - 30 };
        d.x = d.whiteboardPos.x;
        d.y = d.whiteboardPos.y;
    });

    for (const i of filtered) {
        const cIdx = hashCode(i.id) % WB_COLORS.length;
        const colorCls = WB_COLORS[cIdx];
        
        html += `<div class="wb-note ${colorCls}${i.status==='done'?' is-done':''}" id="wb-n-${i.id}" data-id="${i.id}" style="transform:translate(${i.x}px, ${i.y}px)">
            <textarea class="wb-note-input" spellcheck="false" placeholder="Empty note...">${escapeHtml(i.title)}</textarea>
        </div>`;
    }
    canvas.innerHTML = html;

    if (wbSim) wbSim.stop();
    const domNodes = new Map();
    for (const i of filtered) domNodes.set(i.id, document.getElementById(`wb-n-${i.id}`));

    wbSim = d3.forceSimulation(filtered)
        .force('rect', wbForceRect())
        .alphaDecay(0.05)
        .on('tick', () => {
            for (const d of filtered) {
                if (wbTornadoTarget && wbTornadoNodes.has(d.id)) {
                    const tx = d._tornadoTargetX || wbTornadoTarget.x;
                    const ty = d._tornadoTargetY || wbTornadoTarget.y;
                    d.vx += (tx - d.x) * 0.05;
                    d.vy += (ty - d.y) * 0.05;
                }
                d.whiteboardPos.x = d.x;
                d.whiteboardPos.y = d.y;
                const el = domNodes.get(d.id);
                if (el) {
                    el.style.transform = `translate(${d.x}px, ${d.y}px)`;
                    if (!d._w || Math.random() < 0.05) {
                        d._w = el.offsetWidth;
                        d._h = el.offsetHeight;
                    }
                }
            }
        })
        .on('end', () => {
            localStorage.setItem('bubbleTaskerIssues', JSON.stringify(issues));
        });

    let resizeAttempts = 0;
    const resizeInterval = setInterval(() => {
        let anyResized = false;
        document.querySelectorAll('.wb-note-input').forEach(ta => {
            const oldW = ta.closest('.wb-note').style.width;
            const oldH = ta.style.height;
            resizeNote(ta);
            if (oldW !== ta.closest('.wb-note').style.width || oldH !== ta.style.height) {
                anyResized = true;
            }
        });
        if (anyResized && wbSim) wbSim.alphaTarget(0.3).restart();
        
        resizeAttempts++;
        if (resizeAttempts > 5) clearInterval(resizeInterval);
    }, 150);
}

// Whiteboard Interactions
let wbDrag = null;
let wbTornadoTarget = null;
let wbTornadoNodes = new Set();
let wbMaxZ = 10;
let wbZoomTransform = d3.zoomIdentity;

function renderTrashPanel() {
    const list = document.getElementById('trash-list');
    const btn = document.getElementById('empty-trash-btn');
    if (!deletedStack.length) {
        list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-2);font-size:13px">Trash is empty</div>';
        btn.disabled = true;
        return;
    }
    btn.disabled = false;
    list.innerHTML = deletedStack.slice().reverse().map((i, idx) => `
        <div class="trash-item">
            <span class="trash-item-title" title="${escapeHtml(i.title)}">#${i.num} ${escapeHtml(i.title||'Empty note')}</span>
            <button class="trash-restore-btn" data-idx="${deletedStack.length - 1 - idx}">Restore</button>
        </div>
    `).join('');
    list.querySelectorAll('.trash-restore-btn').forEach(b => {
        b.addEventListener('click', e => {
            const idx = parseInt(e.target.dataset.idx);
            const issue = deletedStack.splice(idx, 1)[0];
            issues.push(issue);
            persist();
            renderTrashPanel();
            toast('↩ Restored', 'ok');
        });
    });
}

setTimeout(() => {
    const wc = dom['whiteboard-canvas'];
    const wv = dom['whiteboard-view'];
    if(!wc || !wv) return;
    
    window._wbZoom = d3.zoom().scaleExtent([0.1, 5]).on('zoom', e => {
        wbZoomTransform = e.transform;
        wc.style.transform = `translate(${e.transform.x}px, ${e.transform.y}px) scale(${e.transform.k})`;
        wv.style.backgroundPosition = `${e.transform.x}px ${e.transform.y}px`;
        wv.style.backgroundSize = `${24 * e.transform.k}px ${24 * e.transform.k}px`;
        const p = Math.round(e.transform.k * 100);
        if (dom['zoom-level'] && currentView === 'whiteboard') dom['zoom-level'].textContent = p + '%';
    });
    d3.select(wv).call(window._wbZoom).on('dblclick.zoom', null);

    const trashBin = document.getElementById('wb-trash');
    const trashPanel = document.getElementById('trash-panel');
    if (trashBin) {
        trashBin.addEventListener('click', () => {
            trashPanel.classList.toggle('hidden');
            if (!trashPanel.classList.contains('hidden')) renderTrashPanel();
        });
        document.getElementById('close-trash-btn').addEventListener('click', () => trashPanel.classList.add('hidden'));
        document.getElementById('empty-trash-btn').addEventListener('click', () => {
            if (confirm('Empty trash permanently?')) {
                deletedStack = [];
                renderTrashPanel();
            }
        });
    }

    let wbLasso = null;
    let wbSelected = new Set();
    const lassoEl = document.getElementById('wb-lasso');

    wv.addEventListener('mousedown', e => {
        const isCtrl = e.ctrlKey || e.metaKey;
        const note = e.target.closest('.wb-note');
        
        if (!note) {
            if (isCtrl) {
                e.stopImmediatePropagation();
                e.preventDefault(); // disable panning
                const rect = wv.getBoundingClientRect();
                wbLasso = { startX: e.clientX, startY: e.clientY, rect };
                if (lassoEl) {
                    lassoEl.style.left = (e.clientX - rect.left) + 'px';
                    lassoEl.style.top = (e.clientY - rect.top) + 'px';
                    lassoEl.style.width = '0px';
                    lassoEl.style.height = '0px';
                    lassoEl.classList.remove('hidden');
                }
            } else {
                wbSelected.clear();
                document.querySelectorAll('.wb-note.is-selected').forEach(n => n.classList.remove('is-selected'));
            }
            return;
        }
        
        e.stopImmediatePropagation();
        const id = note.dataset.id;
        const issue = _filterCache.find(i => i.id === id);
        if (!issue) return;

        if (isCtrl) {
            if (wbSelected.has(id)) {
                wbSelected.delete(id);
                note.classList.remove('is-selected');
            } else {
                wbSelected.add(id);
                note.classList.add('is-selected');
            }
            return;
        }

        if (!wbSelected.has(id)) {
            wbSelected.clear();
            document.querySelectorAll('.wb-note.is-selected').forEach(n => n.classList.remove('is-selected'));
            wbSelected.add(id);
            note.classList.add('is-selected');
        }
        
        wbMaxZ++;
        note.style.zIndex = wbMaxZ;
        
        if (note.classList.contains('is-editing')) return;
        if (e.target.closest('.done-btn')) return;
        
        if (wbSim) wbSim.alphaTarget(0.3).restart();
        
        const dragGroup = [];
        for (const selId of wbSelected) {
            const selIss = _filterCache.find(i => i.id === selId);
            const selEl = document.getElementById('wb-n-' + selId);
            if (selIss && selEl) {
                selIss.fx = selIss.x;
                selIss.fy = selIss.y;
                selEl.classList.add('dragging');
                dragGroup.push({ el: selEl, issue: selIss, initX: selIss.x, initY: selIss.y });
            }
        }
        wbDrag = { group: dragGroup, startX: e.clientX, startY: e.clientY };
    }, true);

    let wbCtxPos = { x: 0, y: 0 };
    wv.addEventListener('contextmenu', e => {
        const note = e.target.closest('.wb-note');
        if (note) {
            e.preventDefault();
            e.stopPropagation();
            if (wbEmptyCtxEl) wbEmptyCtxEl.classList.remove('visible');
            showCtx(e, note.dataset.id);
        } else {
            e.preventDefault();
            e.stopPropagation();
            hideCtx();
            
            const rect = wv.getBoundingClientRect();
            wbCtxPos.x = (e.clientX - rect.left - wbZoomTransform.x) / wbZoomTransform.k;
            wbCtxPos.y = (e.clientY - rect.top - wbZoomTransform.y) / wbZoomTransform.k;
            
            if (wbEmptyCtxEl) {
                wbEmptyCtxEl.classList.add('visible');
                let l = e.pageX; let t = e.pageY;
                if (l + wbEmptyCtxEl.offsetWidth > window.innerWidth) l = window.innerWidth - wbEmptyCtxEl.offsetWidth - 8;
                if (t + wbEmptyCtxEl.offsetHeight > window.innerHeight) t = window.innerHeight - wbEmptyCtxEl.offsetHeight - 8;
                wbEmptyCtxEl.style.left = l + 'px';
                wbEmptyCtxEl.style.top = t + 'px';
            }
        }
    });

    if (wbEmptyCtxEl) {
        wbEmptyCtxEl.addEventListener('click', e => {
            const item = e.target.closest('.ctx-item');
            if (!item) return;
            const action = item.dataset.action;
            if (!action.startsWith('wb-tornado') || !item.classList.contains('ctx-has-sub')) {
                wbEmptyCtxEl.classList.remove('visible');
            }
            
            if (action && action.startsWith('wb-tornado')) {
                const type = action.replace('wb-tornado-', '');
                wbTornadoNodes.clear();
                for (const d of _filterCache) {
                    if (!d.whiteboardPos) continue;
                    if (type === 'active' && d.status === 'done') continue;
                    if (type === 'done' && d.status !== 'done') continue;
                    
                    d._tornadoTargetX = wbCtxPos.x + (Math.random() * 200 - 100);
                    d._tornadoTargetY = wbCtxPos.y + (Math.random() * 200 - 100);
                    wbTornadoNodes.add(d.id);
                }
                
                if (wbTornadoNodes.size > 0) {
                    wbTornadoTarget = { x: wbCtxPos.x, y: wbCtxPos.y };
                    if (wbSim) wbSim.alpha(1).restart();
                    
                    setTimeout(() => {
                        wbTornadoTarget = null;
                        wbTornadoNodes.clear();
                        if (wbSim) wbSim.alphaTarget(0);
                        persist();
                    }, 1500);
                }
                if (!item.classList.contains('ctx-has-sub')) wbEmptyCtxEl.classList.remove('visible');
                return;
            }
            
            if (action === 'wb-new-note') {
                const i = { id:Date.now().toString(), num:_nextNum++, title:'', description:'', status:'open', priority:'medium', category:'Task', tags:[], assignee:'Unassigned', date:new Date().toISOString(), subtasks:[], dependencies:[], starred:false, history:[{action:'Created',detail:'on whiteboard',at:new Date().toISOString()}] };
                i.whiteboardPos = { x: wbCtxPos.x, y: wbCtxPos.y };
                issues.push(i);
                persist();
                setTimeout(() => {
                    const el = document.querySelector(`.wb-note[data-id="${i.id}"]`);
                    if (el) el.dispatchEvent(new MouseEvent('dblclick', {bubbles:true}));
                }, 50);
            } else if (action === 'wb-zoom-fit') {
                document.getElementById('zoom-fit-btn')?.click();
            } else if (action === 'wb-empty-trash') {
                document.getElementById('empty-trash-btn')?.click();
            }
        });
    }

    document.addEventListener('mousemove', e => {
        if (wbLasso && lassoEl) {
            const left = Math.min(e.clientX, wbLasso.startX) - wbLasso.rect.left;
            const top = Math.min(e.clientY, wbLasso.startY) - wbLasso.rect.top;
            const width = Math.abs(e.clientX - wbLasso.startX);
            const height = Math.abs(e.clientY - wbLasso.startY);
            lassoEl.style.left = left + 'px';
            lassoEl.style.top = top + 'px';
            lassoEl.style.width = width + 'px';
            lassoEl.style.height = height + 'px';
            
            const lRect = lassoEl.getBoundingClientRect();
            document.querySelectorAll('.wb-note').forEach(note => {
                const nRect = note.getBoundingClientRect();
                const intersect = !(nRect.right < lRect.left || nRect.left > lRect.right || nRect.bottom < lRect.top || nRect.top > lRect.bottom);
                const id = note.dataset.id;
                if (intersect) {
                    wbSelected.add(id);
                    note.classList.add('is-selected');
                } else {
                    wbSelected.delete(id);
                    note.classList.remove('is-selected');
                }
            });
            return;
        }

        if (!wbDrag) return;
        const dx = (e.clientX - wbDrag.startX) / wbZoomTransform.k;
        const dy = (e.clientY - wbDrag.startY) / wbZoomTransform.k;
        
        for (const item of wbDrag.group) {
            item.issue.fx = item.initX + dx;
            item.issue.fy = item.initY + dy;
        }
        
        if (trashBin && trashPanel.classList.contains('hidden')) {
            const rect = trashBin.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
                trashBin.classList.add('drag-over');
            } else {
                trashBin.classList.remove('drag-over');
            }
        }
    });

    document.addEventListener('mouseup', e => {
        if (wbLasso) {
            wbLasso = null;
            if (lassoEl) lassoEl.classList.add('hidden');
        }

        if (!wbDrag) return;
        
        if (trashBin && trashBin.classList.contains('drag-over')) {
            trashBin.classList.remove('drag-over');
            for (const item of wbDrag.group) {
                deletedStack.push(structuredClone(item.issue));
                issues = issues.filter(i => i.id !== item.issue.id);
            }
            wbDrag = null;
            wbSelected.clear();
            persist();
            toast('🗑️ Deleted', 'bad', true);
            return;
        }

        const dx = Math.abs(e.clientX - wbDrag.startX);
        const dy = Math.abs(e.clientY - wbDrag.startY);
        const wasDrag = dx > 3 || dy > 3;

        for (const item of wbDrag.group) {
            item.issue.fx = null;
            item.issue.fy = null;
            item.el.classList.remove('dragging');
        }
        
        if (!wasDrag && wbSelected.size > 1 && wbDrag.group.length > 0 && e.target) {
            const noteEl = e.target.closest('.wb-note');
            if (noteEl) {
                const id = noteEl.dataset.id;
                if (wbSelected.has(id)) {
                    wbSelected.clear();
                    document.querySelectorAll('.wb-note.is-selected').forEach(n => n.classList.remove('is-selected'));
                    wbSelected.add(id);
                    noteEl.classList.add('is-selected');
                }
            }
        }
        
        if (wbSim) wbSim.alphaTarget(0);
        wbDrag = null;
    });

    wv.addEventListener('dblclick', e => {
        const note = e.target.closest('.wb-note');
        if (note) {
            note.classList.add('is-editing');
            const input = note.querySelector('.wb-note-input');
            input.focus();
            input.setSelectionRange(input.value.length, input.value.length);
            return;
        }
        
        const rect = wv.getBoundingClientRect();
        const x_screen = e.clientX - rect.left;
        const y_screen = e.clientY - rect.top;
        const x = (x_screen - wbZoomTransform.x) / wbZoomTransform.k - 120;
        const y = (y_screen - wbZoomTransform.y) / wbZoomTransform.k - 40;
        
        const id = Date.now().toString(), num = _nextNum++;
        const now = new Date().toISOString();
        const issue = { id, num, title:'', description:'', status:'open', priority:'medium', category:'Task', tags:[], assignee:'Unassigned', date:now, dueDate:null, subtasks:[], dependencies:[], recurrence:'none', timeEntries:[], snoozedUntil:null, whiteboardPos:{x,y}, starred:false, history:[{action:'Created',detail:'Whiteboard',at:now}], statusChangedAt:now };
        issues.push(issue);
        persist();
        
        setTimeout(() => {
            const newNote = document.querySelector(`.wb-note[data-id="${id}"]`);
            if (newNote) {
                newNote.classList.add('is-editing');
                const input = newNote.querySelector('.wb-note-input');
                if (input) input.focus();
            }
        }, 50);
    });

    wc.addEventListener('focusout', e => {
        if (e.target.classList.contains('wb-note-input')) {
            e.target.closest('.wb-note').classList.remove('is-editing');
        }
    });

// Helper to resize note proportionally
function resizeNote(ta) {
    const noteEl = ta.closest('.wb-note');
    noteEl.style.width = '240px';
    ta.style.height = 'auto';
    let sh = ta.scrollHeight;
    
    if (sh > 120) {
        let targetWidth = Math.sqrt(120 * sh) * 2;
        if (targetWidth < 240) targetWidth = 240;
        noteEl.style.width = targetWidth + 'px';
    }
    
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
}

    wc.addEventListener('input', e => {
        if (e.target.classList.contains('wb-note-input')) {
            const ta = e.target;
            resizeNote(ta);
            if (wbSim) wbSim.alphaTarget(0.1).restart();
            
            const id = ta.closest('.wb-note').dataset.id;
            const issue = issues.find(i => i.id === id);
            if (issue) {
                issue.title = ta.value;
                clearTimeout(window._wbSave);
                window._wbSave = setTimeout(() => {
                    localStorage.setItem('bubbleTaskerIssues', JSON.stringify(issues));
                    rebuildMap();
                }, 500);
            }
        }
    });

    wc.addEventListener('click', e => {
        const btn = e.target.closest('.done-btn');
        if (btn) {
            const id = btn.closest('.wb-note').dataset.id;
            const issue = issues.find(i => i.id === id);
            if (issue) {
                issue.status = issue.status === 'done' ? 'open' : 'done';
                issue.statusChangedAt = new Date().toISOString();
                persist();
                if (settings.confettiOn && issue.status === 'done') fireConfetti();
                if (settings.soundOn && issue.status === 'done') playSound(600, 'sine', 0.1);
            }
        }
    });
}, 500);

// ═══════ PHYSICS ═══════
function dragS(e,d){tip.style('opacity',0);if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}
function dragM(e,d){d.fx=e.x;d.fy=e.y}
function dragE(e,d){if(!e.active)sim.alphaTarget(0);if(!d.isPinned){d.fx=null;d.fy=null}}

// ═══════ CARD EVENTS ═══════
function onClickCard(e,d) { hideCtx(); if(e.shiftKey){selected.has(d.id)?selected.delete(d.id):selected.add(d.id);updateBulk()} else{selected.clear();updateBulk();openPanel(d.id)} }
function onCtxCard(e,d) { e.preventDefault();e.stopPropagation();showCtx(e,d.id) }
const _CYCLE = { open:'in_progress', in_progress:'done', done:'open' };
function cycleStatus(id) {
    const i = getI(id); if (!i) return;
    const oldS = i.status, newS = _CYCLE[i.status] || 'open';
    i.status = newS; i.statusChangedAt = new Date().toISOString();
    logActivity(id, 'Status', `${STATUS_LABEL[oldS]} → ${STATUS_LABEL[newS]}`);
    if (selId === id) dom['edit-status'].value = newS;
    if (newS === 'done') onTaskCompleted(i);
    persist();
}
function onTaskCompleted(issue) {
    if (settings.confettiOn) burstConfetti();
    if (settings.soundOn) playDing();
    if (issue.recurrence) {
        const next = spawnRecurrence(issue);
        if (next) toast(`🔁 Next "${next.title}" → ${smartDue(next.dueDate).text.toLowerCase()}`, 'ok');
    }
}

// ═══════ TOOLTIP ═══════
function tipPos(e) { const r=tip.node().getBoundingClientRect();let tx=e.pageX+16,ty=e.pageY-16;if(tx+260>window.innerWidth)tx=e.pageX-270;if(ty+(r.height||200)>window.innerHeight)ty=window.innerHeight-(r.height||200)-10;if(ty<10)ty=10;return{tx,ty} }
function onOver(e,d) {
    if(e.buttons>0)return; hovId=d.id;
    const linked=new Set([d.id]);if(d.dependencies)for(const id of d.dependencies)linked.add(id);const rev=reverseDeps.get(d.id);if(rev)for(const id of rev)linked.add(id);
    nodeLayer.selectAll('.card').style('opacity',b=>linked.has(b.id)?1:.15);
    linkLayer.selectAll('.dep-link').style('opacity',l=>(l.source===d.id||l.target===d.id)?.8:.05);
    const parts=[`<h4>#${d.num} ${escapeHtml(d.title)}</h4>`];
    const desc=(d.description||'').trim();if(desc)parts.push(`<div class="tt-desc">${escapeHtml(desc.replace(/\n/g,' ').slice(0,140))}${desc.length>140?'…':''}</div>`);
    parts.push(`<div class="tt-meta"><span>Status</span><strong style="color:${COLOR[d.status]}">${STATUS_LABEL[d.status]}</strong></div>`);
    parts.push(`<div class="tt-meta"><span>Priority</span><strong style="text-transform:capitalize">${d.priority}</strong></div>`);
    parts.push(`<div class="tt-meta"><span>Assignee</span><strong>${escapeHtml(d.assignee||'—')}</strong></div>`);
    if(d.subtasks?.length)parts.push(`<div class="tt-extra">☑ ${d.subtasks.filter(s=>s.done).length}/${d.subtasks.length} sub-tasks</div>`);
    if(d.dueDate){const sd=smartDue(d.dueDate);parts.push(`<div class="tt-extra" style="color:${sd.cls==='overdue'?'var(--red)':sd.cls==='today'?'var(--amber)':'var(--text-3)'}">${sd.text} (${d.dueDate})</div>`)}
    if(d.tags.length)parts.push(`<div class="tt-tags">${d.tags.map(t=>`<span class="tt-tag">${escapeHtml(t)}</span>`).join('')}</div>`);
    if(d.starred)parts.push(`<div class="tt-extra">⭐ Starred</div>`);
    tip.html(parts.join(''));tip.style('opacity',1);const{tx,ty}=tipPos(e);tip.style('left',tx+'px').style('top',ty+'px');
}
function onMove(e){const{tx,ty}=tipPos(e);tip.style('left',tx+'px').style('top',ty+'px')}
function onOut(){hovId=null;tip.style('opacity',0);nodeLayer.selectAll('.card').style('opacity',1);linkLayer.selectAll('.dep-link').style('opacity',1)}

// ═══════ GROUPING ═══════
function getCenters(data) {
    if(groupBy==='none')return {};
    const counts = {};
    for (const d of data) { const g = d[groupBy]; if (g) counts[g] = (counts[g]||0) + 1; }
    const u = Object.keys(counts).sort();
    if (!u.length) return {};
    const c = {};
    const cols=Math.min(3,u.length), rows=Math.ceil(u.length/cols);
    const padX=W*0.10, padY=H*0.10;
    const sx=(W-padX*2)/(cols||1), sy=(H-padY*2)/(rows||1);
    const cellR = Math.min(sx, sy) * 0.44;
    u.forEach((g,i)=>{c[g]={
        x:padX+sx*(i%cols)+sx/2, y:padY+sy*Math.floor(i/cols)+sy/2,
        count:counts[g], radius:cellR
    }});
    return c;
}
function forceContain(centers, field) {
    let ns;
    function force(alpha) {
        for (const n of ns) {
            const c = centers[n[field]];
            if (!c) continue;
            const dx = n.x - c.x, dy = n.y - c.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist > c.radius) {
                const k = ((dist - c.radius) / dist) * alpha * 0.9;
                n.vx -= dx * k;
                n.vy -= dy * k;
            }
        }
    }
    force.initialize = nodes => { ns = nodes; };
    return force;
}
function updateLabels(c) { labelLayer.selectAll('.group-label-svg').remove();if(groupBy==='none')return;for(const[n,p]of Object.entries(c)){labelLayer.append('text').attr('class','group-label-svg').attr('x',p.x).attr('y',p.y).attr('text-anchor','middle').attr('dominant-baseline','middle').text(n.replace('_',' ').toUpperCase())} }

// ═══════ CONTEXT MENU ═══════
function showCtx(e,id){
    ctxId=id;
    ctxEl.classList.add('visible');
    let l = e.pageX; let t = e.pageY;
    if (l + ctxEl.offsetWidth > window.innerWidth) l = window.innerWidth - ctxEl.offsetWidth - 8;
    if (t + ctxEl.offsetHeight > window.innerHeight) t = window.innerHeight - ctxEl.offsetHeight - 8;
    ctxEl.style.left = l + 'px';
    ctxEl.style.top = t + 'px';
}
function hideCtx(){ctxEl.classList.remove('visible');ctxId=null}
function doCtx(action) {
    if(!ctxId)return;const issue=getI(ctxId);if(!issue)return;
    switch(action){
        case'pin':{const n=phys.get(ctxId);if(n){n.isPinned=!n.isPinned;if(n.isPinned){n.fx=n.x;n.fy=n.y}else{n.fx=null;n.fy=null;if(sim)sim.alphaTarget(.3).restart()}phys.set(ctxId,n)}renderGraph();break}
        case'clone':{const cl={...structuredClone(issue),id:Date.now().toString(),num:_nextNum++,title:issue.title+' (copy)',date:new Date().toISOString(),statusChangedAt:new Date().toISOString(),history:[{action:'Cloned',detail:`from #${issue.num}`,at:new Date().toISOString()}]};issues.push(cl);toast('📋 Duplicated','ok');persist();break}
        case'status-open':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → Open`);issue.status='open';issue.statusChangedAt=new Date().toISOString();persist();break;
        case'status-progress':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → In Progress`);issue.status='in_progress';issue.statusChangedAt=new Date().toISOString();persist();break;
        case'status-done':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → Done`);issue.status='done';issue.statusChangedAt=new Date().toISOString();onTaskCompleted(issue);persist();break;
        case'snooze-tomorrow':{const d=new Date();d.setDate(d.getDate()+1);issue.dueDate=d.toISOString().slice(0,10);issue.snoozedUntil=issue.dueDate;persist();toast(`💤 Snoozed to tomorrow`,'info');break}
        case'snooze-week':{const d=new Date();d.setDate(d.getDate()+7);issue.dueDate=d.toISOString().slice(0,10);issue.snoozedUntil=issue.dueDate;persist();toast(`💤 Snoozed 1 week`,'info');break}
        case'focus':startFocus(ctxId);break;
        case'save-template':saveAsTemplate(ctxId);break;
        case'copy':navigator.clipboard.writeText(`#${issue.num} ${issue.title}`).then(()=>toast('📎 Copied','info'));break;
        case'delete':deletedStack.push(structuredClone(issue));issues=issues.filter(i=>i.id!==ctxId);persist();toast('🗑️ Deleted','bad',true);break;
    }
    hideCtx();
}

// ═══════ MULTI-SELECT ═══════
function updateBulk(){nodeLayer.selectAll('.card').classed('selected',d=>selected.has(d.id));const bar=dom['bulk-bar'];if(selected.size){bar.classList.add('active');dom['bulk-count'].textContent=selected.size+' selected'}else bar.classList.remove('active')}

// ═══════ PREV/NEXT NAV ═══════
function navIssue(dir){if(!selId)return;const visible=[...phys.keys()];const idx=visible.indexOf(selId);if(idx===-1)return;const next=visible[(idx+dir+visible.length)%visible.length];if(next)openPanel(next)}

// ═══════ PANEL ═══════
function openPanel(id) {
    if(selId&&selId!==id)syncPanel(); selId=id;const i=getI(id);if(!i)return;
    dom['panel-num'].textContent=`#${i.num||'?'}`;dom['panel-badge'].textContent=i.category;dom['panel-status-strip'].style.background=COLOR[i.status];
    const t=dom['panel-title'];t.value=i.title;autoExpand(t);
    dom['edit-status'].value=i.status;dom['edit-priority'].value=i.priority;dom['edit-category'].value=i.category;
    dom['edit-assignee'].value=i.assignee!=='Unassigned'?i.assignee:'';dom['edit-due-date'].value=i.dueDate||'';
    dom['panel-desc'].value=i.description||'';
    if(dom['edit-recurrence'])dom['edit-recurrence'].value=i.recurrence||'';
    if(dom['time-total']){const total=(i.timeEntries||[]).reduce((a,e)=>a+(e.seconds||0),0);dom['time-total'].textContent=total?fmtTotalTime(total):'No time logged'}
    if(dom['time-focus-btn'])dom['time-focus-btn'].textContent=focus.taskId===id?'⏹ Stop Focus':'🎯 Start Focus';
    setMarkdownMode('view');renderDescView(i);
    dom['panel-meta-time'].textContent=`Created ${timeAgo(i.date)} · Status changed ${timeAgo(i.statusChangedAt||i.date)}`;
    updateDueSmart(i.dueDate);updateStarBtn(i.starred);renderTags();renderSubs();renderDeps();renderActivity();
    panelEl.classList.add('open');
    if(currentView==='list')renderList();
}
function renderDescView(i) { if (dom['panel-desc-view']) dom['panel-desc-view'].innerHTML = renderMarkdown(i.description || ''); }
function setMarkdownMode(mode) {
    const view = dom['panel-desc-view'], edit = dom['panel-desc'], vBtn = dom['md-view-btn'], eBtn = dom['md-edit-btn'];
    if (!view || !edit) return;
    if (mode === 'edit') { view.style.display = 'none'; edit.style.display = ''; edit.focus(); vBtn?.classList.remove('active'); eBtn?.classList.add('active'); }
    else { view.style.display = ''; edit.style.display = 'none'; vBtn?.classList.add('active'); eBtn?.classList.remove('active'); }
}
function closePanel(){syncPanel();panelEl.classList.remove('open');selId=null;if(currentView==='list')renderList()}
function syncPanel() {
    if(!selId)return;const i=getI(selId);if(!i)return;
    const oldS=i.status,oldP=i.priority;
    i.title=dom['panel-title'].value.trim()||'Untitled';i.status=dom['edit-status'].value;i.priority=dom['edit-priority'].value;i.category=dom['edit-category'].value.trim()||'Task';
    i.assignee=dom['edit-assignee'].value.trim()||'Unassigned';i.dueDate=dom['edit-due-date'].value||null;i.description=dom['panel-desc'].value;
    if(dom['edit-recurrence'])i.recurrence=dom['edit-recurrence'].value||null;
    renderDescView(i);
    if(i.status!==oldS){i.statusChangedAt=new Date().toISOString();logActivity(selId,'Status',`${STATUS_LABEL[oldS]} → ${STATUS_LABEL[i.status]}`);if(i.status==='done')onTaskCompleted(i);}
    if(i.priority!==oldP)logActivity(selId,'Priority',`${oldP} → ${i.priority}`);
    dom['panel-badge'].textContent=i.category;dom['panel-status-strip'].style.background=COLOR[i.status];updateDueSmart(i.dueDate);persist();
}
function updateDueSmart(dateStr){const el=dom['due-smart'];if(!el)return;const{text,cls}=smartDue(dateStr);el.textContent=text;el.className='due-smart'+(cls?' '+cls:'')}
function updateStarBtn(s){const btn=dom['star-btn'];if(!btn)return;btn.textContent=s?'★':'☆';btn.classList.toggle('starred',!!s)}
function toggleStar(){const i=getI(selId);if(!i)return;i.starred=!i.starred;updateStarBtn(i.starred);persist()}
function delCurrent(){if(!selId)return;const i=getI(selId);if(i)deletedStack.push(structuredClone(i));issues=issues.filter(x=>x.id!==selId);closePanel();persist();toast('🗑️ Deleted','bad',true)}

// ═══════ TAGS ═══════
function renderTags(){const c=dom['tags-container'];c.innerHTML='';const i=getI(selId);if(!i)return;c.innerHTML=i.tags.map(tag=>`<div class="tag-pill"><span>${tag}</span><span class="tag-x" data-t="${tag}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></span></div>`).join('')}

// ═══════ SUBTASKS ═══════
function renderSubs(){const list=dom['subtask-list'],badge=dom['subtask-badge'];list.innerHTML='';const i=getI(selId);if(!i)return;const total=i.subtasks.length,done=i.subtasks.filter(s=>s.done).length;badge.textContent=total?`${done}/${total}`:''
    list.innerHTML=i.subtasks.map((s,idx)=>`<div class="subtask-item${s.done?' done':''}"><input type="checkbox" ${s.done?'checked':''} data-i="${idx}"><span class="subtask-text">${s.text}</span><span class="subtask-remove" data-i="${idx}"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></span></div>`).join('')}

// ═══════ DEPS ═══════
function renderDeps(){const list=dom['dep-list'];list.innerHTML='';const i=getI(selId);if(!i)return;i.dependencies=i.dependencies.filter(did=>issueMap.has(did));list.innerHTML=i.dependencies.map(did=>{const dep=getI(did);if(!dep)return'';return`<div class="dep-item"><span class="dep-title" data-id="${did}">#${dep.num} ${dep.title}</span><span class="dep-rm" data-d="${did}"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg></span></div>`}).join('');dom['dep-datalist'].innerHTML=issues.filter(x=>x.id!==selId&&!i.dependencies.includes(x.id)).map(x=>`<option value="${x.title}">`).join('')}

// ═══════ EXPORT/IMPORT ═══════
function exportJSON(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(issues,null,2)],{type:'application/json'}));a.download=`bubbletasker_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href);toast('📦 Exported JSON','ok')}
function exportCSV(){const h=['#','Title','Status','Priority','Category','Assignee','Tags','Due Date','Created'];const rows=issues.map(i=>[i.num,`"${i.title.replace(/"/g,'""')}"`,i.status,i.priority,i.category,i.assignee,`"${(i.tags||[]).join(', ')}"`,i.dueDate||'',i.date]);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([[h,...rows.map(r=>r.join(','))].join('\n')],{type:'text/csv'}));a.download=`bubbletasker_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);toast('📊 Exported CSV','ok')}
function importJSON(f){const r=new FileReader();r.onload=e=>{try{const d=JSON.parse(e.target.result);if(!Array.isArray(d))throw 0;if(confirm(`Import ${d.length} issues?`)){for(const x of d){x.subtasks=x.subtasks||[];x.dependencies=x.dependencies||[];x.dueDate=x.dueDate||null;x.statusChangedAt=x.statusChangedAt||x.date;x.starred=x.starred||false;x.history=x.history||[];if(!x.num){x.num=_nextNum++}if(issueMap.has(x.id))x.id=Date.now().toString()+Math.random().toString(36).slice(2,7);issues.push(x)}toast(`📥 Imported ${d.length}`,'ok');persist()}}catch{toast('Bad JSON file','bad')}};r.readAsText(f)}
function undoDelete(){if(!deletedStack.length){toast('Nothing to undo','info');return}issues.push(deletedStack.pop());toast('↩ Restored','ok');persist()}
function togglePresent(){isPresent=!isPresent;document.body.classList.toggle('present-mode',isPresent);W=svgBox.clientWidth;H=svgBox.clientHeight;if(sim)sim.alpha(.3).restart();toast(isPresent?'🎯 Present Mode — F to exit':'Exited','info')}

// ═══════════════════════════════════════════════════════
//  EXTRAS — Confetti, Sound, Focus Timer, Notifications,
//  Voice, Templates, Streaks, Heatmap, Accent Color
// ═══════════════════════════════════════════════════════

// ──── CONFETTI ────
function burstConfetti() {
    const cv = document.createElement('canvas');
    cv.width = innerWidth; cv.height = innerHeight;
    cv.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#10b981','#f59e0b','#3b82f6','#ec4899','#a78bfa','#fbbf24'];
    const N = 80;
    const cx = innerWidth/2, cy = innerHeight*0.45;
    const parts = Array.from({length:N}, () => {
        const ang = Math.random()*Math.PI*2, sp = 4 + Math.random()*8;
        return { x:cx, y:cy, vx:Math.cos(ang)*sp, vy:Math.sin(ang)*sp - 4, g:0.18, r:3+Math.random()*4, c:colors[(Math.random()*colors.length)|0], a:1, rot:Math.random()*Math.PI };
    });
    let frames = 0;
    function step() {
        frames++; ctx.clearRect(0,0,cv.width,cv.height);
        for (const p of parts) {
            p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += 0.1; p.a *= 0.985;
            ctx.save(); ctx.globalAlpha = p.a; ctx.translate(p.x,p.y); ctx.rotate(p.rot);
            ctx.fillStyle = p.c; ctx.fillRect(-p.r, -p.r/2, p.r*2, p.r);
            ctx.restore();
        }
        if (frames < 110) requestAnimationFrame(step);
        else cv.remove();
    }
    requestAnimationFrame(step);
}

// ──── SOUND (synthesized, no asset file) ────
let _audioCtx = null;
function audio() { if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); return _audioCtx; }
function playTone(freq, dur=0.15, type='sine', vol=0.06) {
    try {
        const ac = audio(), o = ac.createOscillator(), g = ac.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + dur);
    } catch(e){}
}
function playDing() { playTone(880, 0.08); setTimeout(() => playTone(1175, 0.16), 70); }
function playTick() { playTone(660, 0.05, 'square', 0.03); }

// ──── FOCUS TIMER (Pomodoro) ────
const focus = { taskId:null, phase:'idle', remaining:0, intervalId:null, sessionStart:null, mode:'work', cycle:1 };
const FOCUS_WORK = 25*60, FOCUS_BREAK = 5*60;
function startFocus(taskId) {
    if (focus.intervalId) stopFocus(false);
    focus.taskId = taskId; focus.phase = 'work'; focus.mode = 'work';
    focus.remaining = FOCUS_WORK; focus.sessionStart = Date.now();
    renderFocus();
    focus.intervalId = setInterval(focusTick, 1000);
    document.body.classList.add('focus-active');
    const t = getI(taskId); if (t) toast(`🎯 Focus on "${t.title}"`, 'info');
}
function focusTick() {
    focus.remaining--;
    if (focus.remaining <= 0) {
        if (focus.mode === 'work') {
            const dur = Math.round((Date.now() - focus.sessionStart) / 1000);
            const t = getI(focus.taskId);
            if (t) { t.timeEntries = t.timeEntries || []; t.timeEntries.push({ start: new Date(focus.sessionStart).toISOString(), seconds: dur }); persist(); }
            playDing();
            if (Notification && Notification.permission === 'granted') new Notification('Focus complete', { body:'Take a 5-min break ☕', silent:false });
            focus.mode = 'break'; focus.remaining = FOCUS_BREAK; focus.sessionStart = Date.now();
        } else {
            playDing();
            if (Notification && Notification.permission === 'granted') new Notification('Break over', { body:'Back to focus 🎯', silent:false });
            focus.mode = 'work'; focus.remaining = FOCUS_WORK; focus.sessionStart = Date.now(); focus.cycle++;
        }
    }
    renderFocus();
}
function stopFocus(toastOn = true) {
    if (focus.mode === 'work' && focus.sessionStart) {
        const dur = Math.round((Date.now() - focus.sessionStart) / 1000);
        if (dur > 30) {
            const t = getI(focus.taskId);
            if (t) { t.timeEntries = t.timeEntries || []; t.timeEntries.push({ start: new Date(focus.sessionStart).toISOString(), seconds: dur }); persist(); }
        }
    }
    clearInterval(focus.intervalId); focus.intervalId = null;
    focus.taskId = null; focus.phase = 'idle';
    document.body.classList.remove('focus-active');
    renderFocus();
    if (toastOn) toast('Focus ended', 'info');
}
function renderFocus() {
    let bar = $('focus-bar');
    if (!bar) {
        bar = document.createElement('div');
        bar.id = 'focus-bar'; bar.className = 'focus-bar';
        document.body.appendChild(bar);
    }
    if (focus.phase === 'idle') { bar.classList.remove('visible'); bar.innerHTML = ''; nodeLayer && nodeLayer.selectAll('.card').classed('focus-target', false); return; }
    const t = getI(focus.taskId);
    const mm = String(Math.floor(focus.remaining/60)).padStart(2,'0');
    const ss = String(focus.remaining%60).padStart(2,'0');
    const isBreak = focus.mode === 'break';
    bar.innerHTML = `<div class="fb-mode ${isBreak?'break':'work'}">${isBreak?'☕ Break':'🎯 Focus'}</div><div class="fb-time">${mm}:${ss}</div><div class="fb-task" title="${t?t.title:''}">${t?t.title.slice(0,40):'Task removed'}</div><button class="fb-stop" id="fb-stop-btn">✕</button>`;
    bar.classList.add('visible');
    $('fb-stop-btn').onclick = () => stopFocus();
    if (nodeLayer) nodeLayer.selectAll('.card').classed('focus-target', d => d.id === focus.taskId);
}
function fmtTotalTime(secs) {
    if (!secs) return '';
    const h = Math.floor(secs/3600), m = Math.floor((secs%3600)/60);
    return h ? `${h}h ${m}m` : `${m}m`;
}

// ──── BROWSER NOTIFICATIONS ────
async function enableNotifications() {
    if (!('Notification' in window)) { toast('Notifications not supported', 'bad'); return; }
    const perm = await Notification.requestPermission();
    settings.notifications = perm === 'granted'; saveSettings();
    if (perm === 'granted') { toast('🔔 Notifications enabled', 'ok'); scheduleNotifications(); }
    else toast('Notifications blocked', 'info');
}
let _notifyShown = new Set();
function scheduleNotifications() {
    if (!settings.notifications || Notification.permission !== 'granted') return;
    const today = todayStr();
    for (const i of issues) {
        if (i.status === 'done' || !i.dueDate) continue;
        if (i.dueDate <= today && !_notifyShown.has(i.id)) {
            _notifyShown.add(i.id);
            const overdue = i.dueDate < today;
            new Notification(overdue ? 'Overdue' : 'Due today', { body: `#${i.num} ${i.title}`, tag: 'bt-' + i.id });
        }
    }
}

// ──── VOICE INPUT ────
let _recog = null;
function voiceInput(targetInputId) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('Voice not supported in this browser', 'bad'); return; }
    if (_recog) { try { _recog.stop(); } catch(e){} _recog = null; document.body.classList.remove('voice-active'); return; }
    _recog = new SR();
    _recog.lang = 'en-US'; _recog.interimResults = false; _recog.maxAlternatives = 1;
    document.body.classList.add('voice-active');
    _recog.onresult = e => { const txt = e.results[0][0].transcript; const inp = $(targetInputId); if (inp) { inp.value = (inp.value ? inp.value + ' ' : '') + txt; inp.focus(); } };
    _recog.onend = () => { _recog = null; document.body.classList.remove('voice-active'); };
    _recog.onerror = () => { _recog = null; document.body.classList.remove('voice-active'); toast('Voice input failed', 'bad'); };
    _recog.start();
}

// ──── TEMPLATES ────
function saveAsTemplate(id) {
    const i = getI(id); if (!i) return;
    const name = prompt('Template name:', i.title);
    if (!name) return;
    templates.push({
        id: 't'+Date.now(), name,
        title: i.title, priority: i.priority, category: i.category,
        tags: [...(i.tags||[])], assignee: i.assignee,
        subtasks: (i.subtasks||[]).map(s => ({ text: s.text, done: false })),
        recurrence: i.recurrence || null,
        description: i.description || ''
    });
    saveTemplates(); toast(`💾 Template "${name}" saved`, 'ok');
}
function spawnFromTemplate(tid) {
    const t = templates.find(x => x.id === tid); if (!t) return;
    const now = new Date().toISOString();
    const id = Date.now().toString(), num = _nextNum++;
    issues.push({
        id, num, title: t.title, description: t.description || '',
        status: 'open', priority: t.priority || 'medium',
        category: t.category || 'Task', tags: [...(t.tags||[])],
        assignee: t.assignee || 'Unassigned', date: now,
        dueDate: null, subtasks: (t.subtasks||[]).map(s => ({ ...s, done: false })),
        dependencies: [], starred: false, recurrence: t.recurrence || null,
        timeEntries: [], snoozedUntil: null,
        history: [{ action:'Created', detail:`from template "${t.name}"`, at: now }],
        statusChangedAt: now
    });
    persist(); toast(`✨ "${t.name}" added`, 'ok');
}
function deleteTemplate(tid) {
    templates = templates.filter(t => t.id !== tid);
    saveTemplates();
}

// ──── STREAKS ────
function getCompletedDays() {
    const set = new Set();
    for (const i of issues) {
        if (!i.history) continue;
        for (const h of i.history) {
            if (h.action === 'Status' && /→ Done/.test(h.detail)) set.add(h.at.slice(0,10));
        }
    }
    return set;
}
function getStreak() {
    const days = getCompletedDays();
    if (!days.size) return 0;
    let streak = 0;
    const d = new Date(); d.setHours(0,0,0,0);
    // If today has no completions, allow streak to start from yesterday
    if (!days.has(d.toISOString().slice(0,10))) d.setDate(d.getDate() - 1);
    while (days.has(d.toISOString().slice(0,10))) {
        streak++; d.setDate(d.getDate() - 1);
    }
    return streak;
}

// ──── MARKDOWN (lightweight, safe-ish) ────
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function renderMarkdown(text) {
    if (!text) return '<p class="md-empty">No description.</p>';
    let s = escapeHtml(text);
    // Code blocks ``` ```
    s = s.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
    // Inline code `…`
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    // Bold **…**
    s = s.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    // Italic *…*
    s = s.replace(/(?<![*\w])\*([^*\n]+)\*(?!\w)/g, '<em>$1</em>');
    // Strikethrough ~~…~~
    s = s.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
    // Links [text](url)
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    // Auto-link bare URLs
    s = s.replace(/(?<!["'>])(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    // Headings ###/##/#
    s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    // Bulleted lists
    s = s.replace(/(?:^|\n)([-•*] .+(?:\n[-•*] .+)*)/g, m => {
        const items = m.trim().split('\n').map(l => `<li>${l.replace(/^[-•*]\s+/, '')}</li>`).join('');
        return `\n<ul>${items}</ul>`;
    });
    // Numbered lists
    s = s.replace(/(?:^|\n)(\d+\. .+(?:\n\d+\. .+)*)/g, m => {
        const items = m.trim().split('\n').map(l => `<li>${l.replace(/^\d+\.\s+/, '')}</li>`).join('');
        return `\n<ol>${items}</ol>`;
    });
    // Paragraphs (split on blank lines)
    s = s.split(/\n{2,}/).map(p => /^<(h\d|ul|ol|pre)/.test(p.trim()) ? p : `<p>${p.replace(/\n/g,'<br>')}</p>`).join('');
    return s;
}

// ──── DAILY REVIEW ────
function getDailyReview() {
    const today = new Date(); today.setHours(0,0,0,0);
    const yest = new Date(today); yest.setDate(yest.getDate() - 1);
    const tStr = today.toISOString().slice(0,10);
    const yStr = yest.toISOString().slice(0,10);
    const completedYesterday = [], completedToday = [];
    const overdue = [], dueToday = [], dueSoon = [];
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
    for (const i of issues) {
        if (i.status === 'done' && i.statusChangedAt) {
            const dStr = i.statusChangedAt.slice(0,10);
            if (dStr === yStr) completedYesterday.push(i);
            else if (dStr === tStr) completedToday.push(i);
        }
        if (i.status !== 'done' && i.dueDate) {
            const dd = new Date(i.dueDate + 'T00:00:00');
            if (dd < today) overdue.push(i);
            else if (i.dueDate === tStr) dueToday.push(i);
            else if (dd <= weekEnd) dueSoon.push(i);
        }
    }
    return { completedYesterday, completedToday, overdue, dueToday, dueSoon, streak: getStreak() };
}
function openDailyReview() {
    const r = getDailyReview();
    const greet = (() => {
        const h = new Date().getHours();
        if (h < 5) return 'Late night';
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        if (h < 22) return 'Good evening';
        return 'Late night';
    })();
    const renderList = (list, emptyMsg) => list.length
        ? `<ul class="dr-list">${list.map(i => {
            const sd = i.dueDate ? smartDue(i.dueDate) : null;
            return `<li class="dr-item" data-id="${i.id}"><span class="dot ${i.status==='done'?'dot-done':i.status==='in_progress'?'dot-active':'dot-open'}"></span><span class="dr-item-title">${i.starred?'<span class="dr-star">★</span>':''}${escapeHtml(i.title)}</span>${sd && sd.cls ? `<span class="dr-due ${sd.cls}">${sd.text}</span>` : ''}</li>`;
        }).join('')}</ul>`
        : `<p class="dr-empty">${emptyMsg}</p>`;
    const modal = $('daily-review');
    modal.querySelector('.dr-body').innerHTML = `
        <div class="dr-greeting">
            <div class="dr-hello">${greet}.</div>
            <div class="dr-sub">${r.dueToday.length || r.overdue.length ? `${r.overdue.length + r.dueToday.length} task${r.overdue.length+r.dueToday.length!==1?'s':''} need attention today.` : 'You\'re all caught up — enjoy the day.'}</div>
        </div>
        <div class="dr-tiles">
            <div class="dr-tile dr-tile-streak"><div class="dr-tile-num">${r.streak}</div><div class="dr-tile-lbl">${r.streak===1?'day':'days'}<br>streak</div></div>
            <div class="dr-tile"><div class="dr-tile-num">${r.completedToday.length}</div><div class="dr-tile-lbl">done<br>today</div></div>
            <div class="dr-tile dr-tile-warn ${r.overdue.length?'has':''}"><div class="dr-tile-num">${r.overdue.length}</div><div class="dr-tile-lbl">over<br>due</div></div>
            <div class="dr-tile"><div class="dr-tile-num">${r.dueSoon.length+r.dueToday.length}</div><div class="dr-tile-lbl">this<br>week</div></div>
        </div>
        ${r.overdue.length?`<div class="dr-section dr-overdue"><h3>🔴 Overdue (${r.overdue.length})</h3>${renderList(r.overdue, '')}</div>`:''}
        <div class="dr-section"><h3>📅 Today (${r.dueToday.length})</h3>${renderList(r.dueToday, 'No deadlines today. Use the time well.')}</div>
        <div class="dr-section"><h3>📆 This week (${r.dueSoon.length})</h3>${renderList(r.dueSoon, 'Calendar is clear.')}</div>
        ${r.completedToday.length?`<div class="dr-section"><h3>✅ Completed today (${r.completedToday.length})</h3>${renderList(r.completedToday, '')}</div>`:''}
        ${r.completedYesterday.length?`<div class="dr-section dr-muted"><h3>🌙 Yesterday's wins (${r.completedYesterday.length})</h3>${renderList(r.completedYesterday, '')}</div>`:''}`;
    modal.classList.add('active');
    settings.lastReviewDate = todayStr(); saveSettings();
    modal.querySelectorAll('.dr-item').forEach(el => el.addEventListener('click', () => {
        modal.classList.remove('active'); openPanel(el.dataset.id);
    }));
}
function closeDailyReview() { $('daily-review').classList.remove('active'); }

// ──── ACTIVITY HEATMAP ────
const _MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function renderHeatmap(container) {
    const counts = {};
    for (const i of issues) {
        if (!i.history) continue;
        for (const h of i.history) {
            if (h.action === 'Status' && /→ Done/.test(h.detail)) {
                const d = h.at.slice(0,10);
                counts[d] = (counts[d]||0) + 1;
            }
        }
    }
    const today = new Date(); today.setHours(0,0,0,0);
    const WEEKS = 14;
    const start = new Date(today); start.setDate(start.getDate() - (WEEKS*7 - 1));
    while (start.getDay() !== 0) start.setDate(start.getDate() - 1);

    // Build per-week columns (each column is 7 cells Sun..Sat)
    const weeks = [];
    let max = 1;
    for (let w = 0; w < WEEKS; w++) {
        const col = [];
        let monthLabel = '';
        for (let dow = 0; dow < 7; dow++) {
            const d = new Date(start); d.setDate(d.getDate() + w*7 + dow);
            const key = d.toISOString().slice(0,10);
            const c = counts[key] || 0;
            if (c > max) max = c;
            col.push({ key, c, dow, date: d, future: d > today });
            // First Sunday of a new month gets the column label
            if (dow === 0 && d.getDate() <= 7) monthLabel = _MONTH_ABBR[d.getMonth()];
        }
        weeks.push({ col, monthLabel });
    }
    const total = Object.values(counts).reduce((a,b)=>a+b,0);
    const dayLbls = ['Mon','Wed','Fri']; // sparse Sun-based grid: row 1, 3, 5

    const html = `
        <div class="hm-summary"><b>${total}</b> completed in the last ${WEEKS} weeks · <b>${getStreak()}</b>-day streak</div>
        <div class="hm-frame">
            <div class="hm-day-col">${[0,1,2,3,4,5,6].map(i => `<div class="hm-day-lbl">${i===1?'Mon':i===3?'Wed':i===5?'Fri':''}</div>`).join('')}</div>
            <div class="hm-main">
                <div class="hm-month-row">${weeks.map(w => `<div class="hm-month-cell">${w.monthLabel}</div>`).join('')}</div>
                <div class="hm-cols">${weeks.map(w => `<div class="hm-col">${w.col.map(cell => {
                    const lvl = cell.c === 0 ? 0 : Math.min(4, Math.ceil((cell.c / max) * 4));
                    const dateStr = cell.date.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
                    return `<div class="hm-cell hm-l${lvl}${cell.future ? ' hm-future' : ''}" title="${dateStr} — ${cell.c} done"></div>`;
                }).join('')}</div>`).join('')}</div>
            </div>
        </div>
        <div class="hm-legend"><span>Less</span><span class="hm-cell hm-l0"></span><span class="hm-cell hm-l1"></span><span class="hm-cell hm-l2"></span><span class="hm-cell hm-l3"></span><span class="hm-cell hm-l4"></span><span>More</span></div>`;
    container.innerHTML = html;
}

// ──── ACCENT COLOR ────
function applyAccent(hex) {
    settings.accent = hex; saveSettings();
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    // derive hover (lighter) and glow
    root.style.setProperty('--accent-h', shadeHex(hex, 12));
    const rgb = hexToRgb(hex);
    root.style.setProperty('--accent-glow', `rgba(${rgb.r},${rgb.g},${rgb.b},0.18)`);
}
function hexToRgb(h) { const n = parseInt(h.slice(1),16); return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 }; }
function shadeHex(h, amt) {
    const {r,g,b} = hexToRgb(h);
    const cl = v => Math.max(0, Math.min(255, v + amt));
    return '#' + [cl(r),cl(g),cl(b)].map(v => v.toString(16).padStart(2,'0')).join('');
}

// ═══════ DATA MANAGER ═══════
function openDataManager() { renderDataManager(); dmEl.classList.add('active'); }
function closeDataManager() { dmEl.classList.remove('active'); }

function renderDataManager() {
    const demoCount = issues.filter(i => MOCK_IDS.has(i.id)).length;
    const el = $('dm-demo-count');
    if (el) el.textContent = demoCount;
    const reloadBtn = $('dm-reload-btn');
    if (reloadBtn) reloadBtn.textContent = demoCount ? 'Refresh Samples' : 'Load Samples';

    const cats = [...new Set(issues.map(i => i.category))].sort();
    const asns = [...new Set(issues.map(i => i.assignee))].sort();
    const catSel = $('dm-del-category');
    const asnSel = $('dm-del-assignee');
    if (catSel) catSel.innerHTML = '<option value="">Pick…</option>' + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    if (asnSel) asnSel.innerHTML = '<option value="">Pick…</option>' + asns.map(a => `<option value="${a}">${a}</option>`).join('');

    ['status','category','priority','assignee'].forEach(f => {
        const m = $('dm-match-' + f), b = $('dm-go-' + f), s = $('dm-del-' + f);
        if (m) { m.textContent = ''; m.className = 'dm-match'; }
        if (b) b.disabled = true;
        if (s) s.value = '';
    });
}

function dmUpdateMatch(field) {
    const sel = $('dm-del-' + field), m = $('dm-match-' + field), b = $('dm-go-' + field);
    if (!sel || !m || !b) return;
    const val = sel.value;
    if (!val) { m.textContent = ''; m.className = 'dm-match'; b.disabled = true; return; }
    const count = issues.filter(i => i[field] === val).length;
    m.textContent = count + ' issue' + (count !== 1 ? 's' : '');
    m.className = 'dm-match' + (count > 0 ? ' has-matches' : '');
    b.disabled = count === 0;
}

function dmDeleteBy(field) {
    const sel = $('dm-del-' + field);
    if (!sel || !sel.value) return;
    const val = sel.value;
    const matching = issues.filter(i => i[field] === val);
    if (!matching.length) return;
    const label = field === 'status' ? (STATUS_LABEL[val] || val) : val;
    if (!confirm(`Delete ${matching.length} issue${matching.length !== 1 ? 's' : ''} where ${field} is "${label}"?`)) return;
    for (const r of matching) deletedStack.push(structuredClone(r));
    issues = issues.filter(i => i[field] !== val);
    closePanel(); persist(); renderDataManager();
    toast(`🗑️ Deleted ${matching.length} issue${matching.length !== 1 ? 's' : ''}`, 'bad', true);
}

function loadSampleData() {
    issues = issues.filter(i => !MOCK_IDS.has(i.id));
    const fresh = structuredClone(MOCKS);
    for (const m of fresh) { m.subtasks=m.subtasks||[]; m.dependencies=m.dependencies||[]; m.dueDate=m.dueDate||null; m.starred=m.starred||false; m.history=m.history||[]; }
    issues.push(...fresh);
    _nextNum = Math.max(_nextNum, ...issues.map(i => (i.num || 0) + 1));
    closePanel(); persist(); renderDataManager();
    toast('✨ Loaded 15 sample issues', 'ok');
}

function dmClearDemo() {
    const count = issues.filter(i => MOCK_IDS.has(i.id)).length;
    if (!count) { toast('No sample data to clear', 'info'); return; }
    if (!confirm(`Remove ${count} sample issue${count !== 1 ? 's' : ''}?`)) return;
    const removed = issues.filter(i => MOCK_IDS.has(i.id));
    for (const r of removed) deletedStack.push(structuredClone(r));
    issues = issues.filter(i => !MOCK_IDS.has(i.id));
    closePanel(); persist(); renderDataManager();
    toast(`🧹 Cleared ${count} sample${count !== 1 ? 's' : ''}`, 'info', true);
}

function dmWipeAll() {
    if (!issues.length) { toast('Canvas is already empty', 'info'); return; }
    if (!confirm(`Permanently delete all ${issues.length} issues? This can be undone.`)) return;
    for (const i of issues) deletedStack.push(structuredClone(i));
    issues = [];
    closePanel(); persist(); renderDataManager();
    toast('💥 Canvas wiped', 'bad', true);
}

// ═══════ COMMAND PALETTE ═══════
function openCmd(){cmdOpen=true;cmdEl.classList.add('active');dom['cmd-input'].value='';dom['cmd-input'].focus();populateCmd('')}
function closeCmd(){cmdOpen=false;cmdEl.classList.remove('active')}
function populateCmd(q) {
    const box=dom['cmd-results'],ql=q.toLowerCase().trim();cmdList=[];cmdIdx=0;
    const actions=[
        {icon:'➕',t:'New Issue',s:'Create a card',fn:()=>{closeCmd();modalEl.classList.add('active');setTimeout(()=>dom['issue-title'].focus(),100)}},
        {icon:'🔲',t:'Canvas View',s:'Physics cards',fn:()=>{closeCmd();setView('canvas')}},
        {icon:'📋',t:'List View',s:'Sortable table',fn:()=>{closeCmd();setView('list')}},
        {icon:'📊',t:'Board View',s:'Kanban columns',fn:()=>{closeCmd();setView('kanban')}},
        {icon:'📅',t:'Calendar View',s:'Monthly schedule',fn:()=>{closeCmd();setView('calendar')}},
        {icon:'🌙',t:'Toggle Theme',s:'Dark / Light',fn:()=>{closeCmd();applyTheme(currentTheme==='dark'?'light':'dark')}},
        {icon:'📦',t:'Export JSON',s:'Download backup',fn:()=>{closeCmd();exportJSON()}},
        {icon:'📊',t:'Export CSV',s:'Spreadsheet',fn:()=>{closeCmd();exportCSV()}},
        {icon:'📥',t:'Import JSON',s:'Load file',fn:()=>{closeCmd();dom['import-file'].click()}},
        {icon:'🎯',t:'Present Mode',s:'Zen fullscreen',fn:()=>{closeCmd();togglePresent()}},
        {icon:'⊞',t:'Zoom to Fit',s:'Show all cards',fn:()=>{closeCmd();zoomToFit()}},
        {icon:'🔄',t:'Reset Zoom',s:'Center canvas',fn:()=>{closeCmd();svg.transition().duration(500).call(zoomB.transform,d3.zoomIdentity)}},
        {icon:'↩',t:'Undo Delete',s:'Restore last',fn:()=>{closeCmd();undoDelete()}},
        {icon:'🗃️',t:'Data Manager',s:'Samples & cleanup',fn:()=>{closeCmd();openDataManager()}},
        {icon:'✨',t:'Load Sample Data',s:'15 demo issues',fn:()=>{closeCmd();loadSampleData()}},
        {icon:'🧹',t:'Clear Samples',s:'Remove demo issues',fn:()=>{closeCmd();dmClearDemo()}},
        {icon:'☀️',t:'Daily Review',s:"Today's plan + streak",fn:()=>{closeCmd();openDailyReview()}},
        {icon:'📈',t:'Activity & Heatmap',s:'12-week completion grid',fn:()=>{closeCmd();openStats()}},
        {icon:'📦',t:'Templates',s:'Reusable presets',fn:()=>{closeCmd();openTemplates()}},
        {icon:'⚙️',t:'Settings',s:'Accent, sound, notifications',fn:()=>{closeCmd();openSettings()}},
        {icon:'🔔',t:'Enable Notifications',s:'Browser reminders for due tasks',fn:()=>{closeCmd();enableNotifications()}},
        {icon:'🎯',t:'Start/Stop Focus',s:'25-min Pomodoro on selected task',fn:()=>{closeCmd();const tid=hovId||selId;if(tid){if(focus.taskId===tid)stopFocus();else startFocus(tid)}else toast('Select a task first','info')}},
    ];
    const mA=actions.filter(a=>!ql||a.t.toLowerCase().includes(ql)||a.s.toLowerCase().includes(ql));
    const mI=issues.filter(i=>!ql||i.title.toLowerCase().includes(ql)||i.tags.some(t=>t.toLowerCase().includes(ql))||i.category.toLowerCase().includes(ql)||('#'+i.num).includes(ql)).slice(0,8).map(i=>({t:`#${i.num} ${i.title}`,s:`${STATUS_LABEL[i.status]} · ${i.priority} · ${i.assignee}`,fn:()=>{closeCmd();openPanel(i.id)},status:i.status}));
    cmdList=[...mA.map(a=>({...a,type:'action'})),...mI.map(i=>({...i,type:'issue'}))];
    const p=[];
    if(mA.length){p.push('<div class="cmd-section">Actions</div>');mA.forEach((_,i)=>{const r=cmdList[i];p.push(`<div class="cmd-result${i===cmdIdx?' active':''}" data-i="${i}"><span class="cmd-result-icon">${r.icon}</span><div class="cmd-result-info"><div class="cmd-result-title">${r.t}</div><div class="cmd-result-sub">${r.s}</div></div></div>`)})}
    if(mI.length){p.push('<div class="cmd-section">Issues</div>');mI.forEach((_,j)=>{const idx=mA.length+j,r=cmdList[idx];const dot=r.status==='open'?'dot-open':r.status==='in_progress'?'dot-active':'dot-done';p.push(`<div class="cmd-result${idx===cmdIdx?' active':''}" data-i="${idx}"><span class="cmd-result-icon"><span class="dot ${dot}" style="width:8px;height:8px"></span></span><div class="cmd-result-info"><div class="cmd-result-title">${r.t}</div><div class="cmd-result-sub">${r.s}</div></div></div>`)})}
    if(!cmdList.length)p.push('<div class="cmd-no-results">No results</div>');
    box.innerHTML=p.join('');
}
function cmdNav(dir){cmdIdx=Math.max(0,Math.min(cmdList.length-1,cmdIdx+dir));dom['cmd-results'].querySelectorAll('.cmd-result').forEach((el,i)=>el.classList.toggle('active',i===cmdIdx))}
function cmdRun(){if(cmdList[cmdIdx])cmdList[cmdIdx].fn()}
function openShortcuts(){$('shortcuts-modal').classList.add('active')}
function closeShortcuts(){$('shortcuts-modal').classList.remove('active')}

// ═══════ WIRING ═══════
function wire() {
    const filterMap={'filter-status':v=>fStatus=v,'filter-priority':v=>fPriority=v,'filter-category':v=>fCategory=v,'filter-assignee':v=>fAssignee=v,'group-by':v=>groupBy=v};
    const statEls=document.querySelectorAll('.stat-summary.clickable');
    const syncStatH=()=>statEls.forEach(s=>s.classList.toggle('active',s.dataset.status===fStatus));
    for(const id of Object.keys(filterMap)){dom[id].addEventListener('change',e=>{filterMap[id](e.target.value);invalidateFilterCache();activeQF=null;document.querySelectorAll('.qf-btn,.qf-pill').forEach(b=>b.classList.remove('active'));syncStatH();persist()})}
    statEls.forEach(s=>{s.addEventListener('click',()=>{const v=s.dataset.status;fStatus=fStatus===v?'all':v;invalidateFilterCache();dom['filter-status'].value=fStatus;activeQF=null;document.querySelectorAll('.qf-btn,.qf-pill').forEach(b=>b.classList.remove('active'));syncStatH();persist()})});

    // Search
    let sT=null;
    dom['search-input'].addEventListener('input',e=>{const v=e.target.value;dom['clear-search'].style.display=v?'block':'none';dom['search-kbd'].style.display=v?'none':'';clearTimeout(sT);sT=setTimeout(()=>{searchQ=v;invalidateFilterCache();activeQF=null;document.querySelectorAll('.qf-btn,.qf-pill').forEach(b=>b.classList.remove('active'));persist()},120)});
    dom['clear-search'].addEventListener('click',()=>{dom['search-input'].value='';searchQ='';invalidateFilterCache();dom['clear-search'].style.display='none';dom['search-kbd'].style.display='';persist()});

    // Quick filter buttons (sidebar) + pills (top of canvas)
    document.querySelectorAll('.qf-btn,.qf-pill').forEach(b=>{b.addEventListener('click',()=>applyQuickFilter(b.dataset.qf))});

    // Floating Action Button
    const fab = $('fab-add');
    if (fab) fab.addEventListener('click', () => { modalEl.classList.add('active'); setTimeout(() => dom['issue-title'].focus(), 100); });

    // Empty-state quick-start chips
    document.querySelectorAll('.qs-chip').forEach(b => b.addEventListener('click', () => {
        const cat = b.dataset.cat, emoji = b.dataset.emoji;
        const now = new Date().toISOString();
        const num = _nextNum++, id = Date.now().toString();
        issues.push({
            id, num, title: `${emoji} First ${cat.toLowerCase()} task`, description: '',
            status: 'open', priority: 'medium', category: cat, tags: [],
            assignee: 'Unassigned', date: now, dueDate: null,
            subtasks: [], dependencies: [], starred: false,
            recurrence: null, timeEntries: [], snoozedUntil: null,
            history: [{ action:'Created', detail:'', at: now }],
            statusChangedAt: now
        });
        persist();
        setTimeout(() => openPanel(id), 200);
    }));

    // First-run hint banner — show once, dismiss persists
    const hintEl = $('hint-banner');
    if (hintEl && !localStorage.getItem('btHintDismissed')) {
        hintEl.style.display = '';
        const dismiss = () => { hintEl.style.display = 'none'; localStorage.setItem('btHintDismissed', '1'); };
        $('hint-dismiss').addEventListener('click', dismiss);
        // Auto-dismiss after 30s
        setTimeout(() => { if (hintEl.style.display !== 'none') dismiss(); }, 30000);
    }

    // View switcher
    document.querySelectorAll('.view-btn').forEach(b=>{b.addEventListener('click',()=>setView(b.dataset.view))});

    // Theme toggle
    dom['theme-toggle'].addEventListener('click',()=>applyTheme(currentTheme==='dark'?'light':'dark'));

    // List view sorting
    document.querySelectorAll('.list-table th.sortable').forEach(th=>{th.addEventListener('click',()=>{const col=th.dataset.sort;if(listSort.col===col)listSort.dir*=-1;else{listSort.col=col;listSort.dir=1}document.querySelectorAll('.list-table th').forEach(h=>h.classList.remove('sorted'));th.classList.add('sorted');renderList()})});
    dom['list-body'].addEventListener('click',e=>{const row=e.target.closest('.list-row');if(row)openPanel(row.dataset.id)});

    // Calendar navigation
    $('cal-prev').addEventListener('click',()=>{calMonth--;if(calMonth<0){calMonth=11;calYear--}renderCalendar()});
    $('cal-next').addEventListener('click',()=>{calMonth++;if(calMonth>11){calMonth=0;calYear++}renderCalendar()});
    $('cal-today').addEventListener('click',()=>{const n=new Date();calYear=n.getFullYear();calMonth=n.getMonth();renderCalendar()});
    // Calendar clicks (event delegation)
    dom['cal-body'].addEventListener('click',e=>{const chip=e.target.closest('.cal-chip');if(chip)openPanel(chip.dataset.id)});
    dom['cal-unscheduled'].addEventListener('click',e=>{const chip=e.target.closest('.cal-unsched-chip');if(chip)openPanel(chip.dataset.id)});

    // Kanban drag-and-drop
    ['kanban-open','kanban-progress','kanban-done'].forEach(id=>{
        const container=dom[id], status=container.parentElement.dataset.status;
        container.addEventListener('dragstart',e=>{const card=e.target.closest('.kanban-card');if(!card)return;e.dataTransfer.setData('text/plain',card.dataset.id);e.dataTransfer.effectAllowed='move';setTimeout(()=>card.classList.add('dragging'),0)});
        container.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move';container.classList.add('drag-over')});
        container.addEventListener('dragleave',e=>{if(!container.contains(e.relatedTarget))container.classList.remove('drag-over')});
        container.addEventListener('drop',e=>{e.preventDefault();container.classList.remove('drag-over');const issueId=e.dataTransfer.getData('text/plain');const issue=getI(issueId);if(issue&&issue.status!==status){logActivity(issueId,'Status',`${STATUS_LABEL[issue.status]} → ${STATUS_LABEL[status]}`);issue.status=status;issue.statusChangedAt=new Date().toISOString();if(status==='done')onTaskCompleted(issue);persist()}});
        container.addEventListener('dragend',e=>{container.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'))});
    });
    $('kanban-view').addEventListener('click',e=>{const card=e.target.closest('.kanban-card');if(card)openPanel(card.dataset.id)});

    // Modal
    $('add-issue-btn').addEventListener('click',()=>modalEl.classList.add('active'));
    $('close-modal-btn').addEventListener('click',()=>modalEl.classList.remove('active'));
    modalEl.addEventListener('click',e=>{if(e.target===modalEl)modalEl.classList.remove('active')});
    formEl.addEventListener('submit',e=>{
        e.preventDefault();
        const rawTitle = dom['issue-title'].value;
        const parsed = parseSmartInput(rawTitle);
        const explicitDue = dom['issue-due-date'].value || null;
        const explicitCat = dom['issue-category'].value.trim();
        const explicitPri = dom['issue-priority'].value;
        const tags = dom['issue-tags'].value.split(',').map(t => t.trim()).filter(Boolean);
        const num = _nextNum++, id = Date.now().toString(), now = new Date().toISOString();
        issues.push({
            id, num,
            title: parsed.title || 'Untitled',
            description: '',
            status: 'open',
            priority: explicitPri && explicitPri !== 'medium' ? explicitPri : (parsed.priority || explicitPri || 'medium'),
            category: explicitCat || parsed.category || 'Task',
            tags,
            assignee: dom['issue-assignee'].value.trim() || 'Unassigned',
            date: now,
            dueDate: explicitDue || parsed.dueDate || null,
            subtasks: [], dependencies: [],
            recurrence: 'none', timeEntries: [], snoozedUntil: null,
            starred: parsed.starred,
            history: [{ action:'Created', detail:'', at: now }],
            statusChangedAt: now
        });
        modalEl.classList.remove('active');
        formEl.reset();
        const hints = [];
        if (parsed.dueDate) hints.push(smartDue(parsed.dueDate).text.toLowerCase());
        if (parsed.priority) hints.push(parsed.priority);
        if (parsed.category) hints.push('#' + parsed.category.toLowerCase());
        toast(`✨ #${num} Created${hints.length ? ' · ' + hints.join(' · ') : ''}`, 'ok');
        persist();
    });

    // Panel
    $('close-panel-btn').addEventListener('click',closePanel);
    $('delete-issue-btn').addEventListener('click',delCurrent);
    ['panel-title','panel-desc','edit-assignee','edit-category'].forEach(id=>dom[id].addEventListener('blur',syncPanel));
    ['edit-status','edit-priority'].forEach(id=>dom[id].addEventListener('change',syncPanel));
    dom['edit-due-date'].addEventListener('change',()=>{syncPanel();updateDueSmart(dom['edit-due-date'].value)});
    dom['star-btn'].addEventListener('click',toggleStar);
    $('prev-issue-btn').addEventListener('click',()=>navIssue(-1));
    $('next-issue-btn').addEventListener('click',()=>navIssue(1));
    $('zoom-fit-btn').addEventListener('click',zoomToFit);
    $('zoom-in-btn').addEventListener('click',()=>zoomBy(1.5));
    $('zoom-out-btn').addEventListener('click',()=>zoomBy(0.66));

    let _tT=null;
    dom['panel-title'].addEventListener('input',function(){autoExpand(this);clearTimeout(_tT);_tT=setTimeout(()=>{const i=getI(selId);if(i){i.title=this.value.trim()||'Untitled';persist()}},400)});
    dom['panel-title'].addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}});

    // Tags
    dom['tags-container'].addEventListener('click',e=>{const x=e.target.closest('.tag-x');if(!x)return;const i=getI(selId);if(i){logActivity(selId,'Tag removed',x.dataset.t);i.tags=i.tags.filter(t=>t!==x.dataset.t);renderTags();persist()}});
    dom['add-tag-input'].addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();const v=e.target.value.trim();if(!v||!selId)return;const i=getI(selId);if(i&&!i.tags.some(t=>t.toLowerCase()===v.toLowerCase())){i.tags.push(v);logActivity(selId,'Tag added',v);renderTags();persist()}else if(i&&i.tags.some(t=>t.toLowerCase()===v.toLowerCase()))toast('Tag already exists','info');e.target.value=''});

    // Subtasks
    dom['subtask-list'].addEventListener('click',e=>{const cb=e.target.closest('input[type="checkbox"]'),rm=e.target.closest('.subtask-remove'),i=getI(selId);if(!i)return;
        if(cb){i.subtasks[+cb.dataset.i].done=cb.checked;renderSubs();persist();if(i.subtasks.length&&i.subtasks.every(s=>s.done)&&i.status!=='done')toastAction('✅ All sub-tasks done!','Mark Done',()=>{logActivity(selId,'Status',`${STATUS_LABEL[i.status]} → Done`);i.status='done';i.statusChangedAt=new Date().toISOString();if(selId===i.id)dom['edit-status'].value='done';dom['panel-status-strip'].style.background=COLOR.done;persist();renderActivity()})}
        if(rm){logActivity(selId,'Subtask removed',i.subtasks[+rm.dataset.i].text);i.subtasks.splice(+rm.dataset.i,1);renderSubs();persist()}});
    dom['add-subtask-input'].addEventListener('keydown',e=>{if(e.key!=='Enter')return;e.preventDefault();const v=e.target.value.trim();if(!v||!selId)return;const i=getI(selId);if(i){i.subtasks.push({text:v,done:false});logActivity(selId,'Subtask added',v);renderSubs();persist()}e.target.value=''});

    // Deps
    dom['dep-list'].addEventListener('click',e=>{const title=e.target.closest('.dep-title'),rm=e.target.closest('.dep-rm'),i=getI(selId);if(title)openPanel(title.dataset.id);if(rm&&i){i.dependencies=i.dependencies.filter(id=>id!==rm.dataset.d);renderDeps();persist()}});
    dom['add-dep-input'].addEventListener('change',e=>{const v=e.target.value.trim();if(!v||!selId)return;const t=issues.find(i=>i.title===v&&i.id!==selId),me=getI(selId);if(t&&me&&!me.dependencies.includes(t.id)){me.dependencies.push(t.id);logActivity(selId,'Dependency added',`#${t.num} ${t.title}`);renderDeps();persist()}e.target.value=''});

    // Context menu
    ctxEl.addEventListener('click',e=>{const item=e.target.closest('.ctx-item');if(item)doCtx(item.dataset.action)});
    document.addEventListener('click',e=>{
        if(!ctxEl.contains(e.target))hideCtx();
        if(wbEmptyCtxEl && !wbEmptyCtxEl.contains(e.target)) wbEmptyCtxEl.classList.remove('visible');
    });

    // Sidebar actions
    dom['compact-toggle'].addEventListener('change',e=>{isCompact=e.target.checked;renderGraph()});
    $('data-mgr-btn').addEventListener('click',openDataManager);
    $('export-json-btn').addEventListener('click',exportJSON);$('export-csv-btn').addEventListener('click',exportCSV);
    $('import-json-btn').addEventListener('click',()=>dom['import-file'].click());
    dom['import-file'].addEventListener('change',e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=''});
    $('present-btn').addEventListener('click',togglePresent);
    const sbBtn = $('shortcuts-btn'); if (sbBtn) sbBtn.addEventListener('click', openShortcuts);
    const eAdd = $('empty-add-btn'), eSmp = $('empty-samples-btn');
    if (eAdd) eAdd.addEventListener('click', () => { modalEl.classList.add('active'); setTimeout(() => dom['issue-title'].focus(), 100); });
    if (eSmp) eSmp.addEventListener('click', loadSampleData);

    // ──── New feature wiring ────
    // Voice input
    const vBtn = $('voice-btn'); if (vBtn) vBtn.addEventListener('click', () => voiceInput('issue-title'));

    // Daily Review / Stats / Templates / Settings buttons
    const drBtn = $('daily-review-btn'); if (drBtn) drBtn.addEventListener('click', openDailyReview);
    const stBtn = $('stats-btn'); if (stBtn) stBtn.addEventListener('click', openStats);
    const tpBtn = $('templates-btn'); if (tpBtn) tpBtn.addEventListener('click', openTemplates);
    const seBtn = $('settings-btn'); if (seBtn) seBtn.addEventListener('click', openSettings);

    // Close buttons + click-outside for new modals
    const cdr = $('close-dr-btn'); if (cdr) cdr.addEventListener('click', closeDailyReview);
    const cse = $('close-settings-btn'); if (cse) cse.addEventListener('click', closeSettings);
    const cst = $('close-stats-btn'); if (cst) cst.addEventListener('click', closeStats);
    const ctp = $('close-templates-btn'); if (ctp) ctp.addEventListener('click', closeTemplates);
    ['daily-review','settings-modal','stats-modal','templates-modal'].forEach(id => {
        const m = $(id); if (m) m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
    });

    // Settings controls
    document.querySelectorAll('.swatch[data-color]').forEach(s => s.addEventListener('click', () => {
        applyAccent(s.dataset.color);
        document.querySelectorAll('.swatch').forEach(o => o.classList.toggle('active', o === s));
    }));
    const ac = $('accent-custom'); if (ac) ac.addEventListener('input', e => { applyAccent(e.target.value); document.querySelectorAll('.swatch').forEach(o => o.classList.remove('active')); });
    const sNotif = $('set-notif'); if (sNotif) sNotif.addEventListener('change', e => { if (e.target.checked) enableNotifications(); else { settings.notifications = false; saveSettings(); } });
    const sSound = $('set-sound'); if (sSound) sSound.addEventListener('change', e => { settings.soundOn = e.target.checked; saveSettings(); });
    const sConf = $('set-confetti'); if (sConf) sConf.addEventListener('change', e => { settings.confettiOn = e.target.checked; saveSettings(); });
    const orBtn = $('open-review-btn'); if (orBtn) orBtn.addEventListener('click', () => { closeSettings(); openDailyReview(); });

    // Markdown view/edit toggle
    const mdView = $('md-view-btn'); if (mdView) mdView.addEventListener('click', () => setMarkdownMode('view'));
    const mdEdit = $('md-edit-btn'); if (mdEdit) mdEdit.addEventListener('click', () => setMarkdownMode('edit'));
    const descView = $('panel-desc-view'); if (descView) descView.addEventListener('click', () => setMarkdownMode('edit'));
    const descEdit = $('panel-desc'); if (descEdit) descEdit.addEventListener('blur', () => { syncPanel(); setMarkdownMode('view'); });

    // Recurrence change
    const recur = $('edit-recurrence'); if (recur) recur.addEventListener('change', syncPanel);

    // Focus button in panel
    const tFocus = $('time-focus-btn'); if (tFocus) tFocus.addEventListener('click', () => {
        if (focus.taskId === selId) stopFocus(); else if (selId) startFocus(selId);
        if (selId) { const i = getI(selId); if (i && dom['time-focus-btn']) dom['time-focus-btn'].textContent = focus.taskId === selId ? '⏹ Stop Focus' : '🎯 Start Focus'; }
    });

    // Bulk actions
    dom['bulk-status'].addEventListener('change',e=>{if(!e.target.value)return;const ts=new Date().toISOString(),newS=e.target.value;for(const id of selected){const i=getI(id);if(i){logActivity(id,'Status',`${STATUS_LABEL[i.status]} → ${STATUS_LABEL[newS]}`);i.status=newS;i.statusChangedAt=ts}}selected.clear();updateBulk();e.target.value='';toast('Status updated','ok');persist()});
    dom['bulk-priority'].addEventListener('change',e=>{if(!e.target.value)return;const newP=e.target.value;for(const id of selected){const i=getI(id);if(i){logActivity(id,'Priority',`${i.priority} → ${newP}`);i.priority=newP}}selected.clear();updateBulk();e.target.value='';toast('Priority updated','ok');persist()});
    $('bulk-delete-btn').addEventListener('click',()=>{if(confirm(`Delete ${selected.size}?`)){for(const id of selected){const i=getI(id);if(i)deletedStack.push(structuredClone(i))}issues=issues.filter(i=>!selected.has(i.id));selected.clear();updateBulk();persist();toast('Bulk deleted','bad',true)}});
    $('bulk-deselect-btn').addEventListener('click',()=>{selected.clear();updateBulk()});

    // Command palette
    dom['cmd-input'].addEventListener('input',e=>populateCmd(e.target.value));
    dom['cmd-input'].addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();cmdNav(1)}else if(e.key==='ArrowUp'){e.preventDefault();cmdNav(-1)}else if(e.key==='Enter'){e.preventDefault();cmdRun()}});
    dom['cmd-results'].addEventListener('click',e=>{const r=e.target.closest('.cmd-result');if(r&&cmdList[+r.dataset.i])cmdList[+r.dataset.i].fn()});
    cmdEl.addEventListener('click',e=>{if(e.target===cmdEl)closeCmd()});
    $('close-shortcuts-btn').addEventListener('click',closeShortcuts);
    $('shortcuts-modal').addEventListener('click',e=>{if(e.target.id==='shortcuts-modal')closeShortcuts()});

    // Data manager
    $('close-dm-btn').addEventListener('click',closeDataManager);
    dmEl.addEventListener('click',e=>{if(e.target===dmEl)closeDataManager()});
    $('dm-reload-btn').addEventListener('click',loadSampleData);
    $('dm-clear-demo-btn').addEventListener('click',dmClearDemo);
    $('dm-wipe-btn').addEventListener('click',dmWipeAll);
    ['status','category','priority','assignee'].forEach(f=>{
        $('dm-del-'+f).addEventListener('change',()=>dmUpdateMatch(f));
        $('dm-go-'+f).addEventListener('click',()=>dmDeleteBy(f));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown',e=>{
        if(cmdOpen){if(e.key==='Escape'){e.preventDefault();closeCmd()}return}
        const tag=document.activeElement.tagName;
        if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'){if(e.key==='Escape')document.activeElement.blur();return}
        switch(e.key){
            case'Escape':closePanel();modalEl.classList.remove('active');closeDataManager();closeDailyReview();closeSettings();closeStats();closeTemplates();selected.clear();updateBulk();hideCtx();closeShortcuts();break;
            case'p':case'P':if(hovId||selId){e.preventDefault();const tid=hovId||selId;if(focus.taskId===tid)stopFocus();else startFocus(tid)}break;
            case'n':case'N':e.preventDefault();modalEl.classList.add('active');setTimeout(()=>dom['issue-title'].focus(),100);break;
            case'/':e.preventDefault();dom['search-input'].focus();break;
            case'0':svg.transition().duration(500).call(zoomB.transform,d3.zoomIdentity);break;
            case'z':case'Z':if(e.ctrlKey||e.metaKey){e.preventDefault();undoDelete()}else zoomToFit();break;
            case'f':case'F':togglePresent();break;
            case's':case'S':if(selId){e.preventDefault();toggleStar()}break;
            case'd':case'D':if(!e.ctrlKey){e.preventDefault();applyTheme(currentTheme==='dark'?'light':'dark')}break;
            case'?':e.preventDefault();openShortcuts();break;
            case'k':if(e.ctrlKey||e.metaKey){e.preventDefault();openCmd()}break;
            case'Delete':case'Backspace':if(selected.size){for(const id of selected){const i=getI(id);if(i)deletedStack.push(structuredClone(i))}issues=issues.filter(i=>!selected.has(i.id));selected.clear();updateBulk();persist();toast('Deleted','bad',true)}else if(selId)delCurrent();break;
            case'ArrowLeft':if(selId){e.preventDefault();navIssue(-1)}break;
            case'ArrowRight':if(selId){e.preventDefault();navIssue(1)}break;
            case'1':case'2':case'3':{const tid=hovId||selId;if(tid){const i=getI(tid);if(i){const oldS=i.status;i.status=STATUS_MAP[e.key];i.statusChangedAt=new Date().toISOString();logActivity(tid,'Status',`${STATUS_LABEL[oldS]} → ${STATUS_LABEL[i.status]}`);if(i.status==='done')onTaskCompleted(i);persist();if(selId===tid){dom['edit-status'].value=i.status;renderActivity()}}}break}
        }
    });
}

init();
