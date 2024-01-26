import React from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import dayjs from "dayjs";

Chart.register(...registerables);
const LineChart = ({ data, sameday}) => {
  const hourlyAverages = {}; // เก็บค่าเฉลี่ยรายชั่วโมง

  data.forEach((row) => {
    const date = dayjs(row.DATETIME, "YYYY-M-D").format("YYYY-M-D");
    const hour = dayjs(row.DATETIME, "YYYY-M-D H:mm").format("H");

    if (!hourlyAverages[date]) {
      hourlyAverages[date] = Array.from({ length: 24 }, () => ({ count: 1, total: 0 }));
    }

    const valueToAverage = parseFloat(row.FISH);

    if (!isNaN(valueToAverage)) {
      hourlyAverages[date][hour].count++;
      hourlyAverages[date][hour].total += valueToAverage;
    }
  });

  const hourAvgchartData = Object.keys(hourlyAverages).map((date) => {
    const hourlyAveragesForDate = hourlyAverages[date];
    const averages = hourlyAveragesForDate.map((hourData, index) => {
      const average = hourData.total / hourData.count;
      return { hour: index, average };
    });

    return averages;
  }).flat();
  console.log(hourAvgchartData)
  let xData3 = hourAvgchartData.map(item => item.hour);
  let yData3 = hourAvgchartData.map(item => item.average);

  const dailyAverages = {}; // สร้างออบเจ็กต์เพื่อเก็บค่าเฉลี่ยรายวัน
  // วนลูปข้อมูล CSV เพื่อคำนวณค่าเฉลี่ยรายวัน
  data.forEach((row) => {
    const date = dayjs(row.DATETIME, "YYYY-M-D").format("YYYY-M-D");
    if (!dailyAverages[date]) {
      dailyAverages[date] = { count: 0, total: 0 };
    }

    // ดำเนินการรวมค่าที่ต้องการนับค่าเฉลี่ย
    const valueToAverage = parseFloat(row.FISH); 
    if (!isNaN(valueToAverage)) {
      dailyAverages[date].count++;
      dailyAverages[date].total += valueToAverage;
    }
  });

  // สร้างข้อมูลสำหรับกราฟ
  const thisAvgchartData = Object.keys(dailyAverages).map((date) => {
    const average = dailyAverages[date].total / dailyAverages[date].count;
    console.log(average);
    return { DATETIME: date, FISH: average };
  });
  // แยกข้อมูล x (วันที่และเวลา) และ y (ค่าที่เกี่ยวข้อง) ออกจาก Object
  const xData1 = data.map((item) => item.DATETIME);
  console.log(xData1);
  const yData1 = data.map((item) => item.FISH);
  console.log(yData1);
  const xData2 = thisAvgchartData.map((item) => item.DATETIME);
  console.log(xData2);
  const yData2 = thisAvgchartData.map((item) => item.FISH);
  console.log(yData2);
  let xData = xData2 //กำหนดให้ default เป็นค่าเฉลี่ยไว้ ถ้าจำนวนครั้งไม่เยอะค่อยเปลี่ยนไปแสดงค่าจริง
  let yData = yData2
  if(sameday)//เงื่อนไขว่าถ้าเป็นวันเดียวกัน
  { 
    xData = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0') + ':00น.');
    yData = yData3
  }
  // ข้อมูลสำหรับ Line Chart
  const chartData = {
    labels: xData,
    datasets: [
      {
        label: "จำนวนปลาหางนกยูงเฉลี่ย",
        data: yData,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
      },
    ],
  };

  // ตัวเลือกสำหรับการแสดงผลของ Line Chart
  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineChart;
