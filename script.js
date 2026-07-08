// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ ВЕРСИЯ С СИНХРОНИЗАЦИЕЙ
// ============================================================

const SUPABASE_URL = 'https://tcdanvvfxcdravgpdyat.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zStkcf7dAftG50tho5ifOw_F7Ygv_Xz';

// ============================================================
// ОЧЕРЕДЬ ОТЛОЖЕННЫХ ДЕЙСТВИЙ
// ============================================================
let pendingActions = [];
let isSyncing = false;

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
        statusEl.innerHTML = `⏳ Ожидают синхронизации: ${count} действий <button class="btn btn-sm" onclick="syncPendingActions()" style="margin-left:12px;">Синхронизировать сейчас</button>`;
        statusEl.style.color = '#c9a959';
    }
}

// ============================================================
// ЗАГРУЗКА ДАННЫХ ИЗ SUPABASE
// ============================================================
async function loadAllFromSupabase() {
    if (!navigator.onLine) {
        console.log('⚠️ Нет интернета, используем локальные данные');
        return;
    }

    try {
        console.log('🔄 Загрузка всех данных из Supabase...');
        showToast('⏳ Синхронизация всех данных...');
        
        const objectsResp = await fetch(`${SUPABASE_URL}/rest/v1/objects?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (objectsResp.ok) {
            const data = await objectsResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = objects.find(o => o.id === item.id);
                    if (!existing) objects.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} объектов`);
            }
        }

        const checksResp = await fetch(`${SUPABASE_URL}/rest/v1/checks?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (checksResp.ok) {
            const data = await checksResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = checks.find(c => c.id === item.id);
                    if (!existing) checks.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} чеков`);
            }
        }

        const recsResp = await fetch(`${SUPABASE_URL}/rest/v1/recommendations?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (recsResp.ok) {
            const data = await recsResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = recommendations.find(r => r.id === item.id);
                    if (!existing) recommendations.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} рекомендаций`);
            }
        }

        const notesResp = await fetch(`${SUPABASE_URL}/rest/v1/notes?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (notesResp.ok) {
            const data = await notesResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = notes.find(n => n.id === item.id);
                    if (!existing) notes.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} заметок`);
            }
        }

        const designResp = await fetch(`${SUPABASE_URL}/rest/v1/design_projects?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (designResp.ok) {
            const data = await designResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = designProjects.find(d => d.id === item.id);
                    if (!existing) designProjects.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} дизайн-проектов`);
            }
        }

        const tasksResp = await fetch(`${SUPABASE_URL}/rest/v1/electrician_tasks?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (tasksResp.ok) {
            const data = await tasksResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = electricianTasks.find(t => t.id === item.id);
                    if (!existing) electricianTasks.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} задач электрика`);
            }
        }

        const ordersResp = await fetch(`${SUPABASE_URL}/rest/v1/purchase_orders?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (ordersResp.ok) {
            const data = await ordersResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = purchaseOrders.find(o => o.id === item.id);
                    if (!existing) purchaseOrders.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} заказов на закупку`);
            }
        }

        const reportsResp = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (reportsResp.ok) {
            const data = await reportsResp.json();
            if (data.length > 0) {
                for (const item of data) {
                    const existing = reports.find(r => r.id === item.id);
                    if (!existing) reports.push(item);
                    else Object.assign(existing, item);
                }
                console.log(`✅ Загружено ${data.length} отчетов`);
            }
        }

        const pwdResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (pwdResp.ok) {
            const data = await pwdResp.json();
            for (const item of data) {
                if (item.role) passwords[item.role] = item.password;
                else if (item.object_id) passwords.objects[item.object_id] = item.password;
            }
            console.log('✅ Загружены пароли');
        }

        saveDataToLocal();
        
        if (currentUser === 'boss') {
            renderBossObjects();
        } else if (currentUser === 'wolf') {
            renderWolfObjects();
        } else if (currentUser === 'client') {
            renderClient();
        } else if (currentUser === 'electrician') {
            renderElectricianObjects();
        }

        showToast('✅ Все данные синхронизированы с облаком');
        console.log('✅ Все данные загружены из Supabase');
    } catch (e) {
        console.error('❌ Ошибка загрузки данных:', e);
        showToast('⚠️ Используем локальные данные');
    }
}

