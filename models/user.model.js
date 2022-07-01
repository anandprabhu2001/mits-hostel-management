const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const createHttpError = require('http-errors');
const { roles } = require('../utils/constants');

const UserSchema = new mongoose.Schema({
  username : {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  department : {
    type: String,
    required: true,
    lowercase: true,
  },
  gender : {
    type: String,
    lowercase: true,
    // required : true
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.admin,roles.client,roles.matron,roles.warden],
    default: roles.client,
  },
  semester : {
    type : String,
    lowercase : true,
    default : "nil"
  },
  status : {
    type: String,
    lowercase : true,
    default : 'in'
  }
});

UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      if (this.email === process.env.ADMIN_EMAIL.toLowerCase()) {
        this.role = roles.admin;
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
};

const User = mongoose.model('user', UserSchema);
module.exports = User;
