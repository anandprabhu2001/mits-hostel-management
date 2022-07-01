const User = require("../models/user.model");
const router = require("express").Router();
const mongoose = require("mongoose");
const { roles } = require("../utils/constants");
const Hosteler = require("../models/hosteler.model");
const Warden = require("../models/warden.model");
const Matron = require("../models/matron.model");
const path = require("path");
const xlsx = require("xlsx");

router.get("/upload-parent-faculty-details", async (req, res, next) => {
  try {
    res.render("parent-faculty-upload");
  } catch (error) {
    next(error);
  }
});

router.post("/upload-parent-faculty-details", async (req, res, next) => {
  try {
    const file = req.files.pFile;
    const fileName = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(
      __dirname,
      "../public",
      "parent-faculty-uploads",
      fileName
    );
    if (file.truncated) {
      throw new Error("File size is too big");
    }
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      await file.mv(savePath);
      let wb = xlsx.readFile(savePath, { sheetRows: 1 });

      for (let i = 0; i < 4; i++) {
        const sheetName = wb.SheetNames[i];
        let sheetValue = wb.Sheets[sheetName];

        //reading the headers of excel sheet and storing in columnsArray
        const columnsArray = xlsx.utils.sheet_to_json(sheetValue, {
          header: 1,
        })[0];
        console.log(columnsArray);

        //reading the excel body and we get an array of objects
        wb = xlsx.readFile(savePath);
        sheetValue = wb.Sheets[sheetName];
        let excelData = xlsx.utils.sheet_to_json(sheetValue);

        excelData.forEach((obj) => {
          delete obj[`${columnsArray[0]}`];
          obj["studentMail"] =
            obj[`${columnsArray[1]}`].toLowerCase() + "@mgits.ac.in";
          delete obj[`${columnsArray[1]}`];
          obj["studentName"] = obj[`${columnsArray[2]}`];
          delete obj[`${columnsArray[2]}`];
          obj["parentName"] = obj[`${columnsArray[3]}`];
          delete obj[`${columnsArray[3]}`];
          obj["parentNumber"] = obj[`${columnsArray[4]}`];
          delete obj[`${columnsArray[4]}`];
          obj["parentMail"] = obj[`${columnsArray[5]}`];
          delete obj[`${columnsArray[5]}`];
          obj["facultyMail"] = obj[`${columnsArray[6]}`];
          delete obj[`${columnsArray[6]}`];

          console.log(obj);
          obj.studentMail = ("" + obj.studentMail + "").trim();
          obj.studentName = ("" + obj.studentName + "").trim();
          obj.parentName = ("" + obj.parentName + "").trim();
          obj.parentNumber = ("" + obj.parentNumber + "").trim();
          obj.parentMail = ("" + obj.parentMail + "").trim();
          obj.facultyMail = ("" + obj.facultyMail + "").trim();

          Hosteler.find(
            { studentMail: `${obj.studentMail}` },
            async (err, result) => {
              if (result.length === 0) {
                const hosteler = new Hosteler(obj);
                hosteler.save();
              } else {
                await Hosteler.updateOne(
                  { studentMail: `${obj.studentMail}` },
                  {
                    studentName: `${obj.studentName}`,
                    studentMail: `${obj.studentMail}`,
                    parentMail: `${obj.parentMail}`,
                    facultyMail: `${obj.facultyMail}`,
                    parentName: `${obj.parentName}`,
                    parentNumber: `${obj.parentNumber}`,
                  }
                );
              }
            }
          );
        });
      }
      req.flash("success", "Your file is uploaded successfully");
    } else {
      throw new Error("Only excel sheet(.xlsx) is allowed");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", `${error}`);
  }
  res.redirect("/");
});

router.get("/upload-warden-details", async (req, res, next) => {
  try {
    res.render("warden-upload");
  } catch (error) {
    next(error);
  }
});

router.get("/upload-matron-details", async (req, res, next) => {
  try {
    res.render("matron-upload");
  } catch (error) {
    next(error);
  }
});

