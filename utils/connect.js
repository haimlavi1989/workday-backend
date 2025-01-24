const config = require('./../config/vars');
const mongoose = require('mongoose');

exports.connect = async () => {
    const dbUri = config.dbUri
    try {
        await mongoose.connect(dbUri);
        console.log('Db connections successfull');
    } catch (error) {
        console.log('Faild to connect to DB: ', error);
        process.exit(1);
    }
}
