let db;

const request = indexedDB.open('Budget_PWA', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_budget', {autoIncrement: true});
};

request.onsuccess = function (event) {
    db = event.target.result

    if (navigator.onLine) {
        sendBudget();
    }
};

request.onerror = function (event) {
    console.log("Error: " + event.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const store = transaction.objectStore('new_budget');

    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(() => {
                const transaction = db.transaction(['new_budget'], 'readwrite');
                const store = transaction.objectStore('new_budget');
                store.clear();
            });
        }
    };
}

function deletePending() {
    const transaction = db.transaction(['new_budget'], 'readwrite');
    const store = transaction.objectStore('new_budget');
    store.clear();
}

window.addEventListener('online', sendBudget);