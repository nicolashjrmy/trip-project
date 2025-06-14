var express = require('express');
var router = express.Router();

const auth = require('../middleware/auth');
const tripController = require('../controller/tripController');

router.get('/', tripController.getAllTrip)
router.post('/create', tripController.createTrip)
router.put('/edit/:id', auth.isOwner, tripController.editTrip)

module.exports = router;
