// ============================================================
// СТРОЙУЧЁТ — ФИНАЛЬНАЯ ВЕРСИЯ С ИСПРАВЛЕННЫМИ КНОПКАМИ
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function showToast(message, duration = 3000) {
    const old = document.getElementById('toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#222',
        color: '#e0e0e0',
        padding: '12px 24px',
        borderRadius: '8px',
        border: '1px solid #c9a959',
        boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
        zIndex: '9999',
        fontSize: '16px',
        maxWidth: '90%',
        textAlign: 'center',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.style.opacity = '1');
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function escapeHtml(s) { if (!s) return ''; const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(s).replace(/[&<>"']/g, c => m[c]); }
function isValidDate(d) { const r = /^\d{4}-\d{2}-\d{2}$/; if (!r.test(d)) return !1; const p = d.split('-'), dt = new Date(+p[0], +p[1] - 1, +p[2]); return dt && dt.getFullYear() == +p[0] && dt.getMonth() == +p[1] - 1 && dt.getDate() == +p[2]; }
function saveUiState() { try { localStorage.setItem('uiState', JSON.stringify(uiState)); } catch (e) {} }
function loadUiState() { try { const s = localStorage.getItem('uiState'); if (s) uiState = JSON.parse(s); } catch (e) {} if (!uiState) uiState = {}; }
function getObject(id) { return objects.find(o => o.id === id); }
function getUserLabel(r) { const m = { boss: 'Руководитель', wolf: 'Волк', client: 'Клиент', designer: 'Дизайнер', master: 'Мастер', purchaser: 'Закупщик', electrician: 'Электрик' }; return m[r] || r; }
function fmt(d) { if (!d) return ''; let dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString(); }
function fmtTime(d) { if (!d) return ''; let dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleString(); }

// ============================================================
// ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
let objects = [];
let reports = [];
let designProjects = [];
let recommendations = [];
let checks = [];
let purchaseOrders = [];
let notes = [];
let electricianTasks = [];
let passwords = { boss: '', wolf: '', client: '', master: '', designer: '', purchaser: '', electrician: '', objects: {} };
let currentUser = null;
let currentObjectId = null;
let uiState = {};
let calendarOffset = 0;

// ============================================================
// СОХРАНЕНИЕ В LOCALSTORAGE
// ============================================================
function saveDataToLocal() {
    try {
        localStorage.setItem('data', JSON.stringify({
            objects, reports, designProjects, recommendations,
            checks, purchaseOrders, notes, electricianTasks, passwords
        }));
    } catch (e) { console.error('Save local error:', e); }
}

function loadDataFromLocal() {
    try {
        const d = JSON.parse(localStorage.getItem('data'));
        if (d) {
            objects = d.objects || [];
            reports = d.reports || [];
            designProjects = d.designProjects || [];
            recommendations = d.recommendations || [];
            checks = d.checks || [];
            purchaseOrders = d.purchaseOrders || [];
            notes = d.notes || [];
            electricianTasks = d.electricianTasks || [];
            passwords = d.passwords || { boss: '', wolf: '', client: '', master: '', designer: '', purchaser: '', electrician: '', objects: {} };
        }
    } catch (e) {}
    if (!objects.length) {
        const n = Date.now();
        objects.push({
            id: n,
            code: 'DEMO',
            name: 'Демо-объект',
            address: 'ул. Примерная, 1',
            works: [{ id: n + 1, name: 'Демонтаж', done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !1 }],
            completed: !1,
            archived: !1
        });
        passwords.objects[n] = 'demo123';
        passwords.boss = 'boss123';
    }
    objects.forEach(o => {
        o.works.forEach(w => {
            if (w.quantity === undefined) w.quantity = '';
            if (w.unit === undefined) w.unit = '';
            if (w.done === undefined) w.done = !1;
            if (w.forElectrician === undefined) w.forElectrician = !1;
            if (w.manual === undefined) w.manual = !1;
        });
    });
    recommendations.forEach(r => { if (!r.photos) r.photos = []; if (!r.purchasedPhotos) r.purchasedPhotos = []; });
    electricianTasks.forEach(t => { if (!t.photos) t.photos = []; if (t.done === undefined) t.done = !1; if (t.objectId === undefined) t.objectId = null; });
    objects.forEach(o => { if (!passwords.objects[o.id]) passwords.objects[o.id] = Math.random().toString(36).substring(2, 8).toUpperCase(); });
    loadUiState();
}

// ============================================================
// СЖАТИЕ ФОТО
// ============================================================
function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let w = img.width,
                    h = img.height;
                const maxSize = 800;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = h * maxSize / w;
                        w = maxSize; } else { w = w * maxSize / h;
                        h = maxSize; }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/webp', 0.7));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================================
// ЗАГРУЗКА ФОТО В STORAGE
// ============================================================
async function uploadPhotoToStorage(objectId, workId, base64Data) {
    try {
        const res = await fetch(base64Data);
        const blob = await res.blob();
        const fileName = `${objectId}/${workId}/${Date.now()}.webp`;
        const formData = new FormData();
        formData.append('file', blob, fileName);

        const response = await fetch(`${SUPABASE_URL}/storage/v1/object/photos/${fileName}`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Ошибка загрузки в Storage:', errorText);
            showToast('❌ Ошибка загрузки фото: ' + errorText);
            return null;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
        console.log('✅ Фото загружено:', publicUrl);
        showToast('✅ Фото загружено в облако');
        return publicUrl;
    } catch (e) {
        console.error('❌ Ошибка uploadPhotoToStorage:', e);
        showToast('❌ Ошибка загрузки фото');
        return null;
    }
}

// ============================================================
// СИНХРОНИЗАЦИЯ С SUPABASE
// ============================================================
async function syncToSupabase() {
    try {
        console.log('🔄 Синхронизация...');
        for (const obj of objects) {
            await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${obj.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    id: obj.id,
                    code: obj.code,
                    name: obj.name,
                    address: obj.address,
                    works: obj.works,
                    completed: obj.completed,
                    archived: obj.archived
                })
            });
        }
        console.log('✅ Синхронизация завершена');
        showToast('✅ Данные синхронизированы с облаком');
    } catch (e) {
        console.error('❌ Ошибка синхронизации:', e);
        showToast('⚠️ Ошибка синхронизации, данные сохранены локально');
    }
}

async function loadFromSupabase() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                objects = data;
                saveDataToLocal();
                showToast('✅ Данные загружены из облака');
                render();
            }
        }
    } catch (e) {
        console.error('Load error:', e);
    }
}

