
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Menu.css";

const drinks = [
  {
    id: 101,
    name: "Soda",
    category: "Soft Drinks",
    description: "A refreshing chilled soft drink.",
    price: 1500,
    emoji: "🥤",
    image:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 102,
    name: "Panache",
    category: "Soft Drinks",
    description: "A refreshing sparkling fruit drink.",
    price: 1500,
    emoji: "🥂",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 103,
    name: "Virunga Sparkling Water",
    category: "Soft Drinks",
    description: "Refreshing sparkling mineral water.",
    price: 1500,
    emoji: "💧",
    image:
      "https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 104,
    name: "Inyange Still Water",
    category: "Soft Drinks",
    description: "Clean, refreshing still water.",
    price: 1000,
    emoji: "💧",
    image:
      "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=700&q=85",
  },

  {
    id: 105,
    name: "1000 Hills",
    category: "Smoothies",
    description:
      "Mango, strawberry, pineapple and tree tomato blended with milk.",
    price: 7000,
    emoji: "🍓",
    image:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 106,
    name: "Mango Smoothie",
    category: "Smoothies",
    description: "A creamy smoothie made with ripe mangoes.",
    price: 7000,
    emoji: "🥭",
    image:
      "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 107,
    name: "Strawberry Smoothie",
    category: "Smoothies",
    description: "Sweet strawberries blended into a smooth drink.",
    price: 7000,
    emoji: "🍓",
    image:
      "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 108,
    name: "Banana Smoothie",
    category: "Smoothies",
    description: "A delicious, creamy banana smoothie.",
    price: 7000,
    emoji: "🍌",
    image:
      "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=700&q=85",
  },

  {
    id: 109,
    name: "Vanilla Milkshake",
    category: "Milkshakes",
    description: "A rich, creamy vanilla milkshake.",
    price: 7000,
    emoji: "🥛",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 110,
    name: "Strawberry Milkshake",
    category: "Milkshakes",
    description: "A creamy strawberry milkshake.",
    price: 7000,
    emoji: "🍓",
    image:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 111,
    name: "Chocolate Milkshake",
    category: "Milkshakes",
    description: "A smooth chocolate milkshake.",
    price: 7000,
    emoji: "🍫",
    image:
      "https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=700&q=85",
  },

  {
    id: 112,
    name: "Orange Fresh Juice",
    category: "Fresh Juices",
    description: "Fresh, citrusy orange juice.",
    price: 7000,
    emoji: "🍊",
    image:
      "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 113,
    name: "Mango Fresh Juice",
    category: "Fresh Juices",
    description: "Fresh juice made from sweet mangoes.",
    price: 7000,
    emoji: "🥭",
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 114,
    name: "Cocktail Juice",
    category: "Fresh Juices",
    description: "A refreshing blend of fruit juices.",
    price: 6000,
    emoji: "🍹",
    image:
      "https://images.unsplash.com/photo-1536935338788846bb9981813?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 115,
    name: "Passion Juice",
    category: "Fresh Juices",
    description: "Tangy, tropical passion fruit juice.",
    price: 6000,
    emoji: "🍹",
    image:
      "https://images.unsplash.com/photo-1513558161293-cdaf765edfd7?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 116,
    name: "Tree Tomato Juice",
    category: "Fresh Juices",
    description: "A distinctive juice made from tree tomatoes.",
    price: 6000,
    emoji: "🍅",
    image:
      "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 117,
    name: "Pineapple Juice",
    category: "Fresh Juices",
    description: "Bright, tropical pineapple juice.",
    price: 6000,
    emoji: "🍍",
    image:
      "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 118,
    name: "Watermelon Juice",
    category: "Fresh Juices",
    description: "A light and refreshing watermelon juice.",
    price: 6000,
    emoji: "🍉",
    image:
      "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 119,
    name: "Inyange Juice (Box)",
    category: "Fresh Juices",
    description: "Convenient packaged Inyange juice.",
    price: 3000,
    emoji: "🧃",
    image:
      "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?auto=format&fit=crop&w=700&q=85",
  },

  {
    id: 120,
    name: "Sport Detox",
    category: "Detox",
    description:
      "Carrot, orange, cucumber, apple, ginger and lemon.",
    price: 8000,
    emoji: "🥕",
    image:
      "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 121,
    name: "Trust Detox",
    category: "Detox",
    description: "Pineapple, cucumber, ginger and mint.",
    price: 7000,
    emoji: "🌿",
    image:
      "https://images.unsplash.com/photo-1547595628-c61a29f496f0?auto=format&fit=crop&w=700&q=85",
  },
  {
    id: 122,
    name: "Club Detox",
    category: "Detox",
    description: "A refreshing blend of carrot, orange and ginger.",
    price: 7000,
    emoji: "🥕",
    image:
      "https://images.unsplash.com/photo- juice-placeholder?auto=format&fit=crop&w=700&q=85",
  },
];

