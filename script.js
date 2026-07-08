// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ ВЕРСИЯ
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

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
let calendarOffset = 0;
let pendingActions = [];
let isSyncing = false;

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
function isValidDate(d) { const r = /^\d{2}\.\d{2}\.\d{4}$/; if (!r.test(d)) return false; const p = d.split('.'); const dt = new Date(+p[2], +p[1] - 1, +p[0]); return dt && dt.getFullYear() == +p[2] && dt.getMonth() == +p[1] - 1 && dt.getDate() == +p[0]; }
function saveUiState() { try { localStorage.setItem('uiState', JSON.stringify(uiState)); } catch (e) {} }
function loadUiState() { try { const s = localStorage.getItem('uiState'); if (s) uiState = JSON.parse(s); } catch (e) {} if (!uiState) uiState = {}; }
function getObject(id) { return objects.find(o => o.id === id); }
function getUserLabel(r) { const m = { boss: 'Руководитель', wolf: 'Волк', client: 'Клиент', designer: 'Дизайнер', master: 'Мастер', purchaser: 'Закупщик', electrician: 'Электрик' }; return m[r] || r; }
function fmt(d) { if (!d) return ''; let dt = new Date(d); if (isNaN(dt.getTime())) { const p = d.split('.'); if (p.length === 3) { dt = new Date(+p[2], +p[1] - 1, +p[0]); if (!isNaN(dt.getTime())) { const day = String(dt.getDate()).padStart(2, '0'); const month = String(dt.getMonth() + 1).padStart(2, '0'); const year = dt.getFullYear(); return day + '.' + month + '.' + year; } } return d; } const day = String(dt.getDate()).padStart(2, '0'); const month = String(dt.getMonth() + 1).padStart(2, '0'); const year = dt.getFullYear(); return day + '.' + month + '.' + year; }
function fmtTime(d) { if (!d) return ''; let dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString('ru-RU'); }
function getDaysRemaining(endDate) { if (!endDate) return null; const p = endDate.split('.'); if (p.length === 3) { const end = new Date(+p[2], +p[1] - 1, +p[0]); const now = new Date(); const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24)); return diff; } return null; }
function isOnline() { return navigator.onLine; }

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
            passwords = d.passwords || { boss: '30986', wolf: '30986', client: '30986', master: '30986', designer: '30986', purchaser: '30986', electrician: '30986', objects: {} };
        }
    } catch (e) {}
    if (!objects.length) {
        const n = Date.now();
        objects.push({
            id: n,
            code: 'DEMO',
            name: 'Демо-объект',
            address: 'ул. Примерная, 1',
            works: [{ id: n + 1, name: 'Демонтаж', done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: false, status: '' }],
            completed: false,
            archived: false,
            startDate: null,
            plannedEndDate: null,
            clientStatus: '',
            schedule: []
        });
        passwords.objects[n] = 'demo123';
    }
    objects.forEach(o => {
        o.works.forEach(w => {
            if (w.quantity === undefined) w.quantity = '';
            if (w.unit === undefined) w.unit = '';
            if (w.done === undefined) w.done = false;
            if (w.forElectrician === undefined) w.forElectrician = false;
            if (w.manual === undefined) w.manual = false;
            if (w.status === undefined) w.status = '';
        });
        if (o.startDate === undefined) o.startDate = null;
        if (o.plannedEndDate === undefined) o.plannedEndDate = null;
        if (o.clientStatus === undefined) o.clientStatus = '';
        if (o.schedule === undefined) o.schedule = [];
    });
    recommendations.forEach(r => { if (!r.photos) r.photos = []; if (!r.purchasedPhotos) r.purchasedPhotos = []; });
    electricianTasks.forEach(t => { if (!t.photos) t.photos = []; if (t.done === undefined) t.done = false; if (t.objectId === undefined) t.objectId = null; });
    objects.forEach(o => { if (!passwords.objects[o.id]) passwords.objects[o.id] = Math.random().toString(36).substring(2, 8).toUpperCase(); });
    loadUiState();
}

// ============================================================
// СИНХРОНИЗАЦИЯ С SUPABASE
// ============================================================
async function loadAllFromSupabase() {
    if (!isOnline()) return;
    try {
        console.log('🔄 Загрузка из Supabase...');
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
                saveDataToLocal();
                console.log('✅ Загружено ' + data.length + ' объектов');
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
            saveDataToLocal();
            console.log('✅ Загружены пароли');
        }
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        else if (currentUser === 'client') renderClient();
        else if (currentUser === 'electrician') renderElectricianObjects();
    } catch (e) { console.error('❌ Ошибка загрузки:', e); }
}

async function saveToSupabase(table, data) {
    if (!isOnline()) return false;
    try {
        const checkResp = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + data.id, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        const existing = await checkResp.json();
        if (existing.length > 0) {
            await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + data.id, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=minimal' },
                body: JSON.stringify(data)
            });
        } else {
            await fetch(SUPABASE_URL + '/rest/v1/' + table, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY, 'Prefer': 'return=minimal' },
                body: JSON.stringify(data)
            });
        }
        return true;
    } catch (e) { console.error('❌ Ошибка сохранения:', e); return false; }
}

async function syncPasswordsToSupabase() {
    if (!isOnline()) return;
    try {
        for (const [role, pwd] of Object.entries(passwords)) {
            if (role === 'objects') continue;
            if (pwd) await saveToSupabase('passwords', { id: Date.now() + Math.random() * 1000, role, password: pwd });
        }
        for (const [objId, pwd] of Object.entries(passwords.objects)) {
            if (pwd) await saveToSupabase('passwords', { id: Date.now() + Math.random() * 1000, object_id: parseInt(objId), password: pwd });
        }
        console.log('✅ Пароли синхронизированы');
    } catch (e) { console.error('❌ Ошибка синхронизации паролей:', e); }
}

// ============================================================
// ФУНКЦИИ ДЛЯ ГРАФИКА
// ============================================================
window.addScheduleItem = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const name = prompt('Название задачи:');
    if (!name) return;
    const startDate = prompt('Дата начала (ДД.ММ.ГГГГ):');
    if (!startDate || !isValidDate(startDate)) { if (startDate) showToast('❌ Неверный формат даты'); return; }
    const endDate = prompt('Дата завершения (ДД.ММ.ГГГГ):');
    if (!endDate || !isValidDate(endDate)) { if (endDate) showToast('❌ Неверный формат даты'); return; }
    if (!obj.schedule) obj.schedule = [];
    obj.schedule.push({ id: Date.now() + Math.random() * 1000, name, startDate, endDate, showToClient: false, fromWork: false, workId: null });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
    showToast('✅ Задача добавлена');
};

window.deleteScheduleItem = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || !obj.schedule) return;
    if (!confirm('Удалить задачу?')) return;
    obj.schedule.splice(idx, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
    showToast('🗑 Задача удалена');
};

window.toggleScheduleShowToClient = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || !obj.schedule) return;
    obj.schedule[idx].showToClient = !obj.schedule[idx].showToClient;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
};

window.refreshScheduleFromWorks = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    if (!obj.schedule) obj.schedule = [];
    const existingNames = new Set(obj.schedule.map(s => s.name));
    let added = 0;
    obj.works.forEach(w => {
        if (!existingNames.has(w.name)) {
            const start = new Date();
            start.setDate(start.getDate() + added * 7);
            const startStr = fmt(start);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);
            const endStr = fmt(end);
            obj.schedule.push({ id: Date.now() + Math.random() * 1000, name: w.name, startDate: startStr, endDate: endStr, showToClient: false, fromWork: true, workId: w.id });
            added++;
        }
    });
    if (added > 0) { saveDataToLocal(); if (isOnline()) saveToSupabase('objects', obj); renderSchedule(); showToast('✅ Добавлено ' + added + ' этапов'); }
    else showToast('ℹ️ Новых этапов нет');
};

window.editScheduleDates = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || !obj.schedule) return;
    const item = obj.schedule[idx];
    if (!item) return;
    const newStart = prompt('Новая дата начала (ДД.ММ.ГГГГ):', item.startDate);
    if (newStart && isValidDate(newStart)) item.startDate = newStart;
    else if (newStart) { showToast('❌ Неверный формат'); return; }
    const newEnd = prompt('Новая дата завершения (ДД.ММ.ГГГГ):', item.endDate);
    if (newEnd && isValidDate(newEnd)) item.endDate = newEnd;
    else if (newEnd) { showToast('❌ Неверный формат'); return; }
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
    showToast('✅ Даты обновлены');
};

