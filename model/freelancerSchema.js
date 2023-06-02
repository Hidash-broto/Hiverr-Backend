const mongoose = require('mongoose');
const ClientSchema = require('./clientSchema');

const freelancerSchema = new mongoose.Schema(
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
        ref: ClientSchema,
      },
    ],
    requests: [
      {
        from: {
          type: String,
        },
        accepted: Boolean,
        rejected: Boolean,
        gigId: String,
        message: String,
        completed: Boolean,
        paid: Boolean,
        confirmed: Boolean,
        gigTitle: String,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const FreelancerModel = mongoose.model('freelancer', freelancerSchema);
module.exports = FreelancerModel;
