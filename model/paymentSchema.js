const mongoose = require('mongoose');
const ClientSchema = require('./clientSchema');
const GigSchema = require('./gigSchema');
const FreelancerSchema = require('./freelancerSchema');

const defaultStatus = {
  percentage: 0,
  doneThings: '',
};

const PaymentSchema = mongoose.Schema(
  {
    transactionid: {
      type: String,
    },
    transactionamount: {
      type: String,
    },
    gigId: {
      type: String,
      ref: GigSchema,
    },
    freelancerId: {
      type: String,
      ref: FreelancerSchema,
    },
    clientId: {
      type: String,
      ref: ClientSchema,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    statuses: [{
      type: {
        percentage: {
          type: Number,
          default: defaultStatus.percentage,
        },
        doneThings: {
          type: String,
          default: defaultStatus.doneThings,
        },
      },
      default: [defaultStatus],
    }],
    fileLocation: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('payment', PaymentSchema);
