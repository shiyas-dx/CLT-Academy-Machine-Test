const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCart, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // All cart routes are protected
router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .put(updateCart)
  .delete(removeFromCart);

module.exports = router;