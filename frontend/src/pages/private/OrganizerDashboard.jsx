import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, Grid, CircularProgress, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import apiClient from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import EventCard from '../../components/EventCard';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;
      try {
        // Seu backend precisa ter a rota: GET /api/organizer/events
        const response = await apiClient.get('/organizer/events');
        setMyEvents(response.data);
      } catch (err) {
        setError('Não foi possível carregar seus eventos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Meu Painel de Organizador
        </Typography>
        <Button variant="contained" component={Link} to="/events/create">
          Criar Novo Evento
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Typography variant="h5" component="h2" gutterBottom>
        Meus Eventos Criados
      </Typography>

      {myEvents.length > 0 ? (
        <Grid container spacing={4}>
          {myEvents.map(event => (
            <Grid item key={event.id} xs={12} sm={6} md={4}><EventCard event={event} /></Grid>
          ))}
        </Grid>
      ) : (<Typography>Você ainda não criou nenhum evento.</Typography>)}
    </Container>
  );
};

export default OrganizerDashboard;