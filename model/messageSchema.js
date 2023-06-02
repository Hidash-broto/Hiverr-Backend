const mongoose = require('mongoose');
const ClientScheema = require('./clientSchema');

const MessageSchema = mongoose.Schema(
  {
    message: {
      text: { type: String, required: true },
    },
    users: Array,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ClientScheema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Messages', MessageSchema);
