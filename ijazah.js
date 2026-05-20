// ===== IJAZAH MANAGER =====

const ijazahList = [];

const ijazahInput    = document.getElementById('ijazahInput');
const uploadZone     = document.getElementById('uploadZone');
const uploadFilename = document.getElementById('uploadFilename');
const gallery        = document.getElementById('ijazahGallery');
const sidebarList    = document.getElementById('ijazahListSidebar');
const sidebarEmpty   = document.getElementById('sidebarEmpty');
const countLabel     = document.getElementById('countLabel');
const clearAllBtn    = document.getElementById('clearAllBtn');
const lightbox       = document.getElementById('lightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxClose  = document.getElementById('lightboxClose');

// ===== HANDLE FILE INPUT =====
ijazahInput.addEventListener('change', function () {
  const files = Array.from(this.files);
  if (!files.length) return;
  uploadFilename.style.display = 'block';
  uploadFilename.textContent = `${files.length} file dipilih...`;
  uploadZone.classList.add('has-file');
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      ijazahList.push({ id: Date.now() + Math.random(), name: file.name, src: e.target.result });
      renderAll();
    };
    reader.readAsDataURL(file);
  });
  this.value = '';
});

// ===== RENDER ALL =====
function renderAll() {
  countLabel.textContent = ijazahList.length;

  // Sidebar chips
  sidebarList.innerHTML = '';
  if (ijazahList.length === 0) {
    sidebarEmpty.style.display = '';
    sidebarList.appendChild(sidebarEmpty);
  } else {
    sidebarEmpty.style.display = 'none';
    ijazahList.forEach(item => {
      const chip = document.createElement('div');
      chip.className = 'ijazah-chip';
      chip.innerHTML = `
        <span class="ijazah-chip-name" title="${escHtml(item.name)}">📄 ${escHtml(item.name)}</span>
        <button class="btn-remove" data-id="${item.id}" title="Hapus">×</button>
      `;
      sidebarList.appendChild(chip);
    });
  }

  // Gallery cards
  if (ijazahList.length === 0) {
    gallery.innerHTML = `
      <div class="gallery-empty">
        <div class="gallery-empty-icon">📂</div>
        <h3>Belum ada ijazah</h3>
        <p>Upload foto/scan ijazah dari sidebar kiri.</p>
      </div>`;
    return;
  }

  gallery.innerHTML = '';
  ijazahList.forEach(item => {
    const card = document.createElement('div');
    card.className = 'ijazah-card';
    card.innerHTML = `
      <div class="ijazah-card-img-wrap">
        <img src="${item.src}" alt="${escHtml(item.name)}" data-id="${item.id}">
      </div>
      <div class="ijazah-card-footer">
        <span class="ijazah-card-label" title="${escHtml(item.name)}">📄 ${escHtml(item.name)}</span>
        <button class="btn-card-remove" data-id="${item.id}" title="Hapus">🗑️</button>
      </div>
    `;
    gallery.appendChild(card);
  });
}

// ===== EVENT DELEGATION — REMOVE =====
sidebarList.addEventListener('click', e => {
  const btn = e.target.closest('.btn-remove');
  if (!btn) return;
  removeById(btn.dataset.id);
});

gallery.addEventListener('click', e => {
  const removeBtn = e.target.closest('.btn-card-remove');
  if (removeBtn) { removeById(removeBtn.dataset.id); return; }
  const img = e.target.closest('img[data-id]');
  if (img) openLightbox(img.src);
});

function removeById(id) {
  const idx = ijazahList.findIndex(item => String(item.id) === String(id));
  if (idx !== -1) ijazahList.splice(idx, 1);
  renderAll();
  if (ijazahList.length === 0) {
    uploadZone.classList.remove('has-file');
    uploadFilename.style.display = 'none';
  }
}

// ===== CLEAR ALL =====
clearAllBtn.addEventListener('click', () => {
  if (!ijazahList.length) return;
  if (!confirm('Hapus semua ijazah?')) return;
  ijazahList.length = 0;
  uploadZone.classList.remove('has-file');
  uploadFilename.style.display = 'none';
  renderAll();
});

// ===== LIGHTBOX =====
function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add('open');
}
lightboxClose.addEventListener('click', () => lightbox.classList.remove('open'));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.classList.remove('open'); });

// ===== DRAG & DROP =====
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('has-file'); });
uploadZone.addEventListener('dragleave', () => { if (!ijazahList.length) uploadZone.classList.remove('has-file'); });
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        ijazahList.push({ id: Date.now() + Math.random(), name: file.name, src: ev.target.result });
        renderAll();
      };
      reader.readAsDataURL(file);
    });
});

// ===== HELPER =====
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}