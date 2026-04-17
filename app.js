// ══════════════════════════════════════════════════════════════
//  BUBBLETASKER — CARD-BASED VISUAL ISSUE TRACKER v3
//  Features: Canvas, List, Kanban, Calendar, Activity History,
//  Quick Filters, Theme Toggle, Assignee Avatars
// ══════════════════════════════════════════════════════════════

// ═══════ CONSTANTS ═══════
const MOCK_IDS = new Set(['m1','m2','m3','m4','m5']);
const COLOR = { open:'#3b82f6', in_progress:'#f59e0b', done:'#10b981' };
const CARD = { high:{w:178,h:54}, medium:{w:152,h:48}, low:{w:130,h:42} };
const COMPACT_S = 0.65;
const STATUS_MAP = { '1':'open', '2':'in_progress', '3':'done' };
const PRIORITY_ORD = { high:3, medium:2, low:1 };
const STATUS_LABEL = { open:'Open', in_progress:'In Progress', done:'Done' };
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f59e0b','#10b981','#06b6d4','#3b82f6'];

const MOCKS = [
    { id:'m1', num:1, title:'Design System', description:'Build core design tokens:\n• Color palette\n• Typography scale\n• Spacing system\n• Component library', status:'done', priority:'high', category:'Task', tags:['design','ui'], assignee:'Alex', date:new Date(Date.now()-864e5*3).toISOString(), dueDate:null, subtasks:[{text:'Color palette',done:true},{text:'Typography scale',done:true},{text:'Spacing tokens',done:false}], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*3).toISOString()},{action:'Status',detail:'open → done',at:new Date(Date.now()-864e5).toISOString()}], statusChangedAt:new Date(Date.now()-864e5).toISOString() },
    { id:'m2', num:2, title:'Navbar Component', description:'Responsive navbar with mobile hamburger drawer', status:'in_progress', priority:'medium', category:'Feature', tags:['frontend','react'], assignee:'Rahul', date:new Date(Date.now()-864e5*5).toISOString(), dueDate:new Date(Date.now()+864e5*2).toISOString().slice(0,10), subtasks:[{text:'Desktop layout',done:true},{text:'Mobile drawer',done:false}], dependencies:['m1'], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*5).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*2).toISOString() },
    { id:'m3', num:3, title:'Fix Auth Bypass', description:'Token expiration not validated on page refresh — users can hijack sessions after idle timeout. Fix requires both backend token rotation and frontend cookie handling update.', status:'open', priority:'high', category:'Bug', tags:['backend','security'], assignee:'Sarah', date:new Date(Date.now()-864e5).toISOString(), dueDate:new Date(Date.now()-864e5).toISOString().slice(0,10), subtasks:[], dependencies:[], starred:true, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5).toISOString()}], statusChangedAt:new Date(Date.now()-864e5).toISOString() },
    { id:'m4', num:4, title:'Postgres Indexing', description:'Add composite indices for dashboard queries to improve load time from 3.2s → 400ms', status:'done', priority:'high', category:'Task', tags:['backend','db'], assignee:'Mike', date:new Date(Date.now()-864e5*7).toISOString(), dueDate:new Date(Date.now()+864e5*5).toISOString().slice(0,10), subtasks:[], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*7).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*3).toISOString() },
    { id:'m5', num:5, title:'Landing Page v2', description:'New hero section with scroll animations and updated copy', status:'open', priority:'low', category:'Feature', tags:['marketing'], assignee:'Unassigned', date:new Date(Date.now()-864e5*2).toISOString(), dueDate:new Date(Date.now()+864e5*8).toISOString().slice(0,10), subtasks:[], dependencies:[], starred:false, history:[{action:'Created',detail:'',at:new Date(Date.now()-864e5*2).toISOString()}], statusChangedAt:new Date(Date.now()-864e5*2).toISOString() }
];

// ═══════ DATA LAYER ═══════
const raw = localStorage.getItem('bubbleTaskerIssues');
let issues = raw ? JSON.parse(raw) : structuredClone(MOCKS);
issues = issues.map(i => ({ subtasks:[], dependencies:[], dueDate:null, statusChangedAt:i.date, starred:false, history:[], ...i }));

let _nextNum = parseInt(localStorage.getItem('btNextNum')) || 1;
for (const i of issues) { if (!i.num) { i.num = _nextNum++; } else { _nextNum = Math.max(_nextNum, i.num + 1); } }
localStorage.setItem('btNextNum', _nextNum);

let deletedStack = [];
const issueMap = new Map();
function rebuildMap() { issueMap.clear(); for (const i of issues) issueMap.set(i.id, i); }
rebuildMap();
function getI(id) { return issueMap.get(id); }

function cw(p) { return isCompact ? (CARD[p].w * COMPACT_S) | 0 : CARD[p].w; }
function ch(p) { return isCompact ? (CARD[p].h * COMPACT_S) | 0 : CARD[p].h; }
function colR(p) { return (cw(p) >> 1) + 8; }
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
     'active-filter-badge','theme-toggle'
    ].forEach(id => { dom[id] = $(id); });
}

// ═══════ STATE ═══════
let fStatus='all', fPriority='all', fCategory='all', fAssignee='all';
let searchQ='', groupBy='category', activeQF=null;
let sim=null, selId=null, hovId=null, ctxId=null;
let isCompact=false, isPresent=false;
let cmdOpen=false, cmdIdx=0, cmdList=[];
let currentView='canvas';
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
const ctxEl = $('context-menu'), cmdEl = $('cmd-palette');

let W = svgBox.clientWidth, H = svgBox.clientHeight;
const svg = d3.select('#svg-container').append('svg').attr('width','100%').attr('height','100%');
const g = svg.append('g');
const linkLayer = g.append('g'), nodeLayer = g.append('g');
const zoomB = d3.zoom().scaleExtent([0.12,5]).on('zoom', e => {
    g.attr('transform', e.transform);
    const p = Math.round(e.transform.k * 100);
    if (dom['zoom-level']) dom['zoom-level'].textContent = p + '%';
});
svg.call(zoomB).on('dblclick.zoom', null);
const defs = svg.append('defs');

