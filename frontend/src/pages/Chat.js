import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participantId, setParticipantId] = useState('');

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages();
    }
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await api.get('/chat');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/chat/${selectedChat}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createChat = async () => {
    try {
      const response = await api.post('/chat', { participantId });
      setChats([...chats, response.data]);
      setParticipantId('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      await api.post(`/chat/${selectedChat}/messages`, { content: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Chat
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="User ID to chat with"
                value={participantId}
                onChange={(e) => setParticipantId(e.target.value)}
                size="small"
                sx={{ mb: 1 }}
              />
              <Button fullWidth variant="outlined" onClick={createChat}>
                Start Chat
              </Button>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              {chats.map((chat) => (
                <ListItem
                  key={chat._id}
                  button
                  selected={selectedChat === chat._id}
                  onClick={() => setSelectedChat(chat._id)}
                >
                  <ListItemText
                    primary={
                      chat.participants
                        ?.filter((p) => p._id !== user?.id)
                        .map((p) => p.name)
                        .join(', ') || 'Chat'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          {selectedChat ? (
            <Paper sx={{ p: 2, height: 600, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                {messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 1,
                      textAlign: msg.sender === user?.id ? 'right' : 'left',
                    }}
                  >
                    <Paper
                      sx={{
                        p: 1,
                        display: 'inline-block',
                        maxWidth: '70%',
                        bgcolor: msg.sender === user?.id ? 'primary.light' : 'grey.300',
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  size="small"
                />
                <Button variant="contained" onClick={sendMessage}>
                  Send
                </Button>
              </Box>
            </Paper>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Select a chat or start a new one
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Chat;
