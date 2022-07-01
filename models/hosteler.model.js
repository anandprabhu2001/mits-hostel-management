const mongoose = require('mongoose');

const HostelerSchema = new mongoose.Schema({
    studentMail : {
        type : String,
        lowercase : true,
        required : true
    },
    studentName : {
        type : String,
        lowercase : true,
        required : true
    },
    parentName : {
        type : String,
        lowercase : true,
        // required : true,
        default : "null"
    },
    parentNumber : {
        type : String,
        lowercase : true,
        // required : true,
        default : "null"
    },
    parentMail : {
        type : String,
        lowercase : true,
        // required : true,
        default : "null"
    },
    facultyMail : {
        type:String,
        lowercase : true,
        // required : true,
        default :  "null"
    }
});

const Hosteler = mongoose.model("hosteler", HostelerSchema);
module.exports = Hosteler;