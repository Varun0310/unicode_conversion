const express = require("express");
const router = express.Router();
const multer = require("multer");
const Customer = require("../models/Customer");
const User = require("../models/User");

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // accept only images
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"), false);
    }
    cb(null, true);
  },
});

// Create customer (expects multipart/form-data: name, phone, image)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { userId, name, phone } = req.body;

    // basic validation
    if (!userId || !name || !phone) {
      return res
        .status(400)
        .json({ message: "userId, name and phone are required." });
    }

    const customerData = {
      userId, // ✅ SAVE userId
      name,
      phone,
    };

    if (req.file) {
      customerData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size,
      };
    }

    const customer = new Customer(customerData);
    await customer.save();

    await User.findByIdAndUpdate(userId, {
      onboardingStep: "finance",
    });

    // return created id (do NOT send image buffer back)
    res.status(201).json({ message: "Customer created", id: customer._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get customer metadata (without image)
router.get("/:id", async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id).select("-image.data");
    if (!c) return res.status(404).json({ message: "Not found" });
    res.json(c);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get image
router.get("/:id/image", async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id).select("image");
    if (!c || !c.image || !c.image.data)
      return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", c.image.contentType);
    res.send(c.image.data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
