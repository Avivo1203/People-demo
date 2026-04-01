import React, { useMemo, useState } from "react";
import {
  Mail,
  LockKeyhole,
  User,
  IdCard,
  Users,
  Zap,
  HeartHandshake,
  MapPin,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import "./WelcomePage.css";

export default function WelcomePage({ onEnter }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    loginIdentifier: "",
    loginPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const featureItems = useMemo(
    () => [
      {
        icon: <MapPin size={20} strokeWidth={2.2} />,
        eyebrow: "חיבורים לפי מיקום",
        title: "גלו מה קורה בדיוק סביבכם",
        text: "מצאו אנשים, סטטוסים ועדכונים שרלוונטיים לאזור שבו אתם נמצאים — בזמן אמת.",
      },
      {
        icon: <Users size={20} strokeWidth={2.2} />,
        eyebrow: "קהילה מקומית חיה",
        title: "להכיר אנשים קרובים באמת",
        text: "גלו מי בסביבה שלכם, צרו שיח, עזרו לאחרים והכירו אנשים חדשים מתוך הקהילה המקומית.",
      },
      {
        icon: <Zap size={20} strokeWidth={2.2} />,
        eyebrow: "כניסה מהירה ומושלמת",
        title: "פשוט, מהיר ומוכן לשימוש",
        text: "התחילו להשתמש ב־People+ בקלות, עם חוויית שימוש נקייה, מודרנית ונוחה.",
      },
    ],
    []
  );

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const enterApp = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("entered", "true");
    onEnter(userData);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password } = form;

    if (!firstName || !email || password.length < 4) {
      setError("נא למלא שם, אימייל וסיסמה בת 4 תווים לפחות.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: `${firstName} ${lastName}`,
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("נרשמת בהצלחה! עכשיו אפשר להתחבר.");
        handleModeChange("login");
      } else {
        setError(data.msg || "שגיאה בתהליך ההרשמה");
      }
    } catch (err) {
      setError("לא ניתן להתחבר לשרת. וודא שה-Backend רץ.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { loginIdentifier, loginPassword } = form;

    if (!loginIdentifier || !loginPassword) {
      setError("נא למלא את כל השדות.");
      return;
    }

    setLoading(true);
    try {
      // תיקון: הכתובת שונתה ל-login
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginIdentifier,
          password: loginPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        enterApp({ 
          nickname: data.nickname, 
          email: data.email, 
          token: data.token,
          avatar: "👤" 
        });
      } else {
        setError(data.msg || "פרטי התחברות שגויים");
      }
    } catch (err) {
      setError("שגיאה בתקשורת עם השרת.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      nickname: `Guest_${Math.floor(Math.random() * 1000)}`,
      avatar: "👻",
      isGuest: true,
    };
    enterApp(guestUser);
  };

  return (
    <div className="wp-root">
      <div className="wp-bg wp-bg-one" /><div className="wp-bg wp-bg-two" /><div className="wp-bg wp-bg-three" />
      <div className="wp-grid-overlay" /><div className="wp-noise-overlay" /><div className="wp-map-lines" />

      <div className="wp-shell">
        <section className="wp-left">
          <div className="wp-badge">
            <Sparkles size={15} strokeWidth={2.2} />
            <span>People+ Platform</span>
          </div>

          <div className="wp-brand-block">
            <h1 className="wp-logo">People+</h1>
            <p className="wp-tagline">לגלות, לשתף ולהתחבר — לפי מה שקורה סביבכם</p>
          </div>

          <div className="wp-hero">
            <h2>גלו מי סביבכם. התחברו באמת.</h2>
            <p className="wp-hero-text">
              People+ היא פלטפורמה חברתית מבוססת מיקום המאפשרת לראות עדכונים בזמן אמת מהסביבה הקרובה.
            </p>
          </div>

          <div className="wp-feature-list">
            {featureItems.map((item) => (
              <div className="wp-feature-card" key={item.title}>
                <div className="wp-feature-icon">{item.icon}</div>
                <div className="wp-feature-content">
                  <span className="wp-feature-eyebrow">{item.eyebrow}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="wp-right">
          <div className="wp-card-glow" />
          <div className="wp-card">
            <div className="wp-tabs">
              <button type="button" className={`wp-tab ${mode === "login" ? "active" : ""}`} onClick={() => handleModeChange("login")}>התחברות</button>
              <button type="button" className={`wp-tab ${mode === "register" ? "active" : ""}`} onClick={() => handleModeChange("register")}>הרשמה</button>
            </div>

            <div className="wp-card-head">
              {mode === "login" ? (
                <><h3>ברוכים השבים</h3><p>התחברו והמשיכו ישר למפה</p></>
              ) : (
                <><h3>הצטרפות ל־People+</h3><p>צרו חשבון והתחילו לשתף</p></>
              )}
            </div>

            {mode === "login" ? (
              <form className="wp-form" onSubmit={handleLogin}>
                <label className="wp-label">
                  <span>אימייל</span>
                  <div className="wp-input-wrap">
                    <input className="wp-input" type="text" name="loginIdentifier" placeholder="הזינו אימייל" value={form.loginIdentifier} onChange={onChange} />
                    <span className="wp-input-icon"><BadgeCheck size={18} /></span>
                  </div>
                </label>
                <label className="wp-label">
                  <span>סיסמה</span>
                  <div className="wp-input-wrap">
                    <input className="wp-input" type="password" name="loginPassword" placeholder="הזינו סיסמה" value={form.loginPassword} onChange={onChange} />
                    <span className="wp-input-icon"><LockKeyhole size={18} /></span>
                  </div>
                </label>
                {error && <div className="wp-error">{error}</div>}
                <button className="wp-btn wp-btn-primary" type="submit" disabled={loading}>
                  {loading ? "מתחבר..." : "התחבר עכשיו"}
                </button>
                <button type="button" className="wp-btn wp-btn-secondary" onClick={handleGuestLogin}>כניסה כאורח</button>
              </form>
            ) : (
              <form className="wp-form" onSubmit={handleRegister}>
                <div className="wp-row">
                  <label className="wp-label">
                    <span>שם פרטי</span>
                    <input className="wp-input" type="text" name="firstName" placeholder="שם" value={form.firstName} onChange={onChange} />
                  </label>
                  <label className="wp-label">
                    <span>שם משפחה</span>
                    <input className="wp-input" type="text" name="lastName" placeholder="משפחה" value={form.lastName} onChange={onChange} />
                  </label>
                </div>
                <label className="wp-label">
                  <span>אימייל</span>
                  <input className="wp-input" type="email" name="email" placeholder="email@example.com" value={form.email} onChange={onChange} />
                </label>
                <label className="wp-label">
                  <span>סיסמה</span>
                  <input className="wp-input" type="password" name="password" placeholder="לפחות 4 תווים" value={form.password} onChange={onChange} />
                </label>
                {error && <div className="wp-error">{error}</div>}
                <button className="wp-btn wp-btn-primary" type="submit" disabled={loading}>
                  {loading ? "יוצר חשבון..." : "הצטרף ל־People+"}
                </button>
              </form>
            )}
            <div className="wp-trust">התחברות מאובטחת לשרת People+</div>
          </div>
        </section>
      </div>
    </div>
  );
}