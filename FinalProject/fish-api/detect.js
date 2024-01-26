const tfNode = require("@tensorflow/tfjs-node");
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
let countnumber;

const preprocess = (source, modelWidth, modelHeight) => {
  let xRatio, yRatio;

  const input = tfNode.tidy(() => {
    const img = source;

    const [h, w] = img.shape.slice(0, 2);
    const maxSize = Math.max(w, h);
    const imgPadded = img.pad([ //เตรียมพื้นว่างสำหรับปรับขนาดภาพ
      [0, maxSize - h],
      [0, maxSize - w],
      [0, 0],
    ]);
    xRatio = maxSize;
    yRatio = maxSize;

    return tfNode.image
      .resizeBilinear(imgPadded, [modelWidth, modelHeight]) //ปรับขนาดภาพ
      .div(255.0) //หารให้ทุกค่าใน Tensor มีค่าเป็น 0,1
      .expandDims(0);//เพิ่มมิติที่ 4
  });

  return [input, xRatio, yRatio];
};

const detectImage = async (imgSource, indexImage, model, classThreshold) => {
  const [modelWidth, modelHeight] = model.inputShape.slice(1, 3);
  tfNode.engine().startScope();
  const [input, xRatio, yRatio] = preprocess(
    imgSource,
    modelWidth,
    modelHeight
  );

  const res = await model.net.executeAsync(input);

  const [boxes, scores, classes, num] = res.slice();
  const class_data = classes.dataSync();
  const boxes_data = boxes.dataSync();
  const scores_data = scores.dataSync();
  const num_data = num.dataSync();

  const imagePath = `./Image/CaptureImage_${indexImage}.jpg`;
  const img = await loadImage(imagePath);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, img.width, img.height);

  for (let i = 0; i < scores_data.length; ++i) {
    if (scores_data[i] > classThreshold) {
      let [xmin, ymin, xmax, ymax] = boxes_data.slice(i * 4, (i + 1) * 4);
      xmin *= xRatio; //ปรับขนาดภาพกลับ
      xmax *= xRatio;
      ymin *= yRatio;
      ymax *= yRatio;

      const boxWidth = xmax - xmin;
      const boxHeight = ymax - ymin;

      ctx.strokeStyle = "#ff0000";
      ctx.lineWidth = 2;
      ctx.strokeRect(xmin, ymin, boxWidth, boxHeight);
    }
  }
  console.log("Count: ", num_data[0]);
  countnumber = num_data[0];

  const outputImagePath = `./Image/CaptureImageWithBoxes_${indexImage}.jpg`;
  if (countnumber > 0) {
    const out = fs.createWriteStream(outputImagePath);
    const stream = canvas.createJPEGStream();
    stream.pipe(out);

    out.on('finish', () => {
      console.log('draw successful');
    });

    out.on('error', (err) => {
      console.error(err);
    });
  }

  return countnumber;
};

module.exports = detectImage;
