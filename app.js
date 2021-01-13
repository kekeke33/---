const express = require("express");
const app = express();
const md5 = require("blueimp-md5");
const dayjs = require("dayjs");
const cors = require("cors");
const User = require("./model/user");
const Category = require("./model/category");
const ProductModel = require("./model/ProductModel");
const Roles = require("./model/roles");
const multer = require("multer");
const pageFilter = require("./util/pagefilter");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // 请求体参数是: name=tom&pwd=123
app.use(cors());
// =============upload======================
/*
处理文件上传的路由
 */
const path = require("path");
const fs = require("fs");

const dirPath = path.join(__dirname, ".", "public/upload");

const storage = multer.diskStorage({
  // destination: 'upload', //string时,服务启动将会自动创建文件夹
  destination: function (req, file, cb) {
    //函数需手动创建文件夹
    console.log("destination()", file);
    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, function (err) {
        if (err) {
          console.log(err);
        } else {
          cb(null, dirPath);
        }
      });
    } else {
      cb(null, dirPath);
    }
  },
  filename: function (req, file, cb) {
    console.log("filename()", file);
    var ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});
console.log(storage);
const upload = multer({ storage });
console.log(upload);
const uploadSingle = upload.single("image");

// =============upload======================

// 上传图片
app.post("/manage/img/upload", (req, res) => {
  console.log(req.file);
  uploadSingle(req, res, function (err) {
    //错误处理
    if (err) {
      return res.json({
        status: 1,
        msg: "上传文件失败",
      });
    }
    var file = req.file;
    res.json({
      status: 0,
      data: {
        name: file.filename,
        url: "http://localhost:5001/upload/" + file.filename,
      },
    });
  });
});

// 删除图片
app.post("/manage/img/delete", (req, res) => {
  const { name } = req.body;
  fs.unlink(path.join(dirPath, name), (err) => {
    if (err) {
      console.log(err);
      res.json({
        status: 1,
        msg: "删除文件失败",
      });
    } else {
      res.json({
        status: 0,
      });
    }
  });
});

//--------------------`注册```````````````````````````---
app.post("/res", async (req, res) => {
  console.log(req.body);
  const { username, password } = req.body;

  // console.log(req.body);
  const two = await User.find({ username: username });
  if (two.length > 0) {
    res.json({
      status: 1,
      msg: "用户名已被注册",
    });
  } else {
    let time = dayjs().format("YYYY-MM-DD HH:mm:ss");
    // const user = new User(req.body);
    const result = await User.create({
      ...req.body,
      password: md5(password || "zhang"),
      time,
    });
    // console.log(result);
    if (result) {
      res.json({
        status: 0,
        msg: "添加成功",
        time,
        data: { ...req.body, password: md5(req.body.password || "atguigu") },
      });
    }
  }
  // console.log(two);
});
//-----------------```登录`````````````````````````````--
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // console.log(req.body);
  const result = await User.findOne({ username, password: md5(password) });
  console.log(result);
  if (result) {
    res.cookie("userid", result._id, { maxAge: 1000 * 60 * 60 * 24 });

    res.json({
      status: 0,
      msg: "登录成功",
      data: result,
    });
  } else {
    res.json({
      status: 1,
      msg: "登录失败,检查用户名密码",
    });
  }
});
//--------查询所有用户--------------------------------
app.get("/finduserlist", async (req, res) => {
  const result = await User.find({ username: { $ne: "admin" } });
  res.json({
    status: 0,
    data: result,
  });
});
//-------删除用户-----------------------------------
app.post("/deluser", async (req, res) => {
  const result = await User.deleteOne({ _id: req.body.id });
  console.log(result);
  res.json({
    status: 0,
    msg: "删除成功",
  });
});
//-------修改用户-----------------------------------
app.post("/editusercase", async (req, res) => {
  console.log(req.body);
  const { _id, username, email, phone, usercla } = req.body;
  const result = await User.findByIdAndUpdate(
    { _id },
    {
      username,
      email,
      phone,
      usercla,
    }
  );
  if (result) {
    res.json({
      status: 0,
      msg: "修改成功",
    });
  } else {
    res.json({
      status: 1,
      msg: "修改失败",
    });
  }
});
//--------添加分类--------------------------------------
app.post("/pluscategory", async (req, res) => {
  console.log(req.body);
  const { name, parentId } = req.body;
  const result = await Category.findOne({ name });
  if (!result) {
    const succ = await Category.create({
      name: name,
      parentId: parentId || "0",
    });
    if (succ) {
      res.json({
        status: 0,
        msg: "添加成功",
        data: succ,
      });
    }
  } else {
    res.json({
      status: 1,
      msg: "类别已存在",
    });
  }
});
//-------查看所有分类=--------------------------

