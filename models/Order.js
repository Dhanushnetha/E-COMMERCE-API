const mongoose = require('mongoose')

const singleOrderItemschema = mongoose.Schema({
    name: {type: String, required: true},
    image: {type: String, required: true},
    price: {type: Number, required: true},
    amount: {type: Number, required: true},
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    tax:{
        type:Number,
        required: [true, 'Please provide tax']
    },
    shippingFee:{
        type:Number,
        required: true
    },
    subtotal:{
        type:Number,
        required: true
    },
    total:{
        type:Number,
        required: true
    },
    orderItems: [singleOrderItemschema],
    status:{
        type:String,
        enum: ['pending', 'failed', 'paid', 'delivered', 'canceled'],
        default: 'pending',
    },
    user:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client_secret : {
        type: String,
        required: true
    },
    paymentIntentId: {
        type: String,
        // required: true
    }
},{timestamps: true})

module.exports = mongoose.model('Order', orderSchema);