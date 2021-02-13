const { Router } = require('express');
const router = Router();
var path = require('path');
const { nextTick } = require('process');

router.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../' ,'/views/dashboard.html'));
});

router.get('/view/:id/:screenX/:screenY', (req, res) => {
    res.render('viewer', {
        id: req.params.id,
        screenX: req.params.screenX,
        screenY: req.params.screenY
    });
});

router.get('/*', (req, res, next) => {
    let url = req.originalUrl;
    if (!/[/]peerjs[/]\w*/.test(url)) res.status(404).redirect('/dashboard');
    next();
});

module.exports = router;