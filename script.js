// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С СИНХРОНИЗАЦИЕЙ
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// ============================================================
// ДАННЫЕ
// ============================================================
let objects = [];
let reports = [];
let designProjects = [];
let recommendations = [];
let checks = [];
let purchaseOrders = [];
let notes = [];
let electricianTasks = [];
let passwords = { boss: '30986', wolf: '30986', client: '30986', master: '30986', designer: '30986', purchaser: '30986', electrician: '30986', objects: {} };
let currentUser = null;
let currentObjectId = null;
let uiState = {};
let pendingActions = [];
let isSyncing = false;

// ============================================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
// ============================================================
function loadData() {
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
            passwords = d.passwords || { boss: '30986', wolf: '30986', client: '30986', master: '30986', designer: '30986', purchaser: '30986', electrician: '30986', objects: {} };
        }
    } catch(e) {}
    if (!objects.length) {
        const n = Date.now();
        objects.push({ id: n, code: 'DEMO', name: 'Демо-объект', address: 'ул. Примерная, 1', works: [{ id: n + 1, name: 'Демонтаж', done: false }], completed: false, archived: false });
        passwords.objects[n] = 'demo123';
    }
}

function saveData() {
    localStorage.setItem('data', JSON.stringify({
        objects, reports, designProjects, recommendations,
        checks, purchaseOrders, notes, electricianTasks, passwords
    }));
    if (isOnline()) syncToSupabase();
}

// ============================================================
// СИНХРОНИЗАЦИЯ
// ============================================================
async function syncToSupabase() {
    if (isSyncing || !isOnline()) return;
    isSyncing = true;
    try {
        for (const obj of objects) {
            const resp = await fetch(SUPABASE_URL + '/rest/v1/objects?id=eq.' + obj.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const existing = await resp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/objects?id=eq.' + obj.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(obj)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/objects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(obj)
                });
            }
        }
        for (const [role, pwd] of Object.entries(passwords)) {
            if (role === 'objects' || !pwd) continue;
            const resp = await fetch(SUPABASE_URL + '/rest/v1/passwords?role=eq.' + role, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const existing = await resp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/passwords?role=eq.' + role, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify({ password: pwd })
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/passwords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify({ role, password: pwd })
                });
            }
        }
        for (const [objId, pwd] of Object.entries(passwords.objects)) {
            if (!pwd) continue;
            const resp = await fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            const existing = await resp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify({ password: pwd })
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/passwords', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify({ object_id: parseInt(objId), password: pwd })
                });
            }
        }
        console.log('✅ Синхронизация выполнена');
    } catch(e) { console.error('❌ Ошибка синхронизации:', e); }
    isSyncing = false;
}

async function loadFromSupabase() {
    if (!isOnline()) return;
    try {
        const resp = await fetch(SUPABASE_URL + '/rest/v1/objects?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (resp.ok) {
            const data = await resp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = objects.find(o => o.id === item.id);
                    if (!existing) objects.push(item);
                    else Object.assign(existing, item);
                }
                saveData();
            }
        }
        const pwdResp = await fetch(SUPABASE_URL + '/rest/v1/passwords?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (pwdResp.ok) {
            const data = await pwdResp.json();
            for (const item of data) {
                if (item.role) passwords[item.role] = item.password;
                else if (item.object_id) passwords.objects[item.object_id] = item.password;
            }
            saveData();
        }
        console.log('✅ Данные загружены из Supabase');
        render();
    } catch(e) { console.error('❌ Ошибка загрузки:', e); }
}

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ
// ============================================================
function escapeHtml(s) { if (!s) return ''; return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]); }
function getUserLabel(r) { return { boss: 'Руководитель', wolf: 'Волк', client: 'Клиент', designer: 'Дизайнер', master: 'Мастер', purchaser: 'Закупщик', electrician: 'Электрик' }[r] || r; }
function getObject(id) { return objects.find(o => o.id === id); }
function fmt(d) { if (!d) return ''; const dt = new Date(d); return isNaN(dt.getTime()) ? d : dt.toLocaleDateString(); }
function isOnline() { return navigator.onLine; }

