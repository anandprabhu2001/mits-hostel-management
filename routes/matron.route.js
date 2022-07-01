const router = require("express").Router();
const Leave = require("../models/leave.model");
const Matron = require("../models/matron.model");
const Warden = require("../models/warden.model");
const Hosteler = require("../models/hosteler.model");
const sendMail = require("../utils/email");
const client = require("../utils/sms");
const User = require("../models/user.model");
const axios = require("axios");

router.get("/uninformed-leaves", async (req, res, next) => {
  try {
    res.render("uninformed-leaves", { doc: null });
  } catch (error) {
    next(error);
  }
});

router.post("/uninformed-leaves", async (req, res, next) => {
  try {
    console.log(req.body);
    const email = req.body.studentId + "@mgits.ac.in";
    const doc = await User.findOne({ email: email });
    res.render("uninformed-leaves", { doc });
  } catch (error) {
    next(error);
  }
});

router.post("/confirm-student", async (req, res, next) => {
  try {
    const doc = await Hosteler.findOne({
      studentMail: `${req.body.studentEmail.trim()}`,
    });
    
    const user = await User.findOne({
      email : `${req.body.studentEmail.trim()}`
    })
    
    // sending sms to the parent's phone number
    axios
      .get(
        `http://sms.xpresssms.in/api/api.php?ver=1&mode=1&action=push_sms&type=1&route=2&login_name=mitssms&api_password=1e68f4587d55550bb78d&message=Dear Parent,Your ward ${req.body.studentName} of ${req.body.semester} ${user.department.toUpperCase()} is not present during roll call and has left the hostel without permission.Muthoot Institute of Technology and Science&number=${doc.parentNumber}&sender=MITSAD&template_id=1207165588957152960`)
      .then((result) => {
        console.log("message sent....");
      })
      .catch((error) => {
        console.log(error);
      });

    req.flash("success", "Parent has been informed");
    res.redirect("uninformed-leaves");
  } catch (error) {
    next(error);
  }
});

router.get("/confirm-arrival", async (req, res, next) => {
  try {
    res.render("confirm-arrival");
  } catch (err) {
    next(err);
  }
});

router.post("/confirm-arrival", async (req, res, next) => {
  try {
    const users = await User.find({
      semester: `${req.body.semester}`,
      role: `CLIENT`,
      status: "out",
      gender: `${req.user.gender}`,
    });
    users.forEach((user) => {
      console.log(user.username);
    });
    res.render("confirm-arrival", { users });
  } catch (error) {
    next(error);
  }
});

router.post("/send-message", async (req, res, next) => {
  try {
    console.log(req.body);

    // finding the parentmail of student requested for leave
    const doc = await Hosteler.findOne({
      studentMail: `${req.body.email.trim()}`,
    });

    const user = await User.findOne({
      email : `${req.body.email.trim()}`
    })

    await User.updateOne({ email: req.body.email.trim() }, { status: "in" });
    
    let d = new Date();
    let todayDate = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

    axios.get(`http://sms.xpresssms.in/api/api.php?ver=1&mode=1&action=push_sms&type=1&route=2&login_name=mitssms&api_password=1e68f4587d55550bb78d&message=Dear Parent,Your ward ${user.username.toUpperCase()} of ${user.semester.toUpperCase()} ${user.department.toUpperCase()} has reached the hostel on ${todayDate}.Muthoot Institute of Technology and Science&number=${doc.parentNumber}&sender=MITSAD&template_id=1207165589084769557`)
  } catch (error) {
    next(error);
  }
});

