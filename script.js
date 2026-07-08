// ============================================================
// СТРОЙУЧЁТ — ОФЛАЙН-СИНХРОНИЗАЦИЯ (ПОЛНАЯ)
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
async function loadFromSupabase() {
    if (!isOnline()) {
        console.log('⚠️ Нет интернета, загрузка из локального хранилища');
        return;
    }

    try {
        console.log('🔄 Загрузка данных из Supabase...');
        showToast('⏳ Загрузка данных из облака...');
        
        // Загружаем объекты
        const objectsResp = await fetch(`${SUPABASE_URL}/rest/v1/objects?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (objectsResp.ok) {
            const remoteObjects = await objectsResp.json();
            if (remoteObjects.length > 0) {
                // Объединяем с локальными данными
                const localIds = new Set(objects.map(o => o.id));
                for (const remoteObj of remoteObjects) {
                    if (!localIds.has(remoteObj.id)) {
                        objects.push(remoteObj);
                    } else {
                        // Обновляем существующий объект
                        const idx = objects.findIndex(o => o.id === remoteObj.id);
                        if (idx !== -1) {
                            objects[idx] = remoteObj;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteObjects.length} объектов`);
            }
        }

        // Загружаем чеки
        const checksResp = await fetch(`${SUPABASE_URL}/rest/v1/checks?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (checksResp.ok) {
            const remoteChecks = await checksResp.json();
            if (remoteChecks.length > 0) {
                const localIds = new Set(checks.map(c => c.id));
                for (const remoteCheck of remoteChecks) {
                    if (!localIds.has(remoteCheck.id)) {
                        checks.push(remoteCheck);
                    } else {
                        const idx = checks.findIndex(c => c.id === remoteCheck.id);
                        if (idx !== -1) {
                            checks[idx] = remoteCheck;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteChecks.length} чеков`);
            }
        }

        // Загружаем рекомендации
        const recsResp = await fetch(`${SUPABASE_URL}/rest/v1/recommendations?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (recsResp.ok) {
            const remoteRecs = await recsResp.json();
            if (remoteRecs.length > 0) {
                const localIds = new Set(recommendations.map(r => r.id));
                for (const remoteRec of remoteRecs) {
                    if (!localIds.has(remoteRec.id)) {
                        recommendations.push(remoteRec);
                    } else {
                        const idx = recommendations.findIndex(r => r.id === remoteRec.id);
                        if (idx !== -1) {
                            recommendations[idx] = remoteRec;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteRecs.length} рекомендаций`);
            }
        }

        // Загружаем заметки
        const notesResp = await fetch(`${SUPABASE_URL}/rest/v1/notes?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (notesResp.ok) {
            const remoteNotes = await notesResp.json();
            if (remoteNotes.length > 0) {
                const localIds = new Set(notes.map(n => n.id));
                for (const remoteNote of remoteNotes) {
                    if (!localIds.has(remoteNote.id)) {
                        notes.push(remoteNote);
                    } else {
                        const idx = notes.findIndex(n => n.id === remoteNote.id);
                        if (idx !== -1) {
                            notes[idx] = remoteNote;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteNotes.length} заметок`);
            }
        }

        // Загружаем дизайн-проекты
        const designResp = await fetch(`${SUPABASE_URL}/rest/v1/design_projects?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (designResp.ok) {
            const remoteDesign = await designResp.json();
            if (remoteDesign.length > 0) {
                const localIds = new Set(designProjects.map(d => d.id));
                for (const remoteD of remoteDesign) {
                    if (!localIds.has(remoteD.id)) {
                        designProjects.push(remoteD);
                    } else {
                        const idx = designProjects.findIndex(d => d.id === remoteD.id);
                        if (idx !== -1) {
                            designProjects[idx] = remoteD;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteDesign.length} дизайн-проектов`);
            }
        }

        // Загружаем задачи электрика
        const tasksResp = await fetch(`${SUPABASE_URL}/rest/v1/electrician_tasks?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (tasksResp.ok) {
            const remoteTasks = await tasksResp.json();
            if (remoteTasks.length > 0) {
                const localIds = new Set(electricianTasks.map(t => t.id));
                for (const remoteTask of remoteTasks) {
                    if (!localIds.has(remoteTask.id)) {
                        electricianTasks.push(remoteTask);
                    } else {
                        const idx = electricianTasks.findIndex(t => t.id === remoteTask.id);
                        if (idx !== -1) {
                            electricianTasks[idx] = remoteTask;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteTasks.length} задач электрика`);
            }
        }

        // Загружаем заказы на закупку
        const ordersResp = await fetch(`${SUPABASE_URL}/rest/v1/purchase_orders?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (ordersResp.ok) {
            const remoteOrders = await ordersResp.json();
            if (remoteOrders.length > 0) {
                const localIds = new Set(purchaseOrders.map(o => o.id));
                for (const remoteOrder of remoteOrders) {
                    if (!localIds.has(remoteOrder.id)) {
                        purchaseOrders.push(remoteOrder);
                    } else {
                        const idx = purchaseOrders.findIndex(o => o.id === remoteOrder.id);
                        if (idx !== -1) {
                            purchaseOrders[idx] = remoteOrder;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteOrders.length} заказов на закупку`);
            }
        }

        // Загружаем отчеты (фото)
        const reportsResp = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (reportsResp.ok) {
            const remoteReports = await reportsResp.json();
            if (remoteReports.length > 0) {
                const localIds = new Set(reports.map(r => r.id));
                for (const remoteReport of remoteReports) {
                    if (!localIds.has(remoteReport.id)) {
                        reports.push(remoteReport);
                    } else {
                        const idx = reports.findIndex(r => r.id === remoteReport.id);
                        if (idx !== -1) {
                            reports[idx] = remoteReport;
                        }
                    }
                }
                console.log(`✅ Загружено ${remoteReports.length} отчетов`);
            }
        }

        // Загружаем пароли
        const passwordsResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (passwordsResp.ok) {
            const remotePasswords = await passwordsResp.json();
            if (remotePasswords.length > 0) {
                for (const pwd of remotePasswords) {
                    if (pwd.role) {
                        passwords[pwd.role] = pwd.password;
                    } else if (pwd.object_id) {
                        passwords.objects[pwd.object_id] = pwd.password;
                    }
                }
                console.log(`✅ Загружены пароли`);
            }
        }

        saveDataToLocal();
        console.log('✅ Все данные загружены из Supabase');
        showToast('✅ Данные загружены из облака');
        render();
    } catch (e) {
        console.error('❌ Ошибка загрузки из Supabase:', e);
        showToast('⚠️ Ошибка загрузки данных из облака');
    }
}