function showToast(msg) {
    const old = document.getElementById('toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#222;color:#e0e0e0;padding:12px 24px;border-radius:8px;border:1px solid #c9a959;z-index:9999;font-size:16px;max-width:90%;text-align:center;';
    document.body.appendChild(t);
    setTimeout(() => { t.remove(); }, 3000);
}

// ============================================================
// РЕНДЕР ВХОДА
// ============================================================
function renderLogin() {
    document.getElementById('app').innerHTML = `
    <div class="card" style="text-align:center;padding:30px;">
      <div class="login-header"><div class="slogan">СтройУчёт<small>Умная система учёта работ</small></div></div>
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

function renderBoss() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>👔 Руководитель</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar"><div class="tab active" data-tab="objects">Объекты</div><div class="tab" data-tab="checks">Чеки</div><div class="tab" data-tab="passwords">🔐 Пароли</div></div>
    <div id="bossContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => {
        t.onclick = function() {
            document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
            this.classList.add('active');
            if (this.dataset.tab === 'objects') renderBossObjects();
            else if (this.dataset.tab === 'checks') renderBossChecks();
            else if (this.dataset.tab === 'passwords') renderPasswords();
        };
    });
    renderBossObjects();
}

function renderBossObjects() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    let html = '<div style="margin:12px 0;"><button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button></div>';
    if (!objects.length) {
        container.innerHTML = html + '<div class="card">Нет объектов. Создайте первый.</div>';
        return;
    }
    objects.forEach(obj => {
        html += `<div class="card"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="color:#888;font-weight:300;">(${escapeHtml(obj.code)})</span></h3><span class="badge">ID: ${obj.id}</span></div>
        <div style="color:#999;">📍 ${escapeHtml(obj.address)}</div>
        <div style="margin-top:8px;"><button class="btn btn-sm" onclick="addWork(${obj.id})">➕ Этап</button><button class="btn btn-sm btn-danger" onclick="deleteObject(${obj.id})">🗑</button></div>
        <div style="margin-top:8px;">${obj.works.map((w, wi) => `<div style="background:#121212;border:1px solid #282828;border-radius:6px;padding:8px;margin:4px 0;display:flex;justify-content:space-between;align-items:center;"><span>${escapeHtml(w.name)} ${w.done ? '✅' : '⏳'}</span><button class="btn btn-sm" onclick="toggleWork(${obj.id},${wi})">${w.done ? 'Вернуть' : 'Выполнить'}</button></div>`).join('')}</div>
        </div>`;
    });
    container.innerHTML = html;
}

function renderWolf() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🐺 Волк</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div style="padding:12px;"><div id="wolfObjectsList"></div></div>`;
    const container = document.getElementById('wolfObjectsList');
    if (!container) return;
    if (!objects.length) { container.innerHTML = '<div class="card">Нет объектов</div>'; return; }
    container.innerHTML = objects.filter(o => !o.archived).map(obj => `
        <div class="card"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="color:#888;font-weight:300;">(${escapeHtml(obj.code)})</span></h3></div>
        <div style="color:#999;">📍 ${escapeHtml(obj.address)}</div>
        <div style="margin-top:8px;">${obj.works.map((w, wi) => `<div style="background:#121212;border:1px solid #282828;border-radius:6px;padding:8px;margin:4px 0;display:flex;justify-content:space-between;align-items:center;"><span>${escapeHtml(w.name)} ${w.done ? '✅' : '⏳'}</span><button class="btn btn-sm" onclick="wolfToggleWork(${obj.id},${wi})">${w.done ? 'Вернуть' : 'Выполнить'}</button></div>`).join('')}</div>
        </div>
    `).join('');
}

function renderClient() {
    const obj = getObject(currentObjectId);
    if (!obj) { document.getElementById('app').innerHTML = '<div class="card">Объект не найден</div>'; return; }
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🏠 ${escapeHtml(obj.name)}</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div>📍 ${escapeHtml(obj.address)}</div></div>
    <div style="padding:12px;"><h3>Этапы работ</h3>${obj.works.map(w => `<div style="background:#121212;border:1px solid #282828;border-radius:6px;padding:8px;margin:4px 0;display:flex;justify-content:space-between;"><span>${escapeHtml(w.name)}</span><span>${w.done ? '✅ выполнено' : '⏳ в работе'}</span></div>`).join('')}</div>`;
}

function renderFakeCabinet(role) {
    const labels = { designer: '🎨 Дизайнер', master: '🔧 Мастер', purchaser: '📦 Закупщик' };
    document.getElementById('app').innerHTML = `<div class="card" style="text-align:center;padding:40px;"><div style="font-size:64px;">🔒</div><h2 style="color:#c9a959;">${labels[role]}</h2><div style="color:#666;font-size:18px;">Доступ временно ограничен</div><button class="btn btn-primary" onclick="currentUser=null;render()">🚪 Выйти</button></div>`;
}

function renderElectrician() {
    document.getElementById('app').innerHTML = `<div class="card"><div class="flex"><h2>⚡ Электрик</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div>`;
}

function renderPlaceholder() {
    document.getElementById('app').innerHTML = `<div class="card"><div class="flex"><h2>${getUserLabel(currentUser)}</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div></div>`;
}

function render() {
    if (!currentUser) { renderLogin(); return; }
    if (['designer', 'master', 'purchaser'].includes(currentUser)) { renderFakeCabinet(currentUser); return; }
    if (currentUser === 'boss') { renderBoss(); return; }
    if (currentUser === 'wolf') { renderWolf(); return; }
    if (currentUser === 'client') { renderClient(); return; }
    if (currentUser === 'electrician') { renderElectrician(); return; }
    renderPlaceholder();
}

// ============================================================
// ДЕЙСТВИЯ
// ============================================================
window.login = function(r) {
    if (['designer', 'master', 'purchaser'].includes(r)) {
        if (!passwords[r]) passwords[r] = '30986';
        const p = prompt('Введите пароль:');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
        currentUser = r; render(); return;
    }
    if (passwords[r] && passwords[r].length > 0) {
        const p = prompt('Введите пароль для "' + getUserLabel(r) + '":');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
    }
    if (r === 'client') {
        const pwd = prompt('ПАРОЛЬ объекта:');
        if (!pwd) { alert('Пароль не введён'); return; }
        const found = objects.find(o => passwords.objects[o.id] === pwd);
        if (!found) { alert('Неверный пароль'); return; }
        currentUser = r; currentObjectId = found.id;
    } else {
        currentUser = r;
    }
    render();
};

window.addObject = function() {
    const n = prompt('Название объекта:');
    if (!n) return;
    const a = prompt('Адрес:');
    if (!a) return;
    let pwd = prompt('Пароль для входа:');
    if (pwd === null) return;
    pwd = pwd.trim();
    if (!pwd) { pwd = Math.random().toString(36).substring(2, 8).toUpperCase(); showToast('Пароль: ' + pwd); }
    const id = Date.now();
    const obj = { id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: false, archived: false };
    objects.push(obj);
    passwords.objects[id] = pwd;
    saveData();
    renderBossObjects();
    showToast('✅ Объект создан');
};

window.addWork = function(id) {
    const n = prompt('Название этапа:');
    if (!n) return;
    const o = getObject(id);
    if (!o) return;
    o.works.push({ id: Date.now(), name: n, done: false });
    saveData();
    renderBossObjects();
    showToast('➕ Этап добавлен');
};

window.toggleWork = function(id, wi) {
    const o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveData();
    renderBossObjects();
};

window.wolfToggleWork = function(id, wi) {
    const o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveData();
    renderWolf();
};

window.deleteObject = function(id) {
    if (!confirm('Удалить объект?')) return;
    objects = objects.filter(o => o.id !== id);
    saveData();
    renderBossObjects();
    showToast('🗑 Объект удалён');
};

// ============================================================
// ЧЕКИ (BOSS)
// ============================================================
function renderBossChecks() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    container.innerHTML = '<div style="margin:12px 0;"><button class="btn btn-primary" onclick="addCheck()">➕ Загрузить чек</button></div><div id="bossChecksList"></div>';
    const list = document.getElementById('bossChecksList');
    if (!checks.length) { list.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    list.innerHTML = checks.map(c => `<div class="card"><div class="flex"><span><b>${c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана'}</b></span><span class="badge">${c.paid ? '✅ Оплачен' : '⏳ Не оплачен'}</span></div><div style="color:#888;">${fmt(c.date)}</div>${c.fileData ? `<div><img src="${c.fileData}" style="max-width:100px;max-height:100px;border-radius:6px;cursor:pointer;" onclick="showModal('${c.fileData}')"></div>` : ''}${!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : ''}<button class="btn btn-sm btn-danger" onclick="deleteCheck(' + c.id + ')">🗑</button></div>`).join('');
}

window.addCheck = function() {
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const list = available.map((o, i) => (i+1) + '. ' + o.name).join('\n');
    const choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    const objId = available[idx].id;
    const amount = parseFloat(prompt('Сумма (руб):') || '0');
    if (isNaN(amount) || amount <= 0) { showToast('Введите сумму'); return; }
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            checks.push({ id: Date.now(), objectId: objId, amount, fileData: ev.target.result, date: new Date(), paid: false });
            saveData();
            renderBossChecks();
            showToast('🧾 Чек загружен');
        };
        reader.readAsDataURL(file);
    };
    inp.click();
};