// ============================================================
// УНИВЕРСАЛЬНОЕ СОХРАНЕНИЕ В SUPABASE
// ============================================================
async function saveToSupabase(table, data) {
    if (!navigator.onLine) return false;
    
    try {
        const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${data.id}`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        
        if (checkResp.ok) {
            const existing = await checkResp.json();
            
            if (existing.length > 0) {
                const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${data.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(data)
                });
                if (!resp.ok) throw new Error(`Update failed: ${resp.status}`);
            } else {
                const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(data)
                });
                if (!resp.ok) throw new Error(`Create failed: ${resp.status}`);
            }
            console.log(`✅ Сохранено в ${table}:`, data.id);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`❌ Ошибка сохранения в ${table}:`, e);
        return false;
    }
}

// ============================================================
// УДАЛЕНИЕ ИЗ SUPABASE
// ============================================================
async function deleteFromSupabase(table, id) {
    if (!navigator.onLine) return false;
    
    try {
        const resp = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (resp.ok) {
            console.log(`✅ Удалено из ${table}:`, id);
            return true;
        }
        return false;
    } catch (e) {
        console.error(`❌ Ошибка удаления из ${table}:`, e);
        return false;
    }
}

// ============================================================
// СИНХРОНИЗАЦИЯ ПАРОЛЕЙ
// ============================================================
async function syncPasswordsToSupabase() {
    if (!navigator.onLine) return;
    
    try {
        for (const [role, pwd] of Object.entries(passwords)) {
            if (role === 'objects') continue;
            if (pwd) {
                const data = { id: Date.now() + Math.random() * 1000, role, password: pwd };
                await saveToSupabase('passwords', data);
            }
        }
        
        for (const [objId, pwd] of Object.entries(passwords.objects)) {
            if (pwd) {
                const data = { id: Date.now() + Math.random() * 1000, object_id: parseInt(objId), password: pwd };
                await saveToSupabase('passwords', data);
            }
        }
        console.log('✅ Пароли синхронизированы');
    } catch (e) {
        console.error('❌ Ошибка синхронизации паролей:', e);
    }
}

// ============================================================
// ПРОВЕРКА ИНТЕРНЕТА
// ============================================================
function isOnline() {
    return navigator.onLine;
}

async function syncPendingActions() {
    if (isSyncing) return;
    if (!isOnline()) {
        console.log('⚠️ Нет интернета, синхронизация отложена');
        return;
    }
    if (pendingActions.length === 0) {
        console.log('✅ Нет отложенных действий');
        return;
    }

    isSyncing = true;
    console.log(`🔄 Синхронизация ${pendingActions.length} действий...`);
    showToast(`⏳ Синхронизация ${pendingActions.length} действий...`);

    let synced = 0;
    let failed = [];

    for (const action of pendingActions) {
        try {
            switch (action.type) {
                case 'addObject':
                    await saveToSupabase('objects', action.data);
                    break;
                case 'updateObject':
                    await saveToSupabase('objects', action.data);
                    break;
                case 'deleteObject':
                    await deleteFromSupabase('objects', action.data.id);
                    break;
                case 'addCheck':
                    await saveToSupabase('checks', action.data);
                    break;
                case 'updateCheck':
                    await saveToSupabase('checks', action.data);
                    break;
                case 'deleteCheck':
                    await deleteFromSupabase('checks', action.data.id);
                    break;
                case 'addRecommendation':
                    await saveToSupabase('recommendations', action.data);
                    break;
                case 'updateRecommendation':
                    await saveToSupabase('recommendations', action.data);
                    break;
                case 'deleteRecommendation':
                    await deleteFromSupabase('recommendations', action.data.id);
                    break;
                case 'addNote':
                    await saveToSupabase('notes', action.data);
                    break;
                case 'deleteNote':
                    await deleteFromSupabase('notes', action.data.id);
                    break;
                case 'addWork':
                    await saveToSupabase('objects', action.data.object);
                    break;
                case 'updateWork':
                    await saveToSupabase('objects', action.data.object);
                    break;
                case 'deleteWork':
                    await saveToSupabase('objects', action.data.object);
                    break;
                case 'uploadPhoto':
                    await saveToSupabase('reports', action.data);
                    break;
                case 'deletePhoto':
                    await deleteFromSupabase('reports', action.data.reportId);
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
        await loadAllFromSupabase();
        showToast(`✅ Синхронизировано ${synced} действий`);
    } else {
        showToast(`⚠️ Синхронизировано ${synced}, ошибок: ${failed.length}`);
    }

    isSyncing = false;
    render();
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
let passwords = { boss: '30986', wolf: '30986', client: '30986', master: '30986', designer: '30986', purchaser: '30986', electrician: '30986', objects: {} };
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
            works: [{ id: n + 1, name: 'Демонтаж', done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !1, status: '' }],
            completed: !1,
            archived: !1,
            startDate: null,
            plannedEndDate: null,
            schedule: []
        });
        passwords.objects[n] = 'demo123';
    }
    objects.forEach(o => {
        o.works.forEach(w => {
            if (w.quantity === undefined) w.quantity = '';
            if (w.unit === undefined) w.unit = '';
            if (w.done === undefined) w.done = !1;
            if (w.forElectrician === undefined) w.forElectrician = !1;
            if (w.manual === undefined) w.manual = !1;
            if (w.status === undefined) w.status = '';
        });
        if (o.startDate === undefined) o.startDate = null;
        if (o.plannedEndDate === undefined) o.plannedEndDate = null;
        if (o.schedule === undefined) o.schedule = [];
    });
    recommendations.forEach(r => { if (!r.photos) r.photos = []; if (!r.purchasedPhotos) r.purchasedPhotos = []; });
    electricianTasks.forEach(t => { if (!t.photos) t.photos = []; if (t.done === undefined) t.done = !1; if (t.objectId === undefined) t.objectId = null; });
    objects.forEach(o => { if (!passwords.objects[o.id]) passwords.objects[o.id] = Math.random().toString(36).substring(2, 8).toUpperCase(); });
    loadUiState();
}

// ============================================================
// КАБИНЕТЫ-ОБМАНКИ (ДИЗАЙНЕР, МАСТЕР, ЗАКУПЩИК)
// ============================================================
function renderFakeCabinet(role) {
    const labels = {
        designer: '🎨 Дизайнер',
        master: '🔧 Мастер',
        purchaser: '📦 Закупщик'
    };
    
    document.getElementById('app').innerHTML = `
    <div class="card" style="text-align:center;padding:40px 20px;min-height:400px;display:flex;flex-direction:column;justify-content:center;align-items:center;">
        <div style="font-size:64px;margin-bottom:20px;">🔒</div>
        <h2 style="color:#c9a959;margin-bottom:10px;">${labels[role] || role}</h2>
        <div style="color:#666;font-size:18px;margin-bottom:20px;">Доступ временно ограничен</div>
        <div style="color:#444;font-size:14px;max-width:300px;margin-bottom:30px;">
            Ведутся технические работы. Пожалуйста, обратитесь к руководителю.
        </div>
        <button class="btn btn-primary" onclick="currentUser=null;render()">🚪 Выйти</button>
    </div>`;
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
// ФУНКЦИЯ РАСЧЕТА ДНЕЙ ДО ЗАВЕРШЕНИЯ
// ============================================================
function getDaysRemaining(endDate) {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
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
    const newObj = { id, code: Math.random().toString(36).substring(2, 8).toUpperCase(), name: n, address: a, works: [], completed: !1, archived: !1, startDate: null, plannedEndDate: null, schedule: [] };
    objects.push(newObj);
    passwords.objects[id] = pwd;
    saveDataToLocal();
    
    if (!isOnline()) {
        addPendingAction({ type: 'addObject', data: newObj });
        showToast('📦 Объект сохранён локально (ожидает интернет)');
    } else {
        saveToSupabase('objects', newObj).then(() => {
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
            const newWork = { id: Date.now(), name: n, done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !0, status: '' };
            o.works.push(newWork);
            saveDataToLocal();
            
            if (!isOnline()) {
                addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
                showToast('📦 Этап сохранён локально (ожидает интернет)');
            } else {
                saveToSupabase('objects', o).then(() => {
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
            saveToSupabase('objects', o).catch(() => {
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
                saveToSupabase('objects', o).catch(() => {
                    addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
                });
            }
            if (currentUser === 'boss') renderBossObjects();
            else if (currentUser === 'wolf') renderWolfObjects();
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
                deleteFromSupabase('reports', id).catch(() => {
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
                deleteFromSupabase('objects', id).catch(() => {
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
                saveToSupabase('objects', obj).catch(() => {
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
        saveToSupabase('objects', obj).catch(() => {
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
        saveToSupabase('objects', obj).catch(() => {
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
            saveToSupabase('objects', o).catch(() => {
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
                saveToSupabase('objects', o).catch(() => {
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
            saveToSupabase('objects', o).catch(() => {
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
            saveToSupabase('objects', obj).catch(() => {
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
                    const report = {
                        id: reportId,
                        objectId: id,
                        workId: work.id,
                        photos: [compressed],
                        text: '',
                        date: new Date(),
                        approved: true
                    };
                    reports.push(report);
                    saveDataToLocal();
                    addPendingAction({
                        type: 'uploadPhoto',
                        data: report
                    });
                    showToast('📸 Фото сохранено локально (ожидает интернет)');
                    uploadedCount++;
                } else {
                    const publicUrl = await uploadPhotoToStorage(id, work.id, compressed);
                    if (publicUrl) {
                        const report = {
                            id: Date.now() + Math.random() * 1000,
                            objectId: id,
                            workId: work.id,
                            photos: [publicUrl],
                            text: '',
                            date: new Date(),
                            approved: true
                        };
                        reports.push(report);
                        await saveToSupabase('reports', report);
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
// ФУНКЦИИ ДЛЯ УСТАНОВКИ ДАТ ОБЪЕКТА
// ============================================================
window.setObjectStartDate = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const date = prompt('Введите дату начала (ГГГГ-ММ-ДД):');
    if (date && isValidDate(date)) {
        obj.startDate = date;
        saveDataToLocal();
        if (isOnline()) {
            saveToSupabase('objects', obj);
        } else {
            addPendingAction({ type: 'updateObject', data: obj });
        }
        renderBossObjects();
        showToast('📅 Дата начала установлена');
    } else if (date) {
        showToast('❌ Неверный формат даты');
    }
};

window.setObjectEndDate = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const date = prompt('Введите дату планового завершения (ГГГГ-ММ-ДД):');
    if (date && isValidDate(date)) {
        obj.plannedEndDate = date;
        saveDataToLocal();
        if (isOnline()) {
            saveToSupabase('objects', obj);
        } else {
            addPendingAction({ type: 'updateObject', data: obj });
        }
        renderBossObjects();
        showToast('📅 Дата завершения установлена');
    } else if (date) {
        showToast('❌ Неверный формат даты');
    }
};

// ============================================================
// ФУНКЦИИ ДЛЯ ГРАФИКА РАБОТ
// ============================================================
window.addScheduleItem = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    
    const date = prompt('Дата (ГГГГ-ММ-ДД):');
    if (!date || !isValidDate(date)) {
        if (date) showToast('❌ Неверный формат даты');
        return;
    }
    const text = prompt('Описание события:');
    if (!text) return;
    
    if (!obj.schedule) obj.schedule = [];
    obj.schedule.push({ date, text });
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
    renderSchedule();
    showToast('✅ Событие добавлено в график');
};

window.deleteScheduleItem = function(objId, idx) {
    const obj = getObject(objId);
    if (!obj || !obj.schedule) return;
    if (!confirm('Удалить событие из графика?')) return;
    
    obj.schedule.splice(idx, 1);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
    renderSchedule();
    showToast('🗑 Событие удалено');
};

window.clearSchedule = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    if (!confirm('Очистить весь график?')) return;
    
    obj.schedule = [];
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
    renderSchedule();
    showToast('🗑 График очищен');
};

window.switchScheduleObject = function(objId) {
    currentObjectId = parseInt(objId);
    renderSchedule();
};

function renderSchedule() {
    const container = document.getElementById('bossContent') || document.getElementById('wolfContent');
    if (!container) return;
    
    if (currentUser === 'wolf') {
        const objectsList = objects.filter(o => !o.archived);
        if (objectsList.length === 0) {
            container.innerHTML = '<div class="card">Нет объектов</div>';
            return;
        }
        
        let selectHtml = `
            <div style="margin-bottom:12px;">
                <select id="scheduleObjectSelect" onchange="switchScheduleObject(this.value)" style="background:#161616;color:#e0e0e0;border:1px solid #282828;border-radius:6px;padding:8px;width:100%;font-size:14px;">
                    ${objectsList.map(o => `
                        <option value="${o.id}" ${o.id === currentObjectId ? 'selected' : ''}>${escapeHtml(o.name)}</option>
                    `).join('')}
                </select>
            </div>
        `;
        container.innerHTML = selectHtml;
    }
    
    const obj = getObject(currentObjectId);
    if (!obj) {
        container.innerHTML += '<div class="card">Объект не найден</div>';
        return;
    }
    
    let html = `
    <div class="card">
        <h3>📋 График работ — ${escapeHtml(obj.name)}</h3>
        <div style="margin:8px 0;">
            <button class="btn btn-sm btn-primary" onclick="addScheduleItem(${obj.id})">➕ Добавить событие</button>
            <button class="btn btn-sm" onclick="clearSchedule(${obj.id})">🗑 Очистить</button>
        </div>
        <div id="scheduleList">
    `;
    
    if (!obj.schedule || obj.schedule.length === 0) {
        html += '<div style="color:#666;">График пуст. Добавьте события.</div>';
    } else {
        const sorted = [...obj.schedule].sort((a, b) => new Date(a.date) - new Date(b.date));
        html += sorted.map((item, idx) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px;margin:4px 0;background:#121212;border-radius:6px;border:1px solid #282828;">
                <div>
                    <span style="color:#c9a959;">${fmt(item.date)}</span>
                    <span style="margin-left:12px;">${escapeHtml(item.text)}</span>
                </div>
                <button class="btn btn-sm btn-danger" onclick="deleteScheduleItem(${obj.id}, ${idx})">×</button>
            </div>
        `).join('');
    }
    
    html += '</div></div>';
    container.innerHTML += html;
}

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
    const project = { id: Date.now(), objectId: objId, title, files, roles: ['boss', 'wolf', 'client', 'electrician'], comments: [], approvedByClient: !1 };
    designProjects.push(project);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('design_projects', project);
    } else {
        addPendingAction({ type: 'addDesignProject', data: project });
    }
    
    renderBossObjects();
    showToast('📐 Дизайн-проект создан');
}

