// ============================================================
// СТРОЙУЧЁТ — ФИНАЛЬНАЯ ВЕРСИЯ (ИСПРАВЛЕН ВХОД)
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

// ============================================================
// ВХОД (ИСПРАВЛЕН)
// ============================================================
window.login = function(r) {
    // Для дизайнера, мастера, закупщика
    if (['designer', 'master', 'purchaser'].includes(r)) {
        if (!passwords[r]) passwords[r] = '30986';
        var p = prompt('Введите пароль для "' + getUserLabel(r) + '":');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
        currentUser = r; render(); return;
    }
    
    // Для ролей с паролем (boss, wolf, electrician)
    if (passwords[r] && passwords[r].length > 0) {
        var p = prompt('Введите пароль для "' + getUserLabel(r) + '":');
        if (p !== passwords[r]) { alert('Неверный пароль'); return; }
        currentUser = r; render(); return;
    }
    
    // Для клиента — вход по паролю объекта
    if (r === 'client') {
        var pwd = prompt('Введите ПАРОЛЬ объекта:');
        if (pwd === null || pwd.trim() === '') { alert('Пароль не введён'); return; }
        
        var found = null;
        for (var i = 0; i < objects.length; i++) {
            var objPwd = String(passwords.objects[objects[i].id] || '');
            var inputPwd = String(pwd).trim();
            if (objPwd === inputPwd) { 
                found = objects[i]; 
                break; 
            }
        }
        
        if (!found) { 
            alert('Неверный пароль. Объект не найден.'); 
            return; 
        }
        currentUser = r;
        currentObjectId = found.id;
        render();
        return;
    }
    
    alert('Ошибка входа');
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

// ============================================================
// ВСЕ ОСТАЛЬНЫЕ ФУНКЦИИ (ТВОЙ КОД)
// ============================================================
// ВСТАВЬ СЮДА ВСЕ СВОИ ФУНКЦИИ:
// renderBossObjects (уже есть выше), renderWolf, renderWolfObjects,
// renderClient, renderClientRecommend, renderClientDesign, renderClientWorks, renderClientChecks,
// renderElectrician, renderElectricianObjects, renderElectricianDesign, renderElectricianTasks,
// renderSchedule, renderBossNotes, renderWolfNotes, renderNotesCalendar,
// renderBossChecks, renderWolfChecks, renderBossPurchases, renderWolfPurchases,
// renderPasswords (уже есть выше), и все функции действий

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