// ═══════ PERSISTENCE ═══════
let _saveT = null, _renderRAF = null;
function saveToDisk() { localStorage.setItem('bubbleTaskerIssues', JSON.stringify(issues)); localStorage.setItem('btNextNum', _nextNum); rebuildMap(); }
function persist(render = true) {
    saveToDisk(); updateOptions(); updateStats(); flashSave(); updateFilterBadge();
    if (render) {
        if (currentView === 'canvas') { cancelAnimationFrame(_renderRAF); _renderRAF = requestAnimationFrame(renderGraph); }
        else if (currentView === 'list') renderList();
        else if (currentView === 'kanban') renderKanban();
        else if (currentView === 'calendar') renderCalendar();
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
function logActivity(id, action, detail) {
    const i = getI(id); if (!i) return;
    if (!i.history) i.history = [];
    i.history.unshift({ action, detail, at: new Date().toISOString() });
    if (i.history.length > 50) i.history.length = 50;
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
    const today = todayStr();
    const now = new Date(); now.setHours(0,0,0,0);
    if (activeQF === qf) { activeQF = null; searchQ = ''; fStatus = 'all'; fPriority = 'all'; fAssignee = 'all'; }
    else {
        activeQF = qf; fStatus = 'all'; fPriority = 'all'; fAssignee = 'all'; searchQ = '';
    }
    document.querySelectorAll('.qf-btn').forEach(b => b.classList.toggle('active', b.dataset.qf === activeQF));
    dom['filter-status'].value = fStatus; dom['filter-priority'].value = fPriority;
    dom['search-input'].value = searchQ;
    persist();
}
function filterIssues() {
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
        if (fStatus !== 'all' && i.status !== fStatus) continue;
        if (fPriority !== 'all' && i.priority !== fPriority) continue;
        if (fCategory !== 'all' && i.category !== fCategory) continue;
        if (fAssignee !== 'all' && i.assignee !== fAssignee) continue;
        if (qLow && !i.title.toLowerCase().includes(qLow) && !i.tags.some(t => t.toLowerCase().includes(qLow)) && !(('#'+i.num).includes(qLow))) continue;
        filtered.push(i);
    }
    return filtered;
}

// ═══════ VIEW SYSTEM ═══════
function setView(view) {
    currentView = view;
    svgBox.style.display = view === 'canvas' ? '' : 'none';
    labelsBox.style.display = view === 'canvas' ? '' : 'none';
    dom['list-view'].style.display = view === 'list' ? '' : 'none';
    dom['kanban-view'].style.display = view === 'kanban' ? '' : 'none';
    dom['calendar-view'].style.display = view === 'calendar' ? '' : 'none';
    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    if (view === 'canvas') renderGraph();
    else if (view === 'list') renderList();
    else if (view === 'kanban') renderKanban();
    else if (view === 'calendar') renderCalendar();
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
function init() { cacheDom(); applyTheme(currentTheme); wire(); updateOptions(); updateStats(); updateFilterBadge(); renderGraph(); }

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
    animNum(dom['stat-total'], issues.length); animNum(dom['stat-open'], o);
    animNum(dom['stat-progress'], p); animNum(dom['stat-done'], d);
}
function animNum(el, target) {
    if (!el) return; const start = +el.textContent || 0; if (start === target) { el.textContent = target; return; }
    const dur = 220, t0 = performance.now();
    const step = now => { const f = Math.min((now-t0)/dur,1); el.textContent = (start+(target-start)*f)|0; if (f<1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
}

// ═══════ ZOOM TO FIT ═══════
function zoomToFit() {
    if (!phys.size) return;
    let x0=Infinity, y0=Infinity, x1=-Infinity, y1=-Infinity;
    for (const [,n] of phys) { const hw=cw(n.priority||'medium')/2,hh=ch(n.priority||'medium')/2; if(n.x-hw<x0)x0=n.x-hw; if(n.y-hh<y0)y0=n.y-hh; if(n.x+hw>x1)x1=n.x+hw; if(n.y+hh>y1)y1=n.y+hh; }
    const pad=80; x0-=pad;y0-=pad;x1+=pad;y1+=pad;
    const dx=x1-x0,dy=y1-y0, scale=Math.min(W/dx,H/dy,2), tx=W/2-(x0+x1)/2*scale, ty=H/2-(y0+y1)/2*scale;
    svg.transition().duration(600).call(zoomB.transform, d3.zoomIdentity.translate(tx,ty).scale(scale));
}

// ═══════════════════════════════════════════════════════
//  RENDER — CANVAS VIEW
// ═══════════════════════════════════════════════════════
function renderGraph() {
    const filtered = filterIssues();
    if (!filtered.length) {
        emptyEl.querySelector('h2').textContent = issues.length ? 'No matches' : 'Your canvas awaits';
        emptyEl.querySelector('p').textContent = issues.length
            ? (searchQ ? `No issues match "${searchQ}".` : activeQF ? 'No issues match this quick filter.' : 'Try adjusting your filters.')
            : 'Double-click anywhere, press N, or Ctrl+K to begin.';
        emptyEl.style.display = 'block';
        nodeLayer.selectAll('*').remove(); linkLayer.selectAll('*').remove();
        labelsBox.innerHTML = ''; if (sim) sim.stop(); phys.clear(); return;
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
    defs.selectAll('*').remove();

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

    cards.selectAll('*').remove();
    cards.classed('selected', d=>selected.has(d.id));
    cards.classed('done-card', d=>d.status==='done');

    cards.each(function(d) {
        const el = d3.select(this);
        const w=cw(d.priority), h=ch(d.priority), rx=isCompact?8:11, x0=-w/2, y0=-h/2;
        const now = Date.now();
        el.attr('data-priority', d.priority);

        // Background
        el.append('rect').attr('class','card-bg').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx)
            .attr('fill','rgba(14,16,22,0.92)').attr('stroke',COLOR[d.status]).attr('stroke-opacity',.16).attr('stroke-width',1);

        const clipId = `cr-${d.id}`;
        defs.append('clipPath').attr('id',clipId).append('rect').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx);

        // Accent bar
        el.append('rect').attr('class','card-accent').attr('x',x0).attr('y',y0).attr('width',3.5).attr('height',h).attr('fill',COLOR[d.status]).attr('clip-path',`url(#${clipId})`);

        // Pin indicator
        if (d.isPinned) el.append('rect').attr('x',x0).attr('y',y0).attr('width',w).attr('height',h).attr('rx',rx).attr('fill','none').attr('stroke',COLOR[d.status]).attr('stroke-width',1.5).attr('stroke-dasharray','4,3').attr('stroke-opacity',.3).attr('clip-path',`url(#${clipId})`);

        // Issue number
        if (!isCompact) el.append('text').attr('class','card-num').attr('x',x0+w-10).attr('y',y0+11).attr('text-anchor','end').text(`#${d.num||'?'}`);

        // Star
        if (d.starred) el.append('text').attr('class','card-star').attr('x',x0+12).attr('y',y0+11).attr('font-size','8px').text('★');

        // Title
        const fs = isCompact?9:(d.priority==='high'?12.5:11.5);
        const maxChars = ((w-24)/(fs*0.56))|0;
        let title = d.title; if(title.length>maxChars) title=title.slice(0,maxChars-1)+'…';
        el.append('text').attr('class','card-title').attr('x',x0+13).attr('y',isCompact?2:(h>46?-3:-1)).attr('font-size',fs+'px').text(title);

        // Meta + Assignee avatar
        if (!isCompact && h > 40) {
            const ini = initials(d.assignee);
            if (ini) {
                const avX = x0 + w - 20, avY = 7;
                el.append('circle').attr('class','assignee-avatar').attr('cx',avX).attr('cy',avY).attr('r',7).attr('fill',avatarColor(d.assignee)).attr('opacity',.85);
                el.append('text').attr('class','assignee-avatar').attr('x',avX).attr('y',avY+3).attr('text-anchor','middle').attr('font-size','6.5px').attr('font-weight','700').attr('fill','#fff').text(ini);
            }
            let meta = d.category;
            const metaMax = ((w - (ini?40:24)) / 5.2) | 0;
            if(meta.length>metaMax) meta=meta.slice(0,metaMax-1)+'…';
            el.append('text').attr('class','card-meta').attr('x',x0+13).attr('y',14).attr('font-size','9px').text(meta);
        }

        // Subtask progress
        const subs = d.subtasks;
        if (subs?.length) {
            const done=subs.filter(s=>s.done).length, pct=done/subs.length;
            if (!isCompact) el.append('text').attr('class','card-count').attr('x',x0+w-10).attr('y',-3).attr('fill',pct===1?'#10b981':'rgba(255,255,255,0.3)').attr('font-size','9px').attr('font-weight',600).attr('text-anchor','end').text(pct===1?'✓':`${done}/${subs.length}`);
            const barW=w-10, barY=y0+h-5;
            el.append('rect').attr('x',x0+5).attr('y',barY).attr('width',barW).attr('height',2).attr('rx',1).attr('fill','rgba(255,255,255,0.03)');
            if(pct>0) el.append('rect').attr('x',x0+5).attr('y',barY).attr('width',barW*pct).attr('height',2).attr('rx',1).attr('fill','#10b981').attr('opacity',.7);
        }

        // Overdue/stuck dots
        if (d.dueDate && new Date(d.dueDate)<now && d.status!=='done') el.append('circle').attr('cx',x0+w-8).attr('cy',y0+8).attr('r',3.5).attr('fill','#ef4444').attr('class','pulse-dot');
        else if(d.status==='in_progress'&&(now-new Date(d.statusChangedAt||d.date).getTime())/36e5>48) el.append('circle').attr('cx',x0+w-8).attr('cy',y0+8).attr('r',3).attr('fill','#f59e0b').attr('class','pulse-dot');
    });

    const links = linkLayer.selectAll('.dep-link');
    const centers = getCenters(filtered);
    if (sim) sim.stop();
    sim = d3.forceSimulation(nodes)
        .force('charge', d3.forceManyBody().strength(d => -colR(d.priority)*1.8))
        .force('collide', d3.forceCollide().radius(d => colR(d.priority)).iterations(3))
        .on('tick', () => {
            cards.attr('transform', d => { const hw=cw(d.priority)/2,hh=ch(d.priority)/2; d.x=Math.max(hw,Math.min(W-hw,d.x)); d.y=Math.max(hh,Math.min(H-hh,d.y)); phys.set(d.id,d); return `translate(${d.x},${d.y})`; });
            links.attr('x1',d=>phys.get(d.source)?.x||0).attr('y1',d=>phys.get(d.source)?.y||0).attr('x2',d=>phys.get(d.target)?.x||0).attr('y2',d=>phys.get(d.target)?.y||0);
        });

    if (groupBy!=='none'&&Object.keys(centers).length) {
        sim.force('x',d3.forceX().x(d=>centers[d[groupBy]]?.x||W/2).strength(.18));
        sim.force('y',d3.forceY().y(d=>centers[d[groupBy]]?.y||H/2).strength(.18));
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
        const tagPills = i.tags.length ? `<div class="list-tags">${i.tags.map(t=>`<span class="list-tag">${t}</span>`).join('')}</div>` : '';
        return `<tr class="list-row${selId===i.id?' list-selected':''}" data-id="${i.id}" style="${i.status==='done'?'opacity:.55':''}">
            <td class="list-num">#${i.num}</td>
            <td class="list-title-cell">
                <span class="dot ${statusDot}" style="width:7px;height:7px;display:inline-block;margin-right:6px;flex-shrink:0"></span>${i.starred?'<span class="list-star">★</span>':''}${i.title}
                ${subInfo}${tagPills}
            </td>
            <td><span class="list-status" style="color:${COLOR[i.status]}">${STATUS_LABEL[i.status]}</span></td>
            <td class="list-priority-${i.priority}">${i.priority}</td>
            <td>${i.category}</td>
            <td>${ini?`<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:16px;height:16px;border-radius:50%;background:${avatarColor(i.assignee)};display:inline-grid;place-items:center;font-size:7px;font-weight:700;color:#fff;flex-shrink:0">${ini}</span>${i.assignee}</span>`:`<span style="color:var(--text-3)">—</span>`}</td>
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
                <div class="kanban-card-title">${i.starred?'★ ':''}${i.title}</div>
                <div class="kanban-card-meta"><span>${i.category}</span>${ini?`<span style="display:inline-flex;align-items:center;gap:3px"><span style="width:14px;height:14px;border-radius:50%;background:${avatarColor(i.assignee)};display:inline-grid;place-items:center;font-size:6px;font-weight:700;color:#fff">${ini}</span>${i.assignee}</span>`:''}</div>
                ${sd.text?`<div class="kanban-card-due ${sd.cls}">${sd.text}</div>`:''}
                ${i.tags.length?`<div class="kanban-card-tags">${i.tags.map(t=>`<span class="kanban-card-tag">${t}</span>`).join('')}</div>`:''}
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
            return `<div class="cal-chip ${sCls}${isOverdue?' overdue':''}" data-id="${i.id}" title="#${i.num} ${i.title}">${i.starred?'★ ':''}#${i.num} ${i.title}</div>`;
        }).join('');

        const displayNum = isOther ? dateObj.getDate() : dayNum;
        html += `<div class="${cls}"><span class="cal-day-num">${displayNum}</span>${chips}</div>`;
    }
    body.innerHTML = html;

    // Unscheduled section
    if (unscheduled.length) {
        unsched.innerHTML = `<div class="cal-unsched-title">No due date (${unscheduled.length})</div><div class="cal-unsched-list">${unscheduled.map(i => `<div class="cal-unsched-chip" data-id="${i.id}">#${i.num} ${i.title}</div>`).join('')}</div>`;
        unsched.style.display = '';
    } else {
        unsched.style.display = 'none';
    }
}

