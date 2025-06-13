var express = require('express');
var router = express.Router();

const tripController = require('../controller/tripController');
const auth = require('../middleware/auth');

router.get('/', auth.isLogin , tripController.getAllTrip)
router.post('/create', auth.isLogin , tripController.createTrip)

module.exports = router;
