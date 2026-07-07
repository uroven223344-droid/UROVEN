// ============================================================
// СТРОЙУЧЁТ — ПОЛНАЯ ВЕРСИЯ
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
let passwords = { boss: 'boss123', wolf: '', client: '', master: '', designer: '', purchaser: '', electrician: '', objects: {} };
let currentUser = null;
let currentObjectId = null;
let uiState = {};
let calendarOffset = 0;

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
// СОХРАНЕНИЕ В LOCALSTORAGE
// ============================================================
function saveDataToLocal() {
    try {
        localStorage.setItem('stroy_data', JSON.stringify({
            objects, reports, designProjects, recommendations,
            checks, purchaseOrders, notes, electricianTasks, passwords
        }));
    } catch (e) { console.error('Save local error:', e); }
}

function loadDataFromLocal() {
    try {
        const d = JSON.parse(localStorage.getItem('stroy_data'));
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
            works: [{ id: n + 1, name: 'Демонтаж', done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: false }],
            completed: false,
            archived: false
        });
        passwords.objects[n] = 'demo123';
        passwords.boss = 'boss123';
    }
    objects.forEach(o => {
        o.works.forEach(w => {
            if (w.quantity === undefined) w.quantity = '';
            if (w.unit === undefined) w.unit = '';
            if (w.done === undefined) w.done = false;
            if (w.forElectrician === undefined) w.forElectrician = false;
            if (w.manual === undefined) w.manual = false;
        });
    });
    recommendations.forEach(r => { if (!r.photos) r.photos = []; if (!r.purchasedPhotos) r.purchasedPhotos = []; });
    electricianTasks.forEach(t => { if (!t.photos) t.photos = []; if (t.done === undefined) t.done = false; if (t.objectId === undefined) t.objectId = null; });
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
                let w = img.width, h = img.height;
                const maxSize = 800;
                if (w > maxSize || h > maxSize) {
                    if (w > h) { h = h * maxSize / w; w = maxSize; } else { w = w * maxSize / h; h = maxSize; }
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
// СИНХРОНИЗАЦИЯ С SUPABASE
// ============================================================
async function syncToSupabase() {
    try {
        console.log('🔄 Синхронизация...');
        
        // Объекты
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
        
        // Отчёты
        for (const report of reports) {
            await fetch(`${SUPABASE_URL}/rest/v1/reports?id=eq.${report.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(report)
            });
        }
        
        // Дизайн-проекты
        for (const project of designProjects) {
            await fetch(`${SUPABASE_URL}/rest/v1/design_projects?id=eq.${project.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(project)
            });
        }
        
        // Рекомендации
        for (const rec of recommendations) {
            await fetch(`${SUPABASE_URL}/rest/v1/recommendations?id=eq.${rec.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(rec)
            });
        }
        
        // Чеки
        for (const check of checks) {
            await fetch(`${SUPABASE_URL}/rest/v1/checks?id=eq.${check.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(check)
            });
        }
        
        // Закупки
        for (const order of purchaseOrders) {
            await fetch(`${SUPABASE_URL}/rest/v1/purchase_orders?id=eq.${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(order)
            });
        }
        
        // Заметки
        for (const note of notes) {
            await fetch(`${SUPABASE_URL}/rest/v1/notes?id=eq.${note.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(note)
            });
        }
        
        // Задачи электрика
        for (const task of electricianTasks) {
            await fetch(`${SUPABASE_URL}/rest/v1/electrician_tasks?id=eq.${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(task)
            });
        }
        
        saveDataToLocal();
        console.log('✅ Синхронизация завершена');
        showToast('✅ Данные сохранены в облаке', 1500);
    } catch (e) {
        console.error('❌ Ошибка синхронизации:', e);
        showToast('⚠️ Ошибка синхронизации, данные сохранены локально', 3000);
    }
}

async function loadFromSupabase() {
    try {
        console.log('🔄 Загрузка данных из Supabase...');
        
        const [objectsData, reportsData, designProjectsData, recommendationsData,
            checksData, purchaseOrdersData, notesData, electricianTasksData
        ] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/objects?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()),
            fetch(`${SUPABASE_URL}/rest/v1/reports?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/design_projects?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/recommendations?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/checks?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/purchase_orders?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/notes?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/electrician_tasks?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => [])
        ]);

        if (objectsData && objectsData.length > 0) objects = objectsData;
        if (reportsData && reportsData.length > 0) reports = reportsData;
        if (designProjectsData && designProjectsData.length > 0) designProjects = designProjectsData;
        if (recommendationsData && recommendationsData.length > 0) recommendations = recommendationsData;
        if (checksData && checksData.length > 0) checks = checksData;
        if (purchaseOrdersData && purchaseOrdersData.length > 0) purchaseOrders = purchaseOrdersData;
        if (notesData && notesData.length > 0) notes = notesData;
        if (electricianTasksData && electricianTasksData.length > 0) electricianTasks = electricianTasksData;

        saveDataToLocal();
        console.log('✅ Данные загружены из Supabase');
        return true;
    } catch (e) {
        console.error('❌ Ошибка загрузки данных:', e);
        return false;
    }
}