// ============================================================
// РЕНДЕР И ВХОД
// ============================================================
function render() {
    const app = document.getElementById('app');
    if (!currentUser) renderLogin();
    else if (currentUser === 'boss') renderBoss();
    else if (currentUser === 'wolf') renderWolf();
    else if (currentUser === 'client') renderClient();
    else if (currentUser === 'electrician') renderElectrician();
    else if (currentUser === 'master' || currentUser === 'designer' || currentUser === 'purchaser') {
        renderGenericViewer(getUserLabel(currentUser));
    } else renderPlaceholder();
}

function renderLogin() {
    document.getElementById('app').innerHTML = `
    <div class="card" style="text-align:center;padding:30px;">
      <div class="login-header">
        <div class="slogan">Умная система учёта работ<small>управляй строительством с уровнем</small></div>
      </div>
      <hr>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:400px;margin:0 auto;">
        <button class="btn btn-primary" onclick="login('boss')">👔 Руководитель</button>
        <button class="btn" onclick="login('wolf')">🐺 Волк</button>
        <button class="btn" onclick="login('client')">🏠 Клиент</button>
        <button class="btn" onclick="login('master')">🔧 Мастер</button>
        <button class="btn" onclick="login('designer')">🎨 Дизайнер</button>
        <button class="btn" onclick="login('purchaser')">📦 Закупщик</button>
        <button class="btn" onclick="login('electrician')">⚡ Электрик</button>
      </div>
    </div>`;
}

