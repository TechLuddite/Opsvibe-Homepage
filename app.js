'use strict';
const search = document.querySelector('#search');
const dossiers = [...document.querySelectorAll('#projects details')];
const apply = () => {
  const query = search.value.trim().toLocaleLowerCase();
  const scope = document.querySelector('#scope').value;
  let count = 0;
  for (const dossier of dossiers) {
    const scopeMatches = scope === 'all' ||
      (scope === 'archived' && dossier.dataset.archived === 'true') ||
      (scope === 'website' && dossier.dataset.website === 'true');
    const matches = scopeMatches && dossier.textContent.toLocaleLowerCase().includes(query);
    dossier.hidden = !matches;
    if (matches) count++;
  }
  document.querySelector('#count').textContent = `${count} repositories shown`;
  document.querySelector('#empty').hidden = count !== 0;
};
search.addEventListener('input', apply);
document.querySelector('#scope').addEventListener('change', apply);
