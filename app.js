'use strict';
const search = document.querySelector('#search');
const projects = [...document.querySelectorAll('[data-kind="project"]')];
function applyFilters() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  projects.forEach(project => {
    const language = document.querySelector('#language').value;
    project.hidden = !project.dataset.search.includes(query) || (language !== '' && project.dataset.language !== language);
    if (!project.hidden) count++;
  });
  document.querySelectorAll('.chapter').forEach(chapter => {
    const visible = !!chapter.querySelector('[data-kind="project"]:not([hidden])');
    chapter.hidden = !visible;
    document.querySelector(`.alphabet a[href="#${chapter.id}"]`).hidden = !visible;
  });
  document.querySelector('#results').textContent = `${count} projects`;
  document.querySelector('#empty').hidden = count !== 0;
}
search.addEventListener('input', applyFilters);
document.querySelector('#language').addEventListener('change', applyFilters);
document.querySelector('#reset').addEventListener('click', () => {
  search.value = '';
  document.querySelector('#language').value = '';
  applyFilters();
  search.focus();
});
document.querySelector('#controls').hidden = false;
