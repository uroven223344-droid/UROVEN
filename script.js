// ============================================================
// ЕЖЕДНЕВНИК (Boss & Wolf)
// ============================================================
function renderBossNotes() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    container.innerHTML = '<div class="flex" style="margin-bottom:12px;"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="bossNotesCalendar"></div>';
    renderNotesCalendar('boss');
}

function renderWolfNotes() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    container.innerHTML = '<div class="flex" style="margin-bottom:12px;"><button class="btn btn-primary" onclick="addNoteForDate()">➕ Запись</button></div><div id="wolfNotesCalendar"></div>';
    renderNotesCalendar('wolf');
}

function renderNotesCalendar(role) {
    var container = document.getElementById(role === 'boss' ? 'bossNotesCalendar' : 'wolfNotesCalendar');
    if (!container) return;
    
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + calendarOffset;
    var firstDayOfMonth = new Date(year, month, 1);
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var startDay = firstDayOfMonth.getDay();
    var today = new Date();
    
    var notesByDate = {};
    for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (n.date && n.author === role) {
            var d = new Date(n.date);
            var key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
            if (!notesByDate[key]) notesByDate[key] = [];
            notesByDate[key].push(n);
        }
    }
    
    var monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    var html = '<div class="card">' +
        '<div class="month-nav">' +
        '<button class="nav-btn" onclick="changeMonth(-1)">‹</button>' +
        '<span>' + monthNames[month] + ' ' + year + '</span>' +
        '<button class="nav-btn" onclick="changeMonth(1)">›</button>' +
        '</div>' +
        '<div class="calendar">';
    
    var weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    for (var i = 0; i < weekDays.length; i++) {
        html += '<div style="text-align:center;color:#555;font-size:11px;padding:4px 0;">' + weekDays[i] + '</div>';
    }
    
    var startOffset = (startDay === 0) ? 6 : startDay - 1;
    for (var i = 0; i < startOffset; i++) {
        html += '<div class="day other-month"></div>';
    }
    
    for (var d = 1; d <= daysInMonth; d++) {
        var dt = new Date(year, month, d);
        var key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        var hasNotes = notesByDate[key] && notesByDate[key].length > 0;
        var isToday = (d === today.getDate() && month === today.getMonth() && year === today.getFullYear());
        var dayClass = (isToday ? 'today' : '') + (hasNotes ? ' has-tasks' : '');
        html += '<div class="day ' + dayClass + '" onclick="showNotesForDay(\'' + key + '\',\'' + role + '\')">' +
            '<span class="day-number">' + d + '</span>' +
            (hasNotes ? '<span class="indicator">●</span>' : '') +
            '</div>';
    }
    
    html += '</div></div><div id="' + role + 'NotesDayDetail"></div>';
    container.innerHTML = html;
}

function changeMonth(delta) {
    calendarOffset += delta;
    saveUiState();
    if (currentUser === 'boss') renderBossNotes();
    else if (currentUser === 'wolf') renderWolfNotes();
}

function showNotesForDay(key, role) {
    var container = document.getElementById(role + 'NotesDayDetail');
    if (!container) return;
    
    var dayNotes = [];
    for (var i = 0; i < notes.length; i++) {
        var n = notes[i];
        if (!n.date || n.author !== role) continue;
        var d = new Date(n.date);
        var noteKey = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        if (noteKey === key) dayNotes.push(n);
    }
    
    var dateObj = new Date(key.split('-')[0], key.split('-')[1] - 1, key.split('-')[2]);
    var html = '<div class="card"><h4>Записи на ' + dateObj.toLocaleDateString('ru-RU') + '</h4>';
    
    if (dayNotes.length === 0) {
        html += '<div style="color:#666;padding:8px 0;">Нет записей</div>';
    } else {
        for (var i = 0; i < dayNotes.length; i++) {
            var n = dayNotes[i];
            html += '<div class="flex" style="padding:6px 0;border-bottom:1px solid #1a1a1a;">' +
                '<span>' + escapeHtml(n.text) + '</span>' +
                '<span><span class="badge">' + (n.author === 'boss' ? 'Руководитель' : 'Волк') + '</span>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteNote(' + n.id + ')">🗑</button></span>' +
                '</div>';
        }
    }
    
    html += '<div style="margin-top:8px;"><button class="btn btn-sm btn-primary" onclick="addNoteForDate(\'' + key + '\')">➕ Добавить запись на этот день</button></div>';
    html += '</div>';
    container.innerHTML = html;
}

