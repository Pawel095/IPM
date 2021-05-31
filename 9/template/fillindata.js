function round(num) {
    return Math.round((num + Number.EPSILON) * 100) / 100;
}

window.onload = () => {
    // LOAD DATA
    let TABLE_DATA;
    if (!window.opener) {
        TABLE_DATA = {
            client: {
                name: 'Convallis Dolor Corp.',
                contact_name: 'Kiara',
                contact_surname: 'Henry',
                contact_email: 'a.tortor.Nunc@aliquet.org',
                nip: '382-270-43-87',
                clienturl: 'https://convallisdolorcorp.com',
                image_data:
                    'data:image/jpeg;base64,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',
            },
            product: {
                koszt: '100',
                nazwa: 'Paczka APT, 100zł',
                kod: 'apt',
            },
        };
    } else {
        TABLE_DATA = window.opener.popupData;
    }
    console.log(TABLE_DATA);

    // CLIENT DATA
    let clientTbody = document.getElementById('clientDisplay');
    let tr = document.createElement('tr');

    let td = document.createElement('td');
    td.innerHTML = TABLE_DATA.client.name;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.client.nip;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.client.contact_name;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.client.contact_surname;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.client.contact_surname;
    tr.appendChild(td);

    clientTbody.appendChild(tr);

    // PRODUCT DATA
    let productTbody = document.getElementById('productDisplay');
    tr = document.createElement('tr');

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.product.nazwa;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = TABLE_DATA.product.kod;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = `${TABLE_DATA.product.koszt} PLN`;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = `${round(TABLE_DATA.product.koszt * 0.22)} PLN`;
    tr.appendChild(td);

    td = document.createElement('td');
    td.innerHTML = `${round(TABLE_DATA.product.koszt * 1.22)} PLN`;
    tr.appendChild(td);

    productTbody.appendChild(tr);
};
