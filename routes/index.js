var express = require('express');
var router = express.Router();

var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.send({'status': 'success'});
  //res.render('index', { title: 'Express' });
    res.sendFile('webrtc.html', { root: path.join(__dirname, '../public/static') });
});

/*GET canvas*/
router.get('/canvas', function(req, res, next) {
    //res.sendFile(__dirname + '/canvas.html');
    res.sendFile('canvas.html', { root: path.join(__dirname, '../public') });
});

module.exports = router;
