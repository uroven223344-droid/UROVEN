// ============================================================
// СТРОЙУЧЁТ — ОФЛАЙН-СИНХРОНИЗАЦИЯ (БЕЗ СПРАВОЧНИКА ID)
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// ============================================================
// ОЧЕРЕДЬ ОТЛОЖЕННЫХ ДЕЙСТВИЙ
// ============================================================
let pendingActions = [];

function loadPendingActions() {
    try {
        const data = localStorage.getItem('pendingActions');
        if (data) pendingActions = JSON.parse(data);
    } catch (e) { pendingActions = []; }
}

function savePendingActions() {
    try {
        localStorage.setItem('pendingActions', JSON.stringify(pendingActions));
        updatePendingStatus();
    } catch (e) {}
}

function addPendingAction(action) {
    pendingActions.push({
        id: Date.now() + Math.random() * 1000,
        ...action,
        timestamp: new Date().toISOString()
    });
    savePendingActions();
}

function updatePendingStatus() {
    const statusEl = document.getElementById('pendingStatus');
    if (!statusEl) return;
    const count = pendingActions.length;
    if (count === 0) {
        statusEl.innerHTML = '✅ Все данные синхронизированы';
        statusEl.style.color = '#4caf50';
    } else {
        statusEl.innerHTML = `⏳ Ожидают синхронизации: ${count} действий`;
        statusEl.style.color = '#c9a959';
    }
}

// ============================================================
// ПРОВЕРКА ИНТЕРНЕТА И СИНХРОНИЗАЦИЯ
// ============================================================
function isOnline() {
    return navigator.onLine;
}

async function syncPendingActions() {
    if (!isOnline()) {
        console.log('⚠️ Нет интернета, синхронизация отложена');
        return;
    }
    if (pendingActions.length === 0) {
        console.log('✅ Нет отложенных действий');
        return;
    }

    console.log(`🔄 Синхронизация ${pendingActions.length} действий...`);
    showToast(`⏳ Синхронизация ${pendingActions.length} действий...`);

    let synced = 0;
    let failed = [];

    for (const action of pendingActions) {
        try {
            switch (action.type) {
                case 'addObject':
                    await syncAddObject(action.data);
                    break;
                case 'updateObject':
                    await syncUpdateObject(action.data);
                    break;
                case 'deleteObject':
                    await syncDeleteObject(action.data);
                    break;
                case 'addWork':
                    await syncAddWork(action.data);
                    break;
                case 'updateWork':
                    await syncUpdateWork(action.data);
                    break;
                case 'deleteWork':
                    await syncDeleteWork(action.data);
                    break;
                case 'uploadPhoto':
                    await syncUploadPhoto(action.data);
                    break;
                case 'deletePhoto':
                    await syncDeletePhoto(action.data);
                    break;
                case 'addCheck':
                    await syncAddCheck(action.data);
                    break;
                case 'updateCheck':
                    await syncUpdateCheck(action.data);
                    break;
                case 'deleteCheck':
                    await syncDeleteCheck(action.data);
                    break;
                case 'addRecommendation':
                    await syncAddRecommendation(action.data);
                    break;
                case 'updateRecommendation':
                    await syncUpdateRecommendation(action.data);
                    break;
                case 'deleteRecommendation':
                    await syncDeleteRecommendation(action.data);
                    break;
                case 'addNote':
                    await syncAddNote(action.data);
                    break;
                case 'deleteNote':
                    await syncDeleteNote(action.data);
                    break;
                default:
                    console.warn('Неизвестное действие:', action.type);
                    failed.push(action);
                    continue;
            }
            synced++;
        } catch (e) {
            console.error('❌ Ошибка синхронизации действия:', action, e);
            failed.push(action);
        }
    }

    pendingActions = pendingActions.filter(a => failed.includes(a));
    savePendingActions();

    if (failed.length === 0) {
        showToast(`✅ Синхронизировано ${synced} действий`);
    } else {
        showToast(`⚠️ Синхронизировано ${synced}, ошибок: ${failed.length}`);
    }

    render();
}

// ============================================================
// ФУНКЦИИ СИНХРОНИЗАЦИИ
// ============================================================
async function syncAddObject(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to sync object');
}

async function syncUpdateObject(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update object');
}

async function syncDeleteObject(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete object');
}

async function syncAddWork(data) {
    const obj = objects.find(o => o.id === data.objectId);
    if (!obj) throw new Error('Object not found');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.objectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(obj)
    });
    if (!response.ok) throw new Error('Failed to add work');
}

async function syncUpdateWork(data) {
    const obj = objects.find(o => o.id === data.objectId);
    if (!obj) throw new Error('Object not found');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.objectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(obj)
    });
    if (!response.ok) throw new Error('Failed to update work');
}

async function syncDeleteWork(data) {
    const obj = objects.find(o => o.id === data.objectId);
    if (!obj) throw new Error('Object not found');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.objectId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(obj)
    });
    if (!response.ok) throw new Error('Failed to delete work');
}

async function syncUploadPhoto(data) {
    const compressed = await compressImageFromBase64(data.base64);
    const publicUrl = await uploadPhotoToStorage(data.objectId, data.workId, compressed);
    if (!publicUrl) throw new Error('Failed to upload photo');
    await fetch(`${SUPABASE_URL}/rest/v1/reports`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
            id: data.reportId,
            object_id: data.objectId,
            work_id: data.workId,
            photos: [publicUrl],
            text: '',
            date: new Date().toISOString(),
            approved: true
        })
    });
}

async function compressImageFromBase64(base64) {
    return base64;
}

async function syncDeletePhoto(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${data.reportId}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete photo');
}

async function syncAddCheck(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/checks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add check');
}

async function syncUpdateCheck(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/checks?id=eq.${data.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update check');
}

async function syncDeleteCheck(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/checks?id=eq.${data.id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete check');
}

async function syncAddRecommendation(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/recommendations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add recommendation');
}

async function syncUpdateRecommendation(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/recommendations?id=eq.${data.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update recommendation');
}

async function syncDeleteRecommendation(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/recommendations?id=eq.${data.id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete recommendation');
}

async function syncAddNote(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to add note');
}

async function syncDeleteNote(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notes?id=eq.${data.id}`, {
        method: 'DELETE',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete note');
}

// ============================================================
// ФУНКЦИЯ КОМПРЕССИИ ФОТО
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
            return null;
        }

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${fileName}`;
        console.log('✅ Фото загружено:', publicUrl);
        return publicUrl;
    } catch (e) {
        console.error('❌ Ошибка uploadPhotoToStorage:', e);
        return null;
    }
}

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
// ИНДИКАТОР СТАТУСА СИНХРОНИЗАЦИИ
// ============================================================
function renderPendingStatus() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    const statusDiv = document.createElement('div');
    statusDiv.id = 'pendingStatus';
    statusDiv.style.cssText = 'padding:8px 12px;margin-bottom:12px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;text-align:center;';
    const count = pendingActions.length;
    if (count === 0) {
        statusDiv.innerHTML = '✅ Все данные синхронизированы';
        statusDiv.style.color = '#4caf50';
    } else {
        statusDiv.innerHTML = `⏳ Ожидают синхронизации: ${count} действий <button class="btn btn-sm" onclick="syncPendingActions()" style="margin-left:12px;">Синхронизировать сейчас</button>`;
        statusDiv.style.color = '#c9a959';
    }
    container.prepend(statusDiv);
}

// ============================================================
// ОБНОВЛЁННЫЕ ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ И ЭТАПАМИ
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
    const newObj = { id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: !1, archived: !1 };
    objects.push(newObj);
    passwords.objects[id] = pwd;
    saveDataToLocal();
    
    if (!isOnline()) {
        addPendingAction({ type: 'addObject', data: newObj });
        showToast('📦 Объект сохранён локально (ожидает интернет)');
    } else {
        syncAddObject(newObj).then(() => {
            showToast('✅ Объект создан и синхронизирован');
        }).catch(() => {
            addPendingAction({ type: 'addObject', data: newObj });
            showToast('⚠️ Объект сохранён локально, будет синхронизирован позже');
        });
    }
    renderBossObjects();
};

window.addWork = function(id) {
    const n = prompt('Название этапа');
    if (n) {
        const o = getObject(id);
        if (o) {
            const newWork = { id: Date.now(), name: n, done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !0 };
            o.works.push(newWork);
            saveDataToLocal();
            
            if (!isOnline()) {
                addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
                showToast('📦 Этап сохранён локально (ожидает интернет)');
            } else {
                syncAddWork({ objectId: id, work: newWork }).then(() => {
                    showToast('➕ Этап добавлен и синхронизирован');
                }).catch(() => {
                    addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
                    showToast('⚠️ Этап сохранён локально');
                });
            }
            renderBossObjects();
        }
    }
};

window.toggleWorkStatus = function(id, wi) {
    const o = getObject(id);
    if (o) {
        o.works[wi].done = !o.works[wi].done;
        saveDataToLocal();
        
        if (!isOnline()) {
            addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
        } else {
            syncUpdateWork({ objectId: id, work: o.works[wi] }).catch(() => {
                addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
            });
        }
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
            
            if (!isOnline()) {
                addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
            } else {
                syncUpdateWork({ objectId: id, work: o.works[wi] }).catch(() => {
                    addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
                });
            }
            renderBossObjects();
            showToast('📅 Срок установлен');
        }
    }
};

