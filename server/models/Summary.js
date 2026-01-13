import mongoose from "mongoose";

const summarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  budget: { type: Number, required: true },
  consumed: { type: Number, required: true },
  exercise: { type: Number, required: true },
  remaining: { type: Number, required: true },
  status: { type: String, required: true }, 
  date: { type: Date, default: Date.now },
}, {
    timestamps: true,
});

export default mongoose.model("Summary", summarySchema);
