function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        Ikuzwe<span>Restaurant</span>
      </div>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#menu">Menu</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
      </div>

      <button className="order-btn">
        Order Now
      </button>
    </nav>
  );
}

export default Navbar;