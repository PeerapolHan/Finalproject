import { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import Navbar from "./components/Navbar";
import { Paper, Button } from "@mui/material";



function App() {
  const [countNumber, setcountNumber] = useState(0);
  const [image, setImage] = useState();
  const getAvg = () => {
    axios.get("https://fish-api-0fmm.onrender.com/getAvg").then((response) => {
      setcountNumber(response.data.average);
      
    });
  }
  const getImg = () => {
    axios.get("https://fish-api-0fmm.onrender.com/get-firstImg")
      .then((response) => {
        const base64Image = response.data.base64String; 
        setImage(base64Image); 
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });
  };
  useEffect(() => {
    const interval = setInterval(() => {
      getAvg();
      getImg();
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <div className="navbar-container">
        <Navbar />
      </div>
      <div className="PaperWrapper">
        <Paper
          elevation={5}
          sx={{ overflow: "hidden", borderRadius: "20px" }}
          className="CenterPaperApp"
        >
          <h2>ข้อมูลการนับครั้งล่าสุด</h2>
          <img src={`data:image/jpeg;base64,${image}`} width={'90%'} height={'50%'} style={{maxWidth:"640px", maxHeight:"480px"}}/>
          <div className="count-container">
            <h1 className="count-text">จำนวน: {countNumber} ตัว</h1>
          </div>
        </Paper>
      </div>
    </>
  );
}

export default App;