window.login = function(r) {
    if (passwords[r] && passwords[r].length > 0) {
        const p = prompt(`Введите пароль для роли "${getUserLabel(r)}":`);
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
    }
    if (r === 'client') {
        const pwd = prompt('Введите ПАРОЛЬ объекта:');
        if (pwd === null || pwd.trim() === '') { alert('Пароль не введён'); return; }
        let found = null;
        for (let o of objects) {
            if (passwords.objects[o.id] === pwd) { found = o; break; }
        }
        if (!found) { alert('Неверный пароль. Объект не найден.'); return; }
        currentUser = r;
        currentObjectId = found.id;
        render();
    } else {
        currentUser = r;
        render();
    }
};

function renderPlaceholder() {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>${getUserLabel(currentUser)}</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
      <div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div>
    </div>`;
}

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ И ЭТАПАМИ
// ============================================================
window.addObject = function() {
    const n = prompt('Название объекта:');
    if (!n) return;
    const a = prompt('Адрес:');
    if (!a) return;
    let pwd = prompt('Пароль для входа:');
    if (pwd === null) return;
    pwd = pwd.trim();
    if (!pwd) { pwd = Math.random().toString(36).substring(2, 8).toUpperCase();
        showToast('Пароль: ' + pwd); }
    const id = Date.now();
    objects.push({ id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: !1, archived: !1 });
    passwords.objects[id] = pwd;
    saveDataToLocal();
    syncToSupabase();
    renderBossObjects();
    showToast('✅ Объект создан');
};

window.addWork = function(id) {
    const n = prompt('Название этапа');
    if (n) {
        const o = getObject(id);
        if (o) {
            o.works.push({ id: Date.now(), name: n, done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !0 });
            saveDataToLocal();
            syncToSupabase();
            renderBossObjects();
            showToast('➕ Этап добавлен');
        }
    }
};

window.toggleWorkStatus = function(id, wi) {
    const o = getObject(id);
    if (o) {
        o.works[wi].done = !o.works[wi].done;
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
    }
};

window.setWorkDeadline = function(id, wi) {
    const d = prompt('Дата (ГГГГ-ММ-ДД)');
    if (d) {
        if (!isValidDate(d)) { showToast('Неверный формат даты'); return; }
        const o = getObject(id);
        if (o) {
            o.works[wi].deadline = d;
            saveDataToLocal();
            syncToSupabase();
            renderBossObjects();
            showToast('📅 Срок установлен');
        }
    }
};

window.deleteWorkPhoto = function(id) {
    if (confirm('Удалить фото?')) {
        reports = reports.filter(r => r.id !== id);
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast('🗑 Фото удалено');
    }
};

window.deleteObjectPermanently = function(id) {
    if (confirm('Удалить объект без возможности восстановления?')) {
        objects = objects.filter(o => o.id !== id);
        reports = reports.filter(r => r.objectId !== id);
        designProjects = designProjects.filter(p => p.objectId !== id);
        recommendations = recommendations.filter(r => r.objectId !== id);
        purchaseOrders = purchaseOrders.filter(o => o.objectId !== id);
        checks = checks.filter(c => c.objectId !== id);
        electricianTasks = electricianTasks.filter(t => t.objectId !== id);
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast('🗑 Объект удалён');
    }
};

window.toggleElectrician = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const work = obj.works[idx];
    if (work) {
        work.forElectrician = !work.forElectrician;
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast(work.forElectrician ? '✅ Этап назначен электрику' : '❌ Назначение электрику снято');
    }
};

window.setWorkFilter = function(objId, filter) { uiState['filter-' + objId] = filter;
    saveUiState();
    renderBossObjects(); };

window.moveWorkUp = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx <= 0) return;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    syncToSupabase();
    renderBossObjects(); };

window.moveWorkDown = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx >= works.length - 1) return;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    syncToSupabase();
    renderBossObjects(); };

window.completeObject = function(id) {
    const o = getObject(id);
    if (o) {
        o.completed = !o.completed;
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast(o.completed ? '✅ Объект сдан' : '↩ Объект возвращён в работу');
    }
};

window.archiveObject = function(id) {
    if (confirm('Отправить объект в архив?')) {
        const o = getObject(id);
        if (o) {
            o.archived = !0;
            saveDataToLocal();
            syncToSupabase();
            renderBossObjects();
            showToast('📦 Объект в архиве');
        }
    }
};

window.unarchiveObject = function(id) {
    const o = getObject(id);
    if (o) { o.archived = false;
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast('Объект возвращён из архива'); }
};

window.setBossObjectFilter = function(filter) {
    uiState['bossObjectFilter'] = filter;
    saveUiState();
    renderBossObjects();
};

window.deleteWorkWithConfirm = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const work = obj.works[idx];
    if (!work) return;
    if (confirm('Удалить этап "' + work.name + '" ?')) {
        obj.works.splice(idx, 1);
        saveDataToLocal();
        syncToSupabase();
        renderBossObjects();
        showToast('🗑 Этап удалён');
    }
};

window.scrollToObject = function(v) {
    if (!v) return;
    const el = document.getElementById(v);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        uiState[v] = !0;
        saveUiState();
        renderBossObjects();
    }
};

// ============================================================
// ЗАГРУЗКА ФОТО ДЛЯ ЭТАПА (ОБНОВЛЁННАЯ)
// ============================================================
window.uploadWorkPhoto = async function(id, wi) {
    const o = getObject(id);
    if (!o) return;
    const work = o.works[wi];
    if (!work) return;

    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);

    inp.onchange = async function(e) {
        const files = e.target.files;
        if (!files.length) { inp.remove(); return; }
        showToast('⏳ Загрузка ' + files.length + ' фото...');

        let uploadedCount = 0;

        for (let f of files) {
            try {
                console.log('📸 Обработка файла:', f.name);
                const compressed = await compressImage(f);
                const publicUrl = await uploadPhotoToStorage(id, work.id, compressed);

                if (publicUrl) {
                    reports.push({
                        id: Date.now() + Math.random() * 1000,
                        objectId: id,
                        workId: work.id,
                        photos: [publicUrl],
                        text: '',
                        date: new Date(),
                        approved: true
                    });
                    uploadedCount++;
                }
            } catch (err) {
                console.error('❌ Ошибка при загрузке файла:', err);
                showToast('❌ Ошибка загрузки: ' + f.name);
            }
        }

        if (uploadedCount > 0) {
            saveDataToLocal();
            await syncToSupabase();
            showToast('📸 Загружено ' + uploadedCount + ' фото');
            renderBossObjects();
        } else {
            showToast('❌ Не удалось загрузить фото');
        }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

// ============================================================
// БОСС
// ============================================================
function renderBoss() {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>👔 Руководитель</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
    </div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки (отчёт)</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="passwords">🔐 Пароли</div>
    </div>
    <div id="bossContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        switch (this.dataset.tab) {
            case 'objects':
                renderBossObjects();
                break;
            case 'notes':
                renderBossNotes();
                break;
            case 'purchases':
                renderBossPurchases();
                break;
            case 'checks':
                renderBossChecks();
                break;
            case 'passwords':
                renderPasswords();
                break;
        }
    });
    renderBossObjects();
}

function renderBossObjects() {
    const container = document.getElementById('bossContent');
    if (!uiState['bossObjectFilter']) uiState['bossObjectFilter'] = 'active';
    const filter = uiState['bossObjectFilter'];
    let objectsToShow = [];
    if (filter === 'active') objectsToShow = objects.filter(o => !o.archived && !o.completed);
    else if (filter === 'completed') objectsToShow = objects.filter(o => !o.archived && o.completed);
    else if (filter === 'archived') objectsToShow = objects.filter(o => o.archived);
    const filterTabs = `<div class="obj-filter-tabs"><span class="tab ${filter === 'active' ? 'active' : ''}" onclick="setBossObjectFilter('active')">Активные</span><span class="tab ${filter === 'completed' ? 'active' : ''}" onclick="setBossObjectFilter('completed')">Сданные</span><span class="tab ${filter === 'archived' ? 'active' : ''}" onclick="setBossObjectFilter('archived')">Архив</span></div>`;
    let sel = `<div class="flex" style="margin-bottom:16px;"><button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button><button class="btn" onclick="uploadCSV()">📊 Загрузить CSV</button><select class="object-selector" id="objectSelector" onchange="scrollToObject(this.value)"><option value="">— Перейти к объекту —</option>${objects.map(o => `<option value="obj-${o.id}">${escapeHtml(o.name)} (${escapeHtml(o.code)})</option>`).join('')}</select></div>`;
    let list = objectsToShow.map(obj => {
        const objKey = 'obj-' + obj.id,
            objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        const projs = designProjects.filter(p => p.objectId === obj.id);
        const designKey = 'design-' + obj.id,
            designOpen = uiState[designKey] !== undefined ? uiState[designKey] : false;
        let designBlocks = projs.length ? projs.map(p => {
            const roles = p.roles ? p.roles.map(r => getUserLabel(r)).join(', ') : 'все';
            const comments = (p.comments || []).map(c => `<div><b>${escapeHtml(c.author)}</b> ${escapeHtml(c.text)} <small style="color:#888;">${fmt(c.date)}</small></div>`).join('');
            const files = (p.files || []).map((f, fi) => {
                const isImg = f.startsWith('data:image/') || f.startsWith('http');
                const isPdf = f.startsWith('data:application/pdf');
                return `<span class="file-wrap">${isImg ? `<img src="${f}" onclick="showModal('${f}')" style="max-width:100px;max-height:100px;">` : isPdf ? `<span class="pdf" onclick="window.open('${f}','_blank')">📄</span>` : `<span class="pdf" onclick="window.open('${f}','_blank')">📎</span>`}<button class="del" onclick="deleteDesignFile(${p.id},${fi})" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>`;
            }).join(' ') || 'нет';
            return `<div class="design-block"><div class="design-header" onclick="toggleDesignBlock(this,'${designKey}')"><span><span class="design-title">${escapeHtml(p.title)}</span><span class="badge">${p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает'}</span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span></span><div><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteDesign(${p.id})">🗑</button></div></div><div class="design-detail ${designOpen ? 'open' : ''}"><div class="design-meta"><b>Доступ:</b> ${escapeHtml(roles)}</div><div class="design-files"><b>Файлы:</b> ${files}</div><div><b>Комментарии:</b> ${comments || 'нет'}</div><div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;"><button class="btn btn-sm" onclick="addDesignComment(${p.id})">💬 Комментарий</button><button class="btn btn-sm" onclick="toggleDesignApprove(${p.id})">${p.approvedByClient ? 'Снять утверждение' : 'Утвердить'}</button></div></div></div>`;
        }).join('') : '<span style="color:#666;font-size:14px;">Нет проектов</span>';
        const recs = recommendations.filter(r => r.objectId === obj.id);
        const recKey = 'rec-' + obj.id,
            recOpen = uiState[recKey] !== undefined ? uiState[recKey] : false;
        let recBlocks = recs.length ? recs.map(r => {
            const status = r.purchased ? '✅ Куплено' : (r.purchasedDate ? '⏳ Ожидается до ' + fmt(r.purchasedDate) : '❌ Не куплено');
            const phRec = (r.photos || []).map((p, pi) => `<span class="pw"><img src="${p}" onclick="showModal('${p}')"><button class="del" onclick="deleteRecommendPhoto(${r.id},${pi},'photos')">×</button></span>`).join('');
            const phPur = (r.purchasedPhotos || []).map((p, pi) => `<span class="pw"><img src="${p}" onclick="showModal('${p}')"><button class="del" onclick="deleteRecommendPhoto(${r.id},${pi},'purchasedPhotos')">×</button></span>`).join('');
            return `<div class="rec-block"><div class="rec-header" onclick="toggleRecBlock(this,'${recKey}')"><span><span class="rec-title">📋 ${escapeHtml(r.text)}</span><span class="badge">${status}</span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span></span><div><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteRecommend(${r.id})">🗑</button></div></div><div class="rec-detail ${recOpen ? 'open' : ''}"><div class="rec-body"><div class="rec-text"><div class="rec-meta"><b>Срок:</b> ${r.deadline ? fmt(r.deadline) : 'не указан'}</div><div class="rec-actions"><button class="btn btn-sm" onclick="markPurchased(${r.id})">✅ Отметить куплено</button><button class="btn btn-sm" onclick="addRecommendationPhoto(${r.id})">📎 Фото к рекомендации</button><button class="btn btn-sm" onclick="addPurchasedPhoto(${r.id})">📸 Фото покупки</button></div></div><div class="rec-photos">${phRec}${phPur}</div></div></div></div>`;
        }).join('') : '<span style="color:#666;font-size:14px;">Нет рекомендаций</span>';
        const statusTabs = `<div class="flex" style="margin:8px 0;"><button class="btn btn-sm btn-primary" onclick="setWorkFilter('${obj.id}','all')">Все</button><button class="btn btn-sm" onclick="setWorkFilter('${obj.id}','done')">✅ Выполненные</button><button class="btn btn-sm" onclick="setWorkFilter('${obj.id}','undone')">⏳ Не выполненные</button><button class="btn btn-sm" onclick="setWorkFilter('${obj.id}','unpaid')">💰 Неоплаченные (ручные)</button></div>`;
        if (!uiState['filter-' + obj.id]) uiState['filter-' + obj.id] = 'all';
        const currentFilter = uiState['filter-' + obj.id] || 'all';
        let filteredWorks = obj.works;
        if (currentFilter === 'done') filteredWorks = obj.works.filter(w => w.done === true);
        else if (currentFilter === 'undone') filteredWorks = obj.works.filter(w => w.done === false);
        else if (currentFilter === 'unpaid') filteredWorks = obj.works.filter(w => w.manual === true && w.done === false);
        const worksHtml = filteredWorks.map((w, wi) => {
            const originalIndex = obj.works.indexOf(w);
            const wKey = 'work-' + obj.id + '-' + wi;
            const wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
            const hasPhoto = photos.length > 0;
            const phHtml = photos.map(r => `<span class="pw"><img src="${r.photos[0]}" onclick="showModal('${r.photos[0]}')"><button class="del" onclick="deleteWorkPhoto(${r.id})">×</button><span class="status-badge">${r.approved ? '✅ одобр.' : '⏳ модер.'}</span></span>`).join('');
            const electricianLabel = w.forElectrician ? '⚡' : '';
            return `<div class="work-block" draggable="true" data-object-id="${obj.id}" data-work-index="${originalIndex}" data-work-id="${w.id}">
                <div class="work-header" onclick="toggleWork(event, this, '${wKey}')">
                    <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;">
                        <span class="drag-handle" title="Перетащить">⠿</span>
                        <span class="work-title">${escapeHtml(w.name)}</span>
                        ${w.quantity ? ` <span class="work-quantity">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''}
                        <span class="work-status-check" onclick="event.stopPropagation();toggleWorkStatus(${obj.id},${originalIndex})">${w.done ? '☑' : '☐'}</span>
                        <span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(${obj.id},${originalIndex})" title="Назначить электрику">${electricianLabel || '⚡'}</span>
                        ${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}
                        <span class="photo-indicator ${hasPhoto ? 'has-photo' : ''}" title="${hasPhoto ? 'Есть фото' : 'Нет фото'}"></span>
                        <span class="work-arrow ${wOpen ? 'open' : ''}">▶</span>
                    </span>
                    <span style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;">
                        <button class="icon-btn" onclick="event.stopPropagation();uploadWorkPhoto(${obj.id},${originalIndex})" title="Загрузить фото">📸</button>
                        <button class="icon-btn" onclick="event.stopPropagation();setWorkDeadline(${obj.id},${originalIndex})" title="Срок">📅</button>
                        <button class="icon-btn" onclick="event.stopPropagation();moveWorkUp(${obj.id},${originalIndex})" title="Вверх">⬆</button>
                        <button class="icon-btn" onclick="event.stopPropagation();moveWorkDown(${obj.id},${originalIndex})" title="Вниз">⬇</button>
                        <button class="icon-btn danger" onclick="event.stopPropagation();deleteWorkWithConfirm(${obj.id},${originalIndex})" title="Удалить этап">🗑</button>
                    </span>
                </div>
                <div class="work-detail ${wOpen ? 'open' : ''}">
                    <div style="margin:6px 0;"><b>📸 Фото:</b></div>
                    <div class="photo-grid">${phHtml || 'Нет фото'}</div>
                </div>
            </div>`;
        }).join('');
        setTimeout(() => initDragDrop(), 50);
        const addButtons = `<div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-sm btn-primary" onclick="addDesignProjectForObject(${obj.id})">➕ Дизайн-проект</button><button class="btn btn-sm btn-primary" onclick="addRecommendationForObject(${obj.id})">➕ Рекомендация</button></div>`;
        let archiveButtons = '';
        if (obj.archived) {
            archiveButtons = `<button class="btn btn-sm" onclick="event.stopPropagation();unarchiveObject(${obj.id})">↩ Вернуть из архива</button><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteObjectPermanently(${obj.id})">🗑 Удалить</button>`;
        }
        return `<div class="card" id="obj-${obj.id}"><div class="object-header" onclick="toggleObject(this,'${objKey}')"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="font-weight:300;color:#888;">(${escapeHtml(obj.code)})</span><span class="arrow ${objOpen ? 'open' : ''}">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge">ID: ${obj.id}</span>${!obj.archived ? `<button class="btn btn-sm" onclick="event.stopPropagation();completeObject(${obj.id})">${obj.completed ? 'Вернуть' : 'Сдать'}</button>` : ''}${!obj.archived ? `<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();archiveObject(${obj.id})">📦</button>` : ''}${archiveButtons}<button class="btn btn-sm" onclick="event.stopPropagation();addWork(${obj.id})">➕ Этап</button></div></div><div style="color:#999;font-size:14px;">📍 ${escapeHtml(obj.address)}</div></div><div class="object-detail ${objOpen ? 'open' : ''}">${addButtons}<hr><h4>Дизайн-проекты</h4><div class="design-block-container"><div class="design-block-header" onclick="toggleDesignBlockHeader(this,'${designKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span> Дизайн-проекты (${projs.length})</span></div><div class="design-detail-container ${designOpen ? 'open' : ''}" style="display:${designOpen ? 'block' : 'none'};">${designBlocks}</div></div><hr><h4>Рекомендации</h4><div class="rec-block-container"><div class="rec-block-header" onclick="toggleRecBlockHeader(this,'${recKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span> Рекомендации (${recs.length})</span></div><div class="rec-detail-container ${recOpen ? 'open' : ''}" style="display:${recOpen ? 'block' : 'none'};">${recBlocks}</div></div><hr><h4>Этапы работ</h4>${statusTabs}<div id="work-list-${obj.id}" class="work-list">${worksHtml || '<span style="color:#666;font-size:14px;">Нет этапов</span>'}</div></div></div>`;
    }).join('');
    container.innerHTML = filterTabs + sel + list;
}

