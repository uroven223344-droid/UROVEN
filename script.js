// ============================================================
// ПОЛНАЯ СИНХРОНИЗАЦИЯ С SUPABASE (ЗАМЕНИТЬ ЭТИ 2 ФУНКЦИИ)
// ============================================================

async function syncToSupabase() {
    if (isSyncing || !isOnline()) return;
    isSyncing = true;
    try {
        // ОБЪЕКТЫ
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
        
        // ПАРОЛИ (роли)
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
        
        // ПАРОЛИ ОБЪЕКТОВ
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
                        body: JSON.stringify({ object_id: objId, password: passwords.objects[objId] })
                    });
                }
            }
        }
        
        // РЕКОМЕНДАЦИИ
        for (var i = 0; i < recommendations.length; i++) {
            var rec = recommendations[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/recommendations?id=eq.' + rec.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/recommendations?id=eq.' + rec.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(rec)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(rec)
                });
            }
        }
        
        // ДИЗАЙН-ПРОЕКТЫ
        for (var i = 0; i < designProjects.length; i++) {
            var proj = designProjects[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/design_projects?id=eq.' + proj.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/design_projects?id=eq.' + proj.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(proj)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/design_projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(proj)
                });
            }
        }
        
        // ЧЕКИ
        for (var i = 0; i < checks.length; i++) {
            var check = checks[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/checks?id=eq.' + check.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/checks?id=eq.' + check.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(check)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/checks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(check)
                });
            }
        }
        
        // ЗАЯВКИ
        for (var i = 0; i < purchaseOrders.length; i++) {
            var order = purchaseOrders[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/purchase_orders?id=eq.' + order.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/purchase_orders?id=eq.' + order.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(order)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/purchase_orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(order)
                });
            }
        }
        
        // ЗАМЕТКИ
        for (var i = 0; i < notes.length; i++) {
            var note = notes[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/notes?id=eq.' + note.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/notes?id=eq.' + note.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(note)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(note)
                });
            }
        }
        
        // ЗАДАЧИ ЭЛЕКТРИКА
        for (var i = 0; i < electricianTasks.length; i++) {
            var task = electricianTasks[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/electrician_tasks?id=eq.' + task.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/electrician_tasks?id=eq.' + task.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(task)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/electrician_tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(task)
                });
            }
        }
        
        // ОТЧЕТЫ (ФОТО)
        for (var i = 0; i < reports.length; i++) {
            var report = reports[i];
            var checkResp = await fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.' + report.id, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
            });
            var existing = await checkResp.json();
            if (existing.length > 0) {
                await fetch(SUPABASE_URL + '/rest/v1/reports?id=eq.' + report.id, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(report)
                });
            } else {
                await fetch(SUPABASE_URL + '/rest/v1/reports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY },
                    body: JSON.stringify(report)
                });
            }
        }
        
        console.log('✅ ПОЛНАЯ СИНХРОНИЗАЦИЯ ВЫПОЛНЕНА');
        pendingActions = [];
        savePendingActions();
        updateStatusBar();
    } catch(e) {
        console.error('❌ Ошибка синхронизации:', e);
    }
    isSyncing = false;
}

async function loadFromSupabase() {
    if (!isOnline()) return;
    try {
        console.log('🔄 ПОЛНАЯ ЗАГРУЗКА ИЗ SUPABASE...');
        
        // ОБЪЕКТЫ
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
                        if (objects[j].id == item.id) { existing = objects[j]; break; }
                    }
                    if (!existing) objects.push(item);
                    else { for (var key in item) { if (item.hasOwnProperty(key)) existing[key] = item[key]; } }
                }
                console.log('✅ Загружено объектов: ' + data.length);
            }
        }
        
        // ПАРОЛИ
        var passResp = await fetch(SUPABASE_URL + '/rest/v1/passwords?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (passResp.ok) {
            var passData = await passResp.json();
            for (var i = 0; i < passData.length; i++) {
                var p = passData[i];
                if (p.role) passwords[p.role] = p.password;
                if (p.object_id) passwords.objects[p.object_id] = p.password;
            }
            console.log('✅ Загружено паролей: ' + passData.length);
        }
        
        // РЕКОМЕНДАЦИИ
        var recResp = await fetch(SUPABASE_URL + '/rest/v1/recommendations?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (recResp.ok) {
            var recData = await recResp.json();
            if (recData.length > 0) { recommendations = recData; console.log('✅ Рекомендаций: ' + recData.length); }
        }
        
        // ДИЗАЙН-ПРОЕКТЫ
        var designResp = await fetch(SUPABASE_URL + '/rest/v1/design_projects?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (designResp.ok) {
            var designData = await designResp.json();
            if (designData.length > 0) { designProjects = designData; console.log('✅ Дизайн-проектов: ' + designData.length); }
        }
        
        // ЧЕКИ
        var checkResp = await fetch(SUPABASE_URL + '/rest/v1/checks?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (checkResp.ok) {
            var checkData = await checkResp.json();
            if (checkData.length > 0) { checks = checkData; console.log('✅ Чеков: ' + checkData.length); }
        }
        
        // ЗАЯВКИ
        var orderResp = await fetch(SUPABASE_URL + '/rest/v1/purchase_orders?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (orderResp.ok) {
            var orderData = await orderResp.json();
            if (orderData.length > 0) { purchaseOrders = orderData; console.log('✅ Заявок: ' + orderData.length); }
        }
        
        // ЗАМЕТКИ
        var noteResp = await fetch(SUPABASE_URL + '/rest/v1/notes?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (noteResp.ok) {
            var noteData = await noteResp.json();
            if (noteData.length > 0) { notes = noteData; console.log('✅ Заметок: ' + noteData.length); }
        }
        
        // ЗАДАЧИ ЭЛЕКТРИКА
        var taskResp = await fetch(SUPABASE_URL + '/rest/v1/electrician_tasks?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (taskResp.ok) {
            var taskData = await taskResp.json();
            if (taskData.length > 0) { electricianTasks = taskData; console.log('✅ Задач электрика: ' + taskData.length); }
        }
        
        // ОТЧЕТЫ (ФОТО)
        var reportResp = await fetch(SUPABASE_URL + '/rest/v1/reports?select=*', {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
        });
        if (reportResp.ok) {
            var reportData = await reportResp.json();
            if (reportData.length > 0) { reports = reportData; console.log('✅ Отчетов: ' + reportData.length); }
        }
        
        saveDataToLocal();
        console.log('✅ ПОЛНАЯ ЗАГРУЗКА ЗАВЕРШЕНА!');
        updateStatusBar();
    } catch(e) {
        console.error('❌ Ошибка загрузки:', e);
    }
}
