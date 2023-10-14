const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  title : {
    type: String,
    required: true,
  },
  description : {
    type: String,
    required: true,
  },
  type : {
    type: String,
    required: true,
  },
  duration : {
    type: Number,
    default: 0,
  },
  referenceNumber : {
    type: Number,
    required: true,
  },
  activeMembers : {
    NumberOfMembers : {
      type: Number,
      default: 0,
    },
    users: [
      {
      _id: {
        type: mongoose.Schema.ObjectId,
      },
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      },
    ],      
  },
  createdBy: {
    _id: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      ref: "User",
      required: true,
    },
  }, 
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Offer", offerSchema);