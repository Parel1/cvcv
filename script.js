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

// ===== SKILLS PARSER =====
// Parses "skill1, skill2, skill3" → <li> list

function renderSkillList(containerId, listId, value, groupTitle) {
  const container = $(containerId);
  const listEl = $(listId);
  if (!listEl) return;
  const items = value.split(',').map(s => s.trim()).filter(Boolean);
  listEl.innerHTML = '';
  if (items.length === 0) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listEl.appendChild(li);
  });
}

$('skillsTeknis').addEventListener('input', () => {
  renderSkillList('previewSkillsTeknis', 'previewSkillsTeknisList', $('skillsTeknis').value, 'Teknis');
});

$('skillsNonteknis').addEventListener('input', () => {
  renderSkillList('previewSkillsNonteknis', 'previewSkillsNonteknsiList', $('skillsNonteknis').value, 'Nonteknis');
});

// ===== EDUCATION PARSER =====
// Parses textarea with format: "Date\nDegree – School\n\nDate\nDegree – School"

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
    if (lines.length === 0) return;
    const date = lines[0] || '';
    // Expect lines[1] = "Degree – School" or separate lines
    let degree = '', school = '';
    if (lines[1]) {
      const parts = lines[1].split(/[–-]/);
      degree = parts[0].trim();
      school = parts.slice(1).join('–').trim();
    }
    if (!degree && !school && lines[1]) { degree = lines[1]; }

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

$('education').addEventListener('input', () => {
  parseEducation($('education').value);
});

// ===== EXPERIENCE PARSER =====
// Format: "Date\nCompany, City – Role\n• bullet\n• bullet\n\nDate\n..."

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
    if (lines.length === 0) return;
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

$('experience').addEventListener('input', () => {
  parseExperience($('experience').value);
});

// ===== PHOTO UPLOAD =====
const photoInput = $('photo');
const previewPhoto = $('previewPhoto');
const photoThumb = $('photoThumb');
const photoPlaceholder = $('photoPlaceholder');

photoInput.addEventListener('change', function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener('load', function () {
    const src = reader.result;
    previewPhoto.src = src;
    photoThumb.src = src;
    photoThumb.style.display = 'block';
    photoPlaceholder.style.display = 'none';
  });
  reader.readAsDataURL(file);
});

// ===== DOWNLOAD PDF =====
// Remove buttons from preview before capture, restore after

$('downloadBtn').addEventListener('click', () => {
  const cvPage = $('cvPage');

  const opt = {
    margin: 0,
    filename: `CV_${$('name').value.trim() || 'Kandidat'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 3,
      useCORS: true,
      scrollY: 0,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    }
  };

  html2pdf().from(cvPage).set(opt).save();
});

// ===== SAVE TO DB (save.php) =====
$('submitBtn').addEventListener('click', () => {
  const payload = {
    name: $('name').value.trim(),
    email: $('email').value.trim(),
    phone: $('phone').value.trim(),
    address: $('address').value.trim(),
    summary: $('summary').value.trim(),
    education: $('education').value.trim(),
    experience: $('experience').value.trim(),
    skills: [$('skillsTeknis').value.trim(), $('skillsNonteknis').value.trim()].filter(Boolean).join(' | ')
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