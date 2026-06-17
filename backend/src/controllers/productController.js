const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Generate Cloudinary Signature for direct frontend uploads
exports.getUploadSignature = async (req, res) => {
    try {
        const timestamp = Math.round((new Date).getTime() / 1000);
        
        // Generates a secure signature using your API Secret
        const signature = cloudinary.utils.api_sign_request(
            { timestamp: timestamp },
            process.env.CLOUDINARY_API_SECRET
        );

        res.json({ 
            timestamp, 
            signature, 
            cloudName: process.env.CLOUDINARY_CLOUD_NAME, 
            apiKey: process.env.CLOUDINARY_API_KEY 
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to generate upload signature', error: error.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products', error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const productData = {
            ...req.body,
            userId: req.user.id
        };
        const product = await Product.create(productData);
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create product', error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update product', error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};
