'use strict';
(() => {
 const form = document.querySelector('#filters');
 const query = document.querySelector('#query');
 const language = document.querySelector('#language');
 const state = document.querySelector('#state');
 const rows = [...document.querySelectorAll('[data-kind]')];
 const chapters = [...document.querySelectorAll('.chapter')];
 const groups = [...document.querySelectorAll('.chapter,.target-group,.state-group')];
 function update() {
  const q = query.value.trim().toLowerCase();
  let projects = 0, prs = 0;
  for (const row of rows) {
   const project = row.dataset.kind === 'project';
   const scope = project ? !language.value || row.dataset.language === language.value : !state.value || row.dataset.state === state.value;
   row.hidden = !(scope && row.dataset.search.includes(q));
   if (!row.hidden) { if (project) projects++; else prs++; }
  }
  for (const group of groups) group.hidden = ![...group.querySelectorAll('[data-kind]')].some(row => !row.hidden);
  for (const chapter of chapters) if (!chapter.hidden) chapter.open = true;
  document.querySelector('#results').textContent = `${projects} ${projects === 1 ? 'project' : 'projects'} / ${prs} upstream`;
  document.querySelector('#project-empty').hidden = projects !== 0;
  document.querySelector('#pr-empty').hidden = prs !== 0;
 }
 form.addEventListener('submit', event => event.preventDefault());
 query.addEventListener('input', update);
 language.addEventListener('change', update);
 state.addEventListener('change', update);
 form.addEventListener('reset', event => {
  event.preventDefault(); query.value = ''; language.value = ''; state.value = ''; update();
 });
 let printState = null;
 let printFocus = null;
 window.addEventListener('beforeprint', () => {
  if (printState) return;
  printFocus = document.activeElement;
  printState = [...document.querySelectorAll('details')].map(element => [element, element.open]);
  for (const [element] of printState) element.open = true;
 });
 window.addEventListener('afterprint', () => {
  if (!printState) return;
  for (const [element, open] of printState) element.open = open;
  printState = null;
  if (printFocus && printFocus.isConnected) printFocus.focus({preventScroll: true});
  printFocus = null;
 });
 form.hidden = false;
})();
