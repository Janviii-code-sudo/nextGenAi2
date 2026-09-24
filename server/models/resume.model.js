import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    personalInfo: {
      name: {
        type: String,
        default: ""
      },

      email: {
        type: String,
        default: ""
      },

      phone: {
        type: String,
        default: ""
      },

      location: {
        type: String,
        default: ""
      },

      linkedin: {
        type: String,
        default: ""
      },

      github: {
        type: String,
        default: ""
      }
    },

    summary: {
      type: String,
      default: ""
    },

    education: [
      {
        degree: {
          type: String,
          default: ""
        },

        institution: {
          type: String,
          default: ""
        },

        startYear: {
          type: String,
          default: ""
        },

        endYear: {
          type: String,
          default: ""
        }
      }
    ],

    skills: [
      {
        type: String
      }
    ],

    experience: [
      {
        company: {
          type: String,
          default: ""
        },

        position: {
          type: String,
          default: ""
        },

        startDate: {
          type: String,
          default: ""
        },

        endDate: {
          type: String,
          default: ""
        },

        description: {
          type: String,
          default: ""
        }
      }
    ],

    projects: [
      {
        title: {
          type: String,
          default: ""
        },

        description: {
          type: String,
          default: ""
        },

        technologies: [
          {
            type: String
          }
        ],

        link: {
          type: String,
          default: ""
        }
      }
    ],

    certifications: [
      {
        name: {
          type: String,
          default: ""
        },

        issuer: {
          type: String,
          default: ""
        },

        year: {
          type: String,
          default: ""
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Resume = mongoose.model("Resume", resumeSchema);

export default Resume;
