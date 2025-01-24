const cron = require('node-cron');

const startReminderCronJob = () => {
  // Schedule the cron job to run every minute
  cron.schedule('* * * * *', () => {
    console.log('executeReminderTask cron job');
  }, {
    scheduled: true,
    timezone: 'Asia/Jerusalem' // Israel timezone
  });
};

// module.exports = startReminderCronJob;


