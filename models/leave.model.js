const mongoose = require("mongoose");
const LeaveSchema = new mongoose.Schema({
  studentName: {
    type: String,
    lowercase: true,
  },
  studentEmail : {
    type : String,
    lowercase: true
  },
  officialMailID: {
    type: String,
    lowercase: true,
  },
  reason: {
    type: String,
    lowercase: true,
    required : true
  },
  fromDate: {
    type: Date,
  },
  returnDate: {
    type: Date,
  },
  isApproved: {
    type: String,
    default: "null",
  },
  isGatePassIssued : {
    type : String,
    default : "null"
  },
  gatePassIssuedDay : {
    type : String,
    default : "null"
  }
});

const Leave = mongoose.model("leave", LeaveSchema);
module.exports = Leave;
