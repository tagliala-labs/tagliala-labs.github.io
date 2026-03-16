const INDEX_PATH = '/content/experiments/index.json';
const CONTENT_BASE = '/content/experiments/';

async function fetchIndex() {
  const response = await fetch(INDEX_PATH, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load index (${response.status})`);
  }
  return response.json();
}

function parseFrontmatter(markdown) {
  const trimmed = markdown.trim();
  if (!trimmed.startsWith('---')) {
    return { meta: {}, body: trimmed };
  }

  const end = trimmed.indexOf('\n---', 3);
  if (end === -1) {
    return { meta: {}, body: trimmed };
  }

  const header = trimmed.slice(3, end).trim();
  const body = trimmed.slice(end + 4).trim();
  const meta = {};

  header.split('\n').forEach((line) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex < 0) {
      return;
    }
    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      meta[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => item.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);
      return;
    }

    meta[key] = rawValue.replace(/^"|"$/g, '');
  });

  return { meta, body };
}

function markdownToHtml(markdown) {
  const lines = markdown.split('\n');
  const html = [];
  let listOpen = false;

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
      return;
    }

    if (trimmed.startsWith('### ')) {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
      html.push(`<h3>${inlineMarkdown(trimmed.slice(4))}</h3>`);
      return;
    }

    if (trimmed.startsWith('## ')) {
      if (listOpen) {
        html.push('</ul>');
        listOpen = false;
      }
      html.push(`<h2>${inlineMarkdown(trimmed.slice(3))}</h2>`);
      return;
    }

    if (trimmed.startsWith('- ')) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inlineMarkdown(trimmed.slice(2))}</li>`);
      return;
    }

    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }

    html.push(`<p>${inlineMarkdown(trimmed)}</p>`);
  });

  if (listOpen) {
    html.push('</ul>');
  }

  return html.join('');
}

function inlineMarkdown(text) {
  const escaped = window.TaglialaUI.escapeHtml(text);
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer noopener">$1</a>');
}

async function loadExperiments() {
  const indexEntries = await fetchIndex();
  const markdownFiles = indexEntries.map(async (entry) => {
    const slug = typeof entry === 'string' ? entry : entry.slug;
    const fileName = typeof entry === 'string' ? `${entry}.md` : entry.file;
    const response = await fetch(`${CONTENT_BASE}${fileName}`, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${fileName}`);
    }

    const source = await response.text();
    const parsed = parseFrontmatter(source);

    return {
      slug,
      ...parsed.meta,
      tags: Array.isArray(parsed.meta.tags) ? parsed.meta.tags : [],
      bodyMarkdown: parsed.body,
      bodyHtml: markdownToHtml(parsed.body)
    };
  });

  const results = await Promise.all(markdownFiles);
  return results.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function uniqValues(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))].sort((a, b) => a.localeCompare(b));
}

function initArchive(experiments) {
  const listElement = document.getElementById('archive-list');
  if (!listElement) {
    return;
  }

  const statusSelect = document.getElementById('status-filter');
  const tagSelect = document.getElementById('tag-filter');
  const sortSelect = document.getElementById('sort-filter');
  const emptyState = document.getElementById('archive-empty');

  const statuses = uniqValues(experiments.map((item) => item.status));
  const tags = uniqValues(experiments.flatMap((item) => item.tags || []));

  statuses.forEach((status) => {
    const option = document.createElement('option');
    option.value = status;
    option.textContent = status;
    statusSelect.append(option);
  });

  tags.forEach((tag) => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagSelect.append(option);
  });

  function render() {
    const selectedStatus = statusSelect.value;
    const selectedTag = tagSelect.value;
    const sortOrder = sortSelect.value;

    let filtered = experiments.filter((item) => {
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      if (selectedTag !== 'all' && !(item.tags || []).includes(selectedTag)) {
        return false;
      }
      return true;
    });

    filtered = filtered.sort((a, b) => {
      const aTime = new Date(a.date).getTime();
      const bTime = new Date(b.date).getTime();
      return sortOrder === 'oldest' ? aTime - bTime : bTime - aTime;
    });

    listElement.innerHTML = filtered.map((item) => window.TaglialaUI.experimentCardTemplate(item)).join('');
    emptyState.hidden = filtered.length !== 0;
  }

  statusSelect.addEventListener('change', render);
  tagSelect.addEventListener('change', render);
  sortSelect.addEventListener('change', render);
  render();
}

function initFeatured(experiments) {
  const featuredRoot = document.getElementById('featured-experiments');
  if (!featuredRoot) {
    return;
  }

  const max = Number(featuredRoot.dataset.limit) || 3;
  featuredRoot.innerHTML = experiments.slice(0, max).map((item) => window.TaglialaUI.experimentCardTemplate(item)).join('');
}

function initDetail(experiments) {
  const detailRoot = document.getElementById('experiment-detail');
  if (!detailRoot) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const errorElement = document.getElementById('detail-error');

  const found = experiments.find((item) => item.slug === slug);
  if (!found) {
    detailRoot.hidden = true;
    errorElement.hidden = false;
    document.title = 'Not Found | Tagliala Labs';
    return;
  }

  document.title = `${found.title} | Tagliala Labs`;

  const tags = (found.tags || []).map((tag) => `<span class="chip">${window.TaglialaUI.escapeHtml(tag)}</span>`).join('');
  const statusClass = String(found.status || 'unknown')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  detailRoot.innerHTML = `
    <header>
      <p class="eyebrow">Field Dispatch</p>
      <h1>${window.TaglialaUI.escapeHtml(found.title)}</h1>
      <div class="meta-line">
        <span class="chip status-${statusClass}">${window.TaglialaUI.escapeHtml(found.status || 'unknown')}</span>
        <span>${window.TaglialaUI.formatDate(found.date)}</span>
        ${tags}
      </div>
      <p class="lead">${window.TaglialaUI.escapeHtml(found.summary || '')}</p>
    </header>
    <section class="body">${found.bodyHtml}</section>
  `;
}

function showFallbackError(error) {
  const targets = [
    document.getElementById('archive-empty'),
    document.getElementById('detail-error')
  ].filter(Boolean);

  targets.forEach((element) => {
    element.hidden = false;
    element.textContent = `Unable to retrieve field dispatches: ${error.message}`;
  });

  const list = document.getElementById('archive-list');
  if (list) {
    list.innerHTML = '';
  }

  const featured = document.getElementById('featured-experiments');
  if (featured) {
    featured.innerHTML = '';
  }
}

loadExperiments()
  .then((experiments) => {
    initArchive(experiments);
    initFeatured(experiments);
    initDetail(experiments);
  })
  .catch((error) => {
    showFallbackError(error);
  });