window.deleteDesign = function(id) {
    if (confirm('Удалить проект?')) {
        designProjects = designProjects.filter(p => p.id !== id);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('design_projects', id);
        } else {
            addPendingAction({ type: 'deleteDesign', data: { id: id } });
        }
        
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
            
            if (isOnline()) {
                saveToSupabase('design_projects', p);
            } else {
                addPendingAction({ type: 'updateDesign', data: p });
            }
            
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
        
        if (isOnline()) {
            saveToSupabase('design_projects', p);
        } else {
            addPendingAction({ type: 'updateDesign', data: p });
        }
        
        renderBossObjects();
        showToast('💬 Комментарий добавлен');
    }
};

window.toggleDesignApprove = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (p) {
        p.approvedByClient = !p.approvedByClient;
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('design_projects', p);
        } else {
            addPendingAction({ type: 'updateDesign', data: p });
        }
        
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
    
    const rec = { id: Date.now(), objectId: objId, text: text.trim(), deadline: deadline ? deadline.trim() : null, photos: [], purchased: !1, purchasedDate: null, purchasedPhotos: [] };
    recommendations.push(rec);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('recommendations', rec);
    } else {
        addPendingAction({ type: 'addRecommendation', data: rec });
    }
    
    renderBossObjects();
    showToast('📋 Рекомендация добавлена');
};

