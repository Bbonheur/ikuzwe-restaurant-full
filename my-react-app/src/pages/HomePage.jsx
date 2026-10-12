
import { Link, useNavigate } from "react-router-dom";
import "./HomePage.css";

const featuredDishes = [
  {
    name: "Grilled Chicken",
    category: "CHEF'S FAVORITE",
    description: "Tender, perfectly grilled and full of flavor.",
    image:
      "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Fresh Gourmet Meal",
    category: "FRESH & DELICIOUS",
    description: "Fresh ingredients prepared with care.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=85",
  },
  {
    name: "Signature Burger",
    category: "MUST TRY",
    description: "A delicious bite made to satisfy.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85",
  },
];

function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="ikuzwe-home">
      {/* Navigation */}
      <header className="ikuzwe-header">
        <Link to="/" className="ikuzwe-brand" aria-label="Ikuzwe home">
          <span className="brand-mark">I</span>
          <span className="brand-copy">
            <strong>IKUZWE</strong>
            <small>RESTAURANT</small>
          </span>
        </Link>

        <nav className="ikuzwe-nav" aria-label="Main navigation">
          <Link className="nav-active" to="/">
            Home
          </Link>
          <Link to="/menu">Menu</Link>
          <Link to="/cart">My Cart</Link>
        </nav>

        <button
          className="header-order-btn"
          onClick={() => navigate("/start-order")}
        >
          Order Now <span aria-hidden="true">↗</span>
        </button>
      </header>

      {/* Hero */}
      <section className="ikuzwe-hero">
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="gold-line" />
            WELCOME TO IKUZWE RESTAURANT
          </div>

          <h1>
            Good Food.
            <br />
            <span>Great Moments.</span>
          </h1>

          <p className="hero-description">
            Discover delicious meals, fresh ingredients, and unforgettable
            flavors. Every dish is prepared with passion, just for you.
          </p>

          <div className="hero-actions">
            <button
              className="gold-button"
              onClick={() => navigate("/start-order")}
            >
              Start Your Order <span aria-hidden="true">→</span>
            </button>

            <Link to="/menu" className="outline-button">
              Explore Our Menu
            </Link>
          </div>

          <div className="hero-trust">
            <span className="trust-star">✦</span>
            <div>
              <strong>Freshly Prepared</strong>
              <small>Made with care, served with love.</small>
            </div>
          </div>
        </div>

        <div className="hero-side-label">
          <span /> TASTE THE DIFFERENCE
        </div>

        <div className="hero-bottom-label">
          GOOD FOOD · GOOD COMPANY · GREAT MEMORIES
        </div>
      </section>

      {/* Benefits */}
      <section className="ikuzwe-benefits">
        <article className="benefit">
          <span className="benefit-icon" aria-hidden="true">✧</span>
          <div>
            <h3>Fresh Ingredients</h3>
            <p>Quality ingredients in every dish.</p>
          </div>
        </article>

        <article className="benefit">
          <span className="benefit-icon" aria-hidden="true">♨</span>
          <div>
            <h3>Made with Love</h3>
            <p>Prepared fresh by our kitchen team.</p>
          </div>
        </article>

        <article className="benefit">
          <span className="benefit-icon" aria-hidden="true">◷</span>
          <div>
            <h3>Easy Ordering</h3>
            <p>Place and track your order online.</p>
          </div>
        </article>

        <article className="benefit">
          <span className="benefit-icon" aria-hidden="true">♧</span>
          <div>
            <h3>Warm Hospitality</h3>
            <p>Great food and a welcoming experience.</p>
          </div>
        </article>
      </section>

      {/* Featured dishes */}
      <section className="ikuzwe-featured">
        <div className="featured-heading">
          <div>
            <span className="section-eyebrow">A TASTE OF IKUZWE</span>
            <h2>Made to make you smile.</h2>
            <p>Discover some of the delicious food waiting for you.</p>
          </div>

          <Link to="/menu" className="text-link">
            View Full Menu <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="featured-grid">
          {featuredDishes.map((dish) => (
            <article className="dish-card" key={dish.name}>
              <div className="dish-image-wrap">
                <img src={dish.image} alt={dish.name} loading="lazy" />
                <span className="dish-tag">{dish.category}</span>
              </div>

              <div className="dish-info">
                <h3>{dish.name}</h3>
                <p>{dish.description}</p>
                <button
                  className="dish-order-link"
                  onClick={() => navigate("/menu")}
                >
                  Explore Menu <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="ikuzwe-footer">
        <Link to="/" className="footer-brand">
          IKUZWE <span>RESTAURANT</span>
        </Link>
        <p>Good food. Great moments. Always.</p>
        <span>© {new Date().getFullYear()} Ikuzwe Restaurant</span>
      </footer>
    </main>
  );
}

export default HomePage;
