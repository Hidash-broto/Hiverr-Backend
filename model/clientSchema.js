const mongoose = require('mongoose');
const GigSchema = require('./gigSchema');

const clientSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    country: String,
    isUser: {
      type: Boolean,
      default: true,
    },
    messagers: [
      {
        type: String,
      },
    ],
    favorites: [
      {
        ref: GigSchema,
        type: String,
      },
    ],
    requests: [
      {
        to: {
          type: String,
        },
        accepted: Boolean,
        rejected: Boolean,
        message: String,
        gigId: String,
        paid: Boolean,
        completed: Boolean,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const clientModel = mongoose.model('client', clientSchema);
module.exports = clientModel;
