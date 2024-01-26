import React, { useEffect, useState, useCallback } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import {
  IconButton,
  Button,
  Input,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  TableContainer,
  TablePagination,
  TextField,
  Stack,
} from "@mui/material";
import HistoryChart from "./HistoryChart";
import "./History.css";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "boxicons";
import { utils, writeFile } from "xlsx";

dayjs.extend(isBetween);
function History() {
  //table Data
  const [csvData, setCsvData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  //Chart Data
  const [chartData, setchartData] = useState([]);
  const [backupChart, setBackupChart] = useState([]); //for reset button
  const [backupTable, setBackupTable] = useState([]); //for reset button
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sameday, setsameday] = useState(false);
  const [chooseDay, setchooseDay] = useState(false);  
  const [reverted, setreverted] = useState(false);
  const [mode, setMode] = useState("chart");

  const handleStartDateChange = (event) => {
    console.log("setStartDate: ", event.target.value);
    setStartDate(event.target.value);
  };
  const handleEndDateChange = (event) => {
    console.log("setEndDate: ", event.target.value);
    setEndDate(event.target.value);
    setchooseDay(true)
  };

  const handleFilter = () => {
    if(chooseDay){
      const startDateObj = dayjs(startDate);
      const endDateObj = dayjs(endDate);
      const filteredData = csvData.filter((row) => {
      const rowDate = dayjs(row.DATETIME, "D/M/YYYY");
      return dayjs(rowDate).isBetween(startDateObj, endDateObj, "day", "[]");
    });
    if(!reverted){
      setCsvData(filteredData.reverse());
      setchartData(filteredData);
    }
    setsameday(startDate == endDate); //เช็คว่าเป็นวันเดียวกัน
    setchooseDay(false)
    setreverted(true)
    }
  };

  const resetFilter = () => {
    setchartData(backupChart);
    setCsvData(backupTable);
    setsameday(false);
    setStartDate("");
    setEndDate("");
    setreverted(false)
  };

  useEffect(() => {
    console.log("OpenHistory");
    // เรียกใช้ API เพื่อดึงข้อมูล CSV
    axios.get("https://fish-api-0fmm.onrender.com/get-data").then((response) => {
      // ตัวอย่างข้อมูล CSV
      const Data = response.data;
      // แปลง CSV เป็นอาร์เรย์
      const lines = Data.trim().split("\n");
      const headers = lines[0].split(",").map((header) => header.trim()); // แก้ไขนี้
      const csvArray = lines.slice(1).map((line) => {
        const values = line.split(",").map((value) => value.trim()); // แก้ไขนี้
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        return row;
      });
      const clonedCsvArray = [...csvArray].reverse(); // Clone csvArray ก่อนที่จะ reverse เพราะหาก reverse แล้วข้างบนจะโดนผลกระทบไปด้วย
      setCsvData(clonedCsvArray); 
      setchartData(csvArray);
      setBackupTable(clonedCsvArray);
      setBackupChart(csvArray);
      
    });
  }, []);
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const slicedData = csvData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  //เปลี่ยนMode
  const handleChangeMode = () => {
    if (mode === "chart") {
      setMode("table");
    } else {
      setMode("chart");
    }
  };
  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(csvData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, "ข้อมูลการนับปลา.xlsx");
  }, [csvData]);
  return (
    <>
      <div className="navbar-container">
        <Navbar />
      </div>

      <Button
        variant="contained"
        id="Change"
        onClick={handleChangeMode}
        style={{
          position: "absolute",
          top: "85px",
          right: "10px",
          borderRadius: "20px",
          backgroundColor: "#00aa9f",
          "&:hover": {
            backgroundColor: "#00aa9f",
          },
        }}
      >
        {mode === "chart" ? (
          <box-icon name="table" rotate="270" color="white" />
        ) : (
          <box-icon name="line-chart" color="white" />
        )}
      </Button>
      {mode === "chart" ? (
        <div className="PaperWrapper" id="Chart">
          <Paper
            elevation={5}
            sx={{ overflow: "hidden", borderRadius: "20px" }}
            className="CenterPaper2"
          >
            <h2>กราฟค่าเฉลี่ยรายวัน</h2>
            <Stack
              justifyContent={"center"}
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2, md: 4 }}
              marginBottom={2}
            >
              <Input
                type="date"
                id="startdate"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <Input
                type="date"
                id="enddate"
                value={endDate}
                onChange={handleEndDateChange}
              />

              <Button
                variant="outlined"
                onClick={handleFilter}
                color="success"
                sx={{ borderRadius: "20px" }}
              >
                กำหนดวัน
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilter}
                sx={{ borderRadius: "20px" }}
              >
                รีเซ็ต
              </Button>
            </Stack>
            <HistoryChart data={chartData} sameday={sameday} />
          </Paper>
        </div>
      ) : (
        <div className="PaperWrapper" id="Table">
          <Paper
            sx={{ overflow: "hidden", borderRadius: "20px" }}
            className="CenterPaper"
          >
            <h2>ตารางประวัติการนับ</h2>
            <Stack
              justifyContent={"center"}
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2, md: 4 }}
              marginBottom={2}
            >
              <Input
                type="date"
                id="startdate"
                value={startDate}
                onChange={handleStartDateChange}
              />
              <Input
                type="date"
                id="enddate"
                value={endDate}
                onChange={handleEndDateChange}
              />

              <Button
                variant="outlined"
                onClick={handleFilter}
                color="success"
                sx={{ borderRadius: "20px" }}
              >
                กำหนดวัน
              </Button>
              <Button
                variant="outlined"
                onClick={resetFilter}
                sx={{ borderRadius: "20px" }}
              >
                รีเซ็ต
              </Button>
              <Button
                variant="contained"
                onClick={exportFile}
                sx={{ borderRadius: "20px"}}
              >
                ดาวน์โหลด
              </Button>
            </Stack>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table
                stickyHeader
                aria-label="sticky table"
                className="TableContainer"
              >
                <TableHead>
                  <TableRow>
                    <TableCell
                      style={{
                        textAlign: "center",
                        width: "45%",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      จำนวน
                    </TableCell>
                    <TableCell
                      style={{
                        textAlign: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      วันเวลาที่นับ
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {slicedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell style={{ textAlign: "center", width: "45%" }}>
                        {row.FISH}
                      </TableCell>
                      <TableCell style={{ textAlign: "center" }}>
                        {row.DATETIME}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              labelRowsPerPage="จำนวนแถว"
              component="div"
              count={csvData.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </div>
      )}
    </>
  );
}

export default History;
