<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>СтройУчёт</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d0d0d; color: #e0e0e0; padding: 12px; min-height: 100vh; }
#app { max-width: 800px; margin: 0 auto; }
.card { background: #161616; border: 1px solid #282828; border-radius: 12px; padding: 16px; margin: 8px 0; }
.flex { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.btn { background: #282828; color: #e0e0e0; border: 1px solid #3a3a3a; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 14px; transition: all 0.2s; }
.btn:hover { background: #333; border-color: #c9a959; }
.btn-primary { background: #c9a959; color: #0d0d0d; border-color: #c9a959; }
.btn-primary:hover { background: #b89848; border-color: #b89848; }
.btn-danger { background: #a04040; color: #fff; border-color: #a04040; }
.btn-sm { padding: 4px 10px; font-size: 12px; }
.badge { background: #282828; padding: 2px 10px; border-radius: 12px; font-size: 12px; color: #aaa; }
.tab-bar { display: flex; gap: 4px; margin: 12px 0; background: #161616; border-radius: 12px; padding: 4px; overflow-x: auto; }
.tab { padding: 8px 16px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-size: 14px; }
.tab:hover { background: #282828; }
.tab.active { background: #c9a959; color: #0d0d0d; }
.object-header { cursor: pointer; padding: 8px; border-radius: 8px; }
.object-header:hover { background: #1a1a1a; }
.arrow { display: inline-block; transition: transform 0.2s; margin-left: 8px; }
.arrow.open { transform: rotate(90deg); }
.object-detail { display: none; padding-top: 12px; }
.object-detail.open { display: block; }
.work-block { background: #121212; border: 1px solid #282828; border-radius: 8px; margin: 6px 0; }
.work-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; gap: 8px; }
.work-header:hover { background: #1a1a1a; }
.work-title { font-weight: 500; }
.work-detail { display: none; padding: 10px 12px; border-top: 1px solid #282828; }
.work-detail.open { display: block; }
.photo-grid { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0; }
.photo-grid img { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid #282828; }
.modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); justify-content: center; align-items: center; z-index: 999; }
.modal img { max-width: 90%; max-height: 90%; }
.checks-total { display: flex; gap: 20px; padding: 8px 0; font-weight: 500; }
.design-block { background: #121212; border: 1px solid #282828; border-radius: 8px; margin: 4px 0; }
.design-header { padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.design-detail { display: none; padding: 8px 12px; border-top: 1px solid #282828; }
.design-detail.open { display: block; }
.rec-block { background: #121212; border: 1px solid #282828; border-radius: 8px; margin: 4px 0; }
.rec-header { padding: 8px 12px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
.rec-detail { display: none; padding: 8px 12px; border-top: 1px solid #282828; }
.rec-detail.open { display: block; }
.pw { display: inline-block; position: relative; margin: 2px; }
.pw img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 1px solid #282828; }
.pw .del { position: absolute; top: -6px; right: -6px; background: #a04040; color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 12px; cursor: pointer; }
.photo-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #555; }
.photo-indicator.has-photo { background: #4caf50; }
.work-status-check { cursor: pointer; font-size: 18px; }
.work-electrician-toggle { cursor: pointer; opacity: 0.4; transition: opacity 0.2s; }
.work-electrician-toggle:hover { opacity: 1; }
.month-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.nav-btn { background: #282828; color: #e0e0e0; border: 1px solid #3a3a3a; padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 18px; }
.calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #121212; border-radius: 6px; cursor: pointer; font-size: 14px; position: relative; min-height: 40px; }
.day:hover { background: #1a1a1a; }
.day.today { border: 2px solid #c9a959; }
.day.has-tasks { background: #1a1a1a; }
.day .indicator { color: #c9a959; font-size: 8px; position: absolute; bottom: 2px; }
.day-number { font-weight: 500; }
.obj-filter-tabs { display: flex; gap: 4px; margin: 8px 0; }
.obj-filter-tabs .tab { padding: 4px 12px; }
.login-header { padding: 20px 0; }
.slogan { font-size: 28px; font-weight: 600; color: #c9a959; }
.slogan small { display: block; font-size: 14px; font-weight: 300; color: #888; }
.object-selector { background: #161616; color: #e0e0e0; border: 1px solid #282828; border-radius: 6px; padding: 6px 12px; font-size: 14px; }
.icon-btn { background: transparent; border: none; color: #888; cursor: pointer; font-size: 16px; padding: 2px 4px; transition: color 0.2s; }
.icon-btn:hover { color: #e0e0e0; }
.icon-btn.danger:hover { color: #a04040; }
.file-wrap { display: inline-flex; align-items: center; gap: 4px; margin: 2px; background: #1a1a1a; padding: 4px 8px; border-radius: 6px; }
.file-wrap img { max-width: 80px; max-height: 80px; border-radius: 4px; }
.electrician-task-block { background: #121212; border: 1px solid #282828; border-radius: 8px; padding: 10px; margin: 6px 0; }
.task-photos { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.task-photos img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; cursor: pointer; }
hr { border: none; border-top: 1px solid #282828; margin: 12px 0; }
.drag-handle { cursor: grab; color: #555; font-size: 18px; line-height: 1; }
.drag-handle:active { cursor: grabbing; }
.work-block.dragging { opacity: 0.5; }
.work-block.drag-over { border-color: #c9a959; background: #1a1a1a; }
.design-arrow { display: inline-block; transition: transform 0.2s; margin-left: 6px; }
.design-arrow.open { transform: rotate(90deg); }
.rec-arrow { display: inline-block; transition: transform 0.2s; margin-left: 6px; }
.rec-arrow.open { transform: rotate(90deg); }
.check-item { border: 1px solid #2a2a2a; border-radius: 8px; padding: 10px; margin: 6px 0; }
.check-item.paid { border-color: #4caf50; }
.check-file { max-width: 100%; max-height: 200px; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div id="app"></div>

<script>
// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ (ТОЛЬКО ПАРОЛИ 30986)
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

let pendingActions = [];
let isSyncing = false;
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

function showToast(message, duration) {
    duration = duration || 3000;
    var old = document.getElementById('toast');
    if (old) old.remove();
    var toast = document.createElement('div');
    toast.id = 'toast';
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#222;color:#e0e0e0;padding:12px 24px;border-radius:8px;border:1px solid #c9a959;box-shadow:0 4px 12px rgba(0,0,0,0.6);z-index:9999;font-size:16px;max-width:90%;text-align:center;opacity:0;transition:opacity 0.3s ease';
    document.body.appendChild(toast);
    setTimeout(function() { toast.style.opacity = '1'; }, 10);
    setTimeout(function() { toast.style.opacity = '0'; setTimeout(function() { toast.remove(); }, 300); }, duration);
}

function escapeHtml(s) { if (!s) return ''; var m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return String(s).replace(/[&<>"']/g, function(c) { return m[c]; }); }

function isValidDate(d) { var r = /^\d{4}-\d{2}-\d{2}$/; if (!r.test(d)) return false; var p = d.split('-'); var dt = new Date(+p[0], +p[1] - 1, +p[2]); return dt && dt.getFullYear() == +p[0] && dt.getMonth() == +p[1] - 1 && dt.getDate() == +p[2]; }

function saveUiState() { try { localStorage.setItem('uiState', JSON.stringify(uiState)); } catch(e) {} }
function loadUiState() { try { var s = localStorage.getItem('uiState'); if (s) uiState = JSON.parse(s); } catch(e) {} if (!uiState) uiState = {}; }
function getObject(id) { for (var i = 0; i < objects.length; i++) { if (objects[i].id === id) return objects[i]; } return null; }
function getUserLabel(r) { var m = { boss: 'Руководитель', wolf: 'Волк', client: 'Клиент', designer: 'Дизайнер', master: 'Мастер', purchaser: 'Закупщик', electrician: 'Электрик' }; return m[r] || r; }
function fmt(d) { if (!d) return ''; var dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleDateString(); }
function fmtTime(d) { if (!d) return ''; var dt = new Date(d); if (isNaN(dt.getTime())) return d; return dt.toLocaleString(); }
function isOnline() { return navigator.onLine; }
function getDaysRemaining(endDate) { if (!endDate) return null; var end = new Date(endDate); var now = new Date(); var diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24)); return diff; }

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
            works: [{ id: n + 1, name: 'Демонтаж', done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: false, status: '' }],
            completed: false,
            archived: false,
            startDate: null,
            plannedEndDate: null,
            schedule: []
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
        }
        if (o.startDate === undefined) o.startDate = null;
        if (o.plannedEndDate === undefined) o.plannedEndDate = null;
        if (o.schedule === undefined) o.schedule = [];
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

async function saveToSupabase(table, data) {
    if (!isOnline()) return false;
    try {
        var checkResp = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?id=eq.' + data.id, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        var existing = await checkResp.json();
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
    } catch(e) { console.error('Save error:', e); return false; }
}

async function syncPasswordsToSupabase() {
    if (!isOnline()) return;
    try {
        for (var role in passwords) {
            if (role === 'objects') continue;
            if (passwords[role]) {
                await saveToSupabase('passwords', { id: Date.now() + Math.random() * 1000, role: role, password: passwords[role] });
            }
        }
        for (var objId in passwords.objects) {
            if (passwords.objects[objId]) {
                await saveToSupabase('passwords', { id: Date.now() + Math.random() * 1000, object_id: parseInt(objId), password: passwords.objects[objId] });
            }
        }
    } catch(e) { console.error('Sync passwords error:', e); }
}

function renderFakeCabinet(role) {
    var labels = { designer: '🎨 Дизайнер', master: '🔧 Мастер', purchaser: '📦 Закупщик' };
    document.getElementById('app').innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;min-height:400px;display:flex;flex-direction:column;justify-content:center;align-items:center;"><div style="font-size:64px;margin-bottom:20px;">🔒</div><h2 style="color:#c9a959;margin-bottom:10px;">' + labels[role] + '</h2><div style="color:#666;font-size:18px;margin-bottom:20px;">Доступ временно ограничен</div><div style="color:#444;font-size:14px;max-width:300px;margin-bottom:30px;">Ведутся технические работы. Пожалуйста, обратитесь к руководителю.</div><button class="btn btn-primary" onclick="currentUser=null;render()">🚪 Выйти</button></div>';
}

function renderLogin() {
    document.getElementById('app').innerHTML = '<div class="card" style="text-align:center;padding:30px;"><div class="login-header"><div class="slogan">СтройУчёт<small>Умная система учёта работ</small></div></div><hr><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;max-width:400px;margin:0 auto;"><button class="btn btn-primary" onclick="login(\'boss\')">👔 Руководитель</button><button class="btn" onclick="login(\'wolf\')">🐺 Волк</button><button class="btn" onclick="login(\'client\')">🏠 Клиент</button><button class="btn" onclick="login(\'master\')">🔧 Мастер</button><button class="btn" onclick="login(\'designer\')">🎨 Дизайнер</button><button class="btn" onclick="login(\'purchaser\')">📦 Закупщик</button><button class="btn" onclick="login(\'electrician\')">⚡ Электрик</button></div></div>';
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

function renderBoss() {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>👔 Руководитель</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div><div class="tab-bar"><div class="tab active" data-tab="objects">Объекты</div><div class="tab" data-tab="notes">Ежедневник</div><div class="tab" data-tab="purchases">Закупки (отчёт)</div><div class="tab" data-tab="checks">Чеки</div><div class="tab" data-tab="passwords">🔐 Пароли</div></div><div id="bossContent"></div>';
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
    } else if (filter === 'archived') {
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].archived) objectsToShow.push(objects[i]);
        }
    }

    var statusHtml = '<div id="pendingStatus" style="padding:8px 12px;margin-bottom:12px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;text-align:center;color:#4caf50;">✅ Все данные синхронизированы</div>';
    var filterTabs = '<div class="obj-filter-tabs"><span class="tab ' + (filter === 'active' ? 'active' : '') + '" onclick="setBossObjectFilter(\'active\')">Активные</span><span class="tab ' + (filter === 'completed' ? 'active' : '') + '" onclick="setBossObjectFilter(\'completed\')">Сданные</span></div>';
    var sel = '<div class="flex" style="margin-bottom:16px;"><button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button><select class="object-selector" id="objectSelector" onchange="scrollToObject(this.value)"><option value="">— Перейти к объекту —</option>';
    for (var i = 0; i < objects.length; i++) {
        sel += '<option value="obj-' + objects[i].id + '">' + escapeHtml(objects[i].name) + ' (' + escapeHtml(objects[i].code) + ')</option>';
    }
    sel += '</select></div>';

    var list = '';
    for (var i = 0; i < objectsToShow.length; i++) {
        var obj = objectsToShow[i];
        var objKey = 'obj-' + obj.id;
        var objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        var worksHtml = '';
        for (var j = 0; j < obj.works.length; j++) {
            var w = obj.works[j];
            var wKey = 'work-' + obj.id + '-' + j;
            var wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            var photos = [];
            for (var p = 0; p < reports.length; p++) {
                if (reports[p].objectId === obj.id && reports[p].workId === w.id) photos.push(reports[p]);
            }
            var phHtml = '';
            for (var p = 0; p < photos.length; p++) {
                phHtml += '<span class="pw"><img src="' + photos[p].photos[0] + '" onclick="showModal(\'' + photos[p].photos[0] + '\')"><button class="del" onclick="deleteWorkPhoto(' + photos[p].id + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>';
            }
            var daysHtml = '';
            if (w.deadline && !w.done) {
                var daysLeft = getDaysRemaining(w.deadline);
                if (daysLeft !== null) {
                    daysHtml = '<span style="font-size:12px;color:' + (daysLeft < 0 ? '#a04040' : '#4caf50') + ';margin-left:8px;">' + (daysLeft < 0 ? '⏰ просрочка ' + Math.abs(daysLeft) + ' дн.' : '⏳ осталось ' + daysLeft + ' дн.') + '</span>';
                }
            }
            worksHtml += '<div class="work-block" draggable="true" data-object-id="' + obj.id + '" data-work-index="' + j + '"><div class="work-header" onclick="toggleWork(event, this, \'' + wKey + '\')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="drag-handle">⠿</span><span class="work-title">' + escapeHtml(w.name) + '</span>' + (w.quantity ? ' <span class="work-quantity">(' + escapeHtml(w.quantity) + ' ' + escapeHtml(w.unit) + ')</span>' : '') + '<span class="work-status-check" onclick="event.stopPropagation();toggleWorkStatus(' + obj.id + ',' + j + ')">' + (w.done ? '☑' : '☐') + '</span><span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(' + obj.id + ',' + j + ')" title="Назначить электрику">' + (w.forElectrician ? '⚡' : '') + '</span>' + (w.deadline ? '<span class="work-deadline">📅 ' + fmt(w.deadline) + '</span>' : '') + daysHtml + '<span class="photo-indicator ' + (photos.length ? 'has-photo' : '') + '"></span><span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span></span><span style="display:flex;gap:2px;"><button class="icon-btn" onclick="event.stopPropagation();uploadWorkPhoto(' + obj.id + ',' + j + ')">📸</button><button class="icon-btn" onclick="event.stopPropagation();moveWorkUp(' + obj.id + ',' + j + ')">⬆</button><button class="icon-btn" onclick="event.stopPropagation();moveWorkDown(' + obj.id + ',' + j + ')">⬇</button><button class="icon-btn danger" onclick="event.stopPropagation();deleteWorkWithConfirm(' + obj.id + ',' + j + ')">🗑</button></span></div><div class="work-detail ' + (wOpen ? 'open' : '') + '"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">' + (phHtml || 'Нет фото') + '</div></div></div>';
        }
        setTimeout(initDragDrop, 50);
        
        var summaryHtml = '';
        if (obj.startDate) summaryHtml += '📅 ' + fmt(obj.startDate);
        if (obj.plannedEndDate) {
            var days = getDaysRemaining(obj.plannedEndDate);
            summaryHtml += ' → ' + fmt(obj.plannedEndDate) + (days !== null ? ' <span style="color:' + (days < 0 ? '#a04040' : '#c9a959') + ';">(осталось ' + days + ' дн.)</span>' : '');
        }
        
        list += '<div class="card" id="obj-' + obj.id + '"><div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')"><div class="flex"><h3>' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge" style="font-size:13px;">' + (summaryHtml || '📅 даты не указаны') + '</span><button class="btn btn-sm" onclick="event.stopPropagation();completeObject(' + obj.id + ')">' + (obj.completed ? 'Вернуть' : 'Сдать') + '</button><button class="btn btn-sm btn-danger" onclick="event.stopPropagation();archiveObject(' + obj.id + ')">📦</button><button class="btn btn-sm" onclick="event.stopPropagation();addWork(' + obj.id + ')">➕ Этап</button></div></div><div style="color:#999;font-size:14px;">📍 ' + escapeHtml(obj.address) + '</div><div style="margin:8px 0;padding:10px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;"><div style="display:flex;gap:12px;flex-wrap:wrap;"><button class="btn btn-sm" onclick="setObjectStartDate(' + obj.id + ')">📅 Начало</button><button class="btn btn-sm" onclick="setObjectEndDate(' + obj.id + ')">📅 Завершение</button></div></div></div><div class="object-detail ' + (objOpen ? 'open' : '') + '"><hr><h4>Этапы работ</h4><div id="work-list-' + obj.id + '" class="work-list">' + worksHtml + '</div></div></div>';
    }

    container.innerHTML = statusHtml + filterTabs + sel + list;
}

function renderWolf() {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>🐺 Волк (инженер)</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div><div class="tab-bar"><div class="tab active" data-tab="objects">Объекты</div><div class="tab" data-tab="notes">Ежедневник</div><div class="tab" data-tab="purchases">Закупки</div><div class="tab" data-tab="checks">Чеки</div></div><div id="wolfContent"></div>';
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
        var worksHtml = '';
        for (var j = 0; j < obj.works.length; j++) {
            var w = obj.works[j];
            var wKey = 'wolf-work-' + obj.id + '-' + j;
            var wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            var photos = [];
            for (var p = 0; p < reports.length; p++) {
                if (reports[p].objectId === obj.id && reports[p].workId === w.id) photos.push(reports[p]);
            }
            var phHtml = '';
            for (var p = 0; p < photos.length; p++) {
                phHtml += '<span class="pw"><img src="' + photos[p].photos[0] + '" onclick="showModal(\'' + photos[p].photos[0] + '\')"><button class="del" onclick="deleteWorkPhoto(' + photos[p].id + ')" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button></span>';
            }
            var daysHtml = '';
            if (w.deadline && !w.done) {
                var daysLeft = getDaysRemaining(w.deadline);
                if (daysLeft !== null) {
                    daysHtml = '<span style="font-size:12px;color:' + (daysLeft < 0 ? '#a04040' : '#4caf50') + ';margin-left:8px;">' + (daysLeft < 0 ? '⏰ просрочка ' + Math.abs(daysLeft) + ' дн.' : '⏳ осталось ' + daysLeft + ' дн.') + '</span>';
                }
            }
            worksHtml += '<div class="work-block"><div class="work-header" onclick="toggleWork(event, this, \'' + wKey + '\')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="work-title">' + escapeHtml(w.name) + '</span>' + (w.quantity ? ' <span class="work-quantity">(' + escapeHtml(w.quantity) + ' ' + escapeHtml(w.unit) + ')</span>' : '') + '<span class="work-status-check" onclick="event.stopPropagation();wolfToggleWorkStatus(' + obj.id + ',' + j + ')">' + (w.done ? '☑' : '☐') + '</span>' + (w.deadline ? '<span class="work-deadline">📅 ' + fmt(w.deadline) + '</span>' : '') + daysHtml + '<span class="photo-indicator ' + (photos.length ? 'has-photo' : '') + '"></span><span class="work-arrow ' + (wOpen ? 'open' : '') + '">▶</span></span><span style="display:flex;gap:2px;"><button class="icon-btn" onclick="event.stopPropagation();wolfUploadWorkPhoto(' + obj.id + ',' + j + ')">📸</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkUp(' + obj.id + ',' + j + ')">⬆</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkDown(' + obj.id + ',' + j + ')">⬇</button></span></div><div class="work-detail ' + (wOpen ? 'open' : '') + '"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">' + (phHtml || 'Нет фото') + '</div></div></div>';
        }
        var addWorkButton = '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="wolfAddWork(' + obj.id + ')">➕ Этап</button></div>';
        
        list += '<div class="card" id="wolf-obj-' + obj.id + '"><div class="object-header" onclick="toggleObject(this,\'' + objKey + '\')"><div class="flex"><h3>' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;">(' + escapeHtml(obj.code) + ')</span><span class="arrow ' + (objOpen ? 'open' : '') + '">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge">ID: ' + obj.id + '</span></div></div><div style="color:#999;font-size:14px;">📍 ' + escapeHtml(obj.address) + '</div></div><div class="object-detail ' + (objOpen ? 'open' : '') + '"><hr><h4>Этапы работ</h4><div id="wolf-work-list-' + obj.id + '" class="work-list">' + worksHtml + '</div>' + addWorkButton + '</div></div>';
    }
    container.innerHTML = sel + list;
    setTimeout(initDragDrop, 50);
}

function renderClient() {
    var obj = getObject(currentObjectId);
    if (!obj) { document.getElementById('app').innerHTML = '<div class="card">Объект не найден</div>'; return; }
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>🏠 ' + escapeHtml(obj.name) + '</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div><div>📍 ' + escapeHtml(obj.address) + '</div></div><div class="tab-bar"><div class="tab active" data-tab="works">Этапы</div><div class="tab" data-tab="checks">Чеки</div></div><div id="clientContent"></div>';
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            this.classList.add('active');
            var tab = this.dataset.tab;
            if (tab === 'works') renderClientWorks();
            else if (tab === 'checks') renderClientChecks();
        };
    }
    renderClientWorks();
}

function renderClientWorks() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var obj = getObject(currentObjectId);
    if (!obj) { container.innerHTML = '<div class="card">Объект не найден</div>'; return; }
    
    var html = '<div class="card"><h3>📋 Этапы работ</h3>';
    for (var i = 0; i < obj.works.length; i++) {
        var w = obj.works[i];
        html += '<div style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0;"><div class="flex"><b>' + escapeHtml(w.name) + '</b><span class="badge">' + (w.done ? '✅ выполнено' : '⏳ в работе') + '</span></div></div>';
    }
    html += '</div>';
    container.innerHTML = html;
}

function renderClientChecks() {
    var container = document.getElementById('clientContent');
    if (!container) return;
    var list = [];
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].objectId === currentObjectId) list.push(checks[i]);
    }
    list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var totalUnpaid = 0;
    for (var i = 0; i < list.length; i++) {
        if (!list[i].paid) totalUnpaid += (list[i].amount || 0);
    }
    if (!list.length) { container.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    var html = '<div class="checks-total"><span>💰 Неоплаченные: ' + totalUnpaid.toFixed(2) + ' ₽</span></div>';
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        html += '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</b></span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="clientMarkCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '</div></div>';
    }
    container.innerHTML = html;
}

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

function renderElectrician() {
    document.getElementById('app').innerHTML = '<div class="card"><div class="flex"><h2>⚡ Электрик</h2><button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button></div></div><div style="padding:30px;text-align:center;color:#888;">Страница в разработке</div>';
}

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
// ФУНКЦИИ ДЛЯ ОБЪЕКТОВ
// ============================================================
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
    var newObj = { id: id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: false, archived: false, startDate: null, plannedEndDate: null, schedule: [] };
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
    var newWork = { id: Date.now(), name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true, status: '' };
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
    var o = getObject(id);
    if (!o) return;
    o.works[wi].done = !o.works[wi].done;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
    } else {
        saveToSupabase('objects', o);
    }
    renderWolfObjects();
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

window.moveWorkUp = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj || idx <= 0) return;
    var works = obj.works;
    var temp = works[idx - 1];
    works[idx - 1] = works[idx];
    works[idx] = temp;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: obj });
    } else {
        saveToSupabase('objects', obj);
    }
    renderBossObjects();
};

window.moveWorkDown = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj || idx >= obj.works.length - 1) return;
    var works = obj.works;
    var temp = works[idx + 1];
    works[idx + 1] = works[idx];
    works[idx] = temp;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: obj });
    } else {
        saveToSupabase('objects', obj);
    }
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

window.archiveObject = function(id) {
    if (!confirm('Отправить объект в архив?')) return;
    var o = getObject(id);
    if (!o) return;
    o.archived = true;
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: o });
    } else {
        saveToSupabase('objects', o);
    }
    renderBossObjects();
    showToast('📦 Объект в архиве');
};

window.setBossObjectFilter = function(filter) {
    uiState['bossObjectFilter'] = filter;
    saveUiState();
    renderBossObjects();
};

window.setObjectStartDate = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var date = prompt('Введите дату начала (ГГГГ-ММ-ДД):');
    if (date && isValidDate(date)) {
        obj.startDate = date;
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        renderBossObjects();
        showToast('📅 Дата начала установлена');
    } else if (date) {
        showToast('❌ Неверный формат даты');
    }
};

window.setObjectEndDate = function(objId) {
    var obj = getObject(objId);
    if (!obj) return;
    var date = prompt('Введите дату планового завершения (ГГГГ-ММ-ДД):');
    if (date && isValidDate(date)) {
        obj.plannedEndDate = date;
        saveDataToLocal();
        if (isOnline()) saveToSupabase('objects', obj);
        renderBossObjects();
        showToast('📅 Дата завершения установлена');
    } else if (date) {
        showToast('❌ Неверный формат даты');
    }
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
        syncPasswordsToSupabase();
    }
    renderPasswords();
};

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
        syncPasswordsToSupabase();
        showToast('🔑 Пароль для ' + getUserLabel(r) + ' синхронизирован');
    } else {
        showToast('🔑 Пароль сохранён локально (ожидает интернет)');
    }
    renderPasswords();
};

window.savePasswords = function() {
    saveDataToLocal();
    if (isOnline()) {
        syncPasswordsToSupabase();
        showToast('🔐 Пароли сохранены и синхронизированы');
    } else {
        showToast('🔐 Пароли сохранены локально (ожидают интернет)');
    }
};

window.wolfAddWork = function(id) {
    var n = prompt('Название этапа');
    if (!n) return;
    var o = getObject(id);
    if (!o) return;
    var newWork = { id: Date.now(), name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true, status: '' };
    o.works.push(newWork);
    saveDataToLocal();
    if (isOnline()) {
        saveToSupabase('objects', o);
    } else {
        addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
    }
    renderWolfObjects();
    showToast('➕ Этап добавлен (ручной)');
};

window.wolfMoveWorkUp = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj || idx <= 0) return;
    var works = obj.works;
    var temp = works[idx - 1];
    works[idx - 1] = works[idx];
    works[idx] = temp;
    saveDataToLocal();
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    renderWolfObjects();
};

window.wolfMoveWorkDown = function(objId, idx) {
    var obj = getObject(objId);
    if (!obj || idx >= obj.works.length - 1) return;
    var works = obj.works;
    var temp = works[idx + 1];
    works[idx + 1] = works[idx];
    works[idx] = temp;
    saveDataToLocal();
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    renderWolfObjects();
};

function renderWolfNotes() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    container.innerHTML = '<div class="card">Ежедневник в разработке</div>';
}

function renderWolfChecks() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    var list = [];
    for (var i = 0; i < checks.length; i++) {
        list.push(checks[i]);
    }
    list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var totalUnpaid = 0;
    for (var i = 0; i < list.length; i++) {
        if (!list[i].paid) totalUnpaid += (list[i].amount || 0);
    }
    if (!list.length) { container.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    var html = '<div class="checks-total"><span>💰 Неоплаченные: ' + totalUnpaid.toFixed(2) + ' ₽</span></div>';
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var obj = getObject(c.objectId);
        html += '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '</div></div>';
    }
    container.innerHTML = html;
}

function renderWolfPurchases() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    container.innerHTML = '<div class="card">Закупки в разработке</div>';
}

function renderBossNotes() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    container.innerHTML = '<div class="card">Ежедневник в разработке</div>';
}

function renderBossChecks() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    var list = [];
    for (var i = 0; i < checks.length; i++) {
        list.push(checks[i]);
    }
    list.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    var totalUnpaid = 0, totalPaid = 0;
    for (var i = 0; i < list.length; i++) {
        if (!list[i].paid) totalUnpaid += (list[i].amount || 0);
        else totalPaid += (list[i].amount || 0);
    }
    if (!list.length) { container.innerHTML = '<div class="card">Нет чеков</div>'; return; }
    var html = '<div class="checks-total"><span>💰 Неоплаченные: ' + totalUnpaid.toFixed(2) + ' ₽</span><span>✅ Оплаченные: ' + totalPaid.toFixed(2) + ' ₽</span></div>';
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var obj = getObject(c.objectId);
        html += '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;"><div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div><div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' + (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') + '<div style="margin-top:6px;">' + (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') + '<button class="btn btn-sm btn-danger" onclick="deleteCheck(' + c.id + ')">🗑</button></div></div>';
    }
    container.innerHTML = html;
}

window.addCheck = function() {
    var available = [];
    for (var i = 0; i < objects.length; i++) {
        if (!objects[i].archived) available.push(objects[i]);
    }
    if (!available.length) { showToast('Нет объектов'); return; }
    var list = '';
    for (var i = 0; i < available.length; i++) {
        list += (i+1) + '. ' + available[i].name + ' (' + available[i].code + ')\n';
    }
    var choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    var idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    var objId = available[idx].id;
    var amount = parseFloat(prompt('Сумма (руб):') || '0');
    if (isNaN(amount) || amount <= 0) { showToast('Введите сумму'); return; }
    var inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*,application/pdf';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        var reader = new FileReader();
        reader.onload = function(ev) {
            var check = { id: Date.now(), objectId: objId, amount: amount, fileData: ev.target.result, date: new Date(), paid: false, paidDate: null, paidBy: null };
            checks.push(check);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('checks', check);
            renderBossChecks();
            showToast('🧾 Чек загружен');
            inp.remove();
        };
        reader.readAsDataURL(file);
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.markCheckPaid = function(checkId) {
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].id === checkId) {
            var c = checks[i];
            if (c.paid) return;
            c.paid = true;
            c.paidDate = new Date();
            c.paidBy = currentUser;
            saveDataToLocal();
            if (isOnline()) saveToSupabase('checks', c);
            renderBossChecks();
            showToast('✅ Чек оплачен');
            return;
        }
    }
};

window.deleteCheck = function(checkId) {
    if (!confirm('Удалить чек?')) return;
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].id === checkId) {
            checks.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/checks?id=eq.' + checkId, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    renderBossChecks();
    showToast('🗑 Чек удалён');
};

function renderBossPurchases() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    container.innerHTML = '<div class="card">Закупки в разработке</div>';
}

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

