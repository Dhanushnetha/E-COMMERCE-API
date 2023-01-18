require('dotenv').config();
require('express-async-errors')

const express = require('express');
const app = express();
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')


app.set('trust proxy', 1);
app.use(rateLimiter({
    windowMs: 15* 60 * 1000,
    max: 60 
}));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

//middleware
app.use(express.json());
// cannot use in production app.use(morgan('tiny'))
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static('./public'))
app.use(fileUpload())


//database
const connectDB = require('./db/connect')
const notFound = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler');

const authRouter = require('./routes/authRouter')
const userRouter = require('./routes/userRouter')
const productRouter = require('./routes/productRouter')
const reviewRouter = require('./routes/reviewRouter');
const orderRouter = require('./routes/orderRouter')

const port = process.env.PORT || 3000;

app.get('/', (req, res)=>{
    res.send('<h1>E-COMMERCE-API</h1><a href="/api-docs">Documentation</a>');
})

// app.get('/api/v1', (req, res)=>{
//     console.log(req.signedCookies);
//     res.send('Hey');
// })

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/orders', orderRouter)

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async ()=>{
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start();