window.shiftAllDates = function(objId) {
    const obj = getObject(objId);
    if (!obj || !obj.schedule || !obj.schedule.length) return;
    const days = prompt('На сколько дней сдвинуть? (число)');
    if (days === null) return;
    const daysNum = parseInt(days);
    if (isNaN(daysNum)) { showToast('❌ Введите число'); return; }
    obj.schedule.forEach(item => {
        if (item.startDate) { const p = item.startDate.split('.'); const dt = new Date(+p[2], +p[1] - 1, +p[0]); dt.setDate(dt.getDate() + daysNum); item.startDate = fmt(dt); }
        if (item.endDate) { const p = item.endDate.split('.'); const dt = new Date(+p[2], +p[1] - 1, +p[0]); dt.setDate(dt.getDate() + daysNum); item.endDate = fmt(dt); }
    });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
    showToast('✅ Сдвинуто на ' + daysNum + ' дней');
};

function renderSchedule() {
    const container = document.getElementById('bossContent') || document.getElementById('wolfContent');
    if (!container) return;
    if (currentUser === 'wolf') {
        const list = objects.filter(o => !o.archived);
        if (!list.length) { container.innerHTML = '<div class="card">Нет объектов</div>'; return; }
        let sel = '<div style="margin-bottom:12px;"><select id="scheduleObjectSelect" onchange="switchScheduleObject(this.value)" style="background:#161616;color:#e0e0e0;border:1px solid #282828;border-radius:6px;padding:8px;width:100%;font-size:14px;">';
        list.forEach(o => { sel += '<option value="' + o.id + '" ' + (o.id === currentObjectId ? 'selected' : '') + '>' + escapeHtml(o.name) + '</option>'; });
        sel += '</select></div>';
        container.innerHTML = sel;
    }
    const obj = getObject(currentObjectId);
    if (!obj) { container.innerHTML += '<div class="card">Объект не найден</div>'; return; }
    if (!obj.schedule) obj.schedule = [];
    const sorted = [...obj.schedule].sort((a, b) => {
        if (!a.startDate) return 1; if (!b.startDate) return -1;
        const pa = a.startDate.split('.'), pb = b.startDate.split('.');
        return new Date(+pa[2], +pa[1] - 1, +pa[0]) - new Date(+pb[2], +pb[1] - 1, +pb[0]);
    });
    let html = '<div class="card"><h3>📊 График работ — ' + escapeHtml(obj.name) + '</h3><div style="overflow-x:auto;margin-top:10px;"><table style="width:100%;border-collapse:collapse;font-size:13px;min-width:600px;"><thead><tr><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #282828;width:200px;">Задача</th><th style="text-align:left;padding:6px 8px;border-bottom:1px solid #282828;">Даты</th><th style="text-align:center;padding:6px 8px;border-bottom:1px solid #282828;width:80px;">Клиент</th><th style="text-align:center;padding:6px 8px;border-bottom:1px solid #282828;width:80px;">Действия</th></tr></thead><tbody>';
    sorted.forEach((item, idx) => {
        const isOverdue = item.endDate ? getDaysRemaining(item.endDate) < 0 : false;
        const showClient = item.showToClient ? '✅' : '⬜';
        const fromWork = item.fromWork ? '📋' : '✏️';
        html += '<tr><td style="padding:6px 8px;border-bottom:1px solid #1a1a1a;"><span style="' + (isOverdue ? 'color:#a04040;' : '') + '">' + fromWork + ' ' + escapeHtml(item.name) + '</span></td>';
        html += '<td style="padding:6px 8px;border-bottom:1px solid #1a1a1a;">' + (item.startDate || '—') + ' → ' + (item.endDate || '—') + (isOverdue ? ' <span style="color:#a04040;">⚠️</span>' : '') + '</td>';
        html += '<td style="text-align:center;padding:6px 8px;border-bottom:1px solid #1a1a1a;cursor:pointer;font-size:18px;" onclick="toggleScheduleShowToClient(' + obj.id + ',' + idx + ')">' + showClient + '</td>';
        html += '<td style="text-align:center;padding:6px 8px;border-bottom:1px solid #1a1a1a;"><button class="btn btn-sm" onclick="editScheduleDates(' + obj.id + ',' + idx + ')" style="padding:2px 6px;font-size:11px;">✏️</button> <button class="btn btn-sm btn-danger" onclick="deleteScheduleItem(' + obj.id + ',' + idx + ')" style="padding:2px 6px;font-size:11px;">×</button></td></tr>';
    });
    html += '</tbody></table></div><div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;"><button class="btn btn-sm btn-primary" onclick="addScheduleItem(' + obj.id + ')">➕ Добавить</button><button class="btn btn-sm" onclick="refreshScheduleFromWorks(' + obj.id + ')">🔄 Из этапов</button><button class="btn btn-sm" onclick="shiftAllDates(' + obj.id + ')">📅 Сдвинуть</button><span style="font-size:11px;color:#666;margin-left:10px;">⬜ — скрыто от клиента | ✅ — видно клиенту</span></div></div>';
    container.innerHTML += html;
}

window.switchScheduleObject = function(objId) {
    currentObjectId = parseInt(objId);
    renderSchedule();
};

// ============================================================
// СТАТУС ДЛЯ КЛИЕНТА
// ============================================================
window.addClientStatus = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const status = prompt('Введите статус для клиента:');
    if (status !== null && status.trim() !== '') {
        obj.clientStatus = status.trim();
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        renderBossObjects();
        showToast('✅ Статус обновлён');
    }
};

// ============================================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================================
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
    const newObj = { id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: false, archived: false, startDate: null, plannedEndDate: null, clientStatus: '', schedule: [] };
    objects.push(newObj);
    passwords.objects[id] = pwd;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', newObj);
    renderBossObjects();
    showToast('✅ Объект создан');
};

window.addWork = function(id) {
    const n = prompt('Название этапа:');
    if (!n) return;
    const o = getObject(id);
    if (!o) return;
    o.works.push({ id: Date.now(), name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true, status: '' });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderBossObjects();
    showToast('➕ Этап добавлен');
};

window.toggleWorkStatus = function(id, wi) {
    const o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderBossObjects();
};

window.deleteWorkWithConfirm = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const work = obj.works[idx];
    if (!work) return;
    if (!confirm('Удалить этап "' + work.name + '" ?')) return;
    obj.works.splice(idx, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderBossObjects();
    showToast('🗑 Этап удалён');
};

window.toggleElectrician = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    obj.works[idx].forElectrician = !obj.works[idx].forElectrician;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderBossObjects();
};

window.moveWorkUp = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || idx <= 0) return;
    const works = obj.works;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderBossObjects();
};

window.moveWorkDown = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || idx >= obj.works.length - 1) return;
    const works = obj.works;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderBossObjects();
};

window.completeObject = function(id) {
    const o = getObject(id);
    if (!o) return;
    o.completed = !o.completed;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderBossObjects();
    showToast(o.completed ? '✅ Объект сдан' : '↩ Возвращён');
};

window.archiveObject = function(id) {
    if (!confirm('Отправить в архив?')) return;
    const o = getObject(id);
    if (!o) return;
    o.archived = true;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderBossObjects();
    showToast('📦 В архиве');
};

window.unarchiveObject = function(id) {
    const o = getObject(id);
    if (!o) return;
    o.archived = false;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderBossObjects();
    showToast('↩ Возвращён из архива');
};

window.deleteObjectPermanently = function(id) {
    if (!confirm('Удалить объект навсегда?')) return;
    objects = objects.filter(o => o.id !== id);
    reports = reports.filter(r => r.objectId !== id);
    designProjects = designProjects.filter(p => p.objectId !== id);
    recommendations = recommendations.filter(r => r.objectId !== id);
    purchaseOrders = purchaseOrders.filter(o => o.objectId !== id);
    checks = checks.filter(c => c.objectId !== id);
    electricianTasks = electricianTasks.filter(t => t.objectId !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/objects?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderBossObjects();
    showToast('🗑 Объект удалён');
};

window.setBossObjectFilter = function(filter) {
    uiState['bossObjectFilter'] = filter;
    saveUiState();
    renderBossObjects();
};

window.setObjectStartDate = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const date = prompt('Дата начала (ДД.ММ.ГГГГ):');
    if (date && isValidDate(date)) { obj.startDate = date; saveDataToLocal(); if (isOnline()) saveToSupabase('objects', obj); renderBossObjects(); showToast('📅 Дата начала установлена'); }
    else if (date) showToast('❌ Неверный формат');
};

