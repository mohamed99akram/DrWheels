const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    }).populate('participants', 'name email').sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate('participants', 'name email');
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const participants = [req.user.id, participantId];

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 }
    });

    if (!chat) {
      chat = await Chat.create({ participants, messages: [] });
    }

    await chat.populate('participants', 'name email');
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.messages.push({
      sender: req.user.id,
      content,
      timestamp: new Date()
    });

    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
