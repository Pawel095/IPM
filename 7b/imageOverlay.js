const CHARS = Object.freeze({
    a: 1,
    b: 2,
    c: 3,
    d: 4,
    e: 5,
    f: 6,
    g: 7,
    h: 8,
    i: 9,
    j: 10,
    k: 11,
    l: 12,
    m: 13,
    n: 14,
    o: 15,
    p: 16,
    q: 17,
    r: 18,
    s: 19,
    t: 20,
    u: 21,
    v: 22,
    w: 23,
    x: 24,
    y: 25,
    z: 26,
});

function CalculateOverlay(form) {
    let string = '';
    let total = 0;
    for (const key in form) {
        string += form[key];
    }

    for (let i = 0; i < string.length; i++) {
        const char = string[i];
        if (CHARS[char]) {
            if (char === char.toLowerCase()) {
                total += CHARS[char];
            } else {
                total += CHARS[char] + 30;
            }
        }
    }
    console.log(total);
    return { total, r: total % 255, g: 255 - (total % 255), b: 0.5 * (total % 255) > 125 ? 99 : 199 };
}

onmessage = function (e) {
    data = JSON.parse(e.data);
    console.log(data);
    result = CalculateOverlay({ url: data['imageLink'], ...data['form'] });
    postMessage(JSON.stringify({...result,imageLink:data.imageLink}));
};
