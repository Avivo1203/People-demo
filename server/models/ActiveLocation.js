const mongoose = require("mongoose");

const ActiveLocationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    radius: {
      type: Number,
      default: 1500,
    },

    privacyMode: {
      type: String,
      enum: ["visible", "radiusOnly", "hidden"],
      default: "visible",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

ActiveLocationSchema.index({ location: "2dsphere" });
ActiveLocationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("ActiveLocation", ActiveLocationSchema);