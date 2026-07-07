// ============================================================
// ПОЛНАЯ ВЕРСИЯ С ЧЕКАМИ И ЗАКУПКАМИ (ЛЁГКАЯ)
// ============================================================

// ============================================================
// СИНХРОНИЗАЦИЯ (ВСЕ ТАБЛИЦЫ)
// ============================================================
async function syncToSupabase() {
    try {
        // 1. Объекты
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
        
        // 2. Фото-отчёты
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
        
        // 3. Дизайн-проекты
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
        
        // 4. Рекомендации
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
        
        // 5. ЧЕКИ ✅ (теперь сохраняются)
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
        
        // 6. ЗАКУПКИ ✅ (теперь сохраняются)
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
        
        // 7. Заметки
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
        
        // 8. Задачи электрика
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
    } catch (e) {
        console.error('❌ Ошибка синхронизации:', e);
        // Ошибку видит только разработчик в консоли
    }
}

// ============================================================
// ЗАГРУЗКА (ВСЕ ТАБЛИЦЫ)
// ============================================================
async function loadFromSupabase() {
    try {
        const [objectsData, reportsData, projectsData, recsData, 
               checksData, ordersData, notesData, tasksData] = await Promise.all([
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
            fetch(`${SUPABASE_URL}/rest/v1/checks?select=*`, {  // ✅ Чеки
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/purchase_orders?select=*`, {  // ✅ Закупки
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/notes?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => []),
            fetch(`${SUPABASE_URL}/rest/v1/electrician_tasks?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            }).then(r => r.json()).catch(() => [])
        ]);
        
        if (objectsData && objectsData.length) objects = objectsData;
        if (reportsData && reportsData.length) reports = reportsData;
        if (projectsData && projectsData.length) designProjects = projectsData;
        if (recsData && recsData.length) recommendations = recsData;
        if (checksData && checksData.length) checks = checksData;  // ✅
        if (ordersData && ordersData.length) purchaseOrders = ordersData;  // ✅
        if (notesData && notesData.length) notes = notesData;
        if (tasksData && tasksData.length) electricianTasks = tasksData;
        
        saveDataToLocal();
        return true;
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        return false;
    }
}

// ============================================================
// ФУНКЦИИ ДЛЯ ЧЕКОВ ✅
// ============================================================

// Добавление чека
window.addCheck = function(objectId) {
    const amount = prompt('Сумма чека (в рублях):');
    if (!amount || isNaN(amount)) return;
    
    const description = prompt('Описание:');
    if (!description) return;
    
    const date = prompt('Дата (ГГГГ-ММ-ДД):');
    if (date && !isValidDate(date)) {
        showToast('Неверный формат даты');
        return;
    }
    
    checks.push({
        id: Date.now(),
        objectId: objectId,
        amount: parseFloat(amount),
        description: description,
        date: date || new Date().toISOString().slice(0, 10),
        approved: false,
        photo: null
    });
    
    saveDataToLocal();
    syncToSupabase();
    renderBossChecks();
    showToast('💳 Чек добавлен');
};

// Одобрение чека
window.approveCheck = function(id) {
    const check = checks.find(c => c.id === id);
    if (check) {
        check.approved = !check.approved;
        saveDataToLocal();
        syncToSupabase();
        renderBossChecks();
        showToast(check.approved ? '✅ Чек одобрен' : '↩ Одобрение снято');
    }
};

// Удаление чека
window.deleteCheck = function(id) {
    if (!confirm('Удалить чек?')) return;
    checks = checks.filter(c => c.id !== id);
    saveDataToLocal();
    syncToSupabase();
    renderBossChecks();
    showToast('🗑 Чек удалён');
};

// Загрузка фото чека
window.uploadCheckPhoto = async function(id) {
    const check = checks.find(c => c.id === id);
    if (!check) return;
    
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
            const publicUrl = await uploadPhotoToStorage(check.objectId, Date.now(), compressed);
            if (publicUrl) {
                check.photo = publicUrl;
                saveDataToLocal();
                await syncToSupabase();
                renderBossChecks();
                showToast('📸 Фото чека загружено');
            }
        } catch (err) {
            console.error('Ошибка:', err);
        }
        inp.remove();
    };
    setTimeout(() => inp.click(), 50);
};

// ============================================================
// ФУНКЦИИ ДЛЯ ЗАКУПОК ✅
// ============================================================

// Добавление закупки
window.addPurchaseOrder = function(objectId) {
    const items = [];
    let total = 0;
    
    while (true) {
        const name = prompt('Название товара (или нажмите Отмена для завершения):');
        if (!name) break;
        
        const quantity = prompt('Количество:');
        if (!quantity) break;
        
        const price = prompt('Цена за единицу (в рублях):');
        if (!price || isNaN(price)) break;
        
        const itemTotal = parseFloat(quantity) * parseFloat(price);
        items.push({
            name: name,
            quantity: quantity,
            price: parseFloat(price),
            total: itemTotal
        });
        total += itemTotal;
    }
    
    if (!items.length) return;
    
    const supplier = prompt('Поставщик:');
    if (!supplier) return;
    
    purchaseOrders.push({
        id: Date.now(),
        objectId: objectId,
        items: items,
        total: total,
        supplier: supplier,
        date: new Date().toISOString().slice(0, 10),
        status: 'ожидание', // ожидание, доставлен, оплачен
        photo: null
    });
    
    saveDataToLocal();
    syncToSupabase();
    renderBossPurchases();
    showToast('📦 Заказ создан');
};

