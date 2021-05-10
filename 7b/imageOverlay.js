function CalculateOverlay(letters) {
}

onmessage = function (e) {
    data = JSON.parse(e.data);
    console.log(data)
    postMessage(JSON.stringify(data));
};
