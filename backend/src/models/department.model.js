const mongoose = require("mongoose");
const softDeletePlugin = require("../plugins/softDelete.plugin");

const departmentSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

},
{ timestamps: true }
);

departmentSchema.plugin(softDeletePlugin);

module.exports = mongoose.model("Department", departmentSchema);