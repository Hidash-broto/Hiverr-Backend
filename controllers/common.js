/* eslint-disable no-underscore-dangle */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const FreelancerSchema = require('../model/freelancerSchema');
const ClientSchema = require('../model/clientSchema');
const messageModel = require('../model/messageSchema');
require('dotenv').config();

module.exports = {
  // eslint-disable-next-line consistent-return
  doLogin: async (req, res) => {
    try {
      const { email, password, userType } = req.body;
      const freelancer = await FreelancerSchema.findOne({ email });
      const client = await ClientSchema.findOne({ email });
      if (!freelancer && !client) {
        return res.json({ status: false, message: 'User not exist' });
      }
      if (userType === 'Freelancer' && freelancer) {
        const freelancerMatch = await bcrypt.compare(password, freelancer.password);
        if (freelancerMatch) {
          if (!freelancer.isUser) {
            return res.json({ status: false, message: 'Blocked user' });
          }
          // eslint-disable-next-line no-underscore-dangle
          const token = jwt.sign({ id: freelancer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
          res.json({
            status: true, message: 'Redirecting to Home page', token, userType: 'freelancer',
          });
        } else {
          res.json({ status: false, message: 'Incorrect User Name or Password' });
        }
      } else if (userType === 'Client' && client) {
        const clientMatch = await bcrypt.compare(password, client.password);
        if (clientMatch) {
          if (!client.isUser) {
            return res.json({ status: false, message: 'Blocked user' });
          }
          const token = jwt.sign({ id: client._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
          res.json({
            status: true, message: 'Redirecting to Home page', token, userType: 'client',
          });
        } else {
          res.json({ status: false, message: 'Incorrect User Name or Password' });
        }
      } else {
        res.json({ status: false, message: 'User Not Exists' });
      }
    } catch (error) {
      return res.json({ status: false, message: error.message });
    }
  },
  // eslint-disable-next-line consistent-return
  getUser: async (req, res) => {
    try {
      const freelancer = await FreelancerSchema.findOne({ _id: req.body.userId });
      const client = await ClientSchema.findOne({ _id: req.body.userId });
      if (!freelancer && !client) {
        return res.json({ status: false, message: 'User does not Exist' });
      }
      return res.json({ status: true, data: freelancer || client });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
  userAddMessage: async (req, res) => {
    try {
      const { from, to, messages } = req.body;
      const data = await messageModel.create({
        message: { text: messages },
        users: [from, to],
        sender: from,
      });
      if (data) {
        return res.json({ status: true, message: 'message added successfully' });
      }
      return res.json({ status: false, message: 'failed to add message to the database' });
    } catch (error) {
      return res.json({ status: false, message: 'failed to add message to the database' });
    }
  },
  // eslint-disable-next-line consistent-return
  getAllMessages: async (req, res) => {
    try {
      const { from, to } = req.body;
      const messages = await messageModel.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });
      const projectedMessages = messages.map((msg) => ({
        fromSelf: msg.sender?.toString() === from,
        message: msg.message.text,
        time: moment(msg.createdAt).format('LLL'),
      }));
      res.json({ status: true, message: 'message fetched successfully', projectedMessages });
    } catch (error) {
      return res.json({ status: false, message: 'failed to add message to the database' });
    }
  },
  getCurrentUser: async (req, res) => {
    try {
      const { userId } = req.body;
      const client = await ClientSchema.findOne({ _id: userId });
      const freelancer = await FreelancerSchema.findOne({ _id: userId });
      res.json({ status: true, user: client || freelancer });
    } catch (error) {
      res.json({ status: false, message: error.message });
    }
  },
};
