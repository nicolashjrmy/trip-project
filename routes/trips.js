var express = require('express');
var router = express.Router();

const auth = require('../middleware/auth');
const tripController = require('../controller/tripController');

router.get('/', tripController.getAllTrip)
router.get('/:id', auth.isParticipant, tripController.getById)
router.get('/participant/:id', tripController.getAllTripParticipant)
router.post('/create', tripController.createTrip)
router.put('/edit/:id', auth.isOwner, tripController.editTrip)
router.delete('/delete/:id', auth.isOwner, tripController.deleteTrip)
router.put('/complete/:id', auth.isOwner, tripController.completeTrip)
router.put('/archive/:id', auth.isOwner, tripController.archiveTrip)

router.post('/:id/add-participant', tripController.addTripParticipants)
router.get('/join/:token', tripController.joinTripByInvite);
router.get('/:id/invite-link', auth.isOwner, tripController.generateInviteLink);

router.get('/:id/report', auth.isParticipant, tripController.getReport)
router.get('/:id/settlement', auth.isParticipant, tripController.getSettlement)

module.exports = router;
