require('dotenv').config();
const models = require('./models')
const logger = require('./utils/winston.logger');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');
const config = require('./config/config');
const validateEnv = require('./middlewares/validateEnv');

// routes
const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const coursesRoutes = require('./routes/course.routes');


//app

const app = express();

validateEnv.validate();

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());

// CORS
app.use(cors({ credentials: true, origin: true }));

// Sessions
if (config.environment === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    sameSite: 'strict',
    secure: config.environment === 'production',
  },
}));

// DB connection
models.sequelize.authenticate()
  .then(() => {
    logger.api.debug('Conexión con la Base de Datos: EXITOSA');
  })
  .catch((err) => {
    logger.api.error('Conexión con la Base de Datos: FALLIDA');
    logger.api.error(err);
});

// Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log('sc-plat back working at ', PORT)
});

app.use('/user', userRoutes);
app.use('/subjects', subjectRoutes);
app.use('/courses', coursesRoutes);

module.exports = app;