window.setObjectEndDate = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const date = prompt('Дата завершения (ДД.ММ.ГГГГ):');
    if (date && isValidDate(date)) { obj.plannedEndDate = date; saveDataToLocal(); if (isOnline()) saveToSupabase('objects', obj); renderBossObjects(); showToast('📅 Дата завершения установлена'); }
    else if (date) showToast('❌ Неверный формат');
};

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
        showToast('⏳ Загрузка фото...');
        for (const f of files) {
            try {
                const reader = new FileReader();
                const compressed = await new Promise(res => {
                    reader.onload = function(ev) {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            let w = img.width, h = img.height;
                            const maxSize = 800;
                            if (w > maxSize || h > maxSize) { if (w > h) { h = h * maxSize / w; w = maxSize; } else { w = w * maxSize / h; h = maxSize; } }
                            canvas.width = w; canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            res(canvas.toDataURL('image/webp', 0.7));
                        };
                        img.onerror = function() { res(ev.target.result); };
                        img.src = ev.target.result;
                    };
                    reader.readAsDataURL(f);
                });
                const report = { id: Date.now() + Math.random() * 1000, objectId: id, workId: work.id, photos: [compressed], text: '', date: new Date(), approved: true };
                reports.push(report);
                saveDataToLocal();
                if (isOnline()) { await saveToSupabase('reports', report); }
            } catch (err) { console.error(err); }
        }
        saveDataToLocal();
        renderBossObjects();
        showToast('📸 Фото загружены');
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

window.deleteWorkPhoto = function(id) {
    if (!confirm('Удалить фото?')) return;
    reports = reports.filter(r => r.id !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderBossObjects();
    showToast('🗑 Фото удалено');
};

// ============================================================
// РЕНДЕР БОССА
// ============================================================
function renderBoss() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>👔 Руководитель</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="recommendations">Рекомендации</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="passwords">🔐 Пароли</div>
      <div class="tab" data-tab="schedule">📊 График</div>
    </div>
    <div id="bossContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'objects') renderBossObjects();
        else if (tab === 'design') renderBossDesign();
        else if (tab === 'recommendations') renderBossRecommendations();
        else if (tab === 'notes') renderBossNotes();
        else if (tab === 'purchases') renderBossPurchases();
        else if (tab === 'checks') renderBossChecks();
        else if (tab === 'passwords') renderPasswords();
        else if (tab === 'schedule') renderSchedule();
    });
    renderBossObjects();
}

function renderBossObjects() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    if (!uiState['bossObjectFilter']) uiState['bossObjectFilter'] = 'active';
    const filter = uiState['bossObjectFilter'];
    let objectsToShow = [];
    if (filter === 'active') objectsToShow = objects.filter(o => !o.archived && !o.completed);
    else if (filter === 'completed') objectsToShow = objects.filter(o => !o.archived && o.completed);
    else if (filter === 'archived') objectsToShow = objects.filter(o => o.archived);

    const statusHtml = '<div id="pendingStatus" style="padding:8px 12px;margin-bottom:12px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;text-align:center;color:#4caf50;">✅ Все данные синхронизированы</div>';
    const filterTabs = '<div class="obj-filter-tabs"><span class="tab ' + (filter === 'active' ? 'active' : '') + '" onclick="setBossObjectFilter(\'active\')">Активные</span><span class="tab ' + (filter === 'completed' ? 'active' : '') + '" onclick="setBossObjectFilter(\'completed\')">Сданные</span></div>';
    let sel = '<div class="flex" style="margin-bottom:16px;"><button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button><button class="btn" onclick="uploadCSV()">📊 CSV</button><select class="object-selector" id="objectSelector" onchange="scrollToObject(this.value)"><option value="">— Перейти —</option>';
    objects.forEach(o => { sel += '<option value="obj-' + o.id + '">' + escapeHtml(o.name) + ' (' + escapeHtml(o.code) + ')</option>'; });
    sel += '</select></div>';

    let list = objectsToShow.map(obj => {
        const objKey = 'obj-' + obj.id;
        const objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        const worksHtml = obj.works.map((w, wi) => {
            const wKey = 'work-' + obj.id + '-' + wi;
            const wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
            const phHtml = photos.map(r => '<span class="pw"><img src="' + r.photos[0] + '" onclick="showModal(\'' + r.photos[0] + '\')"><button class="del" onclick="deleteWorkPhoto(' + r.id + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>').join('');
            const daysHtml = w.deadline && !w.done ? '<span style="font-size:12px;color:#c9a959;margin-left:8px;">⏳ осталось ' + getDaysRemaining(w.deadline) + ' дн.</span>' : '';
            return '<div class="work-block" draggable="true" data-object-id="' + obj.id + '" data-work-index="' + wi + '"><div class="work-header" onclick="toggleWork(event, this, \'' + wKey + '\')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="drag-handle">⠿</span><span class="work-title">' + escapeHtml(w.name) + '</span><span class="work-status-check" onclick="event.stopPropagation();toggleWorkStatus(' + obj.id + ',' + wi + ')">' + (w.done ? '☑' : '☐') + '</span><span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(' + obj.id + ',' + wi + ')" title="Назначить электрику">' + (w.forElectrician ? '⚡' : '') + '</span>' + daysHtml + '<span class="photo-indicator ' + (photos.length ? 'has-photo' : '') + '"></span><span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span></span><span style="display:flex;gap:2px;"><button class="icon-btn" onclick="event.stopPropagation();uploadWorkPhoto(' + obj.id + ',' + wi + ')">📸</button><button class="icon-btn" onclick="event.stopPropagation();moveWorkUp(' + obj.id + ',' + wi + ')">⬆</button><button class="icon-btn" onclick="event.stopPropagation();moveWorkDown(' + obj.id + ',' + wi + ')">⬇</button><button class="icon-btn danger" onclick="event.stopPropagation();deleteWorkWithConfirm(' + obj.id + ',' + wi + ')">🗑</button></span></div><div class="work-detail ' + (wOpen ? 'open' : '') + '"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">' + (phHtml || 'Нет фото') + '</div></div></div>';
        }).join('');
        setTimeout(() => initDragDrop(), 50);
        
        let summaryHtml = '';
        if (obj.startDate) summaryHtml += '📅 ' + fmt(obj.startDate);
        if (obj.plannedEndDate) { const days = getDaysRemaining(obj.plannedEndDate); summaryHtml += ' → ' + fmt(obj.plannedEndDate) + (days !== null ? ' <span style="color:' + (days < 0 ? '#a04040' : '#c9a959') + ';">(осталось ' + days + ' дн.)</span>' : ''); }
        
        return '<div class="card" id="obj-' + obj.id + '"><div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')"><div class="flex"><h3>' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;align-items:center;"><span class="badge" style="font-size:13px;">' + (summaryHtml || '📅 даты не указаны') + '</span><button class="btn btn-sm" onclick="event.stopPropagation();completeObject(' + obj.id + ')">' + (obj.completed ? 'Вернуть' : 'Сдать') + '</button><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();archiveObject(' + obj.id + ')">📦</button><button class="btn btn-sm" onclick="event.stopPropagation();addClientStatus(' + obj.id + ')">📢 Статус</button></div></div><div style="color:#999;font-size:14px;">📍 ' + escapeHtml(obj.address) + '</div><div style="margin:8px 0;padding:10px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;"><div style="display:flex;gap:12px;flex-wrap:wrap;"><button class="btn btn-sm" onclick="setObjectStartDate(' + obj.id + ')">📅 Начало</button><button class="btn btn-sm" onclick="setObjectEndDate(' + obj.id + ')">📅 Завершение</button></div></div></div><div class="object-detail ' + (objOpen ? 'open' : '') + '"><div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="addWork(' + obj.id + ')">➕ Этап</button></div><hr><h4>Этапы работ</h4>' + worksHtml + '</div></div>';
    }).join('');

    container.innerHTML = statusHtml + filterTabs + sel + list;
}

// ============================================================
// ОСТАЛЬНЫЕ РЕНДЕРЫ (УПРОЩЁННЫЕ)
// ============================================================
function renderBossDesign() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    let html = '<div class="card"><h3>🎨 Дизайн-проекты</h3>';
    const projs = designProjects.slice().sort((a, b) => a.id - b.id);
    if (!projs.length) html += '<div style="color:#666;">Нет проектов</div>';
    else {
        projs.forEach(p => {
            const obj = getObject(p.objectId);
            const files = (p.files || []).map(f => { const isImg = f.startsWith('data:image/') || f.startsWith('http'); return isImg ? '<img src="' + f + '" onclick="showModal(\'' + f + '\')" style="max-width:80px;max-height:80px;border-radius:4px;">' : '<a href="' + f + '" target="_blank">📄</a>'; }).join(' ') || 'нет';
            html += '<div style="background:#121212;border:1px solid #282828;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + escapeHtml(p.title) + '</b> <span class="badge">' + (p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает') + '</span></span><span><span class="badge">' + (obj ? escapeHtml(obj.name) : '—') + '</span><button class="btn btn-sm btn-danger" onclick="deleteDesign(' + p.id + ')">🗑</button></span></div><div><b>Файлы:</b> ' + files + '</div></div>';
        });
    }
    html += '<div style="margin-top:12px;"><button class="btn btn-primary" onclick="selectObjectForDesign()">➕ Новый проект</button></div></div>';
    container.innerHTML = html;
}

