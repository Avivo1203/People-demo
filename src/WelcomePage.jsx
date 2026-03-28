import React, { useMemo, useState } from "react";
import {
  Mail,
  Phone,
  LockKeyhole,
  User,
  IdCard,
  MapPin,
  Users,
  Zap,
  HeartHandshake,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import "./WelcomePage.css";

export default function WelcomePage({ onEnter, onGuestEnter }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    loginIdentifier: "",
    loginPassword: "",
  });

  const [error, setError] = useState("");

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

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleRegister = (e) => {
    e.preventDefault();

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const password = form.password.trim();

    if (!firstName || !lastName) {
      setError("נא למלא שם פרטי ושם משפחה.");
      return;
    }

    if (!email && !phone) {
      setError("נא למלא לפחות אימייל או מספר טלפון.");
      return;
    }

    if (!password || password.length < 4) {
      setError("נא להזין סיסמה באורך 4 תווים לפחות.");
      return;
    }

    const user = {
      nickname: firstName,
      firstName,
      lastName,
      email,
      phone,
      password,
      role: "user",
      isGuest: false,
    };

    localStorage.setItem("registeredUser", JSON.stringify(user));
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("entered", "true");
    localStorage.setItem("guest", "false");

    onEnter();
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const loginIdentifier = form.loginIdentifier.trim();
    const loginPassword = form.loginPassword.trim();

    if (!loginIdentifier || !loginPassword) {
      setError("נא למלא אימייל או מספר טלפון וסיסמה.");
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem("registeredUser"));

    if (!savedUser) {
      setError("לא נמצא משתמש רשום. יש לבצע הרשמה קודם.");
      return;
    }

    const isIdentifierMatch =
      savedUser.email === loginIdentifier || savedUser.phone === loginIdentifier;

    const isPasswordMatch = savedUser.password === loginPassword;

    if (!isIdentifierMatch || !isPasswordMatch) {
      setError("פרטי ההתחברות אינם נכונים.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(savedUser));
    localStorage.setItem("entered", "true");
    localStorage.setItem("guest", "false");

    onEnter();
  };

  return (
    <div className="wp-root">
      <div className="wp-bg wp-bg-one" />
      <div className="wp-bg wp-bg-two" />
      <div className="wp-bg wp-bg-three" />
      <div className="wp-grid-overlay" />
      <div className="wp-noise-overlay" />
      <div className="wp-map-lines" />

      <div className="wp-shell">
        <section className="wp-left">
          <div className="wp-badge">
            <Sparkles size={15} strokeWidth={2.2} />
            <span>People+ Platform</span>
          </div>

          <div className="wp-brand-block">
            <h1 className="wp-logo">People+</h1>
            <p className="wp-tagline">
              לגלות, לשתף ולהתחבר — לפי מה שקורה סביבכם
            </p>
          </div>

          <div className="wp-hero">
            <h2>גלו מי סביבכם. התחברו באמת.</h2>
            <p className="wp-hero-text">
              People+ היא פלטפורמה חברתית מבוססת מיקום שמאפשרת לכם לראות מה קורה
              באזור שלכם, לשתף סטטוסים בזמן אמת, ולהתחבר לאנשים שנמצאים קרוב
              אליכם — בצורה פשוטה, חכמה ומודרנית.
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

          <div className="wp-mini-stats">
            <div className="wp-stat-card">
              <div className="wp-stat-icon">
                <Zap size={18} strokeWidth={2.2} />
              </div>
              <span className="wp-stat-number">Live</span>
              <span className="wp-stat-label">עדכונים חיים</span>
            </div>

            <div className="wp-stat-card">
              <div className="wp-stat-icon">
                <Users size={18} strokeWidth={2.2} />
              </div>
              <span className="wp-stat-number">Nearby</span>
              <span className="wp-stat-label">אנשים מסביבך</span>
            </div>

            <div className="wp-stat-card">
              <div className="wp-stat-icon">
                <HeartHandshake size={18} strokeWidth={2.2} />
              </div>
              <span className="wp-stat-number">Helpful</span>
              <span className="wp-stat-label">עזרה מהאזור</span>
            </div>
          </div>
        </section>

        <section className="wp-right">
          <div className="wp-card-glow" />

          <div className="wp-card">
            <div className="wp-tabs">
              <button
                type="button"
                className={`wp-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => handleModeChange("login")}
              >
                התחברות
              </button>

              <button
                type="button"
                className={`wp-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => handleModeChange("register")}
              >
                הרשמה
              </button>
            </div>

            <div className="wp-card-head">
              {mode === "login" ? (
                <>
                  <h3>ברוכים השבים</h3>
                  <p>התחברו עם אימייל או מספר טלפון והמשיכו ישר לאפליקציה</p>
                </>
              ) : (
                <>
                  <h3>הצטרפות ל־People+</h3>
                  <p>פתחו משתמש חדש והתחילו להתחבר לאנשים שנמצאים סביבכם</p>
                </>
              )}
            </div>

            {mode === "login" ? (
              <form className="wp-form wp-form-animate" onSubmit={handleLogin}>
                <label className="wp-label">
                  <span>אימייל או מספר טלפון</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="text"
                      name="loginIdentifier"
                      placeholder="הזינו אימייל או מספר טלפון"
                      value={form.loginIdentifier}
                      onChange={onChange}
                    />
                    <span className="wp-input-icon">
                      <BadgeCheck size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <label className="wp-label">
                  <span>סיסמה</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="password"
                      name="loginPassword"
                      placeholder="הזינו סיסמה"
                      value={form.loginPassword}
                      onChange={onChange}
                    />
                    <span className="wp-input-icon">
                      <LockKeyhole size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                {error && <div className="wp-error">{error}</div>}

                <button className="wp-btn wp-btn-primary" type="submit">
                  התחבר עכשיו
                </button>

                <button
                  type="button"
                  className="wp-btn wp-btn-secondary"
                  onClick={onGuestEnter}
                >
                  כניסה כאורח להדגמה
                </button>

                <p className="wp-note wp-note-center">
                  אין לך חשבון?
                  <button
                    type="button"
                    className="wp-switch-btn"
                    onClick={() => handleModeChange("register")}
                  >
                    להרשמה
                  </button>
                </p>
              </form>
            ) : (
              <form className="wp-form wp-form-animate" onSubmit={handleRegister}>
                <div className="wp-row">
                  <label className="wp-label">
                    <span>שם פרטי</span>
                    <div className="wp-input-wrap">
                      <input
                        className="wp-input"
                        type="text"
                        name="firstName"
                        placeholder="הזינו שם פרטי"
                        value={form.firstName}
                        onChange={onChange}
                      />
                      <span className="wp-input-icon">
                        <User size={18} strokeWidth={2.2} />
                      </span>
                    </div>
                  </label>

                  <label className="wp-label">
                    <span>שם משפחה</span>
                    <div className="wp-input-wrap">
                      <input
                        className="wp-input"
                        type="text"
                        name="lastName"
                        placeholder="הזינו שם משפחה"
                        value={form.lastName}
                        onChange={onChange}
                      />
                      <span className="wp-input-icon">
                        <IdCard size={18} strokeWidth={2.2} />
                      </span>
                    </div>
                  </label>
                </div>

                <label className="wp-label">
                  <span>אימייל</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="email"
                      name="email"
                      placeholder="אימייל (לא חובה)"
                      value={form.email}
                      onChange={onChange}
                    />
                    <span className="wp-input-icon">
                      <Mail size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <label className="wp-label">
                  <span>מספר טלפון</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="tel"
                      name="phone"
                      placeholder="מספר טלפון (לא חובה)"
                      value={form.phone}
                      onChange={onChange}
                    />
                    <span className="wp-input-icon">
                      <Phone size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <label className="wp-label">
                  <span>סיסמה</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="password"
                      name="password"
                      placeholder="בחרו סיסמה"
                      value={form.password}
                      onChange={onChange}
                    />
                    <span className="wp-input-icon">
                      <LockKeyhole size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <p className="wp-note">
                  יש למלא לפחות אימייל או מספר טלפון. הסיסמה תשמש אתכם גם להתחברות
                  בהמשך.
                </p>

                {error && <div className="wp-error">{error}</div>}

                <button className="wp-btn wp-btn-primary" type="submit">
                  הצטרף ל־People+
                </button>

                <p className="wp-note wp-note-center">
                  כבר יש לך חשבון?
                  <button
                    type="button"
                    className="wp-switch-btn"
                    onClick={() => handleModeChange("login")}
                  >
                    להתחברות
                  </button>
                </p>
              </form>
            )}

            <div className="wp-trust">
              הפרטים נשמרים כרגע מקומית לצורך הדגמה של המערכת.
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}