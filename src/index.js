// require('dotenv/config');
const express = require('express');
const cors = require('cors');
const bearerToken = require('express-bearer-token');
const { join } = require('path');
const database = require('./models');
const fileUpload = require('express-fileupload');
const path = require('path');
const {
  authRouters,
  userRouters,
  refresh,
  logout,
  tenantRouters,
  RegisterAsTenant,
  pagesRouters,
  roomsRouters,
  tenantTransactionRouter,
  transactionRouters,
  privateTransactionRouters,
  propertyRouters,
  paymentRouters,
  paymentMethodRouter,
} = require('./routers');
const cookieParser = require('cookie-parser');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middlewares/credentials');
const PORT = process.env.PORT || 8000;
const app = express();
app.use('/public', express.static(path.join(__dirname, './public')));
app.use(credentials);
app.use(
  // cors(corsOptions)
  cors()
  // {
  //   origin: [
  //     process.env.WHITELISTED_DOMAIN &&
  //       process.env.WHITELISTED_DOMAIN.split(','),
  //   ],
  // }
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(bearerToken());
app.use(cookieParser());

//#region API ROUTES

// ===========================
// NOTE : Add your routes here

//file
app.use('/public', express.static(path.join(__dirname, './public')));

app.use(
  fileUpload({
    createParentPath: true,
    limits: {
      fileSize: 1024 * 1024, // 1 MB
    },
    abortOnLimit: true,
  })
);

//auth
app.use(refresh);
app.use(logout);
app.use(authRouters);

//home
app.use(pagesRouters);

//user
app.use(userRouters);
app.use(transactionRouters);
app.use(privateTransactionRouters);
app.use(paymentMethodRouter);
app.use(paymentRouters);

//tenant
app.use(RegisterAsTenant);
app.use(tenantRouters);
app.use(tenantTransactionRouter);

//property
app.use(propertyRouters);
app.use(roomsRouters);

// ===========================
app.get('/api', (req, res) => {
  res.send(`Hello, this is my API`);
});

app.get('/api/greetings', (req, res, next) => {
  res.status(200).json({
    message: 'Hello, Student !',
  });
});

// not found
app.use((req, res, next) => {
  if (req.path.includes('/api/')) {
    res.status(404).send('Not found !');
  } else {
    next();
  }
});

// error
app.use((err, req, res, next) => {
  if (req.path.includes('/api/')) {
    console.error('Error : ', err.stack);
    res.status(500).send('Error !');
  } else {
    next();
  }
});

//#endregion

//#region CLIENT
const clientPath = './build';
app.use(express.static(join(__dirname, clientPath)));

// Serve the HTML page
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, clientPath, '/index.html'));
});

//#endregion

app.listen(PORT, (err) => {
  if (err) {
    console.log(`ERROR: ${err}`);
  } else {
    console.log(`APP RUNNING at ${PORT} ✅`);
  }
});

// database.sequelize.sync({ alter: true });
