import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
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
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Oops! A página que você está procurando não foi encontrada.
        </Typography>
        <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
          Voltar para a Página Inicial
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;