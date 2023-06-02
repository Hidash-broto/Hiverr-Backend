// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');
const messageModel = require('../model/messageSchema');

module.exports = {
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

};
