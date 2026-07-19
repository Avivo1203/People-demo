import peopleLogo from "./assets/people-logo.png";
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
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import "./WelcomePage.css";

const API_URL = "https://people-demo.onrender.com";

export default function WelcomePage({ onEnter, onGuestEnter }) {
  const resetToken = useMemo(
    () => new URLSearchParams(window.location.search).get("resetToken"),
    []
  );

  const [mode, setMode] = useState(resetToken ? "reset" : "login");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    loginIdentifier: "",
    loginPassword: "",
    forgotEmail: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setSuccess("");
  };

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
    if (success) setSuccess("");
  };

  const readResponse = async (response) => {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return response.json();
    }

    return { message: "התקבלה תשובה לא תקינה מהשרת." };
  };

  const handleRegister = async (e) => {
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

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "שגיאה בהרשמה.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("entered", "true");
      localStorage.setItem("guest", "false");

      onEnter();
    } catch (err) {
      setError("משהו השתבש, אנא נסה שוב בעוד רגע.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const loginIdentifier = form.loginIdentifier.trim();
    const loginPassword = form.loginPassword.trim();

    if (!loginIdentifier || !loginPassword) {
      setError("נא למלא אימייל או מספר טלפון וסיסמה.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "פרטי ההתחברות אינם נכונים.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("entered", "true");
      localStorage.setItem("guest", "false");

      onEnter();
    } catch (err) {
      setError("שגיאה בחיבור לשרת. בדוק שה־Backend פועל.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    const email = form.forgotEmail.trim().toLowerCase();

    if (!email) {
      setError("נא להזין כתובת אימייל.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "לא ניתן לשלוח כרגע קישור לאיפוס.");
        return;
      }

      setSuccess(
        data.message ||
          "אם כתובת האימייל קיימת במערכת, נשלח אליה קישור לאיפוס הסיסמה."
      );
    } catch (err) {
      setError("שגיאה בחיבור לשרת. נסה שוב בעוד רגע.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const password = form.newPassword.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!resetToken) {
      setError("קישור האיפוס אינו תקין.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("נא למלא את שתי שורות הסיסמה.");
      return;
    }

    if (password.length < 4) {
      setError("הסיסמה חייבת להיות באורך של 4 תווים לפחות.");
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          password,
          confirmPassword,
        }),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        setError(data.message || "לא ניתן לעדכן את הסיסמה.");
        return;
      }

      setSuccess(data.message || "הסיסמה עודכנה בהצלחה.");

      window.history.replaceState({}, document.title, window.location.pathname);

      setForm((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError("שגיאה בחיבור לשרת. נסה שוב בעוד רגע.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCardHeading = () => {
    if (mode === "login") {
      return (
        <>
          <h3>ברוכים השבים</h3>
          <p>התחברו עם אימייל או מספר טלפון והמשיכו ישר לאפליקציה</p>
        </>
      );
    }

    if (mode === "register") {
      return (
        <>
          <h3>הצטרפות ל־People+</h3>
          <p>פתחו משתמש חדש והתחילו להתחבר לאנשים שנמצאים סביבכם</p>
        </>
      );
    }

    if (mode === "forgot") {
      return (
        <>
          <h3>שחזור סיסמה</h3>
          <p>הזינו את האימייל שלכם ונשלח קישור מאובטח לבחירת סיסמה חדשה</p>
        </>
      );
    }

    return (
      <>
        <h3>בחירת סיסמה חדשה</h3>
        <p>בחרו סיסמה חדשה והקלידו אותה שוב לצורך אימות</p>
      </>
    );
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
      <span>People+</span>
    </div>

    <div className="wp-brand-block">
      <div className="wp-brand-logo-wrap">
        <img
          className="wp-brand-logo-image"
          src={peopleLogo}
          alt="People logo"
        />
      </div>

      <div>
        <p className="wp-tagline">
          לגלות, לשתף ולהתחבר — לפי מה שקורה סביבכם
        </p>
      </div>
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
    {(mode === "login" || mode === "register") && (
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
            )}

            <div className="wp-card-head">{renderCardHeading()}</div>

            {mode === "login" && (
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
                      autoComplete="username"
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
                      autoComplete="current-password"
                    />
                    <span className="wp-input-icon">
                      <LockKeyhole size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <div className="wp-forgot-row">
                  <button
                    type="button"
                    className="wp-forgot-btn"
                    onClick={() => handleModeChange("forgot")}
                  >
                    שכחת את הסיסמה?
                  </button>
                </div>

                {error && <div className="wp-error">{error}</div>}

                <button
                  className="wp-btn wp-btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "מתחבר..." : "התחבר עכשיו"}
                </button>

                <button
                  type="button"
                  className="wp-btn wp-btn-secondary"
                  onClick={onGuestEnter}
                  disabled={isLoading}
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
            )}

            {mode === "register" && (
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
                        autoComplete="given-name"
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
                        autoComplete="family-name"
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
                      autoComplete="email"
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
                      autoComplete="tel"
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
                      autoComplete="new-password"
                    />
                    <span className="wp-input-icon">
                      <LockKeyhole size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <p className="wp-note">
                  יש למלא לפחות אימייל או מספר טלפון. שחזור סיסמה במייל זמין
                  למשתמשים שהזינו כתובת אימייל.
                </p>

                {error && <div className="wp-error">{error}</div>}

                <button
                  className="wp-btn wp-btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "יוצר חשבון..." : "הצטרף ל־People+"}
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

            {mode === "forgot" && (
              <form
                className="wp-form wp-form-animate"
                onSubmit={handleForgotPassword}
              >
                <div className="wp-security-panel">
                  <div className="wp-security-icon">
                    <ShieldCheck size={22} strokeWidth={2.2} />
                  </div>
                  <div>
                    <strong>קישור מאובטח וחד־פעמי</strong>
                    <span>הקישור שיישלח יהיה תקף למשך 15 דקות.</span>
                  </div>
                </div>

                <label className="wp-label">
                  <span>כתובת אימייל</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="email"
                      name="forgotEmail"
                      placeholder="הזינו את האימייל של החשבון"
                      value={form.forgotEmail}
                      onChange={onChange}
                      autoComplete="email"
                    />
                    <span className="wp-input-icon">
                      <Mail size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                {error && <div className="wp-error">{error}</div>}
                {success && (
                  <div className="wp-success">
                    <CheckCircle2 size={19} strokeWidth={2.2} />
                    <span>{success}</span>
                  </div>
                )}

                <button
                  className="wp-btn wp-btn-primary"
                  type="submit"
                  disabled={isLoading || Boolean(success)}
                >
                  {isLoading ? "שולח קישור..." : "שלח קישור לאיפוס"}
                </button>

                <button
                  type="button"
                  className="wp-back-btn"
                  onClick={() => handleModeChange("login")}
                >
                  <ArrowRight size={17} strokeWidth={2.2} />
                  חזרה להתחברות
                </button>
              </form>
            )}

            {mode === "reset" && (
              <form
                className="wp-form wp-form-animate"
                onSubmit={handleResetPassword}
              >
                <label className="wp-label">
                  <span>סיסמה חדשה</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="password"
                      name="newPassword"
                      placeholder="הזינו סיסמה חדשה"
                      value={form.newPassword}
                      onChange={onChange}
                      autoComplete="new-password"
                    />
                    <span className="wp-input-icon">
                      <LockKeyhole size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <label className="wp-label">
                  <span>אימות סיסמה חדשה</span>
                  <div className="wp-input-wrap">
                    <input
                      className="wp-input"
                      type="password"
                      name="confirmPassword"
                      placeholder="הזינו שוב את הסיסמה"
                      value={form.confirmPassword}
                      onChange={onChange}
                      autoComplete="new-password"
                    />
                    <span className="wp-input-icon">
                      <ShieldCheck size={18} strokeWidth={2.2} />
                    </span>
                  </div>
                </label>

                <p className="wp-note">
                  לאחר העדכון, קישור האיפוס יתבטל ולא יהיה ניתן להשתמש בו שוב.
                </p>

                {error && <div className="wp-error">{error}</div>}
                {success && (
                  <div className="wp-success">
                    <CheckCircle2 size={19} strokeWidth={2.2} />
                    <span>{success}</span>
                  </div>
                )}

                {!success ? (
                  <button
                    className="wp-btn wp-btn-primary"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? "מעדכן סיסמה..." : "עדכן סיסמה"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="wp-btn wp-btn-primary"
                    onClick={() => handleModeChange("login")}
                  >
                    חזרה להתחברות
                  </button>
                )}
              </form>
            )}

            <div className="wp-trust">הפרטים נשמרים בצורה מאובטחת במערכת.</div>
          </div>
        </section>
      </div>
    </div>
  );
}