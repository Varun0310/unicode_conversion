// routes/aadhaar.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Aadhaar = require("../models/Aadhaar");
const User = require("../models/User");

// multer memory storage (NO FILES SAVED TO DISK)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// POST Aadhaar details -> final route: POST /api/aadhaar
router.post(
  "/",
  upload.fields([
    { name: "front", maxCount: 1 },
    { name: "back", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { userId, aadhaarNumber } = req.body;

      if (!userId || !aadhaarNumber) {
        return res
          .status(400)
          .json({ message: "Missing userId or Aadhaar number" });
      }

      if (!req.files || !req.files.front || !req.files.back) {
        return res
          .status(400)
          .json({ message: "Front and Back images are required" });
      }

      const frontImg = req.files.front[0].buffer;
      const backImg = req.files.back[0].buffer;

      const doc = await Aadhaar.create({
        userId,
        aadhaarNumber,
        frontImage: frontImg,
        backImage: backImg,
      });

      await User.findByIdAndUpdate(userId, {
        onboardingStep: "done",
      });

      res.status(201).json({
        message: "Aadhaar saved successfully",
        id: doc._id,
      });
    } catch (err) {
      console.error("Aadhaar upload error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// GET Aadhaar by userId -> GET /api/aadhaar/:userId
router.get("/:userId", async (req, res) => {
  try {
    const data = await Aadhaar.findOne({ userId: req.params.userId });

    if (!data) return res.status(404).json({ message: "Not found" });

    // return base64 images to client
    res.json({
      userId: data.userId,
      aadhaarNumber: data.aadhaarNumber,
      frontImage: data.frontImage.toString("base64"),
      backImage: data.backImage.toString("base64"),
    });
  } catch (err) {
    console.error("Aadhaar GET error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