function selectObjectForDesign() {
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const list = available.map((o, i) => (i+1) + '. ' + o.name).join('\n');
    const choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    addDesignProjectForObject(available[idx].id);
}

window.addDesignProjectForObject = function(objId) {
    const title = prompt('Название проекта:');
    if (!title) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = '*/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        const files = e.target.files;
        let data = [];
        if (!files.length) { createDesignProject(objId, title, []); inp.remove(); return; }
        const readers = [];
        for (let f of files) {
            const r = new FileReader();
            readers.push(new Promise(res => { r.onload = function(ev) { data.push(ev.target.result); res(); }; r.readAsDataURL(f); }));
        }
        Promise.all(readers).then(() => { createDesignProject(objId, title, data); inp.remove(); });
    };
    setTimeout(() => inp.click(), 50);
};

function createDesignProject(objId, title, files) {
    const project = { id: Date.now(), objectId: objId, title, files, roles: ['boss', 'wolf', 'client', 'electrician'], comments: [], approvedByClient: false };
    designProjects.push(project);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', project);
    renderBossDesign();
    showToast('📐 Проект создан');
}

window.deleteDesign = function(id) {
    if (!confirm('Удалить проект?')) return;
    designProjects = designProjects.filter(p => p.id !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/design_projects?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderBossDesign();
    showToast('🗑 Проект удалён');
};

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ
// ============================================================
function renderBossRecommendations() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    let html = '<div class="card"><h3>📋 Рекомендации</h3>';
    const recs = recommendations.slice().sort((a, b) => a.id - b.id);
    if (!recs.length) html += '<div style="color:#666;">Нет рекомендаций</div>';
    else {
        recs.forEach(r => {
            const obj = getObject(r.objectId);
            const status = r.purchased ? '✅ Куплено' : '❌ Не куплено';
            html += '<div style="background:#121212;border:1px solid #282828;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>📋 ' + escapeHtml(r.text) + '</b> <span class="badge">' + status + '</span></span><span><span class="badge">' + (obj ? escapeHtml(obj.name) : '—') + '</span><button class="btn btn-sm btn-danger" onclick="deleteRecommend(' + r.id + ')">🗑</button></span></div><div style="font-size:13px;color:#888;">Срок: ' + (r.deadline ? fmt(r.deadline) : 'не указан') + '</div><div style="margin:6px 0;"><button class="btn btn-sm" onclick="markPurchased(' + r.id + ')">' + (r.purchased ? 'Отменить' : '✅ Куплено') + '</button></div></div>';
        });
    }
    html += '<div style="margin-top:12px;"><button class="btn btn-primary" onclick="selectObjectForRecommendation()">➕ Новая рекомендация</button></div></div>';
    container.innerHTML = html;
}

function selectObjectForRecommendation() {
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const list = available.map((o, i) => (i+1) + '. ' + o.name).join('\n');
    const choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    addRecommendationForObject(available[idx].id);
}

window.addRecommendationForObject = function(objId) {
    const text = prompt('Текст рекомендации:');
    if (!text) return;
    const deadline = prompt('Срок (ДД.ММ.ГГГГ) или пусто:');
    if (deadline && !isValidDate(deadline)) { showToast('❌ Неверный формат'); return; }
    const rec = { id: Date.now(), objectId: objId, text: text.trim(), deadline: deadline || null, photos: [], purchased: false, purchasedDate: null, purchasedPhotos: [] };
    recommendations.push(rec);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', rec);
    renderBossRecommendations();
    showToast('📋 Рекомендация добавлена');
};

window.deleteRecommend = function(id) {
    if (!confirm('Удалить рекомендацию?')) return;
    recommendations = recommendations.filter(r => r.id !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/recommendations?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderBossRecommendations();
    showToast('🗑 Рекомендация удалена');
};

window.markPurchased = function(id) {
    const r = recommendations.find(x => x.id === id);
    if (!r) return;
    r.purchased = !r.purchased;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', r);
    renderBossRecommendations();
    showToast(r.purchased ? '✅ Отмечено' : '↩ Отмена');
};

function renderBossNotes() {
    const container = document.getElementById('bossContent');
    container.innerHTML = '<div class="flex"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="bossNotesCalendar"></div>';
    renderNotesCalendar('boss');
}

function renderNotesCalendar(role) {
    const container = document.getElementById(role === 'boss' ? 'bossNotesCalendar' : 'wolfNotesCalendar');
    if (!container) return;
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth() + calendarOffset;
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDay.getDay();
    const today = new Date();
    const notesByDate = {};
    notes.forEach(n => {
        if (n.date && n.author === role) {
            const d = new Date(n.date);
            const key = d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0');
            if (!notesByDate[key]) notesByDate[key] = [];
            notesByDate[key].push(n);
        }
    });
    let html = '<div class="card"><div class="month-nav"><button class="nav-btn" onclick="changeMonth(-1)">‹</button><span>' + firstDay.toLocaleString('ru', { month: 'long', year: 'numeric' }) + '</span><button class="nav-btn" onclick="changeMonth(1)">›</button></div><div class="calendar">';
    for (let i = 0; i < startDay; i++) html += '<div class="day other-month"></div>';
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const key = dt.getFullYear() + '-' + (dt.getMonth() + 1).toString().padStart(2, '0') + '-' + dt.getDate().toString().padStart(2, '0');
        const hasNotes = notesByDate[key] && notesByDate[key].length;
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        html += '<div class="day ' + (isToday ? 'today' : '') + (hasNotes ? ' has-tasks' : '') + '" onclick="showNotesForDay(\'' + key + '\',\'' + role + '\')"><span class="day-number">' + d + '</span>' + (hasNotes ? '<span class="indicator">●</span>' : '') + '</div>';
    }
    html += '</div></div><div id="' + role + 'NotesDayDetail"></div>';
    container.innerHTML = html;
}

function changeMonth(delta) {
    calendarOffset += delta;
    saveUiState();
    if (currentUser === 'boss') renderBossNotes();
    else renderWolfNotes();
}

function showNotesForDay(key, role) {
    const container = document.getElementById(role + 'NotesDayDetail');
    if (!container) return;
    const dayNotes = notes.filter(n => {
        if (!n.date || n.author !== role) return false;
        const d = new Date(n.date);
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') === key;
    });
    if (!dayNotes.length) { container.innerHTML = '<div class="card">Нет записей. <button class="btn btn-sm btn-primary" onclick="addNoteForDate(\'' + key + '\')">➕ Добавить</button></div>'; return; }
    container.innerHTML = '<div class="card"><h4>Записи на ' + new Date(key).toLocaleDateString() + '</h4>' + dayNotes.map(n => '<div class="flex"><span>' + escapeHtml(n.text) + '</span><span><span class="badge">' + (n.author === 'boss' ? 'Руководитель' : 'Волк') + '</span><button class="btn btn-sm btn-danger" onclick="deleteNote(' + n.id + ')">🗑</button></span></div>').join('') + '<button class="btn btn-sm btn-primary" onclick="addNoteForDate(\'' + key + '\')">➕ Добавить</button></div>';
}

window.addNoteForDate = function(dateKey) {
    let dateStr = dateKey;
    if (!dateStr) {
        const now = new Date();
        dateStr = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0') + '-' + now.getDate().toString().padStart(2, '0');
    }
    const text = prompt('Текст заметки:');
    if (!text) return;
    const parts = dateStr.split('-');
    const noteDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const note = { id: Date.now(), author: currentUser, text, date: noteDate };
    notes.push(note);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('notes', note);
    if (currentUser === 'boss') renderBossNotes();
    else renderWolfNotes();
    showToast('📝 Заметка добавлена');
};

window.deleteNote = function(id) {
    if (!confirm('Удалить заметку?')) return;
    notes = notes.filter(n => n.id !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/notes?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    if (currentUser === 'boss') renderBossNotes();
    else renderWolfNotes();
    showToast('🗑 Заметка удалена');
};

function renderBossChecks() {
    const container = document.getElementById('bossContent');
    container.innerHTML = '<div class="flex"><button class="btn btn-primary" onclick="addCheck()">➕ Чек</button></div><div id="bossChecksList"></div>';
    const list = document.getElementById('bossChecksList');
    const sorted = checks.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!sorted.length) { list.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    list.innerHTML = sorted.map(c => {
        const obj = getObject(c.objectId);
        return '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : '—') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '<button class="btn btn-sm btn-danger" onclick="deleteCheck(' + c.id + ')">🗑</button></div></div>';
    }).join('');
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
    inp.accept = 'image/*,application/pdf';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        const reader = new FileReader();
        reader.onload = function(ev) {
            const check = { id: Date.now(), objectId: objId, amount, fileData: ev.target.result, date: new Date(), paid: false, paidDate: null, paidBy: null };
            checks.push(check);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('checks', check);
            renderBossChecks();
            showToast('🧾 Чек загружен');
            inp.remove();
        };
        reader.readAsDataURL(file);
    };
    setTimeout(() => inp.click(), 50);
};

