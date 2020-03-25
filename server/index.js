const http = require('http');
const path = require('path').posix;

const express = require('express');

const ClientController = require('../clientBuild/library/types/Controller');

function initialize(clientProdMode, clientWatchMode) {

    const clientController = new ClientController(clientProdMode);

    const app = express();
    var server = http.createServer(app);

    app.get('/scripts/:scriptType/:scriptName', (req, res, next) => {
        let scriptType = req.params.scriptType;
        let scriptName = req.params.scriptName;
        let filePath = clientController.getScriptFileOutputPath(scriptType, scriptName);

        if (filePath) {
            return res.status(200).sendFile(path.join(process.cwd(), filePath), { headers: { 'Content-Type': 'text/javascript' } });
        } else
            next();
    });

    app.get('/styles/:styleType/:styleName', (req, res, next) => {
        let styleType = req.params.styleType;
        let styleName = req.params.styleName;
        let filePath = clientController.getStyleFileOutputPath(styleType, styleName);

        if (filePath) {
            return res.status(200).sendFile(path.join(process.cwd(), filePath), { headers: { 'Content-Type': 'text/css' } });
        } else
            next();
    });

    app.get('*', (req, res, next) => {
        let filePath = clientController.getModuleMarkupFileOutputPath(req.path, true);// remove / at the beginning
        if (filePath) {
            return res.status(200).sendFile(filePath);
        } else
            next();
    });

    server.listen(5000,async () => {
        console.log('Application is running on port', global.configuration.port);

        clientController.build();
        if (clientWatchMode)
            clientController.watch();
    });
}

module.exports = { initialize }