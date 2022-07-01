const mongoose = require('mongoose');

const WardenSchema = new mongoose.Schema({
    wardenMail : {
        type : String,
        lowercase : true,
        required : true
    },
    wardenName : {
        type : String,
        lowercase : true,
        required : true
    },
    hostelType : {
        type : String,
        lowercase : true,
        required : true
    }
});

const Warden = mongoose.model("warden", WardenSchema);
module.exports = Warden;