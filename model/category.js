const mongoose = require("mongoose");
// const md5 = require("blueimp-md5");

mongoose.connect("mongodb://localhost:27017/1229user", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});
// 2.字义Schema(描述文档结构)
const Schema = mongoose.Schema;
const categorySchema = new Schema({
  name: { type: String, required: true },
  parentId: { type: String, required: true, default: "0" },
});

// 3. 定义Model(与集合对应, 可以操作集合)
const Category = mongoose.model("Category", categorySchema, "category");
// Category.findOne({ name: "admin" }).then((user) => {
//   if (!user) {
//     Category.create({ name: "水果" }).then((user) => {
//       console.log("初始化分类: name: admin ");
//     });
//   }
// });
module.exports = Category;
