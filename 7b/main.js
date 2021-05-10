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

if (!window.Worker) {
    throw 'WORKERS NOT SUPPORTED!';
}
const SWAP_LETTERS_WORKER = new Worker('SwapLettersWorker.js');

function formToDataObject(form) {
    var ret = {};
    for (const input of form) {
        if (input.dataset.dbname) {
            ret[input.dataset.dbname] = input.value;
        }
    }
    return ret;
}
function dataObjectToForm(object) {
    for (c of document.querySelectorAll('input[data-dbname]')) {
        c.value = object[c.dataset.dbname];
    }
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
function get_3_digits() {
    return String(Math.floor(Math.random() * (999 - 100 + 1) + 100));
}
function get_2_digits() {
    return String(Math.floor(Math.random() * (99 - 10 + 1) + 10));
}
function generate_random_entry() {
    let item = window.PRERANDOMIZAED_DATA[Math.floor(Math.random() * PRERANDOMIZAED_DATA.length)];
    item.nip = get_3_digits() + '-' + get_3_digits() + '-' + get_2_digits() + '-' + get_2_digits();
    item.clienturl = ('https://' + item.name.replace(/\s+/g, '').replace(/\./g, '') + '.com').toLowerCase();
    return item;
}

function create_edit_button(id, row) {
    const EDIT_ROW_ID = id;
    let edit_button = document.createElement('button');
    edit_button.innerHTML = 'Edytuj';
    edit_button.onclick = on_edit_handler;
    let inputClones = [];

    function on_edit_handler(event) {
        console.log(EDIT_ROW_ID, row);
        let inputs = {};
        for (c of document.querySelectorAll('input[data-dbname]')) {
            inputs[c.dataset.dbname] = c;
        }

        for (const c of row.childNodes) {
            // Jeżeli jest tekst z bazy wewnątrz
            if (c.dataset.dbname) {
                let newTd = document.createElement('td');
                let inputClone = inputs[c.dataset.dbname].cloneNode(true);
                inputClone.value = c.textContent;
                inputClones.push(inputClone);
                newTd.appendChild(inputClone);
                c.replaceWith(newTd);
            }
        }
        edit_button.onclick = on_edit_done_handler;
        edit_button.innerHTML = 'Zapisz';
    }
    function on_edit_done_handler(event) {
        let ret = {};
        for (const key in inputClones) {
            ret[key] = inputClones[key].value;
        }
        console.log(ret);
        updateObject(EDIT_ROW_ID, ret);
    }

    return edit_button;
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
                    var tr = document.createElement('tr');
                    for (const key in c.value) {
                        var data = document.createElement('td');
                        data.innerHTML = c.value[key];
                        data.setAttribute('data-dbname', key);
                        tr.appendChild(data);
                    }
                    // Button do usuwania
                    let td = document.createElement('td');
                    td.appendChild(create_delete_button(c.key));
                    td.appendChild(create_edit_button(c.key, tr));
                    tr.appendChild(td);

                    newBody.appendChild(tr);
                }
                c.continue();
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

function updateObject(id, object) {
    let tx = database.transaction(OBJECTSTORE_NAME, 'readwrite');
    let store = tx.objectStore(OBJECTSTORE_NAME);
    store.get(id).onsuccess = function (e) {
        store.put(object, id);
        refreshDataDisplay();
    };
}

function insertRandomEntry() {
    const data = generate_random_entry();
    dataObjectToForm(data);
}

let inputForm;
function swapCase() {
    console.log(formToDataObject(inputForm));
    SWAP_LETTERS_WORKER.postMessage(JSON.stringify(formToDataObject(inputForm)));
}

// MAIN FUNCTIONALITY
refreshDataDisplay();
window.onload = () => {
    // SWAP_LETTERS_WORKER message Listener
    SWAP_LETTERS_WORKER.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        dataObjectToForm(data);
    };

    inputForm = document.getElementById('addForm');
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

    const generate_random_entry_button = document.getElementById('generate_random_entry');
    generate_random_entry_button.addEventListener('click', (e) => {
        const newrow = generate_random_entry();
        saveObjectToDatabase(newrow);
        refreshDataDisplay();
        e.preventDefault();
        return false;
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
