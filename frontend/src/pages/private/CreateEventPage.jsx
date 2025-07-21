import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';
import apiClient from '../../api/axiosConfig';

const CreateEventPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Seu backend precisa ter a rota: POST /api/events
      await apiClient.post('/events', formData);
      setSuccess('Evento criado com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/organizer/dashboard');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao criar o evento.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h4">
          Criar Novo Evento
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{success}</Alert>}
          
          <TextField margin="normal" required fullWidth id="name" label="Nome do Evento" name="name" value={formData.name} onChange={handleChange} />
          <TextField margin="normal" required fullWidth multiline rows={4} id="description" label="Descrição" name="description" value={formData.description} onChange={handleChange} />
          <TextField margin="normal" required fullWidth id="date" label="Data e Hora do Evento" name="date" type="datetime-local" InputLabelProps={{ shrink: true }} value={formData.date} onChange={handleChange} />
          <TextField margin="normal" required fullWidth id="location" label="Localização (ou link, se online)" name="location" value={formData.location} onChange={handleChange} />
          <TextField margin="normal" required fullWidth id="category" label="Categoria" name="category" value={formData.category} onChange={handleChange} />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Criando...' : 'Criar Evento'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CreateEventPage;