window.deleteRecommend = function(id) {
    if (confirm('Удалить рекомендацию?')) {
        recommendations = recommendations.filter(r => r.id !== id);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('recommendations', id);
        } else {
            addPendingAction({ type: 'deleteRecommendation', data: { id: id } });
        }
        
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
        
        if (isOnline()) {
            saveToSupabase('recommendations', r);
        } else {
            addPendingAction({ type: 'updateRecommendation', data: r });
        }
        
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
                        id: Date.now() + Math.random() * 1000,
                        objectId: r.objectId,
                        workId: Date.now(),
                        photos: [compressed],
                        date: new Date(),
                        approved: true
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.photos) r.photos = [];
                    r.photos.push(publicUrl);
                    await saveToSupabase('recommendations', r);
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
                        id: Date.now() + Math.random() * 1000,
                        objectId: r.objectId,
                        workId: Date.now(),
                        photos: [compressed],
                        date: new Date(),
                        approved: true
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.purchasedPhotos) r.purchasedPhotos = [];
                    r.purchasedPhotos.push(publicUrl);
                    await saveToSupabase('recommendations', r);
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
            
            if (isOnline()) {
                saveToSupabase('recommendations', r);
            } else {
                addPendingAction({ type: 'updateRecommendation', data: r });
            }
            
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
    const note = { id: Date.now(), author: currentUser, text, date: noteDate };
    notes.push(note);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('notes', note);
    } else {
        addPendingAction({ type: 'addNote', data: note });
    }
    
    if (currentUser === 'boss') renderBossNotes();
    else if (currentUser === 'wolf') renderWolfNotes();
    showToast('📝 Заметка добавлена');
};

window.deleteNote = function(id) {
    if (confirm('Удалить заметку?')) {
        notes = notes.filter(n => n.id !== id);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('notes', id);
        } else {
            addPendingAction({ type: 'deleteNote', data: { id: id } });
        }
        
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
            let check = { id: Date.now(), objectId: objId, amount, fileData: '', date: new Date(), paid: false, paidDate: null, paidBy: null };
            
            if (file.type.startsWith('image/')) {
                const compressed = await compressImage(file);
                if (!isOnline()) {
                    check.fileData = compressed;
                    addPendingAction({ type: 'addCheck', data: check });
                    showToast('🧾 Чек сохранён локально (ожидает интернет)');
                } else {
                    const publicUrl = await uploadPhotoToStorage(objId, Date.now(), compressed);
                    check.fileData = publicUrl;
                }
            } else {
                const reader = new FileReader();
                fileData = await new Promise(res => { reader.onload = function(ev) { res(ev.target.result); }; reader.readAsDataURL(file); });
                check.fileData = fileData;
            }
            
            checks.push(check);
            saveDataToLocal();
            
            if (isOnline() && check.fileData && !check.fileData.startsWith('data:')) {
                await saveToSupabase('checks', check);
            }
            
            showToast('🧾 Чек загружен' + (!isOnline() ? ' (ожидает интернет)' : ''));
            if (currentUser === 'boss') renderBossChecks();
            else if (currentUser === 'wolf') renderWolfChecks();
            else if (currentUser === 'client') renderClientChecks();
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
    
    if (isOnline()) {
        saveToSupabase('checks', c);
    } else {
        addPendingAction({ type: 'updateCheck', data: c });
    }
    
    if (currentUser === 'boss') renderBossChecks();
    else if (currentUser === 'wolf') renderWolfChecks();
    else if (currentUser === 'client') renderClientChecks();
    showToast('✅ Чек оплачен');
};

window.deleteCheck = function(checkId) {
    if (confirm('Удалить чек?')) {
        checks = checks.filter(c => c.id !== checkId);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('checks', checkId);
        } else {
            addPendingAction({ type: 'deleteCheck', data: { id: checkId } });
        }
        
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
    
    if (isOnline()) {
        syncPasswordsToSupabase();
        showToast('🔑 Пароль для ' + getUserLabel(r) + ' синхронизирован');
    } else {
        addPendingAction({ type: 'updatePassword', data: { role: r, password: passwords[r] } });
        showToast('🔑 Пароль сохранён локально (ожидает интернет)');
    }
    
    renderPasswords();
};

