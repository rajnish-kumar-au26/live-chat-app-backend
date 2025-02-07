const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  groupExit,
  fetchGroups,
  joinGroupChat,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/createGroup").post(protect, createGroupChat);
router.route("/fetchGroups").get(protect, fetchGroups);
router.route("/groupJoin").post(protect, joinGroupChat);
router.route("/groupExit").put(protect, groupExit);

module.exports = router;