router.post("/upload-warden-details", async (req, res, next) => {
  try {
    const file = req.files.sFile;
    const fileName = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(
      __dirname,
      "../public",
      "warden-uploads",
      fileName
    );
    if (file.truncated) {
      throw new Error("File size is too big");
    }
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      await file.mv(savePath);

      let wb = xlsx.readFile(savePath, { sheetRows: 1 });
      const sheetName = wb.SheetNames[0];
      let sheetValue = wb.Sheets[sheetName];

      //reading the headers of excel sheet and storing in columnsArray
      const columnsArray = xlsx.utils.sheet_to_json(sheetValue, {
        header: 1,
      })[0];
      console.log(columnsArray);

      //reading the excel body and we get an array of objects
      wb = xlsx.readFile(savePath);
      sheetValue = wb.Sheets[sheetName];
      let excelData = xlsx.utils.sheet_to_json(sheetValue);

      excelData.forEach((obj) => {
        obj["wardenName"] = obj[`${columnsArray[0]}`];
        delete obj[`${columnsArray[0]}`];
        obj["wardenMail"] = obj[`${columnsArray[1]}`];
        delete obj[`${columnsArray[1]}`];
        obj["hostelType"] = obj[`${columnsArray[2]}`];
        delete obj[`${columnsArray[2]}`];

        obj.wardenName = obj.wardenName.trim();
        obj.wardenMail = obj.wardenMail.trim();
        obj.hostelType = obj.hostelType.trim();
        console.log(obj);

        // saving warden details to mongodb
        Warden.find(
          { wardenMail: `${obj.wardenMail}` },
          async (err, result) => {
            if (result.length === 0) {
              const warden = new Warden(obj);
              await warden.save();
            } else {
              Warden.updateOne(
                { wardenMail: `${obj.wardenMail}` },
                {
                  wardenName: `${obj.wardenName}`,
                  hostelType: `${obj.hostelType}`,
                }
              );
            }
          }
        );
      });
      req.flash("success", "Your file is uploaded successfully");
    } else {
      throw new Error("Only excel sheet(.xlsx) is allowed");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", `${error}`);
  }
  res.redirect("/");
});

router.post("/upload-matron-details", async (req, res, next) => {
  try {
    const file = req.files.sFile;
    const fileName = new Date().getTime().toString() + path.extname(file.name);
    const savePath = path.join(
      __dirname,
      "../public",
      "matron-uploads",
      fileName
    );
    if (file.truncated) {
      throw new Error("File size is too big");
    }
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      await file.mv(savePath);
      let wb = xlsx.readFile(savePath, { sheetRows: 1 });
      const sheetName = wb.SheetNames[0];
      let sheetValue = wb.Sheets[sheetName];

      //reading the headers of excel sheet and storing in columnsArray
      const columnsArray = xlsx.utils.sheet_to_json(sheetValue, {
        header: 1,
      })[0];
      console.log(columnsArray);

      //reading the excel body and we get an array of objects
      wb = xlsx.readFile(savePath);
      sheetValue = wb.Sheets[sheetName];
      let excelData = xlsx.utils.sheet_to_json(sheetValue);

      excelData.forEach((obj) => {
        obj["matronName"] = obj[`${columnsArray[0]}`];
        delete obj[`${columnsArray[0]}`];
        obj["matronMail"] = obj[`${columnsArray[1]}`];
        delete obj[`${columnsArray[1]}`];
        obj["hostelType"] = obj[`${columnsArray[2]}`];
        delete obj[`${columnsArray[2]}`];

        obj.matronName = obj.matronName.trim();
        obj.matronMail = obj.matronMail.trim();
        obj.hostelType = obj.hostelType.trim();
        console.log(obj);

        // saving matron details to mongodb
        Matron.find(
          { matronMail: `${obj.matronMail}` },
          async (err, result) => {
            if (result.length === 0) {
              const matron = new Matron(obj);
              await matron.save();
            } else {
              Matron.updateOne(
                { matronMail: `${obj.matronMail}` },
                {
                  matronName: `${obj.matronName}`,
                  hostelType: `${obj.hostelType}`,
                }
              );
            }
          }
        );
      });
      req.flash("success", "Your file is uploaded successfully");
    } else {
      throw new Error("Only excel sheet(.xlsx) is allowed");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", `${error}`);
  }
  res.redirect("/");
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    res.render("manage-users", { users });
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid id");
      res.redirect("/admin/users");
      return;
    }
    const person = await User.findById(id);
    res.render("profile", { person });
  } catch (error) {
    next(error);
  }
});

router.post("/update-role", async (req, res, next) => {
  try {
    const { id, role } = req.body;

    // Checking for id and roles in req.body
    if (!id || !role) {
      req.flash("error", "Invalid request");
      return res.redirect("back");
    }

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid id");
      return res.redirect("back");
    }

    // Check for Valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash("error", "Invalid role");
      return res.redirect("back");
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        "error",
        "Admins cannot remove themselves from Admin, ask another admin."
      );
      return res.redirect("back");
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash("info", `updated role for ${user.email} to ${user.role}`);
    res.redirect("back");
  } catch (error) {
    next(error);
  } 
});

router.post("/update-semester", async (req, res, next) => {
  try {
    const { id, semester } = req.body;
    console.log(req.body)

    // Check for valid mongoose objectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid id");
      return res.redirect("back");
    }

    // Admin cannot remove himself/herself as an admin
    if (req.user.id === id) {
      req.flash(
        "error",
        "Admins cannot have semester for themselves"
      );
      return res.redirect("back");
    }

    if (req.body.role === "MATRON") {
      req.flash(
        "error",
        "Matrons cannot have semester for themselves"
      );
      return res.redirect("back");
    }

    if (req.body.role === "WARDEN") {
      req.flash(
        "error",
        "Wardens cannot have semester for themselves"
      );
      return res.redirect("back");
    }

    // Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { semester },
      { new: true, runValidators: true }
    );

    req.flash("info", `updated semester for ${user.email} to ${user.semester}`);
    res.redirect("back");
  } catch (error) {
    next(error);
  } 
});


module.exports = router;
