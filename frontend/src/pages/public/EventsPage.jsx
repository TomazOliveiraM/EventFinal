import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, CircularProgress, Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import apiClient from '../../api/axiosConfig';
import EventCard from '../../components/EventCard';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ category: '', date: '' });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const handleDateChange = (newValue) => {
    setFilters((prev) => ({ ...prev, date: newValue ? newValue.format('YYYY-MM-DD') : '' }));
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Backend precisa aceitar query params: GET /api/events?category=...&date=...
        const response = await apiClient.get('/events', { params: filters });
        setEvents(response.data);
      } catch (err) {
        setError('Não foi possível carregar os eventos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Próximos Eventos
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            label="Filtrar por Categoria"
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            variant="outlined"
            size="small"
          />
          <DatePicker
            label="Filtrar por Data"
            value={filters.date ? dayjs(filters.date) : null}
            onChange={handleDateChange}
          />
        </Box>
      </LocalizationProvider>

      {error && <Typography color="error">{error}</Typography>}
      
      {events.length > 0 ? (
        <Grid container spacing={4}>
          {events.map(event => (
            <Grid item key={event.id} xs={12} sm={6} md={4}><EventCard event={event} /></Grid>
          ))}
        </Grid>
      ) : (
        <Typography>Nenhum evento encontrado com os filtros aplicados.</Typography>
      )}
    </Container>
  );
};

export default EventsPage;
