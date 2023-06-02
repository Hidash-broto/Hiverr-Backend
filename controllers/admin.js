require('dotenv').config();
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const GigSchema = require('../model/gigSchema');
const PaymentSchema = require('../model/paymentSchema');

module.exports = {
  adminLogin: (req, res) => {
    try {
      const { email, password } = req.body;
      if (email === process.env.ADMINEMAIL && password === process.env.ADMINPASSWORD) {
        const token = jwt.sign({ id: email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ status: true, message: 'Admin Login Success', token });
      } else {
        res.json({ status: false, message: 'Incorrect email or password' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  userCheck: (req, res) => {
    res.json({ message: 'Good' });
  },
  getAllPendingGigs: async (req, res) => {
    try {
      const gigs = await GigSchema.find({
        $and: [
          { finished: true }, { approved: false }, { rejected: false },
        ],
      })
        .catch((err) => res.json({ status: false, message: err.message }));
      if (gigs) {
        res.json({ status: true, gigs });
      } else {
        res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  gigStatusChange: async (req, res) => {
    try {
      if (req.body.status) {
        GigSchema.updateOne({ $and: [{ approved: false }, { userId: req.body.userId }] }, {
          $set: { approved: true },
        }).then(() => res.json({ status: true, data: 'Approved' }))
          .catch((err) => res.json({ status: false, message: err.message }));
      } else {
        GigSchema.updateOne({ $and: [{ approved: false }, { userId: req.body.userId }] }, {
          $set: { rejected: true },
        }).then(() => res.json({ status: true, data: 'Rejected' }))
          .catch((err) => res.json({ status: false, message: err.message }));
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getAllPayments: async (req, res) => {
    try {
      const lists = await PaymentSchema.find({ paid: false, completed: true }).populate('gigId').populate('freelancerId').populate('clientId')
        .catch((err) => res.json({ status: false, message: err.message }));
      if (lists) {
        res.json({ status: true, lists });
      } else {
        res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  payment: (req, res) => {
    try {
      const instance = new Razorpay({
        key_id: process.env.KEY_ID,
        key_secret: process.env.SECRET_ID,
      });
      const options = {
        amount: req.body.amount,
        currency: 'INR',
        receipt: 'order_rcptid_11',
        payment_capture: 1,
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          return res.json({ status: false, message: err.message });
        }
        return res.json({ status: true, data: order });
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  doPayment: (req, res) => {
    try {
      const generatedSiganture = crypto.createHmac('sha256', process.env.PAYMENT_KEY_SECRET);
      generatedSiganture.update(`${req.body.razorpay_order_id}|${req.body.transactionid}`);
      PaymentSchema.updateOne({ _id: req.body.id }, {
        $set: { paid: true },
      }).then(() => res.json({ status: true }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
};