window.markCheckPaid = function(checkId) {
    const c = checks.find(ch => ch.id === checkId);
    if (!c || c.paid) return;
    c.paid = true;
    c.paidDate = new Date();
    c.paidBy = currentUser;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('checks', c);
    renderBossChecks();
    showToast('✅ Чек оплачен');
};

window.deleteCheck = function(checkId) {
    if (!confirm('Удалить чек?')) return;
    checks = checks.filter(c => c.id !== checkId);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/checks?id=eq.' + checkId, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderBossChecks();
    showToast('🗑 Чек удалён');
};

function renderPasswords() {
    const container = document.getElementById('bossContent');
    container.innerHTML = '<div class="card"><h3>Пароли для ролей</h3>' + ['boss', 'wolf', 'client', 'master', 'designer', 'purchaser', 'electrician'].map(r => '<div class="flex"><span>' + getUserLabel(r) + '</span><span><input type="text" id="pass-' + r + '" placeholder="Новый пароль" value="' + (passwords[r] || '') + '" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setRolePassword(\'' + r + '\')">Установить</button></span></div>').join('') + '</div><div class="card"><h3>Пароли объектов</h3>' + objects.map(o => '<div class="flex"><span>' + escapeHtml(o.name) + ' (' + escapeHtml(o.code) + ')</span><span><input type="text" id="pass-obj-' + o.id + '" placeholder="Пароль" value="' + (passwords.objects[o.id] || '') + '" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setObjectPassword(' + o.id + ')">Установить</button></span></div>').join('') + '</div><div class="card"><button class="btn btn-sm" onclick="savePasswords()">Сохранить пароли</button></div>';
}

window.setRolePassword = function(r) {
    const val = document.getElementById('pass-' + r).value.trim();
    if (val) passwords[r] = val;
    else delete passwords[r];
    saveDataToLocal();
    if (isOnline()) syncPasswordsToSupabase();
    renderPasswords();
    showToast('🔑 Пароль установлен');
};

window.setObjectPassword = function(objId) {
    const val = document.getElementById('pass-obj-' + objId).value.trim();
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;
    if (val) passwords.objects[objId] = val;
    else { const newPwd = Math.random().toString(36).substring(2, 8).toUpperCase(); passwords.objects[objId] = newPwd; document.getElementById('pass-obj-' + objId).value = newPwd; }
    saveDataToLocal();
    if (isOnline()) syncPasswordsToSupabase();
    renderPasswords();
    showToast('🔑 Пароль установлен');
};

window.savePasswords = function() {
    saveDataToLocal();
    if (isOnline()) syncPasswordsToSupabase();
    showToast('🔐 Пароли сохранены');
};

function renderBossPurchases() {
    const container = document.getElementById('bossContent');
    container.innerHTML = '<div id="bossPurchasesList"></div>';
    const list = document.getElementById('bossPurchasesList');
    if (!list) return;
    const orders = purchaseOrders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!orders.length) { list.innerHTML = '<div class="card">Нет заявок</div>'; return; }
    list.innerHTML = orders.map(order => {
        const obj = getObject(order.objectId);
        const items = order.items.map(item => '<div><span>' + escapeHtml(item.name) + ' (' + escapeHtml(item.quantity) + ' шт.)</span> <span class="badge">' + (item.purchased ? '✅ Куплено' : '⏳ Не куплено') + '</span></div>').join('');
        return '<div class="card"><div class="flex"><b>Заявка: ' + (obj ? escapeHtml(obj.name) : '—') + '</b><span class="badge">' + fmt(order.date) + '</span></div><div><b>Товары:</b> ' + items + '</div></div>';
    }).join('');
}

// ============================================================
// ВОЛК
// ============================================================
function renderWolf() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🐺 Волк</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="recommendations">Рекомендации</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="schedule">📊 График</div>
    </div>
    <div id="wolfContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'objects') renderWolfObjects();
        else if (tab === 'design') renderWolfDesign();
        else if (tab === 'recommendations') renderWolfRecommendations();
        else if (tab === 'notes') renderWolfNotes();
        else if (tab === 'purchases') renderWolfPurchases();
        else if (tab === 'checks') renderWolfChecks();
        else if (tab === 'schedule') renderSchedule();
    });
    renderWolfObjects();
}

function renderWolfObjects() {
    const container = document.getElementById('wolfContent');
    if (!container) return;
    const active = objects.filter(o => !o.archived);
    let sel = '<div class="flex" style="margin-bottom:16px;"><select class="object-selector" id="wolfObjectSelector" onchange="wolfScrollToObject(this.value)"><option value="">— Перейти —</option>';
    active.forEach(o => { sel += '<option value="wolf-obj-' + o.id + '">' + escapeHtml(o.name) + ' (' + escapeHtml(o.code) + ')</option>'; });
    sel += '</select></div>';
    let list = active.map(obj => {
        const objKey = 'wolf-obj-' + obj.id;
        const objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        const worksHtml = obj.works.map((w, wi) => {
            const wKey = 'wolf-work-' + obj.id + '-' + wi;
            const wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
            const phHtml = photos.map(r => '<span class="pw"><img src="' + r.photos[0] + '" onclick="showModal(\'' + r.photos[0] + '\')"><button class="del" onclick="deleteWorkPhoto(' + r.id + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>').join('');
            const daysHtml = w.deadline && !w.done ? '<span style="font-size:12px;color:#c9a959;margin-left:8px;">⏳ осталось ' + getDaysRemaining(w.deadline) + ' дн.</span>' : '';
            return '<div class="work-block"><div class="work-header" onclick="toggleWork(event, this, \'' + wKey + '\')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="work-title">' + escapeHtml(w.name) + '</span><span class="work-status-check" onclick="event.stopPropagation();wolfToggleWorkStatus(' + obj.id + ',' + wi + ')">' + (w.done ? '☑' : '☐') + '</span>' + daysHtml + '<span class="photo-indicator ' + (photos.length ? 'has-photo' : '') + '"></span><span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span></span><span style="display:flex;gap:2px;"><button class="icon-btn" onclick="event.stopPropagation();wolfUploadWorkPhoto(' + obj.id + ',' + wi + ')">📸</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkUp(' + obj.id + ',' + wi + ')">⬆</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkDown(' + obj.id + ',' + wi + ')">⬇</button></span></div><div class="work-detail ' + (wOpen ? 'open' : '') + '"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">' + (phHtml || 'Нет фото') + '</div></div></div>';
        }).join('');
        const addWorkButton = '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="wolfAddWork(' + obj.id + ')">➕ Этап</button></div>';
        let summaryHtml = '';
        if (obj.startDate) summaryHtml += '📅 ' + fmt(obj.startDate);
        if (obj.plannedEndDate) { const days = getDaysRemaining(obj.plannedEndDate); summaryHtml += ' → ' + fmt(obj.plannedEndDate) + (days !== null ? ' <span style="color:' + (days < 0 ? '#a04040' : '#c9a959') + ';">(осталось ' + days + ' дн.)</span>' : ''); }
        return '<div class="card" id="wolf-obj-' + obj.id + '"><div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')"><div class="flex"><h3>' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge" style="font-size:13px;">' + (summaryHtml || '📅 даты не указаны') + '</span><span class="badge">ID: ' + obj.id + '</span></div></div><div style="color:#999;font-size:14px;">📍 ' + escapeHtml(obj.address) + '</div></div><div class="object-detail ' + (objOpen ? 'open' : '') + '">' + addWorkButton + '<hr><h4>Этапы работ</h4>' + worksHtml + '</div></div>';
    }).join('');
    container.innerHTML = sel + list;
    setTimeout(() => initDragDrop(), 50);
}

window.wolfAddWork = function(id) {
    const n = prompt('Название этапа:');
    if (!n) return;
    const o = getObject(id);
    if (!o) return;
    o.works.push({ id: Date.now(), name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true, status: '' });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderWolfObjects();
    showToast('➕ Этап добавлен');
};

window.wolfToggleWorkStatus = function(id, wi) {
    const o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderWolfObjects();
};

window.wolfMoveWorkUp = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || idx <= 0) return;
    const works = obj.works;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderWolfObjects();
};

window.wolfMoveWorkDown = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || idx >= obj.works.length - 1) return;
    const works = obj.works;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderWolfObjects();
};

