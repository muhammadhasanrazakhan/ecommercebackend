const User = require("../models/userModel");
const Offer = require("../models/offerModel");
const ErrorHander = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");


// create Offer
exports.createOffer = catchAsyncErrors(async (req, res, next) => {
  
    // req.body.user = req.user.id;
      
    //req.body.user = req.user.id;
    const offer = await Offer.create(req.body);
    res.status(200).json({
        success:true,
        offer
    })
  });

// get all Offers
exports.getAllOffers = catchAsyncErrors(async (req, res, next) => {
    const offers = await Offer.find()
  
    res.status(200).json({
      success: true,
      offers,
    });
  });

// Get single offer (admin)
exports.getSingleOffer = catchAsyncErrors(async (req, res, next) => {
    const offer = await Offer.findById(req.params.id);
  
    if (!offer) {
      return next(
        new ErrorHander(`Offer does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      offer,
    });
  });

// Update Offer --Admin
exports.updateOffer = catchAsyncErrors(async (req, res, next) => {

    let offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success:true,
        offer
    })  
});

// // delete offer -- admin
// exports.deleteOffer = catchAsyncErrors(async (req, res, next) => {
//   const offerId = req.params.id;

//   try {
//     await session.withTransaction(async () => {
//       // Step 1: Find and delete the offer
//       const offer = await Offer.findById(offerId);
//       if (!offer) {
//         throw new Error('Offer not found with this Id');
//       }
//       await offer.deleteOne();

//       // Step 2: Update active users using deleteAllUsers function within the transaction
//       offer?.activeMembers?.users?.forEach(async (user) => {
//         await deleteAllUsers(user._id, offerId, session);
//       });

//       // Transaction completed successfully
//       res.status(200).json({ success: true });
//     });
//   } catch (error) {
//     // Transaction failed or an error occurred
//     console.error('Error in deleteOffer transaction:', error);
//     res.status(500).json({ success: false, error: 'Transaction failed' });
//   } finally {
//     // End the session after the transaction
//     session.endSession();
//   }
// });

// async function deleteAllUsers(id, offerID, session) {
//   // Use the session to perform the update within the transaction
//   await User.findByIdAndUpdate(
//     id,
//     { $pull: { activeOffers: offerID } },
//     { session }
//   );
// }

// delete Offer -- Admin
exports.deleteOffer = catchAsyncErrors(async (req, res, next) => {
    const offer = await Offer.findById(req.params.id);
  
    if (!offer) {
      return next(new ErrorHander("Offer not found with this Id", 404));
    }
  
    await offer.deleteOne();
    // offer?.activeMembers?.users?.map((user) => 
    //   setTimeout(() => {deleteAllUsers(user._id,req.params.id)},300)
    // )
    res.status(200).json({
      success: true,
    });
  });

  // async function deleteAllUsers(id, offerID) {
  //   const user = await User.findById(id);
  //   user.activeOffers = user?.activeOffers.filter((offer) => offer._id.toString() !== offerID.toString());
  //   await user.save({ validateBeforeSave: false });
  // }

// Offer activate / deactivate
exports.changeOfferActivation = catchAsyncErrors(async (req, res, next) => {
    const offer = await Offer.findById(req.params.id);
  
    if (!offer) {
      return next(new ErrorHander("Offer not found with this Id", 404));
    }

    const isactivemember = (offer?.activeMembers?.users?.some((User) => User._id.toString() === req.body.userid));

    if (isactivemember === true) {
        offer.activeMembers.users = offer?.activeMembers?.users.filter((user) => user._id.toString() !== req.body.userid);
        offer.activeMembers.NumberOfMembers = offer?.activeMembers?.NumberOfMembers - 1;
        await removeOfferFromList(req.body.userid, req.params.id, offer.title, offer.referenceNumber);
    } 
    if (isactivemember === false) {
        const newuser = {_id : req.body.userid, name : req.body.name, email : req.body.email};
        offer?.activeMembers?.users?.push(newuser);
        offer.activeMembers.NumberOfMembers = offer?.activeMembers?.NumberOfMembers + 1;
        await addOfferInList(req.body.userid, req.params.id, offer.title, offer.referenceNumber);
    }
  
    await offer.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  });
  
  async function addOfferInList(id, offerID, title, ref) {
    const user = await User.findById(id);
    let newoffer = {_id : offerID, title : title, ref: ref};
    user?.activeOffers.push(newoffer);
    await user.save({ validateBeforeSave: false });
  }

  async function removeOfferFromList(id, offerID, title, ref) {
    const user = await User.findById(id);
    user.activeOffers = user?.activeOffers.filter((offer) => offer._id.toString() !== offerID);
    await user.save({ validateBeforeSave: false });
  }

// Dismiss Offer (Admin)
exports.adminActivationAccess = catchAsyncErrors(async (req, res, next) => {
  const offer = await Offer.findById(req.params.id);

  if (!offer) {
    return next(new ErrorHander("Offer not found with this Id", 404));
  }

  const isactivemember = (offer?.activeMembers?.users?.some((User) => User._id.toString() === req.body.userid));

  if (isactivemember === true) {
    offer.activeMembers.users = offer?.activeMembers?.users.filter((user) => user._id.toString() !== req.body.userid);
      offer.activeMembers.NumberOfMembers = offer?.activeMembers?.NumberOfMembers - 1;
      await removeOfferFromListByAdmin(req.body.userid, req.params.id, offer.title);
  }
  if (isactivemember === false) {
      const newuser = {_id : req.body.userid, name : req.body.name, email : req.body.email};
      offer?.activeMembers?.users?.push(newuser);
      offer.activeMembers.NumberOfMembers = offer?.activeMembers?.NumberOfMembers + 1;
      await addOfferInListByAdmin(req.body.userid, req.params.id, offer.title);
  }

  await offer.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
});

async function addOfferInListByAdmin(id, offerID, title) {
  const user = await User.findById(id);
  let newoffer = {_id : offerID, title : title};
  user?.activeOffers.push(newoffer);
  await user.save({ validateBeforeSave: false });
}

async function removeOfferFromListByAdmin(id, offerID, title) {
  const user = await User.findById(id);
  user.activeOffers = user?.activeOffers.filter((offer) => offer._id.toString() !== offerID);
  await user.save({ validateBeforeSave: false });
}