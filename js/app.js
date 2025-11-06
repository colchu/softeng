// ===== IMPORTS =====
// We import all helpers from our other modules
import { cid, fmtDate, escapeHtml, csvEscape, parseStudentNames,clearRoster } from './utils.js';
import { loadState, saveState } from './storage.js';
// ===== STATE =====
// Load the state ONCE using the imported function
let state = loadState(); 

// ===== DOM REFS =====
// All your document.getElementById calls
const userNameEl = document.getElementById('userName');
const editNameBtn = document.getElementById('editNameBtn');
const exportBtn = document.getElementById('exportBtn');

const dashboardView = document.getElementById('view-dashboard');
const classSelect = document.getElementById('classSelect');
const studentChecks = document.getElementById('studentChecks');
const quickForm = document.getElementById('quickForm');
const quickNote = document.getElementById('quickNote');
const quickStatus = document.getElementById('quickStatus');
const clearFormBtn = document.getElementById('clearFormBtn');
const addClassBtn = document.getElementById('addClassBtn');
const classTiles = document.getElementById('classTiles');
const tileTemplate = document.getElementById('tileTemplate');

const classView = document.getElementById('view-class');

const classTitle = document.getElementById('classTitle');
const subtitle = document.getElementById('subtitle');
const rosterChips = document.getElementById('rosterChips');
const rosterCount = document.getElementById('rosterCount');
const newStudent = document.getElementById('newStudent');
const addStudent = document.getElementById('addStudent');
const newStudents = document.getElementById('newStudents');
const addStudentsBtn = document.getElementById('addStudentsBtn');
const clearRosterBtn = document.getElementById('clearRosterBtn');
const noteStudentChecks = document.getElementById('noteStudentChecks');
const noteText = document.getElementById('noteText');
const saveNote = document.getElementById('saveNote');
const noteStatus = document.getElementById('noteStatus');
const clearNote = document.getElementById('clearNote');
const refresh = document.getElementById('refresh');
const entries = document.getElementById('entries');
const scrollToClasses = document.getElementById('scrollToClasses');

// ===== ROUTER =====
function getRoute(){
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  if(parts[0] === '') return {name:'dashboard'};
  if(parts[0] === 'class' && parts[1]) return {name:'class', id: parts[1]};
  return {name:'dashboard'};
}
function navigateToDashboard(){
  dashboardView.classList.add('active');
  classView.classList.remove('active');
  renderDashboard();
}
function navigateToClass(id){
  const cls = state.classes.find(c=>c.id===id);
  if(!cls){ location.hash = '#/'; return; }
  dashboardView.classList.remove('active');
  classView.classList.add('active');
  renderClassView(cls);
}
window.addEventListener('hashchange', ()=> {
  const route = getRoute();
  if(route.name==='dashboard') navigateToDashboard();
  else if(route.name==='class') navigateToClass(route.id);
});

// ===== RENDER: DASHBOARD =====
function renderDashboard(){
  userNameEl.textContent = state.userName || 'Teacher';
  classSelect.innerHTML = '';
  state.classes.forEach(c=> classSelect.add(new Option(`${c.name} (${c.block})`, c.id)));
  if(!classSelect.value && state.classes[0]) classSelect.value = state.classes[0].id;
  renderStudentChecks();
  renderTiles();
}
function currentClass(){ return state.classes.find(c=>c.id === classSelect.value) || state.classes[0]; }
function renderStudentChecks(){
  const c = currentClass();
  studentChecks.innerHTML = '';
  if(!c){ studentChecks.innerHTML = '<div class="muted">Create a class to begin.</div>'; return; }
  const names = [...(c.roster||[])].sort((a,b)=>a.localeCompare(b));
  names.forEach(name=>{
    const id = 's_' + name.replace(/\W+/g,'_');
    const wrap = document.createElement('label');
    wrap.className = 'check';
    wrap.innerHTML = `<input type="checkbox" id="${id}"> <span>${escapeHtml(name)}</span>`;
    studentChecks.appendChild(wrap);
  });
}
function renderTiles(){
  classTiles.innerHTML = '';
  state.classes.forEach((c)=>{
    const node = tileTemplate.content.cloneNode(true);
    const link = node.querySelector('.tile-link');
    const tile = node.querySelector('.tile');
    const h3 = node.querySelector('h3');
    const count = node.querySelector('.rosterCount');
    const delBtn = node.querySelector('[data-delete]');

    tile.style.background = c.color || 'var(--tile1)';
    h3.innerHTML = `${escapeHtml(c.name)}<br>${escapeHtml(c.block)}`;
    count.textContent = `${c.roster?.length||0} student${(c.roster?.length||0)===1?'':'s'}`;
    link.href = `#/class/${encodeURIComponent(c.id)}`;

    delBtn.addEventListener('click', (e)=>{
      e.preventDefault(); e.stopPropagation();
      if(confirm(`Delete class: ${c.name} (${c.block})?\nThis will also remove its notes.`)){
        state.quickAdds = (state.quickAdds||[]).filter(n => n.classId !== c.id);
        state.classes = state.classes.filter(x=>x.id!==c.id);
        saveState(state);
        renderDashboard();
      }
    });
    classTiles.appendChild(node);
  });
}

