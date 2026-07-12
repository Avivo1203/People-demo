const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    statusId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AreaStatus",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.index({ statusId: 1, createdAt: -1 });

module.exports = mongoose.model("Comment", CommentSchema);