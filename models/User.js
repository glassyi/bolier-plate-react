const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type: String,
    maxlength: 50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type: Number
  }
})

userSchema.set('collection', 'users');

userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) {
    return next(); // user.save 메소드로 바로 이동.
  }
  //비밀번호를 암호화
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) next(err);
      user.password = hash;
      next();
    })
  })
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
  // plainPassword 
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch)
  })
}

const User = mongoose.model('users', userSchema)

module.exports = {
  User
}
