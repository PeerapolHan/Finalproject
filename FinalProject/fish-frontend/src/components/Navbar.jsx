import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import { useNavigate, useLocation } from "react-router-dom";
import "boxicons";
import Dropdrown from "./Dropdrown";
import "./Navbar.css"

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomeActive = location.pathname === "/";
  const isHistoryActive = location.pathname === "/history";
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar style={{ background: "white" }}>
        <Toolbar style={{ display: "flex", alignItems: "center" }}>
          <div className="CenterAppbar">
            <div className="CenterNav-Container">
              <Button
                variant="h6"
                style={{
                  color: isHomeActive ? "#00aa9f" : "black",
                  backgroundColor: isHomeActive ? "#CCEEEB" : "",
                  fontSize: "1.1em",
                  borderRadius: "10px",
                }}
                onClick={() => handleNavigate("/")}
              >
                หน้าแรก
              </Button>
              <Button
                variant="h6"
                style={{
                  color: isHistoryActive ? "#00aa9f" : "black",
                  backgroundColor: isHistoryActive ? "#CCEEEB" : "",
                  fontSize: "1.1em",
                  borderRadius: "10px",
                }}
                onClick={() => handleNavigate("/history")}
              >
                ประวัติการนับ
              </Button>
            </div>
          </div>
          <div>
            <Dropdrown />
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