// ===== RENDER: CLASS VIEW =====
function renderClassView(cls){
  classTitle.textContent = `${cls.name} (${cls.block})`;
  subtitle.textContent = 'Class Page';
  renderRoster(cls);
  renderNoteStudentChecks(cls);
  renderEntries(cls);
}
function renderRoster(cls){
  rosterChips.innerHTML = '';
  (cls.roster||[]).forEach(name=>{
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${escapeHtml(name)} <button class="icon-btn" title="Remove ${escapeHtml(name)}">✕</button>`;
    chip.querySelector('button').addEventListener('click', ()=>{
      cls.roster = (cls.roster||[]).filter(n=>n!==name);
      saveState(state);
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    });
    rosterChips.appendChild(chip);
  });
  const count = cls.roster?.length || 0;
  rosterCount.textContent = `${count} student${count===1?'':'s'}`;
}
function renderNoteStudentChecks(cls){
  noteStudentChecks.innerHTML = '';
  (cls.roster||[]).slice().sort((a,b)=>a.localeCompare(b)).forEach(name=>{
    const id = 'ns_' + name.replace(/\W+/g,'_');
    const wrap = document.createElement('label');
    wrap.className = 'check';
    wrap.innerHTML = `<input type="checkbox" id="${id}" value="${escapeHtml(name)}"> <span>${escapeHtml(name)}</span>`;
    noteStudentChecks.appendChild(wrap);
  });
}
function renderEntries(cls){
  entries.innerHTML = '';
  const list = (state.quickAdds||[]).filter(e=>e.classId===cls.id).slice(0,25);
  if(list.length===0){
    entries.innerHTML = '<div class="field"><span class="mini">No notes yet.</span></div>';
    return;
  }
  list.forEach(e=>{
    const div = document.createElement('div');
    div.className = 'entry';
    const students = (e.students||[]).join(', ') || '—';
    const note = e.note || '—';
    div.innerHTML = `<div class="date">${fmtDate(e.ts)}</div><div>${escapeHtml(note)}</div><div class="mini" style="margin-top:4px">Students: ${escapeHtml(students)}</div>`;
    entries.appendChild(div);
  });
}

// ===== EVENTS (UI ACTIONS) =====
// These events are "guarded" to prevent crashes when the element isn't on the page.

// --- Dashboard Events ---

if (editNameBtn) {
  editNameBtn.addEventListener('click', ()=>{
    const name = prompt('Enter your display name:', state.userName || '');
    if(name!==null){ 
      state.userName = name.trim() || 'Teacher'; 
      userNameEl.textContent = state.userName; 
      saveState(state); 
    }
  });
}

if (exportBtn) {
  exportBtn.addEventListener('click', ()=>{
    const rows = [];
    rows.push(['timestamp','date','classId','className','block','students','note']);
    (state.quickAdds||[]).forEach(e=>{
      const cls = (state.classes||[]).find(c=>c.id===e.classId) || {};
      rows.push([
        e.ts, new Date(e.ts).toISOString(), e.classId || '',
        cls.name || '', cls.block || '',
        (e.students||[]).join('; '), e.note || ''
      ]);
    });
    const csv = rows.map(r=>r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'notes.csv'; a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
}

if (classSelect) {
  classSelect.addEventListener('change', renderStudentChecks);
}

if (addClassBtn) {
  addClassBtn.addEventListener('click', ()=>{
    const name = prompt('Class name (e.g., Intro Physics)'); if(!name) return;
    const block = prompt('Block/Section (e.g., Block 4)') || '';
    const colors = ['var(--tile1)','var(--tile2)','var(--tile3)','var(--tile4)'];
    state.classes.push({ id: cid(), name: name.trim(), block: block.trim(), color: colors[state.classes.length%colors.length], roster: [] });
    saveState(state);
    renderDashboard();
  });
}

if (clearFormBtn) {
  clearFormBtn.addEventListener('click', ()=>{
    document.querySelectorAll('#studentChecks input[type="checkbox"]').forEach(cb=>cb.checked=false);
    quickNote.value='';
    quickStatus.textContent='';
  });
}

if (quickForm) {
  quickForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const c = currentClass();
    if(!c){ return; }
    const chosen = Array.from(studentChecks.querySelectorAll('input:checked')).map(cb=>cb.nextElementSibling.textContent);
    const note = quickNote.value.trim();
    state.quickAdds.unshift({ id: cid(), ts: Date.now(), classId: c.id, students: chosen, note });
    saveState(state);
    quickNote.value='';
    document.querySelectorAll('#studentChecks input[type="checkbox"]').forEach(cb=>cb.checked=false);
    quickStatus.textContent = 'saved';
    setTimeout(()=> quickStatus.textContent = '', 1500);
  });
}

if (scrollToClasses) {
  scrollToClasses.addEventListener('click', ()=>{
    document.getElementById('classesPanel').scrollIntoView({behavior:'smooth', block:'start'});
  });
}


// --- Class Page Events ---

if (clearRosterBtn) {
  clearRosterBtn.addEventListener('click', () => {
    const route = getRoute(); 
    if (route.name !== 'class') return;
    const cls = state.classes.find(c => c.id === route.id); 
    if (!cls) return;
    
    // Use the imported clearRoster function
    if (confirm(`Are you sure you want to remove all ${cls.roster.length} students from this class?\n\nThis cannot be undone.`)) {
      clearRoster(cls); // <-- This is your unit-tested logic!
      saveState(state);  // <-- Use the imported saveState
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    }
  });
}

if (addStudent) {
  addStudent.addEventListener('click', () => {
    const route = getRoute(); 
    if (route.name !== 'class') return;
    const cls = state.classes.find(c => c.id === route.id); 
    if (!cls) return;
    
    const val = newStudent.value.trim();
    if (!val) return; 

    cls.roster = cls.roster || [];
    state.students = state.students || [];

    if (val && !cls.roster.includes(val)) {
      cls.roster.push(val);
      if (!state.students.includes(val)) {
        state.students.push(val);
      }
      saveState(state); 
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    }
    newStudent.value = '';
    newStudent.focus();
  });
}

if (addStudentsBtn) {
  addStudentsBtn.addEventListener('click', () => {
    const route = getRoute(); 
    if (route.name !== 'class') return;
    const cls = state.classes.find(c => c.id === route.id); 
    if (!cls) return;

    const rawText = newStudents.value;
    const names = parseStudentNames(rawText); // <-- Your unit-tested logic
    let addedCount = 0;
    
    cls.roster = cls.roster || [];
    state.students = state.students || [];

    names.forEach(name => {
      if (name && !cls.roster.includes(name)) {
        cls.roster.push(name);
        if (!state.students.includes(name)) {
          state.students.push(name);
        }
        addedCount++;
      }
    });

    if (addedCount > 0) {
      saveState(state);
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    }
    newStudents.value = '';
  });
}

if (saveNote) {
  saveNote.addEventListener('click', ()=>{
    const route = getRoute(); if(route.name!=='class') return;
    const cls = state.classes.find(c=>c.id===route.id); if(!cls) return;
    const chosen = Array.from(noteStudentChecks.querySelectorAll('input:checked')).map(cb=>cb.nextElementSibling.textContent);
    const note = noteText.value.trim();
    state.quickAdds.unshift({ id: cid(), ts: Date.now(), classId: cls.id, students: chosen, note });
    saveState(state);
    noteText.value = '';
    noteStudentChecks.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.checked=false);
    renderEntries(cls);
    noteStatus.textContent = 'saved';
    setTimeout(()=> noteStatus.textContent = '', 1500);
  });
}

if (clearNote) {
  clearNote.addEventListener('click', ()=>{
    noteText.value='';
    noteStudentChecks.querySelectorAll('input[type="checkbox"]').forEach(cb=>cb.checked=false);
    noteStatus.textContent='';
  });
}

if (refresh) {
  refresh.addEventListener('click', ()=>{
    const route = getRoute();
    if(route.name==='class'){
      const cls = state.classes.find(c=>c.id===route.id);
      if(cls) renderEntries(cls);
    }
  });
}

// ===== START THE APP =====
function routeNow(){
  const route = getRoute();
  if(route.name==='dashboard') navigateToDashboard();
  else if(route.name==='class') navigateToClass(route.id);
}
userNameEl.textContent = state.userName || 'Teacher';
routeNow();