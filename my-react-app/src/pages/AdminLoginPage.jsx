import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(
    location.state?.email || ""
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(
    location.state?.verified
      ? "Your email is verified. You can now sign in."
      : ""
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!identifier.trim() || !password) {
      setError("Enter your username or email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to log in. Please try again."
        );
      }

      if (!data.token) {
        throw new Error("The server did not return an authentication token.");
      }

      localStorage.setItem("adminToken", data.token);

      if (data.admin) {
        localStorage.setItem("adminUser", JSON.stringify(data.admin));
      } else {
        localStorage.removeItem("adminUser");
      }

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure the backend is running."
          : err.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ik-login-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');

        .ik-login-page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(360px, .95fr);
          background: #f7f5ef;
          color: #17202b;
          font-family: 'DM Sans', sans-serif;
        }
        .ik-login-page * { box-sizing: border-box; }
        .ik-login-visual {
          position: relative;
          display: flex;
          min-height: 100vh;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: 42px clamp(28px, 5vw, 76px);
          background:
            radial-gradient(ellipse at 75% 20%, #3b3424 0, transparent 36%),
            linear-gradient(145deg, #171d24, #0e1319 72%);
          color: #fff;
        }
        .ik-login-visual::before,
        .ik-login-visual::after {
          position: absolute;
          content: "";
          border: 1px solid rgba(248, 190, 43, .15);
          border-radius: 50%;
          pointer-events: none;
        }
        .ik-login-visual::before {
          width: 520px; height: 520px; right: -220px; bottom: -160px;
        }
        .ik-login-visual::after {
          width: 380px; height: 380px; right: -150px; bottom: -90px;
        }
        .ik-login-brand {
          position: relative; z-index: 1;
          display: inline-flex; align-items: center; gap: 13px;
          color: #f8bf32; text-decoration: none; width: fit-content;
        }
        .ik-login-mark {
          display: grid; place-items: center;
          width: 48px; height: 48px; border: 1px solid #6e5520;
          border-radius: 14px; font-size: 26px;
          background: rgba(248, 191, 50, .08);
        }
        .ik-login-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 21px; font-weight: 800; letter-spacing: 2px;
        }
        .ik-login-brand-sub {
          margin-top: 3px; font-size: 9px; letter-spacing: 4px;
        }
        .ik-login-hero { position: relative; z-index: 1; max-width: 570px; margin: 60px 0; }
        .ik-login-eyebrow {
          display: inline-flex; align-items: center; gap: 9px;
          color: #f8bf32; font-size: 10px; font-weight: 700;
          letter-spacing: 2.4px; text-transform: uppercase;
        }
        .ik-login-eyebrow::before { content: ""; width: 25px; height: 1px; background: #f8bf32; }
        .ik-login-hero h1 {
          margin: 22px 0 18px; max-width: 560px;
          font-family: 'Playfair Display', serif;
          font-size: clamp(38px, 5vw, 65px); line-height: 1.08;
          letter-spacing: -1.6px; font-weight: 700;
        }
        .ik-login-hero h1 span { color: #f8bf32; }
        .ik-login-hero p {
          max-width: 420px; margin: 0; color: #b4bbc4;
          font-size: 14px; line-height: 1.9;
        }
        .ik-login-visual-footer {
          position: relative; z-index: 1; display: flex;
          align-items: center; gap: 9px; color: #89929e; font-size: 11px;
        }
        .ik-login-visual-footer span { color: #f8bf32; }
        .ik-login-form-side {
          display: flex; align-items: center; justify-content: center;
          padding: 42px clamp(24px, 5vw, 72px);
        }
        .ik-login-card { width: 100%; max-width: 410px; }
        .ik-login-mobile-brand { display: none; }
        .ik-login-kicker {
          margin-bottom: 12px; color: #a47a11; font-size: 10px;
          font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
        }
        .ik-login-card h2 {
          margin: 0; color: #17202b;
          font-family: 'Playfair Display', serif;
          font-size: 34px; line-height: 1.2; letter-spacing: -.6px;
        }
        .ik-login-description {
          margin: 11px 0 29px; color: #7c8795; font-size: 13px; line-height: 1.7;
        }
        .ik-login-error, .ik-login-notice {
          margin-bottom: 18px; padding: 12px 14px;
          border-radius: 8px; font-size: 12px; line-height: 1.5;
        }
        .ik-login-error { border: 1px solid #f4c8ce; background: #fff0f1; color: #a42c3a; }
        .ik-login-notice { border: 1px solid #b8e2ca; background: #effaf3; color: #206b43; }
        .ik-login-field { margin-bottom: 18px; }
        .ik-login-field label {
          display: block; margin-bottom: 8px; color: #303a48;
          font-size: 12px; font-weight: 700;
        }
        .ik-login-input-wrap { position: relative; }
        .ik-login-input {
          display: block; width: 100%; min-height: 48px;
          padding: 12px 14px; border: 1px solid #dce1e7;
          border-radius: 8px; outline: none; background: #fff;
          color: #192230; font: 13px 'DM Sans', sans-serif;
          transition: border-color .18s, box-shadow .18s;
        }
        .ik-login-input:focus {
          border-color: #d6a51d;
          box-shadow: 0 0 0 3px rgba(248, 191, 50, .16);
        }
        .ik-login-input::placeholder { color: #a4acb7; }
        .ik-login-password { padding-right: 76px; }
        .ik-login-show {
          position: absolute; top: 50%; right: 12px; transform: translateY(-50%);
          padding: 5px; border: 0; background: transparent;
          color: #7d8794; font: 700 10px 'DM Sans', sans-serif; cursor: pointer;
        }
        .ik-login-submit {
          width: 100%; min-height: 49px; margin-top: 5px;
          border: 0; border-radius: 8px; background: #f8bf32;
          color: #171b20; font: 800 13px 'DM Sans', sans-serif;
          cursor: pointer; transition: background .18s, transform .18s;
        }
        .ik-login-submit:hover:not(:disabled) { background: #eeb01b; transform: translateY(-1px); }
        .ik-login-submit:disabled { opacity: .65; cursor: wait; transform: none; }
        .ik-login-divider {
          display: flex; align-items: center; gap: 13px;
          margin: 25px 0 19px; color: #a0a8b2; font-size: 10px;
        }
        .ik-login-divider::before, .ik-login-divider::after {
          content: ""; flex: 1; height: 1px; background: #e6e9ed;
        }
        .ik-login-register {
          color: #737e8c; font-size: 12px; text-align: center; line-height: 1.8;
        }
        .ik-login-register a { color: #946b05; font-weight: 800; text-decoration: none; }
        .ik-login-register a:hover { text-decoration: underline; }
        .ik-login-back {
          display: inline-block; margin-top: 25px; color: #7b8592;
          font-size: 11px; text-decoration: none;
        }
        .ik-login-back:hover { color: #946b05; }
        .ik-login-secure {
          display: flex; justify-content: center; align-items: center; gap: 7px;
          margin-top: 32px; color: #9aa2ad; font-size: 10px;
        }
        .ik-login-secure span { color: #16865b; }
        @media (max-width: 800px) {
          .ik-login-page { grid-template-columns: 1fr; }
          .ik-login-visual { display: none; }
          .ik-login-form-side { min-height: 100vh; padding: 32px 22px; }
          .ik-login-mobile-brand {
            display: flex; align-items: center; gap: 10px; margin-bottom: 43px;
            color: #a47a11; text-decoration: none;
          }
          .ik-login-mobile-brand .ik-login-mark { width: 42px; height: 42px; }
          .ik-login-mobile-brand .ik-login-brand-name { font-size: 17px; }
          .ik-login-card h2 { font-size: 31px; }
        }
      `}</style>

      <section className="ik-login-visual" aria-label="Ikuzwe Restaurant">
        <Link className="ik-login-brand" to="/">
          <div className="ik-login-mark" aria-hidden="true">♨</div>
          <div>
            <div className="ik-login-brand-name">IKUZWE</div>
            <div className="ik-login-brand-sub">RESTAURANT</div>
          </div>
        </Link>

        <div className="ik-login-hero">
          <div className="ik-login-eyebrow">Admin workspace</div>
          <h1>Good food.<br />Great service.<br /><span>Seamless control.</span></h1>
          <p>
            Sign in to manage restaurant orders, follow preparation progress,
            and keep every part of the Ikuzwe experience running smoothly.
          </p>
        </div>

        <div className="ik-login-visual-footer">
          <span>✦</span> Made for hospitality · Ikuzwe Restaurant
        </div>
      </section>

      <section className="ik-login-form-side">
        <div className="ik-login-card">
          <Link className="ik-login-mobile-brand" to="/">
            <div className="ik-login-mark" aria-hidden="true">♨</div>
            <div>
              <div className="ik-login-brand-name">IKUZWE</div>
              <div className="ik-login-brand-sub">RESTAURANT</div>
            </div>
          </Link>

          <div className="ik-login-kicker">Welcome back</div>
          <h2>Admin login</h2>
          <p className="ik-login-description">
            Enter your account details to access your restaurant dashboard.
          </p>

          {notice && <div className="ik-login-notice" role="status">{notice}</div>}
          {error && <div className="ik-login-error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="ik-login-field">
              <label htmlFor="admin-identifier">Username or email</label>
              <input
                id="admin-identifier"
                className="ik-login-input"
                type="text"
                autoComplete="username"
                placeholder="Enter your username or email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>

            <div className="ik-login-field">
              <label htmlFor="admin-password">Password</label>
              <div className="ik-login-input-wrap">
                <input
                  id="admin-password"
                  className="ik-login-input ik-login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
                <button
                  className="ik-login-show"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button className="ik-login-submit" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in to dashboard"}
            </button>
          </form>

          <div className="ik-login-divider">FIRST TIME SETUP</div>

          <div className="ik-login-register">
            Setting up the admin account for the first time?{" "}
            <Link to="/admin/register">Create an account</Link>
          </div>

          <div className="ik-login-secure">
            <span>●</span> Secure administrator access
          </div>

          <div style={{ textAlign: "center" }}>
            <Link className="ik-login-back" to="/">← Back to restaurant website</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminLoginPage;
