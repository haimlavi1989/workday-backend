const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config/.env' });
const config = require('./config/vars')
const { connect } = require('./utils/connect');

const port = config.port || 8080;

app.listen(port, async () => {
  await connect();
  console.log(`Server is running on port: ${port}`);
});
