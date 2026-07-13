// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ ВЕРСИЯ (С ПАРОЛЯМИ)
// ============================================================

console.log('🚀 СтройУчёт загружается...');

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// ============================================================
// ЗАЩИТА ОТ ПУСТОГО ЭКРАНА
// ============================================================
window.addEventListener('load', function() {
    var app = document.getElementById('app');
    if (!app || app.innerHTML.trim() === '') {
        console.warn('⚠️ Приложение не загрузилось, показываем экран восстановления');
        app.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;max-width:400px;margin:40px auto;">
            <div style="font-size:48px;margin-bottom:12px;">🔄</div>
            <h3 style="color:#e8e8e8;">Не удалось загрузить приложение</h3>
            <p style="color:#888;margin:12px 0;">Попробуйте перезагрузить страницу</p>
            <button class="btn btn-primary" onclick="location.reload()" style="padding:10px 30px;font-size:16px;">Перезагрузить</button>
            <div style="margin-top:12px;font-size:12px;color:#555;">
                Если проблема повторяется, <span onclick="localStorage.clear();location.reload()" style="cursor:pointer;color:#c9a959;">очистите данные</span>
            </div>
        </div>`;
    }
});

setTimeout(function() {
    var app = document.getElementById('app');
    if (app && app.innerHTML.trim() === '') {
        console.warn('⚠️ Приложение зависло, показываем экран восстановления');
        app.innerHTML = `
        <div class="card" style="text-align:center;padding:40px;max-width:400px;margin:40px auto;">
            <div style="font-size:48px;margin-bottom:12px;">⏳</div>
            <h3 style="color:#e8e8e8;">Загрузка занимает больше времени</h3>
            <p style="color:#888;margin:12px 0;">Попробуйте перезагрузить страницу</p>
            <button class="btn btn-primary" onclick="location.reload()" style="padding:10px 30px;font-size:16px;">Перезагрузить</button>
        </div>`;
    }
}, 5000);

// ============================================================
// ДАННЫЕ
// ============================================================
var objects = [];
var reports = [];
var designProjects = [];
var recommendations = [];
var checks = [];
var purchaseOrders = [];
var notes = [];
var electricianTasks = [];
var passwords = { boss: '30986', wolf: '30986', client: '30986', master: '30986', designer: '30986', purchaser: '30986', electrician: '30986', objects: {} };
var currentUser = null;
var currentObjectId = null;
var uiState = {};
var pendingActions = [];
var isSyncing = false;
var calendarOffset = 0;

// ============================================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================
function escapeHtml(s) { if (!s) return ''; var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(s).replace(/[&<>"']/g, function(c) { return m[c]; }); }
function getUserLabel(r) { var m = { boss: 'Руководитель', wolf: 'Волк', client: 'Клиент', designer: 'Дизайнер', master: 'Мастер', purchaser: 'Закупщик', electrician: 'Электрик' }; return m[r] || r; }
function getObject(id) { for (var i = 0; i < objects.length; i++) { if (objects[i].id == id) return objects[i]; } return null; }
function fmt(d) { if (!d) return ''; var dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString(); }
function fmtTime(d) { if (!d) return ''; var dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleString(); }
function isValidDate(d) { var r = /^\d{2}\.\d{2}\.\d{4}$/; if (!r.test(d)) return false; var p = d.split('.'); var dt = new Date(+p[2], +p[1] - 1, +p[0]); return dt && dt.getFullYear() == +p[2] && dt.getMonth() == +p[1] - 1 && dt.getDate() == +p[0]; }
function isOnline() { return navigator.onLine; }
function saveUiState() { try { localStorage.setItem('uiState', JSON.stringify(uiState)); } catch(e) {} }
function loadUiState() { try { var s = localStorage.getItem('uiState'); if (s) uiState = JSON.parse(s); } catch(e) {} if (!uiState) uiState = {}; }
function getDaysRemaining(endDate) { if (!endDate) return null; var p = endDate.split('.'); if (p.length === 3) { var end = new Date(+p[2], +p[1] - 1, +p[0]); var now = new Date(); var diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24)); return diff; } return null; }

function showToast(msg) {
    var old = document.getElementById('toast');
    if (old) old.remove();
    var t = document.createElement('div');
    t.id = 'toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#222;color:#e0e0e0;padding:12px 24px;border-radius:8px;border:1px solid #c9a959;z-index:9999;font-size:16px;max-width:90%;text-align:center;';
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 3000);
}

// ============================================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
// ============================================================
function loadPendingActions() {
    try { var data = localStorage.getItem('pendingActions'); if (data) pendingActions = JSON.parse(data); } catch(e) { pendingActions = []; }
}
function savePendingActions() {
    try { localStorage.setItem('pendingActions', JSON.stringify(pendingActions)); } catch(e) {}
}
function addPendingAction(action) {
    pendingActions.push({ id: Date.now() + Math.random() * 1000, type: action.type, data: action.data, timestamp: new Date().toISOString() });
    savePendingActions();
}

function saveDataToLocal() {
    try {
        localStorage.setItem('data', JSON.stringify({
            objects: objects,
            reports: reports,
            designProjects: designProjects,
            recommendations: recommendations,
            checks: checks,
            purchaseOrders: purchaseOrders,
            notes: notes,
            electricianTasks: electricianTasks,
            passwords: passwords
        }));
    } catch(e) { console.error('Save local error:', e); }
    if (isOnline()) syncToSupabase();
}

function loadDataFromLocal() {
    try {
        var d = JSON.parse(localStorage.getItem('data'));
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
        var n = Date.now();
        objects.push({
            id: n,
            code: 'DEMO',
            name: 'Демо-объект',
            address: 'ул. Примерная, 1',
            works: [{ id: n + 1, name: 'Демонтаж', done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: false, status: '', paid: false, contractor: null, contractorStatus: 'unassigned' }],
            completed: false,
            archived: false,
            startDate: null,
            plannedEndDate: null,
            schedule: [],
            notes: '',
            contractors: []
        });
        passwords.objects[n] = 'demo123';
    }
    for (var i = 0; i < objects.length; i++) {
        var o = objects[i];
        for (var j = 0; j < o.works.length; j++) {
            var w = o.works[j];
            if (w.quantity === undefined) w.quantity = '';
            if (w.unit === undefined) w.unit = '';
            if (w.done === undefined) w.done = false;
            if (w.forElectrician === undefined) w.forElectrician = false;
            if (w.manual === undefined) w.manual = false;
            if (w.status === undefined) w.status = '';
            if (w.paid === undefined) w.paid = false;
            if (w.contractor === undefined) w.contractor = null;
            if (w.contractorStatus === undefined) w.contractorStatus = 'unassigned';
        }
        if (o.startDate === undefined) o.startDate = null;
        if (o.plannedEndDate === undefined) o.plannedEndDate = null;
        if (o.schedule === undefined) o.schedule = [];
        if (o.notes === undefined) o.notes = '';
        if (o.contractors === undefined) o.contractors = [];
    }
    for (var r = 0; r < recommendations.length; r++) {
        if (!recommendations[r].photos) recommendations[r].photos = [];
        if (!recommendations[r].purchasedPhotos) recommendations[r].purchasedPhotos = [];
    }
    for (var t = 0; t < electricianTasks.length; t++) {
        if (!electricianTasks[t].photos) electricianTasks[t].photos = [];
        if (electricianTasks[t].done === undefined) electricianTasks[t].done = false;
        if (electricianTasks[t].objectId === undefined) electricianTasks[t].objectId = null;
    }
    for (var oi = 0; oi < objects.length; oi++) {
        var obj = objects[oi];
        if (!passwords.objects[obj.id]) passwords.objects[obj.id] = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    loadUiState();
}

// ============================================================
// ПОЛНАЯ СИНХРОНИЗАЦИЯ С SUPABASE
// ============================================================
async function syncToSupabase() {
    if (isSyncing || !isOnline()) return;
    isSyncing = true;
    try {
        for (var i = 0; i < objects.length; i++) {
            var obj = objects[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/objects?id=eq.' + obj.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
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
        for (var role in passwords) {
            if (role === 'objects') continue;
            if (passwords[role]) {
                var checkResp = await fetch(SUPABASE_URL + '/rest/v1/passwords?role=eq.' + role, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                });
                var existing = await checkResp.json();
                if (existing.length > 0) {
                    await fetch(SUPABASE_URL + '/rest/v1/passwords?role=eq.' + role, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                        body: JSON.stringify({ password: passwords[role] })
                    });
                } else {
                    await fetch(SUPABASE_URL + '/rest/v1/passwords', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                        body: JSON.stringify({ role: role, password: passwords[role] })
                    });
                }
            }
        }
        for (var objId in passwords.objects) {
            if (passwords.objects[objId]) {
                var checkResp = await fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
                });
                var existing = await checkResp.json();
                if (existing.length > 0) {
                    await fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                        body: JSON.stringify({ password: passwords.objects[objId] })
                    });
                } else {
                    await fetch(SUPABASE_URL + '/rest/v1/passwords', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                        body: JSON.stringify({ object_id: parseInt(objId), password: passwords.objects[objId] })
                    });
                }
            }
        }
        console.log('✅ Синхронизация выполнена');
    } catch(e) { console.error('❌ Ошибка синхронизации:', e); }
    isSyncing = false;
}

async function loadFromSupabase() {
    if (!isOnline()) return;
    try {
        var resp = await fetch(SUPABASE_URL + '/rest/v1/objects?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (resp.ok) {
            var data = await resp.json();
            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var existing = null;
                    for (var j = 0; j < objects.length; j++) {
                        if (objects[j].id === item.id) { existing = objects[j]; break; }
                    }
                    if (!existing) objects.push(item);
                    else {
                        for (var key in item) {
                            if (item.hasOwnProperty(key)) existing[key] = item[key];
                        }
                    }
                }
                saveDataToLocal();
                console.log('✅ Загружено ' + data.length + ' объектов');
            }
        }
    } catch(e) { console.error('❌ Ошибка загрузки из Supabase:', e); }
}

async function loadAllFromSupabase() {
    if (!isOnline()) {
        console.log('⚠️ Нет интернета, используем локальные данные');
        return;
    }
    try {
        console.log('🔄 Загрузка всех данных из Supabase...');
        await loadFromSupabase();
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        else if (currentUser === 'client') renderClient();
        else if (currentUser === 'electrician') renderElectrician();
        showToast('✅ Данные синхронизированы');
    } catch(e) { console.error('❌ Ошибка загрузки:', e); }
}

// ============================================================
// РЕНДЕР ВХОДА
// ============================================================
function renderLogin() {
    document.getElementById('app').innerHTML = `
    <div class="card" style="text-align:center;padding:30px;">
      <div class="login-header"><div class="slogan">Умная система учёта работы<small>Управляй учётом вместе с УРОВНЕМ</small></div></div>
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
        if (!passwords[r]) passwords[r] = '30986';
        var p = prompt('Введите пароль для "' + getUserLabel(r) + '":');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
        currentUser = r; render(); return;
    }
    if (passwords[r] && passwords[r].length > 0) {
        var p = prompt('Введите пароль для "' + getUserLabel(r) + '":');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
    }
    if (r === 'client') {
        var pwd = prompt('Введите ПАРОЛЬ объекта:');
        if (pwd === null || pwd.trim() === '') { alert('Пароль не введён'); return; }
        var found = null;
        for (var i = 0; i < objects.length; i++) {
            if (passwords.objects[objects[i].id] === pwd) { found = objects[i]; break; }
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

// ============================================================
// РЕНДЕР ФЕЙК-КАБИНЕТОВ
// ============================================================
function renderFakeCabinet(role) {
    var labels = { designer: '🎨 Дизайнер', master: '🔧 Мастер', purchaser: '📦 Закупщик' };
    document.getElementById('app').innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;min-height:400px;display:flex;flex-direction:column;justify-content:center;align-items:center;"><div style="font-size:64px;margin-bottom:20px;">🔒</div><h2 style="color:#c9a959;margin-bottom:10px;">' + labels[role] + '</h2><div style="color:#666;font-size:18px;margin-bottom:20px;">Доступ временно ограничен</div><div style="color:#444;font-size:14px;max-width:300px;margin-bottom:30px;">Ведутся технические работы. Пожалуйста, обратитесь к руководителю.</div><button class="btn btn-primary" onclick="currentUser=null;render()">🚪 Выйти</button></div>';
}

// ============================================================
// РЕНДЕР БОССА
// ============================================================
function renderBoss() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>👔 Руководитель</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="passwords">🔐 Пароли</div>
      <div class="tab" data-tab="schedule">📋 График</div>
    </div>
    <div id="bossContent"></div>`;
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            this.classList.add('active');
            var tab = this.dataset.tab;
            if (tab === 'objects') renderBossObjects();
            else if (tab === 'notes') renderBossNotes();
            else if (tab === 'purchases') renderBossPurchases();
            else if (tab === 'checks') renderBossChecks();
            else if (tab === 'passwords') renderPasswords();
            else if (tab === 'schedule') renderSchedule();
        };
    }
    renderBossObjects();
}

function renderBossObjects() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    if (!uiState['bossObjectFilter']) uiState['bossObjectFilter'] = 'active';
    var filter = uiState['bossObjectFilter'];
    var objectsToShow = [];
    if (filter === 'active') {
        for (var i = 0; i < objects.length; i++) {
            if (!objects[i].archived && !objects[i].completed) objectsToShow.push(objects[i]);
        }
    } else if (filter === 'completed') {
        for (var i = 0; i < objects.length; i++) {
            if (!objects[i].archived && objects[i].completed) objectsToShow.push(objects[i]);
        }
    }

    var statusHtml = '<div style="position:fixed;top:10px;right:10px;z-index:9999;display:flex;align-items:center;gap:6px;padding:4px 10px;background:#0d0d0d;border-radius:12px;border:1px solid #1a1a1a;font-size:12px;color:#888;">' +
        '<span id="syncDot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (pendingActions.length === 0 ? '#4caf50' : '#c9a959') + ';"></span>' +
        '<span id="syncText">' + (pendingActions.length === 0 ? 'Синхронизация OK' : pendingActions.length + ' действий ожидают') + '</span>' +
        '</div>';

    var toolsHtml = '<div style="position:fixed;top:10px;right:100px;z-index:9999;display:flex;align-items:center;gap:8px;background:#0d0d0d;border-radius:12px;border:1px solid #1a1a1a;padding:6px 12px;">' +
        '<span onclick="exportAllData()" style="cursor:pointer;font-size:18px;color:#666;padding:2px 6px;border-radius:4px;transition:all 0.2s;line-height:1;" onmouseover="this.style.color=\'#c9a959\';this.style.background=\'#1a1a1a\'" onmouseout="this.style.color=\'#666\';this.style.background=\'transparent\'" title="Экспорт данных">📤</span>' +
        '<span style="color:#333;font-size:12px;line-height:1;">|</span>' +
        '<span onclick="importAllData()" style="cursor:pointer;font-size:18px;color:#666;padding:2px 6px;border-radius:4px;transition:all 0.2s;line-height:1;" onmouseover="this.style.color=\'#c9a959\';this.style.background=\'#1a1a1a\'" onmouseout="this.style.color=\'#666\';this.style.background=\'transparent\'" title="Импорт данных">📥</span>' +
        (pendingActions.length > 0 ? '<span style="color:#333;font-size:12px;line-height:1;">|</span><span onclick="syncPendingActions()" style="cursor:pointer;font-size:16px;color:#c9a959;padding:2px 6px;border-radius:4px;transition:all 0.2s;line-height:1;" onmouseover="this.style.background=\'#1a1a1a\'" onmouseout="this.style.background=\'transparent\'" title="Синхронизировать">🔄</span>' : '') +
        '</div>';

    var filterTabs = '<div class="obj-filter-tabs"><span class="tab ' + (filter === 'active' ? 'active' : '') + '" onclick="setBossObjectFilter(\'active\')">Активные</span><span class="tab ' + (filter === 'completed' ? 'active' : '') + '" onclick="setBossObjectFilter(\'completed\')">Сданные</span></div>';
    var sel = '<div class="flex" style="margin-bottom:16px;"><button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button><button class="btn" onclick="uploadCSV()">📊 Загрузить CSV</button><select class="object-selector" id="objectSelector" onchange="scrollToObject(this.value)"><option value="">— Перейти к объекту —</option>';
    for (var i = 0; i < objects.length; i++) {
        sel += '<option value="obj-' + objects[i].id + '">' + escapeHtml(objects[i].name) + ' (' + escapeHtml(objects[i].code) + ')</option>';
    }
    sel += '</select></div>';

    var list = '';
    for (var i = 0; i < objectsToShow.length; i++) {
        var obj = objectsToShow[i];
        var objKey = 'obj-' + obj.id;
        var objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        
        var projs = [];
        for (var p = 0; p < designProjects.length; p++) {
            if (designProjects[p].objectId === obj.id) projs.push(designProjects[p]);
        }
        var designKey = 'design-' + obj.id;
        var designOpen = uiState[designKey] !== undefined ? uiState[designKey] : false;
        var designBlocks = '';
        for (var p = 0; p < projs.length; p++) {
            var pr = projs[p];
            var roles = pr.roles ? pr.roles.map(function(r) { return getUserLabel(r); }).join(', ') : 'все';
            var comments = '';
            if (pr.comments) {
                for (var c = 0; c < pr.comments.length; c++) {
                    comments += '<div><b>' + escapeHtml(pr.comments[c].author) + '</b> ' + escapeHtml(pr.comments[c].text) + ' <small style="color:#888;">' + fmt(pr.comments[c].date) + '</small></div>';
                }
            }
            var files = '';
            if (pr.files) {
                for (var f = 0; f < pr.files.length; f++) {
                    var file = pr.files[f];
                    var isImg = file.startsWith('data:image/') || file.startsWith('http');
                    var isPdf = file.startsWith('data:application/pdf');
                    var isDoc = file.startsWith('data:application/msword') || file.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    var isExcel = file.startsWith('data:application/vnd.ms-excel') || file.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                    
                    var icon = '📎';
                    if (isImg) icon = '🖼️';
                    else if (isPdf) icon = '📄';
                    else if (isDoc) icon = '📝';
                    else if (isExcel) icon = '📊';
                    
                    files += '<span class="file-wrap" style="display:inline-flex;align-items:center;gap:4px;background:#1a1a1a;padding:4px 8px;border-radius:4px;margin:2px;">' + 
                        (isImg ? '<img src="' + file + '" onclick="showModal(\'' + file + '\')" style="max-width:80px;max-height:80px;border-radius:4px;cursor:pointer;">' : 
                        '<span onclick="window.open(\'' + file + '\',\'_blank\')" style="cursor:pointer;font-size:20px;color:#c9a959;">' + icon + '</span>') + 
                        '<button class="del" onclick="deleteDesignFile(' + pr.id + ',' + f + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;line-height:1;">×</button>' +
                        '</span>';
                }
            }
            if (!files) files = 'нет';
            designBlocks += '<div style="padding:6px 8px;margin:4px 0;background:#121212;border-radius:4px;border-left:2px solid ' + (pr.approvedByClient ? '#4caf50' : '#666') + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;color:#e0e0e0;cursor:pointer;" onclick="toggleDesignBlock(this,\'' + designKey + '\')">' + escapeHtml(pr.title) + ' <span style="color:#888;font-size:11px;margin-left:6px;">' + (pr.approvedByClient ? '✅' : '⏳') + '</span></span>' +
                '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteDesign(' + pr.id + ')" style="padding:2px 6px;font-size:11px;">×</button>' +
                '</div>' +
                '<div class="design-detail ' + (designOpen ? 'open' : '') + '" style="display:' + (designOpen ? 'block' : 'none') + ';font-size:12px;color:#888;margin-top:4px;padding:4px 0;">' +
                '<div><b>Файлы:</b> ' + files + '</div>' +
                '<div><b>Комментарии:</b> ' + (comments || 'нет') + '</div>' +
                '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">' +
                '<button class="btn btn-sm" onclick="addDesignComment(' + pr.id + ')" style="padding:2px 8px;font-size:11px;">💬</button>' +
                '<button class="btn btn-sm" onclick="toggleDesignApprove(' + pr.id + ')" style="padding:2px 8px;font-size:11px;">' + (pr.approvedByClient ? '↩' : '✅') + '</button>' +
                '</div></div></div>';
        }
        
        var recs = [];
        for (var r = 0; r < recommendations.length; r++) {
            if (recommendations[r].objectId === obj.id) recs.push(recommendations[r]);
        }
        var recKey = 'rec-' + obj.id;
        var recOpen = uiState[recKey] !== undefined ? uiState[recKey] : false;
        var recBlocks = '';
        for (var r = 0; r < recs.length; r++) {
            var rec = recs[r];
            var status = rec.purchased ? '✅ Куплено' : (rec.purchasedDate ? '⏳ Ожидается до ' + fmt(rec.purchasedDate) : '❌ Не куплено');
            var phRec = '';
            if (rec.photos) {
                for (var ph = 0; ph < rec.photos.length; ph++) {
                    phRec += '<span class="pw"><img src="' + rec.photos[ph] + '" onclick="showModal(\'' + rec.photos[ph] + '\')"><button class="del" onclick="deleteRecommendPhoto(' + rec.id + ',' + ph + ',\'photos\')">×</button></span>';
                }
            }
            var phPur = '';
            if (rec.purchasedPhotos) {
                for (var ph = 0; ph < rec.purchasedPhotos.length; ph++) {
                    phPur += '<span class="pw"><img src="' + rec.purchasedPhotos[ph] + '" onclick="showModal(\'' + rec.purchasedPhotos[ph] + '\')"><button class="del" onclick="deleteRecommendPhoto(' + rec.id + ',' + ph + ',\'purchasedPhotos\')">×</button></span>';
                }
            }
            recBlocks += '<div style="padding:6px 8px;margin:3px 0;background:#121212;border-radius:4px;border-left:2px solid ' + (rec.purchased ? '#4caf50' : '#666') + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;color:#e0e0e0;cursor:pointer;" onclick="toggleRecBlock(this,\'' + recKey + '\')">📋 ' + escapeHtml(rec.text) + ' <span style="color:#888;font-size:11px;margin-left:6px;">' + (rec.purchased ? '✅' : '⏳') + '</span>' + (rec.deadline ? ' <span style="color:#666;font-size:10px;margin-left:6px;">до ' + fmt(rec.deadline) + '</span>' : '') + '</span>' +
                '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteRecommend(' + rec.id + ')" style="padding:2px 6px;font-size:11px;">×</button>' +
                '</div>' +
                '<div class="rec-detail ' + (recOpen ? 'open' : '') + '" style="display:' + (recOpen ? 'block' : 'none') + ';font-size:12px;color:#888;margin-top:4px;padding:4px 0;">' +
                '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">' +
                '<button class="btn btn-sm" onclick="markPurchased(' + rec.id + ')" style="padding:2px 8px;font-size:11px;" title="' + (rec.purchased ? 'Отменить покупку' : 'Отметить куплено') + '">' + (rec.purchased ? '↩' : '✅') + '</button>' +
                '<button class="btn btn-sm" onclick="addRecommendationPhoto(' + rec.id + ')" style="padding:2px 8px;font-size:11px;" title="Фото к рекомендации">📎</button>' +
                '<button class="btn btn-sm" onclick="addPurchasedPhoto(' + rec.id + ')" style="padding:2px 8px;font-size:11px;" title="Фото покупки">📸</button>' +
                '</div>' +
                '<div style="margin-top:4px;">' + phRec + phPur + '</div>' +
                '</div></div>';
        }

        var statusTabs = '<div class="flex" style="margin:8px 0;flex-wrap:wrap;gap:4px;">' +
            '<button class="btn btn-sm btn-primary" onclick="setWorkFilter(\'' + obj.id + '\',\'all\')">Все</button>' +
            '<button class="btn btn-sm" onclick="setWorkFilter(\'' + obj.id + '\',\'done\')">✅ Выполненные</button>' +
            '<button class="btn btn-sm" onclick="setWorkFilter(\'' + obj.id + '\',\'undone\')">⏳ Не выполненные</button>' +
            '<button class="btn btn-sm" onclick="setWorkFilter(\'' + obj.id + '\',\'unpaid\')">💰 Неоплаченные</button>' +
            '</div>';
        if (!uiState['filter-' + obj.id]) uiState['filter-' + obj.id] = 'all';
        var currentFilter = uiState['filter-' + obj.id] || 'all';
        var filteredWorks = obj.works;
        if (currentFilter === 'done') filteredWorks = obj.works.filter(function(w) { return w.done === true; });
        else if (currentFilter === 'undone') filteredWorks = obj.works.filter(function(w) { return w.done === false; });
        else if (currentFilter === 'unpaid') filteredWorks = obj.works.filter(function(w) { return w.manual === true && w.done === false && w.paid !== true; });

        var worksHtml = '';
        for (var w = 0; w < filteredWorks.length; w++) {
            var work = filteredWorks[w];
            var originalIndex = obj.works.indexOf(work);
            var wKey = 'work-' + obj.id + '-' + w;
            var wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            
            var photos = [];
            for (var p = 0; p < reports.length; p++) {
                if (reports[p].objectId === obj.id && reports[p].workId === work.id) photos.push(reports[p]);
            }
            var phHtml = '';
            for (var p = 0; p < photos.length; p++) {
                phHtml += '<span class="pw"><img src="' + photos[p].photos[0] + '" onclick="showModal(\'' + photos[p].photos[0] + '\')"><button class="del" onclick="deleteWorkPhoto(' + photos[p].id + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>';
            }
            
            var daysHtml = '';
            if (work.deadline && !work.done) {
                var daysLeft = getDaysRemaining(work.deadline);
                if (daysLeft !== null) {
                    daysHtml = '<span style="font-size:12px;color:' + (daysLeft < 0 ? '#a04040' : '#4caf50') + ';margin-left:8px;">' + (daysLeft < 0 ? '⏰ просрочка ' + Math.abs(daysLeft) + ' дн.' : '⏳ осталось ' + daysLeft + ' дн.') + '</span>';
                }
            }
            
            var contractorHtml = '';
            if (work.contractorStatus === 'assigned' && work.contractor) {
                contractorHtml = '<span style="font-size:12px;color:#4caf50;margin-left:4px;">👤 ' + escapeHtml(work.contractor.name) + '</span>';
            } else if (work.contractorStatus === 'search') {
                contractorHtml = '<span style="font-size:12px;color:#c9a959;margin-left:4px;">⏳ Поиск...</span>';
            } else {
                contractorHtml = '<span style="font-size:12px;color:#555;margin-left:4px;cursor:pointer;" onclick="assignContractor(' + obj.id + ',' + originalIndex + ')" title="Назначить исполнителя">👤 Назначить</span>';
            }
            
            var electricianDisplay = '⚡';
            var electricianColor = work.forElectrician ? '#c9a959' : '#555';
            
            worksHtml += '<div class="work-block" draggable="true" data-object-id="' + obj.id + '" data-work-index="' + originalIndex + '" data-work-id="' + work.id + '">' +
                '<div class="work-header" onclick="toggleWork(event, this, \'' + wKey + '\')">' +
                '<span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;">' +
                '<span class="drag-handle">⠿</span>' +
                '<span class="work-title">' + escapeHtml(work.name) + '</span>' +
                contractorHtml +
                (work.quantity ? ' <span class="work-quantity">(' + escapeHtml(work.quantity) + ' ' + escapeHtml(work.unit) + ')</span>' : '') +
                '<span class="work-status-check" onclick="event.stopPropagation();toggleWorkStatus(' + obj.id + ',' + originalIndex + ')" style="cursor:pointer;font-size:18px;color:' + (work.done ? '#4caf50' : '#666') + ';transition:color 0.2s;">' + (work.done ? '☑' : '☐') + '</span>' +
                '<span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(' + obj.id + ',' + originalIndex + ')" title="Назначить электрику" style="cursor:pointer;font-size:16px;color:' + electricianColor + ';transition:color 0.2s;display:inline-flex;align-items:center;gap:2px;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'' + electricianColor + '\'">' + electricianDisplay + (work.forElectrician ? '<span style="display:inline-block;width:8px;height:8px;background:#c9a959;border-radius:50%;box-shadow:0 0 8px #c9a959;"></span>' : '') + '</span>' +
                daysHtml +
                (work.manual && currentFilter === 'unpaid' ? '<span onclick="event.stopPropagation();toggleWorkPaid(' + obj.id + ',' + originalIndex + ')" style="cursor:pointer;font-size:14px;color:' + (work.paid ? '#4caf50' : '#c9a959') + ';margin-left:4px;" title="' + (work.paid ? 'Оплачено' : 'Отметить оплату') + '">' + (work.paid ? '💰' : '💳') + '</span>' : '') +
                (photos.length > 0 ? '<span class="photo-indicator" title="Есть фото" style="display:inline-block;width:8px;height:8px;background:#4caf50;border-radius:50%;margin-left:4px;box-shadow:0 0 8px rgba(76,175,80,0.5);"></span>' : '<span class="photo-indicator" title="Нет фото" style="display:inline-block;width:8px;height:8px;background:#333;border-radius:50%;margin-left:4px;"></span>') +
                '<span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span>' +
                '</span>' +
                '<span style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;">' +
                '<button class="icon-btn" onclick="event.stopPropagation();uploadWorkPhoto(' + obj.id + ',' + originalIndex + ')" title="Загрузить фото">📸</button>' +
                '<button class="icon-btn" onclick="event.stopPropagation();setWorkDeadline(' + obj.id + ',' + originalIndex + ')" title="Срок">📅</button>' +
                '<button class="icon-btn danger" onclick="event.stopPropagation();deleteWorkWithConfirm(' + obj.id + ',' + originalIndex + ')" title="Удалить этап">🗑</button>' +
                '</span>' +
                '</div>' +
                '<div class="work-detail ' + (wOpen ? 'open' : '') + '">' +
                '<div style="margin:6px 0;"><b>📸 Фото:</b></div>' +
                '<div class="photo-grid">' + (phHtml || 'Нет фото') + '</div>' +
                '</div>' +
                '</div>';
        }
        setTimeout(initDragDrop, 50);

        var notesHtml = '';
        if (obj.notes) {
            notesHtml = '<div style="margin:6px 0;padding:8px 12px;background:#0d0d0d;border-radius:6px;border:1px solid #1a1a1a;font-size:13px;color:#888;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
                '<span style="word-break:break-word;">📝 ' + escapeHtml(obj.notes) + '</span>' +
                '<button class="btn btn-sm" onclick="editObjectNotes(' + obj.id + ')" style="padding:2px 8px;font-size:11px;flex-shrink:0;">✏️</button>' +
                '</div>';
        } else {
            notesHtml = '';
        }

        list += '<div class="card" id="obj-' + obj.id + '">' +
            '<div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')">' +
            '<div class="flex"><h3>' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '">▶</span></h3>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
            '<span class="badge" style="font-size:11px;background:#1a1a1a;color:#888;padding:2px 8px;border-radius:4px;">ID: ' + obj.id + '</span>' +
            '<span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#555;">' +
            '<span onclick="setObjectStartDate(' + obj.id + ')" style="cursor:pointer;color:' + (obj.startDate ? '#e0e0e0' : '#555') + ';transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'' + (obj.startDate ? '#e0e0e0' : '#555') + '\'">' + (obj.startDate ? fmt(obj.startDate) : '📅') + '</span>' +
            '<span style="color:#444;">→</span>' +
            '<span onclick="setObjectEndDate(' + obj.id + ')" style="cursor:pointer;color:' + (obj.plannedEndDate ? '#e0e0e0' : '#555') + ';transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'' + (obj.plannedEndDate ? '#e0e0e0' : '#555') + '\'">' + (obj.plannedEndDate ? fmt(obj.plannedEndDate) : '📅') + '</span>' +
            (obj.plannedEndDate ? '<span style="color:' + (getDaysRemaining(obj.plannedEndDate) < 0 ? '#a04040' : '#4caf50') + ';font-size:10px;">' + (getDaysRemaining(obj.plannedEndDate) < 0 ? '⚠️' : '✅') + '</span>' : '') +
            '</span>' +
            '<button class="btn btn-sm" onclick="event.stopPropagation();completeObject(' + obj.id + ')">' + (obj.completed ? 'Вернуть' : 'Сдать') + '</button>' +
            '<button class="btn btn-sm" onclick="event.stopPropagation();addWork(' + obj.id + ')">➕ Этап</button>' +
            '<button class="btn btn-sm" onclick="event.stopPropagation();addClientStatus(' + obj.id + ')">📢 Статус</button>' +
            '</div></div>' +
            '<div style="color:#999;font-size:14px;">📍 ' + escapeHtml(obj.address) + '</div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin:6px 0;padding:6px 0;border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;">' +
            '<div style="display:flex;align-items:center;gap:6px;">' +
            '<span style="color:#888;font-size:13px;">🎨 Дизайн (' + projs.length + ')</span>' +
            '<span onclick="toggleDesignBlockHeader(this,\'' + designKey + '\')" style="cursor:pointer;color:#555;font-size:12px;transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'#555\'">' + (designOpen ? '🔽' : '▶') + '</span>' +
            '<button class="btn btn-sm" onclick="addDesignProjectForObject(' + obj.id + ')" style="padding:2px 8px;font-size:11px;">➕</button>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:6px;border-left:1px solid #1a1a1a;padding-left:12px;">' +
            '<span style="color:#888;font-size:13px;">📋 Рекомендации (' + recs.length + ')</span>' +
            '<span onclick="toggleRecBlockHeader(this,\'' + recKey + '\')" style="cursor:pointer;color:#555;font-size:12px;transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'#555\'">' + (recOpen ? '🔽' : '▶') + '</span>' +
            '<button class="btn btn-sm" onclick="addRecommendationForObject(' + obj.id + ')" style="padding:2px 8px;font-size:11px;">➕</button>' +
            '</div>' +
            '</div>' +
            notesHtml +
            '</div>' +
            '<div class="object-detail ' + (objOpen ? 'open' : '') + '">' +
            '<div class="design-detail-container ' + (designOpen ? 'open' : '') + '" style="display:' + (designOpen ? 'block' : 'none') + ';padding:4px 8px;background:#0d0d0d;border-radius:4px;margin-bottom:4px;">' +
            designBlocks +
            '</div>' +
            '<div class="rec-detail-container ' + (recOpen ? 'open' : '') + '" style="display:' + (recOpen ? 'block' : 'none') + ';padding:4px 8px;background:#0d0d0d;border-radius:4px;margin-bottom:4px;">' +
            recBlocks +
            '</div>' +
            '<hr><h4>Этапы работ</h4>' +
            statusTabs +
            '<div id="work-list-' + obj.id + '" class="work-list">' + (worksHtml || '<span style="color:#666;font-size:14px;">Нет этапов</span>') + '</div>' +
            '</div>' +
            '</div>';
    }

    container.innerHTML = statusHtml + toolsHtml + filterTabs + sel + list;
}

// ============================================================
// ПАРОЛИ
// ============================================================
function renderPasswords() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    var html = '<div class="card"><h3>Пароли для ролей</h3><p style="color:#888;font-size:13px;">Если пароль пустой — вход без пароля.</p>';
    var roles = ['boss', 'wolf', 'client', 'master', 'designer', 'purchaser', 'electrician'];
    for (var i = 0; i < roles.length; i++) {
        var r = roles[i];
        html += '<div class="flex"><span>' + getUserLabel(r) + '</span><span><input type="text" id="pass-' + r + '" placeholder="Новый пароль" value="' + (passwords[r] || '') + '" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setRolePassword(\'' + r + '\')">Установить</button></span></div>';
    }
    html += '</div><div class="card"><h3>Пароли объектов</h3><p style="color:#888;font-size:13px;">Клиенты и мастера входят по паролю объекта.</p>';
    for (var i = 0; i < objects.length; i++) {
        var o = objects[i];
        html += '<div class="flex"><span>' + escapeHtml(o.name) + ' (код: ' + escapeHtml(o.code) + ')</span><span><input type="text" id="pass-obj-' + o.id + '" placeholder="Пароль для входа" value="' + (passwords.objects[o.id] || '') + '" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setObjectPassword(' + o.id + ')">Установить</button></span></div>';
    }
    html += '</div><div class="card"><button class="btn btn-sm" onclick="savePasswords()">Сохранить пароли</button></div>';
    container.innerHTML = html;
}

window.setRolePassword = function(r) {
    var val = document.getElementById('pass-' + r).value.trim();
    if (val) passwords[r] = val;
    else delete passwords[r];
    saveDataToLocal();
    if (isOnline()) {
        syncToSupabase();
        showToast('🔑 Пароль для ' + getUserLabel(r) + ' синхронизирован');
    } else {
        addPendingAction({ type: 'updatePassword', data: { role: r, password: passwords[r] } });
        showToast('🔑 Пароль сохранён локально (ожидает интернет)');
    }
    renderPasswords();
};

window.setObjectPassword = function(objId) {
    var val = document.getElementById('pass-obj-' + objId).value.trim();
    var obj = getObject(objId);
    if (!obj) return;
    if (val) {
        passwords.objects[objId] = val;
        showToast('🔑 Пароль для "' + obj.name + '" установлен на "' + val + '"');
    } else {
        var newPwd = Math.random().toString(36).substring(2, 8).toUpperCase();
        passwords.objects[objId] = newPwd;
        showToast('🔑 Пароль сброшен на: ' + newPwd);
        document.getElementById('pass-obj-' + objId).value = newPwd;
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.length > 0) {
                return fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    },
                    body: JSON.stringify({ password: passwords.objects[objId] })
                });
            } else {
                return fetch(SUPABASE_URL + '/rest/v1/passwords', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    },
                    body: JSON.stringify({ object_id: parseInt(objId), password: passwords.objects[objId] })
                });
            }
        })
        .then(function() { console.log('✅ Пароль синхронизирован'); })
        .catch(function(e) { console.log('⚠️ Ошибка синхронизации:', e); });
    } else {
        addPendingAction({ type: 'updatePassword', data: { objectId: objId, password: passwords.objects[objId] } });
    }
    renderPasswords();
};

window.savePasswords = function() {
    saveDataToLocal();
    if (isOnline()) {
        syncToSupabase();
        showToast('🔐 Пароли сохранены и синхронизированы');
    } else {
        showToast('🔐 Пароли сохранены локально (ожидают интернет)');
    }
};

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ — ТВОЙ КОД (ВСТАВЬ СЮДА ВСЁ ОСТАЛЬНОЕ)
// ============================================================

// ============================================================
// ЗАПУСК
// ============================================================
function render() {
    if (!currentUser) { renderLogin(); return; }
    if (['designer', 'master', 'purchaser'].includes(currentUser)) { renderFakeCabinet(currentUser); return; }
    if (currentUser === 'boss') { renderBoss(); return; }
    if (currentUser === 'wolf') { renderWolf(); return; }
    if (currentUser === 'client') { renderClient(); return; }
    if (currentUser === 'electrician') { renderElectrician(); return; }
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>' + getUserLabel(currentUser) + '</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div></div>';
}

loadPendingActions();
loadDataFromLocal();
render();
setTimeout(function() { loadAllFromSupabase(); }, 500);
setInterval(function() {
    if (isOnline() && pendingActions.length > 0) {
        syncToSupabase();
        if (pendingActions.length === 0) {
            var dot = document.getElementById('syncDot');
            var text = document.getElementById('syncText');
            if (dot) dot.style.background = '#4caf50';
            if (text) text.textContent = 'Синхронизация OK';
        }
    }
}, 30000);
window.addEventListener('online', function() {
    showToast('🌐 Интернет восстановлен');
    loadAllFromSupabase();
});
window.addEventListener('offline', function() {
    showToast('⚠️ Интернет отключён, изменения будут сохранены локально');
});

console.log('✅ СТРОЙУЧЁТ ЗАПУЩЕН');
console.log('🔑 Пароль по умолчанию: 30986');
