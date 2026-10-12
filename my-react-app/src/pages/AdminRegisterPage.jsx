import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function AdminRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(form.username.trim())) {
      setError("Username must be 3–30 characters and use only letters, numbers, dots, underscores, or hyphens.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to create the admin account.");
      }

      // Pass the address in the URL so the verification page can prefill it.
      const email = form.email.trim().toLowerCase();
      navigate(`/admin/verify-email?email=${encodeURIComponent(email)}`, {
        state: { email, name: form.name.trim() },
        replace: true,
      });
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure the backend is running."
          : err.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="ik-register-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap');
        .ik-register-page {
          min-height: 100vh; display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(390px, .95fr);
          background: #f7f5ef; color: #17202b;
          font-family: 'DM Sans', sans-serif;
        }
        .ik-register-page * { box-sizing: border-box; }
        .ik-register-visual {
          min-height: 100vh; display: flex; flex-direction: column;
          justify-content: space-between; overflow: hidden; position: relative;
          padding: 42px clamp(28px, 5vw, 76px);
          background: radial-gradient(ellipse at 75% 20%, #3b3424 0, transparent 36%),
            linear-gradient(145deg, #171d24, #0e1319 72%); color: white;
        }
        .ik-register-visual::before {
          content: ""; position: absolute; width: 480px; height: 480px;
          right: -210px; bottom: -150px; border: 1px solid #f8bf3226;
          border-radius: 50%;
        }
        .ik-register-brand {
          position: relative; z-index: 1; display: flex; align-items: center;
          gap: 13px; width: fit-content; color: #f8bf32; text-decoration: none;
        }
        .ik-register-mark {
          width: 48px; height: 48px; display: grid; place-items: center;
          border: 1px solid #6e5520; border-radius: 14px;
          background: #f8bf3214; font-size: 26px;
        }
        .ik-register-brand-name {
          font: 800 21px 'Playfair Display', serif; letter-spacing: 2px;
        }
        .ik-register-brand-sub { margin-top: 3px; font-size: 9px; letter-spacing: 4px; }
        .ik-register-hero { position: relative; z-index: 1; max-width: 560px; margin: 50px 0; }
        .ik-register-eyebrow {
          display: inline-flex; align-items: center; gap: 9px; color: #f8bf32;
          font-size: 10px; font-weight: 700; letter-spacing: 2.4px; text-transform: uppercase;
        }
        .ik-register-eyebrow::before { content: ""; width: 25px; height: 1px; background: #f8bf32; }
        .ik-register-hero h1 {
          margin: 22px 0 18px; font: 700 clamp(38px, 5vw, 62px)/1.1 'Playfair Display', serif;
          letter-spacing: -1.5px;
        }
        .ik-register-hero h1 span { color: #f8bf32; }
        .ik-register-hero p { max-width: 420px; margin: 0; color: #b4bbc4; font-size: 14px; line-height: 1.9; }
        .ik-register-footer { position: relative; z-index: 1; color: #89929e; font-size: 11px; }
        .ik-register-footer span { color: #f8bf32; }
        .ik-register-form-side {
          display: flex; align-items: center; justify-content: center;
          padding: 32px clamp(22px, 4vw, 62px);
        }
        .ik-register-card { width: 100%; max-width: 420px; }
        .ik-register-mobile-brand { display: none; }
        .ik-register-kicker {
          margin-bottom: 10px; color: #a47a11; font-size: 10px;
          font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
        }
        .ik-register-card h2 {
          margin: 0; font: 700 32px/1.2 'Playfair Display', serif; letter-spacing: -.5px;
        }
        .ik-register-description { margin: 10px 0 21px; color: #7c8795; font-size: 12px; line-height: 1.7; }
        .ik-register-alert {
          margin-bottom: 15px; padding: 11px 13px; border-radius: 8px;
          font-size: 12px; line-height: 1.5;
        }
        .ik-register-alert.error { border: 1px solid #f4c8ce; background: #fff0f1; color: #a42c3a; }
        .ik-register-alert.notice { border: 1px solid #ccebd9; background: #edfff4; color: #176b45; }
        .ik-register-field { margin-bottom: 14px; }
        .ik-register-field label { display: block; margin-bottom: 7px; color: #303a48; font-size: 11px; font-weight: 700; }
        .ik-register-input-wrap { position: relative; }
        .ik-register-input {
          display: block; width: 100%; min-height: 44px; padding: 11px 13px;
          border: 1px solid #dce1e7; border-radius: 8px; outline: none;
          background: white; color: #192230; font: 12px 'DM Sans', sans-serif;
        }
        .ik-register-input:focus { border-color: #d6a51d; box-shadow: 0 0 0 3px #f8bf3229; }
        .ik-register-input::placeholder { color: #a4acb7; }
        .ik-register-password { padding-right: 70px; }
        .ik-register-show {
          position: absolute; top: 50%; right: 10px; transform: translateY(-50%);
          border: 0; background: transparent; color: #7d8794;
          font: 700 10px 'DM Sans', sans-serif; cursor: pointer;
        }
        .ik-register-submit {
          width: 100%; min-height: 47px; margin-top: 5px; border: 0;
          border-radius: 8px; background: #f8bf32; color: #171b20;
          font: 800 12px 'DM Sans', sans-serif; cursor: pointer;
        }
        .ik-register-submit:hover { background: #eeb01b; }
        .ik-register-submit:disabled { opacity: .65; cursor: wait; }
        .ik-register-small { margin-top: 12px; color: #939ba5; font-size: 10px; line-height: 1.6; }
        .ik-register-bottom { margin-top: 22px; color: #737e8c; text-align: center; font-size: 12px; }
        .ik-register-bottom a { color: #946b05; font-weight: 800; text-decoration: none; }
        .ik-register-back { display: block; margin-top: 19px; color: #7b8592; text-align: center; font-size: 11px; text-decoration: none; }
        @media (max-width: 850px) {
          .ik-register-page { grid-template-columns: 1fr; }
          .ik-register-visual { display: none; }
          .ik-register-form-side { min-height: 100vh; padding: 27px 22px; }
          .ik-register-mobile-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 28px; color: #a47a11; text-decoration: none; }
          .ik-register-mobile-brand .ik-register-mark { width: 42px; height: 42px; }
          .ik-register-mobile-brand .ik-register-brand-name { font-size: 17px; }
          .ik-register-card h2 { font-size: 29px; }
        }
      `}</style>

      <section className="ik-register-visual" aria-label="Ikuzwe Restaurant">
        <Link className="ik-register-brand" to="/">
          <div className="ik-register-mark" aria-hidden="true">♨</div>
          <div>
            <div className="ik-register-brand-name">IKUZWE</div>
            <div className="ik-register-brand-sub">RESTAURANT</div>
          </div>
        </Link>
        <div className="ik-register-hero">
          <div className="ik-register-eyebrow">First-time setup</div>
          <h1>One team.<br />One standard.<br /><span>Exceptional service.</span></h1>
          <p>
            Create the initial administrator account to manage orders and keep
            your restaurant operations organized in one place.
          </p>
        </div>
        <div className="ik-register-footer"><span>✦</span> Ikuzwe Restaurant · Administrator setup</div>
      </section>

      <section className="ik-register-form-side">
        <div className="ik-register-card">
          <Link className="ik-register-mobile-brand" to="/">
            <div className="ik-register-mark" aria-hidden="true">♨</div>
            <div>
              <div className="ik-register-brand-name">IKUZWE</div>
              <div className="ik-register-brand-sub">RESTAURANT</div>
            </div>
          </Link>

          <div className="ik-register-kicker">Administrator setup</div>
          <h2>Create your account</h2>
          <p className="ik-register-description">
            Register the first administrator. We’ll send a verification code to your email before you can log in.
          </p>

          {error && <div className="ik-register-alert error" role="alert">{error}</div>}
          {notice && <div className="ik-register-alert notice" role="status">{notice}</div>}

          <form onSubmit={handleSubmit}>
            <div className="ik-register-field">
              <label htmlFor="admin-name">Full name</label>
              <input
                id="admin-name" className="ik-register-input" name="name"
                autoComplete="name" placeholder="Your full name"
                value={form.name} onChange={updateField} required
              />
            </div>

            <div className="ik-register-field">
              <label htmlFor="admin-username">Username</label>
              <input
                id="admin-username" className="ik-register-input" name="username"
                autoComplete="username" placeholder="Choose a username"
                value={form.username} onChange={updateField} required
                minLength={3} maxLength={30}
              />
            </div>

            <div className="ik-register-field">
              <label htmlFor="admin-email">Gmail or email address</label>
              <input
                id="admin-email" className="ik-register-input" name="email"
                type="email" autoComplete="email" placeholder="you@gmail.com"
                value={form.email} onChange={updateField} required
              />
            </div>

            <div className="ik-register-field">
              <label htmlFor="admin-register-password">Password</label>
              <div className="ik-register-input-wrap">
                <input
                  id="admin-register-password"
                  className="ik-register-input ik-register-password"
                  name="password" type={showPassword ? "text" : "password"}
                  autoComplete="new-password" placeholder="At least 8 characters"
                  value={form.password} onChange={updateField} required minLength={8}
                />
                <button
                  className="ik-register-show" type="button"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <div className="ik-register-field">
              <label htmlFor="admin-confirm-password">Confirm password</label>
              <input
                id="admin-confirm-password" className="ik-register-input"
                name="confirmPassword" type={showPassword ? "text" : "password"}
                autoComplete="new-password" placeholder="Enter your password again"
                value={form.confirmPassword} onChange={updateField} required
              />
            </div>

            <button className="ik-register-submit" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create account & verify email"}
            </button>
          </form>

          <p className="ik-register-small">
            For security, registration should only be available until the first administrator account is created.
          </p>

          <div className="ik-register-bottom">
            Already have an account? <Link to="/admin/login">Sign in</Link>
          </div>
          <Link className="ik-register-back" to="/">← Back to restaurant website</Link>
        </div>
      </section>
    </main>
  );
}

export default AdminRegisterPage;
