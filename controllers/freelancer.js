const bcrypt = require('bcrypt');
const FreelancerSchema = require('../model/freelancerSchema');
const GigSchema = require('../model/gigSchema');
const ClientSchema = require('../model/clientSchema');
const PaymentSchema = require('../model/paymentSchema');

module.exports = {
  // eslint-disable-next-line consistent-return
  doSignup: async (req, res) => {
    try {
      let {
        // eslint-disable-next-line prefer-const
        firstName, lastName, email, password, country,
      } = req.body;
      const exist = await FreelancerSchema.findOne({ email }).catch((error) => {
        res.json({ status: false, message: error.message });
      });
      if (exist) {
        return res.json({ status: false, message: 'User Exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      password = hashedPassword;
      const nwClient = new FreelancerSchema({
        firstName, lastName, email, password, country,
      });
      nwClient.save()
        .then(() => {
          res.json({ status: true, message: 'Client account Created successfully' });
        }).catch((error) => {
          res.json({ status: false, message: error.message });
        });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  freelancerList: async (req, res) => {
    try {
      FreelancerSchema.find().then((data) => {
        res.json({ status: true, data });
      }).catch((error) => res.json({ status: false, message: error.message }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  freelancerBlock: async (req, res) => {
    try {
      const { id } = req.body;
      const user = await FreelancerSchema.findById(id);
      const status = !user.isUser;
      FreelancerSchema.updateOne(
        { _id: id },
        { $set: { isUser: status } },
      ).then(() => {
        res.json({ status: true, message: `User ${user.isUser ? 'Blocked' : 'Unblocked'} successfully` });
      }).catch((error) => res.json({ status: false, message: error.message }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  // eslint-disable-next-line consistent-return
  doGigSave: (req, res) => {
    try {
      const currentdate = new Date();
      const datetime = `${currentdate.getDay()
      }/${
        currentdate.getMonth()
      }/${
        currentdate.getFullYear()
      } @ ${
        currentdate.getHours()
      }:${
        currentdate.getMinutes()
      }:${
        currentdate.getSeconds()}`;
      if (req.body.number === 1) {
        const { title, category, subCategory } = req.body.values;
        const { sample } = req.body;
        const gig = new GigSchema({
          userId: req.body.userId,
          title,
          category,
          subCategory,
          keyWord: sample,
          createdAt: datetime,
        });
        gig.save()
          .then(() => {
            res.json({ status: true });
          })
          .catch((error) => res.json({ status: false, message: error.message }));
      } else if (req.body.number === 2) {
        const {
          deliveryTime, numberOfPages, revisions, hostingSetup, price, licensedImages,
        } = req.body.values;
        const ImagePrice = parseInt(licensedImages, 10) * 100;
        const totalPrice = parseInt(price, 10) + ImagePrice;
        GigSchema.updateOne({ $and: [{ userId: req.body.userId }, { finished: false }] }, {
          $set: {
            deliveryTime, numberOfPages, revisions, hostingSetup, price, licensedImages, totalPrice,
          },
        }).then(() => {
          res.json({ status: true });
        })
          .catch((error) => res.json({ status: false, message: error.message }));
      } else if (req.body.number === 3) {
        const htmlContent = req.body.value;
        GigSchema.updateOne({ $and: [{ userId: req.body.userId }, { finished: false }] }, {
          $set: {
            discription: htmlContent,
          },
        })
          .then(() => {
            res.json({ status: true });
          })
          .catch((error) => res.json({ status: false, message: error.message }));
      } else if (req.body.number === 4) {
        GigSchema.updateOne({ $and: [{ userId: req.body.userId }, { finished: false }] }, {
          $set: {
            questions: req.body.questions,
          },
        })
          // eslint-disable-next-line max-len
          .then(() => res.json({ status: true })).catch((err) => res.json({ status: false, message: err.message }));
      } else if (req.body.number === 5) {
        if (req.body.imageUrls.length < 2) {
          return res.json({ status: false, message: `Upload 3 Images found ${req.body.imageUrls.lenth}` });
        }
        GigSchema.updateOne({ $and: [{ userId: req.body.userId }, { finished: false }] }, {
          $set: {
            images: req.body.imageUrls,
          },
        }).then(() => {
          res.json({ status: true });
        }).catch((error) => res.json({ status: false, message: error.message }));
      } else if (req.body.number === 6) {
        GigSchema.updateOne({ $and: [{ finished: false }, { userId: req.body.userId }] }, {
          $set: {
            finished: true,
          },
        }).then(() => {
          res.json({ status: true });
        }).catch((err) => res.json({ status: false, message: err.message }));
      } else {
        return res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getAllMessengers: async (req, res) => {
    try {
      const { userId } = req.body;
      const allUsers = [];
      const user = await FreelancerSchema.findOne({ _id: userId });
      await user.messagers.map(async (id) => {
        ClientSchema.findOne({ _id: id }).then((resp) => {
          allUsers.push(resp);
          if (allUsers.length === user.messagers.length) {
            res.json({ status: true, users: allUsers, userId });
          }
        });
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getNotification: async (req, res) => {
    try {
      const { userId } = req.body;
      const clients = [];
      const messages = [];
      const freelancer = await FreelancerSchema.findOne({ _id: userId });
      freelancer.requests.map(async (obj, index) => {
        if (obj.accepted === false && obj.rejected === false) {
          const client = await ClientSchema.findOne({ _id: obj.from });
          clients.push(client);
          messages.push(obj.message);
        }
        if (obj.confirmed) {
          clients.push(obj);
        }
        if (freelancer.requests.length - 1 === index) {
          res.json({ status: true, data: clients, messages });
        }
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  requestAccept: async (req, res) => {
    try {
      const { userId, id } = req.body;
      const freelancer = await FreelancerSchema.findOne({ _id: userId });
      const client = await ClientSchema.findOne({ _id: id });
      // eslint-disable-next-line array-callback-return
      client.requests.map((obj, index) => {
        const checkGig = freelancer.requests.findIndex((reqsts) => reqsts.gigId === obj.gigId);
        if (checkGig >= 0) {
          const nwClientRequest = client.requests;
          const nwFreelancerRequest = freelancer.requests;
          nwClientRequest[index].accepted = true;
          nwFreelancerRequest[checkGig].accepted = true;
          ClientSchema.updateOne({ _id: id }, {
            $set: { requests: nwClientRequest },
          }).then(async () => {
            await FreelancerSchema.updateOne({ _id: userId }, {
              $set: { requests: nwFreelancerRequest },
            }).then(() => res.json({ status: true }));
          });
        }
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  gigReject: async (req, res) => {
    try {
      const { userId, id } = req.body;
      const freelancer = await FreelancerSchema.findOne({ _id: userId });
      const client = await ClientSchema.findOne({ _id: id });
      // eslint-disable-next-line array-callback-return
      client.requests.map((obj, index) => {
        const checkGig = freelancer.requests.findIndex((reqsts) => reqsts.gigId === obj.gigId);
        if (checkGig >= 0) {
          const nwClientRequest = client.requests;
          const nwFreelancerRequest = freelancer.requests;
          nwClientRequest[index].rejected = true;
          nwFreelancerRequest[checkGig].rejected = true;
          ClientSchema.updateOne({ _id: id }, {
            $set: { requests: nwClientRequest },
          }).then(async () => {
            await FreelancerSchema.updateOne({ _id: userId }, {
              $set: { requests: nwFreelancerRequest },
            }).then(() => res.json({ status: true }));
          });
        }
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  dashboardDatas: async (req, res) => {
    try {
      const { userId } = req.body;
      const orderLists = await PaymentSchema.find({ freelancerId: userId }).populate('gigId').populate('clientId')
        .catch((err) => res.json({ status: false, message: err.message }));
      const freelancer = await FreelancerSchema.findOne({ _id: userId })
        .catch((err) => res.json({ status: false, message: err.message }));
      if (orderLists && freelancer) {
        res.json({ status: true, orderLists, freelancer });
      } else {
        res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getAllEarningsData: async (req, res) => {
    try {
      const { userId } = req.body;
      let availableBalance = 0;
      let pendingAdmin = 0;
      let activeOrders = 0;
      const lists = await PaymentSchema.find({ freelancerId: userId }).populate('gigId');
      // eslint-disable-next-line array-callback-return
      lists.map((obj) => {
        if (obj.completed && obj.paid) {
          availableBalance += obj.gigId.totalPrice - obj.gigId.licensedImages;
        } else if (obj.completed && obj.paid === false) {
          pendingAdmin += obj.gigId.totalPrice - obj.gigId.licensedImages;
        } else if (obj.completed === false && obj.paid === false) {
          activeOrders += obj.gigId.totalPrice - obj.gigId.licensedImages;
        }
      });
      res.json({
        status: true, availableBalance, pendingAdmin, activeOrders,
      });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  getUserDt: async (req, res) => {
    try {
      const { userId } = req.body;
      const gigs = await GigSchema.find({ userId })
        .catch((err) => res.json({ status: false, message: err.message }));
      const user = await FreelancerSchema.findOne({ _id: userId })
        .catch((err) => res.json({ status: false, message: err.message }));
      if (user) {
        const activeGigs = [];
        const pendingGigs = [];
        const rejectedGigs = [];
        // eslint-disable-next-line array-callback-return
        gigs.map((gig) => {
          if (gig.approved && !gig.rejected) {
            activeGigs.push(gig);
          } else if (gig.rejected) {
            rejectedGigs.push(gig);
          } else {
            pendingGigs.push(gig);
          }
        });
        res.json({
          status: true, user, activeGigs, pendingGigs, rejectedGigs,
        });
      } else {
        res.json({ status: false, message: 'Something Went Wrong' });
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  updateWorkStatus: (req, res) => {
    try {
      const {
        id, statusCount, doneThings, prev,
      } = req.body;
      if (prev > statusCount) {
        return res.json({ status: false, message: 'You Reduced the Status' });
      } if (prev === statusCount) {
        return res.json({ status: false, message: 'Ingrease the Status' });
      }
      const obj = {
        percentage: statusCount,
        doneThings,
      };
      PaymentSchema.updateOne({ _id: id }, {
        $push: { statuses: obj },
      }).then(() => res.json({ status: true }))
        .catch((err) => res.json({ status: false, message: err.message }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
    return 0;
  },
  submitOrder: async (req, res) => {
    try {
      const { deliverResponse, currentGigId } = req.body;
      const newpath = `${__dirname}/images/`;
      const { file } = req.files;
      const filename = file.name;

      file.mv(`${newpath}${filename}`, async (err) => {
        if (err) {
          res.json({ status: false, message: 'File upload filed' });
        } else {
          const nwObj = {
            percentage: 100,
            doneThings: deliverResponse,
          };
          PaymentSchema.updateOne({ _id: currentGigId }, {
            $set: {
              fileLocation: `${newpath}${filename}`,
            },
            $push: {
              statuses: nwObj,
            },
          // eslint-disable-next-line no-console
          }).then((resp) => console.log(resp));
        }
        res.json({ status: true });
      });
    } catch (error) {
      res.json({ status: false, message: error.messag });
    }
  },
  gigDelete: (req, res) => {
    try {
      const { id } = req.body;
      GigSchema.deleteOne({ _id: id }).then(() => res.json({ status: true }));
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  callCheck: async (req, res) => {
    try {
      const { userId } = req.body;
      const call = await ClientSchema.findOne({ caller: userId });
      if (call) {
        res.json({ status: true, data: call });
        ClientSchema.updateOne({ caller: userId }, {
          $set: { caller: '' },
        // eslint-disable-next-line no-console
        }).then((resp) => console.log(resp));
      }
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
};