// ============================================================
// ИСПРАВЛЕННАЯ ФУНКЦИЯ setObjectPassword (с синхронизацией в Supabase)
// ============================================================
window.setObjectPassword = function(objId) {
    const val = document.getElementById('pass-obj-' + objId).value.trim();
    const obj = objects.find(o => o.id === objId);
    if (!obj) return;
    
    let newPwd;
    if (val) {
        newPwd = val;
        showToast('🔑 Пароль для "' + obj.name + '" установлен на "' + val + '"');
    } else {
        newPwd = Math.random().toString(36).substring(2, 8).toUpperCase();
        showToast('🔑 Пароль сброшен на: ' + newPwd);
        document.getElementById('pass-obj-' + objId).value = newPwd;
    }
    
    passwords.objects[objId] = newPwd;
    saveDataToLocal();
    
    // Сохраняем в Supabase
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        })
        .then(r => r.json())
        .then(data => {
            if (data.length > 0) {
                return fetch(SUPABASE_URL + '/rest/v1/passwords?object_id=eq.' + objId, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    },
                    body: JSON.stringify({ password: newPwd })
                });
            } else {
                return fetch(SUPABASE_URL + '/rest/v1/passwords', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': 'Bearer ' + SUPABASE_KEY
                    },
                    body: JSON.stringify({ object_id: objId, password: newPwd })
                });
            }
        })
        .then(() => console.log('✅ Пароль синхронизирован с Supabase'))
        .catch(e => console.log('⚠️ Ошибка синхронизации:', e));
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
      <div class="tab" data-tab="schedule">📋 График</div>
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
            case 'schedule':
                renderSchedule();
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

    const statusHtml = `<div id="pendingStatus" style="padding:8px 12px;margin-bottom:12px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;text-align:center;color:${pendingActions.length === 0 ? '#4caf50' : '#c9a959'};">${pendingActions.length === 0 ? '✅ Все данные синхронизированы' : '⏳ Ожидают синхронизации: ' + pendingActions.length + ' действий'}</div>`;

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
            
            // Расчет дней до дедлайна
            let daysHtml = '';
            if (w.deadline && !w.done) {
                const daysLeft = getDaysRemaining(w.deadline);
                if (daysLeft !== null) {
                    daysHtml = `<span style="font-size:12px;color:${daysLeft < 0 ? '#a04040' : '#4caf50'};margin-left:8px;">${daysLeft < 0 ? `⏰ просрочка ${Math.abs(daysLeft)} дн.` : `⏳ осталось ${daysLeft} дн.`}</span>`;
                }
            }
            
            return `<div class="work-block" draggable="true" data-object-id="${obj.id}" data-work-index="${originalIndex}" data-work-id="${w.id}">
                <div class="work-header" onclick="toggleWork(event, this, '${wKey}')">
                    <span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;">
                        <span class="drag-handle" title="Перетащить">⠿</span>
                        <span class="work-title">${escapeHtml(w.name)}</span>
                        ${w.quantity ? ` <span class="work-quantity">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''}
                        <span class="work-status-check" onclick="event.stopPropagation();toggleWorkStatus(${obj.id},${originalIndex})">${w.done ? '☑' : '☐'}</span>
                        <span class="work-electrician-toggle" onclick="event.stopPropagation();toggleElectrician(${obj.id},${originalIndex})" title="Назначить электрику">${electricianLabel || '⚡'}</span>
                        ${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}
                        ${daysHtml}
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
        
        // Сводка по объекту
        let summaryHtml = '';
        if (obj.startDate) {
            summaryHtml += `<div>📅 Начало: ${fmt(obj.startDate)}</div>`;
        } else {
            summaryHtml += `<div>📅 Начало: <span style="color:#666;">не указано</span></div>`;
        }
        if (obj.plannedEndDate) {
            const daysLeft = getDaysRemaining(obj.plannedEndDate);
            summaryHtml += `<div>🎯 Плановое завершение: ${fmt(obj.plannedEndDate)}`;
            if (daysLeft !== null) {
                summaryHtml += ` <span style="color:${daysLeft < 0 ? '#a04040' : '#c9a959'};">(${daysLeft < 0 ? 'Просрочено на ' + Math.abs(daysLeft) : 'осталось ' + daysLeft} дн.)</span>`;
            }
            summaryHtml += `</div>`;
        } else {
            summaryHtml += `<div>🎯 Плановое завершение: <span style="color:#666;">не указано</span></div>`;
        }
        
        return `<div class="card" id="obj-${obj.id}"><div class="object-header" onclick="toggleObject(this,'${objKey}')"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="font-weight:300;color:#888;">(${escapeHtml(obj.code)})</span><span class="arrow ${objOpen ? 'open' : ''}">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge">ID: ${obj.id}</span>${!obj.archived ? `<button class="btn btn-sm" onclick="event.stopPropagation();completeObject(${obj.id})">${obj.completed ? 'Вернуть' : 'Сдать'}</button>` : ''}${!obj.archived ? `<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();archiveObject(${obj.id})">📦</button>` : ''}${archiveButtons}<button class="btn btn-sm" onclick="event.stopPropagation();addWork(${obj.id})">➕ Этап</button></div></div><div style="color:#999;font-size:14px;">📍 ${escapeHtml(obj.address)}</div><div style="margin:8px 0;padding:10px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;">${summaryHtml}<div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;"><button class="btn btn-sm" onclick="setObjectStartDate(${obj.id})">📅 Установить начало</button><button class="btn btn-sm" onclick="setObjectEndDate(${obj.id})">📅 Установить завершение</button></div></div></div><div class="object-detail ${objOpen ? 'open' : ''}">${addButtons}<hr><h4>Дизайн-проекты</h4><div class="design-block-container"><div class="design-block-header" onclick="toggleDesignBlockHeader(this,'${designKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span> Дизайн-проекты (${projs.length})</span></div><div class="design-detail-container ${designOpen ? 'open' : ''}" style="display:${designOpen ? 'block' : 'none'};">${designBlocks}</div></div><hr><h4>Рекомендации</h4><div class="rec-block-container"><div class="rec-block-header" onclick="toggleRecBlockHeader(this,'${recKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span> Рекомендации (${recs.length})</span></div><div class="rec-detail-container ${recOpen ? 'open' : ''}" style="display:${recOpen ? 'block' : 'none'};">${recBlocks}</div></div><hr><h4>Этапы работ</h4>${statusTabs}<div id="work-list-${obj.id}" class="work-list">${worksHtml || '<span style="color:#666;font-size:14px;">Нет этапов</span>'}</div></div></div>`;
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
    const order = { id: Date.now(), objectId: obj.id, items: [], photos: [], date: new Date(), status: 'active' };
    purchaseOrders.push(order);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('purchase_orders', order);
    } else {
        addPendingAction({ type: 'addPurchaseOrder', data: order });
    }
    
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
    
    if (isOnline()) {
        saveToSupabase('purchase_orders', order);
    } else {
        addPendingAction({ type: 'updatePurchaseOrder', data: order });
    }
    
    renderWolfPurchases();
    showToast('➕ Товар добавлен');
};

