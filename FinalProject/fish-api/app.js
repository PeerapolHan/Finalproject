const express = require("express");
const cors = require('cors');
const fs = require('fs');
const tfNode = require('@tensorflow/tfjs-node');
const path = require('path')
const detectImage = require('./detect.js')
const dayjs = require("dayjs") ;


const app = express();
const port = 3001;
let average = 0;
// โมเดลที่ใช้ในการตรวจจับวัตถุ
const model = {
  net: null,
  inputShape: [1, 0, 0, 3],
};
const classThreshold = 0.2;

// cors เพื่ออนุญาติการเข้าถึงapi
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','https://fish-frontend-jet.vercel.app'],
  method: ['GET' , 'POST' , 'PUT' , 'DELETE'],
  credentials: true
}));

app.use(express.json({limit: "10mb", extended: true}))
app.use(express.urlencoded({limit: "10mb", extended: true, parameterLimit: 50000}))
// Middleware เพื่อให้ Express เข้าถึงไฟล์ในโฟลเดอร์ public
app.use(express.static(path.join(path.resolve(), "public")));

async function loadModel() {
  await tfNode.ready();

  const modelName = "finalfishv38con2_0.849_web_model";
  const modelUrl = `http://127.0.0.1:3001/${modelName}/model.json`; // URL ของโมเดลบนเว็บเซิร์ฟเวอร์ BackEnd\public\fishtrainIV0.89_web_model

  const yolov5 = await tfNode.loadGraphModel(modelUrl); // โหลดโมเดลจาก URL
  console.log("warming up model");
  // warming up model
  const dummyInput = tfNode.zeros(yolov5.inputs[0].shape);
  const warmupResult = await yolov5.executeAsync(dummyInput);
  tfNode.dispose(warmupResult); // cleanup memory
  tfNode.dispose(dummyInput); // cleanup memory

  model.net = yolov5;
  model.inputShape = yolov5.inputs[0].shape;
  console.log("Model loaded");
}
//load model เมื่อ start server
loadModel();
const savedata = (num_data) => {
  if (num_data > 0) {
    const now = dayjs();
    const dateTime = now.format('YYYY-M-D HH:mm:ss');;
    // สร้างข้อมูล CSV ที่มีคอลัมน์ใหม่
    const data = `${num_data},${dateTime}\n`; // ใช้เครื่องหมาย , เพื่อแยกคอลัมน์
    // บันทึกข้อมูลลงในไฟล์ CSV
    fs.appendFile("testData.csv", data, (err) => {
      if (err) {
        console.error("เกิดข้อผิดพลาดในการบันทึกไฟล์ CSV:", err);
      } else {
        console.log("บันทึกข้อมูลเรียบร้อยแล้ว", dateTime);
      }
    });
  }
};

app.post("/upload", async (req, res) => { 
  const images  = req.body.images;
  let countAvg = []
  if (images && Array.isArray(images) && images.length > 0) {
    for (let index = 0; index < images.length; index++) {
      const base64String = images[index];
      const imageBuffer = Buffer.from(base64String, "base64");
      const inputImage = tfNode.node.decodeImage(imageBuffer); 
      const imageName = `CaptureImage_${index}.jpg`;
      fs.writeFileSync(`Image/${imageName}`, imageBuffer);
      console.log(`Image ${index} saved successfully.`);
      const countnumber = await detectImage(inputImage,index, model, classThreshold);
      countAvg.push(countnumber)
    }
    average = await Math.round(countAvg.reduce((acc, val) => acc + val, 0) / countAvg.length);
    console.log("CountAvg:", average);
    await savedata(average);
    global.average = average;
    res.status(200).json({average});
  } else {
    console.error("Invalid images array.");
    res.status(400).send("Invalid images array.");
  }
});
app.get("/getAvg", (req, res) => {
    res.status(200).json({average});
  });

app.get("/get-data", (req, res) => {
  fs.readFile("testData.csv", "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading CSV file:", err);
      res.status(500).json({ error: "Error reading CSV file" });
    } else {
      res.send(data);
    }
  });
});
app.get("/get-img", (req,res) =>{
  console.log("Send Image")
  let ImageDialog = []
  for(let index = 0; index < 5; index++){
    const imagePath = path.join(__dirname,"Image",`CaptureImageWithBoxes_${index}.jpg`)
    const imageBuffer = fs.readFileSync(imagePath)
    const base64String = imageBuffer.toString('base64')
    ImageDialog.push(base64String)
  }
  
  res.send(ImageDialog) 
})
app.get("/get-firstImg", (req,res) =>{
    const imagePath = path.join(__dirname,"Image",`CaptureImage_0.jpg`)
    const imageBuffer = fs.readFileSync(imagePath)
    const base64String = imageBuffer.toString('base64')
    
    res.status(200).json({base64String}); 
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
