const express = require('express');

const onlineUsers = new Map();
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const cors = require('cors');
const socket = require('socket.io');
const fileUpload = require('express-fileupload');
const adminRouter = require('./routes/adminRouter');
const clientRouter = require('./routes/clientRouter');
const freelancerRouter = require('./routes/freelancerRouter');
const commonRouter = require('./routes/commonRoute');
require('./config/dbconnection');

app.use(fileUpload());
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use('/api/admin', adminRouter);
app.use('/api/client', clientRouter);
app.use('/api/freelancer', freelancerRouter);
app.use('/api', commonRouter);

const port = process.env.PORT;
// eslint-disable-next-line no-console
const server = app.listen(port, () => console.log(`Application started running on the ${port} Port`));

const io = socket(server, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
});

// eslint-disable-next-line no-shadow
io.on('connection', (socket) => {
  // eslint-disable-next-line no-console
  socket.on('add-user', (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on('send-msg', (data) => {
    // eslint-disable-next-line no-console
    console.log(data.to, 'fffff');
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit('msg-recieve', data.msg);
    }
  });
});