// ============================================================
// СОХРАНЕНИЕ ПАРОЛЕЙ В SUPABASE
// ============================================================
async function syncPasswordsToSupabase() {
    if (!isOnline()) return;
    
    try {
        // Сохраняем пароли ролей
        const roles = ['boss', 'wolf', 'client', 'master', 'designer', 'purchaser', 'electrician'];
        for (const role of roles) {
            if (passwords[role]) {
                // Проверяем, существует ли запись
                const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?role=eq.${role}`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                });
                const existing = await checkResp.json();
                
                if (existing.length > 0) {
                    // Обновляем
                    await fetch(`${SUPABASE_URL}/rest/v1/passwords?role=eq.${role}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            password: passwords[role],
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    // Создаем
                    await fetch(`${SUPABASE_URL}/rest/v1/passwords`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            role: role,
                            password: passwords[role]
                        })
                    });
                }
            }
        }
        
        // Сохраняем пароли объектов
        for (const [objId, pwd] of Object.entries(passwords.objects)) {
            if (pwd) {
                const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?object_id=eq.${objId}`, {
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`
                    }
                });
                const existing = await checkResp.json();
                
                if (existing.length > 0) {
                    await fetch(`${SUPABASE_URL}/rest/v1/passwords?object_id=eq.${objId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            password: pwd,
                            updated_at: new Date().toISOString()
                        })
                    });
                } else {
                    await fetch(`${SUPABASE_URL}/rest/v1/passwords`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                            'Authorization': `Bearer ${SUPABASE_KEY}`,
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify({
                            object_id: parseInt(objId),
                            password: pwd
                        })
                    });
                }
            }
        }
        console.log('✅ Пароли синхронизированы');
    } catch (e) {
        console.error('❌ Ошибка синхронизации паролей:', e);
    }
}

// ============================================================
// ПРОВЕРКА ИНТЕРНЕТА И СИНХРОНИЗАЦИЯ
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
                case 'updatePassword':
                    await syncPasswordUpdate(action.data);
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

    // После успешной синхронизации загружаем свежие данные
    if (failed.length === 0) {
        await loadFromSupabase();
        showToast(`✅ Синхронизировано ${synced} действий`);
    } else {
        showToast(`⚠️ Синхронизировано ${synced}, ошибок: ${failed.length}`);
    }

    isSyncing = false;
    render();
}

async function syncPasswordUpdate(data) {
    if (data.role) {
        // Обновляем пароль роли
        const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?role=eq.${data.role}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const existing = await checkResp.json();
        
        if (existing.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/passwords?role=eq.${data.role}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    password: data.password,
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            await fetch(`${SUPABASE_URL}/rest/v1/passwords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    role: data.role,
                    password: data.password
                })
            });
        }
    } else if (data.objectId) {
        // Обновляем пароль объекта
        const checkResp = await fetch(`${SUPABASE_URL}/rest/v1/passwords?object_id=eq.${data.objectId}`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const existing = await checkResp.json();
        
        if (existing.length > 0) {
            await fetch(`${SUPABASE_URL}/rest/v1/passwords?object_id=eq.${data.objectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    password: data.password,
                    updated_at: new Date().toISOString()
                })
            });
        } else {
            await fetch(`${SUPABASE_URL}/rest/v1/passwords`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    object_id: data.objectId,
                    password: data.password
                })
            });
        }
    }
}

// ============================================================
// ФУНКЦИИ СИНХРОНИЗАЦИИ (ОБНОВЛЕННЫЕ)
// ============================================================
async function syncAddObject(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to sync object: ${text}`);
    }
}

async function syncUpdateObject(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/objects?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update object: ${text}`);
    }
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
    await syncUpdateObject(obj);
}

async function syncUpdateWork(data) {
    const obj = objects.find(o => o.id === data.objectId);
    if (!obj) throw new Error('Object not found');
    await syncUpdateObject(obj);
}

async function syncDeleteWork(data) {
    const obj = objects.find(o => o.id === data.objectId);
    if (!obj) throw new Error('Object not found');
    await syncUpdateObject(obj);
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
            'Prefer': 'return=representation'
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
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to add check: ${text}`);
    }
}

