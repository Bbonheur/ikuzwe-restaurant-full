function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="small-title">
          WELCOME TO IKUZWE RESTAURANT
        </p>

        <h1>
          Delicious food,
          <br />
          <span>made with love.</span>
        </h1>

        <p className="hero-text">
          Enjoy fresh, delicious meals prepared by our
          professional chefs using the finest ingredients.
        </p>

        <div className="hero-buttons">
          <a href="#menu" className="primary-btn">
            Explore Menu
          </a>

          <a href="#contact" className="secondary-btn">
            Contact Us
          </a>
        </div>
      </div>

      <div className="hero-image">
        🍕
      </div>
    </section>
  );
}

export default Hero;