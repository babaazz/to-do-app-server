import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "A user must have firstname"],
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: [true, "A user must have a last name"],
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: [true, "A user must have an email"],
      min: 2,
      max: 50,
      unique: [true, "This email is already in use"],
      validate: {
        validator: function (value) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        },
        message: "Please provide a valid email",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide valid password"],
      min: 5,
      validate: {
        validator: function (value) {
          // Password must contain an uppercase letter, a lowercase letter, a number, and a special character
          const regex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          return regex.test(value);
        },
        message:
          "Password must contain an uppercase letter, a lowercase letter, a number, and a special character",
      },
      select: false,
    },
    confirmPassword: {
      type: String,
      required: true,
      min: 5,
      validate: {
        validator: function (value) {
          return value === this.password;
        },
        message: "Password and confirmed password don't match",
      },
    },
    picturePath: {
      type: String,
      default: "",
    },
    refreshToken: String,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
  },
  { timestamps: true }
);

//UserSchema Methods
//Method to check if the password matched
UserSchema.methods.isPasswordMatched = async function (
  inputPassword,
  userPassword
) {
  return await bcrypt.compare(inputPassword, userPassword);
};

//Method to check if the password has been changed after the last login

UserSchema.methods.hasPasswordChangedAfterLastLogin = function (jwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedAt = parseInt(this.passwordChangedAt.getTime()) / 1000;
    return passwordChangedAt > jwtTimeStamp;
  }
  return false;
};

//Schema Middlewares

//Hashing The Password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined;
  next();
});

const User = mongoose.model("User", UserSchema);
export default User;