window.deleteWorkPhoto = function(id) {
    if (confirm('Удалить фото?')) {
        const report = reports.find(r => r.id === id);
        if (report) {
            reports = reports.filter(r => r.id !== id);
            saveDataToLocal();
            
            if (!isOnline()) {
                addPendingAction({ type: 'deletePhoto', data: { reportId: id } });
            } else {
                syncDeletePhoto({ reportId: id }).catch(() => {
                    addPendingAction({ type: 'deletePhoto', data: { reportId: id } });
                });
            }
            renderBossObjects();
            showToast('🗑 Фото удалено');
        }
    }
};

window.deleteObjectPermanently = function(id) {
    if (confirm('Удалить объект без возможности восстановления?')) {
        const obj = objects.find(o => o.id === id);
        if (obj) {
            objects = objects.filter(o => o.id !== id);
            reports = reports.filter(r => r.objectId !== id);
            designProjects = designProjects.filter(p => p.objectId !== id);
            recommendations = recommendations.filter(r => r.objectId !== id);
            purchaseOrders = purchaseOrders.filter(o => o.objectId !== id);
            checks = checks.filter(c => c.objectId !== id);
            electricianTasks = electricianTasks.filter(t => t.objectId !== id);
            saveDataToLocal();
            
            if (!isOnline()) {
                addPendingAction({ type: 'deleteObject', data: { id: id } });
            } else {
                syncDeleteObject({ id: id }).catch(() => {
                    addPendingAction({ type: 'deleteObject', data: { id: id } });
                });
            }
            renderBossObjects();
            showToast('🗑 Объект удалён');
        }
    }
};

window.toggleElectrician = function(objId, idx) {
    const obj = getObject(objId);
    if (obj) {
        const work = obj.works[idx];
        if (work) {
            work.forElectrician = !work.forElectrician;
            saveDataToLocal();
            
            if (!isOnline()) {
                addPendingAction({ type: 'updateWork', data: { objectId: objId, work: work } });
            } else {
                syncUpdateWork({ objectId: objId, work: work }).catch(() => {
                    addPendingAction({ type: 'updateWork', data: { objectId: objId, work: work } });
                });
            }
            renderBossObjects();
            showToast(work.forElectrician ? '✅ Этап назначен электрику' : '❌ Назначение электрику снято');
        }
    }
};

window.moveWorkUp = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const works = obj.works;
    if (idx <= 0) return;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: obj });
    } else {
        syncUpdateObject(obj).catch(() => {
            addPendingAction({ type: 'updateObject', data: obj });
        });
    }
    renderBossObjects();
};

window.moveWorkDown = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const works = obj.works;
    if (idx >= works.length - 1) return;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    if (!isOnline()) {
        addPendingAction({ type: 'updateObject', data: obj });
    } else {
        syncUpdateObject(obj).catch(() => {
            addPendingAction({ type: 'updateObject', data: obj });
        });
    }
    renderBossObjects();
};

window.completeObject = function(id) {
    const o = getObject(id);
    if (o) {
        o.completed = !o.completed;
        saveDataToLocal();
        if (!isOnline()) {
            addPendingAction({ type: 'updateObject', data: o });
        } else {
            syncUpdateObject(o).catch(() => {
                addPendingAction({ type: 'updateObject', data: o });
            });
        }
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
            if (!isOnline()) {
                addPendingAction({ type: 'updateObject', data: o });
            } else {
                syncUpdateObject(o).catch(() => {
                    addPendingAction({ type: 'updateObject', data: o });
                });
            }
            renderBossObjects();
            showToast('📦 Объект в архиве');
        }
    }
};

window.unarchiveObject = function(id) {
    const o = getObject(id);
    if (o) {
        o.archived = false;
        saveDataToLocal();
        if (!isOnline()) {
            addPendingAction({ type: 'updateObject', data: o });
        } else {
            syncUpdateObject(o).catch(() => {
                addPendingAction({ type: 'updateObject', data: o });
            });
        }
        renderBossObjects();
        showToast('Объект возвращён из архива');
    }
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
        if (!isOnline()) {
            addPendingAction({ type: 'deleteWork', data: { objectId: objId, workId: work.id } });
        } else {
            syncDeleteWork({ objectId: objId, workId: work.id }).catch(() => {
                addPendingAction({ type: 'deleteWork', data: { objectId: objId, workId: work.id } });
            });
        }
        renderBossObjects();
        showToast('🗑 Этап удалён');
    }
};

// ============================================================
// ЗАГРУЗКА ФОТО (ОБНОВЛЁННАЯ С ОФЛАЙН-СИНХРОНИЗАЦИЕЙ)
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
        showToast('⏳ Обработка фото...');

        let uploadedCount = 0;

        for (let f of files) {
            try {
                console.log('📸 Обработка файла:', f.name);
                const compressed = await compressImage(f);
                
                if (!isOnline()) {
                    const reportId = Date.now() + Math.random() * 1000;
                    reports.push({
                        id: reportId,
                        objectId: id,
                        workId: work.id,
                        photos: [compressed],
                        text: '',
                        date: new Date(),
                        approved: true
                    });
                    saveDataToLocal();
                    addPendingAction({
                        type: 'uploadPhoto',
                        data: {
                            objectId: id,
                            workId: work.id,
                            reportId: reportId,
                            base64: compressed
                        }
                    });
                    showToast('📸 Фото сохранено локально (ожидает интернет)');
                    uploadedCount++;
                } else {
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
                        saveDataToLocal();
                        uploadedCount++;
                        showToast('📸 Фото загружено в облако');
                    }
                }
            } catch (err) {
                console.error('❌ Ошибка при загрузке файла:', err);
                showToast('❌ Ошибка загрузки: ' + f.name);
            }
        }

        if (uploadedCount > 0) {
            saveDataToLocal();
            renderBossObjects();
            showToast('📸 Загружено ' + uploadedCount + ' фото' + (!isOnline() ? ' (ожидают интернет)' : ''));
        } else {
            showToast('❌ Не удалось загрузить фото');
        }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

// ============================================================
// ДИЗАЙН-ПРОЕКТЫ
// ============================================================
window.addDesignProjectForObject = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const title = prompt('Название проекта:');
    if (!title) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = !0;
    inp.accept = '*/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = function(e) {
        const files = e.target.files;
        let data = [];
        if (!files.length) { createDesignProject(obj.id, title, []); inp.remove(); return; }
        const readers = [];
        for (let f of files) {
            const r = new FileReader();
            readers.push(new Promise(res => {
                r.onload = function(ev) { data.push(ev.target.result);
                    res(); };
                r.readAsDataURL(f);
            }));
        }
        Promise.all(readers).then(() => { createDesignProject(obj.id, title, data);
            inp.remove(); });
    };
    setTimeout(() => inp.click(), 50);
};

function createDesignProject(objId, title, files) {
    designProjects.push({ id: Date.now(), objectId: objId, title, files, roles: ['boss', 'wolf', 'client', 'electrician'], comments: [], approvedByClient: !1 });
    saveDataToLocal();
    renderBossObjects();
    showToast('📐 Дизайн-проект создан');
}

window.deleteDesign = function(id) {
    if (confirm('Удалить проект?')) {
        designProjects = designProjects.filter(p => p.id !== id);
        saveDataToLocal();
        renderBossObjects();
        showToast('🗑 Проект удалён');
    }
};

window.deleteDesignFile = function(pid, fi) {
    if (confirm('Удалить файл?')) {
        const p = designProjects.find(x => x.id === pid);
        if (p) {
            p.files.splice(fi, 1);
            saveDataToLocal();
            renderBossObjects();
            showToast('🗑 Файл удалён');
        }
    }
};

window.addDesignComment = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (!p) return;
    const t = prompt('Комментарий:');
    if (t) {
        if (!p.comments) p.comments = [];
        p.comments.push({ author: 'Руководитель', text: t, date: new Date() });
        saveDataToLocal();
        renderBossObjects();
        showToast('💬 Комментарий добавлен');
    }
};

window.toggleDesignApprove = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (p) {
        p.approvedByClient = !p.approvedByClient;
        saveDataToLocal();
        renderBossObjects();
        showToast(p.approvedByClient ? '✅ Проект утверждён' : '⏳ Утверждение снято');
    }
};

// ============================================================
// РЕКОМЕНДАЦИИ
// ============================================================
window.addRecommendationForObject = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const text = prompt('Текст рекомендации:');
    if (text === null || text.trim() === '') return;
    const deadline = prompt('Срок (ГГГГ-ММ-ДД) или оставьте пустым:');
    if (deadline !== null && deadline.trim() !== '' && !isValidDate(deadline.trim())) { showToast('Неверный формат даты'); return; }
    recommendations.push({ id: Date.now(), objectId: objId, text: text.trim(), deadline: deadline ? deadline.trim() : null, photos: [], purchased: !1, purchasedDate: null, purchasedPhotos: [] });
    saveDataToLocal();
    renderBossObjects();
    showToast('📋 Рекомендация добавлена');
};