window.addNoteForDate = function(dateKey) {
    var dateStr = dateKey;
    if (!dateStr) {
        var now = new Date();
        dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    }
    var text = prompt('Текст заметки:');
    if (!text) return;
    var parts = dateStr.split('-');
    var noteDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var note = { id: Date.now() + Math.random() * 1000, author: currentUser, text: text.trim(), date: noteDate };
    notes.push(note);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('notes', note);
    if (currentUser === 'boss') renderBossNotes();
    else if (currentUser === 'wolf') renderWolfNotes();
    showToast('📝 Заметка добавлена');
};

window.deleteNote = function(id) {
    if (!confirm('Удалить заметку?')) return;
    for (var i = 0; i < notes.length; i++) {
        if (notes[i].id === id) {
            notes.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/notes?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    if (currentUser === 'boss') renderBossNotes();
    else if (currentUser === 'wolf') renderWolfNotes();
    showToast('🗑 Заметка удалена');
};

// ============================================================
// ЧЕКИ (Boss & Wolf)
// ============================================================
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
    
    var html = '<div style="margin:12px 0;"><button class="btn btn-primary" onclick="addCheck()">➕ Загрузить чек</button></div>';
    
    if (list.length === 0) {
        html += '<div class="card">Нет чеков</div>';
        container.innerHTML = html;
        return;
    }
    
    html += '<div class="checks-total"><span>💰 Неоплаченные: ' + totalUnpaid.toFixed(2) + ' ₽</span><span>✅ Оплаченные: ' + totalPaid.toFixed(2) + ' ₽</span></div>';
    
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var obj = getObject(c.objectId);
        html += '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;">' +
            '<div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div>' +
            '<div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' +
            (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') +
            '<div style="margin-top:6px;">' +
            (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') +
            '<button class="btn btn-sm btn-danger" onclick="deleteCheck(' + c.id + ')">🗑</button>' +
            '</div></div>';
    }
    container.innerHTML = html;
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
    
    var html = '<div style="margin:12px 0;"><button class="btn btn-primary" onclick="addCheck()">➕ Загрузить чек</button></div>';
    
    if (list.length === 0) {
        html += '<div class="card">Нет чеков</div>';
        container.innerHTML = html;
        return;
    }
    
    html += '<div class="checks-total"><span>💰 Неоплаченные: ' + totalUnpaid.toFixed(2) + ' ₽</span></div>';
    
    for (var i = 0; i < list.length; i++) {
        var c = list[i];
        var obj = getObject(c.objectId);
        html += '<div class="check-item ' + (c.paid ? 'paid' : '') + '" style="border:1px solid #2a2a2a;border-radius:8px;padding:10px;margin:6px 0;">' +
            '<div class="flex"><span><b>' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b> — ' + (c.amount ? c.amount.toFixed(2) + ' ₽' : 'сумма не указана') + '</span><span class="badge">' + (c.paid ? '✅ Оплачен' : '⏳ Не оплачен') + '</span></div>' +
            '<div style="margin:4px 0;">Дата: ' + fmtTime(c.date) + '</div>' +
            (c.fileData ? '<div><img src="' + c.fileData + '" class="check-file" onclick="showModal(\'' + c.fileData + '\')" style="max-width:100%;max-height:200px;border-radius:6px;cursor:pointer;"></div>' : '') +
            '<div style="margin-top:6px;">' +
            (!c.paid ? '<button class="btn btn-sm btn-primary" onclick="markCheckPaid(' + c.id + ')">✅ Оплатить</button>' : '') +
            '</div></div>';
    }
    container.innerHTML = html;
}

window.addCheck = function() {
    var available = [];
    for (var i = 0; i < objects.length; i++) {
        if (!objects[i].archived) available.push(objects[i]);
    }
    if (available.length === 0) { showToast('Нет объектов'); return; }
    
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
    if (isNaN(amount) || amount <= 0) { showToast('Введите корректную сумму'); return; }
    
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
            var check = {
                id: Date.now() + Math.random() * 1000,
                objectId: objId,
                amount: amount,
                fileData: ev.target.result,
                date: new Date(),
                paid: false,
                paidDate: null,
                paidBy: null
            };
            checks.push(check);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('checks', check);
            if (currentUser === 'boss') renderBossChecks();
            else if (currentUser === 'wolf') renderWolfChecks();
            showToast('🧾 Чек загружен');
            inp.remove();
        };
        reader.readAsDataURL(file);
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.markCheckPaid = function(checkId) {
    var c = null;
    for (var i = 0; i < checks.length; i++) {
        if (checks[i].id === checkId) { c = checks[i]; break; }
    }
    if (!c || c.paid) return;
    c.paid = true;
    c.paidDate = new Date();
    c.paidBy = currentUser;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('checks', c);
    if (currentUser === 'boss') renderBossChecks();
    else if (currentUser === 'wolf') renderWolfChecks();
    showToast('✅ Чек оплачен');
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
    if (currentUser === 'boss') renderBossChecks();
    else if (currentUser === 'wolf') renderWolfChecks();
    showToast('🗑 Чек удалён');
};

// ============================================================
// ЗАКУПКИ (Boss & Wolf)
// ============================================================
function renderBossPurchases() {
    var container = document.getElementById('bossContent');
    if (!container) return;
    
    var orders = [];
    for (var i = 0; i < purchaseOrders.length; i++) {
        orders.push(purchaseOrders[i]);
    }
    orders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    if (orders.length === 0) {
        container.innerHTML = '<div class="card">Нет заявок на закупку</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var obj = getObject(order.objectId);
        var itemsHtml = '';
        for (var j = 0; j < order.items.length; j++) {
            var item = order.items[j];
            itemsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #1a1a1a;">' +
                '<span>' + escapeHtml(item.name) + ' (' + escapeHtml(item.quantity) + ' шт.)</span>' +
                '<span class="badge">' + (item.purchased ? '✅ Куплено' : '⏳ Не куплено') + '</span>' +
                '</div>';
        }
        html += '<div class="card">' +
            '<div class="flex"><b>Заявка на объект: ' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b><span class="badge">' + fmt(order.date) + '</span></div>' +
            '<div style="margin-top:6px;"><b>Товары:</b></div>' +
            itemsHtml +
            (order.photos && order.photos.length > 0 ? '<div style="margin-top:6px;"><b>Фото:</b> ' + order.photos.map(function(p) { return '<img src="' + p + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="showModal(\'' + p + '\')">'; }).join('') + '</div>' : '') +
            '</div>';
    }
    container.innerHTML = html;
}

function renderWolfPurchases() {
    var container = document.getElementById('wolfContent');
    if (!container) return;
    
    var orders = [];
    for (var i = 0; i < purchaseOrders.length; i++) {
        orders.push(purchaseOrders[i]);
    }
    orders.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    var html = '<div style="margin:12px 0;display:flex;gap:8px;flex-wrap:wrap;">';
    html += '<button class="btn btn-primary" onclick="addPurchaseOrder()">➕ Новая заявка</button>';
    html += '</div>';
    
    if (orders.length === 0) {
        html += '<div class="card">Нет заявок. Создайте первую заявку на материалы.</div>';
        container.innerHTML = html;
        return;
    }
    
    for (var i = 0; i < orders.length; i++) {
        var order = orders[i];
        var obj = getObject(order.objectId);
        var itemsHtml = '';
        var allPurchased = true;
        
        for (var j = 0; j < order.items.length; j++) {
            var item = order.items[j];
            if (!item.purchased) allPurchased = false;
            itemsHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #1a1a1a;">' +
                '<span>' + escapeHtml(item.name) + ' — <b>' + escapeHtml(item.quantity) + '</b> шт.</span>' +
                '<span style="display:flex;gap:4px;align-items:center;">' +
                '<span class="badge" style="background:' + (item.purchased ? '#4caf50' : '#c9a959') + ';color:#0d0d0d;">' + (item.purchased ? '✅ Куплено' : '⏳ Не куплено') + '</span>' +
                '<button class="btn btn-sm" onclick="wolfTogglePurchasedItem(' + order.id + ',' + j + ')" style="padding:2px 8px;font-size:11px;background:' + (item.purchased ? '#282828' : '#c9a959') + ';color:' + (item.purchased ? '#e0e0e0' : '#0d0d0d') + ';border-color:' + (item.purchased ? '#3a3a3a' : '#c9a959') + ';">' + (item.purchased ? '↩' : '✅') + '</button>' +
                '<button class="btn btn-sm btn-danger" onclick="wolfDeleteItemFromOrder(' + order.id + ',' + j + ')" style="padding:2px 6px;font-size:11px;">×</button>' +
                '</span>' +
                '</div>';
        }
        
        var statusColor = allPurchased ? '#4caf50' : '#c9a959';
        var statusText = allPurchased ? '✅ Все куплено' : '⏳ Есть некупленные';
        
        html += '<div class="card" style="border-left:3px solid ' + statusColor + ';">' +
            '<div class="flex">' +
            '<div><b>📦 Заявка на объект: ' + (obj ? escapeHtml(obj.name) : 'Объект удалён') + '</b></div>' +
            '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
            '<span class="badge" style="background:' + statusColor + ';color:#0d0d0d;">' + statusText + '</span>' +
            '<span class="badge">' + fmt(order.date) + '</span>' +
            '<button class="btn btn-sm btn-danger" onclick="wolfDeleteOrder(' + order.id + ')" title="Удалить заявку">🗑</button>' +
            '</div>' +
            '</div>' +
            '<div style="margin-top:6px;"><b>Товары (' + order.items.length + '):</b></div>' +
            itemsHtml +
            '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
            '<input type="text" id="wolfNewItemName-' + order.id + '" placeholder="Наименование" style="flex:2;min-width:120px;padding:6px;background:#0d0d0d;color:#e0e0e0;border:1px solid #282828;border-radius:4px;">' +
            '<input type="text" id="wolfNewItemQty-' + order.id + '" placeholder="Кол-во" style="width:80px;padding:6px;background:#0d0d0d;color:#e0e0e0;border:1px solid #282828;border-radius:4px;">' +
            '<button class="btn btn-sm" onclick="wolfAddItemToOrder(' + order.id + ')">➕ Добавить</button>' +
            '</div>' +
            (order.photos && order.photos.length > 0 ? '<div style="margin-top:6px;"><b>Фото накладных:</b> ' + order.photos.map(function(p) { return '<img src="' + p + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="showModal(\'' + p + '\')">'; }).join('') + '</div>' : '') +
            '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap;align-items:center;">' +
            '<button class="btn btn-sm" onclick="editOrderComment(' + order.id + ')" style="padding:2px 8px;font-size:11px;">✏️ Комментарий</button>' +
            '<button class="btn btn-sm" onclick="wolfUploadOrderPhoto(' + order.id + ')">📸 Добавить фото</button>' +
            '<button class="btn btn-sm btn-primary" onclick="exportOrderToWhatsApp(' + order.id + ')">📱 Отправить в WhatsApp</button>' +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

window.editOrderComment = function(orderId) {
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) {
        showToast('❌ Заявка не найдена');
        return;
    }
    
    var newComment = prompt('Редактировать комментарий к заявке:', order.comment || '');
    if (newComment !== null) {
        order.comment = newComment.trim();
        saveDataToLocal();
        if (isOnline()) saveToSupabase('purchase_orders', order);
        renderWolfPurchases();
        showToast('✅ Комментарий обновлён');
    }
};

window.addPurchaseOrder = function() {
    var available = [];
    for (var i = 0; i < objects.length; i++) {
        if (!objects[i].archived) available.push(objects[i]);
    }
    if (available.length === 0) { showToast('Нет объектов'); return; }
    
    var list = '';
    for (var i = 0; i < available.length; i++) {
        list += (i+1) + '. ' + available[i].name + ' (' + available[i].code + ')\n';
    }
    var choice = prompt('Выберите объект (номер):\n' + list);
    if (!choice) return;
    var idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= available.length) { showToast('Неверный номер'); return; }
    var obj = available[idx];
    
    var comment = prompt('Комментарий к заявке (магазин, контакты, примечания):');
    
    var order = {
        id: Date.now() + Math.random() * 1000,
        objectId: obj.id,
        items: [],
        photos: [],
        date: new Date(),
        status: 'active',
        comment: comment || ''
    };
    purchaseOrders.push(order);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('📦 Заявка создана');
};

window.wolfAddItemToOrder = function(orderId) {
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) return;
    
    var name = document.getElementById('wolfNewItemName-' + orderId).value.trim();
    var qty = document.getElementById('wolfNewItemQty-' + orderId).value.trim();
    if (!name) { showToast('Введите наименование'); return; }
    if (!qty) { showToast('Введите количество'); return; }
    
    order.items.push({
        id: Date.now() + Math.random() * 1000,
        name: name,
        quantity: qty,
        purchased: false
    });
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('➕ Товар добавлен');
};

window.wolfTogglePurchasedItem = function(orderId, idx) {
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) return;
    order.items[idx].purchased = !order.items[idx].purchased;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast(order.items[idx].purchased ? '✅ Отмечено куплено' : '↩ Снято');
};

window.wolfDeleteItemFromOrder = function(orderId, idx) {
    if (!confirm('Удалить товар?')) return;
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) return;
    order.items.splice(idx, 1);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('purchase_orders', order);
    renderWolfPurchases();
    showToast('🗑 Товар удалён');
};

window.wolfDeleteOrder = function(orderId) {
    if (!confirm('Удалить заявку?')) return;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) {
            purchaseOrders.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/purchase_orders?id=eq.' + orderId, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    renderWolfPurchases();
    showToast('🗑 Заявка удалена');
};

window.wolfUploadOrderPhoto = function(orderId) {
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) return;
    
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
            if (!order.photos) order.photos = [];
            order.photos.push(ev.target.result);
            saveDataToLocal();
            if (isOnline()) saveToSupabase('purchase_orders', order);
            renderWolfPurchases();
            showToast('📸 Фото добавлено');
            inp.remove();
        };
        reader.readAsDataURL(file);
    };
    setTimeout(function() { inp.click(); }, 50);
};

window.exportOrderToWhatsApp = function(orderId) {
    var order = null;
    for (var i = 0; i < purchaseOrders.length; i++) {
        if (purchaseOrders[i].id === orderId) { order = purchaseOrders[i]; break; }
    }
    if (!order) {
        showToast('❌ Заявка не найдена');
        return;
    }
    
    var obj = getObject(order.objectId);
    if (!obj) {
        showToast('❌ Объект не найден');
        return;
    }
    
    if (order.items.length === 0) {
        showToast('❌ Заявка пуста. Добавьте товары.');
        return;
    }
    
    var text = '📦 ЗАЯВКА НА МАТЕРИАЛЫ\n';
    text += '─────────────────────\n';
    text += '🏠 Объект: ' + obj.name + '\n';
    text += '📅 Дата: ' + new Date().toLocaleDateString('ru-RU') + '\n';
    if (order.comment) {
        text += '📝 Комментарий: ' + order.comment + '\n';
    }
    text += '─────────────────────\n\n';
    text += '📋 СПИСОК ТОВАРОВ:\n';
    
    var totalItems = 0;
    for (var i = 0; i < order.items.length; i++) {
        var item = order.items[i];
        var status = item.purchased ? '✅' : '⏳';
        text += '  ' + status + ' ' + item.name + ' — ' + item.quantity + ' шт.\n';
        totalItems++;
    }
    
    text += '\n─────────────────────\n';
    text += '📊 Итого позиций: ' + totalItems + '\n';
    text += '─────────────────────\n';
    text += '📱 Создано в СтройУчёт\n';
    text += '🕒 ' + new Date().toLocaleString();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
            var phoneNumber = prompt('Введите номер телефона магазина (без +):', '');
            if (phoneNumber && phoneNumber.trim()) {
                var encodedText = encodeURIComponent(text);
                var whatsappUrl = 'https://wa.me/' + phoneNumber.trim() + '?text=' + encodedText;
                window.open(whatsappUrl, '_blank');
                showToast('✅ Заявка скопирована и открыта в WhatsApp');
            } else {
                showToast('✅ Заявка скопирована в буфер');
            }
        }).catch(function() {
            var encodedText = encodeURIComponent(text);
            var phoneNumber = prompt('Введите номер телефона магазина (без +):', '');
            if (phoneNumber && phoneNumber.trim()) {
                var whatsappUrl = 'https://wa.me/' + phoneNumber.trim() + '?text=' + encodedText;
                window.open(whatsappUrl, '_blank');
                showToast('📋 Заявка открыта в WhatsApp');
            } else {
                prompt('Скопируйте текст заявки:', text);
                showToast('📋 Заявка готова');
            }
        });
    } else {
        var encodedText = encodeURIComponent(text);
        var phoneNumber = prompt('Введите номер телефона магазина (без +):', '');
        if (phoneNumber && phoneNumber.trim()) {
            var whatsappUrl = 'https://wa.me/' + phoneNumber.trim() + '?text=' + encodedText;
            window.open(whatsappUrl, '_blank');
            showToast('📋 Заявка открыта в WhatsApp');
        } else {
            prompt('Скопируйте текст заявки:', text);
            showToast('📋 Заявка готова');
        }
    }
};

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
    
    var tabs = document.querySelectorAll('.tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onclick = function() {
            for (var j = 0; j < tabs.length; j++) { tabs[j].classList.remove('active'); }
            this.classList.add('active');
            var tab = this.dataset.tab;
            if (tab === 'objects') renderElectricianObjects();
            else if (tab === 'design') renderElectricianDesign();
            else if (tab === 'tasks') renderElectricianTasks();
        };
    }
    renderElectricianObjects();
}

