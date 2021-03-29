let dragged;
let id;
let list;
let startIndex;

function generateList(ammount, start = 1) {}

function resetOl() {
    let ol = document.getElementById("root");
    ol.innerHTML = `            <li draggable="true" id="1" class="droppable">Element Listy 1</li>
    <li draggable="true" id="2" class="droppable">Element Listy 2</li>
    <li draggable="true" id="3" class="droppable nostyle">
        <ol>
            <li draggable="true" id="11" class="droppable">Element Listy 1</li>
            <li draggable="true" id="12" class="droppable">Element Listy 2</li>
            <li draggable="true" id="13" class="droppable">Element Listy 3</li>
            <li draggable="true" id="14" class="droppable">Element Listy 4</li>
            <li draggable="true" id="15" class="droppable">Element Listy 5</li>
        </ol>
    </li>
    <li draggable="true" id="4" class="droppable">Element Listy 4</li>
    <li draggable="true" id="5" class="droppable">Element Listy 5</li>`;
}

document.addEventListener('dragstart', (event) => {
    dragged = event.target;
    id = event.target.id;
    list = event.target.parentNode.children;
    for (let i = 0; i < list.length; i++) {
        if (list[i] === event.target) {
            startIndex = 1;
        }
    }
    return false;
});

document.addEventListener('dragover', (event) => {
    event.preventDefault();
});

document.addEventListener('drop', (event) => {
    let target = event.target;
    let stopIndex;
    if (target.className === 'droppable' && target.id !== id) {
        dragged.draggable = true;
        dragged.classList.add("droppable")
        dragged.remove(dragged);
        for (let i = 0; i < list.length; i++) {
            if (list[i] === target) {
                stopIndex = 1;
            }
        }
        if (startIndex > stopIndex) {
            target.before(dragged);
        } else {
            target.after(dragged);
        }
        
    }
    return false;
});
