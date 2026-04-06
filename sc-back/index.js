require('dotenv').config();
const models = require('./models')
const { createServer, getServer } = require('./socket');
const logger = require('./utils/winston.logger');
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./config/config');
const validateEnv = require('./middlewares/validateEnv');

// routes

const userRoutes = require('./routes/user.routes');
const subjectRoutes = require('./routes/subject.routes');
const coursesRoutes = require('./routes/course.routes');
const courseSubjectRoutes = require('./routes/course_subject.routes');
const teacherCoursesRoutes = require('./routes/teacher_courses.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const examRoutes = require('./routes/exam.routes');
const gradeRoutes = require('./routes/grade.routes');
const messageRoutes = require('./routes/message.routes');
const parentStudentsRoutes = require('./routes/parent_student.routes');
const announcementRoutes = require('./routes/announcement.routes');
const notificationRoutes = require('./routes/notification.routes');


//app

const app = express();

validateEnv.validate();

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
}));

// Rate limiting
const { apiLimiter } = require('./middlewares/rateLimiter');
app.use('/api', apiLimiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ 
  credentials: true, 
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

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

// Create HTTP server with Socket.IO
const server = createServer(app);
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log('sc-plat back working at ', PORT)
});

app.use('/user', userRoutes);
app.use('/subjects', subjectRoutes);
app.use('/courses', coursesRoutes);
app.use('/cs', courseSubjectRoutes);
app.use('/tc', teacherCoursesRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/exam', examRoutes);
app.use('/grade', gradeRoutes);
app.use('/message', messageRoutes);
app.use('/ps', parentStudentsRoutes);
app.use('/announcement', announcementRoutes);
app.use('/notification', notificationRoutes);

module.exports = app;