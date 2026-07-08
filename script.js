// ============================================================
// ТОЛЬКО ТО, ЧТО ВЫ СКАЗАЛИ
// ============================================================

// 1. УБИРАЕМ ГРАФИК РАБОТ
// ============================================================
// Удаляем вкладку "График" у босса и волка
// Функции renderSchedule, addScheduleItem, deleteScheduleItem, clearSchedule, switchScheduleObject - удаляем

// Переопределяем renderBoss без графика
const originalRenderBoss2 = renderBoss;
renderBoss = function() {
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
};

// Переопределяем renderWolf без графика
const originalRenderWolf2 = renderWolf;
renderWolf = function() {
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
};

// ============================================================
// 2. СТАТУС ДЛЯ КЛИЕНТА (ДОБАВЛЯЕТ РУКОВОДИТЕЛЬ)
// ============================================================

// Добавляем поле для статуса объекта
objects.forEach(obj => {
    if (obj.clientStatus === undefined) obj.clientStatus = '';
});

// Функция для добавления статуса клиенту (только для руководителя)
window.addClientStatus = function(objId) {
    const obj = getObject(objId);
    if (!obj) return;
    const status = prompt('Введите статус для клиента (будет отображаться над блоком "Ближайшие работы"):');
    if (status !== null && status.trim() !== '') {
        obj.clientStatus = status.trim();
        saveDataToLocal();
        
        if (isOnline()) {
            saveToSupabase('objects', obj);
        } else {
            addPendingAction({ type: 'updateObject', data: obj });
        }
        
        renderBossObjects();
        showToast('✅ Статус для клиента обновлён');
    }
};

// Добавляем кнопку в карточку объекта для руководителя
const originalRenderBossObjects3 = renderBossObjects;
renderBossObjects = function() {
    originalRenderBossObjects3();
    
    // Добавляем кнопку "Статус клиенту" в каждый объект
    document.querySelectorAll('.card[id^="obj-"]').forEach(card => {
        if (card.querySelector('.client-status-btn')) return;
        
        const objId = parseInt(card.id.replace('obj-', ''));
        const obj = getObject(objId);
        if (!obj) return;
        
        const header = card.querySelector('.object-header .flex');
        if (header) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm client-status-btn';
            btn.textContent = '📢 Статус клиенту';
            btn.onclick = function(e) {
                e.stopPropagation();
                addClientStatus(objId);
            };
            header.appendChild(btn);
        }
    });
};

// ============================================================
// 3. ОТОБРАЖЕНИЕ СТАТУСА У КЛИЕНТА (НАД БЛИЖАЙШИМИ РАБОТАМИ)
// ============================================================

