// ===== IMPORTS =====
// Import pure helpers and parsing/roster logic from utils
import { cid, fmtDate, escapeHtml, csvEscape, parseStudentNames, clearRoster } from './utils.js';
// Import persistence helpers for loading/saving app state
import { loadState, saveState } from './storage.js';

// ===== STATE =====
// Load the entire application state ONCE at startup.
// `state` is a single source of truth for classes, students, and notes.
let state = loadState(); 

// ===== DOM REFS =====
// the rest of the code can assume these variables are references
// to elements on the page (or null if not present).
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
// Very small hash-based router: decides whether we're on the dashboard
// or a specific class page based on location.hash
function getRoute(){
  const hash = location.hash || '#/';
  const parts = hash.slice(2).split('/');
  if(parts[0] === '') return {name:'dashboard'};
  if(parts[0] === 'class' && parts[1]) return {name:'class', id: parts[1]};
  return {name:'dashboard'};
}

// Navigate to dashboard view: show dashboard, hide class view, and re-render
function navigateToDashboard(){
  dashboardView.classList.add('active');
  classView.classList.remove('active');
  renderDashboard();
}

// Navigate to a single class view; if class not found, fall back to dashboard
function navigateToClass(id){
  const cls = state.classes.find(c=>c.id===id);
  if(!cls){ 
    location.hash = '#/'; 
    return; 
  }
  dashboardView.classList.remove('active');
  classView.classList.add('active');
  renderClassView(cls);
}

// Update view whenever the hash changes (user clicks tiles, uses back/forward, etc.)
window.addEventListener('hashchange', ()=> {
  const route = getRoute();
  if(route.name==='dashboard') navigateToDashboard();
  else if(route.name==='class') navigateToClass(route.id);
});

// ===== RENDER: DASHBOARD =====
// Renders the main dashboard view: teacher name, class dropdown, tiles, and student checkboxes
function renderDashboard(){
  // Display teacher name or default
  userNameEl.textContent = state.userName || 'Teacher';

  // Rebuild the class dropdown options
  classSelect.innerHTML = '';
  state.classes.forEach(c=> 
    classSelect.add(new Option(`${c.name} (${c.block})`, c.id))
  );

  // Default selection: first class if nothing else chosen
  if(!classSelect.value && state.classes[0]) {
    classSelect.value = state.classes[0].id;
  }

  // Render list of student checkboxes for the selected class
  renderStudentChecks();
  // Render the class tiles at the bottom of the dashboard
  renderTiles();
}

// Helper to get the currently selected class from the dropdown
function currentClass(){ 
  return state.classes.find(c=>c.id === classSelect.value) || state.classes[0]; 
}

// Render the list of student checkboxes for quick notes on the dashboard
function renderStudentChecks(){
  const c = currentClass();
  studentChecks.innerHTML = '';

  // If there are no classes yet, show a placeholder message
  if(!c){ 
    studentChecks.innerHTML = '<div class="muted">Create a class to begin.</div>'; 
    return; 
  }

  // Sort roster alphabetically and create checkbox rows for each student
  const names = [...(c.roster||[])].sort((a,b)=>a.localeCompare(b));
  names.forEach(name=>{
    const id = 's_' + name.replace(/\W+/g,'_');
    const wrap = document.createElement('label');
    wrap.className = 'check';
    wrap.innerHTML = `<input type="checkbox" id="${id}"> <span>${escapeHtml(name)}</span>`;
    studentChecks.appendChild(wrap);
  });
}

// Render the clickable class tiles on the dashboard (each links to a class page)
function renderTiles(){
  classTiles.innerHTML = '';
  state.classes.forEach((c)=>{
    // Clone the tile template contents
    const node = tileTemplate.content.cloneNode(true);
    const link = node.querySelector('.tile-link');
    const tile = node.querySelector('.tile');
    const h3 = node.querySelector('h3');
    const count = node.querySelector('.rosterCount');
    const delBtn = node.querySelector('[data-delete]');

    // Apply class color + label, roster count, and link
    tile.style.background = c.color || 'var(--tile1)';
    h3.innerHTML = `${escapeHtml(c.name)}<br>${escapeHtml(c.block)}`;
    count.textContent = `${c.roster?.length||0} student${(c.roster?.length||0)===1?'':'s'}`;
    link.href = `#/class/${encodeURIComponent(c.id)}`;

    // Handle class deletion, including its notes
    delBtn.addEventListener('click', (e)=>{
      e.preventDefault(); 
      e.stopPropagation();
      if(confirm(`Delete class: ${c.name} (${c.block})?\nThis will also remove its notes.`)){
        // Remove notes for this class
        state.quickAdds = (state.quickAdds||[]).filter(n => n.classId !== c.id);
        // Remove the class itself
        state.classes = state.classes.filter(x=>x.id!==c.id);
        saveState(state);
        renderDashboard();
      }
    });

    classTiles.appendChild(node);
  });
}

