var express = require('express');
var router = express.Router();

const auth = require('../middleware/auth');
const tripDetailController = require('../controller/tripDetailController');

router.post('/create/:id', auth.isParticipant, tripDetailController.createTripDetail)

module.exports = router;