import React from 'react';
import { Card, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const EventCard = ({ event }) => {
  if (!event) return null;

  const eventDate = new Date(event.date).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">{event.name}</Typography>
        <Typography color="text.secondary">{eventDate}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {event.description?.substring(0, 100)}...
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/events/${event.id}`}>Ver Detalhes</Button>
      </CardActions>
    </Card>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string,
  }).isRequired,
};

export default EventCard;