window.wolfTogglePurchasedItem = function(orderId, idx) {
    const order = purchaseOrders.find(o => o.id === orderId);
    if (order) {
        order.items[idx].purchased = !order.items[idx].purchased;
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('purchase_orders', order);
        } else {
            addPendingAction({ type: 'updatePurchaseOrder', data: order });
        }
        
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
            
            if (isOnline()) {
                saveToSupabase('purchase_orders', order);
            } else {
                addPendingAction({ type: 'updatePurchaseOrder', data: order });
            }
            
            renderWolfPurchases();
            showToast('🗑 Товар удалён');
        }
    }
};

window.wolfDeleteOrder = function(orderId) {
    if (confirm('Удалить заявку?')) {
        purchaseOrders = purchaseOrders.filter(o => o.id !== orderId);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('purchase_orders', orderId);
        } else {
            addPendingAction({ type: 'deletePurchaseOrder', data: { id: orderId } });
        }
        
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
                        id: Date.now() + Math.random() * 1000,
                        objectId: order.objectId,
                        workId: Date.now(),
                        photos: [compressed],
                        date: new Date(),
                        approved: true
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(order.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!order.photos) order.photos = [];
                    order.photos.push(publicUrl);
                    await saveToSupabase('purchase_orders', order);
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
      <div class="tab" data-tab="schedule">📋 График</div>
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
            case 'schedule':
                renderSchedule();
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
            
            let daysHtml = '';
            if (w.deadline && !w.done) {
                const daysLeft = getDaysRemaining(w.deadline);
                if (daysLeft !== null) {
                    daysHtml = `<span style="font-size:12px;color:${daysLeft < 0 ? '#a04040' : '#4caf50'};margin-left:8px;">${daysLeft < 0 ? `⏰ просрочка ${Math.abs(daysLeft)} дн.` : `⏳ осталось ${daysLeft} дн.`}</span>`;
                }
            }
            
            return `<div class="work-block" draggable="true" data-object-id="${obj.id}" data-work-index="${originalIndex}" data-work-id="${w.id}"><div class="work-header" onclick="toggleWork(event, this, '${wKey}')"><span style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;flex:1;"><span class="drag-handle">⠿</span><span class="work-title">${escapeHtml(w.name)}</span>${w.quantity ? ` <span class="work-quantity">(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})</span>` : ''}<span class="work-status-check" onclick="event.stopPropagation();wolfToggleWorkStatus(${obj.id},${originalIndex})">${w.done ? '☑' : '☐'}</span>${w.deadline ? `<span class="work-deadline">📅 ${fmt(w.deadline)}</span>` : ''}${daysHtml}<span class="photo-indicator ${hasPhoto ? 'has-photo' : ''}"></span><span class="work-arrow ${wOpen ? 'open' : ''}">▶</span></span><span style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;"><button class="icon-btn" onclick="event.stopPropagation();wolfUploadWorkPhoto(${obj.id},${originalIndex})">📸</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkUp(${obj.id},${originalIndex})">⬆</button><button class="icon-btn" onclick="event.stopPropagation();wolfMoveWorkDown(${obj.id},${originalIndex})">⬇</button></span></div><div class="work-detail ${wOpen ? 'open' : ''}"><div style="margin:6px 0;"><b>📸 Фото:</b></div><div class="photo-grid">${phHtml || 'Нет фото'}</div></div></div>`;
        }).join('');
        const addWorkButton = `<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="wolfAddWork(${obj.id})">➕ Добавить этап</button></div>`;
        
        // Сводка по объекту для волка
        let summaryHtml = '';
        if (obj.startDate) {
            summaryHtml += `<div>📅 Начало: ${fmt(obj.startDate)}</div>`;
        } else {
            summaryHtml += `<div>📅 Начало: <span style="color:#666;">не указано</span></div>`;
        }
        if (obj.plannedEndDate) {
            const daysLeft = getDaysRemaining(obj.plannedEndDate);
            summaryHtml += `<div>🎯 Плановое завершение: ${fmt(obj.plannedEndDate)}`;
            if (daysLeft !== null) {
                summaryHtml += ` <span style="color:${daysLeft < 0 ? '#a04040' : '#c9a959'};">(${daysLeft < 0 ? 'Просрочено на ' + Math.abs(daysLeft) : 'осталось ' + daysLeft} дн.)</span>`;
            }
            summaryHtml += `</div>`;
        } else {
            summaryHtml += `<div>🎯 Плановое завершение: <span style="color:#666;">не указано</span></div>`;
        }
        
        return `<div class="card" id="wolf-obj-${obj.id}"><div class="object-header" onclick="toggleObject(this,'${objKey}')"><div class="flex"><h3>${escapeHtml(obj.name)} <span style="font-weight:300;color:#888;">(${escapeHtml(obj.code)})</span><span class="arrow ${objOpen ? 'open' : ''}">▶</span></h3><div style="display:flex;gap:4px;flex-wrap:wrap;"><span class="badge">ID: ${obj.id}</span></div></div><div style="color:#999;font-size:14px;">📍 ${escapeHtml(obj.address)}</div><div style="margin:8px 0;padding:10px;background:#121212;border-radius:8px;border:1px solid #282828;font-size:14px;">${summaryHtml}</div></div><div class="object-detail ${objOpen ? 'open' : ''}"><hr><h4>Дизайн-проекты</h4><div class="design-block-container"><div class="design-block-header" onclick="toggleDesignBlockHeader(this,'${designKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="design-arrow ${designOpen ? 'open' : ''}">▶</span> Дизайн-проекты (${projs.length})</span></div><div class="design-detail-container ${designOpen ? 'open' : ''}" style="display:${designOpen ? 'block' : 'none'};">${designBlocks}</div></div><hr><h4>Рекомендации</h4><div class="rec-block-container"><div class="rec-block-header" onclick="toggleRecBlockHeader(this,'${recKey}')" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;padding:4px 0;"><span><span class="rec-arrow ${recOpen ? 'open' : ''}">▶</span> Рекомендации (${recs.length})</span></div><div class="rec-detail-container ${recOpen ? 'open' : ''}" style="display:${recOpen ? 'block' : 'none'};">${recBlocks}</div></div><hr><h4>Этапы работ</h4>${statusTabs}<div id="wolf-work-list-${obj.id}" class="work-list">${worksHtml || '<span style="color:#666;font-size:14px;">Нет этапов</span>'}</div>${addWorkButton}</div></div>`;
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
            const newWork = { id: Date.now(), name: n, done: !1, deadline: null, quantity: '', unit: '', forElectrician: !1, manual: !0, status: '' };
            o.works.push(newWork);
            saveDataToLocal();
            
            if (isOnline()) {
                saveToSupabase('objects', o);
            } else {
                addPendingAction({ type: 'addWork', data: { objectId: id, work: newWork } });
            }
            
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
        
        if (isOnline()) {
            saveToSupabase('objects', o);
        } else {
            addPendingAction({ type: 'updateWork', data: { objectId: id, work: o.works[wi] } });
        }
        
        renderWolfObjects();
    }
};

