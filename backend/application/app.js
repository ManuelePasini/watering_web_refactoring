const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./routes/usersRouter');
const fieldRouter = require('./routes/fieldsRouter');
const fieldChartRouter = require('./routes/fieldChartsRouter');

const sequelize = require('./configs/dbConfig')
const cors = require('cors')

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
   console.log(`Server is running at http://localhost:${port}`);
});

app.use(bodyParser.json());
app.use(cors());
app.use('/', userRouter);
app.use('/fields', fieldRouter)
app.use('/fieldCharts', fieldChartRouter);
