var express = require('express');
var router = express.Router();

const auth = require('../middleware/auth');
const tripDetailController = require('../controller/tripDetailController');

router.post('/create/:id', auth.isParticipant, tripDetailController.createTripDetail)
router.get('/:id', auth.isParticipant, tripDetailController.getTripDetail)

module.exports = router;