// Обновление статуса закупки
window.updateOrderStatus = function(id, status) {
    const order = purchaseOrders.find(o => o.id === id);
    if (order) {
        order.status = status;
        saveDataToLocal();
        syncToSupabase();
        renderBossPurchases();
        showToast('📦 Статус обновлён');
    }
};

// Удаление закупки
window.deletePurchaseOrder = function(id) {
    if (!confirm('Удалить заказ?')) return;
    purchaseOrders = purchaseOrders.filter(o => o.id !== id);
    saveDataToLocal();
    syncToSupabase();
    renderBossPurchases();
    showToast('🗑 Заказ удалён');
};

// ============================================================
// ОТОБРАЖЕНИЕ ЧЕКОВ В ИНТЕРФЕЙСЕ
// ============================================================

function renderBossChecks() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>💳 Чеки</h2>
                <div>
                    <button class="btn btn-primary" onclick="addCheck()">➕ Добавить чек</button>
                    <button class="btn btn-sm" onclick="renderBossObjects()">← Назад</button>
                </div>
            </div>
            <hr>
    `;
    
    if (!checks.length) {
        html += `<div style="color:#888;text-align:center;padding:20px;">Нет чеков</div>`;
    } else {
        checks.forEach(check => {
            const obj = getObject(check.objectId);
            const objName = obj ? escapeHtml(obj.name) : 'Объект удалён';
            
            html += `
                <div class="work-block">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="font-weight:bold;">${check.amount} ₽</span>
                            <span style="color:#888;">${escapeHtml(check.description)}</span>
                            <span class="badge">${objName}</span>
                            <span style="color:#888;font-size:13px;">📅 ${fmt(check.date)}</span>
                            <span class="badge ${check.approved ? 'approved' : ''}">
                                ${check.approved ? '✅ Одобрен' : '⏳ На проверке'}
                            </span>
                        </div>
                        <div>
                            <button class="btn btn-sm" onclick="uploadCheckPhoto(${check.id})">📸</button>
                            <button class="btn btn-sm" onclick="approveCheck(${check.id})">
                                ${check.approved ? '↩ Снять' : '✅ Одобрить'}
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCheck(${check.id})">🗑</button>
                        </div>
                    </div>
                    ${check.photo ? `<img src="${check.photo}" onclick="showModal('${check.photo}')" style="max-width:100px;max-height:100px;margin-top:8px;">` : ''}
                </div>
            `;
        });
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

// ============================================================
// ОТОБРАЖЕНИЕ ЗАКУПОК В ИНТЕРФЕЙСЕ
// ============================================================

function renderBossPurchases() {
    const container = document.getElementById('bossContent');
    if (!container) return;
    
    let html = `
        <div class="card">
            <div class="flex">
                <h2>📦 Закупки</h2>
                <div>
                    <button class="btn btn-primary" onclick="addPurchaseOrder()">➕ Новый заказ</button>
                    <button class="btn btn-sm" onclick="renderBossObjects()">← Назад</button>
                </div>
            </div>
            <hr>
    `;
    
    if (!purchaseOrders.length) {
        html += `<div style="color:#888;text-align:center;padding:20px;">Нет заказов</div>`;
    } else {
        purchaseOrders.forEach(order => {
            const obj = getObject(order.objectId);
            const objName = obj ? escapeHtml(obj.name) : 'Объект удалён';
            
            const statusColors = {
                'ожидание': '#f0ad4e',
                'доставлен': '#5bc0de',
                'оплачен': '#5cb85c'
            };
            
            html += `
                <div class="work-block">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="font-weight:bold;">${order.total} ₽</span>
                            <span style="color:#888;">${escapeHtml(order.supplier)}</span>
                            <span class="badge">${objName}</span>
                            <span style="color:#888;font-size:13px;">📅 ${fmt(order.date)}</span>
                            <span class="badge" style="background:${statusColors[order.status] || '#888'};">
                                ${order.status}
                            </span>
                        </div>
                        <div>
                            <select class="btn btn-sm" onchange="updateOrderStatus(${order.id}, this.value)">
                                <option value="ожидание" ${order.status === 'ожидание' ? 'selected' : ''}>⏳ Ожидание</option>
                                <option value="доставлен" ${order.status === 'доставлен' ? 'selected' : ''}>🚚 Доставлен</option>
                                <option value="оплачен" ${order.status === 'оплачен' ? 'selected' : ''}>💰 Оплачен</option>
                            </select>
                            <button class="btn btn-sm btn-danger" onclick="deletePurchaseOrder(${order.id})">🗑</button>
                        </div>
                    </div>
                    <div style="margin-top:8px;font-size:13px;color:#888;">
                        ${order.items.map(item => 
                            `${escapeHtml(item.name)}: ${item.quantity} шт × ${item.price}₽ = ${item.total}₽`
                        ).join('<br>')}
                    </div>
                </div>
            `;
        });
    }
    
    html += `</div>`;
    container.innerHTML = html;
}

// ============================================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================================

loadDataFromLocal();

if (navigator.onLine) {
    loadFromSupabase().then(() => render());
} else {
    render();
    showToast('⚠️ Нет интернета, данные из кэша', 3000);
}

// Автосохранение раз в минуту
setInterval(() => {
    if (navigator.onLine) {
        syncToSupabase();
    }
}, 60000);

// Сохранение перед закрытием
window.addEventListener('beforeunload', () => {
    if (navigator.onLine) {
        syncToSupabase();
    }
});
