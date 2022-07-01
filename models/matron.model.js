const mongoose = require('mongoose');

const MatronSchema = new mongoose.Schema({
    matronMail : {
        type : String,
        lowercase : true,
        required : true
    },
    matronName : {
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

const Matron = mongoose.model("matron", MatronSchema);
module.exports = Matron;