// ============================================================
// ФУНКЦИЯ toggleWork (ИСПРАВЛЕННАЯ)
// ============================================================
function toggleWork(e, h, k) {
    if (e) e.stopPropagation();
    const block = h.closest('.work-block');
    if (!block) {
        console.warn('Work block not found');
        return;
    }
    const detail = block.querySelector('.work-detail');
    const arrow = block.querySelector('.work-arrow');
    if (detail) {
        const isOpen = detail.classList.contains('open');
        if (isOpen) {
            detail.classList.remove('open');
            if (arrow) arrow.classList.remove('open');
            uiState[k] = false;
        } else {
            detail.classList.add('open');
            if (arrow) arrow.classList.add('open');
            uiState[k] = true;
        }
        saveUiState();
    } else {
        console.warn('Work detail not found');
    }
}

// ============================================================
// ФУНКЦИИ ДЛЯ ПЕРЕТАСКИВАНИЯ
// ============================================================
function initDragDrop() {
    document.querySelectorAll('.work-block').forEach(b => {
        b.removeEventListener('dragstart', handleDragStart);
        b.removeEventListener('dragend', handleDragEnd);
        b.removeEventListener('dragover', handleDragOver);
        b.removeEventListener('dragenter', handleDragEnter);
        b.removeEventListener('dragleave', handleDragLeave);
        b.removeEventListener('drop', handleDrop);
        b.addEventListener('dragstart', handleDragStart);
        b.addEventListener('dragend', handleDragEnd);
        b.addEventListener('dragover', handleDragOver);
        b.addEventListener('dragenter', handleDragEnter);
        b.addEventListener('dragleave', handleDragLeave);
        b.addEventListener('drop', handleDrop);
    });
}