window.deleteRecommend = function(id) {
    if (confirm('Удалить рекомендацию?')) {
        recommendations = recommendations.filter(r => r.id !== id);
        saveDataToLocal();
        renderBossObjects();
        showToast('🗑 Рекомендация удалена');
    }
};

window.markPurchased = function(id) {
    const r = recommendations.find(x => x.id === id);
    if (r) {
        r.purchased = !r.purchased;
        if (r.purchased) r.purchasedDate = new Date().toISOString().slice(0, 10);
        else r.purchasedDate = null;
        saveDataToLocal();
        renderBossObjects();
        showToast(r.purchased ? '✅ Отмечено куплено' : '↩ Отмена покупки');
    }
};

window.addRecommendationPhoto = async function(id) {
    const r = recommendations.find(x => x.id === id);
    if (!r) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            const compressed = await compressImage(file);
            if (!isOnline()) {
                if (!r.photos) r.photos = [];
                r.photos.push(compressed);
                addPendingAction({
                    type: 'uploadPhoto',
                    data: {
                        objectId: r.objectId,
                        workId: Date.now(),
                        reportId: Date.now(),
                        base64: compressed
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.photos) r.photos = [];
                    r.photos.push(publicUrl);
                }
            }
            saveDataToLocal();
            renderBossObjects();
        } catch (err) { console.error('Error:', err);
            showToast('❌ Ошибка загрузки фото'); }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

window.addPurchasedPhoto = async function(id) {
    const r = recommendations.find(x => x.id === id);
    if (!r) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            const compressed = await compressImage(file);
            if (!isOnline()) {
                if (!r.purchasedPhotos) r.purchasedPhotos = [];
                r.purchasedPhotos.push(compressed);
                addPendingAction({
                    type: 'uploadPhoto',
                    data: {
                        objectId: r.objectId,
                        workId: Date.now(),
                        reportId: Date.now(),
                        base64: compressed
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.purchasedPhotos) r.purchasedPhotos = [];
                    r.purchasedPhotos.push(publicUrl);
                }
            }
            saveDataToLocal();
            renderBossObjects();
        } catch (err) { console.error('Error:', err);
            showToast('❌ Ошибка загрузки фото'); }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

window.deleteRecommendPhoto = function(id, idx, type) {
    if (confirm('Удалить фото?')) {
        const r = recommendations.find(x => x.id === id);
        if (r) {
            if (type === 'photos') r.photos.splice(idx, 1);
            else if (type === 'purchasedPhotos') r.purchasedPhotos.splice(idx, 1);
            saveDataToLocal();
            renderBossObjects();
            showToast('🗑 Фото удалено');
        }
    }
};

// ============================================================
// ЗАМЕТКИ
// ============================================================
function renderBossNotes() {
    const container = document.getElementById('bossContent');
    container.innerHTML = `<div class="flex"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="bossNotesCalendar"></div>`;
    renderNotesCalendar('boss');
}

function renderNotesCalendar(role) {
    const container = document.getElementById(role === 'boss' ? 'bossNotesCalendar' : 'wolfNotesCalendar');
    if (!container) return;
    const now = new Date();
    const year = now.getFullYear(),
        month = now.getMonth() + calendarOffset;
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDayOfMonth.getDay();
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
    let html = `<div class="card"><div class="month-nav"><button class="nav-btn" onclick="changeMonth(-1)">‹</button><span>${firstDayOfMonth.toLocaleString('ru', { month: 'long', year: 'numeric' })}</span><button class="nav-btn" onclick="changeMonth(1)">›</button></div><div class="calendar">`;
    for (let i = 0; i < startDay; i++) { html += `<div class="day other-month"></div>`; }
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, month, d);
        const key = dt.getFullYear() + '-' + (dt.getMonth() + 1).toString().padStart(2, '0') + '-' + dt.getDate().toString().padStart(2, '0');
        const hasNotes = notesByDate[key] && notesByDate[key].length;
        const isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        html += `<div class="day ${isToday ? 'today' : ''} ${hasNotes ? 'has-tasks' : ''}" onclick="showNotesForDay('${key}','${role}')"><span class="day-number">${d}</span>${hasNotes ? '<span class="indicator">●</span>' : ''}</div>`;
    }
    html += `</div></div><div id="${role}NotesDayDetail"></div>`;
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
        if (!n.date || n.author !== role) return !1;
        const d = new Date(n.date);
        return d.getFullYear() + '-' + (d.getMonth() + 1).toString().padStart(2, '0') + '-' + d.getDate().toString().padStart(2, '0') === key;
    });
    if (!dayNotes.length) { container.innerHTML = `<div class="card">Нет записей. <button class="btn btn-sm btn-primary" onclick="addNoteForDate('${key}')">➕ Добавить</button></div>`; return; }
    container.innerHTML = `<div class="card"><h4>Записи на ${new Date(key).toLocaleDateString()}</h4>${dayNotes.map(n => `<div class="flex"><span>${escapeHtml(n.text)}</span><span><span class="badge">${n.author === 'boss' ? 'Руководитель' : 'Волк'}</span><button class="btn btn-sm btn-danger" onclick="deleteNote(${n.id})">🗑</button></span></div>`).join('')}<button class="btn btn-sm btn-primary" onclick="addNoteForDate('${key}')">➕ Добавить запись на этот день</button></div>`;
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
    notes.push({ id: Date.now(), author: currentUser, text, date: noteDate });
    saveDataToLocal();
    if (currentUser === 'boss') renderBossNotes();
    else if (currentUser === 'wolf') renderWolfNotes();
    showToast('📝 Заметка добавлена');
};

window.deleteNote = function(id) {
    if (confirm('Удалить заметку?')) {
        notes = notes.filter(n => n.id !== id);
        saveDataToLocal();
        if (currentUser === 'boss') renderBossNotes();
        else renderWolfNotes();
        showToast('🗑 Заметка удалена');
    }
};

// ============================================================
// ЧЕКИ
// ============================================================
let checkFilterObjectId = 'all';

function renderBossChecks() {
    const container = document.getElementById('bossContent');
    const available = objects.filter(o => !o.archived);
    let selectHtml = `<select id="checkObjectFilter" onchange="updateCheckFilter(this.value)"><option value="all" ${checkFilterObjectId === 'all' ? 'selected' : ''}>Все объекты</option>${available.map(o => `<option value="${o.id}" ${checkFilterObjectId == o.id ? 'selected' : ''}>${escapeHtml(o.name)}</option>`).join('')}</select>`;
    container.innerHTML = `<div class="flex"><button class="btn btn-primary" onclick="addCheck()">➕ Загрузить чек</button>${selectHtml}<div class="flex-center"><span class="badge">Фильтр:</span><button class="btn btn-sm" onclick="renderBossChecksFilter('all')">Все</button><button class="btn btn-sm" onclick="renderBossChecksFilter('unpaid')">Неоплаченные</button><button class="btn btn-sm" onclick="renderBossChecksFilter('paid')">Оплаченные</button></div></div><div id="bossChecksList"></div>`;
    renderChecksList('boss', 'all');
}

window.updateCheckFilter = function(val) { checkFilterObjectId = val;
    renderBossChecks(); };

function renderBossChecksFilter(f) { renderChecksList('boss', f); }

function renderChecksList(role, filter) {
    const container = document.getElementById(role === 'boss' ? 'bossChecksList' : (role === 'wolf' ? 'wolfChecksList' : 'clientChecksList'));
    if (!container) return;
    let objFilter = checkFilterObjectId;
    if (role === 'client') objFilter = currentObjectId;
    let list = checks.slice();
    if (objFilter !== 'all') list = list.filter(c => c.objectId == objFilter);
    if (filter === 'paid') list = list.filter(c => c.paid);
    else if (filter === 'unpaid') list = list.filter(c => !c.paid);
    if (role === 'client') list = list.filter(c => c.objectId === currentObjectId);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalUnpaid = list.filter(c => !c.paid).reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPaid = list.filter(c => c.paid).reduce((sum, c) => sum + (c.amount || 0), 0);
    let html = '';
    if (role === 'boss') html += `<div class="checks-total"><span>💰 Неоплаченные: ${totalUnpaid.toFixed(2)} ₽</span><span>✅ Оплаченные: ${totalPaid.toFixed(2)} ₽</span></div>`;
    else if (role === 'wolf') html += `<div class="checks-total"><span>💰 Неоплаченные: ${totalUnpaid.toFixed(2)} ₽</span></div>`;
    else if (role === 'client') html += `<div class="checks-total"><span>💰 Неоплаченные: ${totalUnpaid.toFixed(2)} ₽</span></div>`;
    if (!list.length) { container.innerHTML = html + '<div class="card">Нет чеков</div>'; return; }
    container.innerHTML = html + list.map(c => {
        const obj = getObject(c.objectId);
        const paidStatus = c.paid ? '✅ Оплачен' : '⏳ Не оплачен';
        const paidInfo = c.paid ? ` (${c.paidBy === 'client' ? 'клиентом' : 'руководителем'}, ${fmtTime(c.paidDate)})` : '';
        return `<div class="check-item ${c.paid ? 'paid' : ''}" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;">
      <div class="flex"><span><b>${obj ? escapeHtml(obj.name) : 'Объект удалён'}</b> — ${c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана'}</span><span class="badge">${paidStatus}${paidInfo}</span></div>
      <div style="margin:4px 0;">Дата: ${fmtTime(c.date)}</div>
      ${c.fileData ? `<div><img src="${c.fileData}" class="check-file" onclick="showModal('${c.fileData}')"></div>` : ''}
      <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
        ${!c.paid && role === 'boss' ? `<button class="btn btn-sm btn-primary" onclick="markCheckPaid(${c.id})">✅ Отметить оплату</button>` : ''}
        ${role === 'boss' ? `<button class="btn btn-sm btn-danger" onclick="deleteCheck(${c.id})">🗑</button>` : ''}
      </div>
    </div>`;
    }).join('');
}

