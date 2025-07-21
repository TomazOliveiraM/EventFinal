const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/userModel');

// === GOOGLE STRATEGY ===
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      proxy: true, // Necessário para ambientes como Heroku ou Render
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Verifica se já existe um usuário com o googleId
        const currentUser = await User.findByGoogleId(profile.id);
        if (currentUser) {
          return done(null, currentUser);
        }

        // 2. Verifica se já existe um usuário com o mesmo email
        const email = profile.emails?.[0]?.value;
        const existingEmailUser = await User.findByEmail(email);
        if (existingEmailUser) {
          return done(new Error('Este email já está registrado. Faça login com sua senha.'), null);
        }

        // 3. Cria novo usuário com dados do Google
        const newUserPayload = {
          nome: profile.displayName,
          email: email,
          googleId: profile.id,
          tipoUsuario: 'participante',
        };
        const newUserResult = await User.create(newUserPayload);

        // Evita uma segunda chamada ao DB. Constrói o objeto do usuário com os dados que já temos.
        const newUser = { id: newUserResult.id, ...newUserPayload };
        delete newUser.googleId; // Renomeia para o padrão do objeto, se necessário
        newUser.google_id = profile.id;
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// === GITHUB STRATEGY ===
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'], // Necessário para obter o email do usuário
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Verifica se já existe um usuário com o githubId
        const currentUser = await User.findByGithubId(profile.id);
        if (currentUser) {
          return done(null, currentUser);
        }

        // 2. Tenta obter o email do perfil (GitHub pode não retornar)
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('Não foi possível obter o email da sua conta do GitHub. Verifique suas configurações de privacidade.'), null);
        }

        // 3. Verifica se o email já está em uso
        const existingEmailUser = await User.findByEmail(email);
        if (existingEmailUser) {
          return done(new Error('Este email já está registrado. Faça login com o método original.'), null);
        }

        // 4. Cria novo usuário com dados do GitHub
        const newUserPayload = {
          nome: profile.displayName || profile.username,
          email: email,
          githubId: profile.id,
          tipoUsuario: 'participante',
        };
        const newUserResult = await User.create(newUserPayload);

        // Evita uma segunda chamada ao DB.
        const newUser = { id: newUserResult.id, ...newUserPayload };
        delete newUser.githubId; // Renomeia para o padrão do objeto, se necessário
        newUser.github_id = profile.id;
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialização e desserialização (pode ser necessário)
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});