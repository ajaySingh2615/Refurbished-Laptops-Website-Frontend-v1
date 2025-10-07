import React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiService } from '../services/api.js';
import ProductDetail from '../components/ProductDetail.jsx';

export default function ProductPage() {
  const { sku } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await apiService.getProductBySku(sku);
        setProduct(productData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (sku) {
      loadProduct();
    }
  }, [sku]);

  return <ProductDetail product={product} loading={loading} error={error} />;
}
