import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState, useEffect } from "react";
import { useHistory, Link, useLocation } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Login.css";

const Login = () => {
  const token = localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const location = useLocation();
  const [loginData, updateLoginData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setLoading] = useState(false);

  // Handing loginData on change
  const handleLoginData = (e) => {
    const { name, value } = e.target;
    updateLoginData((prevState) => {
      return {
        ...prevState,
        [name]: value,
      };
    });
    // console.log(loginData);
  };


  //checking if user came from checkout page while he didn't logged in and printing msg
  const printLoginToViewCart = () => {
    if(!token) {
      if(location.state?.from === "/checkout") {
        enqueueSnackbar("You must be logged in to access checkout page", {
          variant: "warning"
        });
      }
    }
  }

  useEffect(() => {
    printLoginToViewCart();
  }, [])


  // TODO: CRIO_TASK_MODULE_LOGIN - Fetch the API response
  /**
   * Perform the Login API call
   * @param {{ username: string, password: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/login"
   *
   * Example for successful response from backend:
   * HTTP 201
   * {
   *      "success": true,
   *      "token": "testtoken",
   *      "username": "criodo",
   *      "balance": 5000
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Password is incorrect"
   * }
   *
   */
  const login = async (formData) => {
    const validation = validateInput(formData);
    if (validation) {
      setLoading(true);
      try {
        const url = `${config.endpoint}/auth/login`;
        const response = await axios.post(url, {
          username: formData.username,
          password: formData.password,
        });
        if (response.status !== 201) {
          throw new Error("Failed to fetch");
        }
        // console.log(response.data);
        enqueueSnackbar("Logged in successfully", { variant: "success" });
        persistLogin(response.data.token, response.data.username, response.data.balance);
        setLoading(false);
        history.push("/");
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            enqueueSnackbar(error.response.data.message, { variant: "error" });
          }
        } else {
          enqueueSnackbar(
            "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
            { variant: "error" }
          );
        }
        setLoading(false);
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Validate the input
  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false and show warning message if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that password field is not an empty value - "Password is a required field"
   */
  const validateInput = (data) => {
    if (data.username.length === 0) {
      enqueueSnackbar("Username is a required field", { variant: "warning" });
      return false;
    } else if (data.password.length === 0) {
      enqueueSnackbar("Password is a required field", { variant: "warning" });
      return false;
    } else {
      return true;
    }
  };

  // TODO: CRIO_TASK_MODULE_LOGIN - Persist user's login information
  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} username
   *    Username of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `username` field in localStorage can be used to store the username that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   */
  const persistLogin = (token, username, balance) => {
    // console.log(token, username, balance);
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("balance", balance);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title" style={{ marginBottom: "15px" }}>
            Login
          </h2>
          <TextField
            id="username"
            label="username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            onChange={handleLoginData}
          />
          <TextField
            id="password"
            label="password"
            variant="outlined"
            title="Password"
            name="password"
            placeholder="Enter Password"
            fullWidth
            onChange={handleLoginData}
          />
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress color="success" size="25px" />
            </Box>
          ) : (
            <Button
              variant="contained"
              style={{ marginBottom: "15px" }}
              onClick={() => login(loginData)}
            >
              LOGIN TO QKART
            </Button>
          )}
          <p>
            Don’t have an account?{" "}
            <Link className="link" to="/register">
              Register now
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;