window.addCheck = function() {
    if (currentUser === 'client') { showToast('Клиент не может добавлять чеки'); return; }
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000';
    modal.innerHTML = `<div style="background:#1a1a1a;padding:20px;border-radius:12px;max-width:400px;width:90%;"><h3 style="color:#e0e0e0;margin-bottom:12px;">Выберите объект</h3><select id="checkObjectSelect" style="width:100%;padding:10px;border-radius:8px;background:#222;color:#e0e0e0;border:1px solid #333;font-size:16px;">${available.map(o => `<option value="${o.id}">${escapeHtml(o.name)} (${escapeHtml(o.code)})</option>`).join('')}</select><div style="margin-top:16px;display:flex;gap:10px;justify-content:flex-end;"><button class="btn" onclick="this.closest('div[style]').parentElement.remove()">Отмена</button><button class="btn btn-primary" id="confirmCheckObject">Выбрать</button></div></div>`;
    document.body.appendChild(modal);
    modal.querySelector('#confirmCheckObject').onclick = function() {
        const select = modal.querySelector('#checkObjectSelect');
        const objId = parseInt(select.value);
        modal.remove();
        proceedWithCheck(objId);
    };
};

function proceedWithCheck(objId) {
    const amount = parseFloat(prompt('Введите сумму (руб):') || '0');
    if (isNaN(amount) || amount <= 0) { showToast('Введите корректную сумму'); return; }
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*,application/pdf';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            let fileData;
            if (file.type.startsWith('image/')) {
                const compressed = await compressImage(file);
                if (!isOnline()) {
                    fileData = compressed;
                    addPendingAction({
                        type: 'addCheck',
                        data: {
                            id: Date.now(),
                            objectId: objId,
                            amount: amount,
                            fileData: compressed,
                            date: new Date(),
                            paid: false,
                            paidDate: null,
                            paidBy: null
                        }
                    });
                    showToast('🧾 Чек сохранён локально (ожидает интернет)');
                } else {
                    const publicUrl = await uploadPhotoToStorage(objId, Date.now(), compressed);
                    fileData = publicUrl;
                }
            } else {
                const reader = new FileReader();
                fileData = await new Promise(res => { reader.onload = function(ev) { res(ev.target.result); }; reader.readAsDataURL(file); });
            }
            if (fileData) {
                checks.push({ id: Date.now(), objectId: objId, amount, fileData, date: new Date(), paid: !1, paidDate: null, paidBy: null });
                saveDataToLocal();
                showToast('🧾 Чек загружен' + (!isOnline() ? ' (ожидает интернет)' : ''));
                if (currentUser === 'boss') renderBossChecks();
                else if (currentUser === 'wolf') renderWolfChecks();
                else if (currentUser === 'client') renderClientChecks();
            }
        } catch (err) { console.error('Error:', err);
            showToast('❌ Ошибка загрузки чека'); }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
}

window.markCheckPaid = function(checkId) {
    const c = checks.find(ch => ch.id === checkId);
    if (!c || c.paid) return;
    c.paid = !0;
    c.paidDate = new Date();
    c.paidBy = currentUser;
    saveDataToLocal();
    if (currentUser === 'boss') renderBossChecks();
    else if (currentUser === 'wolf') renderWolfChecks();
    else if (currentUser === 'client') renderClientChecks();
    showToast('✅ Чек оплачен');
};

window.deleteCheck = function(checkId) {
    if (confirm('Удалить чек?')) {
        checks = checks.filter(c => c.id !== checkId);
        saveDataToLocal();
        if (currentUser === 'boss') renderBossChecks();
        else if (currentUser === 'wolf') renderWolfChecks();
        showToast('🗑 Чек удалён');
    }
};

// ============================================================
// ПАРОЛИ
// ============================================================
function renderPasswords() {
    const container = document.getElementById('bossContent');
    container.innerHTML = `<div class="card"><h3>Пароли для ролей</h3><p style="color:#888;font-size:13px;">Если пароль пустой — вход без пароля.</p>${['boss', 'wolf', 'client', 'master', 'designer', 'purchaser', 'electrician'].map(r => `<div class="flex"><span>${getUserLabel(r)}</span><span><input type="text" id="pass-${r}" placeholder="Новый пароль" value="${passwords[r] || ''}" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setRolePassword('${r}')">Установить</button></span></div>`).join('')}</div><div class="card"><h3>Пароли объектов</h3><p style="color:#888;font-size:13px;">Клиенты и мастера входят по паролю объекта.</p>${objects.map(o => `<div class="flex"><span>${escapeHtml(o.name)} (код: ${escapeHtml(o.code)})</span><span><input type="text" id="pass-obj-${o.id}" placeholder="Пароль для входа" value="${passwords.objects[o.id] || ''}" style="width:200px;"><button class="btn btn-sm btn-primary" onclick="setObjectPassword(${o.id})">Установить</button></span></div>`).join('')}</div><div class="card"><button class="btn btn-sm" onclick="savePasswords()">Сохранить пароли</button></div>`;
}

window.setRolePassword = function(r) {
    const val = document.getElementById('pass-' + r).value.trim();
    if (val) passwords[r] = val;
    else delete passwords[r];
    saveDataToLocal();
    renderPasswords();
    showToast('🔑 Пароль для ' + getUserLabel(r) + ' установлен' + (val ? '' : ' (сброшен)'));
};

window.setObjectPassword = function(objId) {
    const val = document.getElementById('pass-obj-' + objId).value.trim();
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;
    if (val) {
        passwords.objects[objId] = val;
        showToast('🔑 Пароль для "' + obj.name + '" установлен на "' + val + '"');
    } else {
        const newPwd = Math.random().toString(36).substring(2, 8).toUpperCase();
        passwords.objects[objId] = newPwd;
        showToast('🔑 Пароль сброшен на: ' + newPwd);
        document.getElementById('pass-obj-' + objId).value = newPwd;
    }
    saveDataToLocal();
    renderPasswords();
};

