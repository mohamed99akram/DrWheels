import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [tabValue, setTabValue] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, tabValue]);

  const fetchOrders = async () => {
    try {
      const type = tabValue === 0 ? 'buyer' : 'seller';
      const response = await api.get(`/orders?type=${type}`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus
      });
      setStatusDialogOpen(false);
      fetchOrders();
    } catch (error) {
      alert(error.response?.data?.error || 'Error updating order');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.post(`/orders/${orderId}/cancel`);
        fetchOrders();
      } catch (error) {
        alert(error.response?.data?.error || 'Error cancelling order');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  if (!user) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5">Please login to view your orders</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Purchases" />
          <Tab label="Sales" />
        </Tabs>
      </Box>

      {loading ? (
        <Box textAlign="center" py={4}>Loading...</Box>
      ) : orders.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {order.car?.make} {order.car?.model} {order.car?.year}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                    />
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        {tabValue === 0 ? 'Seller' : 'Buyer'}
                      </Typography>
                      <Typography variant="body1">
                        {tabValue === 0 ? order.seller?.name : order.buyer?.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ${order.amount.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Order Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(order.createdAt).toLocaleString()}
                      </Typography>
                    </Grid>
                    {order.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography variant="body1">{order.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {tabValue === 0 && order.status === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleCancelOrder(order._id)}
                      >
                        Cancel Order
                      </Button>
                    )}
                    {tabValue === 1 && order.status === 'pending' && (
                      <>
                        <Button
                          variant="contained"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus('confirmed');
                            setStatusDialogOpen(true);
                          }}
                        >
                          Confirm Order
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setSelectedOrder(order);
                            setNewStatus('cancelled');
                            setStatusDialogOpen(true);
                          }}
                        >
                          Reject Order
                        </Button>
                      </>
                    )}
                    {tabValue === 1 && order.status === 'confirmed' && (
                      <Button
                        variant="contained"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus('completed');
                          setStatusDialogOpen(true);
                        }}
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to change the order status to &quot;{newStatus}&quot;?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleStatusUpdate} variant="contained">Confirm</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;

