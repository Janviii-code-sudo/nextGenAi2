import mongoose from "mongoose";

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    targetRole: {
      type: String,
      required: true
    },

    currentLevel: {
      type: String,
      default: "Beginner"
    },

    skills: [
      {
        type: String
      }
    ],

    roadmap: [
      {
        title: {
          type: String,
          default: ""
        },

        description: {
          type: String,
          default: ""
        },

        topics: [
          {
            type: String
          }
        ],

        resources: [
          {
            type: String
          }
        ],

        completed: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Roadmap = mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
