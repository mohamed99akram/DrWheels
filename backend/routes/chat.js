const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/', auth, chatController.getChats);
router.get('/:id', auth, chatController.getChatById);
router.post('/', auth, chatController.createChat);
router.post('/:id/messages', auth, chatController.sendMessage);

module.exports = router;