window.savePasswords = function() {
    saveDataToLocal();
    showToast('🔐 Пароли сохранены');
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

    // Индикатор статуса синхронизации
    const statusHtml = `<div id="pendingStatus" style="padding:8px 12px;margin-bottom:12px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;text-align:center;color:${pendingActions.length === 0 ? '#4caf50' : '#c9a959'};">${pendingActions.length === 0 ? '✅ Все данные синхронизированы' : '⏳ Ожидают синхронизации: ' + pendingActions.length + ' действий'}</div>`;

    // Кнопки экспорта/импорта (без справочника ID)
    const toolsHtml = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:12px 0;padding:12px;background:#121212;border-radius:12px;border:1px solid #282828;">
      <button class="btn btn-primary" onclick="exportAllData()">📤 Экспорт всех данных</button>
      <button class="btn btn-primary" onclick="importAllData()">📥 Импорт данных</button>
      ${pendingActions.length > 0 ? `<button class="btn btn-primary" onclick="syncPendingActions()">🔄 Синхронизировать сейчас</button>` : ''}
    </div>
    <hr>
    `;

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

    container.innerHTML = statusHtml + toolsHtml + filterTabs + sel + list;
}

// ============================================================
// ЭКСПОРТ / ИМПОРТ
// ============================================================
window.exportAllData = function() {
    const data = {
        objects,
        reports,
        designProjects,
        recommendations,
        checks,
        purchaseOrders,
        notes,
        electricianTasks,
        passwords
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stroychet_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📤 Данные экспортированы');
};

window.importAllData = function() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            try {
                const data = JSON.parse(ev.target.result);
                if (data.objects) objects = data.objects;
                if (data.reports) reports = data.reports;
                if (data.designProjects) designProjects = data.designProjects;
                if (data.recommendations) recommendations = data.recommendations;
                if (data.checks) checks = data.checks;
                if (data.purchaseOrders) purchaseOrders = data.purchaseOrders;
                if (data.notes) notes = data.notes;
                if (data.electricianTasks) electricianTasks = data.electricianTasks;
                if (data.passwords) passwords = data.passwords;
                saveDataToLocal();
                render();
                showToast('✅ Данные успешно импортированы!');
            } catch (err) {
                showToast('❌ Ошибка: неверный формат файла');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    inp.click();
};

// ============================================================
// ЗАКУПКИ (ДЛЯ ВОЛКА)
// ============================================================
function renderWolfPurchases() {
    const container = document.getElementById('wolfContent');
    container.innerHTML = `<button class="btn btn-primary" onclick="addPurchaseOrder()">➕ Новая заявка</button><div id="wolfOrdersList"></div>`;
    const list = document.getElementById('wolfOrdersList');
    const orders = purchaseOrders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!orders.length) { list.innerHTML = '<div class="card">Нет заявок</div>'; return; }
    list.innerHTML = orders.map(order => {
        const obj = getObject(order.objectId);
        const items = order.items.map((item, idx) => `<div class="flex"><span>${escapeHtml(item.name)} (${escapeHtml(item.quantity)} шт.)</span><span class="badge">${item.purchased ? '✅ Куплено' : '⏳ Не куплено'}</span><button class="btn btn-sm" onclick="wolfTogglePurchasedItem(${order.id},${idx})">Отметить</button><button class="btn btn-sm btn-danger" onclick="wolfDeleteItemFromOrder(${order.id},${idx})">🗑</button></div>`).join('');
        return `<div class="card"><div class="flex"><b>Заявка на объект: ${obj ? escapeHtml(obj.name) : '—'}</b><span class="badge">${fmt(order.date)}</span><button class="btn btn-sm btn-danger" onclick="wolfDeleteOrder(${order.id})">🗑</button></div><div><b>Товары:</b> ${items}</div><div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;"><input type="text" id="wolfNewItemName-${order.id}" placeholder="Наименование" style="width:40%;"><input type="text" id="wolfNewItemQty-${order.id}" placeholder="Кол-во" style="width:20%;"><button class="btn btn-sm" onclick="wolfAddItemToOrder(${order.id})">➕ Добавить</button></div><div><b>Фото накладных:</b> ${order.photos ? order.photos.map(p => `<img src="${p}" style="width:50px;" onclick="showModal('${p}')">`).join('') : 'нет'}</div><button class="btn btn-sm" onclick="wolfUploadOrderPhoto(${order.id})">📸 Добавить фото</button></div>`;
    }).join('');
}

window.addPurchaseOrder = function() {
    const available = objects.filter(o => !o.archived);
    if (!available.length) { showToast('Нет объектов'); return; }
    const list = available.map((o, i) => `${i+1}. ${o.name} (${o.code})`).join('\n');
    const choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    const obj = available[idx];
    purchaseOrders.push({ id: Date.now(), objectId: obj.id, items: [], photos: [], date: new Date(), status: 'active' });
    saveDataToLocal();
    renderWolfPurchases();
    showToast('📦 Заявка создана');
};

window.wolfAddItemToOrder = function(orderId) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    const name = document.getElementById('wolfNewItemName-' + orderId).value.trim();
    const qty = document.getElementById('wolfNewItemQty-' + orderId).value.trim();
    if (!name) { showToast('Введите наименование'); return; }
    order.items.push({ id: Date.now(), name, quantity: qty || '1', purchased: !1 });
    saveDataToLocal();
    renderWolfPurchases();
    showToast('➕ Товар добавлен');
};

window.wolfTogglePurchasedItem = function(orderId, idx) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (order) {
        order.items[idx].purchased = !order.items[idx].purchased;
        saveDataToLocal();
        renderWolfPurchases();
        showToast(order.items[idx].purchased ? '✅ Отмечено куплено' : '↩ Снято');
    }
};

window.wolfDeleteItemFromOrder = function(orderId, idx) {
    if (confirm('Удалить товар?')) {
        const order = purchaseOrders.find(o => o.id === orderId);
        if (order) {
            order.items.splice(idx, 1);
            saveDataToLocal();
            renderWolfPurchases();
            showToast('🗑 Товар удалён');
        }
    }
};

window.wolfDeleteOrder = function(orderId) {
    if (confirm('Удалить заявку?')) {
        purchaseOrders = purchaseOrders.filter(o => o.id !== orderId);
        saveDataToLocal();
        renderWolfPurchases();
        showToast('🗑 Заявка удалена');
    }
};

window.wolfUploadOrderPhoto = async function(orderId) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (!order) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            const compressed = await compressImage(file);
            if (!isOnline()) {
                if (!order.photos) order.photos = [];
                order.photos.push(compressed);
                addPendingAction({
                    type: 'uploadPhoto',
                    data: {
                        objectId: order.objectId,
                        workId: Date.now(),
                        reportId: Date.now(),
                        base64: compressed
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(order.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!order.photos) order.photos = [];
                    order.photos.push(publicUrl);
                }
            }
            saveDataToLocal();
            renderWolfPurchases();
        } catch (err) { console.error('Error:', err);
            showToast('❌ Ошибка загрузки фото'); }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

// ============================================================
// ВОЛК
// ============================================================
function renderWolf() {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>🐺 Волк (инженер)</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
    </div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="notes">Ежедневник</div>
      <div class="tab" data-tab="purchases">Закупки</div>
      <div class="tab" data-tab="checks">Чеки</div>
    </div>
    <div id="wolfContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        switch (this.dataset.tab) {
            case 'objects':
                renderWolfObjects();
                break;
            case 'notes':
                renderWolfNotes();
                break;
            case 'purchases':
                renderWolfPurchases();
                break;
            case 'checks':
                renderWolfChecks();
                break;
        }
    });
    renderWolfObjects();
}

