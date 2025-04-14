import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";

const Products = () => {
  // //dummydata for card ui
  // const dummyJsonData = {
  //   name: "Tan Leatherette Weekender Duffle",
  //   category: "Fashion",
  //   cost: 150,
  //   rating: 4,
  //   image:
  //     "https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
  //   _id: "PmInA797xJhMIPti",
  // };

  const { enqueueSnackbar } = useSnackbar();
  //States
  const [isLoading, setLoading] = useState(false);
  const [productData, updateProductData] = useState([]);
  const [search, updateSearch] = useState("");
  const [interval, updateInterval] = useState();
  const [cartData, updateCartData] = useState([]);
  const [fullProductsList, updateFullProductsList] = useState([]);
  const token = localStorage.getItem("token");

  //Handling and updating search state on typing in search field
  const performSearch = (e) => {
    updateSearch(e.target.value);
    // console.log(search);
  };

  //Debounce search for searching after milliseconds of typing a character
  const debounceSearch = (event, debounceTimeout) => {
    if (debounceTimeout) {
      clearInterval(debounceTimeout);
    }
    const intervalStore = setTimeout(() => {
      performSearch(event);
    }, 500);
    updateInterval(intervalStore);
  };

  //API call to fetch products
  const performAPICall = async () => {
    updateProductData([]);
    let url = `${config.endpoint}/products`;
    if (search !== "") {
      url = `${config.endpoint}/products/search?value=${search}`;
    }
    setLoading(true);
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error("Failed to fetch");
      }
      // console.log(response.data);
      if(fullProductsList.length === 0) {
        updateFullProductsList(response.data);
      }
      updateProductData(response.data);
      setLoading(false);
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
      setLoading(false);
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
      updateCartData(response.data);
      // console.log(cartData);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 400) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    }
  };

  //Checking if the item is already in the cart or not
  const isItemInCart = (id) => {
    // console.log(cartData);
    const result = cartData.some((item) => item.productId === id
    );
    return result;
  };

  //Handling add to cart whenever user clicks on add to cart button on the products page
  const handleAddToCart = async (productID, qty, token) => {
    if(!token) {
      enqueueSnackbar("Login to add an item to the Cart", { variant: "warning" });
    } else {
      const isItemPresent = isItemInCart(productID);
    if(isItemPresent) {
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: "warning" });
    } else {
      await addToCart(productID, qty, token);
      enqueueSnackbar("Added to the Cart", { variant: "success" });
    }
    }
    
  };


  //Add to cart function to add items into cart on clicking on plus and minus buttons which is gonna lift the state up
  const addToCart = async (productId, qty, token) => {
    try {
      const response = await axios.post(`${config.endpoint}/cart`, {
        productId,qty
      }, {
        headers: {
          "Authorization" : `Bearer ${token}`
        }
      });
      if(response.status !== 200) {
        throw new Error("Failed to add cart item");
      }
      const cartItems = generateCartItemsFrom(response.data, fullProductsList);
      updateCartData(cartItems);
    } catch(error) {
      console.log(error);
    }
  }


  //Performing side effects in useEffect
  useEffect(() => {
    performAPICall();
    // console.log(localStorage.getItem("token"));
  }, [search]);

  //Calling fetchCart for fetching cart items
  useEffect(() => {
    fetchCart(token)
      .then((cartD) => generateCartItemsFrom(cartD, fullProductsList))
      .then((cartItems) => updateCartData(cartItems))
      .catch((error) => console.log("Error in cart processing:", error));
  }, [fullProductsList]);

  return (
    <div>
      <Header>
        <TextField
          className="search-desktop"
          type="search"
          size="small"
          fullWidth
          sx={{ width: 400 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, interval)}
        />
      </Header>
      <TextField
        className="search-mobile"
        type="search"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e) => debounceSearch(e, interval)}
      />
      <Grid container>
        <Grid item md={localStorage.getItem("token") ? 9 : 12}>
          <Grid container sx={{ marginBottom: "16px" }}>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            sx={{ marginBottom: "36px" }}
            id="productContainer"
          >
            {isLoading ? (
              <Grid item className="product-grid">
                <Box className="loading">
                  <CircularProgress color="success" />
                  <h4>Loading Products</h4>
                </Box>
              </Grid>
            ) : productData.length ? (
              productData.map((aProduct) => {
                return (
                  <Grid
                    item
                    className="product-grid"
                    xs={6}
                    md={3}
                    key={aProduct._id}
                    sx={{ marginBottom: "10px" }}
                  >
                    <ProductCard
                      product={aProduct}
                      handleAddToCart={async () => await handleAddToCart(aProduct._id, 1, token)}
                    />
                  </Grid>
                );
              })
            ) : (
              <Grid item className="product-grid">
                <Box className="loading">
                  <SentimentDissatisfied />
                  <p>No products found</p>
                </Box>
              </Grid>
            )}
          </Grid>
        </Grid>
        {localStorage.getItem("token") ? (
          <>
            <Grid
              item
              md={3}
              sx={{ backgroundColor: "#E9F5E1", width: "100%" }}
            >
              <Cart products={fullProductsList} items={cartData} handleQuantity={addToCart}/>
            </Grid>
          </>
        ) : (
          <></>
        )}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;
