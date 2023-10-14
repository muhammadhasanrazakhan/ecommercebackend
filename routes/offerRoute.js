const express = require("express");
const {
  createOffer,
  getSingleOffer,
  getAllOffers,
  updateOffer,
  changeOfferActivation,
  adminActivationAccess,
  deleteOffer,
} = require("../controllers/offerController");
const router = express.Router();

const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/offer/new").post(isAuthenticatedUser, authorizeRoles("admin"), createOffer);

// router.route("/offer/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOffer);

router.route("/offers").get(getAllOffers);

router
  .route("/admin/offer/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleOffer)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateOffer)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOffer);

router.route("/admin/offer/dismiss/:id").put(isAuthenticatedUser, authorizeRoles("admin"), adminActivationAccess);

router.route("/offer/changeactivation/:id").put(isAuthenticatedUser, changeOfferActivation);
  
module.exports = router;