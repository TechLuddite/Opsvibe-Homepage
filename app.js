'use strict';
const controls = document.querySelector('#controls');
const search = document.querySelector('#search');
const language = document.querySelector('#language');
const projects = [...document.querySelectorAll('[data-kind="project"]')];
const results = document.querySelector('#results');
const empty = document.querySelector('#empty');
function filterProjects() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const project of projects) {
    const matches = project.dataset.search.includes(query) && (!language.value || project.dataset.language === language.value);
    project.hidden = !matches;
    if (matches) count++;
  }
  results.textContent = `${count} projects`;
  empty.hidden = count !== 0;
}
search.addEventListener('input', filterProjects);
language.addEventListener('change', filterProjects);
document.querySelector('#reset').addEventListener('click', () => {
  search.value = '';
  language.value = '';
  filterProjects();
  search.focus();
});
controls.hidden = false;
