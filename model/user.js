const mongoose = require("mongoose");
const md5 = require("blueimp-md5");

mongoose.connect("mongodb://localhost:27017/1229user", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
const Schema = mongoose.Schema;
const userSchema = new Schema({
  username: String,
  password: String,
  phone: Number,
  email: String,
  time: String,
  usercla: String,
});

const User = mongoose.model("User", userSchema, "user");
// 初始化默认超级管理员用户: admin/admin
User.findOne({ username: "admin" }).then((user) => {
  if (!user) {
    User.create({ username: "admin", password: md5("admin") }).then((user) => {
      console.log("初始化用户: 用户名: admin 密码为: admin");
    });
  }
});
module.exports = User;
