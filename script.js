// ===== LIVE PREVIEW =====

const $ = id => document.getElementById(id);

// Simple text bindings
function bindText(inputId, previewId, fallback) {
  const input = $(inputId);
  const preview = $(previewId);
  if (!input || !preview) return;
  input.addEventListener('input', () => {
    preview.textContent = input.value.trim() || fallback;
  });
}

bindText('name', 'previewName', 'Nama Lengkap');
bindText('jobTitle', 'previewJobTitle', 'Jabatan / Profesi');
bindText('email', 'previewEmail', 'email@example.com');
bindText('phone', 'previewPhone', '+62 xxxx');
bindText('address', 'previewAddress', 'Kota, Negara');

// Summary
$('summary').addEventListener('input', () => {
  $('previewSummary').textContent = $('summary').value.trim() || 'Deskripsi singkat tentang diri kamu.';
});

// Sync nama ke halaman 2
$('name').addEventListener('input', () => {
  $('ijazahPageName').textContent = $('name').value.trim() || 'Nama Lengkap';
});

// ===== SKILLS PARSER =====
function renderSkillList(containerId, listId, value) {
  const container = $(containerId);
  const listEl = $(listId);
  if (!listEl) return;
  const items = value.split(',').map(s => s.trim()).filter(Boolean);
  listEl.innerHTML = '';
  if (items.length === 0) { container.style.display = 'none'; return; }
  container.style.display = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listEl.appendChild(li);
  });
}

$('skillsTeknis').addEventListener('input', () => {
  renderSkillList('previewSkillsTeknis', 'previewSkillsTeknisList', $('skillsTeknis').value);
});
$('skillsNonteknis').addEventListener('input', () => {
  renderSkillList('previewSkillsNonteknis', 'previewSkillsNonteknsiList', $('skillsNonteknis').value);
});

// ===== EDUCATION PARSER =====
function parseEducation(text) {
  const container = $('previewEducation');
  if (!text.trim()) {
    container.innerHTML = '<div class="cv-text muted">Riwayat pendidikan.</div>';
    return;
  }
  const blocks = text.trim().split(/\n{2,}/);
  let html = '';
  blocks.forEach(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const date = lines[0] || '';
    let degree = '', school = '';
    if (lines[1]) {
      const parts = lines[1].split(/[–-]/);
      degree = parts[0].trim();
      school = parts.slice(1).join('–').trim();
    }
    html += `<div class="cv-edu-item">
      <div class="cv-edu-date">${escHtml(date)}</div>
      <div class="cv-edu-detail">
        <div class="cv-edu-degree">${escHtml(degree)}</div>
        ${school ? `<div class="cv-edu-school">${escHtml(school)}</div>` : ''}
      </div>
    </div>`;
  });
  container.innerHTML = html || '<div class="cv-text muted">Riwayat pendidikan.</div>';
}
$('education').addEventListener('input', () => parseEducation($('education').value));

// ===== EXPERIENCE PARSER =====
function parseExperience(text) {
  const container = $('previewExperience');
  if (!text.trim()) {
    container.innerHTML = '<div class="cv-text muted">Pengalaman kerja / organisasi.</div>';
    return;
  }
  const blocks = text.trim().split(/\n{2,}/);
  let html = '';
  blocks.forEach(block => {
    const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return;
    const date = lines[0] || '';
    let company = '', role = '', bullets = [];
    if (lines[1]) {
      const parts = lines[1].split(/[–-]/);
      company = parts[0].trim();
      role = parts.slice(1).join('–').trim();
    }
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].replace(/^[•\-\*]\s*/, '');
      if (line) bullets.push(line);
    }
    const bulletsHtml = bullets.length
      ? `<ul class="cv-exp-bullets">${bullets.map(b => `<li>${escHtml(b)}</li>`).join('')}</ul>`
      : '';
    html += `<div class="cv-exp-item">
      <div class="cv-exp-date">${escHtml(date)}</div>
      <div class="cv-exp-detail">
        <div class="cv-exp-company">${escHtml(company)}</div>
        ${role ? `<div class="cv-exp-role">${escHtml(role)}</div>` : ''}
        ${bulletsHtml}
      </div>
    </div>`;
  });
  container.innerHTML = html || '<div class="cv-text muted">Pengalaman kerja / organisasi.</div>';
}
$('experience').addEventListener('input', () => parseExperience($('experience').value));

// ===== PHOTO UPLOAD (CV) =====
const photoInput      = $('photo');
const previewPhoto    = $('previewPhoto');
const photoThumb      = $('photoThumb');
const photoPlaceholder = $('photoPlaceholder');

photoInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', function () {
    const src = reader.result;
    previewPhoto.src = src;
    $('ijazahPagePhoto').src = src; // sync ke halaman 2
    photoThumb.src = src;
    photoThumb.style.display = 'block';
    photoPlaceholder.style.display = 'none';
  });
  reader.readAsDataURL(file);
});

// ===== IJAZAH UPLOAD =====
const ijazahFiles    = [];
const ijazahInput    = $('ijazahInput');
const ijazahThumbList = $('ijazahThumbList');
const ijazahPage     = $('ijazahPage');
const ijazahGrid     = $('previewIjazahGrid');

ijazahInput.addEventListener('change', function () {
  Array.from(this.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      ijazahFiles.push({ id: Date.now() + Math.random(), name: file.name, src: e.target.result });
      renderIjazah();
    };
    reader.readAsDataURL(file);
  });
  this.value = '';
});

function renderIjazah() {
  // Tampilkan / sembunyikan halaman 2
  ijazahPage.style.display = ijazahFiles.length ? 'block' : 'none';

  // Thumbnail strip di sidebar
  ijazahThumbList.innerHTML = '';
  ijazahFiles.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'ijazah-thumb-item';
    wrap.innerHTML = `
      <img src="${item.src}" alt="${escHtml(item.name)}">
      <button class="ijazah-thumb-remove" data-id="${item.id}" title="Hapus">×</button>
    `;
    ijazahThumbList.appendChild(wrap);
  });

  // Grid di halaman 2 preview
  ijazahGrid.innerHTML = '';
  ijazahFiles.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cv-ijazah-item';
    div.innerHTML = `
      <img src="${item.src}" alt="${escHtml(item.name)}">
      <div class="cv-ijazah-caption">${escHtml(item.name)}</div>
    `;
    ijazahGrid.appendChild(div);
  });
}

// Hapus ijazah via thumbnail
ijazahThumbList.addEventListener('click', e => {
  const btn = e.target.closest('.ijazah-thumb-remove');
  if (!btn) return;
  const idx = ijazahFiles.findIndex(f => String(f.id) === String(btn.dataset.id));
  if (idx !== -1) ijazahFiles.splice(idx, 1);
  renderIjazah();
});

// ===== DOWNLOAD PDF — 2 HALAMAN =====

$('downloadBtn').addEventListener('click', async () => {
  const btn = $('downloadBtn');
  btn.disabled = true;
  btn.textContent = '⏳ Memproses...';

  const filename = `CV_${$('name').value.trim() || 'Kandidat'}.pdf`;

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      scrollY: 0,
      backgroundColor: '#ffffff',
      logging: false
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    if (ijazahFiles.length === 0) {
      // 1 halaman — render langsung dari DOM asli
      await html2pdf().from($('cvPage')).set(opt).save();
    } else {
      // 2 halaman — render cvPage dulu jadi canvas, lalu ijazahPage
      const worker = html2pdf().set(opt);

      // Ambil canvas halaman 1
      const canvas1 = await html2canvas($('cvPage'), {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        backgroundColor: '#ffffff'
      });

      // Ambil canvas halaman 2
      const canvas2 = await html2canvas($('ijazahPage'), {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollY: 0,
        backgroundColor: '#ffffff'
      });

      // Gabungkan ke satu PDF
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Halaman 1
      const img1 = canvas1.toDataURL('image/jpeg', 0.98);
      const ratio1 = canvas1.height / canvas1.width;
      const h1 = Math.min(pageW * ratio1, pageH);
      pdf.addImage(img1, 'JPEG', 0, 0, pageW, h1);

      // Halaman 2
      pdf.addPage();
      const img2 = canvas2.toDataURL('image/jpeg', 0.98);
      const ratio2 = canvas2.height / canvas2.width;
      const h2 = Math.min(pageW * ratio2, pageH);
      pdf.addImage(img2, 'JPEG', 0, 0, pageW, h2);

      pdf.save(filename);
    }
  } catch (err) {
    alert('Gagal generate PDF. Coba lagi.');
    console.error(err);
  }

  btn.disabled = false;
  btn.innerHTML = '<span>⬇️</span> Download PDF';
});


// ===== SAVE TO DB =====
$('submitBtn').addEventListener('click', () => {
  const payload = {
    name:       $('name').value.trim(),
    email:      $('email').value.trim(),
    phone:      $('phone').value.trim(),
    address:    $('address').value.trim(),
    summary:    $('summary').value.trim(),
    education:  $('education').value.trim(),
    experience: $('experience').value.trim(),
    skills:     [$('skillsTeknis').value.trim(), $('skillsNonteknis').value.trim()].filter(Boolean).join(' | ')
  };

  fetch('save.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(() => alert('Tidak dapat terhubung ke server.'));
});

// ===== HELPER =====
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}