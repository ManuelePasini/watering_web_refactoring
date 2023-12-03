const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./routes/userAuthenticationRouter');
const userFieldsRouter = require('./routes/userFieldsRouter');
const fieldChartRouter = require('./routes/fieldChartsRouter');

const sequelize = require('./configs/dbConfig')

const app = express();
const port = 8081;

sequelize.authenticate().then(() => {
   console.log('Database connection has been initialized successfully');
}).catch((err) => {
    console.log('Unable to connect to the database:',err);
});

sequelize.sync().then( e => {
    console.log('Database sync completed');
});

app.listen(port, () => {
   console.log(`Servier is running at http://localhost:${port}`);
});

app.use(bodyParser.json());
app.use('/user', userRouter);
app.use('/userFields', userFieldsRouter);
app.use('/fieldCharts', fieldChartRouter);