window.wolfUploadWorkPhoto = async function(id, wi) {
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
        showToast('⏳ Загрузка фото...');
        for (const f of files) {
            try {
                const reader = new FileReader();
                const compressed = await new Promise(res => {
                    reader.onload = function(ev) {
                        const img = new Image();
                        img.onload = function() {
                            const canvas = document.createElement('canvas');
                            let w = img.width, h = img.height;
                            const maxSize = 800;
                            if (w > maxSize || h > maxSize) { if (w > h) { h = h * maxSize / w; w = maxSize; } else { w = w * maxSize / h; h = maxSize; } }
                            canvas.width = w; canvas.height = h;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            res(canvas.toDataURL('image/webp', 0.7));
                        };
                        img.onerror = function() { res(ev.target.result); };
                        img.src = ev.target.result;
                    };
                    reader.readAsDataURL(f);
                });
                const report = { id: Date.now() + Math.random() * 1000, objectId: id, workId: work.id, photos: [compressed], text: '', date: new Date(), approved: true };
                reports.push(report);
                saveDataToLocal();
                if (isOnline()) { await saveToSupabase('reports', report); }
            } catch (err) { console.error(err); }
        }
        saveDataToLocal();
        renderWolfObjects();
        showToast('📸 Фото загружены');
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

window.wolfScrollToObject = function(v) {
    if (!v) return;
    const el = document.getElementById(v);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const key = v.replace('wolf-', '');
        uiState['wolf-' + key] = true;
        saveUiState();
        renderWolfObjects(); }
};

function renderWolfDesign() {
    const container = document.getElementById('wolfContent');
    if (!container) return;
    let html = '<div class="card"><h3>🎨 Дизайн-проекты</h3>';
    const projs = designProjects.slice().sort((a, b) => a.id - b.id);
    if (!projs.length) html += '<div style="color:#666;">Нет проектов</div>';
    else {
        projs.forEach(p => {
            const obj = getObject(p.objectId);
            const files = (p.files || []).map(f => { const isImg = f.startsWith('data:image/') || f.startsWith('http'); return isImg ? '<img src="' + f + '" onclick="showModal(\'' + f + '\')" style="max-width:80px;max-height:80px;border-radius:4px;">' : '<a href="' + f + '" target="_blank">📄</a>'; }).join(' ') || 'нет';
            html += '<div style="background:#121212;border:1px solid #282828;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + escapeHtml(p.title) + '</b> <span class="badge">' + (p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает') + '</span></span><span><span class="badge">' + (obj ? escapeHtml(obj.name) : '—') + '</span></span></div><div><b>Файлы:</b> ' + files + '</div></div>';
        });
    }
    container.innerHTML = html;
}

function renderWolfRecommendations() {
    const container = document.getElementById('wolfContent');
    if (!container) return;
    let html = '<div class="card"><h3>📋 Рекомендации</h3>';
    const recs = recommendations.slice().sort((a, b) => a.id - b.id);
    if (!recs.length) html += '<div style="color:#666;">Нет рекомендаций</div>';
    else {
        recs.forEach(r => {
            const obj = getObject(r.objectId);
            const status = r.purchased ? '✅ Куплено' : '❌ Не куплено';
            html += '<div style="background:#121212;border:1px solid #282828;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>📋 ' + escapeHtml(r.text) + '</b> <span class="badge">' + status + '</span></span><span><span class="badge">' + (obj ? escapeHtml(obj.name) : '—') + '</span></span></div><div style="font-size:13px;color:#888;">Срок: ' + (r.deadline ? fmt(r.deadline) : 'не указан') + '</div><div style="margin:6px 0;"><button class="btn btn-sm" onclick="markPurchased(' + r.id + ')">' + (r.purchased ? 'Отменить' : '✅ Куплено') + '</button></div></div>';
        });
    }
    container.innerHTML = html;
}

function renderWolfNotes() {
    const container = document.getElementById('wolfContent');
    container.innerHTML = '<div class="flex"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="wolfNotesCalendar"></div>';
    renderNotesCalendar('wolf');
}

function renderWolfChecks() {
    const container = document.getElementById('wolfContent');
    container.innerHTML = '<div class="flex"><button class="btn btn-primary" onclick="addCheck()">➕ Чек</button></div><div id="wolfChecksList"></div>';
    const list = document.getElementById('wolfChecksList');
    const sorted = checks.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!sorted.length) { list.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    list.innerHTML = sorted.map(c => {
        const obj = getObject(c.objectId);
        return '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : '—') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '</div></div>';
    }).join('');
}

function renderWolfPurchases() {
    const container = document.getElementById('wolfContent');
    container.innerHTML = '<button class="btn btn-primary" onclick="addPurchaseOrder()">➕ Новая заявка</button><div id="wolfOrdersList"></div>';
    const list = document.getElementById('wolfOrdersList');
    const orders = purchaseOrders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!orders.length) { list.innerHTML = '<div class="card">Нет заявок</div>'; return; }
    list.innerHTML = orders.map(order => {
        const obj = getObject(order.objectId);
        const items = order.items.map((item, idx) => '<div class="flex"><span>' + escapeHtml(item.name) + ' (' + escapeHtml(item.quantity) + ' шт.)</span><span class="badge">' + (item.purchased ? '✅ Куплено' : '⏳ Не куплено') + '</span><button class="btn btn-sm" onclick="wolfTogglePurchasedItem(' + order.id + ',' + idx + ')">Отметить</button><button class="btn btn-sm btn-danger" onclick="wolfDeleteItemFromOrder(' + order.id + ',' + idx + ')">🗑</button></div>').join('');
        return '<div class="card"><div class="flex"><b>Заявка: ' + (obj ? escapeHtml(obj.name) : '—') + '</b><span class="badge">' + fmt(order.date) + '</span><button class="btn btn-sm btn-danger" onclick="wolfDeleteOrder(' + order.id + ')">🗑</button></div><div><b>Товары:</b> ' + items + '</div><div style="margin-top:8px;"><input type="text" id="wolfNewItemName-' + order.id + '" placeholder="Наименование" style="width:40%;"><input type="text" id="wolfNewItemQty-' + order.id + '" placeholder="Кол-во" style="width:20%;"><button class="btn btn-sm" onclick="wolfAddItemToOrder(' + order.id + ')">➕ Добавить</button></div></div>';
    }).join('');
}

window.addPurchaseOrder = function() {
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const list = available.map((o, i) => (i+1) + '. ' + o.name).join('\n');
    const choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    const order = { id: Date.now(), objectId: available[idx].id, items: [], photos: [], date: new Date(), status: 'active' };
    purchaseOrders.push(order);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('📦 Заявка создана');
};

window.wolfAddItemToOrder = function(orderId) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    const name = document.getElementById('wolfNewItemName-' + orderId).value.trim();
    const qty = document.getElementById('wolfNewItemQty-' + orderId).value.trim();
    if (!name) { showToast('Введите наименование'); return; }
    order.items.push({ id: Date.now(), name, quantity: qty || '1', purchased: false });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('➕ Товар добавлен');
};

window.wolfTogglePurchasedItem = function(orderId, idx) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    order.items[idx].purchased = !order.items[idx].purchased;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
};

window.wolfDeleteItemFromOrder = function(orderId, idx) {
    if (!confirm('Удалить товар?')) return;
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    order.items.splice(idx, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('🗑 Товар удалён');
};

window.wolfDeleteOrder = function(orderId) {
    if (!confirm('Удалить заявку?')) return;
    purchaseOrders = purchaseOrders.filter(o => o.id !== orderId);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/purchase_orders?id=eq.' + orderId, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderWolfPurchases();
    showToast('🗑 Заявка удалена');
};

// ============================================================
// КЛИЕНТ
// ============================================================
function renderClient() {
    const obj = getObject(currentObjectId);
    if (!obj) { document.getElementById('app').innerHTML = '<div class="card">Объект не найден</div>'; return; }
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🏠 ${escapeHtml(obj.name)}</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div>📍 ${escapeHtml(obj.address)}</div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="recommend">Рекомендации</div>
      <div class="tab" data-tab="works">Этапы</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="design">Дизайн</div>
    </div>
    <div id="clientContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'recommend') renderClientRecommend();
        else if (tab === 'works') renderClientWorks();
        else if (tab === 'checks') renderClientChecks();
        else if (tab === 'design') renderClientDesign();
    });
    renderClientRecommend();
}

