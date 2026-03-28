import React, { useEffect, useMemo, useRef, useState } from "react";
import "./ChatWindow.css";

/**
 * ChatWindow – צ'אט מתקדם בסגנון וואטסאפ/Teams
 * פיצ'רים:
 * - בועות הודעות (ימין/שמאל)
 * - שליחת טקסט, אמוג'י, קבצים ותמונות
 * - מצלמה מובנית (getUserMedia) + צילום תמונה ושליחה
 * - תרגום דמה: הופך טקסט למחרוזת "מתורגמת" (להדגמה)
 * - מחיקה אוטומטית של היסטוריה מעל 24 שעות (TTL)
 * - "מעשה טוב" – מונים ירוק/צהוב/כחול
 * - שמירה ב-localStorage לפי משתמש יעד
 *
 * הנחיות עיצוב:
 * - נשען על index.css שלך (כחול/לבן)
 * - מוסיף כמה מחלקות CSS שמומלץ להדביק בסוף index.css (למטה בעדכון)
 */

export default function ChatWindow({ selectedUser, onClose }) {
  const [translateOn, setTranslateOn] = useState(true); // דגל תרגום דמה
  const [input, setInput] = useState("");               // תוכן השדה
  const [deeds, setDeeds] = useState({ green: 0, yellow: 0, blue: 0 });
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [messagesByPeer, setMessagesByPeer] = useState(() => {
    // טען היסטוריית צ'אטים
    try {
      const raw = localStorage.getItem("chatMessages");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const messages = useMemo(() => (messagesByPeer[selectedUser] || []), [messagesByPeer, selectedUser]);

  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);

  // מצלמה
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);

  // TTL – מחיקת הודעות ישנות מ-24 שעות
  const TTL_MS = 24 * 60 * 60 * 1000;

  useEffect(() => {
    // ניקוי ישן בכל טעינה/שינוי
    const now = Date.now();
    const updated = { ...messagesByPeer };
    for (const peer in updated) {
      updated[peer] = (updated[peer] || []).filter(m => now - (m.createdAt || m.timestamp || 0) < TTL_MS);
    }
    setMessagesByPeer(updated);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // שמירה ל-localStorage
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messagesByPeer));
  }, [messagesByPeer]);

  // גלילה לתחתית בכל שינוי הודעות
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages, selectedUser]);

  // סגירת חלון עם ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showCamera) stopCamera();
        else onClose?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCamera, onClose]);

  // התחלת מצלמה
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      setCameraStream(stream);
      setShowCamera(true);
      // נחכה שה-<video> יתחבר
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      alert("לא ניתן להפעיל מצלמה (בדוק הרשאות מצלמה)");
    }
  };

  // עצירת מצלמה
  const stopCamera = () => {
    cameraStream?.getTracks()?.forEach(t => t.stop());
    setCameraStream(null);
    setShowCamera(false);
  };

  // צילום פריים מהמצלמה
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/png");
    // נצרף הודעת "תמונה" ונשלח
    sendMessage({
      text: "(תמונה)",
      attachments: [{ type: "image", url: dataUrl, name: `photo-${Date.now()}.png` }],
    });
    stopCamera();
  };

  // שליחת טקסט/קובץ/תמונה
  const sendMessage = (opts = {}) => {
    const text = (opts.text ?? input ?? "").trim();
    const attachments = opts.attachments || [];

    if (!text && attachments.length === 0) return;

    const base = {
      id: crypto.randomUUID(),
      from: "me",
      text,
      createdAt: Date.now(),
      attachments, // [{type:'image'|'file', url, name}]
    };

    // תרגום דמה
    const message = translateOn && text
      ? { ...base, translated: `(${fakeTranslate(text)})` }
      : base;

    setMessagesByPeer(prev => ({
      ...prev,
      [selectedUser]: [ ...(prev[selectedUser] || []), message ],
    }));

    setInput("");
    setShowEmoji(false);
    setShowAttach(false);
  };

  // תרגום "דמה" – רק להדגמה עד API אמיתי
  const fakeTranslate = (t) => t.split("").reverse().join("");

  // קבצים
  const onPickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const atts = await Promise.all(files.map(async (f) => {
      const isImage = f.type.startsWith("image/");
      const url = await toDataUrl(f);
      return { type: isImage ? "image" : "file", url, name: f.name };
    }));
    sendMessage({ text: "", attachments: atts });
    e.target.value = "";
  };

  // המרת קובץ ל-dataURL
  const toDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // אמוג'י
  const EMOJIS = ["😀","😅","😍","😎","🙌","🤝","🔥","👍","💙","✨","🎯","🗺️","📍","🆘","🙏","🎉","🍀","✅","⭐"];
  const addEmoji = (e) => setInput(p => p + e);

  // שליחה עם Enter (Shift+Enter = שורה חדשה)
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // סימון "מעשה טוב"
  const markDeed = (level) => setDeeds(d => ({ ...d, [level]: (d[level] || 0) + 1 }));

  // אווטאר ראשי מאותיות השם
  const initials = useMemo(() => {
    const n = (selectedUser || "משתמש").trim();
    const parts = n.split(/\s+/);
    return (parts[0]?.[0] || "מ") + (parts[1]?.[0] || "");
  }, [selectedUser]);

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-peer">
          <div className="avatar">{initials}</div>
          <div className="peer-title">
            <b>{selectedUser || "משתמש"}</b>
            <div className="peer-sub">מחובר עכשיו</div>
          </div>
        </div>
        <div className="chat-header-actions">
          <button onClick={() => setTranslateOn(v => !v)}>
            {translateOn ? "תרגום: פעיל" : "תרגום: כבוי"}
          </button>
          <button onClick={onClose}>סגור ✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={scrollerRef}>
        {messages.length === 0 && (
          <div className="chat-empty">התחילו שיחה 👋</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.from === "me" ? "sent" : "received"}`}>
            <div className="bubble">
              {m.text && <div className="bubble-text">{m.text}</div>}
              {m.translated && (
                <div className="bubble-translated">{m.translated}</div>
              )}
              {!!(m.attachments?.length) && (
                <div className="bubble-atts">
                  {m.attachments.map((a, i) => (
                    <AttachmentPreview key={i} att={a} />
                  ))}
                </div>
              )}
              <div className="meta">
                <span className="timestamp">
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                </span>
                <span className="tick">✓✓</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Composer */}
      <div className="composer">
        <div className="composer-tools">
          <button title="אמוג'י" onClick={() => setShowEmoji(v => !v)}>😊</button>
          <button title="צרף קבצים" onClick={() => setShowAttach(v => !v)}>📎</button>
          <button title="מצלמה" onClick={startCamera}>📷</button>
        </div>

        <textarea
          className="composer-input"
          placeholder="כתוב הודעה… (Enter לשליחה, Shift+Enter לשורה חדשה)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
        />

        <button className="composer-send" onClick={() => sendMessage()} disabled={!input.trim()}>
          ➤
        </button>
      </div>

      {/* Emoji panel */}
      {showEmoji && (
        <div className="panel emoji-panel">
          {EMOJIS.map(e => (
            <button key={e} onClick={() => addEmoji(e)} className="emoji-btn">{e}</button>
          ))}
        </div>
      )}

      {/* Attach panel */}
      {showAttach && (
        <div className="panel attach-panel">
          <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={onFilesSelected} />
          <button onClick={onPickFiles}>בחר קבצים…</button>
          <div className="hint">ניתן לצרף תמונות או מסמכים; יישמרו כ-dataURL ל-MVP</div>
        </div>
      )}

      {/* Good deeds */}
      <div className="deeds-bar">
        <span>סמן מעשה טוב:</span>
        <button onClick={() => markDeed("green")} className="deed deed-green">✅ ירוק ({deeds.green})</button>
        <button onClick={() => markDeed("yellow")} className="deed deed-yellow">⭐ צהוב ({deeds.yellow})</button>
        <button onClick={() => markDeed("blue")} className="deed deed-blue">💙 כחול ({deeds.blue})</button>
      </div>

      {/* Camera modal */}
      {showCamera && (
        <div className="camera-modal" role="dialog" aria-modal="true" onClick={stopCamera}>
          <div className="camera-box" onClick={(e) => e.stopPropagation()}>
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <div className="camera-actions">
              <button onClick={capturePhoto}>צלם ושלח 📸</button>
              <button onClick={stopCamera}>סגור</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** תצוגה מקדימה של קובץ/תמונה בהודעה */
function AttachmentPreview({ att }) {
  if (att.type === "image") {
    return (
      <div className="att att-image">
        <img src={att.url} alt={att.name || "image"} />
      </div>
    );
  }
  return (
    <a className="att att-file" href={att.url} download={att.name || "file"}>
      📄 {att.name || "קובץ"}
    </a>
  );
}
