const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String },
    password: { type: String }, // Optional because Google users won't have one
    cart: [cartItemSchema],
    otp: { type: String },
    otpExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
