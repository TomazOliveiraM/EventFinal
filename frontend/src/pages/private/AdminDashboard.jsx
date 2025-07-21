import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import apiClient from '../../api/axiosConfig';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null); // ID do item sendo deletado
  const [tabIndex, setTabIndex] = useState(0);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Backend precisa das rotas: GET /api/admin/users e GET /api/admin/events
      const [usersResponse, eventsResponse] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/events'),
      ]);
      setUsers(usersResponse.data);
      setEvents(eventsResponse.data);
    } catch (err) {
      setError('Falha ao carregar dados do painel de administração.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário? Esta ação é irreversível.')) {
      try {
        setIsDeleting(userId);
        // Backend precisa da rota: DELETE /api/admin/users/:userId
        await apiClient.delete(`/admin/users/${userId}`);
        alert('Usuário deletado com sucesso.');
        fetchAllData(); // Recarrega os dados
      } catch (err) {
        alert('Falha ao deletar usuário.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Tem certeza que deseja deletar este evento?')) {
      try {
        setIsDeleting(eventId);
        // Backend precisa da rota: DELETE /api/admin/events/:eventId
        await apiClient.delete(`/admin/events/${eventId}`);
        alert('Evento deletado com sucesso.');
        fetchAllData(); // Recarrega os dados
      } catch (err) {
        alert('Falha ao deletar evento.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Painel de Administração</Typography>
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} aria-label="admin-dashboard-tabs">
          <Tab label={`Gerenciar Usuários (${users.length})`} />
          <Tab label={`Gerenciar Eventos (${events.length})`} />
        </Tabs>
      </Box>

      {tabIndex === 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Permissão</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isDeleting === user.id}
                      >
                        {isDeleting === user.id ? 'Deletando...' : 'Deletar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabIndex === 1 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Nome do Evento</TableCell>
                  <TableCell>Organizador ID</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{event.id}</TableCell>
                    <TableCell>{event.name}</TableCell>
                    <TableCell>{event.organizer_id}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={isDeleting === event.id}
                      >
                        {isDeleting === event.id ? 'Deletando...' : 'Deletar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default AdminDashboard;