const router = require("express").Router();
const Leave = require("../models/leave.model");
const Hosteler = require("../models/hosteler.model");
const sendMail = require("../utils/email");
const mysql = require("mysql2");
const Warden = require("../models/warden.model");
const Matron = require("../models/matron.model");
const { request } = require("express");

router.get("/profile", async (req, res, next) => {
  const person = req.user;
  res.render("profile", { person });
});

router.get("/leave-request", async (req, res, next) => {
  res.render("leave-request");
});

router.post("/leave-request", async (req, res, next) => {
  try {
    const person = req.user;

    req.body["studentName"] = person.username;
    req.body["studentEmail"] = person.email;
    if(req.body.fromDate > req.body.returnDate){
      req.flash(
        "warning",
        "Leave request for applied dates is not applicable"
      );
      res.redirect("/user/leave-request");
      return
    }
    else if (
      person.gender === "boy" &&
      (req.body.reason === "duty" ||
        req.body.reason === "sick" ||
        req.body.reason === "others")
    ) {
      const doc = await Warden.findOne({ hostelType: "boys" });
      req.body["officialMailID"] = doc.wardenMail;
    } else if (
      person.gender === "girl" &&
      (req.body.reason === "duty" ||
        req.body.reason === "sick" ||
        req.body.reason === "others")
    ) {
      const doc = await Warden.findOne({ hostelType: "girls" });
      req.body["officialMailID"] = doc.wardenMail;
    } else if (person.gender === "boy" && req.body.reason === "weekly") {
      const doc = await Matron.findOne({ hostelType: "boys" });
      req.body["officialMailID"] = doc.matronMail;
    } else if (person.gender === "girl" && req.body.reason === "weekly") {
      const doc = await Matron.findOne({ hostelType: "girls" });
      req.body["officialMailID"] = doc.matronMail;
    }
    console.log(req.body);

    Leave.find(
      {
        studentEmail: person.email,
        fromDate: req.body.fromDate,
        returnDate: req.body.returnDate,
      },
      async function (err, result) {
        try {
          if (result.length === 0) {
            if (req.body.otherReason != "") {
              req.body.reason += "-" + req.body.otherReason;
            }
            const leave = new Leave(req.body);
            await leave.save();

            const obj = {};
            obj["emailId"] = req.body.officialMailID;
            obj[
              "text"
            ] = `Student ${req.body.studentName.toUpperCase()} has requested a leave from ${new Date(
              req.body.fromDate
            ).toDateString()} to ${new Date(
              req.body.returnDate
            ).toDateString()}`;

            (obj[
              "html"
            ] = `<h3>Student ${req.body.studentName.toUpperCase()} has requested a leave from ${new Date(
              req.body.fromDate
            ).toDateString()} to ${new Date(
              req.body.returnDate
            ).toDateString()}</h3>
          <h4 style=" margin-bottom : 30px;"><b>Reason : </b> ${
            req.body.reason
          }</h4>
          <p><a href="#" style=" margin-bottom : 30px;text-decoration : none; border : 2px solid red ; border-radius : 20px ; background-color : red ; color : white; padding : 15px ;font-weight : bold;">Click here to login</a></p>`),
              sendMail(obj);
            req.flash("success", "Leave request submitted");
            res.redirect("/user/leave-request");
          } else {
            req.flash(
              "warning",
              "Leave request for these particular dates already submitted"
            );
            res.redirect("/user/leave-request");
          }
        } catch (err) {
          next(err);
        }
      }
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
