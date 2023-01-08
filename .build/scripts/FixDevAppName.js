const path = require('path');
const { app } = require('electron');
const { productName } = require('../../src/package.json');

app.setName(productName);
const appData = app.getPath('appData');
app.setPath('userData', path.join(appData, productName));