function renderWolfObjects() {
    const container = document.getElementById('wolfContent');
    const active = objects.filter(o => !o.archived);
    let sel = `<div class="flex" style="margin-bottom:16px;"><select class="object-selector" id="wolfObjectSelector" onchange="wolfScrollToObject(this.value)"><option value="">— Перейти к объекту —</option>${active.map(o => `<option value="wolf-obj-${o.id}">${escapeHtml(o.name)} (${escapeHtml(o.code)})</option>`).join('')}</select></div>`;
    let list = active.map(obj => {
        const objKey = 'wolf-obj-' + obj.id,
            objOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        const projs = designProjects.filter(p => p.objectId === obj.id);
        const designKey = 'wolf-design-' + obj.id,
            designOpen = uiState[designKey] !== undefined ? uiState[designKey] : false;
        let designBlocks = projs.length ? projs.map(p => {
            const roles = p.roles ? p.roles.map(r => getUserLabel(r)).join(', ') : 'все';
            const comments = (p.comments || []).map(c => `<div><b>${escapeHtml(c.author)}</b> ${escapeHtml(c.text)} <small style="color:#888;">${fmt(c.date)}</small></div>`).join('');
            const files = (p.files || []).map(f => {
                const isImg = f.startsWith('data:image/') || f.startsWith('http');
                return isImg ? `<img src="${f}" onclick="showModal('${f}')" style="max-width:100px;max-height:100px;">` : `<a href="${f}" target="_blank">📄</a>`;
            }).join(' ') || 'нет';
            return `<div class="design-block"><div class="design-header" onclick="toggleDesignBlock(this,'${designKey}')"><span><span class="design-title">${escapeHtml(p.title)}</span><span class="badge">${p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает'}</span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span></span></div><div class="design-detail ${designOpen ? 'open' : ''}"><div class="design-meta"><b>Доступ:</b> ${escapeHtml(roles)}</div><div class="design-files"><b>Файлы:</b> ${files}</div><div><b>Комментарии:</b> ${comments || 'нет'}</div></div></div>`;
        }).join('') : '<span style="color:#666;font-size:14px;">Нет проектов</span>';
        const recs = recommendations.filter(r => r.objectId === obj.id);
        const recKey = 'wolf-rec-' + obj.id,
            recOpen = uiState[recKey] !== undefined ? uiState[recKey] : false;
        let recBlocks = recs.length ? recs.map(r => {
            const status = r.purchased ? '✅ Куплено' : (r.purchasedDate ? '⏳ Ожидается до ' + fmt(r.purchasedDate) : '❌ Не куплено');
            const phRec = (r.photos || []).map(p => `<img src="${p}" style="width:60px;" onclick="showModal('${p}')">`).join('');
            const phPur = (r.purchasedPhotos || []).map(p => `<img src="${p}" style="width:60px;" onclick="showModal('${p}')">`).join('');
            return `<div class="rec-block"><div class="rec-header" onclick="toggleRecBlock(this,'${recKey}')"><span><span class="rec-title">📋 ${escapeHtml(r.text)}</span><span class="badge">${status}</span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span></span></div><div class="rec-detail ${recOpen ? 'open' : ''}"><div class="rec-body"><div class="rec-text"><div class="rec-meta"><b>Срок:</b> ${r.deadline ? fmt(r.deadline) : 'не указан'}</div></div><div class="rec-photos">${phRec}${phPur}</div></div></div></div>`;
        }).join('') : '<span style="color:#666;font-size:14px;">Нет рекомендаций</span>';
        const statusTabs = `<div class="flex" style="margin:8px 0;"><button class="btn btn-sm btn-primary" onclick="setWolfWorkFilter('${obj.id}','all')">Все</button><button class="btn btn-sm" onclick="setWolfWorkFilter('${obj.id}','done')">✅ Выполненные</button><button class="btn btn-sm" onclick="setWolfWorkFilter('${obj.id}','undone')">⏳ Не выполненные</button></div>`;
        if (!uiState['wolf-filter-' + obj.id]) uiState['wolf-filter-' + obj.id] = 'all';
        const currentFilter = uiState['wolf-filter-' + obj.id] || 'all';
        let filteredWorks = obj.works;
        if (currentFilter === 'done') filteredWorks = obj.works.filter(w => w.done === true);
        else if (currentFilter === 'undone') filteredWorks = obj.works.filter(w => w.done === false);
        const worksHtml = filteredWorks.map((w, wi) => {
            const originalIndex = obj.works.indexOf(w);
            const wKey = 'wolf-work-' + obj.id + '-' + wi;
            const wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
            const hasPhoto = photos.length > 0;
            const phHtml = photos.map(r => `<span class="pw"><img src="${r.photos[0]}" onclick="showModal('${r.photos[0]}')"><button class="del" onclick="deleteWorkPhoto(${r.id})">×</button><span class="status-badge">${r.approved ? '✅ одобр.' : '⏳ модер.'}</span></span>`).join('');
            return `<div class="work-block" draggable="true" data-object-id="${obj.id}" data-work-index="${originalIndex}" data-work-id="${w.id}"><div class="work-header" onclick="toggleWork(event, this, '${wKey}')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="drag-handle">⠿</span><span class="work-title">${escapeHtml(w.name)}</span>${w.quantity ? ` <span class="work-quantity">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''}<span class="work-status-check" onclick="event.stopPropagation();wolfToggleWorkStatus(${obj.id},${originalIndex})">${w.done ? '☑' : '☐'}</span>${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}<span class="photo-indicator ${hasPhoto ? 'has-photo' : ''}"></span><span class="work-arrow ${wOpen ? 'open' : ''}">▶</span></span><span style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;"><button class="icon-btn" onclick="event.stopPropagation();wolfUploadWorkPhoto(${obj.id},${originalIndex})">📸</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkUp(${obj.id},${originalIndex})">⬆</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkDown(${obj.id},${originalIndex})">⬇</button></span></div><div class="work-detail ${wOpen ? 'open' : ''}"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">${phHtml || 'Нет фото'}</div></div></div>`;
        }).join('');
        const addWorkButton = `<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="wolfAddWork(${obj.id})">➕ Добавить этап</button></div>`;
        return `<div class="card" id="wolf-obj-${obj.id}"><div class="object-header" onclick="toggleObject(this,'${objKey}')"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="font-weight:300;color:#888;">(${escapeHtml(obj.code)})</span><span class="arrow ${objOpen ? 'open' : ''}">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge">ID: ${obj.id}</span></div></div><div style="color:#999;font-size:14px;">📍 ${escapeHtml(obj.address)}</div></div><div class="object-detail ${objOpen ? 'open' : ''}"><hr><h4>Дизайн-проекты</h4><div class="design-block-container"><div class="design-block-header" onclick="toggleDesignBlockHeader(this,'${designKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span> Дизайн-проекты (${projs.length})</span></div><div class="design-detail-container ${designOpen ? 'open' : ''}" style="display:${designOpen ? 'block' : 'none'};">${designBlocks}</div></div><hr><h4>Рекомендации</h4><div class="rec-block-container"><div class="rec-block-header" onclick="toggleRecBlockHeader(this,'${recKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span> Рекомендации (${recs.length})</span></div><div class="rec-detail-container ${recOpen ? 'open' : ''}" style="display:${recOpen ? 'block' : 'none'};">${recBlocks}</div></div><hr><h4>Этапы работ</h4>${statusTabs}<div id="wolf-work-list-${obj.id}" class="work-list">${worksHtml || '<span style="color:#666;font-size:14px;">Нет этапов</span>'}</div>${addWorkButton}</div></div>`;
    }).join('');
    container.innerHTML = sel + list;
    setTimeout(() => initDragDrop(), 50);
}

window.setWolfWorkFilter = function(objId, filter) { uiState['wolf-filter-' + objId] = filter;
    saveUiState();
    renderWolfObjects(); };

window.wolfAddWork = function(id) {
    const n = prompt('Название этапа');
    if (n) {
        const o = getObject(id);
        if (o) {
            o.works.push({ id: Date.now(), name: n, done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !0 });
            saveDataToLocal();
            renderWolfObjects();
            showToast('➕ Этап добавлен (ручной)');
        }
    }
};

window.wolfToggleWorkStatus = function(id, wi) {
    const o = getObject(id);
    if (o) {
        o.works[wi].done = !o.works[wi].done;
        saveDataToLocal();
        renderWolfObjects();
    }
};

window.wolfMoveWorkUp = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx <= 0) return;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    renderWolfObjects(); };

window.wolfMoveWorkDown = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx >= works.length - 1) return;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    renderWolfObjects(); };

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
        let uploadedCount = 0;
        for (let f of files) {
            try {
                const compressed = await compressImage(f);
                if (!isOnline()) {
                    const reportId = Date.now() + Math.random() * 1000;
                    reports.push({
                        id: reportId,
                        objectId: id,
                        workId: work.id,
                        photos: [compressed],
                        text: '',
                        date: new Date(),
                        approved: true
                    });
                    saveDataToLocal();
                    addPendingAction({
                        type: 'uploadPhoto',
                        data: {
                            objectId: id,
                            workId: work.id,
                            reportId: reportId,
                            base64: compressed
                        }
                    });
                    showToast('📸 Фото сохранено локально (ожидает интернет)');
                    uploadedCount++;
                } else {
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
                }
            } catch (err) { console.error('Error:', err);
                showToast('❌ Ошибка загрузки фото'); }
        }
        if (uploadedCount > 0) {
            saveDataToLocal();
            renderWolfObjects();
            showToast('📸 Загружено ' + uploadedCount + ' фото' + (!isOnline() ? ' (ожидают интернет)' : ''));
        } else {
            showToast('❌ Не удалось загрузить фото');
        }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

window.wolfScrollToObject = function(v) {
    if (!v) return;
    const el = document.getElementById(v);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const key = v.replace('wolf-', '');
        uiState['wolf-' + key] = !0;
        saveUiState();
        renderWolfObjects();
    }
};

function renderWolfNotes() {
    const container = document.getElementById('wolfContent');
    container.innerHTML = `<div class="flex"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="wolfNotesCalendar"></div>`;
    renderNotesCalendar('wolf');
}

function renderWolfChecks() {
    const container = document.getElementById('wolfContent');
    const available = objects.filter(o => !o.archived);
    let selectHtml = `<select id="checkObjectFilter" onchange="updateCheckFilterWolf(this.value)"><option value="all" ${checkFilterObjectId === 'all' ? 'selected' : ''}>Все объекты</option>${available.map(o => `<option value="${o.id}" ${checkFilterObjectId == o.id ? 'selected' : ''}>${escapeHtml(o.name)}</option>`).join('')}</select>`;
    container.innerHTML = `<div class="flex"><button class="btn btn-primary" onclick="addCheck()">➕ Загрузить чек</button>${selectHtml}<div class="flex-center"><span class="badge">Фильтр:</span><button class="btn btn-sm" onclick="renderWolfChecksFilter('all')">Все</button><button class="btn btn-sm" onclick="renderWolfChecksFilter('unpaid')">Неоплаченные</button><button class="btn btn-sm" onclick="renderWolfChecksFilter('paid')">Оплаченные</button></div></div><div id="wolfChecksList"></div>`;
    renderChecksList('wolf', 'all');
}

window.updateCheckFilterWolf = function(val) { checkFilterObjectId = val;
    renderWolfChecks(); };

function renderWolfChecksFilter(f) { renderChecksList('wolf', f); }

// ============================================================
// КЛИЕНТ
// ============================================================
function renderClient() {
    const obj = getObject(currentObjectId);
    if (!obj) { document.getElementById('app').innerHTML = '<div class="card">Объект не найден</div>'; return; }
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>🏠 ${escapeHtml(obj.name)}</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
      <div>📍 ${escapeHtml(obj.address)}</div>
    </div>
    <div class="tab-bar">
      <div class="tab active" data-tab="recommend">Рекомендации</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="works">Этапы</div>
      <div class="tab" data-tab="checks">Чеки</div>
    </div>
    <div id="clientContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        switch (this.dataset.tab) {
            case 'recommend':
                renderClientRecommend();
                break;
            case 'design':
                renderClientDesign();
                break;
            case 'works':
                renderClientWorks();
                break;
            case 'checks':
                renderClientChecks();
                break;
        }
    });
    renderClientRecommend();
}