// Переопределяем renderClientWorks
const originalRenderClientWorks4 = renderClientWorks;
renderClientWorks = function() {
    const container = document.getElementById('clientContent');
    const obj = getObject(currentObjectId);
    if (!obj) { 
        if (container) container.innerHTML = '<div class="card">Объект не найден</div>'; 
        return; 
    }
    
    // Ближайшие работы (фиксированные)
    const upcomingWorks = [
        { date: '20.07', name: 'Монтаж сантехники' },
        { date: '25.07', name: 'Укладка плитки' },
        { date: '01.08', name: 'Покраска' }
    ];
    
    let html = '';
    
    // Статус от руководителя (если есть)
    if (obj.clientStatus) {
        html += `
        <div style="background:#1a1a1a;border:1px solid #c9a959;border-radius:8px;padding:12px;margin-bottom:12px;">
            <div style="color:#c9a959;font-size:14px;">📌 ${escapeHtml(obj.clientStatus)}</div>
        </div>`;
    }
    
    html += `
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
        // Фото для этапа
        const photos = reports.filter(r => r.objectId === obj.id && r.workId === w.id);
        const photoHtml = photos.length ? `
            <div style="margin:6px 0;">
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                    ${photos.map(r => `
                        <img src="${r.photos[0]}" onclick="showModal('${r.photos[0]}')" style="width:60px;height:60px;object-fit:cover;border-radius:6px;border:1px solid #282828;cursor:pointer;">
                    `).join('')}
                </div>
            </div>
        ` : '';
        
        html += `
        <div style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:8px 0;">
            <div class="flex">
                <b>${escapeHtml(w.name)}</b>
                <span class="badge">${w.done ? '✅ выполнено' : '⏳ в работе'}</span>
            </div>
            ${photoHtml}
        </div>`;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

// ============================================================
// 4. ФОРМАТ ДАТ (день.месяц.год)
// ============================================================

// Переопределяем функцию fmt для формата дд.мм.гггг
const originalFmt = fmt;
fmt = function(d) {
    if (!d) return '';
    let dt = new Date(d);
    if (isNaN(dt.getTime())) return d;
    const day = String(dt.getDate()).padStart(2, '0');
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const year = dt.getFullYear();
    return `${day}.${month}.${year}`;
};

// ============================================================
// 5. В ЧЕКАХ У КЛИЕНТА ТОЛЬКО ДАТА (БЕЗ ВРЕМЕНИ)
// ============================================================

// Переопределяем renderChecksList для клиента
const originalRenderChecksList = renderChecksList;
renderChecksList = function(role, filter) {
    if (role !== 'client') {
        originalRenderChecksList(role, filter);
        return;
    }
    
    const container = document.getElementById('clientChecksList');
    if (!container) return;
    
    let list = checks.slice();
    list = list.filter(c => c.objectId === currentObjectId);
    if (filter === 'paid') list = list.filter(c => c.paid);
    else if (filter === 'unpaid') list = list.filter(c => !c.paid);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const totalUnpaid = list.filter(c => !c.paid).reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalPaid = list.filter(c => c.paid).reduce((sum, c) => sum + (c.amount || 0), 0);
    
    let html = `<div class="checks-total"><span>💰 Неоплаченные: ${totalUnpaid.toFixed(2)} ₽</span></div>`;
    
    if (!list.length) { container.innerHTML = html + '<div class="card">Нет чеков</div>'; return; }
    
    container.innerHTML = html + list.map(c => {
        const obj = getObject(c.objectId);
        const paidStatus = c.paid ? '✅ Оплачен' : '⏳ Не оплачен';
        const dateOnly = new Date(c.date).toLocaleDateString('ru-RU');
        
        return `<div class="check-item ${c.paid ? 'paid' : ''}" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;">
      <div class="flex"><span><b>${obj ? escapeHtml(obj.name) : 'Объект удалён'}</b> — ${c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана'}</span><span class="badge">${paidStatus}</span></div>
      <div style="margin:4px 0;">Дата: ${dateOnly}</div>
      ${c.fileData ? `<div><img src="${c.fileData}" class="check-file" onclick="showModal('${c.fileData}')"></div>` : ''}
      <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
        ${!c.paid && role === 'client' ? `<button class="btn btn-sm btn-primary" onclick="clientMarkCheckPaid(${c.id})">✅ Оплатить</button>` : ''}
      </div>
    </div>`;
    }).join('');
};

// Функция для оплаты чека клиентом
window.clientMarkCheckPaid = function(checkId) {
    const c = checks.find(ch => ch.id === checkId);
    if (!c || c.paid) return;
    c.paid = !0;
    c.paidDate = new Date();
    c.paidBy = 'client';
    saveDataToLocal();
    
    if (isOnline()) {
        saveToSupabase('checks', c);
    } else {
        addPendingAction({ type: 'updateCheck', data: c });
    }
    
    renderClientChecks();
    showToast('✅ Чек оплачен');
};

// Переопределяем renderClientChecks для использования обновленной функции
const originalRenderClientChecks = renderClientChecks;
renderClientChecks = function() {
    const container = document.getElementById('clientContent');
    container.innerHTML = `<div class="flex"><div class="flex-center"><span class="badge">Фильтр:</span><button class="btn btn-sm" onclick="renderClientChecksFilter('all')">Все</button><button class="btn btn-sm" onclick="renderClientChecksFilter('unpaid')">Неоплаченные</button></div></div><div id="clientChecksList"></div>`;
    renderChecksList('client', 'all');
};

// Обновляем renderClient, чтобы использовать правильную функцию
const originalRenderClient5 = renderClient;
renderClient = function() {
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
};

console.log('✅ Все изменения применены:');
console.log('📌 Статус клиенту добавляет руководитель');
console.log('📅 Даты в формате дд.мм.гггг');
console.log('📸 У клиента отображаются фото этапов');
console.log('🧾 В чеках у клиента только дата');
console.log('❌ График работ убран');
console.log('❌ Добавление статуса у клиента убрано');
