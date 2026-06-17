const express = require('express');
const router = express.Router();
const { 
    getProducts, 
    getProductById,
    createProduct, 
    updateProduct, 
    deleteProduct, 
    getUploadSignature 
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/').get(getProducts).post(createProduct);

// Media upload signature route
router.get('/upload-signature', getUploadSignature);

// Parameter routes
router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);

module.exports = router;