window.wolfMoveWorkUp = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx <= 0) return;
    [works[idx - 1], works[idx]] = [works[idx], works[idx - 1]];
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
    renderWolfObjects(); };

window.wolfMoveWorkDown = function(objId, idx) { const obj = getObject(objId); if (!obj) return; const works = obj.works; if (idx >= works.length - 1) return;
    [works[idx], works[idx + 1]] = [works[idx + 1], works[idx]];
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
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
                    const report = {
                        id: reportId,
                        objectId: id,
                        workId: work.id,
                        photos: [compressed],
                        text: '',
                        date: new Date(),
                        approved: true
                    };
                    reports.push(report);
                    saveDataToLocal();
                    addPendingAction({
                        type: 'uploadPhoto',
                        data: report
                    });
                    showToast('📸 Фото сохранено локально (ожидает интернет)');
                    uploadedCount++;
                } else {
                    const publicUrl = await uploadPhotoToStorage(id, work.id, compressed);
                    if (publicUrl) {
                        const report = {
                            id: Date.now() + Math.random() * 1000,
                            objectId: id,
                            workId: work.id,
                            photos: [publicUrl],
                            text: '',
                            date: new Date(),
                            approved: true
                        };
                        reports.push(report);
                        await saveToSupabase('reports', report);
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
        
        if (isOnline()) {
            saveToSupabase('recommendations', r);
        } else {
            addPendingAction({ type: 'updateRecommendation', data: r });
        }
        
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
                        id: Date.now() + Math.random() * 1000,
                        objectId: r.objectId,
                        workId: Date.now(),
                        photos: [compressed],
                        date: new Date(),
                        approved: true
                    }
                });
                showToast('📸 Фото сохранено локально (ожидает интернет)');
            } else {
                const publicUrl = await uploadPhotoToStorage(r.objectId, Date.now(), compressed);
                if (publicUrl) {
                    if (!r.purchasedPhotos) r.purchasedPhotos = [];
                    r.purchasedPhotos.push(publicUrl);
                    await saveToSupabase('recommendations', r);
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
        
        if (isOnline()) {
            saveToSupabase('design_projects', p);
        } else {
            addPendingAction({ type: 'updateDesign', data: p });
        }
        
        renderClient();
        showToast('💬 Комментарий добавлен');
    }
};

window.clientApproveDesign = function(id) {
    const p = designProjects.find(x => x.id === id);
    if (p) {
        p.approvedByClient = !p.approvedByClient;
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('design_projects', p);
        } else {
            addPendingAction({ type: 'updateDesign', data: p });
        }
        
        renderClient();
        showToast(p.approvedByClient ? '✅ Проект утверждён' : '⏳ Утверждение снято');
    }
};

