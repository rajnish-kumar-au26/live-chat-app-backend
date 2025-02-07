const generateToken = require("../config/generateToken");
const UserModel = require("../modals/userModel");
const expressAsyncHandler = require("express-async-handler");

const loginController = expressAsyncHandler(async (req, res) => {
  try {
    console.log(req.body);
    const { name, password } = req.body;

    const user = await UserModel.findOne({ name });
    console.log("Fetched user data:", user);

    if (user && (await user.matchPassword(password))) {
      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      };
      console.log(response);
      res.json(response);
    } else {
      res.status(401).json({ message: "Invalid UserName or Password" });
    }
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Registration
const registerController = expressAsyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check for all fields
    if (!name || !email || !password) {
      res.status(400);
      throw Error("All necessary input fields have not been filled");
    }

    // Pre-existing user
    const userExist = await UserModel.findOne({ email });
    if (userExist) {
      throw new Error("User already Exists");
    }

    // Username already Taken
    const userNameExist = await UserModel.findOne({ name });
    if (userNameExist) {
      throw new Error("UserName already taken");
    }

    // Create an entry in the db
    const user = await UserModel.create({ name, email, password });
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Registration Error");
    }
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await UserModel.find(keyword).find({
      _id: { $ne: req.user._id },
    });
    res.send(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = {
  loginController,
  registerController,
  fetchAllUsersController,
};
