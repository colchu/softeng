/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals';

// ------- MOCKED STATE & HELPERS -------

const mockState = {
  userName: 'Test Teacher',
  classes: [
    {
      id: 'c1',
      name: 'Physics',
      block: 'Block 4',
      color: 'var(--tile1)',
      roster: ['Alice', 'Bob'],
    },
  ],
  quickAdds: [],
  students: [],
};

const saveStateMock = jest.fn();
const clearRosterMock = jest.fn(cls => {
  // emulate real behavior: empty the roster
  cls.roster = [];
});
const parseStudentNamesMock = jest.fn(text =>
  text
    .split(/\r?\n|,/)
    .map(s => s.trim())
    .filter(Boolean)
);

// ------- ESM MOCKS FOR utils.js & storage.js -------

jest.unstable_mockModule('../js/storage.js', () => ({
  loadState: jest.fn(() => mockState),
  saveState: saveStateMock,
}));

jest.unstable_mockModule('../js/utils.js', () => ({
  cid: jest.fn(() => 'cid-1'),
  fmtDate: jest.fn(() => '2024-01-01'),
  escapeHtml: jest.fn(s => s),
  csvEscape: jest.fn(s => `"${s}"`),
  parseStudentNames: parseStudentNamesMock,
  clearRoster: clearRosterMock,
}));

// We will import these AFTER mocks are set up
let appModule;
let utils;
let storage;

// ------- TEST SETUP -------

async function loadAppWithRoute(hash) {
  jest.resetModules();
  saveStateMock.mockClear();
  clearRosterMock.mockClear();
  parseStudentNamesMock.mockClear();

  // Basic DOM skeleton with only the elements app.js actually touches
  document.body.innerHTML = `
    <div id="view-dashboard" class="active"></div>
    <div id="view-class"></div>

    <div id="userName"></div>
    <button id="editNameBtn"></button>
    <button id="exportBtn"></button>

    <select id="classSelect"></select>
    <div id="studentChecks"></div>
    <form id="quickForm"></form>
    <textarea id="quickNote"></textarea>
    <span id="quickStatus"></span>
    <button id="clearFormBtn"></button>
    <button id="addClassBtn"></button>
    <div id="classTiles"></div>
    <template id="tileTemplate">
      <a class="tile-link">
        <div class="tile">
          <h3></h3>
          <span class="rosterCount"></span>
          <button data-delete>Delete</button>
        </div>
      </a>
    </template>

    <div id="classTitle"></div>
    <div id="subtitle"></div>
    <div id="rosterChips"></div>
    <span id="rosterCount"></span>
    <input id="newStudent" />
    <button id="addStudent"></button>
    <textarea id="newStudents"></textarea>
    <button id="addStudentsBtn"></button>
    <button id="clearRosterBtn"></button>
    <div id="noteStudentChecks"></div>
    <textarea id="noteText"></textarea>
    <button id="saveNote"></button>
    <span id="noteStatus"></span>
    <button id="clearNote"></button>
    <button id="refresh"></button>
    <div id="entries"></div>
    <button id="scrollToClasses"></button>
    <div id="classesPanel"></div>
  `;

  // Set the current route before app.js runs
  window.location.hash = hash;

  // Import mocks themselves so we can make assertions later
  storage = await import('../js/storage.js');
  utils = await import('../js/utils.js');

  // Now import app.js – this attaches all event listeners and calls routeNow()
  appModule = await import('../js/app.js');
}

describe('app.js UI behavior', () => {
  test('renders class view when route is #/class/:id', async () => {
    await loadAppWithRoute('#/class/c1');

    const classView = document.getElementById('view-class');
    const dashboardView = document.getElementById('view-dashboard');
    const title = document.getElementById('classTitle').textContent;
    const userName = document.getElementById('userName').textContent;

    expect(classView.classList.contains('active')).toBe(true);
    expect(dashboardView.classList.contains('active')).toBe(false);
    expect(title).toContain('Physics');
    expect(title).toContain('Block 4');
    expect(userName).toBe('Test Teacher');
  });

  test('clicking Clear Roster calls clearRoster and saveState', async () => {
    await loadAppWithRoute('#/class/c1');

    // Pretend the user confirms the dialog
    global.confirm = jest.fn(() => true);

    const btn = document.getElementById('clearRosterBtn');
    btn.click();

    const cls = mockState.classes[0];

    expect(global.confirm).toHaveBeenCalled();
    expect(utils.clearRoster).toHaveBeenCalledTimes(1);
    expect(utils.clearRoster).toHaveBeenCalledWith(cls);
    expect(saveStateMock).toHaveBeenCalledTimes(1);
    expect(saveStateMock).toHaveBeenCalledWith(mockState);
    expect(cls.roster).toEqual([]); // our mock clearRoster empties roster
  });

  test('clicking Add Students uses parseStudentNames and updates roster', async () => {
    await loadAppWithRoute('#/class/c1');

    const textarea = document.getElementById('newStudents');
    textarea.value = 'Charlie\nDana';

    // Our mock parser will be called with the raw text
    parseStudentNamesMock.mockReturnValue(['Charlie', 'Dana']);

    const btn = document.getElementById('addStudentsBtn');
    btn.click();

    const cls = mockState.classes[0];

    expect(parseStudentNamesMock).toHaveBeenCalledTimes(1);
    expect(parseStudentNamesMock).toHaveBeenCalledWith('Charlie\nDana');

    // Existing roster ['Alice','Bob'] plus two new names
    expect(cls.roster).toEqual(['Alice', 'Bob', 'Charlie', 'Dana']);

    // students list also updated
    expect(mockState.students).toEqual(
      expect.arrayContaining(['Alice', 'Bob', 'Charlie', 'Dana'])
    );

    expect(saveStateMock).toHaveBeenCalled();
  });
});