window.markCheckPaid = function(id) {
    const c = checks.find(x => x.id === id);
    if (!c || c.paid) return;
    c.paid = true;
    saveData();
    renderBossChecks();
    showToast('✅ Чек оплачен');
};

window.deleteCheck = function(id) {
    if (!confirm('Удалить чек?')) return;
    checks = checks.filter(c => c.id !== id);
    saveData();
    renderBossChecks();
    showToast('🗑 Чек удалён');
};

// ============================================================
// ПАРОЛИ
// ============================================================
function renderPasswords() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    let html = '<div class="card"><h3>Пароли для ролей</h3>';
    ['boss', 'wolf', 'client', 'master', 'designer', 'purchaser', 'electrician'].forEach(r => {
        html += `<div class="flex"><span>${getUserLabel(r)}</span><span><input type="text" id="pass-${r}" value="${passwords[r] || ''}" style="width:150px;"><button class="btn btn-sm" onclick="setPassword('${r}')">Установить</button></span></div>`;
    });
    html += '</div><div class="card"><h3>Пароли объектов</h3>';
    objects.forEach(o => {
        html += `<div class="flex"><span>${escapeHtml(o.name)}</span><span><input type="text" id="pass-obj-${o.id}" value="${passwords.objects[o.id] || ''}" style="width:150px;"><button class="btn btn-sm" onclick="setObjectPassword(${o.id})">Установить</button></span></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

window.setPassword = function(r) {
    const val = document.getElementById('pass-' + r).value.trim();
    if (val) passwords[r] = val;
    else delete passwords[r];
    saveData();
    renderPasswords();
    showToast('🔑 Пароль установлен');
};

window.setObjectPassword = function(id) {
    const val = document.getElementById('pass-obj-' + id).value.trim();
    if (val) passwords.objects[id] = val;
    else { const p = Math.random().toString(36).substring(2, 8).toUpperCase(); passwords.objects[id] = p; document.getElementById('pass-obj-' + id).value = p; }
    saveData();
    renderPasswords();
    showToast('🔑 Пароль установлен');
};

// ============================================================
// ДРУГОЕ
// ============================================================
function showModal(src) {
    let m = document.getElementById('modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal';
        m.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);display:flex;justify-content:center;align-items:center;z-index:999;';
        m.onclick = function() { this.remove(); };
        document.body.appendChild(m);
    }
    m.innerHTML = `<img src="${src}" style="max-width:90%;max-height:90%;border-radius:8px;">`;
    m.style.display = 'flex';
}

// ============================================================
// ЗАПУСК
// ============================================================
loadData();
render();
setTimeout(() => { loadFromSupabase(); }, 500);
console.log('✅ СтройУчёт запущен');
console.log('🔑 Пароль: 30986');