function renderClientChecks() {
    const container = document.getElementById('clientContent');
    container.innerHTML = `<div class="flex"><div class="flex-center"><span class="badge">Фильтр:</span><button class="btn btn-sm" onclick="renderClientChecksFilter('all')">Все</button><button class="btn btn-sm" onclick="renderClientChecksFilter('unpaid')">Неоплаченные</button></div></div><div id="clientChecksList"></div>`;
    renderChecksList('client', 'all');
}

function renderClientChecksFilter(f) { renderChecksList('client', f); }

function renderClientRecommend() {
    const container = document.getElementById('clientContent');
    const obj = getObject(currentObjectId);
    const recs = recommendations.filter(r => r.objectId === obj.id);
    if (!recs.length) { container.innerHTML = '<div class="card">Нет рекомендаций</div>'; return; }
    container.innerHTML = recs.map(r => {
        const status = r.purchased ? '✅ Куплено' : (r.purchasedDate ? '⏳ Ожидается до ' + fmt(r.purchasedDate) : '❌ Не куплено');
        const phRec = (r.photos || []).map(p => `<img src="${p}" style="width:60px;" onclick="showModal('${p}')">`).join('');
        const phPur = (r.purchasedPhotos || []).map(p => `<img src="${p}" style="width:60px;" onclick="showModal('${p}')">`).join('');
        return `<div class="rec-block" style="background:#161616;border:1px solid #282828;padding:10px;margin:6px 0;"><div style="font-weight:500;font-size:15px;color:#e8e8e8;">📋 ${escapeHtml(r.text)}</div><div style="font-size:13px;color:#aaa;"><b>Срок:</b> ${r.deadline ? fmt(r.deadline) : 'не указан'}</div><div style="font-size:13px;color:#aaa;"><b>Статус:</b> ${status}</div><div style="margin:6px 0;"><button class="btn btn-sm" onclick="clientMarkPurchased(${r.id})">${r.purchased ? 'Отменить покупку' : 'Отметить куплено'}</button><button class="btn btn-sm" onclick="clientAddPurchasedPhoto(${r.id})">📸 Добавить фото покупки</button></div><div class="flex" style="gap:8px;flex-wrap:wrap;">${phRec ? `<div><b>Фото рекомендации:</b> ${phRec}</div>` : ''}${phPur ? `<div><b>Фото покупки:</b> ${phPur}</div>` : ''}</div></div>`;
    }).join('');
}

window.clientMarkPurchased = function(id) {
    const r = recommendations.find(x => x.id === id);
    if (r) {
        r.purchased = !r.purchased;
        if (r.purchased) r.purchasedDate = new Date().toISOString().slice(0, 10);
        else r.purchasedDate = null;
        saveDataToLocal();
        renderClient();
        showToast(r.purchased ? '✅ Отмечено куплено' : '↩ Отмена');
    }
};

window.clientAddPurchasedPhoto = async function(id) {
    const r = recommendations.find(x => x.id === id);
    if (!r) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const file = e.target.files[0];
        if (!file) { inp.remove(); return; }
        try {
            const compressed = await compressImage(file);
            if (!isOnline()) {
                if (!r.purchasedPhotos) r.purchasedPhotos = [];
                r.purchasedPhotos.push(compressed);
                addPendingAction({
                    type: 'uploadPhoto',
                    data: {
                        objectId: r.objectId,
                        workId: Date.now(),
                        reportId: Date.now(),
                        base64: compressed
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.purchasedPhotos) r.purchasedPhotos = [];
                    r.purchasedPhotos.push(publicUrl);
                }
            }
            saveDataToLocal();
            renderClient();
        } catch (err) { console.error('Error:', err);
            showToast('❌ Ошибка загрузки фото'); }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

function renderClientDesign() {
    const container = document.getElementById('clientContent');
    const obj = getObject(currentObjectId);
    const projs = designProjects.filter(p => p.objectId === obj.id && (p.roles.includes('client') || p.roles.includes('all')));
    if (!projs.length) { container.innerHTML = '<div class="card">Нет доступных проектов</div>'; return; }
    container.innerHTML = projs.map(p => {
        const comments = (p.comments || []).map(c => `<div><b>${escapeHtml(c.author)}</b> ${escapeHtml(c.text)} <small style="color:#888;">${fmt(c.date)}</small></div>`).join('');
        const files = (p.files || []).map(f => {
            const isImg = f.startsWith('data:image/') || f.startsWith('http');
            return isImg ? `<img src="${f}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal('${f}')">` : `<a href="${f}" target="_blank" style="color:#c9a959;">📄 Файл</a>`;
        }).join(' ') || 'нет';
        return `<div class="design-block" style="background:#161616;border:1px solid #282828;padding:10px;margin:6px 0;"><div style="font-weight:500;font-size:15px;color:#e8e8e8;">${escapeHtml(p.title)} <span class="badge">${p.approvedByClient ? '✅ Утверждён' : '⏳ Не утверждён'}</span></div><div><b>Файлы:</b> ${files}</div><div><b>Комментарии:</b> ${comments || 'нет'}</div><button class="btn btn-sm" onclick="clientAddDesignComment(${p.id})">💬 Комментарий</button><button class="btn btn-sm" onclick="clientApproveDesign(${p.id})">${p.approvedByClient ? 'Отменить утверждение' : 'Утвердить'}</button></div>`;
    }).join('');
}

window.clientAddDesignComment = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (!p) return;
    const t = prompt('Ваш комментарий:');
    if (t) {
        if (!p.comments) p.comments = [];
        p.comments.push({ author: 'Клиент', text: t, date: new Date() });
        saveDataToLocal();
        renderClient();
        showToast('💬 Комментарий добавлен');
    }
};

window.clientApproveDesign = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (p) {
        p.approvedByClient = !p.approvedByClient;
        saveDataToLocal();
        renderClient();
        showToast(p.approvedByClient ? '✅ Проект утверждён' : '⏳ Утверждение снято');
    }
};

function renderClientWorks() {
    const container = document.getElementById('clientContent');
    const obj = getObject(currentObjectId);
    let html = `<div class="card"><h3>Этапы работ</h3>`;
    obj.works.forEach(w => {
        const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id && r.approved);
        html += `<div style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0;"><div class="flex"><b>${escapeHtml(w.name)}</b> ${w.quantity ? `<span style="color:#999;font-size:14px;">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''}<span class="badge">${w.done ? '✅ выполнено' : '⏳ в работе'}</span></div>${w.deadline ? '<div><b>Срок:</b> ' + fmt(w.deadline) + '</div>' : ''}<div><b>Фото:</b> <div class="photo-grid">${photos.map(r => `<img src="${r.photos[0]}" style="width:60px;" onclick="showModal('${r.photos[0]}')">`).join('')}</div></div></div>`;
    });
    html += '</div>';
    container.innerHTML = html;
}

// ============================================================
// ЭЛЕКТРИК
// ============================================================
function renderElectrician() {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>⚡ Электрик</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
    </div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects">Объекты</div>
      <div class="tab" data-tab="design">Дизайн</div>
      <div class="tab" data-tab="tasks">📋 Задачи</div>
    </div>
    <div id="electricianContent"></div>`;
    document.querySelectorAll('.tab').forEach(t => t.onclick = function() {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        switch (this.dataset.tab) {
            case 'objects':
                renderElectricianObjects();
                break;
            case 'design':
                renderElectricianDesign();
                break;
            case 'tasks':
                renderElectricianTasks();
                break;
        }
    });
    renderElectricianObjects();
}