//--------查看分类--------------------------------------
app.post("/categorylist", async (req, res) => {
  console.log(111, req.body);
  const { parentId, name } = req.body;
  if (!parentId) {
    const result = await Category.find({ parentId: 0 });
    if (result.length > 0) {
      res.json({
        status: 0,
        msg: "更新成功",
        data: result,
      });
    } else {
      res.json({
        status: 1,
        msg: "暂无数据",
      });
    }
  } else {
    console.log(222, name);
    const result = await Category.find({ parentId: name });
    console.log(result);
    if (result.length > 0) {
      res.json({
        status: 0,
        msg: "子分类更新成功",
        data: result,
      });
    } else {
      res.json({
        status: 1,
        msg: "暂无子分类",
      });
    }
  }
});
//--------修改分类--------------------------------------
app.post("/updataclass", async (req, res) => {
  console.log(req.body);
  const { _id, name } = req.body;
  const result = await Category.updateOne({ _id }, { name });
  console.log(result);
  res.json({
    status: 0,
    msg: "修改成功",
  });
});
//--------添加产品--------------------------------------
app.post("/addshop", async (req, res) => {
  // console.log({ ...req.body });
  // Object.keys(req.body).map((item) => {
  //   // console.log(req.body[item]);
  //   if (!req.body[item]) {
  //     res.json({
  //       static: 1,
  //       msg: "请补全数据",
  //     });
  //     return;
  //   }
  // });
  const result = await ProductModel.create(req.body);
  if (result) {
    console.log(result);
    res.json({
      status: 0,
      msg: "添加商品成功!",
      data: result,
    });
  } else {
    res.json({
      status: 1,
      msg: "添加失败!",
    });
  }
});
// console.log(pageFilter);
//--------查看产品--------------------------------------
app.post("/lookshopcase", async (req, res) => {
  const { pageNum, pageSize } = req.body;
  console.log(req.body);

  ProductModel.find({})
    .then((products) => {
      res.json({
        status: 0,
        msg: "查询商品成功",
        data: pageFilter(products, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("获取商品列表异常", error);
      res.json({ status: 1, msg: "获取商品列表异常, 请重新尝试" });
    });
  // ================
  //   const result = await ProductModel.find();
  //   if (result) {
  //     res.json({
  //       status: 0,
  //       msg: "查询商品成功",
  //       data: result,
  //     });
  //   } else {
  //     res.json({
  //       status: 1,
  //       msg: "暂无商品",
  //     });
  //   }
});

//-------------------------添加角色----------------------------------------
app.post("/addroles", async (req, res) => {
  console.log(req.body);
  let creatime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  let { name } = req.body;
  const result = await Roles.create({
    creatime,
    name,
    impowertime: "",
    impowername: "",
  });
  // console.log(result);
  if (result) {
    res.json({
      static: 0,
      msg: "添加角色成功",
    });
  } else {
    res.json({
      static: 1,
      msg: "添加角色失败",
    });
  }
});

//-------------------------查看角色----------------------------------------
app.post("/lookroles", async (req, res) => {
  const { pageNum, pageSize } = req.body;
  console.log(req.body);
  if (pageNum === "all") {
    const result = await Roles.find();
    console.log(result);
    if (result) {
      res.json({
        status: 0,
        msg: "查询角色成功",
        data: result,
      });
    }
    return;
  }
  Roles.find({})
    .then((Roles) => {
      // console.log(Roles);
      res.json({
        status: 0,
        msg: "查询角色成功",
        data: pageFilter(Roles, pageNum, pageSize),
      });
    })
    .catch((error) => {
      console.error("获取角色列表异常", error);
      res.json({ status: 1, msg: "获取角色列表异常, 请重新尝试" });
    });
});
//-------------------------修改角色权限----------------------------------------
app.post("/updataroles", async (req, res) => {
  let impowertime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  let impowername = req.body.impowername;
  let _id = req.body._id;
  let menus = req.body.menus;
  console.log(menus);
  const result = await Roles.findByIdAndUpdate(
    { _id },
    {
      impowertime,
      impowername,
      menus,
    },
    { new: true }
  );
  console.log(result);
  if (result) {
    res.json({
      status: 0,
      msg: "设置成功",
    });
  }
});

//-------------------------查看角色权限----------------------------------------

app.post("/lookuserRole", async (req, res) => {
  console.log(req.body);
  const { name } = req.body;
  const result = await Roles.findOne({ name });
  console.log(11111111, result);
  res.json({
    status: 0,
    msg: "权限获取成功",
    menus: result.menus,
  });
});
//-----------------------------------------------------------------

app.listen(5001, () => {
  console.log("5001端口监听中");
});
