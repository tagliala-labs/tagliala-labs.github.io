const revealElements = Array.from(document.querySelectorAll('.reveal'));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.12
  }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 70, 420)}ms`;
  observer.observe(element);
});

function normalizeStatusClass(status) {
  return String(status || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');
}

function formatDate(dateText) {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown date';
  }
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(parsed);
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toTagChips(tags = []) {
  return tags
    .map((tag) => `<span class="chip">${escapeHtml(tag)}</span>`)
    .join('');
}

function experimentCardTemplate(experiment) {
  const statusClass = normalizeStatusClass(experiment.status);
  const slug = encodeURIComponent(experiment.slug);

  return `
    <article class="experiment-card">
      <div class="meta-line">
        <span class="chip status-${statusClass}">${escapeHtml(experiment.status || 'unknown')}</span>
        <span>${formatDate(experiment.date)}</span>
      </div>
      <h3 class="card-title">${escapeHtml(experiment.title)}</h3>
      <p>${escapeHtml(experiment.summary || '')}</p>
      <div class="meta-line">${toTagChips(experiment.tags)}</div>
      <a class="btn btn-ghost" href="/experiment.html?slug=${slug}">Read record</a>
    </article>
  `;
}

window.TaglialaUI = {
  experimentCardTemplate,
  formatDate,
  escapeHtml
};
