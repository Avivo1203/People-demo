const mongoose = require("mongoose");

const Comment = require("../models/Comment");
const AreaStatus = require("../models/AreaStatus");

// יצירת תגובה חדשה לסטטוס
const createComment = async (req, res) => {
  try {
    const { statusId } = req.params;
    const cleanText = req.body.text?.trim();

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({
        message: "מזהה הסטטוס אינו תקין",
      });
    }

    if (!cleanText) {
      return res.status(400).json({
        message: "חסר תוכן לתגובה",
      });
    }

    if (cleanText.length > 300) {
      return res.status(400).json({
        message: "התגובה יכולה להכיל עד 300 תווים",
      });
    }

    const status = await AreaStatus.findOne({
      _id: statusId,
      expiresAt: { $gt: new Date() },
    });

    if (!status) {
      return res.status(404).json({
        message: "הסטטוס לא נמצא או שכבר פג תוקפו",
      });
    }

    const comment = await Comment.create({
      statusId,
      userId: req.userId,
      text: cleanText,
    });

    const populatedComment = await Comment.findById(comment._id).populate(
      "userId",
      "username firstName lastName"
    );

    return res.status(201).json({
      message: "התגובה נשמרה בהצלחה",
      comment: {
        id: populatedComment._id,
        statusId: populatedComment.statusId,
        userId: populatedComment.userId?._id,
        username: populatedComment.userId?.username || "משתמש",
        firstName: populatedComment.userId?.firstName,
        lastName: populatedComment.userId?.lastName,
        text: populatedComment.text,
        createdAt: populatedComment.createdAt,
      },
    });
  } catch (error) {
    console.error("Create comment error:", error);

    return res.status(500).json({
      message: "שגיאת שרת בשמירת התגובה",
    });
  }
};

// שליפת כל התגובות של סטטוס מסוים
const getCommentsByStatus = async (req, res) => {
  try {
    const { statusId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(statusId)) {
      return res.status(400).json({
        message: "מזהה הסטטוס אינו תקין",
      });
    }

    const status = await AreaStatus.findOne({
      _id: statusId,
      expiresAt: { $gt: new Date() },
    });

    if (!status) {
      return res.status(404).json({
        message: "הסטטוס לא נמצא או שכבר פג תוקפו",
      });
    }

    const comments = await Comment.find({ statusId })
      .populate("userId", "username firstName lastName")
      .sort({ createdAt: -1 });

    const result = comments.map((comment) => ({
      id: comment._id,
      statusId: comment.statusId,
      userId: comment.userId?._id,
      username: comment.userId?.username || "משתמש",
      firstName: comment.userId?.firstName,
      lastName: comment.userId?.lastName,
      text: comment.text,
      createdAt: comment.createdAt,
    }));

    return res.json(result);
  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      message: "שגיאת שרת בשליפת התגובות",
    });
  }
};

module.exports = {
  createComment,
  getCommentsByStatus,
};