// ═══════ PHYSICS ═══════
function dragS(e,d){tip.style('opacity',0);if(!e.active)sim.alphaTarget(.3).restart();d.fx=d.x;d.fy=d.y}
function dragM(e,d){d.fx=e.x;d.fy=e.y}
function dragE(e,d){if(!e.active)sim.alphaTarget(0);if(!d.isPinned){d.fx=null;d.fy=null}}

// ═══════ CARD EVENTS ═══════
function onClickCard(e,d) { hideCtx(); if(e.shiftKey){selected.has(d.id)?selected.delete(d.id):selected.add(d.id);updateBulk()} else{selected.clear();updateBulk();openPanel(d.id)} }
function onCtxCard(e,d) { e.preventDefault();e.stopPropagation();showCtx(e,d.id) }

// ═══════ TOOLTIP ═══════
function tipPos(e) { const r=tip.node().getBoundingClientRect();let tx=e.pageX+16,ty=e.pageY-16;if(tx+260>window.innerWidth)tx=e.pageX-270;if(ty+(r.height||200)>window.innerHeight)ty=window.innerHeight-(r.height||200)-10;if(ty<10)ty=10;return{tx,ty} }
function onOver(e,d) {
    if(e.buttons>0)return; hovId=d.id;
    const linked=new Set([d.id]);if(d.dependencies)for(const id of d.dependencies)linked.add(id);for(const i of issues)if(i.dependencies?.includes(d.id))linked.add(i.id);
    nodeLayer.selectAll('.card').style('opacity',b=>linked.has(b.id)?1:.15);
    linkLayer.selectAll('.dep-link').style('opacity',l=>(l.source===d.id||l.target===d.id)?.8:.05);
    const parts=[`<h4>#${d.num} ${d.title}</h4>`];
    const desc=(d.description||'').trim();if(desc)parts.push(`<div class="tt-desc">${desc.replace(/\n/g,' ').slice(0,140)}${desc.length>140?'…':''}</div>`);
    parts.push(`<div class="tt-meta"><span>Status</span><strong style="color:${COLOR[d.status]}">${STATUS_LABEL[d.status]}</strong></div>`);
    parts.push(`<div class="tt-meta"><span>Priority</span><strong style="text-transform:capitalize">${d.priority}</strong></div>`);
    parts.push(`<div class="tt-meta"><span>Assignee</span><strong>${d.assignee||'—'}</strong></div>`);
    if(d.subtasks?.length)parts.push(`<div class="tt-extra">☑ ${d.subtasks.filter(s=>s.done).length}/${d.subtasks.length} sub-tasks</div>`);
    if(d.dueDate){const sd=smartDue(d.dueDate);parts.push(`<div class="tt-extra" style="color:${sd.cls==='overdue'?'var(--red)':sd.cls==='today'?'var(--amber)':'var(--text-3)'}">${sd.text} (${d.dueDate})</div>`)}
    if(d.tags.length)parts.push(`<div class="tt-tags">${d.tags.map(t=>`<span class="tt-tag">${t}</span>`).join('')}</div>`);
    if(d.starred)parts.push(`<div class="tt-extra">⭐ Starred</div>`);
    tip.html(parts.join(''));tip.style('opacity',1);const{tx,ty}=tipPos(e);tip.style('left',tx+'px').style('top',ty+'px');
}
function onMove(e){const{tx,ty}=tipPos(e);tip.style('left',tx+'px').style('top',ty+'px')}
function onOut(){hovId=null;tip.style('opacity',0);nodeLayer.selectAll('.card').style('opacity',1);linkLayer.selectAll('.dep-link').style('opacity',1)}