let draggedElement = null;

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ objectId: parseInt(this.dataset.objectId), workIndex: parseInt(this.dataset.workIndex) }));
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    document.querySelectorAll('.work-block.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    if (!draggedElement || draggedElement === this) return;
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const objectId = data.objectId,
        fromIndex = data.workIndex,
        toBlock = this,
        toIndex = parseInt(toBlock.dataset.workIndex);
    if (objectId !== parseInt(toBlock.dataset.objectId)) return;
    const obj = getObject(objectId);
    if (!obj) return;
    const works = obj.works;
    if (fromIndex === toIndex) return;
    const [removed] = works.splice(fromIndex, 1);
    works.splice(toIndex, 0, removed);
    saveDataToLocal();
    syncToSupabase();
    const allOpen = {};
    document.querySelectorAll('.work-block .work-detail.open').forEach(el => {
        const parent = el.closest('.work-block');
        if (parent) {
            const key = 'work-' + parent.dataset.objectId + '-' + parent.dataset.workIndex;
            allOpen[key] = !0;
        }
    });
    Object.assign(uiState, allOpen);
    saveUiState();
    renderBossObjects();
}

function toggleObject(h, k) {
    const d = h.parentElement.querySelector('.object-detail'),
        a = h.querySelector('.arrow');
    if (d) {
        const isOpen = d.classList.contains('open');
        if (isOpen) { d.classList.remove('open'); if (a) a.classList.remove('open');
            uiState[k] = !1; } else { d.classList.add('open'); if (a) a.classList.add('open');
            uiState[k] = !0; }
        saveUiState();
    }
}