router.get("/issue-gate-pass", async (req, res, next) => {
  try {
    const person = req.user;
    console.log(person);
    const doc = await Matron.findOne({ matronMail: `${person.email}` });
    console.log(doc);
    const gender = doc.hostelType;
    console.log(gender);
    const doc2 = await Warden.findOne({ hostelType: `${gender}` });
    wardenMail = doc2.wardenMail;
    console.log(wardenMail);

    let requests1 = await Leave.find({
      isApproved: "true",
      officialMailID: `${wardenMail}`,
      isGatePassIssued: "null",
      gatePassIssuedDay: "null",
    });

    let requests2 = await Leave.find({
      reason: "weekly",
      officialMailID: person.email,
      isGatePassIssued: "null",
      gatePassIssuedDay: "null",
    });

    const requests = requests1.concat(requests2);
    res.render("gate-pass-students", { requests });
  } catch (error) {
    next(error);
  }
});

router.post("/issue-gate-pass", async (req, res, next) => {
  try {
    let d = new Date();
    let todayDate = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);

    const doc = await Hosteler.findOne({
      studentMail: `${req.body.studentEmail.trim()}`,
    });

    await Leave.updateOne(
      {
        isGatePassIssued: "null",
        studentEmail: req.body.studentEmail.trim(),
        fromDate: req.body.fromDate,
        returnDate: req.body.returnDate,
      },
      {
        isGatePassIssued: "true",
        gatePassIssuedDay: `${todayDate}`,
      }
    );

    await User.updateOne(
      { email: req.body.studentEmail.trim() },
      { status: "out" }
    );
    req.flash(
      "success",
      `You can now issue gate pass for ${req.body.studentName} (${req.body.studentEmail}).`
    );

    const name = req.body.studentName;
    const fromDate = new Date(req.body.fromDate).toDateString();
    const returnDate = new Date(req.body.returnDate).toDateString();
    const reason = `(Leave reason : ${req.body.reason})` ;
  
    let hr = d.getHours();
    let min = d.getMinutes();
    let sec = d.getSeconds();
    let time = d.toLocaleTimeString();
    let t = `${time} today`;
    console.log(t);

    // sending sms to the parent
    axios.get(`http://sms.xpresssms.in/api/api.php?ver=1&mode=1&action=push_sms&type=1&route=2&login_name=mitssms&api_password=1e68f4587d55550bb78d&message=Dear Parent,the request of your ward  of s6 cse for leave from ${fromDate} to ${returnDate} due to  ${reason} is approved and gate pass is issued at ${t}.Muthoot Institute of Technology and Science&number=${doc.parentNumber}&sender=MITSAD&template_id=1207165588943996547`)

    let obj = {};
    // finding the faculty mail of student requested for leave
    const doc2 = await Hosteler.findOne({
      studentMail: `${req.body.studentEmail.trim()}`,
    });
    obj["emailId"] = doc2.facultyMail;
    obj[
      "text"
    ] = `The request of ${req.body.studentName.toUpperCase()} for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is approved and gate pass is issued.`;
    obj[
      "html"
    ] = `<h3>The request of ${req.body.studentName.toUpperCase()} for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is approved and gate pass is issued.</h3>`;

    sendMail(obj);

    res.redirect("/matron/issue-gate-pass");
  } catch (error) {
    next(error);
  }
});

router.get("/issued-passes-today", async (req, res, next) => {
  let d = new Date();
  let todayDate =
    d.getFullYear() +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + d.getDate()).slice(-2);

  const person = req.user;
  console.log(person);
  const doc = await Matron.findOne({ matronMail: `${person.email}` });
  console.log(doc);
  const gender = doc.hostelType;
  console.log(gender);
  const doc2 = await Warden.findOne({ hostelType: `${gender}` });
  wardenMail = doc2.wardenMail;
  console.log(wardenMail);

  let requests1 = await Leave.find({
    isApproved: "true",
    isGatePassIssued: "true",
    officialMailID: `${wardenMail}`,
    gatePassIssuedDay: `${todayDate}`,
  });

  let requests2 = await Leave.find({
    officialMailID: person.email,
    isGatePassIssued: "true",
    gatePassIssuedDay: `${todayDate}`,
  });

  const requests = requests1.concat(requests2);
  res.render("today-issued-gate-passes", { requests });
});

module.exports = router;
