const router = require("express").Router();
const Leave = require("../models/leave.model");
const sendMail = require("../utils/email");
const client = require("../utils/sms");
const Hosteler = require("../models/hosteler.model");

router.get("/pending-request", async (req, res, next) => {
  const person = req.user;
  const requests = await Leave.find({
    isApproved: "null",
    officialMailID: person.email,
  });
  res.render("pending_requests", { requests });
});

// approve request post route
router.post("/approve-requests", async (req, res, next) => {
  if (req.body.decision === "Approve") {
    console.log(req.body);
    await Leave.updateOne(
      {
        isApproved: "null",
        studentEmail: req.body.studentEmail.trim(),
        fromDate: req.body.fromDate,
        returnDate: req.body.returnDate,
      },
      { isApproved: "true" }
    );

    const obj = {};
    obj["emailId"] = req.body.studentEmail;
    obj["text"] = `Your request for leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is approved`;
    obj["html"] = `<h3>Your request for leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is approved</h3>`;

    sendMail(obj);
    // .then((result) => console.log("Email sent...", result))
    // .catch((error) => console.log(error.message));

    res.redirect("/warden/pending-request");
  } else {
    await Leave.updateOne(
      {
        isApproved: "null",
        studentEmail: req.body.studentEmail.trim(),
        fromDate: req.body.fromDate,
        returnDate: req.body.returnDate,
      },
      { isApproved: "false" }
    );

    req.flash(
      "error",
      `leave request for ${req.body.studentName} (${req.body.studentEmail}) is denied`
    );
    res.redirect("/warden/pending-request");

    const obj = {};
    obj["emailId"] = req.body.studentEmail;
    obj["text"] = `Your request for leaave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied`;
    obj["html"] = `<h3>Your request for leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied</h3>`;

    sendMail(obj);
    // .then((result) => console.log("Email sent...", result))
    // .catch((error) => console.log(error.message));

     // finding the parent mail of student requested for leave
     const doc = await Hosteler.findOne({
      studentMail: `${req.body.studentEmail.trim()}`,
    });
    obj["emailId"] = doc.parentMail;
    obj["text"] = `The request of your ward for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied`;
    obj["html"] = `<h3>The request of your ward for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied</h3>`;

    sendMail(obj);
    // .then((result) => console.log("Email sent...", result))
    // .catch((error) => console.log(error.message));

    client.messages.create({
      from: '+19706846919',
      to: '+917012440501',
      body: `The request of your ward for the leave from ${new Date(req.body.fromDate).toDateString()} to ${new Date(req.body.returnDate).toDateString()} is denied`
    }).then((message) => console.log(message.sid));

    // finding the faculty mail of student requested for leave
    const doc2 = await Hosteler.findOne({
      studentMail: `${req.body.studentEmail.trim()}`,
    });
    obj["emailId"] = doc2.facultyMail;
    obj["text"] = `The request of ${
      req.body.studentName.toUpperCase()
    } for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied`;
    obj["html"] = `<h3>The request of ${
      req.body.studentName.toUpperCase()
    } for the leave from ${new Date(
      req.body.fromDate
    ).toDateString()} to ${new Date(
      req.body.returnDate
    ).toDateString()} is denied</h3>`;

    sendMail(obj);
  }
});

module.exports = router;