function initDragDrop() {
    var blocks = document.querySelectorAll('.work-block');
    for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        b.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', JSON.stringify({ objectId: parseInt(this.dataset.objectId), workIndex: parseInt(this.dataset.workIndex) }));
            this.classList.add('dragging');
        });
        b.addEventListener('dragend', function() { this.classList.remove('dragging'); });
        b.addEventListener('dragover', function(e) { e.preventDefault(); });
        b.addEventListener('drop', function(e) {
            e.preventDefault();
            var data = JSON.parse(e.dataTransfer.getData('text/plain'));
            var obj = getObject(data.objectId);
            if (!obj) return;
            var toIndex = parseInt(this.dataset.workIndex);
            var works = obj.works;
            var removed = works.splice(data.workIndex, 1);
            works.splice(toIndex, 0, removed[0]);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('objects', obj);
            renderBossObjects();
        });
    }
}

function toggleWork(e, h, k) {
    if (e) e.stopPropagation();
    var block = h.closest('.work-block');
    if (!block) return;
    var detail = block.querySelector('.work-detail');
    var arrow = block.querySelector('.work-arrow');
    if (!detail) return;
    var isOpen = detail.classList.contains('open');
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
}

function toggleObject(h, k) {
    var d = h.parentElement.querySelector('.object-detail');
    var a = h.querySelector('.arrow');
    if (!d) return;
    var isOpen = d.classList.contains('open');
    if (isOpen) {
        d.classList.remove('open');
        if (a) a.classList.remove('open');
        uiState[k] = false;
    } else {
        d.classList.add('open');
        if (a) a.classList.add('open');
        uiState[k] = true;
    }
    saveUiState();
}

function showModal(src) {
    var m = document.getElementById('modal');
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

function scrollToObject(v) {
    if (!v) return;
    var el = document.getElementById(v);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var key = v.replace('obj-', '');
        uiState['obj-' + key] = true;
        saveUiState();
        renderBossObjects();
    }
}

window.wolfScrollToObject = function(v) {
    if (!v) return;
    var el = document.getElementById(v);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var key = v.replace('wolf-', '');
        uiState['wolf-' + key] = true;
        saveUiState();
        renderWolfObjects();
    }
};

// ============================================================
// ЗАПУСК
// ============================================================
loadPendingActions();
loadDataFromLocal();
render();
console.log('✅ СТРОЙУЧЁТ ЗАПУЩЕН');
console.log('🔑 Пароль по умолчанию: 30986');
</script>
</body>
</html>