function toggleDesignBlock(h, k) {
    const d = h.parentElement.querySelector('.design-detail'),
        a = h.querySelector('.design-arrow');
    if (d) {
        const isOpen = d.classList.contains('open');
        if (isOpen) { d.classList.remove('open'); if (a) a.classList.remove('open');
            uiState[k] = !1; } else { d.classList.add('open'); if (a) a.classList.add('open');
            uiState[k] = !0; }
        saveUiState();
    }
}

function toggleRecBlock(h, k) {
    const d = h.parentElement.querySelector('.rec-detail'),
        a = h.querySelector('.rec-arrow');
    if (d) {
        const isOpen = d.classList.contains('open');
        if (isOpen) { d.classList.remove('open'); if (a) a.classList.remove('open');
            uiState[k] = !1; } else { d.classList.add('open'); if (a) a.classList.add('open');
            uiState[k] = !0; }
        saveUiState();
    }
}

function toggleDesignBlockHeader(h, k) {
    const c = h.parentElement.querySelector('.design-detail-container'),
        a = h.querySelector('.design-arrow');
    if (c) {
        const isOpen = c.classList.contains('open');
        if (isOpen) { c.classList.remove('open');
            c.style.display = 'none'; if (a) a.classList.remove('open');
            uiState[k] = !1; } else { c.classList.add('open');
            c.style.display = 'block'; if (a) a.classList.add('open');
            uiState[k] = !0; }
        saveUiState();
    }
}

function toggleRecBlockHeader(h, k) {
    const c = h.parentElement.querySelector('.rec-detail-container'),
        a = h.querySelector('.rec-arrow');
    if (c) {
        const isOpen = c.classList.contains('open');
        if (isOpen) { c.classList.remove('open');
            c.style.display = 'none'; if (a) a.classList.remove('open');
            uiState[k] = !1; } else { c.classList.add('open');
            c.style.display = 'block'; if (a) a.classList.add('open');
            uiState[k] = !0; }
        saveUiState();
    }
}

function showModal(src) {
    let m = document.getElementById('modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal';
        m.className = 'modal';
        m.onclick = e => { if (e.target === m) m.remove(); };
        document.body.appendChild(m);
    }
    m.innerHTML = `<img src="${src}">`;
    m.style.display = 'flex';
}

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (ДИЗАЙН, РЕКОМЕНДАЦИИ, ЧЕКИ, ПАРОЛИ, ЗАМЕТКИ)
// ============================================================
// ... (все остальные функции остаются без изменений, я не стал их копировать, чтобы не перегружать сообщение, но в полной версии они все есть)

// ============================================================
// ЗАПУСК
// ============================================================
loadDataFromLocal();
loadFromSupabase();
render();

