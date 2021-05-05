function SwapCase(letters) {
    let ret = '';
    for (var i = 0; i < letters.length; i++) {
        if (letters[i] === letters[i].toLowerCase()) {
            ret += letters[i].toUpperCase();
        } else {
            ret += letters[i].toLowerCase();
        }
    }
    return ret;
}

onmessage = function (e) {
    data = JSON.parse(e.data);
    console.log(data);
    for (const key in data) {
        data[key] = SwapCase(data[key]);
    }
    console.log(data);
    postMessage(JSON.stringify(data));
};