function renderClientWorks() {
    const container = document.getElementById('clientContent');
    const obj = getObject(currentObjectId);
    
    // Ближайшие работы (фиксированные)
    const upcomingWorks = [
        { date: '20.07', name: 'Монтаж сантехники' },
        { date: '25.07', name: 'Укладка плитки' },
        { date: '01.08', name: 'Покраска' }
    ];
    
    let html = `
    <div class="card">
        <h3>📌 Ближайшие работы</h3>
        ${upcomingWorks.map(w => `
            <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a1a1a;">
                <span>${w.date}</span>
                <span style="color:#c9a959;">${w.name}</span>
            </div>
        `).join('')}
    </div>
    <div class="card">
        <h3>📋 Этапы работ</h3>`;
    
    obj.works.forEach(w => {
        let statusHtml = '';
        if (w.status) {
            statusHtml = `<div style="font-size:13px;color:#c9a959;margin-top:4px;">📌 ${escapeHtml(w.status)}</div>`;
        }
        
        html += `
        <div style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0;">
            <div class="flex">
                <b>${escapeHtml(w.name)}</b>
                <span class="badge">${w.done ? '✅ выполнено' : '⏳ в работе'}</span>
            </div>
            ${statusHtml}
            <div style="margin-top:6px;">
                <button class="btn btn-sm" onclick="clientAddWorkStatus(${obj.id}, ${obj.works.indexOf(w)})">📝 Добавить статус</button>
            </div>
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

window.clientAddWorkStatus = function(objId, workIdx) {
    const obj = getObject(objId);
    if (!obj) return;
    const work = obj.works[workIdx];
    if (!work) return;
    
    const status = prompt('Введите статус этапа (например: "заказаны материалы, ожидаем доставку"):');
    if (status !== null && status.trim() !== '') {
        work.status = status.trim();
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('objects', obj);
        } else {
            addPendingAction({ type: 'updateObject', data: obj });
        }
        
        renderClientWorks();
        showToast('✅ Статус обновлён');
    }
};

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
                            id: Date.now() + Math.random() * 1000,
                            objectId: objId || 'general',
                            workId: Date.now(),
                            photos: [compressed],
                            date: new Date(),
                            approved: true
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
    const task = { id: Date.now(), text, objectId: objId, photos, date: new Date(), done: false };
    electricianTasks.push(task);
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('electrician_tasks', task);
    } else {
        addPendingAction({ type: 'addElectricianTask', data: task });
    }
    
    renderElectricianTasks();
    showToast('📝 Задача добавлена');
}

window.toggleElectricianTaskDone = function(id) {
    const task = electricianTasks.find(t => t.id === id);
    if (task) { 
        task.done = !task.done;
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('electrician_tasks', task);
        } else {
            addPendingAction({ type: 'updateElectricianTask', data: task });
        }
        
        renderElectricianTasks();
        showToast(task.done ? '✅ Задача выполнена' : '↩ Задача возвращена'); 
    }
};

window.deleteElectricianTask = function(id) {
    if (confirm('Удалить задачу?')) { 
        electricianTasks = electricianTasks.filter(t => t.id !== id);
        saveDataToLocal();
        
        if (isOnline()) {
            deleteFromSupabase('electrician_tasks', id);
        } else {
            addPendingAction({ type: 'deleteElectricianTask', data: { id: id } });
        }
        
        renderElectricianTasks();
        showToast('🗑 Задача удалена'); 
    }
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
    
    if (isOnline()) {
        saveToSupabase('objects', obj);
    } else {
        addPendingAction({ type: 'updateObject', data: obj });
    }
    
    renderBossObjects();
}

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
// ФУНКЦИИ ДЛЯ ЗАКУПОК (BOSS)
// ============================================================
function renderBossPurchases() {
    const container = document.getElementById('bossContent');
    container.innerHTML = `<div id="bossPurchasesList"></div>`;
    const list = document.getElementById('bossPurchasesList');
    const orders = purchaseOrders.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (!orders.length) { list.innerHTML = '<div class="card">Нет заявок на закупку</div>'; return; }
    list.innerHTML = orders.map(order => {
        const obj = getObject(order.objectId);
        const items = order.items.map(item => `<div><span>${escapeHtml(item.name)} (${escapeHtml(item.quantity)} шт.)</span> <span class="badge">${item.purchased ? '✅ Куплено' : '⏳ Не куплено'}</span></div>`).join('');
        return `<div class="card"><div class="flex"><b>Заявка на объект: ${obj ? escapeHtml(obj.name) : '—'}</b><span class="badge">${fmt(order.date)}</span></div><div><b>Товары:</b> ${items}</div><div><b>Фото:</b> ${order.photos ? order.photos.map(p => `<img src="${p}" style="width:50px;" onclick="showModal('${p}')">`).join('') : 'нет'}</div></div>`;
    }).join('');
}

// ============================================================
// ФУНКЦИИ ДЛЯ CSV
// ============================================================
window.uploadCSV = function() {
    showToast('📊 Функция загрузки CSV в разработке');
};

window.scrollToObject = function(v) {
    if (!v) return;
    const el = document.getElementById(v);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        const key = v.replace('obj-', '');
        uiState['obj-' + key] = !0;
        saveUiState();
        renderBossObjects();
    }
};

window.setWorkFilter = function(objId, filter) {
    uiState['filter-' + objId] = filter;
    saveUiState();
    renderBossObjects();
};

// ============================================================
// РЕНДЕР И ВХОД
// ============================================================
function render() {
    const app = document.getElementById('app');
    if (!currentUser) renderLogin();
    else if (['designer', 'master', 'purchaser'].includes(currentUser)) {
        renderFakeCabinet(currentUser);
    } else if (currentUser === 'boss') renderBoss();
    else if (currentUser === 'wolf') renderWolf();
    else if (currentUser === 'client') renderClient();
    else if (currentUser === 'electrician') renderElectrician();
    else renderPlaceholder();
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
    // Для кабинетов-обманок
    if (['designer', 'master', 'purchaser'].includes(r)) {
        if (!passwords[r]) {
            if (r === 'designer') passwords.designer = '30986';
            else if (r === 'master') passwords.master = '30986';
            else if (r === 'purchaser') passwords.purchaser = '30986';
            saveDataToLocal();
        }
        
        const p = prompt(`Введите пароль для роли "${getUserLabel(r)}":`);
        if (p !== passwords[r]) {
            alert('Неверный пароль');
            return;
        }
        
        currentUser = r;
        render();
        return;
    }
    
    // Для остальных ролей
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

// Показываем интерфейс сразу
render();

// Загружаем данные из Supabase в фоне
setTimeout(() => {
    loadAllFromSupabase();
}, 100);

// Проверка интернета каждые 30 секунд
setInterval(() => {
    if (isOnline() && pendingActions.length > 0) {
        syncPendingActions();
    }
}, 30000);

// При восстановлении интернета
window.addEventListener('online', () => {
    showToast('🌐 Интернет восстановлен');
    if (pendingActions.length > 0) {
        syncPendingActions();
    } else {
        loadAllFromSupabase();
    }
});

// При потере интернета
window.addEventListener('offline', () => {
    showToast('⚠️ Интернет отключён, изменения будут сохранены локально');
});

console.log('✅ СТРОЙУЧЁТ ЗАПУЩЕН С ПОЛНОЙ СИНХРОНИЗАЦИЕЙ!');
console.log('🔑 Пароль для всех ролей: 30986');
