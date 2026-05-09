import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
  const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // On load, check if dark mode should be enabled
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-background border-b border-outline-variant sticky top-0 z-[100] transition-colors duration-300 shadow-sm">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-[64px] max-w-container-max mx-auto">
        
        {/* LOGO */}
        <Link to="/" className="flex-shrink-0 group flex items-center gap-2">
          {/* A Google-like G icon or simple colored logo */}
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden">
            <div className="flex flex-wrap w-full h-full">
              <div className="w-1/2 h-1/2 bg-primary"></div>
              <div className="w-1/2 h-1/2 bg-secondary"></div>
              <div className="w-1/2 h-1/2 bg-tertiary"></div>
              <div className="w-1/2 h-1/2 bg-success"></div>
            </div>
          </div>
          <h1 className="font-headline-sm text-[22px] tracking-tight text-on-surface m-0 font-medium">
            Store
          </h1>
        </Link>
        
        {/* NAVIGATION LINKS */}
        <nav className="hidden md:flex gap-8 items-center h-full">
          <Link 
            to="/shop/Male" 
            className={`font-button text-[15px] h-full flex items-center relative group transition-colors ${isActive('/shop/Male') ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Men
            <span className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-primary transition-transform duration-300 ${isActive('/shop/Male') ? 'translate-y-0' : 'translate-y-[3px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100'}`}></span>
          </Link>
          <Link 
            to="/shop/Female" 
            className={`font-button text-[15px] h-full flex items-center relative group transition-colors ${isActive('/shop/Female') ? 'text-primary font-medium' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Women
            <span className={`absolute bottom-0 left-0 w-full h-[3px] rounded-t-full bg-primary transition-transform duration-300 ${isActive('/shop/Female') ? 'translate-y-0' : 'translate-y-[3px] group-hover:translate-y-0 opacity-0 group-hover:opacity-100'}`}></span>
          </Link>
        </nav>
        
        {/* ICONS */}
        <div className="flex items-center gap-2 md:gap-4 text-on-surface-variant">
          <button onClick={toggleDarkMode} className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container flex items-center justify-center" title="Toggle Dark Mode">
            <span className="material-symbols-outlined text-[24px]">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {userInfo && userInfo.role === 'admin' && (
            <Link to="/admin" className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container" title="Admin">
              <span className="material-symbols-outlined text-[24px]">admin_panel_settings</span>
            </Link>
          )}
          
          <Link to="/cart" className="hover:text-primary transition-colors p-2 relative group rounded-full hover:bg-surface-container" title="Cart">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {totalItems > 0 && (
              <span className="absolute top-[2px] right-[2px] bg-primary text-on-primary rounded-full font-bold text-[10px] w-[18px] h-[18px] flex items-center justify-center border-2 border-background">
                {totalItems}
              </span>
            )}
          </Link>
          
          {userInfo ? (
            <div className="flex items-center gap-2 md:gap-4">
              <Link to="/profile" className="hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-container" title="Profile">
                <span className="material-symbols-outlined text-[24px]">account_circle</span>
              </Link>
              <button onClick={handleLogout} className="hover:text-error transition-colors p-2 rounded-full hover:bg-error/10" title="Logout">
                <span className="material-symbols-outlined text-[24px]">logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 ml-2">
              <Link to="/login" className="bg-primary hover:bg-primary/90 text-on-primary px-5 py-2 rounded-full font-button transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
