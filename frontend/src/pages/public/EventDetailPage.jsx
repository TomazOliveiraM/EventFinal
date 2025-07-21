import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import apiClient from '../../api/axiosConfig';
import useAuth from '../../hooks/useAuth';
import CommentSection from '../../components/CommentSection'; // Importando o novo componente

const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        // Busca o evento e o status da inscrição em paralelo
        const [eventResponse, subStatusResponse] = await Promise.all([
          apiClient.get(`/events/${id}`),
          // Apenas busca o status se o usuário estiver logado
          isAuthenticated
            ? apiClient.get(`/events/${id}/subscription/status`)
            : Promise.resolve({ data: { isSubscribed: false } }),
        ]);

        setEvent(eventResponse.data);
        setIsSubscribed(subStatusResponse.data.isSubscribed);
      } catch (err) {
        setError('Evento não encontrado ou erro ao carregar.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, isAuthenticated]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsActionLoading(true);
      // Seu backend precisa ter a rota: POST /api/events/:id/subscribe
      await apiClient.post(`/events/${id}/subscribe`);
      alert('Inscrição realizada com sucesso!');
      setIsSubscribed(true); // Atualiza o estado da UI
    } catch (err) {
      alert('Falha ao se inscrever. Você já pode estar inscrito.');
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setIsActionLoading(true);
      // Seu backend precisa ter a rota: DELETE /api/events/:id/subscribe
      await apiClient.delete(`/events/${id}/subscribe`);
      alert('Inscrição cancelada com sucesso!');
      setIsSubscribed(false); // Atualiza o estado da UI
    } catch (err) {
      alert('Falha ao cancelar inscrição.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date).toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  // Verifica se o usuário logado pode editar o evento
  const canManage = user?.role === 'admin' || (user?.role === 'organizador' && user?.id === event.organizer_id);

  return (
    <Container sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {event.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {eventDate}
        </Typography>
        <Typography variant="body1" sx={{ my: 3 }}>
          {event.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isAuthenticated && user.role === 'participante' && (
            isSubscribed ? (
              <Button variant="outlined" color="secondary" onClick={handleUnsubscribe} disabled={isActionLoading}>
                {isActionLoading ? 'Cancelando...' : 'Cancelar Inscrição'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubscribe}
                disabled={isActionLoading}
              >
                {isActionLoading ? 'Inscrevendo...' : 'Inscrever-se'}
              </Button>
            )
          )}
          {canManage && (
            <Button variant="outlined" color="primary" component={Link} to={`/events/${id}/edit`}>Editar Evento</Button>
          )}
        </Box>

        {/* Seção de Comentários */}
        <CommentSection eventId={id} />
      </Paper>
    </Container>
  );
};

export default EventDetailPage;