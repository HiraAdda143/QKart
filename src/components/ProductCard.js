import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  // console.log(product);
  return (
    <Card className="card" sx={{paddingBottom: "10px"}}>
      <CardMedia
        image={product.image}
        title={product.name}
        component="img"
      />
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{fontSize: "16px"}}>
          {product.name}
        </Typography>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", fontSize: "16px" }}>
          ${product.cost}
        </Typography>
        <Rating readOnly value={product.rating} />
      </CardContent>
      <CardActions>
        <Button
          className="card-button"
          fullWidth
          variant="contained"
          startIcon={<AddShoppingCartOutlined />}
          onClick={handleAddToCart}
        >
          ADD TO CART
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
