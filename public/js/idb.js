const { response } = require("express");

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

    const budgetStore = transaction.objectStore('new_budget');

    budgetStore.add(record);
};

function sendBudget() {
    const transaction = db.transaction(['new_budget'], 'readwrite');

    const budgetStore = transaction.objectStore('new_budget');

    const getAll = budgetStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }
                const transaction = db.transaction(['new_budget'], 'readwrite');

                const budgetStore = transaction.objectStore('new_budget');

                budgetStore.clear();
            })
            .catch(err => {
                console.log(err);
            });
        }
};

window.addEventListener('online', sendBudget);