// ===== RENDER: CLASS VIEW =====
// Top-level function that draws the class-specific view:
// title, roster chips, note checklist, and existing entries.
function renderClassView(cls){
  classTitle.textContent = `${cls.name} (${cls.block})`;
  subtitle.textContent = 'Class Page';
  renderRoster(cls);
  renderNoteStudentChecks(cls);
  renderEntries(cls);
}

// Render roster "chips" (pills with names and an X button), and update count
function renderRoster(cls){
  rosterChips.innerHTML = '';
  (cls.roster||[]).forEach(name=>{
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `${escapeHtml(name)} <button class="icon-btn" title="Remove ${escapeHtml(name)}">✕</button>`;

    // Removing a student from roster also re-renders the roster and note checklist
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

// Render checkboxes for each student on the class page's note form
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

// Render up to 25 most recent entries for the class from state.quickAdds
function renderEntries(cls){
  entries.innerHTML = '';
  const list = (state.quickAdds||[])
    .filter(e=>e.classId===cls.id)
    .slice(0,25);

  if(list.length===0){
    entries.innerHTML = '<div class="field"><span class="mini">No notes yet.</span></div>';
    return;
  }

  list.forEach(e=>{
    const div = document.createElement('div');
    div.className = 'entry';
    const students = (e.students||[]).join(', ') || '—';
    const note = e.note || '—';
    div.innerHTML = `
      <div class="date">${fmtDate(e.ts)}</div>
      <div>${escapeHtml(note)}</div>
      <div class="mini" style="margin-top:4px">
        Students: ${escapeHtml(students)}
      </div>`;
    entries.appendChild(div);
  });
}

// ===== EVENTS (UI ACTIONS) =====
// All event listeners are guarded with `if (element)` so the script can run
// even if some elements are missing (e.g., different pages or HTML variations).

// --- Dashboard Events ---

// Edit teacher display name (stored in state.userName)
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

// Export notes as CSV and trigger a download
if (exportBtn) {
  exportBtn.addEventListener('click', ()=>{
    const rows = [];
    rows.push(['timestamp','date','classId','className','block','students','note']);

    (state.quickAdds||[]).forEach(e=>{
      const cls = (state.classes||[]).find(c=>c.id===e.classId) || {};
      rows.push([
        e.ts,
        new Date(e.ts).toISOString(),
        e.classId || '',
        cls.name || '',
        cls.block || '',
        (e.students||[]).join('; '),
        e.note || ''
      ]);
    });

    const csv = rows.map(r=>r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'notes.csv'; 
    a.click();
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  });
}

// Changing the class dropdown should re-render student checkboxes
if (classSelect) {
  classSelect.addEventListener('change', renderStudentChecks);
}

// Add a brand-new empty class based on two prompts (name + block)
if (addClassBtn) {
  addClassBtn.addEventListener('click', ()=>{
    const name = prompt('Class name (e.g., Intro Physics)'); 
    if(!name) return;

    const block = prompt('Block/Section (e.g., Block 4)') || '';
    const colors = ['var(--tile1)','var(--tile2)','var(--tile3)','var(--tile4)'];

    state.classes.push({
      id: cid(),
      name: name.trim(),
      block: block.trim(),
      color: colors[state.classes.length % colors.length],
      roster: []
    });

    saveState(state);
    renderDashboard();
  });
}

// Clear the quick-add form: uncheck all boxes, clear text + status
if (clearFormBtn) {
  clearFormBtn.addEventListener('click', ()=>{
    document
      .querySelectorAll('#studentChecks input[type="checkbox"]')
      .forEach(cb=>cb.checked=false);
    quickNote.value='';
    quickStatus.textContent='';
  });
}

// Handle the quick note form on the dashboard (not class page)
if (quickForm) {
  quickForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const c = currentClass();
    if(!c){ return; }

    // Students selected for this quick note
    const chosen = Array.from(
      studentChecks.querySelectorAll('input:checked')
    ).map(cb=>cb.nextElementSibling.textContent);

    const note = quickNote.value.trim();

    // Prepend newest note to quickAdds
    state.quickAdds.unshift({
      id: cid(),
      ts: Date.now(),
      classId: c.id,
      students: chosen,
      note
    });

    saveState(state);

    // Reset UI
    quickNote.value='';
    document
      .querySelectorAll('#studentChecks input[type="checkbox"]')
      .forEach(cb=>cb.checked=false);

    quickStatus.textContent = 'saved';
    setTimeout(()=> quickStatus.textContent = '', 1500);
  });
}

// Scroll helper to bring the classes panel into view
if (scrollToClasses) {
  scrollToClasses.addEventListener('click', ()=>{
    document
      .getElementById('classesPanel')
      .scrollIntoView({behavior:'smooth', block:'start'});
  });
}


// --- Class Page Events ---

// Clear ENTIRE roster for the current class, using unit-tested clearRoster()
if (clearRosterBtn) {
  clearRosterBtn.addEventListener('click', () => {
    const route = getRoute(); 
    if (route.name !== 'class') return;

    const cls = state.classes.find(c => c.id === route.id); 
    if (!cls) return;
    
    if (confirm(
      `Are you sure you want to remove all ${cls.roster.length} students from this class?\n\nThis cannot be undone.`
    )) {
      // Use the imported clearRoster function (pure logic tested in utils tests)
      clearRoster(cls);
      // Persist to storage, then re-render roster + note checkboxes
      saveState(state);
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    }
  });
}

// Add a single student from the "newStudent" input to the current class
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

    // Avoid duplicates at both class-level and global student-level
    if (val && !cls.roster.includes(val)) {
      cls.roster.push(val);
      if (!state.students.includes(val)) {
        state.students.push(val);
      }
      saveState(state); 
      renderRoster(cls);
      renderNoteStudentChecks(cls);
    }

    // Reset and focus input
    newStudent.value = '';
    newStudent.focus();
  });
}

