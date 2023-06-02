const mongoose = require('mongoose');
const freelancerSchema = require('./freelancerSchema');

const gigSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: freelancerSchema,
  },
  title: String,
  category: String,
  subCategory: String,
  keyWord: [],
  deliveryTime: String,
  numberOfPages: Number,
  revisions: String,
  hostingSetup: String,
  price: Number,
  licensedImages: Number,
  totalPrice: Number,
  discription: String,
  questions: [],
  images: [],
  video: String,
  documents: [],
  finished: {
    type: Boolean,
    default: false,
  },
  approved: {
    type: Boolean,
    default: false,
  },
  rejected: {
    type: Boolean,
    default: false,
  },
});

const gigModel = mongoose.model('gig', gigSchema);
module.exports = gigModel;