// ═══════ GROUPING ═══════
function getCenters(data) { if(groupBy==='none')return {};const u=[...new Set(data.map(d=>d[groupBy]).filter(Boolean))],c={};const cols=Math.min(3,u.length),sx=W/(cols||1),sy=H/Math.ceil(u.length/cols||1);u.forEach((g,i)=>{c[g]={x:sx*(i%cols)+sx/2,y:sy*Math.floor(i/cols)+sy/2}});return c }
function updateLabels(c) { labelsBox.innerHTML='';if(groupBy==='none')return;const frag=document.createDocumentFragment();for(const[n,p]of Object.entries(c)){const l=document.createElement('div');l.className='group-label';l.textContent=n.replace('_',' ');l.style.cssText=`left:${p.x}px;top:${p.y}px`;frag.appendChild(l)}labelsBox.appendChild(frag) }

// ═══════ CONTEXT MENU ═══════
function showCtx(e,id){ctxId=id;ctxEl.style.left=e.pageX+'px';ctxEl.style.top=e.pageY+'px';ctxEl.classList.add('visible')}
function hideCtx(){ctxEl.classList.remove('visible');ctxId=null}
function doCtx(action) {
    if(!ctxId)return;const issue=getI(ctxId);if(!issue)return;
    switch(action){
        case'pin':{const n=phys.get(ctxId);if(n){n.isPinned=!n.isPinned;if(n.isPinned){n.fx=n.x;n.fy=n.y}else{n.fx=null;n.fy=null;if(sim)sim.alphaTarget(.3).restart()}phys.set(ctxId,n);toast(n.isPinned?'📌 Pinned':'📌 Unpinned','info')}renderGraph();break}
        case'clone':{const cl={...structuredClone(issue),id:Date.now().toString(),num:_nextNum++,title:issue.title+' (copy)',date:new Date().toISOString(),statusChangedAt:new Date().toISOString(),history:[{action:'Cloned',detail:`from #${issue.num}`,at:new Date().toISOString()}]};issues.push(cl);toast('📋 Duplicated','ok');persist();break}
        case'status-open':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → Open`);issue.status='open';issue.statusChangedAt=new Date().toISOString();persist();break;
        case'status-progress':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → In Progress`);issue.status='in_progress';issue.statusChangedAt=new Date().toISOString();persist();break;
        case'status-done':logActivity(ctxId,'Status',`${STATUS_LABEL[issue.status]} → Done`);issue.status='done';issue.statusChangedAt=new Date().toISOString();toast('🟢 Done!','ok');persist();break;
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
    dom['panel-meta-time'].textContent=`Created ${timeAgo(i.date)} · Status changed ${timeAgo(i.statusChangedAt||i.date)}`;
    updateDueSmart(i.dueDate);updateStarBtn(i.starred);renderTags();renderSubs();renderDeps();renderActivity();
    panelEl.classList.add('open');
    if(currentView==='list')renderList();
}
function closePanel(){syncPanel();panelEl.classList.remove('open');selId=null;if(currentView==='list')renderList()}
function syncPanel() {
    if(!selId)return;const i=getI(selId);if(!i)return;
    const oldS=i.status,oldP=i.priority;
    i.title=dom['panel-title'].value.trim()||'Untitled';i.status=dom['edit-status'].value;i.priority=dom['edit-priority'].value;i.category=dom['edit-category'].value.trim()||'Task';
    i.assignee=dom['edit-assignee'].value.trim()||'Unassigned';i.dueDate=dom['edit-due-date'].value||null;i.description=dom['panel-desc'].value;
    if(i.status!==oldS){i.statusChangedAt=new Date().toISOString();logActivity(selId,'Status',`${STATUS_LABEL[oldS]} → ${STATUS_LABEL[i.status]}`);}
    if(i.priority!==oldP)logActivity(selId,'Priority',`${oldP} → ${i.priority}`);
    dom['panel-badge'].textContent=i.category;dom['panel-status-strip'].style.background=COLOR[i.status];updateDueSmart(i.dueDate);persist();
}
function updateDueSmart(dateStr){const el=dom['due-smart'];if(!el)return;const{text,cls}=smartDue(dateStr);el.textContent=text;el.className='due-smart'+(cls?' '+cls:'')}
function updateStarBtn(s){const btn=dom['star-btn'];if(!btn)return;btn.textContent=s?'★':'☆';btn.classList.toggle('starred',!!s)}
function toggleStar(){const i=getI(selId);if(!i)return;i.starred=!i.starred;updateStarBtn(i.starred);logActivity(selId,i.starred?'Starred':'Unstarred','');persist();toast(i.starred?'⭐ Starred':'Unstarred','info')}
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
        {icon:'🧹',t:'Clear Demo Data',s:'Remove starters',fn:()=>{closeCmd();issues=issues.filter(i=>!MOCK_IDS.has(i.id));persist();toast('Cleared demo','info')}},
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
    const statEls=document.querySelectorAll('.stat.clickable');
    const syncStatH=()=>statEls.forEach(s=>s.classList.toggle('active',s.dataset.status===fStatus));
    for(const id of Object.keys(filterMap)){dom[id].addEventListener('change',e=>{filterMap[id](e.target.value);activeQF=null;document.querySelectorAll('.qf-btn').forEach(b=>b.classList.remove('active'));syncStatH();persist()})}
    statEls.forEach(s=>{s.addEventListener('click',()=>{const v=s.dataset.status;fStatus=fStatus===v?'all':v;dom['filter-status'].value=fStatus;activeQF=null;document.querySelectorAll('.qf-btn').forEach(b=>b.classList.remove('active'));syncStatH();persist()})});

    // Search
    let sT=null;
    dom['search-input'].addEventListener('input',e=>{const v=e.target.value;dom['clear-search'].style.display=v?'block':'none';dom['search-kbd'].style.display=v?'none':'';clearTimeout(sT);sT=setTimeout(()=>{searchQ=v;activeQF=null;document.querySelectorAll('.qf-btn').forEach(b=>b.classList.remove('active'));persist()},120)});
    dom['clear-search'].addEventListener('click',()=>{dom['search-input'].value='';searchQ='';dom['clear-search'].style.display='none';dom['search-kbd'].style.display='';persist()});

    // Quick filter buttons
    document.querySelectorAll('.qf-btn').forEach(b=>{b.addEventListener('click',()=>applyQuickFilter(b.dataset.qf))});

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
        container.addEventListener('drop',e=>{e.preventDefault();container.classList.remove('drag-over');const issueId=e.dataTransfer.getData('text/plain');const issue=getI(issueId);if(issue&&issue.status!==status){logActivity(issueId,'Status',`${STATUS_LABEL[issue.status]} → ${STATUS_LABEL[status]}`);issue.status=status;issue.statusChangedAt=new Date().toISOString();persist();toast(`Moved to ${STATUS_LABEL[status]}`,'ok')}});
        container.addEventListener('dragend',e=>{container.querySelectorAll('.dragging').forEach(el=>el.classList.remove('dragging'))});
    });
    $('kanban-view').addEventListener('click',e=>{const card=e.target.closest('.kanban-card');if(card)openPanel(card.dataset.id)});

    // Modal
    $('add-issue-btn').addEventListener('click',()=>modalEl.classList.add('active'));
    $('close-modal-btn').addEventListener('click',()=>modalEl.classList.remove('active'));
    modalEl.addEventListener('click',e=>{if(e.target===modalEl)modalEl.classList.remove('active')});
    formEl.addEventListener('submit',e=>{e.preventDefault();const tags=dom['issue-tags'].value.split(',').map(t=>t.trim()).filter(Boolean);const num=_nextNum++,id=Date.now().toString();issues.push({id,num,title:dom['issue-title'].value,description:'',status:'open',priority:dom['issue-priority'].value||'medium',category:dom['issue-category'].value.trim()||'Task',tags,assignee:dom['issue-assignee'].value.trim()||'Unassigned',date:new Date().toISOString(),dueDate:dom['issue-due-date'].value||null,subtasks:[],dependencies:[],starred:false,history:[{action:'Created',detail:'',at:new Date().toISOString()}],statusChangedAt:new Date().toISOString()});modalEl.classList.remove('active');formEl.reset();toast(`✨ #${num} Created!`,'ok');persist()});

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
    document.addEventListener('click',e=>{if(!ctxEl.contains(e.target))hideCtx()});

    // Sidebar actions
    dom['compact-toggle'].addEventListener('change',e=>{isCompact=e.target.checked;renderGraph()});
    $('clear-demo-btn').addEventListener('click',()=>{issues=issues.filter(i=>!MOCK_IDS.has(i.id));toast('Cleared demo','info');persist();closePanel()});
    $('clear-all-btn').addEventListener('click',()=>{if(confirm('Wipe everything?')){issues=[];closePanel();toast('Canvas wiped','bad');persist()}});
    $('export-json-btn').addEventListener('click',exportJSON);$('export-csv-btn').addEventListener('click',exportCSV);
    $('import-json-btn').addEventListener('click',()=>dom['import-file'].click());
    dom['import-file'].addEventListener('change',e=>{if(e.target.files[0])importJSON(e.target.files[0]);e.target.value=''});
    $('present-btn').addEventListener('click',togglePresent);

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

    // Keyboard shortcuts
    document.addEventListener('keydown',e=>{
        if(cmdOpen){if(e.key==='Escape'){e.preventDefault();closeCmd()}return}
        const tag=document.activeElement.tagName;
        if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'){if(e.key==='Escape')document.activeElement.blur();return}
        switch(e.key){
            case'Escape':closePanel();modalEl.classList.remove('active');selected.clear();updateBulk();hideCtx();closeShortcuts();break;
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
            case'1':case'2':case'3':{const tid=hovId||selId;if(tid){const i=getI(tid);if(i){const oldS=i.status;i.status=STATUS_MAP[e.key];i.statusChangedAt=new Date().toISOString();logActivity(tid,'Status',`${STATUS_LABEL[oldS]} → ${STATUS_LABEL[i.status]}`);persist();if(selId===tid){dom['edit-status'].value=i.status;renderActivity()}}}break}
        }
    });
}

init();