function renderClientRecommend() {
    const container = document.getElementById('clientContent');
    if (!container) return;
    const obj = getObject(currentObjectId);
    const recs = recommendations.filter(r => r.objectId === obj.id);
    recs.sort((a, b) => { if (a.purchased && !b.purchased) return 1; if (!a.purchased && b.purchased) return -1; return 0; });
    if (!recs.length) { container.innerHTML = '<div class="card">Нет рекомендаций</div>'; return; }
    container.innerHTML = recs.map(r => {
        const status = r.purchased ? '✅ Куплено' : '❌ Не куплено';
        return '<div class="rec-block" style="background:#161616;border:1px solid #282828;padding:10px;margin:6px 0;"><div style="font-weight:500;">📋 ' + escapeHtml(r.text) + '</div><div style="font-size:13px;color:#aaa;"><b>Срок:</b> ' + (r.deadline ? fmt(r.deadline) : 'не указан') + '</div><div style="font-size:13px;color:#aaa;"><b>Статус:</b> ' + status + '</div><div style="margin:6px 0;"><button class="btn btn-sm" onclick="clientMarkPurchased(' + r.id + ')">' + (r.purchased ? 'Отменить' : 'Отметить куплено') + '</button></div></div>';
    }).join('');
}

window.clientMarkPurchased = function(id) {
    const r = recommendations.find(x => x.id === id);
    if (!r) return;
    r.purchased = !r.purchased;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', r);
    renderClient();
    showToast(r.purchased ? '✅ Отмечено' : '↩ Отмена');
};

function renderClientWorks() {
    const container = document.getElementById('clientContent');
    if (!container) return;
    const obj = getObject(currentObjectId);
    let upcomingWorks = [];
    if (obj.schedule) {
        const sorted = [...obj.schedule].filter(s => s.showToClient === true);
        sorted.sort((a, b) => {
            if (!a.startDate) return 1; if (!b.startDate) return -1;
            const pa = a.startDate.split('.'), pb = b.startDate.split('.');
            return new Date(+pa[2], +pa[1] - 1, +pa[0]) - new Date(+pb[2], +pb[1] - 1, +pb[0]);
        });
        upcomingWorks = sorted.slice(0, 5);
    }
    let html = '';
    if (obj.clientStatus) {
        html += '<div style="background:#1a1a1a;border:1px solid #c9a959;border-radius:8px;padding:12px;margin-bottom:12px;"><div style="color:#c9a959;font-size:14px;">📌 ' + escapeHtml(obj.clientStatus) + '</div></div>';
    }
    html += '<div class="card"><h3>📌 Ближайшие работы</h3>';
    if (upcomingWorks.length) {
        html += upcomingWorks.map(w => '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a1a1a;"><span>' + (w.startDate || '—') + '</span><span style="color:#c9a959;">' + escapeHtml(w.name) + '</span></div>').join('');
    } else {
        html += '<div style="color:#666;">Нет запланированных работ</div>';
    }
    html += '</div><div class="card"><h3>📋 Этапы работ</h3>';
    obj.works.forEach(w => {
        const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
        const phHtml = photos.length ? '<div style="margin:6px 0;"><div style="display:flex;flex-wrap:wrap;gap:6px;">' + photos.map(r => '<img src="' + r.photos[0] + '" onclick="showModal(\'' + r.photos[0] + '\')" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;">').join('') + '</div></div>' : '';
        html += '<div style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0;"><div class="flex"><b>' + escapeHtml(w.name) + '</b><span class="badge">' + (w.done ? '✅ выполнено' : '⏳ в работе') + '</span></div>' + phHtml + '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function renderClientChecks() {
    const container = document.getElementById('clientContent');
    if (!container) return;
    const sorted = checks.filter(c => c.objectId === currentObjectId).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!sorted.length) { container.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    container.innerHTML = sorted.map(c => {
        return '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</b></span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="clientMarkCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '</div></div>';
    }).join('');
}

window.clientMarkCheckPaid = function(checkId) {
    const c = checks.find(ch => ch.id === checkId);
    if (!c || c.paid) return;
    c.paid = true;
    c.paidDate = new Date();
    c.paidBy = 'client';
    saveDataToLocal();
    if (isOnline()) saveToSupabase('checks', c);
    renderClientChecks();
    showToast('✅ Чек оплачен');
};

function renderClientDesign() {
    const container = document.getElementById('clientContent');
    if (!container) return;
    const obj = getObject(currentObjectId);
    const projs = designProjects.filter(p => p.objectId === obj.id && (p.roles.includes('client') || p.roles.includes('all')));
    if (!projs.length) { container.innerHTML = '<div class="card">Нет проектов</div>'; return; }
    container.innerHTML = projs.map(p => {
        const files = (p.files || []).map(f => { const isImg = f.startsWith('data:image/') || f.startsWith('http'); return isImg ? '<img src="' + f + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal(\'' + f + '\')">' : '<a href="' + f + '" target="_blank">📄</a>'; }).join(' ') || 'нет';
        return '<div style="background:#161616;border:1px solid #282828;padding:10px;margin:6px 0;"><div style="font-weight:500;">' + escapeHtml(p.title) + ' <span class="badge">' + (p.approvedByClient ? '✅ Утверждён' : '⏳ Не утверждён') + '</span></div><div><b>Файлы:</b> ' + files + '</div><button class="btn btn-sm" onclick="clientApproveDesign(' + p.id + ')">' + (p.approvedByClient ? 'Отменить' : 'Утвердить') + '</button></div>';
    }).join('');
}

window.clientApproveDesign = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (!p) return;
    p.approvedByClient = !p.approvedByClient;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', p);
    renderClient();
    showToast(p.approvedByClient ? '✅ Утверждён' : '⏳ Утверждение снято');
};

// ============================================================
// ЭЛЕКТРИК
// ============================================================
function renderElectrician() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>⚡ Электрик</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="tasks">📋 Задачи</div>
    </div>
    <div id="electricianContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'objects') renderElectricianObjects();
        else if (tab === 'design') renderElectricianDesign();
        else if (tab === 'tasks') renderElectricianTasks();
    });
    renderElectricianObjects();
}

function renderElectricianObjects() {
    const container = document.getElementById('electricianContent');
    if (!container) return;
    const active = objects.filter(o => !o.archived && o.works.some(w => w.forElectrician));
    if (!active.length) { container.innerHTML = '<div class="card">Нет задач</div>'; return; }
    container.innerHTML = active.map(obj => {
        const worksHtml = obj.works.filter(w => w.forElectrician).map(w => '<div class="work-block" style="cursor:default;"><div class="work-header"><span><span class="work-title">' + escapeHtml(w.name) + '</span> ' + (w.done ? '✅' : '⏳') + (w.deadline ? ' 📅 ' + fmt(w.deadline) : '') + '</span></div></div>').join('');
        const ownTasks = electricianTasks.filter(t => t.objectId === obj.id);
        const ownHtml = ownTasks.length ? ownTasks.map(t => '<div><b>📝 ' + escapeHtml(t.text) + '</b> ' + (t.done ? '✅' : '⏳') + '</div>').join('') : '';
        return '<div class="card"><div class="flex"><h3>' + escapeHtml(obj.name) + '</h3></div><div>📍 ' + escapeHtml(obj.address) + '</div><h4>Мои задачи</h4>' + worksHtml + ownHtml + '</div>';
    }).join('');
}

function renderElectricianDesign() {
    const container = document.getElementById('electricianContent');
    if (!container) return;
    const projs = designProjects.filter(p => p.roles.includes('electrician'));
    if (!projs.length) { container.innerHTML = '<div class="card">Нет проектов</div>'; return; }
    container.innerHTML = projs.map(p => {
        const obj = getObject(p.objectId);
        const files = (p.files || []).map(f => { const isImg = f.startsWith('data:image/') || f.startsWith('http'); return isImg ? '<img src="' + f + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal(\'' + f + '\')">' : '<a href="' + f + '" target="_blank">📄</a>'; }).join(' ') || 'нет';
        return '<div class="card"><div class="flex"><h3>' + escapeHtml(p.title) + '</h3><span class="badge">' + (p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает') + '</span></div><div><b>Объект:</b> ' + (obj ? escapeHtml(obj.name) : '—') + '</div><div><b>Файлы:</b> ' + files + '</div></div>';
    }).join('');
}

function renderElectricianTasks() {
    const container = document.getElementById('electricianContent');
    if (!container) return;
    container.innerHTML = '<div class="flex"><button class="btn btn-primary" onclick="addElectricianTask()">➕ Задача</button></div><div id="electricianTasksList"></div>';
    const list = document.getElementById('electricianTasksList');
    if (!list) return;
    const sorted = electricianTasks.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!sorted.length) { list.innerHTML = '<div class="card">Нет задач</div>'; return; }
    list.innerHTML = sorted.map(t => {
        const obj = t.objectId ? getObject(t.objectId) : null;
        return '<div class="card"><div class="flex"><span><b>' + escapeHtml(t.text) + '</b> ' + (obj ? '(объект: ' + escapeHtml(obj.name) + ')' : '') + '</span><span class="badge">' + (t.done ? '✅ выполнено' : '⏳ в работе') + '</span><button class="btn btn-sm" onclick="toggleElectricianTaskDone(' + t.id + ')">' + (t.done ? '↩ Вернуть' : '✅ Выполнить') + '</button><button class="btn btn-sm btn-danger" onclick="deleteElectricianTask(' + t.id + ')">🗑</button></div></div>';
    }).join('');
}

window.addElectricianTask = function() {
    const text = prompt('Текст задачи:');
    if (!text) return;
    let objId = null;
    const available = objects.filter(o => !o.archived);
    if (available.length) {
        const list = available.map((o, i) => (i+1) + '. ' + o.name).join('\n');
        const choice = prompt('Выберите объект (номер) или 0:\n' + list);
        if (choice !== null) {
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < available.length) objId = available[idx].id;
        }
    }
    const task = { id: Date.now(), text, objectId: objId, photos: [], date: new Date(), done: false };
    electricianTasks.push(task);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('electrician_tasks', task);
    renderElectricianTasks();
    showToast('📝 Задача добавлена');
};