function renderElectricianObjects() {
    const container = document.getElementById('electricianContent');
    const active = objects.filter(o => !o.archived && o.works.some(w => w.forElectrician));
    if (!active.length) { container.innerHTML = '<div class="card">Нет назначенных задач</div>'; return; }
    container.innerHTML = active.map(obj => {
        const electricWorks = obj.works.filter(w => w.forElectrician);
        const worksHtml = electricWorks.map(w => {
            return `<div class="work-block" style="cursor:default;"><div class="work-header"><span><span class="work-title">${escapeHtml(w.name)}</span>${w.quantity ? ` <span class="work-quantity" style="color:#999;font-size:14px;">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''} ${w.done ? '✅' : '⏳'} ${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}</span></div></div>`;
        }).join('') || '<span style="color:#666;font-size:14px;">Нет задач</span>';
        const ownTasks = electricianTasks.filter(t => t.objectId === obj.id);
        let ownTasksHtml = ownTasks.length ? ownTasks.map(t => {
            const photosHtml = (t.photos || []).map(p => `<img src="${p}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal('${p}')">`).join('');
            return `<div class="electrician-task-block"><div class="task-header">📝 ${escapeHtml(t.text)}</div>${t.done ? '✅ выполнено' : '⏳ в работе'}<div class="task-photos">${photosHtml}</div></div>`;
        }).join('') : '';
        return `<div class="card" id="el-obj-${obj.id}"><div class="flex"><h3>${escapeHtml(obj.name)} (${escapeHtml(obj.code)})</h3><span class="badge">ID: ${obj.id}</span></div><div>📍 ${escapeHtml(obj.address)}</div><h4>Мои задачи (назначенные)</h4>${worksHtml}${ownTasksHtml ? `<h4>Мои личные задачи</h4>${ownTasksHtml}` : ''}</div>`;
    }).join('');
}

function renderElectricianDesign() {
    const container = document.getElementById('electricianContent');
    const projs = designProjects.filter(p => p.roles.includes('electrician'));
    if (!projs.length) { container.innerHTML = '<div class="card">Нет доступных дизайн-проектов</div>'; return; }
    container.innerHTML = projs.map(p => {
        const obj = getObject(p.objectId);
        const comments = (p.comments || []).map(c => `<div><b>${escapeHtml(c.author)}</b> ${escapeHtml(c.text)} <small style="color:#888;">${fmt(c.date)}</small></div>`).join('');
        const files = (p.files || []).map(f => {
            const isImg = f.startsWith('data:image/') || f.startsWith('http');
            return isImg ? `<img src="${f}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal('${f}')">` : `<a href="${f}" target="_blank" style="color:#c9a959;">📄 Файл</a>`;
        }).join(' ') || 'нет';
        return `<div class="card"><div class="flex"><h3>${escapeHtml(p.title)}</h3><span class="badge">${p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает'}</span></div><div><b>Объект:</b> ${obj ? escapeHtml(obj.name) : '—'}</div><div><b>Файлы:</b> ${files}</div><div><b>Комментарии:</b> ${comments || 'нет'}</div></div>`;
    }).join('');
}

function renderElectricianTasks() {
    const container = document.getElementById('electricianContent');
    let html = `<div class="flex"><button class="btn btn-primary" onclick="addElectricianTask()">➕ Новая задача</button></div><div id="electricianTasksList"></div>`;
    container.innerHTML = html;
    renderElectricianTasksList();
}

function renderElectricianTasksList() {
    const container = document.getElementById('electricianTasksList');
    if (!container) return;
    const tasksSorted = electricianTasks.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!tasksSorted.length) { container.innerHTML = '<div class="card">Нет созданных задач</div>'; return; }
    container.innerHTML = tasksSorted.map(t => {
        const obj = t.objectId ? getObject(t.objectId) : null;
        const photosHtml = (t.photos || []).map(p => `<img src="${p}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal('${p}')">`).join('');
        return `<div class="card"><div class="flex"><span><b>${escapeHtml(t.text)}</b> ${obj ? `(объект: ${escapeHtml(obj.name)})` : ''}</span><span class="badge">${t.done ? '✅ выполнено' : '⏳ в работе'}</span><button class="btn btn-sm" onclick="toggleElectricianTaskDone(${t.id})">${t.done ? '↩ Вернуть' : '✅ Выполнить'}</button><button class="btn btn-sm btn-danger" onclick="deleteElectricianTask(${t.id})">🗑</button></div><div style="font-size:12px;color:#888;">${fmtTime(t.date)}</div><div class="task-photos">${photosHtml}</div></div>`;
    }).join('');
}

window.addElectricianTask = function() {
    const text = prompt('Текст задачи:');
    if (!text) return;
    let objId = null;
    const available = objects.filter(o => !o.archived);
    if (available.length) {
        const list = available.map((o, i) => `${i+1}. ${o.name}`).join('\n');
        const choice = prompt('Выберите объект (номер) или 0 для без объекта:\n' + list);
        if (choice !== null) {
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < available.length) objId = available[idx].id;
        }
    }
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.multiple = true;
    inp.accept = 'image/*';
    inp.style.cssText = 'position:fixed;top:-100px;left:-100px;opacity:0;pointer-events:none';
    document.body.appendChild(inp);
    inp.onchange = async function(e) {
        const files = e.target.files;
        let photosData = [];
        if (!files.length) { saveTask(text, objId, []); inp.remove(); return; }
        showToast('⏳ Загрузка фото...');
        for (let f of files) {
            try {
                const compressed = await compressImage(f);
                if (!isOnline()) {
                    photosData.push(compressed);
                    addPendingAction({
                        type: 'uploadPhoto',
                        data: {
                            objectId: objId || 'general',
                            workId: Date.now(),
                            reportId: Date.now(),
                            base64: compressed
                        }
                    });
                } else {
                    const publicUrl = await uploadPhotoToStorage(objId || 'general', Date.now(), compressed);
                    if (publicUrl) photosData.push(publicUrl);
                }
            } catch (err) { console.error('Error:', err); }
        }
        saveTask(text, objId, photosData);
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

function saveTask(text, objId, photos) {
    electricianTasks.push({ id: Date.now(), text, objectId: objId, photos, date: new Date(), done: false });
    saveDataToLocal();
    renderElectricianTasks();
    showToast('📝 Задача добавлена');
}

window.toggleElectricianTaskDone = function(id) {
    const task = electricianTasks.find(t => t.id === id);
    if (task) { task.done = !task.done;
        saveDataToLocal();
        renderElectricianTasks();
        showToast(task.done ? '✅ Задача выполнена' : '↩ Задача возвращена'); }
};

window.deleteElectricianTask = function(id) {
    if (confirm('Удалить задачу?')) { electricianTasks = electricianTasks.filter(t => t.id !== id);
        saveDataToLocal();
        renderElectricianTasks();
        showToast('🗑 Задача удалена'); }
};

// ============================================================
// ОБЩИЙ ПРОСМОТР
// ============================================================
function renderGenericViewer(title) {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>${title}</h2>
        <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
      </div>
    </div>
    <div id="genericContent"></div>`;
    const container = document.getElementById('genericContent');
    const active = objects.filter(o => !o.archived);
    if (!active.length) { container.innerHTML = '<div class="card">Нет объектов</div>'; return; }
    container.innerHTML = active.map(obj => {
        const projs = designProjects.filter(p => p.objectId === obj.id);
        const recs = recommendations.filter(r => r.objectId === obj.id);
        const worksHtml = obj.works.map(w => {
            const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id && r.approved);
            const phHtml = photos.map(r => `<img src="${r.photos[0]}" style="width:50px;" onclick="showModal('${r.photos[0]}')">`).join('');
            return `<div class="work-block" style="cursor:default;"><div class="work-header"><span><span class="work-title">${escapeHtml(w.name)}</span>${w.quantity ? ` <span class="work-quantity" style="color:#999;font-size:14px;">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''} ${w.done ? '✅' : '⏳'} ${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}</span></div><div class="work-detail open"><div><b>Фото:</b> ${phHtml || 'нет'}</div></div></div>`;
        }).join('');
        const designHtml = projs.map(p => {
            const files = (p.files || []).map(f => {
                const isImg = f.startsWith('data:image/') || f.startsWith('http');
                return isImg ? `<img src="${f}" style="width:50px;height:50px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="showModal('${f}')">` : `<a href="${f}" target="_blank" style="color:#c9a959;">📄 Файл</a>`;
            }).join(' ') || 'нет';
            return `<div class="design-block"><div class="design-header"><span class="design-title">${escapeHtml(p.title)}</span> <span class="badge">${p.approvedByClient ? '✅' : '⏳'}</span></div><div class="design-detail open"><b>Файлы:</b> ${files}</div></div>`;
        }).join('');
        const recHtml = recs.map(r => {
            const status = r.purchased ? '✅ Куплено' : (r.purchasedDate ? '⏳ Ожидается до ' + fmt(r.purchasedDate) : '❌ Не куплено');
            const phRec = (r.photos || []).map(p => `<img src="${p}" style="width:50px;" onclick="showModal('${p}')">`).join('');
            const phPur = (r.purchasedPhotos || []).map(p => `<img src="${p}" style="width:50px;" onclick="showModal('${p}')">`).join('');
            return `<div class="rec-block"><div class="rec-header"><span class="rec-title">📋 ${escapeHtml(r.text)}</span> <span class="badge">${status}</span></div><div class="rec-detail open">${phRec}${phPur}</div></div>`;
        }).join('');
        return `<div class="card"><div class="flex"><h3>${escapeHtml(obj.name)} (${escapeHtml(obj.code)})</h3><span class="badge">${obj.completed ? 'Сдан' : 'В работе'}</span></div><div>📍 ${escapeHtml(obj.address)}</div><h4>Дизайн-проекты</h4>${designHtml || '<span style="color:#666;">Нет проектов</span>'}<h4>Рекомендации</h4>${recHtml || '<span style="color:#666;">Нет рекомендаций</span>'}<h4>Этапы работ</h4>${worksHtml || '<span style="color:#666;">Нет этапов</span>'}</div>`;
    }).join('');
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
    renderBossObjects();
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
// ЗАПУСК
// ============================================================
loadPendingActions();
loadDataFromLocal();
loadFromSupabase();
render();

// Проверка интернета каждые 30 секунд
setInterval(() => {
    if (isOnline() && pendingActions.length > 0) {
        syncPendingActions();
    }
}, 30000);

// При восстановлении интернета
window.addEventListener('online', () => {
    if (pendingActions.length > 0) {
        syncPendingActions();
    }
});
