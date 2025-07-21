import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Bem-vindo à EventPlatform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          O seu lugar para descobrir, criar e participar de eventos incríveis.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/events"
          sx={{ mt: 4 }}
        >
          Explorar Eventos
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage;