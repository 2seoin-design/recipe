import { useEffect, useMemo, useState } from 'react';
import Home from './pages/Home.jsx';
import Cart from './pages/Cart.jsx';
import Fridge from './pages/Fridge.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import BottomNav from './components/BottomNav.jsx';
import LoginModal from './components/LoginModal.jsx';
import { useAuth, useCart, useFridge, useFavorites } from './storage.js';
import { RECIPES } from './data.js';
import { fetchExternalRecipes } from './externalRecipes.js';

export default function App() {
  const [page, setPage] = useState('home');
  const [recipeId, setRecipeId] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [externalRecipes, setExternalRecipes] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useAuth();
  const [cart, setCart] = useCart();
  const [fridge, setFridge] = useFridge();
  const [favorites, setFavorites] = useFavorites();

  useEffect(() => {
    fetchExternalRecipes().then(setExternalRecipes);
  }, []);

  const recipes = useMemo(() => [...RECIPES, ...externalRecipes], [externalRecipes]);

  const requireLogin = () => setShowLogin(true);
  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const addToCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing) {
        return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      }
      return [...prev, { id, qty: 1 }];
    });
  };

  const addToFridge = (id) => {
    setFridge((prev) => {
      const existing = prev.find((f) => f.id === id);
      if (existing) {
        return prev.map((f) =>
          f.id === id ? { ...f, qty: f.qty + 1, cartCount: (f.cartCount || 0) + 1 } : f
        );
      }
      return [...prev, { id, qty: 1, addedAt: Date.now(), cartCount: 1 }];
    });
  };

  const checkout = () => {
    setFridge((prevFridge) => {
      let next = [...prevFridge];
      cart.forEach((c) => {
        const existing = next.find((f) => f.id === c.id);
        if (existing) {
          next = next.map((f) =>
            f.id === c.id
              ? { ...f, qty: f.qty + c.qty, cartCount: (f.cartCount || 0) + c.qty, addedAt: Date.now() }
              : f
          );
        } else {
          next.push({ id: c.id, qty: c.qty, addedAt: Date.now(), cartCount: c.qty });
        }
      });
      return next;
    });
    setCart([]);
    setPage('fridge');
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  };

  const navigate = (target) => {
    if (target === 'fridge' && !isLoggedIn) {
      requireLogin();
      return;
    }
    setRecipeId(null);
    setPage(target);
  };

  const openRecipe = (id) => {
    setRecipeId(id);
    setPage('recipe');
  };

  const navCounts = {
    cart: cart.reduce((sum, c) => sum + c.qty, 0),
    fridge: fridge.reduce((sum, f) => sum + f.qty, 0),
  };

  return (
    <div className="app-shell">
      {page === 'home' && (
        <Home
          isLoggedIn={isLoggedIn}
          onAddToCart={addToCart}
          onAddToFridge={addToFridge}
          requireLogin={requireLogin}
        />
      )}
      {page === 'cart' && (
        <Cart cart={cart} setCart={setCart} isLoggedIn={isLoggedIn} requireLogin={requireLogin} onCheckout={checkout} />
      )}
      {page === 'fridge' && (
        <Fridge
          fridge={fridge}
          recipes={recipes}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onOpenRecipe={openRecipe}
        />
      )}
      {page === 'recipe' && (
        <RecipeDetail
          recipeId={recipeId}
          recipes={recipes}
          fridge={fridge}
          setFridge={setFridge}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          onBack={() => setPage('fridge')}
        />
      )}

      <BottomNav page={page} onNavigate={navigate} counts={navCounts} />

      {showLogin && <LoginModal onLogin={handleLogin} onClose={() => setShowLogin(false)} />}
    </div>
  );
}
