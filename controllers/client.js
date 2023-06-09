/* eslint-disable array-callback-return */
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();
const ClientSchema = require('../model/clientSchema');
const GigSchema = require('../model/gigSchema');
const FreelancerSchema = require('../model/freelancerSchema');
const PaymentSchema = require('../model/paymentSchema');

module.exports = {
  doSignup: async (req, res) => {
    try {
      let {
        // eslint-disable-next-line prefer-const
        firstName, lastName, email, password, country,
      } = req.body;
      const exist = await ClientSchema.findOne({ email });
      if (exist) {
        res.json({ status: false, message: 'User Exists' });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        password = hashedPassword;
        const nwClient = new ClientSchema({
          firstName, lastName, email, password, country,
        });
        nwClient.save().then(() => {
          res.json({ status: true, message: 'Client account Created successfully' });
        }).catch((error) => {
          res.json({ status: false, message: error.message });
        });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  clientList: (req, res) => {
    try {
      ClientSchema.find().then((data) => {
        res.json({ status: true, data });
      }).catch((error) => res.json({ status: false, message: error.message }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  clientBlock: async (req, res) => {
    try {
      const { id } = req.body;
      const user = await ClientSchema.findById(id);
      const status = !user.isUser;
      ClientSchema.updateOne(
        { _id: id },
        { $set: { isUser: status } },
      ).then(() => {
        res.json({ status: true, message: `User ${user.isUser ? 'Blocked' : 'Unblocked'} successfully` });
      }).catch((error) => res.json({ status: false, message: error.message }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  gigList: async (req, res) => {
    try {
      const { gigCat } = req.body;
      const gigs = await GigSchema.find({ $and: [{ subCategory: gigCat }, { approved: true }] }).populate('userId')
        .catch((err) => res.json({ status: false, message: err.message }));
      if (!gigs) {
        res.json({ status: false, message: 'Server Down' });
      } else {
        res.json({ status: true, data: gigs });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  messageUserAdd: async (req, res) => {
    try {
      const { userId, freelancerId } = req.body;
      const user = await ClientSchema.findOne({ _id: userId });
      let exist = false;
      user.messagers.map((id) => {
        if (id === freelancerId) {
          exist = true;
        }
      });
      if (!exist) {
        ClientSchema.updateOne({ _id: userId }, {
          $push: { messagers: freelancerId },
        }).then(async () => {
          FreelancerSchema.updateOne({ _id: freelancerId }, {
            $push: { messagers: userId },
          }).then(() => {
            res.json({ status: true });
          });
        });
      } else {
        res.json({ status: true });
      }
    } catch (err) {
      res.json({ status: false, message: err.message });
    }
  },
  // eslint-disable-next-line consistent-return
  getAllMessengers: async (req, res) => {
    try {
      const { userId } = req.body;
      const allUsers = [];
      const user = await ClientSchema.findOne({ _id: userId });
      await user.messagers.map(async (id) => {
        FreelancerSchema.findOne({ _id: id }).then((resp) => {
          allUsers.push(resp);
          if (allUsers.length === user.messagers.length) {
            res.json({ status: true, users: allUsers, userId });
          }
        });
      });
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },
  favouriteGig: async (req, res) => {
    try {
      const { id, userId } = req.body;
      const client = await ClientSchema.findOne({ _id: userId });
      const exist = client.favorites.findIndex((Id) => id === Id);
      if (exist >= 0) {
        ClientSchema.updateOne({ _id: userId }, {
          $pull: { favorites: id },
        }).then(() => {
          res.json({ status: true, type: false });
        }).catch((err) => res.json({ status: false, message: err.message }));
      } else {
        ClientSchema.updateOne({ _id: userId }, {
          $push: { favorites: id },
        }).then(() => {
          res.json({ status: true, liked: true });
        }).catch((err) => res.json({ status: false, message: err.message }));
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getFavorites: async (req, res) => {
    try {
      const gigs = [];
      const { userId } = req.body;
      const client = await ClientSchema.findOne({ _id: userId })
        .catch((err) => res.json({ status: false, message: err.message }));
      client.favorites?.map(async (id) => {
        const gig = await GigSchema.findById(id)
          .catch((err) => res.json({ status: false, message: err.message }));
        gigs.push(gig);
        if (gigs.length === client.favorites.length) {
          res.json({ status: true, data: gigs });
        }
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  gigRequest: async (req, res) => {
    try {
      const { userId, gigId, text } = req.body;
      const Gig = await GigSchema.findOne({ _id: gigId });
      const objClient = {
        to: Gig.userId,
        accepted: false,
        rejected: false,
        message: text,
        gigId,
        completed: false,
        paid: false,
      };
      const objFreelancer = {
        from: userId,
        accepted: false,
        rejected: false,
        gigId,
        message: text,
        completed: false,
        paid: false,
      };
      ClientSchema.updateOne({ _id: userId }, {
        $push: { requests: objClient },
      }).then(async () => {
        await FreelancerSchema.updateOne({ _id: Gig.userId }, {
          $push: { requests: objFreelancer },
        });
      }).then(() => {
        res.json({ status: true });
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getNotification: async (req, res) => {
    try {
      const { userId } = req.body;
      const allNotifications = [];
      const client = await ClientSchema.findOne({ _id: userId });
      client.requests.map(async (obj, index) => {
        if (obj.accepted && obj.paid === false) {
          const freelancer = await FreelancerSchema.findOne({ _id: obj.to });
          const nwNoti = {
            freelancerName: `${freelancer.firstName} ${freelancer.lastName}`,
            message: `Your Request Accepted by ${`${freelancer.firstName} ${freelancer.lastName}`}, After you paying the amount He will Start the Work`,
            freelancerId: obj.to,
            gigId: obj.gigId,
            index,
          };
          allNotifications.push(nwNoti);
        }
        if (index === client.requests.length - 1) {
          res.json({ status: true, data: allNotifications });
        }
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  amountPick: async (req, res) => {
    try {
      const { gigId1 } = req.body;
      const gig = await GigSchema.findById(gigId1);
      if (gig) {
        res.json({ status: true, price: gig.totalPrice });
      } else {
        res.json({ status: false, message: 'Something went Wrong' });
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
  doPayment: async (req, res) => {
    try {
      const generatedSiganture = crypto.createHmac('sha256', process.env.PAYMENT_KEY_SECRET);
      generatedSiganture.update(`${req.body.razorpay_order_id}|${req.body.transactionid}`);
      const statuses = {
        percentage: 0,
        doneThings: 'Started',
      };
      const transaction = new PaymentSchema({
        transactionid: req.body.values.transactionid,
        transactionamount: req.body.values.transactionamount / 100,
        freelancerId: req.body.freelancerId,
        gigId: req.body.gigId,
        clientId: req.body.userId,
        statuses,
      });
      if (req.body.gigId.length > 0 && req.body.freelancerId.length > 0) {
        await transaction.save();
        const client = await ClientSchema.findOne({ _id: req.body.userId });
        const gig = await GigSchema.findById(req.body.gigId);
        const nwNotification = client.requests;
        nwNotification[req.body.currentNotification].paid = true;
        await ClientSchema.updateOne({ _id: req.body.userId }, {
          $set: { requests: nwNotification },
        });
        const freelancer = await FreelancerSchema.findOne({ _id: req.body.freelancerId });
        freelancer.requests.map(async (obj, index) => {
          if (obj.gigId === req.body.gigId && obj.from === req.body.userId) {
            const nwObj = freelancer.requests;
            nwObj[index] = {
              from: req.body.userId,
              gigTitle: gig.title,
              message: `Your order is Confirmed from ${`${client.firstName} ${client.lastName}`}, You can start the work Right now`,
              confirmed: true,
            };
            await FreelancerSchema.updateOne({ _id: req.body.freelancerId }, {
              $set: { requests: nwObj },
            });
          }
        });
      } else {
        res.json({ status: false, message: 'Please try again' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getAllStatus: async (req, res) => {
    try {
      const { userId } = req.body;
      const docs = await PaymentSchema.find({ clientId: userId, completed: false }).populate('gigId')
        .catch((err) => res.json({ status: false, message: err.message }));
      if (docs) {
        res.json({ status: true, data: docs });
      } else {
        res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  doDownload: async (req, res) => {
    try {
      const { id } = req.body;
      const doc = await PaymentSchema.findById(id);
      const filePath = doc.fileLocation;
      res.download(filePath);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error.message);
    }
  },
  closeOrder: (req, res) => {
    try {
      const { id } = req.body;
      PaymentSchema.updateOne({ _id: id }, {
        $set: { completed: true },
      }).then(() => {
        res.json({ status: true });
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  freelancerCalling: (req, res) => {
    try {
      const { activeMessenger, userId } = req.body;
      ClientSchema.updateOne({ _id: userId }, {
        $set: { caller: activeMessenger },
      }).then(() => res.json({ status: true }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
};