window.toggleElectricianTaskDone = function(id) {
    const task = electricianTasks.find(t => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('electrician_tasks', task);
    renderElectricianTasks();
};

window.deleteElectricianTask = function(id) {
    if (!confirm('Удалить задачу?')) return;
    electricianTasks = electricianTasks.filter(t => t.id !== id);
    saveDataToLocal();
    if (isOnline()) { fetch(SUPABASE_URL + '/rest/v1/electrician_tasks?id=eq.' + id, { method: 'DELETE', headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY } }); }
    renderElectricianTasks();
    showToast('🗑 Задача удалена');
};

// ============================================================
// ОБЩИЕ ФУНКЦИИ
// ============================================================
function renderFakeCabinet(role) {
    const labels = { designer: '🎨 Дизайнер', master: '🔧 Мастер', purchaser: '📦 Закупщик' };
    document.getElementById('app').innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;"><div style="font-size:64px;">🔒</div><h2 style="color:#c9a959;">' + labels[role] + '</h2><div style="color:#666;font-size:18px;">Доступ временно ограничен</div><button class="btn btn-primary" onclick="currentUser=null;render()">🚪 Выйти</button></div>';
}

function renderGenericViewer(title) {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>' + title + '</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div><div id="genericContent"></div>';
    const container = document.getElementById('genericContent');
    if (!container) return;
    const active = objects.filter(o => !o.archived);
    if (!active.length) { container.innerHTML = '<div class="card">Нет объектов</div>'; return; }
    container.innerHTML = active.map(obj => {
        const worksHtml = obj.works.map(w => {
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id && r.approved);
            const phHtml = photos.map(r => '<img src="' + r.photos[0] + '" style="width:50px;" onclick="showModal(\'' + r.photos[0] + '\')">').join('');
            return '<div class="work-block"><div class="work-header"><span><span class="work-title">' + escapeHtml(w.name) + '</span> ' + (w.done ? '✅' : '⏳') + '</span></div><div class="work-detail open"><div><b>Фото:</b> ' + (phHtml || 'нет') + '</div></div></div>';
        }).join('');
        return '<div class="card"><div class="flex"><h3>' + escapeHtml(obj.name) + '</h3><span class="badge">' + (obj.completed ? 'Сдан' : 'В работе') + '</span></div><div>📍 ' + escapeHtml(obj.address) + '</div><h4>Этапы</h4>' + worksHtml + '</div>';
    }).join('');
}

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

window.login = function(r) {
    if (['designer', 'master', 'purchaser'].includes(r)) {
        if (!passwords[r]) { passwords[r] = '30986'; saveDataToLocal(); }
        const p = prompt('Введите пароль:');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
        currentUser = r;
        render();
        return;
    }
    if (passwords[r] && passwords[r].length > 0) {
        const p = prompt('Введите пароль:');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
    }
    if (r === 'client') {
        const pwd = prompt('ПАРОЛЬ объекта:');
        if (!pwd) { alert('Пароль не введён'); return; }
        let found = null;
        for (let o of objects) {
            if (passwords.objects[o.id] === pwd) { found = o; break; }
        }
        if (!found) { alert('Неверный пароль'); return; }
        currentUser = r;
        currentObjectId = found.id;
        render();
    } else {
        currentUser = r;
        render();
    }
};

function renderPlaceholder() {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>' + getUserLabel(currentUser) + '</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div></div>';
}

function render() {
    const app = document.getElementById('app');
    if (!app) return;
    if (!currentUser) { renderLogin(); return; }
    if (['designer', 'master', 'purchaser'].includes(currentUser)) { renderFakeCabinet(currentUser); return; }
    if (currentUser === 'boss') { renderBoss(); return; }
    if (currentUser === 'wolf') { renderWolf(); return; }
    if (currentUser === 'client') { renderClient(); return; }
    if (currentUser === 'electrician') { renderElectrician(); return; }
    renderPlaceholder();
}

function initDragDrop() {
    document.querySelectorAll('.work-block').forEach(b => {
        b.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({ objectId: parseInt(this.dataset.objectId), workIndex: parseInt(this.dataset.workIndex) }));
            this.classList.add('dragging');
        });
        b.addEventListener('dragend', function() { this.classList.remove('dragging'); });
        b.addEventListener('dragover', function(e) { e.preventDefault(); });
        b.addEventListener('drop', function(e) {
            e.preventDefault();
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const obj = getObject(data.objectId);
            if (!obj) return;
            const toIndex = parseInt(this.dataset.workIndex);
            const works = obj.works;
            const [removed] = works.splice(data.workIndex, 1);
            works.splice(toIndex, 0, removed);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('objects', obj);
            renderBossObjects();
        });
    });
}

function toggleWork(e, h, k) {
    if (e) e.stopPropagation();
    const block = h.closest('.work-block');
    if (!block) return;
    const detail = block.querySelector('.work-detail');
    const arrow = block.querySelector('.work-arrow');
    if (detail) {
        const isOpen = detail.classList.contains('open');
        if (isOpen) { detail.classList.remove('open'); if (arrow) arrow.classList.remove('open');
            uiState[k] = false; }
        else { detail.classList.add('open'); if (arrow) arrow.classList.add('open');
            uiState[k] = true; }
        saveUiState();
    }
}

function toggleObject(h, k) {
    const d = h.parentElement.querySelector('.object-detail');
    const a = h.querySelector('.arrow');
    if (!d) return;
    const isOpen = d.classList.contains('open');
    if (isOpen) { d.classList.remove('open'); if (a) a.classList.remove('open');
        uiState[k] = false; }
    else { d.classList.add('open'); if (a) a.classList.add('open');
        uiState[k] = true; }
    saveUiState();
}

function showModal(src) {
    let m = document.getElementById('modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal';
        m.className = 'modal';
        m.onclick = function(e) { if (e.target === m) m.remove(); };
        document.body.appendChild(m);
    }
    m.innerHTML = '<img src="' + src + '">';
    m.style.display = 'flex';
}

window.uploadCSV = function() { showToast('📊 CSV загрузка в разработке'); };
window.scrollToObject = function(v) {
    if (!v) return;
    const el = document.getElementById(v);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const key = v.replace('obj-', '');
        uiState['obj-' + key] = true;
        saveUiState();
        renderBossObjects(); }
};

window.setWorkFilter = function(objId, filter) {
    uiState['filter-' + objId] = filter;
    saveUiState();
    renderBossObjects();
};

// ============================================================
// ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Запуск СтройУчёт...');
    loadPendingActions();
    loadDataFromLocal();
    render();
    setTimeout(function() {
        loadAllFromSupabase();
        console.log('✅ Данные загружены из Supabase');
    }, 500);
});

console.log('✅ СТРОЙУЧЁТ ЗАПУЩЕН');
console.log('🔑 Пароль по умолчанию: 30986');
// ============================================================
// СИНХРОНИЗАЦИЯ С SUPABASE (ДОБАВЛЯЕМ В КОНЕЦ)
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// Сохраняем оригинальную функцию
const originalSave = window.saveDataToLocal;

// Добавляем синхронизацию
window.saveDataToLocal = function() {
    if (typeof originalSave === 'function') {
        originalSave();
    }
    
    if (navigator.onLine) {
        try {
            for (const obj of objects) {
                fetch(SUPABASE_URL + '/rest/v1/objects?id=eq.' + obj.id, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    },
                    body: JSON.stringify(obj)
                }).catch(() => {});
            }
            
            for (const [role, pwd] of Object.entries(passwords)) {
                if (role !== 'objects' && pwd) {
                    fetch(SUPABASE_URL + '/rest/v1/passwords?role=eq.' + role, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': 'Bearer ' + SUPABASE_KEY
                        },
                        body: JSON.stringify({ password: pwd })
                    }).catch(() => {});
                }
            }
        } catch(e) {}
    }
};

console.log('✅ Синхронизация добавлена');