function renderElectricianObjects() {
    var container = document.getElementById('electricianContent');
    if (!container) return;
    
    var active = [];
    for (var i = 0; i < objects.length; i++) {
        var hasElectricianWork = false;
        for (var j = 0; j < objects[i].works.length; j++) {
            if (objects[i].works[j].forElectrician) { hasElectricianWork = true; break; }
        }
        if (!objects[i].archived && hasElectricianWork) active.push(objects[i]);
    }
    
    if (active.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:60px 20px;background:linear-gradient(145deg, #161616, #0d0d0d);border:1px solid #222;border-radius:16px;"><div style="font-size:48px;margin-bottom:12px;">⚡</div><div style="color:#666;font-size:16px;">Нет назначенных задач</div><div style="color:#444;font-size:13px;margin-top:4px;">Задачи появятся здесь, когда вы будете назначены</div></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < active.length; i++) {
        var obj = active[i];
        var electricWorks = [];
        for (var j = 0; j < obj.works.length; j++) {
            if (obj.works[j].forElectrician) electricWorks.push(obj.works[j]);
        }
        
        var doneCount = 0;
        for (var j = 0; j < electricWorks.length; j++) {
            if (electricWorks[j].done) doneCount++;
        }
        
        var worksHtml = '';
        for (var j = 0; j < electricWorks.length; j++) {
            var w = electricWorks[j];
            var status = w.done ? '✅' : '⏳';
            var statusColor = w.done ? '#4caf50' : '#c9a959';
            var deadline = w.deadline ? ' 📅 ' + fmt(w.deadline) : '';
            worksHtml += '<div style="padding:8px 12px;margin-bottom:4px;background:#0d0d0d;border-radius:8px;border-left:3px solid ' + statusColor + ';display:flex;justify-content:space-between;align-items:center;">' +
                '<span style="font-size:14px;color:#e0e0e0;">' + escapeHtml(w.name) + '</span>' +
                '<span style="font-size:13px;color:' + statusColor + ';background:rgba(0,0,0,0.3);padding:2px 12px;border-radius:12px;">' + status + deadline + '</span>' +
                '</div>';
        }
        
        html += '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:16px;padding:16px;margin-bottom:16px;border:1px solid #222;box-shadow:0 4px 30px rgba(0,0,0,0.3);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">' +
            '<div>' +
            '<h3 style="margin:0;color:#e8e8e8;font-size:17px;">' + escapeHtml(obj.name) + ' <span style="font-weight:300;color:#888;font-size:13px;">(' + escapeHtml(obj.code) + ')</span></h3>' +
            '<div style="color:#999;font-size:13px;margin-top:2px;">📍 ' + escapeHtml(obj.address) + '</div>' +
            '</div>' +
            '<span style="background:#1a1a1a;color:#888;padding:4px 12px;border-radius:20px;font-size:11px;border:1px solid #282828;">ID: ' + obj.id + '</span>' +
            '</div>' +
            '<div style="margin-top:10px;display:flex;align-items:center;gap:8px;padding:8px 12px;background:#0d0d0d;border-radius:8px;border:1px solid #1a1a1a;">' +
            '<span style="font-size:13px;color:#888;">📋 Мои задачи (' + electricWorks.length + ')</span>' +
            '<span style="margin-left:auto;font-size:11px;color:' + (doneCount === electricWorks.length ? '#4caf50' : '#c9a959') + ';">' + doneCount + '/' + electricWorks.length + ' выполнено</span>' +
            '</div>' +
            '<div style="margin-top:6px;">' +
            worksHtml +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

function renderElectricianDesign() {
    var container = document.getElementById('electricianContent');
    if (!container) return;
    
    var projs = [];
    for (var i = 0; i < designProjects.length; i++) {
        var p = designProjects[i];
        if (p.roles && p.roles.includes('electrician')) {
            projs.push(p);
        }
    }
    
    if (projs.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:60px 20px;background:linear-gradient(145deg, #161616, #0d0d0d);border:1px solid #222;border-radius:16px;"><div style="font-size:48px;margin-bottom:12px;">🎨</div><div style="color:#666;font-size:16px;">Нет доступных дизайн-проектов</div></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < projs.length; i++) {
        var p = projs[i];
        var obj = getObject(p.objectId);
        var files = '';
        if (p.files) {
            for (var j = 0; j < p.files.length; j++) {
                var f = p.files[j];
                var isImg = f.startsWith('data:image/') || f.startsWith('http');
                files += isImg ? '<img src="' + f + '" onclick="showModal(\'' + f + '\')" style="width:50px;height:50px;object-fit:cover;border-radius:4px;border:1px solid #282828;cursor:pointer;">' : '<a href="' + f + '" target="_blank" style="color:#c9a959;">📄</a>';
            }
        }
        if (!files) files = 'нет';
        
        var comments = '';
        if (p.comments) {
            for (var j = 0; j < p.comments.length; j++) {
                var c = p.comments[j];
                comments += '<div style="padding:2px 0;font-size:13px;color:#888;">' + escapeHtml(c.author) + ': ' + escapeHtml(c.text) + ' <span style="color:#555;font-size:11px;">' + fmt(c.date) + '</span></div>';
            }
        }
        if (!comments) comments = 'нет';
        
        html += '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:12px;padding:16px;margin-bottom:12px;border:1px solid #222;box-shadow:0 4px 20px rgba(0,0,0,0.3);">' +
            '<div class="flex"><h3 style="color:#e8e8e8;font-size:16px;margin:0;">' + escapeHtml(p.title) + '</h3><span class="badge" style="background:' + (p.approvedByClient ? '#4caf50' : '#c9a959') + ';color:#0d0d0d;">' + (p.approvedByClient ? '✅ Утверждён' : '⏳ Ожидает') + '</span></div>' +
            '<div style="color:#999;font-size:13px;margin-top:2px;">Объект: ' + (obj ? escapeHtml(obj.name) : '—') + '</div>' +
            '<div style="margin-top:4px;"><b style="color:#888;">Файлы:</b> ' + files + '</div>' +
            '<div style="margin-top:4px;"><b style="color:#888;">Комментарии:</b> ' + comments + '</div>' +
            '</div>';
    }
    container.innerHTML = html;
}

function renderElectricianTasks() {
    var container = document.getElementById('electricianContent');
    if (!container) return;
    
    var html = '<div style="margin:12px 0;"><button class="btn btn-primary" onclick="addElectricianTask()">➕ Новая задача</button></div><div id="electricianTasksList"></div>';
    container.innerHTML = html;
    renderElectricianTasksList();
}

function renderElectricianTasksList() {
    var container = document.getElementById('electricianTasksList');
    if (!container) return;
    
    var tasks = [];
    for (var i = 0; i < electricianTasks.length; i++) {
        tasks.push(electricianTasks[i]);
    }
    tasks.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="card" style="text-align:center;padding:40px 20px;background:linear-gradient(145deg, #161616, #0d0d0d);border:1px solid #222;border-radius:16px;"><div style="font-size:36px;margin-bottom:8px;">📭</div><div style="color:#666;font-size:14px;">Нет созданных задач</div></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var obj = t.objectId ? getObject(t.objectId) : null;
        var photosHtml = '';
        if (t.photos) {
            for (var j = 0; j < t.photos.length; j++) {
                photosHtml += '<img src="' + t.photos[j] + '" onclick="showModal(\'' + t.photos[j] + '\')" style="width:40px;height:40px;object-fit:cover;border-radius:4px;border:1px solid #282828;cursor:pointer;">';
            }
        }
        
        html += '<div style="background:linear-gradient(145deg, #161616 0%, #0d0d0d 100%);border-radius:12px;padding:14px 16px;margin-bottom:10px;border:1px solid #222;border-left:3px solid ' + (t.done ? '#4caf50' : '#c9a959') + ';">' +
            '<div class="flex">' +
            '<span><b style="color:#e0e0e0;">' + escapeHtml(t.text) + '</b> ' + (obj ? '<span style="color:#888;font-size:13px;">(объект: ' + escapeHtml(obj.name) + ')</span>' : '') + '</span>' +
            '<span style="display:flex;gap:4px;align-items:center;">' +
            '<span class="badge" style="background:' + (t.done ? '#4caf50' : '#c9a959') + ';color:#0d0d0d;">' + (t.done ? '✅ выполнено' : '⏳ в работе') + '</span>' +
            '<button class="btn btn-sm" onclick="toggleElectricianTaskDone(' + t.id + ')" style="padding:2px 8px;font-size:11px;background:' + (t.done ? '#282828' : '#c9a959') + ';color:' + (t.done ? '#e0e0e0' : '#0d0d0d') + ';border:none;border-radius:4px;cursor:pointer;">' + (t.done ? '↩' : '✅') + '</button>' +
            '<button class="btn btn-sm btn-danger" onclick="deleteElectricianTask(' + t.id + ')" style="padding:2px 6px;font-size:11px;border:none;border-radius:4px;cursor:pointer;">×</button>' +
            '</span>' +
            '</div>' +
            '<div style="font-size:12px;color:#888;margin-top:2px;">' + fmtTime(t.date) + '</div>' +
            (photosHtml ? '<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">' + photosHtml + '</div>' : '') +
            '</div>';
    }
    container.innerHTML = html;
}

window.addElectricianTask = function() {
    var text = prompt('Текст задачи:');
    if (!text) return;
    
    var objId = null;
    var available = [];
    for (var i = 0; i < objects.length; i++) {
        if (!objects[i].archived) available.push(objects[i]);
    }
    if (available.length > 0) {
        var list = '';
        for (var i = 0; i < available.length; i++) {
            list += (i+1) + '. ' + available[i].name + '\n';
        }
        var choice = prompt('Выберите объект (номер) или 0 для без объекта:\n' + list);
        if (choice !== null) {
            var idx = parseInt(choice) - 1;
            if (idx >= 0 && idx < available.length) objId = available[idx].id;
        }
    }
    
    var task = { id: Date.now() + Math.random() * 1000, text: text.trim(), objectId: objId, photos: [], date: new Date(), done: false };
    electricianTasks.push(task);
    saveDataToLocal();
    if (isOnline()) saveToSupabase('electrician_tasks', task);
    renderElectricianTasks();
    showToast('📝 Задача добавлена');
};

window.toggleElectricianTaskDone = function(id) {
    var task = null;
    for (var i = 0; i < electricianTasks.length; i++) {
        if (electricianTasks[i].id === id) { task = electricianTasks[i]; break; }
    }
    if (!task) return;
    task.done = !task.done;
    saveDataToLocal();
    if (isOnline()) saveToSupabase('electrician_tasks', task);
    renderElectricianTasks();
    showToast(task.done ? '✅ Задача выполнена' : '↩ Задача возвращена');
};

window.deleteElectricianTask = function(id) {
    if (!confirm('Удалить задачу?')) return;
    for (var i = 0; i < electricianTasks.length; i++) {
        if (electricianTasks[i].id === id) {
            electricianTasks.splice(i, 1);
            break;
        }
    }
    saveDataToLocal();
    if (isOnline()) {
        fetch(SUPABASE_URL + '/rest/v1/electrician_tasks?id=eq.' + id, {
            method: 'DELETE',
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
    }
    renderElectricianTasks();
    showToast('🗑 Задача удалена');
};
