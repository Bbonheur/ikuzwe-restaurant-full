import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE_URL = "http://localhost:5000/api/admin";

export default function AdminVerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialEmail =
    location.state?.email || searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (initialEmail) setEmail(initialEmail);
  }, [initialEmail]);

  const handleCodeChange = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setError("");
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter the email address you used to register.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code from your email.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, code }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We couldn't verify that code. Check it and try again.");
      }

      setNotice(data.message || "Email verified successfully. You can now sign in.");
      window.setTimeout(() => navigate("/admin/login", {
        replace: true,
        state: { email: cleanEmail, verified: true },
      }), 1200);
    } catch (err) {
      setError(err.message || "Unable to verify your email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Enter your registration email first.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We couldn't send a new code. Please try again.");
      }

      setNotice(data.message || "A new verification code has been sent if the account is awaiting verification.");
    } catch (err) {
      setError(err.message || "Unable to resend the code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="verify-page">
      <div className="verify-glow verify-glow-one" />
      <div className="verify-glow verify-glow-two" />

      <section className="verify-card" aria-labelledby="verify-title">
        <Link to="/" className="verify-brand" aria-label="Ikuzwe Restaurant home">
          <span className="verify-brand-mark">I</span>
          <span>
            <strong>IKUZWE</strong>
            <small>RESTAURANT</small>
          </span>
        </Link>

        <div className="verify-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
            <path d="m5 7 7 5.5L19 7" />
            <path d="m9 15 1.8 1.8L15.5 12" />
          </svg>
        </div>

        <p className="verify-eyebrow">ONE LAST STEP</p>
        <h1 id="verify-title">Verify your email</h1>
        <p className="verify-description">
          We’ll use your email to help keep your restaurant admin account secure.
          Enter the 6-digit code sent to your inbox.
        </p>

        {notice && <div className="verify-alert verify-alert-success" role="status">{notice}</div>}
        {error && <div className="verify-alert verify-alert-error" role="alert">{error}</div>}

        <form onSubmit={handleVerify}>
          <label htmlFor="verify-email">Email address</label>
          <input
            id="verify-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
            }}
            required
          />

          <label htmlFor="verify-code">Verification code</label>
          <input
            id="verify-code"
            className="verify-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            value={code}
            onChange={handleCodeChange}
            aria-describedby="verify-code-help"
            maxLength={6}
            required
          />
          <p className="verify-help" id="verify-code-help">
            Check your inbox and spam folder. The code may expire, so use the newest one.
          </p>

          <button className="verify-submit" type="submit" disabled={loading}>
            {loading ? "Verifying…" : "Verify email"}
            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <div className="verify-resend">
          <span>Didn’t receive a code?</span>
          <button type="button" onClick={handleResend} disabled={resending}>
            {resending ? "Sending…" : "Resend code"}
          </button>
        </div>

        <div className="verify-divider"><span>SECURE ADMIN ACCESS</span></div>
        <p className="verify-footer">
          Already verified? <Link to="/admin/login">Sign in</Link>
        </p>
        <p className="verify-home"><Link to="/">← Back to restaurant</Link></p>
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap');

        .verify-page {
          min-height: 100vh;
          position: relative;
          isolation: isolate;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 38px 18px;
          overflow: hidden;
          color: #f9f5eb;
          background: #10100e;
          font-family: 'DM Sans', sans-serif;
        }
        .verify-glow {
          position: absolute;
          z-index: -1;
          width: 420px;
          height: 420px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: .14;
          pointer-events: none;
          background: #d6a84f;
        }
        .verify-glow-one { top: -220px; left: -140px; }
        .verify-glow-two { right: -230px; bottom: -240px; opacity: .1; }
        .verify-card {
          width: 100%;
          max-width: 470px;
          padding: 38px;
          border: 1px solid rgba(218, 177, 91, .24);
          border-radius: 22px;
          background: rgba(25, 25, 22, .96);
          box-shadow: 0 24px 80px rgba(0, 0, 0, .35);
        }
        .verify-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: #f9f5eb;
          text-decoration: none;
        }
        .verify-brand-mark {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border: 1px solid #d7ad5b;
          border-radius: 12px;
          color: #e2bb6b;
          font-family: 'Playfair Display', serif;
          font-size: 25px;
        }
        .verify-brand strong, .verify-brand small { display: block; }
        .verify-brand strong { letter-spacing: 3px; font-size: 13px; }
        .verify-brand small { margin-top: 3px; color: #c3a66d; font-size: 9px; letter-spacing: 3px; }
        .verify-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin: 34px 0 20px;
          border-radius: 17px;
          color: #e5bd6b;
          background: rgba(214, 168, 79, .12);
        }
        .verify-icon svg { width: 29px; height: 29px; stroke: currentColor; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
        .verify-eyebrow { margin: 0 0 9px; color: #d9b66e; font-size: 10px; font-weight: 700; letter-spacing: 2.8px; }
        .verify-card h1 {
          margin: 0;
          color: #fffaf0;
          font-family: 'Playfair Display', serif;
          font-size: clamp(29px, 5vw, 36px);
          font-weight: 600;
          letter-spacing: -.7px;
        }
        .verify-description { margin: 13px 0 25px; color: #aaa69c; font-size: 13px; line-height: 1.8; }
        .verify-card label { display: block; margin: 17px 0 8px; color: #e8e1d3; font-size: 12px; font-weight: 600; }
        .verify-card input {
          box-sizing: border-box;
          width: 100%;
          min-height: 48px;
          padding: 12px 14px;
          border: 1px solid #393830;
          border-radius: 10px;
          outline: none;
          background: #171714;
          color: #fffaf0;
          font: inherit;
          font-size: 13px;
          transition: border-color .2s, box-shadow .2s;
        }
        .verify-card input:focus { border-color: #cda653; box-shadow: 0 0 0 3px rgba(205, 166, 83, .12); }
        .verify-card input::placeholder { color: #66645c; }
        .verify-code-input { text-align: center; font-size: 23px !important; font-weight: 700 !important; letter-spacing: 12px; padding-left: 25px !important; }
        .verify-help { margin: 8px 0 0; color: #827f75; font-size: 11px; line-height: 1.6; }
        .verify-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 49px;
          margin-top: 24px;
          border: 0;
          border-radius: 10px;
          background: linear-gradient(135deg, #e3c477, #c59a43);
          color: #17140e;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform .2s, filter .2s;
        }
        .verify-submit:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
        .verify-submit:disabled, .verify-resend button:disabled { cursor: wait; opacity: .65; }
        .verify-submit span { font-size: 19px; }
        .verify-alert { margin: 0 0 16px; padding: 11px 13px; border-radius: 9px; font-size: 12px; line-height: 1.6; }
        .verify-alert-success { border: 1px solid rgba(96, 178, 128, .28); background: rgba(51, 124, 78, .13); color: #a9e0ba; }
        .verify-alert-error { border: 1px solid rgba(226, 104, 104, .3); background: rgba(160, 54, 54, .13); color: #ffb1a9; }
        .verify-resend { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 5px; margin-top: 21px; color: #969187; font-size: 12px; }
        .verify-resend button { padding: 4px; border: 0; background: transparent; color: #e0b963; font: inherit; font-weight: 700; cursor: pointer; }
        .verify-divider { display: flex; align-items: center; gap: 12px; margin: 27px 0 18px; color: #77736a; font-size: 9px; letter-spacing: 2px; }
        .verify-divider::before, .verify-divider::after { content: ''; flex: 1; height: 1px; background: #36352e; }
        .verify-footer, .verify-home { text-align: center; color: #9c988e; font-size: 12px; }
        .verify-footer a, .verify-home a { color: #e1b961; font-weight: 600; text-decoration: none; }
        .verify-home { margin: 22px 0 0; font-size: 11px; }
        @media (max-width: 520px) {
          .verify-card { padding: 27px 22px; }
          .verify-page { padding: 22px 13px; }
        }
      `}</style>
    </main>
  );
}
