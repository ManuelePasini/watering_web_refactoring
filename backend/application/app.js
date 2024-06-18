import express from 'express';
import userRouter from './routes/usersRouter.js';
import fieldRouter from './routes/fieldsRouter.js';
import fieldChartRouter from './routes/fieldChartsRouter.js';
import wateringScheduleRouter from './routes/wateringScheduleRouter.js';
import swaggerJsdoc from 'swagger-jsdoc';
import { serve, setup } from 'swagger-ui-express';

import sequelize from './configs/dbConfig.js';
import cors from 'cors';

import dotenv from 'dotenv'

dotenv.config();

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
        url: process.env.BACKEND_ADDRESS,
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

app.listen(port, () => {
  console.log(`Server is running at ${process.env.BACKEND_ADDRESS}`);
});

app.use(express.json());
app.use(cors());
app.use('/', userRouter);
app.use('/fields', fieldRouter)
app.use('/fieldCharts', fieldChartRouter);
app.use('/wateringSchedule', wateringScheduleRouter);
app.use('/api-docs', serve, setup(swaggerSpec));