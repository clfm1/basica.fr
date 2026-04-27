import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../constants';
import ProductDetail from '../components/ProductDetail';
import { useEffect } from 'react';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const product = PRODUCTS.find(p => p.id === id);

  useEffect(() => {
    if (!product) {
       navigate('/');
    }
  }, [product, navigate]);

  if (!product) return null;

  return (
    <div className="pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* We reuse the ProductDetail UI but adapted as a page */}
        {/* Since ProductDetail was a modal, we might want to tweak its styles slightly for a full page */}
        <ProductDetail 
          product={product} 
          onClose={() => navigate(-1)} 
        />
      </div>
    </div>
  );
}