async function syncUpdateCheck(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/checks?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update check: ${text}`);
    }
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
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to add recommendation: ${text}`);
    }
}

async function syncUpdateRecommendation(data) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/recommendations?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to update recommendation: ${text}`);
    }
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
            'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to add note: ${text}`);
    }
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
// ОБНОВЛЕННАЯ ФУНКЦИЯ СОХРАНЕНИЯ ПАРОЛЕЙ
// ============================================================
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
    
    if (isOnline()) {
        syncPasswordsToSupabase();
    } else {
        addPendingAction({ type: 'updatePassword', data: { objectId: objId, password: passwords.objects[objId] } });
    }
    
    renderPasswords();
};

window.savePasswords = function() {
    saveDataToLocal();
    if (isOnline()) {
        syncPasswordsToSupabase();
        showToast('🔐 Пароли сохранены и синхронизированы');
    } else {
        addPendingAction({ type: 'updatePassword', data: { all: true } });
        showToast('🔐 Пароли сохранены локально (ожидают интернет)');
    }
};

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
// ВСЕ ОСТАЛЬНЫЕ ФУНКЦИИ (ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ)
// ============================================================

// ... [ВСЕ ФУНКЦИИ ИЗ ВАШЕГО script.js ПОСЛЕ ЭТОГО МЕСТА ОСТАЮТСЯ БЕЗ ИЗМЕНЕНИЙ]
// Включая: renderBossObjects, renderWolf, renderClient, renderElectrician,
// addObject, addWork, toggleWorkStatus, uploadWorkPhoto, и все остальные функции

// ============================================================
// ЗАПУСК
// ============================================================
loadPendingActions();
loadDataFromLocal();

// Загружаем данные из Supabase при старте
loadFromSupabase().then(() => {
    render();
});

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
        loadFromSupabase();
    }
});

// При потере интернета
window.addEventListener('offline', () => {
    showToast('⚠️ Интернет отключён, изменения будут сохранены локально');
});
