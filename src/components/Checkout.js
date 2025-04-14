import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { config } from "../App";
import Cart, { getTotalCartValue, generateCartItemsFrom } from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

const AddNewAddressView = ({
  newAddress,
  handleOnChange,
  closeAddressField,
  addAddress,
  token,
}) => {
  return (
    <Box sx={{ marginTop: "1.2rem" }}>
      <TextField
        multiline
        fullWidth
        placeholder="Enter your complete address"
        rows={4}
        value={newAddress}
        onChange={handleOnChange}
      />
      <Stack spacing={0.5} direction="row" sx={{ marginTop: "1.2rem" }}>
        <Button
          name="add"
          variant="contained"
          onClick={async () => await addAddress(newAddress, token)}
        >
          Add
        </Button>
        <Button name="cancel" onClick={closeAddressField}>
          cancel
        </Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const { enqueueSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");
  const [products, updateProducts] = useState([]);
  const [cartItems, updateCartItems] = useState([]);
  const [addresses, updateAddresses] = useState([]);
  const [newAddress, updateNewAddress] = useState("");
  const [selectedField, updateSelection] = useState("");
  const [addressField, updateAddressField] = useState(false);
  const history = useHistory();
  const location = useLocation();

  //API call to fetch products
  const fetchProducts = async () => {
    let url = `${config.endpoint}/products`;
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error("Failed to fetch");
      }
      // console.log(response.data);
      updateProducts(response.data);
      // return response.data;
    } catch (error) {
      // console.log(error);
      if (error.response) {
        if (error.response.status === 404) {
          enqueueSnackbar("Not Found", { variant: "error" });
        }
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  //Fething cart items
  const fetchCart = async (token) => {
    if (!token) {
      return;
    }
    const url = `${config.endpoint}/cart`;
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch cart items");
      }
      // console.log(response);
      updateCartItems(response.data);
      // console.log(cartData)
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
  };

  const isUserLoggedIn = (token) => {
    if (!token) {
      history.push("/login", {
        from: location.pathname,
      });
    } else {
      return;
    }
  };

  //Fetching addresses
  const getAddresses = async (token) => {
    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status !== 200) {
        throw new Error("Error in fetching addresses");
      }
      // console.log(response);
      updateAddresses(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  //addAddress to add new address when clicked on add button after typing
  const addAddress = async (newAddress, token) => {
    try {
      const response = await axios.post(
        `${config.endpoint}/user/addresses`,
        { address: newAddress },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to add new address");
      }
      // console.log(response);
      updateAddresses(response.data);
      updateAddressField(false);
      updateNewAddress("");
      enqueueSnackbar("The new address has been added", { variant: "success" });
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "warning" });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  //Delete address when clicked on delete
  const deleteAddress = async (addressID, token) => {
    try {
      const response = await axios.delete(
        `${config.endpoint}/user/addresses/${addressID}`,
        {
          headers: {
            Accept: "application/json, text/plain, */*",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to delete");
      }
      // console.log(response);
      updateAddresses(response.data);
      enqueueSnackbar("Address deleted successfully", { variant: "success" });
    } catch (error) {
      if (!error.response) {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  //Validate request for validation
  const validateRequest = (items, addresses) => {
    if (localStorage.getItem("balance") < getTotalCartValue(items)) {
      enqueueSnackbar(
        "You do not have enough balance in your wallet for this purchase",
        {
          variant: "warning",
        }
      );
      return false;
    }

    if (!addresses.length) {
      enqueueSnackbar("Please add a new address before proceeding.", {
        variant: "warning",
      });
      return false;
    }

    if (!selectedField) {
      enqueueSnackbar("Please select one shipping address to proceed", {
        variant: "warning",
        contentProps: {
          role: "alert",
          "data-testid": "address-alert",
        },
      });
      return false;
    }

    return true;
  };

  //Perform checkout function for checking out items on click place order button
  const performCheckout = async (token, items, addresses, addressID) => {
    if (!validateRequest(items, addresses, selectedField)) return;

    try {
      const response = await axios.post(
        `${config.endpoint}/cart/checkout`,
        { addressId: `${addressID}` },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status !== 200) {
        throw new Error("Failed to place an order");
      }
      enqueueSnackbar("Order placed successfully!", { variant: "success" });
      const updatedBalance =
        localStorage.getItem("balance") - getTotalCartValue(items);
      localStorage.setItem("balance", updatedBalance);
      history.push("/thanks");
      return true;
    } catch (error) {
      if (error.response) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not place order. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  //Handle on change of text field of adding new address
  const handleOnChange = (e) => {
    updateNewAddress(e.target.value);
    // console.log(newAddress);
  };

  //To open address field on clicking add new address button
  const openAddressField = () => {
    updateAddressField(true);
  };

  //To close address field on clicking calcel button
  const closeAddressField = () => {
    updateAddressField(false);
    updateNewAddress("");
  };

  //side effects
  //checking if user logged in or not and if not then redirecting to login page
  //fetching products
  //fetching user addresses
  useEffect(() => {
    isUserLoggedIn(token);
    fetchProducts();
    getAddresses(token);
  }, []);

  //Side effects in the useEffects
  //Calling fetchCart for fetching cart items
  useEffect(() => {
    fetchCart(token)
      .then((cartD) => generateCartItemsFrom(cartD, products))
      .then((cartI) => updateCartItems(cartI))
      .catch((error) => console.log("Error in cart processing:", error));
    // console.log(cartItems);
  }, [products]);

  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="72vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box marginBottom="35px">
              <Typography color="#3C3C3C" variant="h4" my="1rem">
                Addresses
              </Typography>
              {!addresses.length ? (
                <Typography color="#3C3C3C" my="1rem">
                  No addresses found for this account. Please add one to proceed
                </Typography>
              ) : (
                <Stack spacing={2.5}>
                  {addresses.map((address) => {
                    return (
                      <Box
                        key={address._id}
                        className={
                          selectedField === address._id
                            ? "address-item selected"
                            : "address-item not-selected"
                        }
                        onClick={() => updateSelection(address._id)}
                      >
                        <Typography
                          color="#3C3C3C"
                          variant="p"
                          className="text-content"
                        >
                          {address.address}
                        </Typography>
                        <Box>
                          <Button
                            name="delete"
                            startIcon={<Delete />}
                            onClick={async () =>
                              deleteAddress(address._id, token)
                            }
                          >
                            DELETE
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
              <Box>
                {!addressField ? (
                  <Button
                    variant="contained"
                    name="addAddress"
                    id="add-new-btn"
                    onClick={openAddressField}
                  >
                    Add new address
                  </Button>
                ) : (
                  <AddNewAddressView
                    newAddress={newAddress}
                    handleOnChange={handleOnChange}
                    closeAddressField={closeAddressField}
                    addAddress={addAddress}
                    token={token}
                  />
                )}
              </Box>
            </Box>
            <Divider />

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(cartItems)} of available $
                {localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button
              startIcon={<CreditCard />}
              id="payBtn"
              variant="contained"
              // disabled={!selectedField}
              onClick={async () =>
                await performCheckout(
                  token,
                  cartItems,
                  addresses,
                  selectedField
                )
              }
            >
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart isReadOnly={true} products={products} items={cartItems} />
          <Stack
            className="cart"
            sx={{ color: "#3C3C3C", padding: "1rem" }}
            spacing={1}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 750, marginY: "20px"}}
              >
                Order Details
              </Typography>
            </Box>

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <p>Products</p>
              <p>{cartItems ? cartItems.reduce((total, item) => total + item.qty, 0) : "0"}</p>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <p>Subtotal</p>
              <p>${cartItems ? getTotalCartValue(cartItems) : "0"}</p>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <p>Shipping Charges</p>
              <p>0</p>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="p"
                sx={{ fontWeight: 600, fontSize: "1.5rem", marginBottom: "15px" }}
              >
                Total
              </Typography>
              <Typography
                variant="p"
                sx={{ fontWeight: 600, fontSize: "1.5rem", marginBottom: "15px" }}
              >
                ${cartItems ? getTotalCartValue(cartItems) : "0"}
              </Typography>
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