const categories = [
  "All Drinks",
  "Soft Drinks",
  "Smoothies",
  "Milkshakes",
  "Fresh Juices",
  "Detox",
];

function Menu() {
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("All Drinks");
  const [search, setSearch] = useState("");

  const cartItemsCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const filteredDrinks = useMemo(() => {
    return drinks.filter((drink) => {
      const matchesCategory =
        activeCategory === "All Drinks" ||
        drink.category === activeCategory;

      const matchesSearch =
        drink.name.toLowerCase().includes(search.toLowerCase()) ||
        drink.description.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  return (
    <section className="ikuzwe-menu">
      <header className="menu-hero">
        <div className="menu-hero-overlay" />
        <div className="menu-hero-content">
          <span className="menu-eyebrow">IKUZWE RESTAURANT</span>
          <h1>Fresh Sips, <em>Beautiful Moments.</em></h1>
          <p>
            Discover our refreshing drinks, handcrafted smoothies,
            creamy milkshakes and fresh juices.
          </p>
          <button
            className="menu-hero-btn"
            onClick={() =>
              document.getElementById("drink-collection")?.scrollIntoView({
                behavior: "smooth",
              })
            }
          >
            Explore Drinks <span>↓</span>
          </button>
        </div>
      </header>

      <div className="menu-toolbar">
        <div>
          <span className="menu-eyebrow">MADE FRESH FOR YOU</span>
          <h2>Our Drinks Menu</h2>
          <p>Fresh ingredients. Beautiful flavors. Every day.</p>
        </div>

        <button
          className="menu-cart-btn"
          onClick={() => navigate("/cart")}
        >
          🛒 My Cart <span>{cartItemsCount}</span>
        </button>
      </div>

      <div className="menu-controls" id="drink-collection">
        <div className="menu-categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                activeCategory === category
                  ? "category-btn active"
                  : "category-btn"
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <input
          className="menu-search"
          type="search"
          placeholder="Search drinks..."
          aria-label="Search drinks"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="drink-grid">
        {filteredDrinks.map((drink) => (
          <article className="drink-card" key={drink.id}>
            <div className="drink-image">
              <img
                src={drink.image}
                alt={drink.name}
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <span className="drink-category">{drink.category}</span>
            </div>

            <div className="drink-info">
              <h3>{drink.name}</h3>
              <p>{drink.description}</p>

              <div className="drink-card-bottom">
                <strong>{drink.price.toLocaleString()} <small>RWF</small></strong>
                <button
                  type="button"
                  onClick={() => addToCart(drink)}
                  aria-label={`Add ${drink.name} to cart`}
                >
                  + Add
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredDrinks.length === 0 && (
        <div className="menu-empty">
          <span>🥤</span>
          <h3>No drinks found</h3>
          <p>Try another search or select a different category.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setActiveCategory("All Drinks");
            }}
          >
            Show all drinks
          </button>
        </div>
      )}

      <footer className="menu-footer">
        <span>IKUZWE RESTAURANT</span>
        <p>Freshness in every sip.</p>
      </footer>
    </section>
  );
}

export default Menu;
