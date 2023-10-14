const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const ErrorHander = require("../utils/errorhandler");
const sendWhatsappAlert = require("../utils/sendWhatsappAlert");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new Order
exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    orderCustomList,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    orderCustomList,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: {_id:req.user._id, name:req.user.name, email:req.user.email}
  });

  const message = `${req.user.name} has placed an order at your website \nCustomer Contact : ${req.body.shippingInfo.phoneNo} \nCustomer Email : ${req.user.email} \n\nManage Order on website https://jolly-spacesuits-hare.cyclic.app`;

  await phoneNumber(req.user._id, shippingInfo.phoneNo);
  await sendWhatsappAlert(message);

  res.status(201).json({
    success: true,
    order,
  });
});

async function phoneNumber(id, number) {
  const user = await User.findById(id);

  user.lastPhoneNumber = number;

  await user.save({ validateBeforeSave: false });
}

// get Single Order
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// get logged in user  Orders
exports.myOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ "user._id": req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

// get all Orders -- Admin
exports.getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find()
  .sort({ createdAt: -1 })
  .limit(50);

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update Order Status -- Admin
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  // order.orderItems.forEach(async (o) => {
  //   await updateStock(o.product, o.quantity);
  // });

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

// update Order Payment Status -- Admin
exports.updateOrderPayment = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.paymentInfo.status === "Cleared") {
    return next(new ErrorHander("Amount of this order is already received", 400));
  }

  if (req.body.status === "Cleared") {
    await updateUserWallet(order.user._id,req.body.amount)
    order.paymentInfo.status = req.body.status;
    order.totalPrice = req.body.amount
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function updateUserWallet(id, amount) {
  const user = await User.findById(id);

  user.totalshoppings = Number(user?.totalshoppings) + Number(amount);

  await user.save({ validateBeforeSave: false });
}

// delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  await order.deleteOne();

  res.status(200).json({
    success: true,
  });
});