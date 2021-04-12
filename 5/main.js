const CURRENT_VERSION = 1;
const DATABASE_NAME = 'clientDatabase';
const OBJECTSTORE_NAME = 'clients';

// +++++++SOURCE: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB ++++++
// In the following line, you should include the prefixes of implementations you want to test.
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
// DON'T use "var indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction ||
    window.webkitIDBTransaction ||
    window.msIDBTransaction || { READ_WRITE: 'readwrite' }; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
}
// ENDSOURCE

function formToDataObject(form) {
    var ret = {};
    for (const input of form) {
        if (input.dataset.dbname) {
            ret[input.dataset.dbname] = input.value;
        }
    }
    return ret;
}
function dataObjectToDisplay(dataObject) {
    // TODO:IMPLEMENT
}

var database;

function saveObjectToDatabase(object) {
    if (database) {
        var tx = database.transaction(OBJECTSTORE_NAME, 'readwrite');
        var store = tx.objectStore(OBJECTSTORE_NAME).put(object);
    }
}

window.onload = () => {
    const form = document.getElementById('addForm');
    const table = document.getElementById('display');
    form.onsubmit = (event) => {
        saveObjectToDatabase(formToDataObject(event.target));
        event.preventDefault();
        return false;
    };

    // DATABASE SETUP
    var open_request = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
    open_request.onerror = (event) => console.log('Error creating database', event);
    open_request.onsuccess = (event) => {
        database = event.target.result;
        database.onerror = (e) => {
            console.log('Database error: ', e);
        };
    };
    open_request.onupgradeneeded = () => {
        var db = open_request.result;
        if (CURRENT_VERSION === 1) {
            // create database from schatch
            var store = db.createObjectStore(OBJECTSTORE_NAME, { autoIncrement: true });
            var NIPIndex = store.createIndex('by_nip', 'nip', { unique: true });
            var by_name = store.createIndex('by_name', 'name');
            console.log('created new database');
        } else {
            throw ' NOT IMPLEMENTED YET!';
        }
    };
};