// Bulk-add students by pasting messy roster text, using parseStudentNames()
if (addStudentsBtn) {
  addStudentsBtn.addEventListener('click', () => {
    const route = getRoute(); 
    if (route.name !== 'class') return;

    const cls = state.classes.find(c => c.id === route.id); 
    if (!cls) return;

    const rawText = newStudents.value;
    // Delegate messy parsing/cleaning to the unit-tested helper
    const names = parseStudentNames(rawText);
    let addedCount = 0;
    
    cls.roster = cls.roster || [];
    state.students = state.students || [];

    // Add only new, non-empty names; keep global student list in sync
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

    // Clear textarea after successful import
    newStudents.value = '';
  });
}

// Save a note on the class page for selected students
if (saveNote) {
  saveNote.addEventListener('click', ()=>{
    const route = getRoute(); 
    if(route.name!=='class') return;

    const cls = state.classes.find(c=>c.id===route.id); 
    if(!cls) return;

    const chosen = Array.from(
      noteStudentChecks.querySelectorAll('input:checked')
    ).map(cb=>cb.nextElementSibling.textContent);

    const note = noteText.value.trim();

    // Prepend newest note to the class’s notes list
    state.quickAdds.unshift({
      id: cid(),
      ts: Date.now(),
      classId: cls.id,
      students: chosen,
      note
    });

    saveState(state);

    // Reset UI and re-render entries
    noteText.value = '';
    noteStudentChecks
      .querySelectorAll('input[type="checkbox"]')
      .forEach(cb=>cb.checked=false);

    renderEntries(cls);

    noteStatus.textContent = 'saved';
    setTimeout(()=> noteStatus.textContent = '', 1500);
  });
}

// Clear note form without saving
if (clearNote) {
  clearNote.addEventListener('click', ()=>{
    noteText.value='';
    noteStudentChecks
      .querySelectorAll('input[type="checkbox"]')
      .forEach(cb=>cb.checked=false);
    noteStatus.textContent='';
  });
}

// Refresh the entries list for the current class (no state changes)
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
// Initial route resolution and first render.
// This is where the app "boots" after the DOM and state are ready.
function routeNow(){
  const route = getRoute();
  if(route.name==='dashboard') navigateToDashboard();
  else if(route.name==='class') navigateToClass(route.id);
}

// Initialize username display and trigger routing/rendering for the first time
userNameEl.textContent = state.userName || 'Teacher';
routeNow();