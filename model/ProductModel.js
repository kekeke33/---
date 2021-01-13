/*
能操作products集合数据的Model
 */
const mongoose = require("mongoose");
// const md5 = require("blueimp-md5");

mongoose.connect("mongodb://localhost:27017/1229user", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// 2.字义Schema(描述文档结构)
const productSchema = new mongoose.Schema({
  categoryId: { type: String, required: true }, // 所属分类的id
  pCategoryId: { type: String, required: true }, // 所属分类的父分类id
  name: { type: String, required: true }, // 名称
  price: { type: Number, required: true }, // 价格
  desc: { type: String },
  status: { type: Number, default: 1 }, // 商品状态: 1:在售, 2: 下架了
  imgs: { type: Array, default: [] }, // n个图片文件名的json字符串
  detail: { type: String },
});

// 3. 定义Model(与集合对应, 可以操作集合)
const ProductModel = mongoose.model("products", productSchema);

// 4. 向外暴露Model
module.exports = ProductModel;
