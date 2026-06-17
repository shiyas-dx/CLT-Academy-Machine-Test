const User = require('../models/User');
const Product = require('../models/Product');

// Format cart response to include { items: [{ product: ..., quantity: ... }] }
const formatCartResponse = (user) => {
  const items = (user.cart || [])
    .filter(item => item.product)
    .map(item => ({
      product: item.product,
      quantity: item.quantity
    }));
  return { items };
};

// Retrieve all items in the user's cart
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(formatCartResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Add product to the user's cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = quantity ? parseInt(quantity) : 1;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += qty;
    } else {
      user.cart.push({ product: productId, quantity: qty });
    }

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    return res.status(200).json(formatCartResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update item quantity in the cart
exports.updateCart = async (req, res) => {
  try {
    const productId = req.params.productId || req.body.productId;
    const { quantity } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ message: 'productId and quantity are required' });
    }

    const qty = parseInt(quantity);
    if (qty < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const itemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    user.cart[itemIndex].quantity = qty;
    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    return res.status(200).json(formatCartResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Remove a product from the cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'productId parameter is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();
    const updatedUser = await User.findById(req.user.id).populate('cart.product');
    return res.status(200).json(formatCartResponse(updatedUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
