import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import "./Header.css";
import { Link, useHistory } from "react-router-dom";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const logout = () => {
    localStorage.clear();
    history.push("/");
    window.location.reload();
  }

  if (hasHiddenAuthButtons) {
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        <Link to="/">
          <Button
            className="explore-button"
            startIcon={<ArrowBackIcon />}
            variant="text"
          >
            Back to explore
          </Button>
        </Link>
      </Box>
    );
  } else {
    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children}
        {localStorage.getItem("token") ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Avatar src="avatar.png" alt={localStorage.getItem("username")} />
            <p className="username-text">{localStorage.getItem("username")}</p>
            <Button onClick={logout}>LOGOUT</Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Link to="/login">
              <Button>LOGIN</Button>
            </Link>
            <Link to="/register">
              <Button variant="contained">REGISTER</Button>
            </Link>
          </Stack>
        )}
      </Box>
    );
  }
};

export default Header;
