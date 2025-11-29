import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch product details from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        
        // Fetch the product details from the API
        const response = await fetch(
          `https://huitian.serv00.net/project/?productId=${productId}`
        );
        
        const data = await response.json();
        
        if (data) {
          setProduct(data);
          // Set first image as main image - use imageUrls
          if (data.imageUrls && data.imageUrls.length > 0) {
            setMainImage(data.imageUrls[0]);
          } else if (data.imageUrl) {
            setMainImage(data.imageUrl);
          } else {
            setMainImage("https://via.placeholder.com/400");
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Add to cart function
  const addToCart = () => {
    if (!product) return;
    
    // Get existing cart from localStorage
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    // Check if product already exists in cart
    const existingItemIndex = existingCart.findIndex(
      item => item.productId === product.productId
    );
    
    if (existingItemIndex !== -1) {
      // Increase quantity if exists
      existingCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item with quantity 1
      existingCart.push({
        ...product,
        quantity: 1
      });
    }
    
    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(existingCart));
    
    alert(`${product.name || product.productId} added to cart!`);
  };

  // Handle thumbnail click
  const handleThumbnailClick = (imageSrc) => {
    setMainImage(imageSrc);
  };

  if (loading) {
    return (
      <section className="page page-product-details">
        <h1>Loading...</h1>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="page page-product-details">
        <h1>Product not found</h1>
        <p>No product with ID: {productId}</p>
      </section>
    );
  }

  return (
    <section className="page page-product-details">
      <h1>{product.name || product.productId}</h1>

      <div className="product-details-layout">
        {/* Left side: Images section */}
        <div className="product-details-left">
          <div className="product-details-images">
            {/* Thumbnail column - only show if imageUrls exists */}
            {product.imageUrls && product.imageUrls.length > 0 && (
              <div className="thumbnail-column">
                {product.imageUrls.slice(0, 4).map((imgSrc, index) => (
                  <div 
                    key={index}
                    className={`thumbnail-placeholder ${mainImage === imgSrc ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(imgSrc)}
                    style={{ cursor: "pointer" }}
                  >
                    <img src={imgSrc} alt={`Thumbnail ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="main-image-placeholder">
              <img src={mainImage} alt={product.name || product.productId} />
            </div>
          </div>

          {/* Price and Add to Cart button BELOW images */}
          <div className="product-details-actions">
            <p className="product-details-price">
              Price: {product.price}
            </p>
            
            <button 
              className="btn-primary btn-add-to-cart"
              onClick={addToCart}
            >
              Add to Cart
            </button>
          </div>
        </div>

        {/* Right side: Product information */}
        <div className="product-details-info">
          <div className="product-id">
            <strong>Product ID:</strong> {product.productId}
          </div>

          {product.longDescription && (
            <div className="product-description">
              <h2>Description</h2>
              <p>{product.longDescription}</p>
            </div>
          )}

          {/* Display all other product specs */}
          <div className="product-specs">
            <h2>Specifications</h2>
            <ul>
              {product.screenSize && (
                <li><strong>Screen Size:</strong> {product.screenSize}</li>
              )}
              {product.batterySpec && (
                <li><strong>Battery:</strong> {product.batterySpec}</li>
              )}
              {product.weight && (
                <li><strong>Weight:</strong> {product.weight}</li>
              )}
              {/* Add any other specs from the API */}
              {Object.entries(product).map(([key, value]) => {
                // Skip already displayed fields
                if (['productId', 'name', 'price', 'imageUrls', 'imageUrl', 'longDescription', 'screenSize', 'batterySpec', 'weight'].includes(key)) {
                  return null;
                }
                // Only show string/number values
                if (typeof value === 'string' || typeof value === 'number') {
                  return (
                    <li key={key}>
                      <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;