let dragged;

document.addEventListener('dragstart', (event) => {
    dragged = event.target;
    id = event.target.id;
    list = event.target.parentNode.children;
    for (let i = 0; i < list.length; i += 1) {
        if (list[i] === dragged) {
            index = i;
        }
    }
    console.log(list)
});
