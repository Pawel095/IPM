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
const IMAGE_OVERLAY_WORKER = new Worker('imageOverlay.js');
const IMAGE_DATA_WORKER = new Worker('imageOverlay.js');

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
    item.image_data ="data:image/jpeg;base64,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"
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
                if (c.dataset.dbname !== 'image_data') {
                    inputClone.value = c.textContent;
                    inputClones.push(inputClone);
                    newTd.appendChild(inputClone);
                } else {
                    inputClone.value = c.childNodes[0].src;
                    inputClones.push(inputClone);
                    newTd.appendChild(inputClone);
                }

                c.replaceWith(newTd);
            }
        }
        edit_button.onclick = on_edit_done_handler;
        edit_button.innerHTML = 'Zapisz';
    }
    function on_edit_done_handler(event) {
        let ret = {};
        console.log(inputClones)
        for (const key in inputClones) {
            ret[inputClones[key].dataset.dbname] = inputClones[key].value;
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
                        if (key !== 'image_data') {
                            var data = document.createElement('td');
                            data.innerHTML = c.value[key];
                            data.setAttribute('data-dbname', key);
                            tr.appendChild(data);
                        } else {
                            let data = document.createElement('td');
                            let img = document.createElement('img');
                            img.src = c.value[key];
                            data.setAttribute('data-dbname', key);
                            data.appendChild(img);
                            tr.appendChild(data);
                        }
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
    updateHiddenInput();
}

let inputForm;
function swapCase() {
    console.log(formToDataObject(inputForm));
    SWAP_LETTERS_WORKER.postMessage(JSON.stringify(formToDataObject(inputForm)));
}
let linkInput;
function calculate_image_overlay() {
    updateHiddenInput();
    IMAGE_OVERLAY_WORKER.postMessage(JSON.stringify({ form: formToDataObject(inputForm), imageLink: linkInput.value }));
}

let imageDataInput;
let canvas;
function updateHiddenInput() {
    IMAGE_DATA_WORKER.postMessage(JSON.stringify({ form: formToDataObject(inputForm), imageLink: linkInput.value }));
    IMAGE_DATA_WORKER.onmessage = (e) => {
        const data = JSON.parse(e.data);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 100, 100);

        let img = new window.Image();
        img.width = 100;
        img.height = 100;
        img.src = linkInput.value;
        img.crossOrigin = 'anonymous';
        img.onload = (e) => {
            ctx.drawImage(img, 0, 0, 100, 100);
            console.log(`rgba(${data.r},${data.g},${data.b},0.5)`);
            ctx.fillStyle = `rgba(${data.r},${data.g},${data.b},0.5)`;
            ctx.fillRect(0, 0, 100, 100);
            imageDataInput.value = canvas.toDataURL('image/jpeg');
        };
    };
}

refreshDataDisplay();
window.onload = () => {
    linkInput = document.getElementById('image_link');
    inputForm = document.getElementById('addForm');
    errors = document.getElementById('errors');
    table = document.getElementById('display');
    imageDataInput = document.getElementById('image_data');
    canvas = document.getElementById('img_canvas');
    updateHiddenInput();

    // SWAP_LETTERS_WORKER message Listener
    SWAP_LETTERS_WORKER.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log(data);
        dataObjectToForm(data);
    };

    IMAGE_OVERLAY_WORKER.onmessage = (e) => {
        const imgd = document.getElementById('img_display');
        const canvas = document.getElementById('img_canvas');
        const data = JSON.parse(e.data);

        console.log(data);
        let style = `linear-gradient(0deg,rgba(${data.r},${data.g},${data.b},0.50),rgba(${data.r},${data.g},${data.b},0.50)), url('${data.imageLink}')`;
        console.log(style);
        imgd.style['background'] = style;
        imgd.style['backgroundSize'] = 'cover';
    };
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
