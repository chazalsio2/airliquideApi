import mongoose from "mongoose";

var schema = new mongoose.Schema(
  {
    civility: {
      type: String,
      required: false,
      enum: ["mister", "miss", ""],
    },
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    birthday: {
      type: String,
      required: false,
    },
    geographicSector: {
      type: String,
      enum: ["north", "east", "west", "south"],
    },
    address: {
      type: String,
      required: false,
    },
    zipcode: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      required: false,
    },
    displayName: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
    collection: "clients",
  }
);

schema.pre("save", async function (next) {
  try {
    this.displayName = `${this.firstname} ${this.lastname}`;
    next();
  } catch (e) {
    next(e);
  }
});

export default mongoose.model("Client", schema);
