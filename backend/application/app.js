const express = require('express')
const bodyParser = require('body-parser')
const userRouter = require('./routes/usersRouter');
const fieldRouter = require('./routes/fieldsRouter');
const fieldChartRouter = require('./routes/fieldChartsRouter');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const sequelize = require('./configs/dbConfig')
const cors = require('cors')

const app = express();
const port = 8081;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Watering platform',
      version: '1.0.0',
      description: 'API for accessing field data',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Local server',
      },
    ],
    security: {
      bearerAuth: []
    }
  },
  apis: ['./doc/*.yaml','./routes/*.js'], // path to your route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));