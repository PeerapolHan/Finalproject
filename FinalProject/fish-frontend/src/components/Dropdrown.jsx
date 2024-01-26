import * as React from 'react';
import { useState } from "react";
import axios from "axios";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

export default function BasicMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [imageList, setImageList] = useState([]);
  const [openDialog1, setOpenDialog1] = React.useState(false);
  const [openDialog2, setOpenDialog2] = React.useState(false);
  const [openDialog3, setOpenDialog3] = React.useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickOpenDialog1 = () => {
    setOpenDialog1(true);
    axios.get("https://fish-api-0fmm.onrender.com/get-img").then((response) => {
      const base64Images = response.data;
      setImageList(base64Images);
    });
    handleClose(); 
  };

  const handleClickOpenDialog2 = () => {
    setOpenDialog2(true);
    handleClose(); 
  };

  const handleClickOpenDialog3 = () => {
    setOpenDialog3(true);
    handleClose(); 
  };

  const handleCloseDialog1 = () => {
    setOpenDialog1(false);
  };

  const handleCloseDialog2 = () => {
    setOpenDialog2(false);
  };

  const handleCloseDialog3 = () => {
    setOpenDialog3(false);
  };

  return (
    <div>
      <Button
        id="basic-button"
        aria-controls={openDialog1 || openDialog2 || openDialog3 ? undefined : 'basic-menu'}
        aria-haspopup="true"
        aria-expanded={openDialog1 || openDialog2 || openDialog3 ? undefined : 'true'}
        onClick={handleClick}
      >
        <box-icon name='dots-vertical-rounded' color='black'></box-icon>
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={!openDialog1 && !openDialog2 && !openDialog3 && Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClickOpenDialog1}>ดูผลการตรวจจับล่าสุด</MenuItem>
        <MenuItem onClick={handleClickOpenDialog2}>คู่มือการใช้งาน</MenuItem>
        <MenuItem onClick={handleClickOpenDialog3}>แจ้งปัญหา</MenuItem>
      </Menu>
      <Dialog
        open={openDialog1}
        onClose={handleCloseDialog1}
        aria-labelledby="alert-dialog-title1"
        aria-describedby="alert-dialog-description1"
      >
        <DialogTitle id="alert-dialog-title">
          {"ผลการตรวจจับ"}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
            {imageList.map((base64String, index) => (
              <img key={index} src={`data:image/jpeg;base64,${base64String}`} alt={`captured ${index}`} width={'100%'} style={{ display: "block", margin: "auto", marginBottom: "10px" }}/>
            ))}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog1}>ปิด</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialog2}
        onClose={handleCloseDialog2}
        aria-labelledby="alert-dialog-title2"
        aria-describedby="alert-dialog-description2"
        maxWidth="xl"
      >
        <DialogTitle id="alert-dialog-title">
          {"คู่มือการใช้งานเว็บแอพพลิเคชั่น"}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
            <img src="./guide/guide1.png" alt="guild" width={"100%"} />
            <img src="./guide/guide2.png" alt="guild" width={"100%"} />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog2}>ปิด</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDialog3}
        onClose={handleCloseDialog3}
        aria-labelledby="alert-dialog-title3"
        aria-describedby="alert-dialog-description3"
        maxWidth="sm"
      >
        <DialogTitle id="alert-dialog-title">{"แจ้งปัญหา"}</DialogTitle>
        <DialogContent dividers>
          <DialogContentText id="alert-dialog-description">
            <p>
              <h4>โทร:088-888-8888</h4>
            </p>
          </DialogContentText>
          <DialogContentText id="alert-dialog-description">
            <p>
              <h4>อีเมล: CountFish@kmutnb.co.th</h4>
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog3}>ปิด</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