// ============================================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ОБЪЕКТАМИ
// ============================================================
window.addObject = async function() {
    const n = prompt('Название объекта:');
    if (!n) return;
    const a = prompt('Адрес:');
    if (!a) return;
    let pwd = prompt('Пароль для входа:');
    if (pwd === null) return;
    pwd = pwd.trim();
    if (!pwd) { pwd = Math.random().toString(36).substring(2, 8).toUpperCase(); showToast('Пароль: ' + pwd); }
    const id = Date.now();
    objects.push({
        id,
        code: Math.random().toString(36).substring(2, 8).toUpperCase(),
        name: n,
        address: a,
        works: [],
        completed: false,
        archived: false
    });
    passwords.objects[id] = pwd;
    saveDataToLocal();
    await syncToSupabase();
    renderBossObjects();
    showToast('✅ Объект создан');
};

window.addWork = async function(id) {
    const n = prompt('Название этапа');
    if (n) {
        const o = getObject(id);
        if (o) {
            o.works.push({ id: Date.now(), name: n, done: false, deadline: null, quantity: '', unit: '', forElectrician: false, manual: true });
            saveDataToLocal();
            await syncToSupabase();
            renderBossObjects();
            showToast('➕ Этап добавлен');
        }
    }
};

window.toggleWorkStatus = async function(id, wi) {
    const o = getObject(id);
    if (o) {
        o.works[wi].done = !o.works[wi].done;
        saveDataToLocal();
        await syncToSupabase();
        renderBossObjects();
    }
};

window.setWorkDeadline = async function(id, wi) {
    const d = prompt('Дата (ГГГГ-ММ-ДД)');
    if (d) {
        if (!isValidDate(d)) { showToast('Неверный формат даты'); return; }
        const o = getObject(id);
        if (o) {
            o.works[wi].deadline = d;
            saveDataToLocal();
            await syncToSupabase();
            renderBossObjects();
            showToast('📅 Срок установлен');
        }
    }
};

window.deleteWorkPhoto = async function(id) {
    if (confirm('Удалить фото?')) {
        reports = reports.filter(r => r.id !== id);
        saveDataToLocal();
        await syncToSupabase();
        renderBossObjects();
        showToast('🗑 Фото удалено');
    }
};

window.deleteObjectPermanently = async function(id) {
    if (confirm('Удалить объект без возможности восстановления?')) {
        objects = objects.filter(o => o.id !== id);
        reports = reports.filter(r => r.objectId !== id);
        designProjects = designProjects.filter(p => p.objectId !== id);
        recommendations = recommendations.filter(r => r.objectId !== id);
        purchaseOrders = purchaseOrders.filter(o => o.objectId !== id);
        checks = checks.filter(c => c.objectId !== id);
        electricianTasks = electricianTasks.filter(t => t.objectId !== id);
        saveDataToLocal();
        await syncToSupabase();
        renderBossObjects();
        showToast('🗑 Объект удалён');
    }
};

window.completeObject = async function(id) {
    const o = getObject(id);
    if (o) {
        o.completed = !o.completed;
        saveDataToLocal();
        await syncToSupabase();
        renderBossObjects();
        showToast(o.completed ? '✅ Объект сдан' : '↩ Объект возвращён в работу');
    }
};

window.archiveObject = async function(id) {
    if (confirm('Отправить объект в архив?')) {
        const o = getObject(id);
        if (o) {
            o.archived = true;
            saveDataToLocal();
            await syncToSupabase();
            renderBossObjects();
            showToast('📦 Объект в архиве');
        }
    }
};

