const CURRENT_VERSION = 2;
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
function insertTestData() {
    const data = [
        {
            name: 'Test1',
            contact_name: 'Jan',
            contact_surname: 'Kowalski',
            contact_email: 'user.name@asm.hcf',
            nip: '123-456-78-19',
            clienturl: 'https://google.pl',
        },
        {
            name: 'HCF Shipyards Co.',
            contact_name: 'Malina',
            contact_surname: 'Torval',
            contact_email: 'mailna.t@hcfc.co',
            nip: '456-456-11-12',
            clienturl: 'https://hcfc.co',
        },
        {
            name: 'A_duval party',
            contact_name: 'Alina',
            contact_surname: 'Duval',
            contact_email: 'kappa@duval.gov.pl',
            nip: '123-112-11-11',
            clienturl: 'https://duval.gov.pl',
        },
        {
            name: 'sdasdasdasda',
            contact_name: 'asd1',
            contact_surname: 'asd2',
            contact_email: 'user.name@asm.hcf',
            nip: '123-321-11-12',
            clienturl: 'https://sdasdasdasda.pl',
        },
        {
            name: '123123123123',
            contact_name: 'fgh',
            contact_surname: 'hgffgh',
            contact_email: 'user.name@asm.hcf',
            nip: '444-555-66-77',
            clienturl: 'https://hgffgh.pl',
        },
    ];
    for (let index = 0; index < data.length; index++) {
        const element = data[index];
        saveObjectToDatabase(element);
    }
}
function create_delete_button(id) {
    let delete_button = document.createElement('button');
    delete_button.innerHTML = 'Usuń';
    delete_button.addEventListener('click', (event) => {
        if (database) {
            let rq = database.transaction(OBJECTSTORE_NAME, 'readwrite').objectStore(OBJECTSTORE_NAME).delete(id);

            rq.onsuccess = (e) => {
                console.log(e);
            };
            refreshDataDisplay();
        }
    });
    return delete_button;
}

var table;
var database;
function refreshDataDisplay(comparison = (object) => true) {
    if (database) {
        var store = database.transaction(OBJECTSTORE_NAME, 'readonly').objectStore(OBJECTSTORE_NAME);
        var newBody = document.createElement('tbody');

        store.openCursor().onsuccess = (e) => {
            var c = e.target.result;
            if (c) {
                if (comparison(c.value)) {
                    console.log("inside")
                    var tr = document.createElement('tr');
                    for (const key in c.value) {
                        var data = document.createElement('td');
                        data.innerHTML = c.value[key];
                        tr.appendChild(data);
                    }
                    // Button do usuwania
                    let td = document.createElement('td');
                    td.appendChild(create_delete_button(c.key));
                    tr.appendChild(td);

                    newBody.appendChild(tr);
                    c.continue();
                }
            } else {
                table.replaceChild(newBody, table.getElementsByTagName('tbody')[0]);
            }
        };
    }
}

function saveObjectToDatabase(object) {
    if (database) {
        var tx = database.transaction(OBJECTSTORE_NAME, 'readwrite');
        var store = tx.objectStore(OBJECTSTORE_NAME).put(object);
    }
}

// MAIN FUNCTIONALITY

refreshDataDisplay();
window.onload = () => {
    const inputForm = document.getElementById('addForm');
    errors = document.getElementById('errors');
    table = document.getElementById('display');
    // EVENT LISTENERS
    inputForm.onsubmit = (event) => {
        saveObjectToDatabase(formToDataObject(event.target));
        refreshDataDisplay();
        event.preventDefault();
        return false;
    };
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('input', (e) => {
        var keyword = e.target.value;
        refreshDataDisplay((object) => {
            const kwd = keyword;
            let ret = false;
            for (const key in object) {
                if (object[key].includes(kwd)) {
                    ret = true;
                }
            }
            console.log(ret, kwd, object);
            return ret;
        });
    });

    // DATABASE SETUP
    var open_request = indexedDB.open(DATABASE_NAME, CURRENT_VERSION);
    open_request.onerror = (event) => console.log('Error creating database', event);
    open_request.onsuccess = (event) => {
        database = event.target.result;
        database.onerror = (e) => {
            console.log('Database error: ', e);
        };
        refreshDataDisplay();
    };
    open_request.onupgradeneeded = (e) => {
        var db = open_request.result;
        console.log(e);
        var old_ver = e.oldVersion;
        if (old_ver < 1) {
            // create database from schatch
            var store = db.createObjectStore(OBJECTSTORE_NAME, { autoIncrement: true });
            store.createIndex('by_nip', 'nip');
            store.createIndex('by_name', 'name');
            console.log('created new database');
        }
        if (old_ver < 2) {
            var upgradeTransaction = e.target.transaction;
            var store = upgradeTransaction.objectStore(OBJECTSTORE_NAME);

            store.createIndex('by_contact_email', 'contact_email');
            store.createIndex('by_contact_name', 'contact_name');
            store.createIndex('by_contact_surname', 'contact_surname');
            console.log('updated database');
        } else {
            throw ' NOT IMPLEMENTED YET!';
        }
    };
};
