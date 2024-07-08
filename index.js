import express from "express";
import { db } from "./Database/db.js";
import usermodel from "./Model/Usermodel.js";
import postmodel from "./Model/Postmodel.js";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import dotenv from 'dotenv'

dotenv.config({
    path:'./.env'
})

 const port = process.env.port;
// export const mongo_uri = process.env.mongo_uri

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const uploadmiddleware = multer({ dest: "uploads/" });

const app = express();
const jwtSecret = "harsh2003";

app.get("/", (req, res) => {
  res.send("we are good at our place");
});

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static(__dirname + "/uploads"));

db();
// register route
// store data into database as user information
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const newuser = await usermodel.create({ email, password });
    console.log("created user");
    res.status(200).json(newuser);
  } catch (error) {
    res.status(201).json("failed");
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await usermodel.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compare(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        {
          email: userDoc.email,
          id: userDoc._id,
        },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("not found");
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
      const { email, _id } = await usermodel.findById(userdata.id);
      res.json({ email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json("true");
});

app.post("/createpost", uploadmiddleware.single("file"), async (req, res) => {
  const { originalname, path } = req.file;
  const part = originalname.split(".");
  const ext = part[part.length - 1];
  const newpath = path + "." + ext;
  fs.renameSync(path, newpath);

  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, info) => {
    if (err) throw err;
    const { title, summary, content } = req.body;
    const postdoc = await postmodel.create({
      title,
      content,
      summary,
      cover: newpath,
      author: info.id,
    });

    res.send(postdoc);
  });

  console.log(newpath);
  // res.send(req.file);
});



app.get('/allpost', async (req, res) => {
  res.json(await postmodel.find().sort('-createdAt').populate('author', ['email']));
  // res.json(await postmodel.find({title:"Harsh bhadauriya"}));
})



app.get('/post/:id', async (req, res) => {
  const { id } = req.params;
  res.json(await postmodel.findById(id).populate('author', ['email']));
})

app.put('/post', uploadmiddleware.single("file"), async (req, res) => {
  let newPath = null;
  if (req.file) {
    const { originalname, path } = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path + '.' + ext;
    fs.renameSync(path, newPath);
    console.log("req file " + req.file);
  }
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userdata) => {
    if (err) throw new err;

    const { title, summary, content, id, } = req.body;
    const user = await postmodel.findByIdAndUpdate(id, { title, summary, content });



    //  image is not modifiying 

    console.log(user);



  })
  res.json(req.file)
})

app.delete('/delete/:id',async(req,res)=>{
  const {id} = req.params;
  await postmodel.findByIdAndDelete(id);
  res.send("post deleted")
})

app.listen(port || 2000, () => {
  console.log("server is running baby on " + port);
});