window.unarchiveObject = async function(id) {
    const o = getObject(id);
    if (o) { o.archived = false; saveDataToLocal(); await syncToSupabase(); renderBossObjects(); showToast('Объект возвращён из архива'); }
};

window.deleteWorkWithConfirm = async function(objId, idx) {
    const obj = getObject(objId);
    if (!obj) return;
    const work = obj.works[idx];
    if (!work) return;
    if (confirm('Удалить этап "' + work.name + '" ?')) {
        obj.works.splice(idx, 1);
        saveDataToLocal();
        await syncToSupabase();
        renderBossObjects();
        showToast('🗑 Этап удалён');
    }
};

// ============================================================
// ЗАГРУЗКА ФОТО
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
        showToast('⏳ Загрузка ' + files.length + ' фото...', 0);

        let uploadedCount = 0;

        for (let f of files) {
            try {
                const compressed = await compressImage(f);
                const publicUrl = await uploadPhotoToStorage(id, work.id, compressed);

                if (publicUrl) {
                    reports.push({
                        id: Date.now() + Math.random() * 1000,
                        objectId: id,
                        workId: work.id,
                        photos: [publicUrl],
                        text: '',
                        date: new Date().toISOString(),
                        approved: true
                    });
                    uploadedCount++;
                }
            } catch (err) {
                console.error('❌ Ошибка при загрузке файла:', err);
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
// ЭКСПОРТ / ИМПОРТ
// ============================================================
window.exportAllData = function() {
    const data = {
        objects, reports, designProjects, recommendations,
        checks, purchaseOrders, notes, electricianTasks, passwords
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
                syncToSupabase();
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
// РЕНДЕР
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
        <div class="slogan">🏗️ Умная система учёта работ</div>
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
// БОСС
// ============================================================
function renderBoss() {
    document.getElementById('app').innerHTML = `
    <div class="card">
      <div class="flex">
        <h2>👔 Руководитель</h2>
        <div>
          <button class="btn btn-sm" onclick="exportAllData()">📤</button>
          <button class="btn btn-sm" onclick="importAllData()">📥</button>
          <button class="btn btn-sm" onclick="syncToSupabase()">🔄</button>
          <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
        </div>
      </div>
    </div>
    <div class="tab-bar">
      <div class="tab active" data-tab="objects" onclick="switchTab('objects')">📋 Объекты</div>
      <div class="tab" data-tab="notes" onclick="switchTab('notes')">📝 Ежедневник</div>
      <div class="tab" data-tab="checks" onclick="switchTab('checks')">💳 Чеки</div>
      <div class="tab" data-tab="purchases" onclick="switchTab('purchases')">📦 Закупки</div>
      <div class="tab" data-tab="electrician" onclick="switchTab('electrician')">⚡ Электрик</div>
    </div>
    <div id="bossContent"></div>`;
    renderBossObjects();
}

window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tab}"]`)?.classList.add('active');
    
    switch(tab) {
        case 'objects': renderBossObjects(); break;
        case 'notes': renderBossNotes(); break;
        case 'checks': renderBossChecks(); break;
        case 'purchases': renderBossPurchases(); break;
        case 'electrician': renderElectrician(); break;
    }
};

// ============================================================
// ОБЪЕКТЫ (БОСС)
// ============================================================
function renderBossObjects() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="flex" style="margin:12px 0;">
            <button class="btn btn-primary" onclick="addObject()">➕ Новый объект</button>
        </div>
    `;
    
    const activeObjects = objects.filter(o => !o.archived);
    const archivedObjects = objects.filter(o => o.archived);
    
    [...activeObjects, ...archivedObjects].forEach(obj => {
        const objKey = 'obj-' + obj.id;
        const isOpen = uiState[objKey] !== undefined ? uiState[objKey] : false;
        
        html += `
            <div class="card" id="obj-${obj.id}">
                <div class="object-header" onclick="toggleObject('${objKey}')" style="cursor:pointer;">
                    <div class="flex">
                        <h3>
                            ${escapeHtml(obj.name)} 
                            <span style="font-weight:300;color:#888;">(${escapeHtml(obj.code)})</span>
                            ${obj.completed ? '✅' : ''}
                            ${obj.archived ? '📦' : ''}
                            <span class="arrow ${isOpen ? 'open' : ''}" style="display:inline-block;transition:transform 0.3s;transform:${isOpen ? 'rotate(90deg)' : 'rotate(0)'};">▶</span>
                        </h3>
                        <div>
                            ${!obj.archived ? `<button class="btn btn-sm" onclick="event.stopPropagation();completeObject(${obj.id})">${obj.completed ? '↩ Вернуть' : '✅ Сдать'}</button>` : ''}
                            ${!obj.archived ? `<button class="btn btn-sm" onclick="event.stopPropagation();archiveObject(${obj.id})">📦</button>` : `<button class="btn btn-sm" onclick="event.stopPropagation();unarchiveObject(${obj.id})">↩</button>`}
                            <button class="btn btn-sm" onclick="event.stopPropagation();addWork(${obj.id})">➕ Этап</button>
                            <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteObjectPermanently(${obj.id})">🗑</button>
                        </div>
                    </div>
                    <div style="color:#999;font-size:14px;">📍 ${escapeHtml(obj.address)}</div>
                </div>
                <div class="object-detail" style="display:${isOpen ? 'block' : 'none'};margin-top:12px;">
                    ${obj.works.map((w, i) => {
                        const wKey = 'work-' + obj.id + '-' + i;
                        const wOpen = uiState[wKey] !== undefined ? uiState[wKey] : false;
                        const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
                        
                        return `
                            <div class="work-block">
                                <div class="flex" style="cursor:pointer;" onclick="toggleWork('${wKey}')">
                                    <span>
                                        <span onclick="event.stopPropagation();toggleWorkStatus(${obj.id}, ${i})" style="cursor:pointer;">${w.done ? '☑' : '☐'}</span>
                                        ${escapeHtml(w.name)}
                                        ${w.deadline ? `📅 ${fmt(w.deadline)}` : ''}
                                        ${w.quantity ? `(${escapeHtml(w.quantity)} ${escapeHtml(w.unit)})` : ''}
                                        <span class="arrow ${wOpen ? 'open' : ''}" style="display:inline-block;transition:transform 0.3s;transform:${wOpen ? 'rotate(90deg)' : 'rotate(0)'};">▶</span>
                                    </span>
                                    <div>
                                        <button class="btn btn-sm" onclick="event.stopPropagation();uploadWorkPhoto(${obj.id}, ${i})">📸</button>
                                        <button class="btn btn-sm" onclick="event.stopPropagation();setWorkDeadline(${obj.id}, ${i})">📅</button>
                                        <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteWorkWithConfirm(${obj.id}, ${i})">🗑</button>
                                    </div>
                                </div>
                                <div class="work-detail" style="display:${wOpen ? 'block' : 'none'};margin-top:8px;">
                                    ${photos.length ? `
                                        <div class="photo-grid">
                                            ${photos.map(r => r.photos.map(p => `
                                                <span class="pw">
                                                    <img src="${p}" onclick="showModal('${p}')" style="max-width:100px;max-height:100px;border-radius:4px;cursor:pointer;">
                                                    <button class="del" onclick="deleteWorkPhoto(${r.id})" style="background:#a04040;color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;cursor:pointer;">×</button>
                                                </span>
                                            `).join('')).join('')}
                                        </div>
                                    ` : '<span style="color:#666;font-size:13px;">Нет фото</span>'}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================================
// TOGGLE ФУНКЦИИ
// ============================================================
window.toggleObject = function(key) {
    uiState[key] = !uiState[key];
    saveUiState();
    renderBossObjects();
};

window.toggleWork = function(key) {
    uiState[key] = !uiState[key];
    saveUiState();
    renderBossObjects();
};

window.showModal = function(src) {
    let m = document.getElementById('modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'modal';
        m.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;';
        m.onclick = () => m.remove();
        document.body.appendChild(m);
    }
    m.innerHTML = `<img src="${src}" style="max-width:90%;max-height:90%;border-radius:8px;">`;
};

// ============================================================
// ЗАМЕТКИ (БОСС)
// ============================================================
function renderBossNotes() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>📝 Ежедневник</h2>
                <button class="btn btn-primary" onclick="addNote()">➕ Запись</button>
            </div>
    `;
    
    const sortedNotes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedNotes.forEach(n => {
        html += `
            <div class="work-block">
                <div class="flex">
                    <span>📅 ${fmt(n.date)} — ${escapeHtml(n.text)}</span>
                    <button class="btn btn-sm btn-danger" onclick="deleteNote(${n.id})">🗑</button>
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

window.addNote = async function() {
    const text = prompt('Текст заметки:');
    if (!text) return;
    
    notes.push({
        id: Date.now(),
        date: new Date().toISOString().slice(0, 10),
        text: text.trim(),
        author: 'boss'
    });
    
    saveDataToLocal();
    await syncToSupabase();
    renderBossNotes();
    showToast('📝 Заметка добавлена');
};

window.deleteNote = async function(id) {
    if (!confirm('Удалить заметку?')) return;
    notes = notes.filter(n => n.id !== id);
    saveDataToLocal();
    await syncToSupabase();
    renderBossNotes();
    showToast('🗑 Заметка удалена');
};

// ============================================================
// ЧЕКИ (БОСС)
// ============================================================
function renderBossChecks() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>💳 Чеки</h2>
                <button class="btn btn-primary" onclick="addCheck()">➕ Добавить чек</button>
            </div>
    `;
    
    checks.forEach(c => {
        const obj = getObject(c.objectId);
        html += `
            <div class="work-block">
                <div class="flex">
                    <span>
                        💰 ${c.amount} ₽ — ${escapeHtml(c.description)}
                        ${obj ? `<span class="badge">${escapeHtml(obj.name)}</span>` : ''}
                        📅 ${fmt(c.date)}
                        <span class="badge ${c.approved ? 'approved' : ''}">${c.approved ? '✅ Одобрен' : '⏳ На проверке'}</span>
                    </span>
                    <div>
                        <button class="btn btn-sm" onclick="approveCheck(${c.id})">${c.approved ? '↩ Снять' : '✅ Одобрить'}</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCheck(${c.id})">🗑</button>
                    </div>
                </div>
                ${c.photo ? `<img src="${c.photo}" onclick="showModal('${c.photo}')" style="max-width:100px;max-height:100px;margin-top:8px;border-radius:4px;cursor:pointer;">` : ''}
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

window.addCheck = async function() {
    const amount = prompt('Сумма (руб):');
    if (!amount || isNaN(amount)) return;
    const description = prompt('Описание:');
    if (!description) return;
    
    let objectId = null;
    if (objects.length) {
        const list = objects.map((o, i) => `${i+1}. ${o.name}`).join('\n');
        const choice = prompt(`Выберите объект (номер):\n${list}\n0 - без объекта`);
        if (choice && choice.trim()) {
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < objects.length) objectId = objects[idx].id;
        }
    }
    
    checks.push({
        id: Date.now(),
        objectId: objectId,
        amount: parseFloat(amount),
        description: description,
        date: new Date().toISOString().slice(0, 10),
        approved: false,
        photo: null
    });
    
    saveDataToLocal();
    await syncToSupabase();
    renderBossChecks();
    showToast('💳 Чек добавлен');
};

window.approveCheck = async function(id) {
    const c = checks.find(x => x.id === id);
    if (!c) return;
    c.approved = !c.approved;
    saveDataToLocal();
    await syncToSupabase();
    renderBossChecks();
};

window.deleteCheck = async function(id) {
    if (!confirm('Удалить чек?')) return;
    checks = checks.filter(c => c.id !== id);
    saveDataToLocal();
    await syncToSupabase();
    renderBossChecks();
    showToast('🗑 Чек удалён');
};

// ============================================================
// ЗАКУПКИ (БОСС)
// ============================================================
function renderBossPurchases() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>📦 Закупки</h2>
                <button class="btn btn-primary" onclick="addPurchase()">➕ Заказ</button>
            </div>
    `;
    
    purchaseOrders.forEach(o => {
        const obj = getObject(o.objectId);
        html += `
            <div class="work-block">
                <div class="flex">
                    <span>
                        📦 ${o.total} ₽ — ${escapeHtml(o.supplier)}
                        ${obj ? `<span class="badge">${escapeHtml(obj.name)}</span>` : ''}
                        📅 ${fmt(o.date)}
                        <span class="badge" style="background:${o.status === 'ожидание' ? '#f0ad4e' : o.status === 'доставлен' ? '#5bc0de' : '#5cb85c'};">${o.status}</span>
                    </span>
                    <div>
                        <select class="btn btn-sm" onchange="updateOrderStatus(${o.id}, this.value)">
                            <option value="ожидание" ${o.status === 'ожидание' ? 'selected' : ''}>⏳ Ожидание</option>
                            <option value="доставлен" ${o.status === 'доставлен' ? 'selected' : ''}>🚚 Доставлен</option>
                            <option value="оплачен" ${o.status === 'оплачен' ? 'selected' : ''}>💰 Оплачен</option>
                        </select>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder(${o.id})">🗑</button>
                    </div>
                </div>
                <div style="font-size:13px;color:#888;margin-top:8px;">
                    ${o.items.map(i => `${escapeHtml(i.name)}: ${i.quantity} × ${i.price}₽ = ${i.total}₽`).join('<br>')}
                </div>
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

window.addPurchase = async function() {
    const items = [];
    let total = 0;
    
    while (true) {
        const name = prompt('Товар (или Enter для завершения):');
        if (!name) break;
        const quantity = prompt('Количество:');
        if (!quantity) break;
        const price = prompt('Цена:');
        if (!price || isNaN(price)) break;
        
        const itemTotal = parseFloat(quantity) * parseFloat(price);
        items.push({ name, quantity, price: parseFloat(price), total: itemTotal });
        total += itemTotal;
    }
    
    if (!items.length) return;
    
    const supplier = prompt('Поставщик:');
    if (!supplier) return;
    
    let objectId = null;
    if (objects.length) {
        const list = objects.map((o, i) => `${i+1}. ${o.name}`).join('\n');
        const choice = prompt(`Выберите объект (номер):\n${list}\n0 - без объекта`);
        if (choice && choice.trim()) {
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < objects.length) objectId = objects[idx].id;
        }
    }
    
    purchaseOrders.push({
        id: Date.now(),
        objectId: objectId,
        items: items,
        total: total,
        supplier: supplier,
        date: new Date().toISOString().slice(0, 10),
        status: 'ожидание',
        photo: null
    });
    
    saveDataToLocal();
    await syncToSupabase();
    renderBossPurchases();
    showToast('📦 Заказ создан');
};

window.updateOrderStatus = async function(id, status) {
    const o = purchaseOrders.find(x => x.id === id);
    if (!o) return;
    o.status = status;
    saveDataToLocal();
    await syncToSupabase();
    renderBossPurchases();
    showToast('✅ Статус обновлён');
};

window.deleteOrder = async function(id) {
    if (!confirm('Удалить заказ?')) return;
    purchaseOrders = purchaseOrders.filter(o => o.id !== id);
    saveDataToLocal();
    await syncToSupabase();
    renderBossPurchases();
    showToast('🗑 Заказ удалён');
};

// ============================================================
// ВОЛК
// ============================================================
function renderWolf() {
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div class="flex">
                <h2>🐺 Волк</h2>
                <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
            </div>
        </div>
        <div id="wolfContent"></div>
    `;
    
    const container = document.getElementById('wolfContent');
    let html = '';
    
    objects.forEach(obj => {
        html += `
            <div class="card">
                <h3>${escapeHtml(obj.name)} <span style="color:#888;">(${escapeHtml(obj.code)})</span></h3>
                <div style="color:#999;">📍 ${escapeHtml(obj.address)}</div>
                ${obj.works.map(w => `
                    <div class="work-block">
                        ${w.done ? '☑' : '☐'} ${escapeHtml(w.name)}
                        ${w.deadline ? `📅 ${fmt(w.deadline)}` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// ============================================================
// КЛИЕНТ
// ============================================================
function renderClient() {
    const obj = getObject(currentObjectId);
    if (!obj) {
        showToast('❌ Объект не найден');
        currentUser = null;
        render();
        return;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="card">
            <div class="flex">
                <h2>🏠 Клиент</h2>
                <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
            </div>
            <h3>${escapeHtml(obj.name)}</h3>
            <div style="color:#999;">📍 ${escapeHtml(obj.address)}</div>
            <div style="color:#c9a959;">Статус: ${obj.completed ? '✅ Сдан' : '⏳ В работе'}</div>
            ${obj.works.map(w => `
                <div class="work-block">
                    ${w.done ? '☑' : '☐'} ${escapeHtml(w.name)}
                    ${w.deadline ? `📅 ${fmt(w.deadline)}` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================
// ЭЛЕКТРИК
// ============================================================
function renderElectrician() {
    const container = document.getElementById('bossContent') || document.getElementById('app');
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>⚡ Электрик</h2>
                ${document.getElementById('bossContent') ? '' : `<button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>`}
            </div>
            <button class="btn btn-primary" onclick="addElectricianTask()">➕ Новая задача</button>
        </div>
    `;
    
    electricianTasks.forEach(t => {
        const obj = getObject(t.objectId);
        html += `
            <div class="card">
                <div class="flex">
                    <span>
                        ${t.done ? '☑' : '☐'} ${escapeHtml(t.text)}
                        ${obj ? `<span class="badge">${escapeHtml(obj.name)}</span>` : ''}
                        ${t.deadline ? `📅 ${fmt(t.deadline)}` : ''}
                    </span>
                    <div>
                        <button class="btn btn-sm" onclick="toggleElectricianTask(${t.id})">${t.done ? '↩ Вернуть' : '✅ Выполнено'}</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteElectricianTask(${t.id})">🗑</button>
                    </div>
                </div>
                ${t.comment ? `<div style="color:#888;font-size:13px;">💬 ${escapeHtml(t.comment)}</div>` : ''}
                ${t.photos && t.photos.length ? `
                    <div class="photo-grid">
                        ${t.photos.map(p => `<img src="${p}" onclick="showModal('${p}')" style="max-width:80px;max-height:80px;border-radius:4px;cursor:pointer;">`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    if (document.getElementById('bossContent')) {
        document.getElementById('bossContent').innerHTML = html;
    } else {
        document.getElementById('app').innerHTML = html;
    }
}

window.addElectricianTask = async function() {
    const text = prompt('Текст задачи:');
    if (!text) return;
    const deadline = prompt('Срок (ГГГГ-ММ-ДД):');
    if (deadline && !isValidDate(deadline)) {
        showToast('❌ Неверный формат даты');
        return;
    }
    
    let objectId = null;
    if (objects.length) {
        const list = objects.map((o, i) => `${i+1}. ${o.name}`).join('\n');
        const choice = prompt(`Выберите объект (номер):\n${list}\n0 - без объекта`);
        if (choice && choice.trim()) {
            const idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < objects.length) objectId = objects[idx].id;
        }
    }
    
    electricianTasks.push({
        id: Date.now(),
        text: text.trim(),
        deadline: deadline || null,
        objectId: objectId,
        done: false,
        photos: [],
        comment: ''
    });
    
    saveDataToLocal();
    await syncToSupabase();
    renderElectrician();
    showToast('✅ Задача создана');
};

window.toggleElectricianTask = async function(id) {
    const t = electricianTasks.find(x => x.id === id);
    if (!t) return;
    t.done = !t.done;
    saveDataToLocal();
    await syncToSupabase();
    renderElectrician();
};

window.deleteElectricianTask = async function(id) {
    if (!confirm('Удалить задачу?')) return;
    electricianTasks = electricianTasks.filter(t => t.id !== id);
    saveDataToLocal();
    await syncToSupabase();
    renderElectrician();
    showToast('🗑 Задача удалена');
};

// ============================================================
// УНИВЕРСАЛЬНЫЙ ПРОСМОТРЩИК
// ============================================================
function renderGenericViewer(roleName) {
    let html = `
        <div class="card">
            <div class="flex">
                <h2>${roleName}</h2>
                <button class="btn btn-sm" onclick="currentUser=null;render()">Выйти</button>
            </div>
        </div>
    `;
    
    objects.forEach(obj => {
        html += `
            <div class="card">
                <h3>${escapeHtml(obj.name)}</h3>
                <div style="color:#999;">📍 ${escapeHtml(obj.address)}</div>
                ${obj.works.map(w => `
                    <div class="work-block">
                        ${w.done ? '☑' : '☐'} ${escapeHtml(w.name)}
                        ${w.deadline ? `📅 ${fmt(w.deadline)}` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    });
    
    document.getElementById('app').innerHTML = html;
}

// ============================================================
// ЗАПУСК
// ============================================================
loadDataFromLocal();

if (navigator.onLine) {
    loadFromSupabase().then(() => {
        render();
        showToast('✅ Данные загружены из облака', 2000);
    });
} else {
    render();
    showToast('⚠️ Офлайн-режим, данные из кэша', 3000);
}

// Автосохранение каждые 30 секунд
setInterval(() => {
    if (navigator.onLine) {
        syncToSupabase();
    }
}, 30000);

// Сохранение перед закрытием
window.addEventListener('beforeunload', () => {
    if (navigator.onLine) {
        syncToSupabase();
    }
});
