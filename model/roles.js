const mongoose = require("mongoose");
// const md5 = require("blueimp-md5");

mongoose.connect("mongodb://localhost:27017/1229user", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
// 2.字义Schema(描述文档结构)
const Schema = mongoose.Schema;
const rolesSchema = new Schema({
  name: { type: String, required: true },
  creatime: String,
  impowertime: String,
  impowername: String,
  menus: Array, // 所有有权限操作的菜单path的数组
});

// 3. 定义Model(与集合对应, 可以操作集合)
const Roles = mongoose.model("Roles", rolesSchema, "roles");

module.exports = Roles;
