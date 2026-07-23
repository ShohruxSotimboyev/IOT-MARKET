const { sendOtpEmail } = require('./sendEmail');
const logger = require('./logger');
const { EventEmitter } = require('events');

class EmailQueue extends EventEmitter {
  constructor() {
    super();
    this.on('send', async (data) => {
      try {
        await sendOtpEmail(data);
        logger.info(`Async email sent to ${data.email}`);
      } catch (err) {
        logger.error('Failed to send async email', { error: err.message, email: data.email });
      }
    });
  }

  add(data) {
    this.emit('send', data);
  }
}

module.exports = new EmailQueue();
