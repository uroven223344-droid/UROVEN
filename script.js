// ============================================================
// СТРОЙУЧЁТ — ФИНАЛЬНАЯ ВЕРСИЯ (BAR CHART + КРАСИВОЕ ОФОРМЛЕНИЕ)
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
function getObject(id) { for (var i = 0; i < objects.length; i++) { if (objects[i].id === id) return objects[i]; } return null; }
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
// СИНХРОНИЗАЦИЯ С SUPABASE
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
      <div class="tab" data-tab="schedule">📊 График</div>
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

    // ============================================================
    // ИНДИКАТОР СИНХРОНИЗАЦИИ — ПРАВЫЙ ВЕРХНИЙ УГОЛ
    // ============================================================
    var statusHtml = '<div style="position:fixed;top:10px;right:10px;z-index:9999;display:flex;align-items:center;gap:6px;padding:4px 10px;background:#0d0d0d;border-radius:12px;border:1px solid #1a1a1a;font-size:12px;color:#888;">' +
        '<span id="syncDot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + (pendingActions.length === 0 ? '#4caf50' : '#c9a959') + ';"></span>' +
        '<span id="syncText">' + (pendingActions.length === 0 ? 'Синхронизация OK' : pendingActions.length + ' действий ожидают') + '</span>' +
        '</div>';

    // ============================================================
    // КНОПКИ ЭКСПОРТ/ИМПОРТ/СИНХРОНИЗАЦИЯ — ПРАВЫЙ ВЕРХНИЙ УГОЛ
    // ============================================================
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
// РЕНДЕР ВОЛКА
// ============================================================
function renderWolf() {
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🐺 Волк (инженер)</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки</div>
      <div class="tab" data-tab="checks">Чеки</div>
      <div class="tab" data-tab="schedule">📊 График</div>
    </div>
    <div id="wolfContent"></div>`;
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            this.classList.add('active');
            var tab = this.dataset.tab;
            if (tab === 'objects') renderWolfObjects();
            else if (tab === 'notes') renderWolfNotes();
            else if (tab === 'purchases') renderWolfPurchases();
            else if (tab === 'checks') renderWolfChecks();
            else if (tab === 'schedule') renderSchedule();
        };
    }
    renderWolfObjects();
}

function renderWolfObjects() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    var active = [];
    for (var i = 0; i < objects.length; i++) {
        if (!objects[i].archived) active.push(objects[i]);
    }
    var sel = '<div class="flex" style="margin-bottom:16px;"><select class="object-selector" id="wolfObjectSelector" onchange="wolfScrollToObject(this.value)"><option value="">— Перейти к объекту —</option>';
    for (var i = 0; i < active.length; i++) {
        sel += '<option value="wolf-obj-' + active[i].id + '">' + escapeHtml(active[i].name) + ' (' + escapeHtml(active[i].code) + ')</option>';
    }
    sel += '</select></div>';

    var list = '';
    for (var i = 0; i < active.length; i++) {
        var obj = active[i];
        var objKey = 'wolf-obj-' + obj.id;
        var objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        
        var projs = [];
        for (var p = 0; p < designProjects.length; p++) {
            if (designProjects[p].objectId === obj.id) projs.push(designProjects[p]);
        }
        var designKey = 'wolf-design-' + obj.id;
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
                    
                    files += '<span style="display:inline-flex;align-items:center;gap:4px;background:#1a1a1a;padding:4px 8px;border-radius:4px;margin:2px;">' + 
                        (isImg ? '<img src="' + file + '" onclick="showModal(\'' + file + '\')" style="max-width:60px;max-height:60px;border-radius:4px;cursor:pointer;">' : 
                        '<span onclick="window.open(\'' + file + '\',\'_blank\')" style="cursor:pointer;font-size:18px;color:#c9a959;">' + icon + '</span>') + 
                        '</span>';
                }
            }
            if (!files) files = 'нет';
            designBlocks += '<div style="padding:6px 8px;margin:4px 0;background:#121212;border-radius:4px;border-left:2px solid ' + (pr.approvedByClient ? '#4caf50' : '#666') + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;color:#e0e0e0;cursor:pointer;" onclick="toggleDesignBlock(this,\'' + designKey + '\')">' + escapeHtml(pr.title) + ' <span style="color:#888;font-size:11px;margin-left:6px;">' + (pr.approvedByClient ? '✅' : '⏳') + '</span></span>' +
                '</div>' +
                '<div class="design-detail ' + (designOpen ? 'open' : '') + '" style="display:' + (designOpen ? 'block' : 'none') + ';font-size:12px;color:#888;margin-top:4px;padding:4px 0;">' +
                '<div><b>Файлы:</b> ' + files + '</div>' +
                '<div><b>Комментарии:</b> ' + (comments || 'нет') + '</div>' +
                '</div></div>';
        }
        
        var recs = [];
        for (var r = 0; r < recommendations.length; r++) {
            if (recommendations[r].objectId === obj.id) recs.push(recommendations[r]);
        }
        var recKey = 'wolf-rec-' + obj.id;
        var recOpen = uiState[recKey] !== undefined ? uiState[recKey] : false;
        var recBlocks = '';
        for (var r = 0; r < recs.length; r++) {
            var rec = recs[r];
            var phRec = '';
            if (rec.photos) {
                for (var ph = 0; ph < rec.photos.length; ph++) {
                    phRec += '<img src="' + rec.photos[ph] + '" style="width:60px;" onclick="showModal(\'' + rec.photos[ph] + '\')">';
                }
            }
            var phPur = '';
            if (rec.purchasedPhotos) {
                for (var ph = 0; ph < rec.purchasedPhotos.length; ph++) {
                    phPur += '<img src="' + rec.purchasedPhotos[ph] + '" style="width:60px;" onclick="showModal(\'' + rec.purchasedPhotos[ph] + '\')">';
                }
            }
            recBlocks += '<div style="padding:6px 8px;margin:3px 0;background:#121212;border-radius:4px;border-left:2px solid ' + (rec.purchased ? '#4caf50' : '#666') + ';">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:13px;color:#e0e0e0;cursor:pointer;" onclick="toggleRecBlock(this,\'' + recKey + '\')">📋 ' + escapeHtml(rec.text) + ' <span style="color:#888;font-size:11px;margin-left:6px;">' + (rec.purchased ? '✅' : '⏳') + '</span>' + (rec.deadline ? ' <span style="color:#666;font-size:10px;margin-left:6px;">до ' + fmt(rec.deadline) + '</span>' : '') + '</span>' +
                '</div>' +
                '<div class="rec-detail ' + (recOpen ? 'open' : '') + '" style="display:' + (recOpen ? 'block' : 'none') + ';font-size:12px;color:#888;margin-top:4px;padding:4px 0;">' +
                '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;">' +
                '<button class="btn btn-sm" onclick="markPurchased(' + rec.id + ')" style="padding:2px 8px;font-size:11px;" title="' + (rec.purchased ? 'Отменить покупку' : 'Отметить куплено') + '">' + (rec.purchased ? '↩' : '✅') + '</button>' +
                '</div>' +
                '<div style="margin-top:4px;">' + phRec + phPur + '</div>' +
                '</div></div>';
        }

        var statusTabs = '<div class="flex" style="margin:8px 0;flex-wrap:wrap;gap:4px;">' +
            '<button class="btn btn-sm btn-primary" onclick="setWolfWorkFilter(\'' + obj.id + '\',\'all\')">Все</button>' +
            '<button class="btn btn-sm" onclick="setWolfWorkFilter(\'' + obj.id + '\',\'done\')">✅ Выполненные</button>' +
            '<button class="btn btn-sm" onclick="setWolfWorkFilter(\'' + obj.id + '\',\'undone\')">⏳ Не выполненные</button>' +
            '</div>';
        if (!uiState['wolf-filter-' + obj.id]) uiState['wolf-filter-' + obj.id] = 'all';
        var currentFilter = uiState['wolf-filter-' + obj.id] || 'all';
        var filteredWorks = obj.works;
        if (currentFilter === 'done') filteredWorks = obj.works.filter(function(w) { return w.done === true; });
        else if (currentFilter === 'undone') filteredWorks = obj.works.filter(function(w) { return w.done === false; });

        var worksHtml = '';
        for (var w = 0; w < filteredWorks.length; w++) {
            var work = filteredWorks[w];
            var originalIndex = obj.works.indexOf(work);
            var wKey = 'wolf-work-' + obj.id + '-' + w;
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
                '<span class="work-status-check" onclick="event.stopPropagation();wolfToggleWorkStatus(' + obj.id + ',' + originalIndex + ')" style="cursor:pointer;font-size:18px;color:' + (work.done ? '#4caf50' : '#666') + ';transition:color 0.2s;">' + (work.done ? '☑' : '☐') + '</span>' +
                '<span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(' + obj.id + ',' + originalIndex + ')" title="Назначить электрику" style="cursor:pointer;font-size:16px;color:' + electricianColor + ';transition:color 0.2s;display:inline-flex;align-items:center;gap:2px;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'' + electricianColor + '\'">' + electricianDisplay + (work.forElectrician ? '<span style="display:inline-block;width:8px;height:8px;background:#c9a959;border-radius:50%;box-shadow:0 0 8px #c9a959;"></span>' : '') + '</span>' +
                daysHtml +
                (photos.length > 0 ? '<span class="photo-indicator" title="Есть фото" style="display:inline-block;width:8px;height:8px;background:#4caf50;border-radius:50%;margin-left:4px;box-shadow:0 0 8px rgba(76,175,80,0.5);"></span>' : '<span class="photo-indicator" title="Нет фото" style="display:inline-block;width:8px;height:8px;background:#333;border-radius:50%;margin-left:4px;"></span>') +
                '<span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span>' +
                '</span>' +
                '<span style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;">' +
                '<button class="icon-btn" onclick="event.stopPropagation();wolfUploadWorkPhoto(' + obj.id + ',' + originalIndex + ')" title="Загрузить фото">📸</button>' +
                '</span>' +
                '</div>' +
                '<div class="work-detail ' + (wOpen ? 'open' : '') + '">' +
                '<div style="margin:6px 0;"><b>📸 Фото:</b></div>' +
                '<div class="photo-grid">' + (phHtml || 'Нет фото') + '</div>' +
                '</div>' +
                '</div>';
        }
        var addWorkButton = '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="wolfAddWork(' + obj.id + ')">➕ Добавить этап</button></div>';

        var notesHtml = '';
        if (obj.notes) {
            notesHtml = '<div style="margin:6px 0;padding:8px 12px;background:#0d0d0d;border-radius:6px;border:1px solid #1a1a1a;font-size:13px;color:#888;display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">' +
                '<span style="word-break:break-word;">📝 ' + escapeHtml(obj.notes) + '</span>' +
                '<button class="btn btn-sm" onclick="editObjectNotes(' + obj.id + ')" style="padding:2px 8px;font-size:11px;flex-shrink:0;">✏️</button>' +
                '</div>';
        } else {
            notesHtml = '';
        }

        list += '<div class="card" id="wolf-obj-' + obj.id + '" style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border:1px solid #222;border-radius:16px;padding:16px;margin-bottom:16px;box-shadow:0 4px 30px rgba(0,0,0,0.3);">' +
            '<div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')" style="cursor:pointer;">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">' +
            '<div>' +
            '<h3 style="margin:0;color:#e8e8e8;font-size:18px;">' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;font-size:14px;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '" style="display:inline-block;margin-left:8px;font-size:14px;color:#666;transition:transform 0.3s;">▶</span></h3>' +
            '<div style="color:#999;font-size:14px;margin-top:2px;">📍 ' + escapeHtml(obj.address) + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
            '<span style="background:#1a1a1a;color:#888;padding:4px 12px;border-radius:20px;font-size:11px;border:1px solid #282828;">ID: ' + obj.id + '</span>' +
            '<span style="display:flex;align-items:center;gap:4px;font-size:12px;color:#555;background:#0d0d0d;padding:4px 10px;border-radius:20px;border:1px solid #1a1a1a;">' +
            '<span style="color:' + (obj.startDate ? '#e0e0e0' : '#555') + ';">' + (obj.startDate ? fmt(obj.startDate) : '📅') + '</span>' +
            '<span style="color:#444;">→</span>' +
            '<span style="color:' + (obj.plannedEndDate ? '#e0e0e0' : '#555') + ';">' + (obj.plannedEndDate ? fmt(obj.plannedEndDate) : '📅') + '</span>' +
            (obj.plannedEndDate ? '<span style="color:' + (getDaysRemaining(obj.plannedEndDate) < 0 ? '#a04040' : '#4caf50') + ';font-size:10px;">' + (getDaysRemaining(obj.plannedEndDate) < 0 ? '⚠️' : '✅') + '</span>' : '') +
            '</span>' +
            '</div>' +
            '</div>' +
            notesHtml +
            '</div>' +
            '<div class="object-detail ' + (objOpen ? 'open' : '') + '" style="display:' + (objOpen ? 'block' : 'none') + ';padding-top:12px;border-top:1px solid #1a1a1a;margin-top:8px;">' +
            '<div style="display:flex;flex-wrap:wrap;gap:12px;margin:6px 0;padding:8px 0;border-bottom:1px solid #1a1a1a;">' +
            '<div style="display:flex;align-items:center;gap:8px;background:#0d0d0d;padding:4px 12px;border-radius:20px;border:1px solid #1a1a1a;">' +
            '<span style="color:#888;font-size:13px;">🎨 Дизайн (' + projs.length + ')</span>' +
            '<span onclick="toggleDesignBlockHeader(this,\'' + designKey + '\')" style="cursor:pointer;color:#555;font-size:12px;transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'#555\'">' + (designOpen ? '🔽' : '▶') + '</span>' +
            '</div>' +
            '<div style="display:flex;align-items:center;gap:8px;background:#0d0d0d;padding:4px 12px;border-radius:20px;border:1px solid #1a1a1a;">' +
            '<span style="color:#888;font-size:13px;">📋 Рекомендации (' + recs.length + ')</span>' +
            '<span onclick="toggleRecBlockHeader(this,\'' + recKey + '\')" style="cursor:pointer;color:#555;font-size:12px;transition:color 0.2s;" onmouseover="this.style.color=\'#c9a959\'" onmouseout="this.style.color=\'#555\'">' + (recOpen ? '🔽' : '▶') + '</span>' +
            '<button class="btn btn-sm" onclick="wolfAddRecommendation(' + obj.id + ')" style="padding:2px 10px;font-size:11px;background:#c9a959;color:#0d0d0d;border:none;border-radius:12px;cursor:pointer;">➕</button>' +
            '</div>' +
            '</div>' +
            '<div class="design-detail-container ' + (designOpen ? 'open' : '') + '" style="display:' + (designOpen ? 'block' : 'none') + ';padding:8px;background:#0d0d0d;border-radius:8px;margin-bottom:8px;border:1px solid #1a1a1a;">' +
            designBlocks +
            '</div>' +
            '<div class="rec-detail-container ' + (recOpen ? 'open' : '') + '" style="display:' + (recOpen ? 'block' : 'none') + ';padding:8px;background:#0d0d0d;border-radius:8px;margin-bottom:8px;border:1px solid #1a1a1a;">' +
            recBlocks +
            '</div>' +
            '<hr style="border-color:#1a1a1a;margin:12px 0;">' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">' +
            '<span style="font-size:18px;background:linear-gradient(135deg, #c9a959, #a8893a);border-radius:6px;padding:4px 8px;color:#0d0d0d;">📋</span>' +
            '<span style="font-size:15px;font-weight:500;color:#e8e8e8;">Этапы работ</span>' +
            '<span style="margin-left:auto;font-size:12px;color:#666;background:#1a1a1a;padding:2px 12px;border-radius:12px;">' + obj.works.length + ' этапов</span>' +
            '</div>' +
            statusTabs +
            '<div id="wolf-work-list-' + obj.id + '" class="work-list" style="margin-top:8px;">' + (worksHtml || '<div style="text-align:center;padding:20px;color:#666;font-size:14px;">Нет этапов</div>') + '</div>' +
            addWorkButton +
            '</div>' +
            '</div>';
    }
    container.innerHTML = sel + list;
    setTimeout(initDragDrop, 50);
}

// ============================================================
// КЛИЕНТ
// ============================================================
function renderClient() {
    var obj = getObject(currentObjectId);
    if (!obj) { document.getElementById('app').innerHTML = '<div class="card">Объект не найден</div>'; return; }
    document.getElementById('app').innerHTML = `
    <div class="card"><div class="flex"><h2>🏠 ${escapeHtml(obj.name)}</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div>📍 ${escapeHtml(obj.address)}</div></div>
    <div class="tab-bar">
      <div class="tab active" data-tab="recommend">Рекомендации</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="works">Этапы</div>
      <div class="tab" data-tab="checks">Чеки</div>
    </div>
    <div id="clientContent"></div>`;
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            this.classList.add('active');
            var tab = this.dataset.tab;
            if (tab === 'recommend') renderClientRecommend();
            else if (tab === 'design') renderClientDesign();
            else if (tab === 'works') renderClientWorks();
            else if (tab === 'checks') renderClientChecks();
        };
    }
    renderClientRecommend();
}

function renderClientRecommend() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var obj = getObject(currentObjectId);
    if (!obj) return;
    var recs = [];
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].objectId === obj.id) recs.push(recommendations[i]);
    }
    recs.sort(function(a, b) {
        if (a.purchased && !b.purchased) return 1;
        if (!a.purchased && b.purchased) return -1;
        return 0;
    });
    if (recs.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:12px;">📋</div><div style="color:#666;font-size:16px;">Нет рекомендаций</div><div style="color:#444;font-size:13px;margin-top:4px;">Рекомендации появятся здесь</div></div>';
        return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:12px;">';
    for (var i = 0; i < recs.length; i++) {
        var r = recs[i];
        var statusColor = r.purchased ? '#4caf50' : '#c9a959';
        var statusText = r.purchased ? '✅ Куплено' : '❌ Не куплено';
        var borderColor = r.purchased ? '#4caf50' : '#c9a959';
        var phRec = '';
        if (r.photos) {
            for (var j = 0; j < r.photos.length; j++) {
                phRec += '<img src="' + r.photos[j] + '" onclick="showModal(\'' + r.photos[j] + '\')" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #282828;cursor:pointer;">';
            }
        }
        var phPur = '';
        if (r.purchasedPhotos) {
            for (var j = 0; j < r.purchasedPhotos.length; j++) {
                phPur += '<img src="' + r.purchasedPhotos[j] + '" onclick="showModal(\'' + r.purchasedPhotos[j] + '\')" style="width:60px;height:60px;object-fit:cover;border-radius:8px;border:1px solid #282828;cursor:pointer;">';
            }
        }
        html += '<div style="background:#161616;border:1px solid ' + borderColor + ';border-radius:12px;padding:16px;transition:all 0.2s;">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">' +
            '<div style="font-size:16px;font-weight:500;color:#e8e8e8;">📋 ' + escapeHtml(r.text) + '</div>' +
            '<span style="background:' + statusColor + ';color:#0d0d0d;padding:4px 12px;border-radius:20px;font-size:13px;font-weight:500;">' + statusText + '</span>' +
            '</div>' +
            (r.deadline ? '<div style="color:#888;font-size:13px;margin-top:4px;">📅 Срок: <span style="color:#e0e0e0;">' + fmt(r.deadline) + '</span></div>' : '') +
            '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-sm" onclick="clientMarkPurchased(' + r.id + ')" style="background:' + (r.purchased ? '#282828' : '#c9a959') + ';color:' + (r.purchased ? '#e0e0e0' : '#0d0d0d') + ';border-color:' + (r.purchased ? '#3a3a3a' : '#c9a959') + ';">' + (r.purchased ? '↩ Отменить' : '✅ Отметить куплено') + '</button>' +
            (!r.purchased ? '<button class="btn btn-sm" onclick="clientAddPurchasedPhoto(' + r.id + ')" style="background:#282828;color:#e0e0e0;border-color:#3a3a3a;">📸 Добавить фото покупки</button>' : '') +
            '</div>' +
            ((phRec || phPur) ? '<div style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;">' + phRec + phPur + '</div>' : '') +
            '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderClientDesign() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var obj = getObject(currentObjectId);
    if (!obj) return;
    var projs = [];
    for (var i = 0; i < designProjects.length; i++) {
        var p = designProjects[i];
        if (p.objectId === obj.id && (p.roles.includes('client') || p.roles.includes('all'))) {
            projs.push(p);
        }
    }
    if (projs.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:12px;">🎨</div><div style="color:#666;font-size:16px;">Нет доступных проектов</div><div style="color:#444;font-size:13px;margin-top:4px;">Дизайн-проекты появятся здесь</div></div>';
        return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (var i = 0; i < projs.length; i++) {
        var p = projs[i];
        var statusColor = p.approvedByClient ? '#4caf50' : '#c9a959';
        var statusText = p.approvedByClient ? '✅ Утверждён' : '⏳ На рассмотрении';
        var filesHtml = '';
        if (p.files && p.files.length > 0) {
            filesHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
            for (var j = 0; j < p.files.length; j++) {
                var f = p.files[j];
                var isImg = f.startsWith('data:image/') || f.startsWith('http');
                if (isImg) {
                    filesHtml += '<img src="' + f + '" onclick="showModal(\'' + f + '\')" style="width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #282828;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">';
                } else {
                    filesHtml += '<a href="' + f + '" target="_blank" style="display:inline-flex;align-items:center;gap:6px;background:#1a1a1a;padding:6px 12px;border-radius:6px;color:#c9a959;text-decoration:none;font-size:13px;">📄 Файл</a>';
                }
            }
            filesHtml += '</div>';
        } else {
            filesHtml = '<div style="color:#555;font-size:13px;margin-top:4px;">Файлы не загружены</div>';
        }
        var commentsHtml = '';
        if (p.comments && p.comments.length > 0) {
            commentsHtml = '<div style="margin-top:8px;padding:8px 12px;background:#0d0d0d;border-radius:6px;">';
            for (var j = 0; j < p.comments.length; j++) {
                var c = p.comments[j];
                commentsHtml += '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid #1a1a1a;">' +
                    '<span style="color:#c9a959;font-size:12px;font-weight:500;">' + escapeHtml(c.author) + '</span>' +
                    '<span style="color:#888;font-size:13px;">' + escapeHtml(c.text) + '</span>' +
                    '<span style="color:#444;font-size:11px;margin-left:auto;">' + fmt(c.date) + '</span>' +
                    '</div>';
            }
            commentsHtml += '</div>';
        }
        html += '<div style="background:#161616;border:1px solid #2a2a2a;border-radius:12px;padding:16px;transition:all 0.2s;border-left:3px solid ' + statusColor + ';">' +
            '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">' +
            '<div style="font-size:17px;font-weight:500;color:#e8e8e8;">🎨 ' + escapeHtml(p.title) + '</div>' +
            '<span style="background:' + statusColor + ';color:#0d0d0d;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:500;">' + statusText + '</span>' +
            '</div>' +
            '<div style="margin-top:8px;">' + filesHtml + '</div>' +
            commentsHtml +
            '<div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;">' +
            '<button class="btn btn-sm" onclick="clientAddDesignComment(' + p.id + ')" style="background:#282828;color:#e0e0e0;border-color:#3a3a3a;">💬 Комментарий</button>' +
            '<button class="btn btn-sm" onclick="clientApproveDesign(' + p.id + ')" style="background:' + (p.approvedByClient ? '#282828' : '#c9a959') + ';color:' + (p.approvedByClient ? '#e0e0e0' : '#0d0d0d') + ';border-color:' + (p.approvedByClient ? '#3a3a3a' : '#c9a959') + ';">' + (p.approvedByClient ? '↩ Отменить утверждение' : '✅ Утвердить') + '</button>' +
            '</div>' +
            '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderClientWorks() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var obj = getObject(currentObjectId);
    if (!obj) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:40px;">Объект не найден</div>';
        return;
    }
    
    var html = '';
    
    if (obj.clientStatus) {
        html += '<div style="background:linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);border-left:4px solid #c9a959;padding:16px 20px;margin-bottom:20px;border-radius:12px;box-shadow:0 4px 20px rgba(201,169,89,0.05);">' +
            '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span style="font-size:24px;">📌</span>' +
            '<span style="color:#e8e8e8;font-size:15px;font-weight:400;letter-spacing:0.3px;">' + escapeHtml(obj.clientStatus) + '</span>' +
            '</div>' +
            '</div>';
    }
    
    var upcomingWorks = obj.works.filter(function(w) { return !w.done && w.deadline; }).sort(function(a, b) {
        var pa = a.deadline.split('.'), pb = b.deadline.split('.');
        return new Date(+pa[2], +pa[1] - 1, +pa[0]) - new Date(+pb[2], +pb[1] - 1, +pb[0]);
    }).slice(0, 5);
    
    html += '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:16px;padding:20px;margin-bottom:20px;border:1px solid #222;box-shadow:0 4px 30px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
        '<span style="font-size:22px;background:linear-gradient(135deg, #c9a959, #a8893a);border-radius:8px;padding:6px 10px;color:#0d0d0d;">📌</span>' +
        '<span style="font-size:17px;font-weight:500;color:#e8e8e8;letter-spacing:0.5px;">Ближайшие работы</span>' +
        '<span style="margin-left:auto;font-size:12px;color:#666;background:#1a1a1a;padding:4px 12px;border-radius:20px;">' + upcomingWorks.length + ' задач</span>' +
        '</div>';
    
    if (upcomingWorks.length === 0) {
        html += '<div style="text-align:center;padding:20px 0;color:#555;font-size:14px;">' +
            '<span style="font-size:32px;display:block;margin-bottom:8px;">✅</span>' +
            'Все работы выполнены' +
            '</div>';
    } else {
        for (var i = 0; i < upcomingWorks.length; i++) {
            var w = upcomingWorks[i];
            var isFirst = (i === 0);
            var daysLeft = getDaysRemaining(w.deadline);
            var statusColor = daysLeft < 0 ? '#a04040' : '#c9a959';
            
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;margin-bottom:6px;background:' + (isFirst ? 'linear-gradient(90deg, rgba(201,169,89,0.1) 0%, transparent 100%)' : 'transparent') + ';border-radius:8px;border-left:2px solid ' + (isFirst ? '#c9a959' : '#1a1a1a') + ';transition:all 0.2s;" onmouseover="this.style.background=\'rgba(255,255,255,0.02)\'" onmouseout="this.style.background=\'' + (isFirst ? 'linear-gradient(90deg, rgba(201,169,89,0.1) 0%, transparent 100%)' : 'transparent') + '\'">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                (isFirst ? '<span style="font-size:14px;color:#c9a959;">▶</span>' : '<span style="font-size:12px;color:#444;">•</span>') +
                '<span style="color:' + (isFirst ? '#e8e8e8' : '#aaa') + ';font-size:14px;font-weight:' + (isFirst ? '500' : '400') + ';">' + escapeHtml(w.name) + '</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="color:' + statusColor + ';font-size:12px;background:rgba(0,0,0,0.3);padding:2px 10px;border-radius:12px;">' + 
                    (daysLeft < 0 ? '⚠️ ' + Math.abs(daysLeft) + ' дн.' : '⏳ ' + daysLeft + ' дн.') + 
                '</span>' +
                '<span style="color:#888;font-size:13px;background:#1a1a1a;padding:2px 12px;border-radius:12px;">' + fmt(w.deadline) + '</span>' +
                '</div>' +
                '</div>';
        }
    }
    html += '</div>';
    
    html += '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:16px;padding:20px;border:1px solid #222;box-shadow:0 4px 30px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
        '<span style="font-size:22px;background:linear-gradient(135deg, #c9a959, #a8893a);border-radius:8px;padding:6px 10px;color:#0d0d0d;">📋</span>' +
        '<span style="font-size:17px;font-weight:500;color:#e8e8e8;letter-spacing:0.5px;">Все этапы работ</span>' +
        '<span style="margin-left:auto;font-size:12px;color:#666;background:#1a1a1a;padding:4px 12px;border-radius:20px;">' + obj.works.length + ' этапов</span>' +
        '</div>';
    
    if (obj.works.length === 0) {
        html += '<div style="text-align:center;padding:20px 0;color:#555;font-size:14px;">Нет этапов</div>';
    } else {
        var sortedWorks = obj.works.slice().sort(function(a, b) {
            if (!a.done && b.done) return -1;
            if (a.done && !b.done) return 1;
            return 0;
        });
        
        for (var i = 0; i < sortedWorks.length; i++) {
            var w = sortedWorks[i];
            var photos = [];
            for (var p = 0; p < reports.length; p++) {
                if (reports[p].objectId === obj.id && reports[p].workId === w.id) {
                    photos.push(reports[p]);
                }
            }
            
            var statusColor = w.done ? '#4caf50' : '#c9a959';
            var statusText = w.done ? 'Выполнено' : 'В работе';
            var statusIcon = w.done ? '✅' : '⏳';
            var borderColor = w.done ? 'rgba(76,175,80,0.2)' : 'rgba(201,169,89,0.2)';
            
            var photoHtml = '';
            if (photos.length > 0) {
                photoHtml = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;">';
                for (var j = 0; j < photos.length; j++) {
                    var photoUrl = photos[j].photos[0];
                    photoHtml += '<div style="position:relative;border-radius:8px;overflow:hidden;border:1px solid #222;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
                        '<img src="' + photoUrl + '" onclick="showModal(\'' + photoUrl + '\')" style="width:56px;height:56px;object-fit:cover;cursor:pointer;">' +
                        '</div>';
                }
                photoHtml += '</div>';
            }
            
            html += '<div style="padding:12px 16px;margin-bottom:8px;background:#0d0d0d;border-radius:10px;border-left:3px solid ' + statusColor + ';transition:all 0.2s;" onmouseover="this.style.background=\'#141414\'" onmouseout="this.style.background=\'#0d0d0d\'">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
                '<div style="display:flex;align-items:center;gap:10px;">' +
                '<span style="font-size:18px;">' + statusIcon + '</span>' +
                '<span style="font-size:15px;color:#e8e8e8;font-weight:400;">' + escapeHtml(w.name) + '</span>' +
                '</div>' +
                '<div style="display:flex;align-items:center;gap:8px;">' +
                '<span style="background:' + statusColor + '20;color:' + statusColor + ';font-size:12px;padding:3px 14px;border-radius:20px;font-weight:500;border:1px solid ' + statusColor + '40;">' + statusText + '</span>' +
                (w.deadline ? '<span style="color:#666;font-size:12px;background:#1a1a1a;padding:2px 10px;border-radius:12px;">📅 ' + fmt(w.deadline) + '</span>' : '') +
                '</div>' +
                '</div>' +
                (photoHtml || '<div style="color:#444;font-size:12px;margin-top:4px;padding-left:32px;">📸 Нет фото</div>') +
                '</div>';
        }
    }
    html += '</div>';
    
    container.innerHTML = html;
}

function renderClientChecks() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var list = [];
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].objectId === currentObjectId && !checks[i].paid) {
            list.push(checks[i]);
        }
    }
    list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var totalUnpaid = 0;
    var totalPaid = 0;
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].objectId === currentObjectId) {
            if (checks[i].paid) {
                totalPaid += (checks[i].amount || 0);
            } else {
                totalUnpaid += (checks[i].amount || 0);
            }
        }
    }
    if (list.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;"><div style="font-size:48px;margin-bottom:12px;">🧾</div><div style="color:#666;font-size:16px;">Нет чеков</div><div style="color:#444;font-size:13px;margin-top:4px;">Чеки появятся здесь</div></div>';
        return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:12px;">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px;">' +
        '<div style="background:#161616;border:1px solid #c9a959;border-radius:10px;padding:12px 16px;text-align:center;">' +
        '<div style="color:#888;font-size:12px;">Неоплаченные</div>' +
        '<div style="color:#c9a959;font-size:20px;font-weight:600;">' + totalUnpaid.toFixed(2) + ' ₽</div>' +
        '</div>' +
        '<div style="background:#161616;border:1px solid #4caf50;border-radius:10px;padding:12px 16px;text-align:center;">' +
        '<div style="color:#888;font-size:12px;">Оплаченные</div>' +
        '<div style="color:#4caf50;font-size:20px;font-weight:600;">' + totalPaid.toFixed(2) + ' ₽</div>' +
        '</div>' +
        '</div>';
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var statusColor = c.paid ? '#4caf50' : '#c9a959';
        var statusText = c.paid ? '✅ Оплачен' : '⏳ Не оплачен';
        var borderColor = c.paid ? '#4caf50' : '#c9a959';
        var dateStr = '';
        if (c.date) {
            var dt = new Date(c.date);
            if (!isNaN(dt.getTime())) {
                dateStr = dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
        }
        html += '<div style="background:#161616;border:1px solid ' + borderColor + ';border-radius:12px;padding:14px 16px;transition:all 0.2s;">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
            '<div style="display:flex;align-items:center;gap:10px;">' +
            '<span style="font-size:20px;">' + (c.paid ? '✅' : '🧾') + '</span>' +
            '<span style="font-size:17px;font-weight:600;color:#e8e8e8;">' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span>' +
            '</div>' +
            '<span style="background:' + statusColor + ';color:#0d0d0d;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:500;">' + statusText + '</span>' +
            '</div>' +
            '<div style="color:#888;font-size:13px;margin-top:4px;">📅 ' + dateStr + '</div>' +
            (c.fileData ? '<div style="margin-top:8px;"><img src="' + c.fileData + '" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid #282828;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform=\'scale(1.02)\'" onmouseout="this.style.transform=\'scale(1)\'"></div>' : '') +
            (!c.paid ? '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="clientMarkCheckPaid(' + c.id + ')">✅ Оплатить</button></div>' : '') +
            '</div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// ОСТАЛЬНЫЕ ФУНКЦИИ
// ============================================================
window.clientMarkCheckPaid = function(checkId) {
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].id === checkId) {
            var c = checks[i];
            if (c.paid) return;
            c.paid = true;
            c.paidDate = new Date();
            c.paidBy = 'client';
            saveDataToLocal();
            if (isOnline()) saveToSupabase('checks', c);
            renderClientChecks();
            showToast('✅ Чек оплачен');
            return;
        }
    }
};

window.clientMarkPurchased = function(id) {
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    r.purchased = !r.purchased;
    if (r.purchased) r.purchasedDate = new Date().toISOString().slice(0, 10);
    else r.purchasedDate = null;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', r);
    renderClient();
    showToast(r.purchased ? '✅ Отмечено куплено' : '↩ Отмена');
};

window.clientAddPurchasedPhoto = async function(id) {
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        var file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            var reader = new FileReader();
            var compressed = await new Promise(function(res) {
                reader.onload = function(ev) {
                    var img = new Image();
                    img.onload = function() {
                        var canvas = document.createElement('canvas');
                        var w = img.width, h = img.height;
                        var maxSize = 800;
                        if (w > maxSize || h > maxSize) {
                            if (w > h) { h = h * maxSize / w; w = maxSize; }
                            else { w = w * maxSize / h; h = maxSize; }
                        }
                        canvas.width = w;
                        canvas.height = h;
                        var ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, w, h);
                        res(canvas.toDataURL('image/webp', 0.7));
                    };
                    img.onerror = function() { res(ev.target.result); };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            });
            if (!r.purchasedPhotos) r.purchasedPhotos = [];
            r.purchasedPhotos.push(compressed);
            saveDataToLocal();
            renderClient();
            showToast('📸 Фото добавлено');
        } catch(err) { console.error('Error:', err); showToast('❌ Ошибка загрузки фото'); }
        inp.remove();
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.clientAddDesignComment = function(id) {
    var p = null;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === id) { p = designProjects[i]; break; }
    }
    if (!p) return;
    var t = prompt('Ваш комментарий:');
    if (t) {
        if (!p.comments) p.comments = [];
        p.comments.push({ author: 'Клиент', text: t, date: new Date() });
        saveDataToLocal();
        if (isOnline()) saveToSupabase('design_projects', p);
        renderClient();
        showToast('💬 Комментарий добавлен');
    }
};

window.clientApproveDesign = function(id) {
    var p = null;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === id) { p = designProjects[i]; break; }
    }
    if (!p) return;
    p.approvedByClient = !p.approvedByClient;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', p);
    renderClient();
    showToast(p.approvedByClient ? '✅ Проект утверждён' : '⏳ Утверждение снято');
};

window.addObject = function() {
    var n = prompt('Название объекта:');
    if (!n) return;
    var a = prompt('Адрес:');
    if (!a) return;
    var pwd = prompt('Пароль для входа:');
    if (pwd === null) return;
    pwd = pwd.trim();
    if (!pwd) { pwd = Math.random().toString(36).substring(2, 8).toUpperCase(); showToast('Пароль: ' + pwd); }
    var id = Date.now();
    var newObj = { id: id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: false, archived: false, startDate: null, plannedEndDate: null, schedule: [], notes: '', contractors: [] };
    objects.push(newObj);
    passwords.objects[id] = pwd;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'addObject', data: newObj });
    } else {
        saveToSupabase('objects', newObj);
    }
    renderBossObjects();
    showToast('✅ Объект создан');
};

window.addWork = function(id) {
    var n = prompt('Название этапа');
    if (!n) return;
    var o = getObject(id);
    if (!o) return;
    var newWork = { id: Date.now() + Math.random() * 1000, name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true, status: '', paid: false, contractor: null, contractorStatus: 'unassigned' };
    o.works.push(newWork);
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
    } else {
        saveToSupabase('objects', o);
    }
    renderBossObjects();
    showToast('➕ Этап добавлен');
};

window.toggleWorkStatus = function(id, wi) {
    var o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
    } else {
        saveToSupabase('objects', o);
    }
    renderBossObjects();
};

window.wolfToggleWorkStatus = function(id, wi) {
    console.log('🔄 wolfToggleWorkStatus вызван: объект ' + id + ', этап ' + wi);
    var o = getObject(id);
    if (!o) {
        console.log('❌ Объект не найден');
        showToast('❌ Ошибка: объект не найден');
        return;
    }
    if (!o.works[wi]) {
        console.log('❌ Этап не найден');
        showToast('❌ Ошибка: этап не найден');
        return;
    }
    o.works[wi].done = !o.works[wi].done;
    console.log('✅ Этап "' + o.works[wi].name + '" теперь ' + (o.works[wi].done ? 'выполнен' : 'не выполнен'));
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', o);
    renderWolfObjects();
};

window.setWorkDeadline = function(id, wi) {
    var d = prompt('Дата (ДД.ММ.ГГГГ)');
    if (d) {
        if (!isValidDate(d)) { showToast('Неверный формат даты'); return; }
        var o = getObject(id);
        if (o) {
            o.works[wi].deadline = d;
            saveDataToLocal();
            if (!isOnline()) {
                addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
            } else {
                saveToSupabase('objects', o);
            }
            if (currentUser === 'boss') renderBossObjects();
            else if (currentUser === 'wolf') renderWolfObjects();
            showToast('📅 Срок установлен');
        }
    }
};

window.deleteWorkWithConfirm = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj) return;
    var work = obj.works[idx];
    if (!work) return;
    if (!confirm('Удалить этап "' + work.name + '" ?')) return;
    obj.works.splice(idx, 1);
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'deleteWork', data: { objectId: objId, workId: work.id } });
    } else {
        saveToSupabase('objects', obj);
    }
    renderBossObjects();
    showToast('🗑 Этап удалён');
};

window.toggleElectrician = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj) return;
    obj.works[idx].forElectrician = !obj.works[idx].forElectrician;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateWork', data: { objectId: objId, work: obj.works[idx] } });
    } else {
        saveToSupabase('objects', obj);
    }
    renderBossObjects();
};

window.setBossObjectFilter = function(filter) {
    uiState['bossObjectFilter'] = filter;
    saveUiState();
    renderBossObjects();
};

window.setWolfWorkFilter = function(objId, filter) {
    uiState['wolf-filter-' + objId] = filter;
    saveUiState();
    renderWolfObjects();
};

window.setWorkFilter = function(objId, filter) {
    uiState['filter-' + objId] = filter;
    saveUiState();
    renderBossObjects();
};

window.completeObject = function(id) {
    var o = getObject(id);
    if (!o) return;
    o.completed = !o.completed;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: o });
    } else {
        saveToSupabase('objects', o);
    }
    renderBossObjects();
    showToast(o.completed ? '✅ Объект сдан' : '↩ Объект возвращён в работу');
};

window.setObjectStartDate = function(objId) {
    var obj = getObject(objId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    var date = prompt('Введите дату начала (ДД.ММ.ГГГГ):');
    if (date === null) return;
    if (!isValidDate(date)) {
        showToast('❌ Неверный формат даты. Используйте ДД.ММ.ГГГГ');
        return;
    }
    obj.startDate = date;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('📅 Дата начала установлена: ' + date);
};

window.setObjectEndDate = function(objId) {
    var obj = getObject(objId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    var date = prompt('Введите дату завершения (ДД.ММ.ГГГГ):');
    if (date === null) return;
    if (!isValidDate(date)) {
        showToast('❌ Неверный формат даты. Используйте ДД.ММ.ГГГГ');
        return;
    }
    obj.plannedEndDate = date;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('📅 Дата завершения установлена: ' + date);
};

window.uploadWorkPhoto = function(id, wi) {
    var o = getObject(id);
    if (!o) return;
    var work = o.works[wi];
    if (!work) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        var files = e.target.files;
        if (!files.length) { inp.remove(); return; }
        showToast('⏳ Обработка фото...');
        var uploadedCount = 0;
        var processFile = function(index) {
            if (index >= files.length) {
                if (uploadedCount > 0) {
                    saveDataToLocal();
                    renderBossObjects();
                    showToast('📸 Загружено ' + uploadedCount + ' фото');
                } else {
                    showToast('❌ Не удалось загрузить фото');
                }
                inp.remove();
                return;
            }
            var f = files[index];
            var reader = new FileReader();
            reader.onload = function(ev) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var w = img.width, h = img.height;
                    var maxSize = 800;
                    if (w > maxSize || h > maxSize) {
                        if (w > h) { h = h * maxSize / w; w = maxSize; }
                        else { w = w * maxSize / h; h = maxSize; }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    var compressed = canvas.toDataURL('image/webp', 0.7);
                    var report = { id: Date.now() + Math.random() * 1000, objectId: id, workId: work.id, photos: [compressed], text: '', date: new Date(), approved: true };
                    reports.push(report);
                    uploadedCount++;
                    processFile(index + 1);
                };
                img.onerror = function() { processFile(index + 1); };
                img.src = ev.target.result;
            };
            reader.onerror = function() { processFile(index + 1); };
            reader.readAsDataURL(f);
        };
        processFile(0);
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.wolfUploadWorkPhoto = function(id, wi) {
    var o = getObject(id);
    if (!o) return;
    var work = o.works[wi];
    if (!work) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        var files = e.target.files;
        if (!files.length) { inp.remove(); return; }
        showToast('⏳ Обработка фото...');
        var uploadedCount = 0;
        var processFile = function(index) {
            if (index >= files.length) {
                if (uploadedCount > 0) {
                    saveDataToLocal();
                    renderWolfObjects();
                    showToast('📸 Загружено ' + uploadedCount + ' фото');
                } else {
                    showToast('❌ Не удалось загрузить фото');
                }
                inp.remove();
                return;
            }
            var f = files[index];
            var reader = new FileReader();
            reader.onload = function(ev) {
                var img = new Image();
                img.onload = function() {
                    var canvas = document.createElement('canvas');
                    var w = img.width, h = img.height;
                    var maxSize = 800;
                    if (w > maxSize || h > maxSize) {
                        if (w > h) { h = h * maxSize / w; w = maxSize; }
                        else { w = w * maxSize / h; h = maxSize; }
                    }
                    canvas.width = w;
                    canvas.height = h;
                    var ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    var compressed = canvas.toDataURL('image/webp', 0.7);
                    var report = { id: Date.now() + Math.random() * 1000, objectId: id, workId: work.id, photos: [compressed], text: '', date: new Date(), approved: true };
                    reports.push(report);
                    uploadedCount++;
                    processFile(index + 1);
                };
                img.onerror = function() { processFile(index + 1); };
                img.src = ev.target.result;
            };
            reader.onerror = function() { processFile(index + 1); };
            reader.readAsDataURL(f);
        };
        processFile(0);
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.deleteWorkPhoto = function(id) {
    if (!confirm('Удалить фото?')) return;
    for (var i = 0; i < reports.length; i++) {
        if (reports[i].id === id) {
            reports.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    renderBossObjects();
    showToast('🗑 Фото удалено');
};

window.toggleWorkPaid = function(objId, wi) {
    console.log('🔄 toggleWorkPaid вызван: объект ' + objId + ', этап ' + wi);
    var obj = getObject(objId);
    if (!obj) {
        console.log('❌ Объект не найден');
        showToast('❌ Ошибка: объект не найден');
        return;
    }
    var work = obj.works[wi];
    if (!work) {
        console.log('❌ Этап не найден');
        showToast('❌ Ошибка: этап не найден');
        return;
    }
    work.paid = !work.paid;
    console.log('✅ Оплата этапа "' + work.name + '" теперь ' + (work.paid ? 'оплачен' : 'не оплачен'));
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderBossObjects();
    showToast(work.paid ? '✅ Оплачено' : '↩ Оплата снята');
};

window.assignContractor = function(objId, workIdx) {
    var obj = getObject(objId);
    if (!obj) return;
    var work = obj.works[workIdx];
    if (!work) return;
    if (!obj.contractors) obj.contractors = [];
    var list = '';
    for (var i = 0; i < obj.contractors.length; i++) {
        list += (i+1) + '. ' + obj.contractors[i].name + (obj.contractors[i].phone ? ' 📞' + obj.contractors[i].phone : '') + '\n';
    }
    var statusText = '';
    if (work.contractorStatus === 'assigned' && work.contractor) {
        statusText = '👤 Текущий: ' + work.contractor.name;
    } else if (work.contractorStatus === 'search') {
        statusText = '⏳ В поиске...';
    } else {
        statusText = '❌ Не назначен';
    }
    var msg = '👤 Назначить исполнителя\n─────────────────────\n' + statusText + '\n─────────────────────\n' + (list ? list + '─────────────────────\n' : '') + '0. ➕ Добавить нового\ns. 🔍 В поиске (пока не нашли)\nc. 🗑 Снять назначение';
    var choice = prompt(msg);
    if (choice === null) return;
    var lower = choice.toLowerCase().trim();
    if (lower === 'c') {
        work.contractor = null;
        work.contractorStatus = 'unassigned';
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('🗑 Назначение снято');
        return;
    }
    if (lower === 's') {
        work.contractor = null;
        work.contractorStatus = 'search';
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('🔍 Исполнитель в поиске');
        return;
    }
    var idx = parseInt(choice);
    if (isNaN(idx)) { showToast('❌ Введите номер'); return; }
    if (idx === 0) {
        var name = prompt('Имя исполнителя:');
        if (!name) return;
        var phone = prompt('Телефон (необязательно):');
        var contractor = { id: Date.now() + Math.random() * 1000, name: name.trim(), phone: phone || '' };
        obj.contractors.push(contractor);
        work.contractor = contractor;
        work.contractorStatus = 'assigned';
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('✅ Исполнитель назначен: ' + name);
        return;
    }
    if (idx > 0 && idx <= obj.contractors.length) {
        var selected = obj.contractors[idx - 1];
        work.contractor = selected;
        work.contractorStatus = 'assigned';
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('✅ Исполнитель назначен: ' + selected.name);
        return;
    }
    showToast('❌ Неверный номер');
};

window.editObjectNotes = function(objId) {
    var obj = getObject(objId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    var notes = prompt('✏️ Заметки по объекту:', obj.notes || '');
    if (notes !== null) {
        obj.notes = notes.trim();
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('📝 Заметки сохранены');
    }
};

window.addClientStatus = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var status = prompt('Введите статус для клиента (будет отображаться над блоком "Ближайшие работы"):');
    if (status !== null && status.trim() !== '') {
        obj.clientStatus = status.trim();
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        renderBossObjects();
        showToast('✅ Статус для клиента обновлён');
    }
};

window.addRecommendationForObject = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var text = prompt('Текст рекомендации:');
    if (text === null || text.trim() === '') return;
    var deadline = prompt('Срок (ДД.ММ.ГГГГ) или оставьте пустым:');
    if (deadline !== null && deadline.trim() !== '' && !isValidDate(deadline.trim())) { showToast('Неверный формат даты'); return; }
    var rec = { id: Date.now() + Math.random() * 1000, objectId: objId, text: text.trim(), deadline: deadline ? deadline.trim() : null, photos: [], purchased: false, purchasedDate: null, purchasedPhotos: [] };
    recommendations.push(rec);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', rec);
    renderBossObjects();
    showToast('📋 Рекомендация добавлена');
};

window.wolfAddRecommendation = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var text = prompt('Текст рекомендации:');
    if (!text || text.trim() === '') return;
    var deadline = prompt('Срок (ДД.ММ.ГГГГ) или оставьте пустым:');
    if (deadline !== null && deadline.trim() !== '' && !isValidDate(deadline.trim())) { showToast('❌ Неверный формат даты'); return; }
    var rec = { id: Date.now() + Math.random() * 1000, objectId: objId, text: text.trim(), deadline: deadline ? deadline.trim() : null, photos: [], purchased: false, purchasedDate: null, purchasedPhotos: [] };
    recommendations.push(rec);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', rec);
    renderWolfObjects();
    showToast('📋 Рекомендация добавлена');
};

window.deleteRecommend = function(id) {
    if (!confirm('Удалить рекомендацию?')) return;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) {
            recommendations.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/recommendations?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('🗑 Рекомендация удалена');
};

window.markPurchased = function(id) {
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    r.purchased = !r.purchased;
    if (r.purchased) r.purchasedDate = new Date().toISOString().slice(0, 10);
    else r.purchasedDate = null;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', r);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast(r.purchased ? '✅ Отмечено куплено' : '↩ Отмена покупки');
};

window.addRecommendationPhoto = function(id) {
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var w = img.width, h = img.height;
                var maxSize = 800;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = h * maxSize / w; w = maxSize; }
                    else { w = w * maxSize / h; h = maxSize; }
                }
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                var compressed = canvas.toDataURL('image/webp', 0.7);
                if (!r.photos) r.photos = [];
                r.photos.push(compressed);
                saveDataToLocal();
                if (isOnline()) saveToSupabase('recommendations', r);
                if (currentUser === 'boss') renderBossObjects();
                else if (currentUser === 'wolf') renderWolfObjects();
                showToast('📸 Фото добавлено');
            };
            img.onerror = function() { showToast('❌ Ошибка загрузки фото'); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        inp.remove();
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.addPurchasedPhoto = function(id) {
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
                var canvas = document.createElement('canvas');
                var w = img.width, h = img.height;
                var maxSize = 800;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = h * maxSize / w; w = maxSize; }
                    else { w = w * maxSize / h; h = maxSize; }
                }
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                var compressed = canvas.toDataURL('image/webp', 0.7);
                if (!r.purchasedPhotos) r.purchasedPhotos = [];
                r.purchasedPhotos.push(compressed);
                saveDataToLocal();
                if (isOnline()) saveToSupabase('recommendations', r);
                if (currentUser === 'boss') renderBossObjects();
                else if (currentUser === 'wolf') renderWolfObjects();
                showToast('📸 Фото добавлено');
            };
            img.onerror = function() { showToast('❌ Ошибка загрузки фото'); };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        inp.remove();
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.deleteRecommendPhoto = function(id, idx, type) {
    if (!confirm('Удалить фото?')) return;
    var r = null;
    for (var i = 0; i < recommendations.length; i++) {
        if (recommendations[i].id === id) { r = recommendations[i]; break; }
    }
    if (!r) return;
    if (type === 'photos') r.photos.splice(idx, 1);
    else if (type === 'purchasedPhotos') r.purchasedPhotos.splice(idx, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('recommendations', r);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('🗑 Фото удалено');
};

window.addDesignProjectForObject = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var title = prompt('Название проекта:');
    if (!title) return;
    
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    
    inp.onchange = function(e) {
        var files = e.target.files;
        var data = [];
        if (!files.length) { 
            createDesignProject(obj.id, title, []); 
            inp.remove(); 
            return; 
        }
        
        showToast('⏳ Обработка ' + files.length + ' файлов...');
        var processed = 0;
        
        for (var f = 0; f < files.length; f++) {
            var file = files[f];
            var reader = new FileReader();
            
            reader.onload = (function(fileObj) {
                return function(ev) {
                    var result = ev.target.result;
                    
                    if (fileObj.type === 'application/pdf' || 
                        fileObj.type === 'application/msword' ||
                        fileObj.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                        fileObj.type === 'application/vnd.ms-excel' ||
                        fileObj.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                        data.push(result);
                        processed++;
                        if (processed === files.length) {
                            createDesignProject(obj.id, title, data);
                            inp.remove();
                        }
                    } 
                    else if (fileObj.type.startsWith('image/')) {
                        var img = new Image();
                        img.onload = function() {
                            var canvas = document.createElement('canvas');
                            var w = img.width, h = img.height;
                            var maxSize = 1200;
                            if (w > maxSize || h > maxSize) {
                                if (w > h) { h = h * maxSize / w; w = maxSize; }
                                else { w = w * maxSize / h; h = maxSize; }
                            }
                            canvas.width = w;
                            canvas.height = h;
                            var ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, w, h);
                            var compressed = canvas.toDataURL('image/webp', 0.8);
                            data.push(compressed);
                            processed++;
                            if (processed === files.length) {
                                createDesignProject(obj.id, title, data);
                                inp.remove();
                            }
                        };
                        img.onerror = function() {
                            data.push(result);
                            processed++;
                            if (processed === files.length) {
                                createDesignProject(obj.id, title, data);
                                inp.remove();
                            }
                        };
                        img.src = result;
                    } else {
                        data.push(result);
                        processed++;
                        if (processed === files.length) {
                            createDesignProject(obj.id, title, data);
                            inp.remove();
                        }
                    }
                };
            })(file);
            
            reader.readAsDataURL(file);
        }
    };
    
    setTimeout(function() { inp.click(); }, 50);
};

function createDesignProject(objId, title, files) {
    var project = { 
        id: Date.now() + Math.random() * 1000, 
        objectId: objId, 
        title: title, 
        files: files, 
        roles: ['boss', 'wolf', 'client', 'electrician'], 
        comments: [], 
        approvedByClient: false,
        fileNames: []
    };
    
    if (files && files.length > 0) {
        for (var i = 0; i < files.length; i++) {
            if (!project.fileNames) project.fileNames = [];
            project.fileNames.push('Файл ' + (i + 1));
        }
    }
    
    designProjects.push(project);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', project);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('📐 Дизайн-проект создан (' + files.length + ' файлов)');
}

window.deleteDesign = function(id) {
    if (!confirm('Удалить проект?')) return;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === id) {
            designProjects.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/design_projects?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('🗑 Проект удалён');
}

window.deleteDesignFile = function(pid, fi) {
    if (!confirm('Удалить файл?')) return;
    var p = null;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === pid) { p = designProjects[i]; break; }
    }
    if (!p) return;
    p.files.splice(fi, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', p);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast('🗑 Файл удалён');
}

window.addDesignComment = function(id) {
    var p = null;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === id) { p = designProjects[i]; break; }
    }
    if (!p) return;
    var t = prompt('Комментарий:');
    if (t) {
        if (!p.comments) p.comments = [];
        p.comments.push({ author: currentUser === 'boss' ? 'Руководитель' : getUserLabel(currentUser), text: t, date: new Date() });
        saveDataToLocal();
        if (isOnline()) saveToSupabase('design_projects', p);
        if (currentUser === 'boss') renderBossObjects();
        else if (currentUser === 'wolf') renderWolfObjects();
        showToast('💬 Комментарий добавлен');
    }
};

window.toggleDesignApprove = function(id) {
    var p = null;
    for (var i = 0; i < designProjects.length; i++) {
        if (designProjects[i].id === id) { p = designProjects[i]; break; }
    }
    if (!p) return;
    p.approvedByClient = !p.approvedByClient;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('design_projects', p);
    if (currentUser === 'boss') renderBossObjects();
    else if (currentUser === 'wolf') renderWolfObjects();
    showToast(p.approvedByClient ? '✅ Проект утверждён' : '⏳ Утверждение снято');
};

// ============================================================
// ГРАФИК — BAR CHART (СТОЛБЧАТАЯ ДИАГРАММА)
// ============================================================
function renderSchedule() {
    var container = document.getElementById('bossContent') || document.getElementById('wolfContent');
    if (!container) return;
    
    if (objects.length === 0) {
        container.innerHTML = '<div class="card">Нет объектов</div>';
        return;
    }
    
    if (currentUser === 'boss' || currentUser === 'wolf') {
        var objectsList = [];
        for (var i = 0; i < objects.length; i++) {
            if (!objects[i].archived) objectsList.push(objects[i]);
        }
        if (objectsList.length === 0) {
            container.innerHTML = '<div class="card">Нет активных объектов</div>';
            return;
        }
        
        if (!currentObjectId || !getObject(currentObjectId)) {
            currentObjectId = objectsList[0].id;
        }
        
        var selectHtml = '<div style="margin-bottom:16px;">' +
            '<select id="scheduleObjectSelect" onchange="switchScheduleObject(this.value)" style="background:linear-gradient(145deg, #161616, #0d0d0d);color:#e0e0e0;border:1px solid #282828;border-radius:10px;padding:10px 14px;width:100%;font-size:14px;appearance:none;cursor:pointer;">';
        for (var i = 0; i < objectsList.length; i++) {
            var o = objectsList[i];
            selectHtml += '<option value="' + o.id + '" ' + (o.id === currentObjectId ? 'selected' : '') + '>' + escapeHtml(o.name) + '</option>';
        }
        selectHtml += '</select></div>';
        container.innerHTML = selectHtml;
    }
    
    var obj = getObject(currentObjectId);
    if (!obj) {
        if (objects.length > 0) {
            currentObjectId = objects[0].id;
            obj = objects[0];
        } else {
            container.innerHTML += '<div class="card">Нет объектов</div>';
            return;
        }
    }
    
    var worksWithDates = [];
    for (var i = 0; i < obj.works.length; i++) {
        var w = obj.works[i];
        if (w.deadline) {
            worksWithDates.push({
                name: w.name,
                deadline: w.deadline,
                done: w.done || false,
                id: w.id
            });
        }
    }
    
    worksWithDates.sort(function(a, b) {
        var pa = a.deadline.split('.'), pb = b.deadline.split('.');
        return new Date(+pa[2], +pa[1] - 1, +pa[0]) - new Date(+pb[2], +pb[1] - 1, +pb[0]);
    });
    
    var today = new Date();
    var startDate = new Date(today);
    startDate.setDate(today.getDate() - 3);
    var endDate = new Date(today);
    endDate.setDate(today.getDate() + 45);
    
    if (worksWithDates.length > 0) {
        var firstDate = worksWithDates[0].deadline.split('.');
        var first = new Date(+firstDate[2], +firstDate[1] - 1, +firstDate[0]);
        var lastDate = worksWithDates[worksWithDates.length - 1].deadline.split('.');
        var last = new Date(+lastDate[2], +lastDate[1] - 1, +lastDate[0]);
        if (first < startDate) startDate = new Date(first);
        if (last > endDate) endDate = new Date(last);
        startDate.setDate(startDate.getDate() - 5);
        endDate.setDate(endDate.getDate() + 5);
    }
    
    var totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (totalDays < 21) totalDays = 21;
    
    var html = '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:16px;padding:20px;border:1px solid #222;box-shadow:0 4px 30px rgba(0,0,0,0.3);">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:16px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
        '<span style="font-size:22px;background:linear-gradient(135deg, #c9a959, #a8893a);border-radius:8px;padding:4px 10px;color:#0d0d0d;">📊</span>' +
        '<h3 style="margin:0;color:#e8e8e8;font-size:17px;">График работ — ' + escapeHtml(obj.name) + '</h3>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap;">' +
        '<button class="btn btn-sm btn-primary" onclick="addScheduleItem(' + obj.id + ')" style="background:linear-gradient(135deg, #c9a959, #a8893a);color:#0d0d0d;border:none;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;">➕ Добавить этап</button>' +
        '</div>' +
        '</div>';
    
    html += '<div style="display:flex;gap:16px;margin-bottom:14px;font-size:12px;flex-wrap:wrap;padding:8px 12px;background:#0d0d0d;border-radius:8px;border:1px solid #1a1a1a;">' +
        '<span><span style="display:inline-block;width:16px;height:16px;background:linear-gradient(135deg, #c9a959, #b8963a);border-radius:4px;margin-right:6px;vertical-align:middle;"></span> Выполнено</span>' +
        '<span><span style="display:inline-block;width:16px;height:16px;background:linear-gradient(135deg, #4caf50, #388e3c);border-radius:4px;margin-right:6px;vertical-align:middle;"></span> В работе</span>' +
        '<span><span style="display:inline-block;width:16px;height:16px;background:linear-gradient(135deg, #e53935, #b71c1c);border-radius:4px;margin-right:6px;vertical-align:middle;"></span> Просрочено</span>' +
        (obj.plannedEndDate ? '<span style="color:#666;">⏳ ' + getDaysRemaining(obj.plannedEndDate) + ' дней до завершения</span>' : '') +
        '</div>';
    
    if (worksWithDates.length === 0) {
        html += '<div style="text-align:center;padding:40px 20px;color:#666;">' +
            '<div style="font-size:40px;margin-bottom:10px;">📭</div>' +
            'Нет этапов с установленными датами<br>' +
            '<span style="font-size:12px;color:#444;">Добавьте этап и укажите дату в карточке объекта</span>' +
            '</div>';
        html += '</div>';
        container.innerHTML += html;
        return;
    }
    
    html += '<div style="overflow-x:auto;padding-bottom:8px;">';
    html += '<div style="min-width:700px;">';
    
    html += '<div style="display:flex;border-bottom:2px solid #282828;padding:4px 0;margin-bottom:4px;">';
    html += '<div style="min-width:140px;flex-shrink:0;font-size:11px;color:#888;font-weight:500;padding-left:4px;">ЭТАП</div>';
    html += '<div style="flex:1;display:flex;position:relative;height:24px;">';
    
    var currentMonth = -1;
    var monthWidth = 0;
    var monthPositions = [];
    var monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
    
    for (var d = 0; d <= totalDays; d++) {
        var date = new Date(startDate);
        date.setDate(date.getDate() + d);
        var month = date.getMonth();
        var day = date.getDate();
        
        if (month !== currentMonth) {
            if (currentMonth !== -1) {
                monthPositions.push({ month: currentMonth, width: monthWidth, label: monthNames[currentMonth] });
            }
            currentMonth = month;
            monthWidth = 0;
        }
        monthWidth += (100 / totalDays);
    }
    if (currentMonth !== -1) {
        monthPositions.push({ month: currentMonth, width: monthWidth, label: monthNames[currentMonth] });
    }
    
    var posLeft = 0;
    for (var i = 0; i < monthPositions.length; i++) {
        var mp = monthPositions[i];
        html += '<div style="position:absolute;left:' + posLeft + '%;font-size:10px;color:#666;font-weight:500;border-left:1px solid #1a1a1a;padding-left:4px;">' + mp.label + '</div>';
        posLeft += mp.width;
    }
    html += '</div></div>';
    
    var maxBarWidth = 85;
    for (var i = 0; i < worksWithDates.length; i++) {
        var w = worksWithDates[i];
        var deadlineParts = w.deadline.split('.');
        var deadlineDate = new Date(+deadlineParts[2], +deadlineParts[1] - 1, +deadlineParts[0]);
        
        var daysFromStart = Math.ceil((deadlineDate - startDate) / (1000 * 60 * 60 * 24));
        var percentPos = (daysFromStart / totalDays) * 100;
        if (percentPos < 0) percentPos = 0;
        if (percentPos > 100) percentPos = 100;
        
        var barWidth = Math.min(maxBarWidth, 6 + (worksWithDates.length - i) * 0.5);
        var barLeft = percentPos - barWidth / 2;
        if (barLeft < 0) barLeft = 0;
        if (barLeft + barWidth > 100) barLeft = 100 - barWidth;
        
        var color = '#4caf50';
        var colorGrad = 'linear-gradient(135deg, #4caf50, #388e3c)';
        if (w.done) {
            color = '#c9a959';
            colorGrad = 'linear-gradient(135deg, #c9a959, #b8963a)';
        } else if (deadlineDate < today) {
            color = '#e53935';
            colorGrad = 'linear-gradient(135deg, #e53935, #b71c1c)';
        }
        
        var daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
        var label = '';
        if (w.done) label = '✅';
        else if (daysLeft < 0) label = '⚠️ ' + Math.abs(daysLeft);
        else label = daysLeft + ' дн.';
        
        var isUrgent = (!w.done && daysLeft < 3 && daysLeft >= 0);
        
        html += '<div style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #0d0d0d;">';
        html += '<div style="min-width:140px;flex-shrink:0;font-size:13px;color:#e0e0e0;padding-right:8px;display:flex;align-items:center;gap:6px;">' +
            '<span style="' + (isUrgent ? 'color:#e53935;font-weight:600;' : '') + '">' + escapeHtml(w.name) + '</span>' +
            '<span style="font-size:10px;color:#555;">' + w.deadline + '</span>' +
            '</div>';
        
        html += '<div style="flex:1;position:relative;height:32px;background:#0d0d0d;border-radius:6px;overflow:visible;">';
        
        html += '<div style="position:absolute;bottom:2px;left:' + barLeft + '%;width:' + barWidth + '%;height:28px;background:' + colorGrad + ';border-radius:6px;opacity:0.9;transition:all 0.3s;box-shadow:0 2px 12px ' + color + '40;' + 
            (w.done ? 'border:1px solid #c9a95940;' : '') + 
            '" onmouseover="this.style.opacity=\'1\';this.style.transform=\'scaleY(1.05)\';this.style.transformOrigin=\'bottom\'" onmouseout="this.style.opacity=\'0.9\';this.style.transform=\'scaleY(1)\'">' +
            '</div>';
        
        html += '<div style="position:absolute;bottom:4px;left:' + (barLeft + 4) + '%;font-size:8px;color:#0d0d0d;font-weight:600;white-space:nowrap;text-shadow:0 0 4px rgba(255,255,255,0.2);">' + label + '</div>';
        
        html += '<div style="position:absolute;top:-4px;left:' + percentPos + '%;width:12px;height:12px;background:' + color + ';border-radius:50%;border:2px solid #0d0d0d;box-shadow:0 0 12px ' + color + '60;transform:translateX(-50%);"></div>';
        
        html += '</div>';
        html += '</div>';
    }
    
    html += '<div style="display:flex;border-top:1px solid #1a1a1a;padding:4px 0 0 0;margin-top:4px;">';
    html += '<div style="min-width:140px;flex-shrink:0;"></div>';
    html += '<div style="flex:1;display:flex;position:relative;height:16px;">';
    
    var step = Math.max(1, Math.floor(totalDays / 20));
    for (var d = 0; d <= totalDays; d += step) {
        var date = new Date(startDate);
        date.setDate(date.getDate() + d);
        var pos = (d / totalDays) * 100;
        var isWeekend = (date.getDay() === 0 || date.getDay() === 6);
        html += '<div style="position:absolute;left:' + pos + '%;font-size:7px;color:' + (isWeekend ? '#333' : '#555') + ';transform:translateX(-50%);border-left:1px solid ' + (isWeekend ? '#1a1a1a' : '#0d0d0d') + ';padding-left:2px;">' + date.getDate() + '</div>';
    }
    html += '</div></div>';
    
    html += '</div></div>';
    
    html += '<div style="margin-top:16px;padding:14px;background:#0d0d0d;border-radius:10px;border:1px solid #1a1a1a;">' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">' +
        '<span style="color:#888;font-size:13px;">➕ Быстрое добавление:</span>' +
        '<input type="text" id="newScheduleWorkName" placeholder="Название этапа" style="flex:2;min-width:140px;padding:8px 12px;background:#161616;color:#e0e0e0;border:1px solid #282828;border-radius:6px;font-size:13px;">' +
        '<input type="text" id="newScheduleWorkDate" placeholder="ДД.ММ.ГГГГ" style="flex:0.8;min-width:100px;padding:8px 12px;background:#161616;color:#e0e0e0;border:1px solid #282828;border-radius:6px;font-size:13px;">' +
        '<button class="btn btn-primary" onclick="addScheduleWorkWithDate(' + obj.id + ')" style="background:linear-gradient(135deg, #c9a959, #a8893a);color:#0d0d0d;border:none;padding:8px 18px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:500;">➕ Добавить</button>' +
        '</div>' +
        '</div>';
    
    html += '</div>';
    container.innerHTML += html;
}

window.zoomSchedule = function(direction) {
    showToast(direction > 0 ? '🔍 Приближено' : '🔍 Отдалено');
    renderSchedule();
};

window.addScheduleWorkWithDate = function(objId) {
    var obj = getObject(objId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    
    var nameInput = document.getElementById('newScheduleWorkName');
    var dateInput = document.getElementById('newScheduleWorkDate');
    
    var name = nameInput ? nameInput.value.trim() : '';
    var deadline = dateInput ? dateInput.value.trim() : '';
    
    if (!name) {
        showToast('❌ Введите название этапа');
        return;
    }
    
    if (!deadline || !isValidDate(deadline)) {
        showToast('❌ Введите корректную дату (ДД.ММ.ГГГГ)');
        return;
    }
    
    var newWork = {
        id: Date.now() + Math.random() * 1000,
        name: name,
        done: false,
        deadline: deadline,
        quantity: '',
        unit: '',
        forElectrician: false,
        manual: true,
        status: '',
        paid: false,
        contractor: null,
        contractorStatus: 'unassigned'
    };
    
    obj.works.push(newWork);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    
    if (nameInput) nameInput.value = '';
    if (dateInput) dateInput.value = '';
    
    renderSchedule();
    showToast('✅ Этап "' + name + '" добавлен в график');
};

window.addScheduleItem = function(objId) {
    var obj = getObject(objId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    
    var name = prompt('Название задачи:');
    if (!name) return;
    var deadline = prompt('Дата завершения (ДД.ММ.ГГГГ):');
    if (deadline === null) return;
    if (deadline.trim() !== '' && !isValidDate(deadline)) {
        showToast('❌ Неверный формат даты');
        return;
    }
    
    var newWork = {
        id: Date.now() + Math.random() * 1000,
        name: name.trim(),
        done: false,
        deadline: deadline.trim() || null,
        quantity: '',
        unit: '',
        forElectrician: false,
        manual: true,
        status: '',
        paid: false,
        contractor: null,
        contractorStatus: 'unassigned'
    };
    obj.works.push(newWork);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('objects', obj);
    renderSchedule();
    showToast('✅ Задача добавлена');
};

window.switchScheduleObject = function(objId) {
    currentObjectId = parseInt(objId);
    renderSchedule();
};

// ============================================================
// РЕНДЕР И ЗАПУСК
// ============================================================
function renderPlaceholder() {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>' + getUserLabel(currentUser) + '</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div></div>';
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
// ЗАПУСК
// ============================================================
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
