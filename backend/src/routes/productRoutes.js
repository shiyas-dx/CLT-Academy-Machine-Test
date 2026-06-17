const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getUploadSignature 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Public route to view products, protected route to create
router.route('/').get(getProducts).post(protect, createProduct);

// Media upload signature route
router.get('/upload-signature', protect, getUploadSignature);

// Parameter routes
router.route('/:id').put(protect, updateProduct).delete(protect, deleteProduct);

module.exports = router;
