import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import "./ChatWindow.css";

const TTL_MS = 24 * 60 * 60 * 1000;
const EMOJIS = [
  "😀", "😅", "😍", "😎", "🙌", "🤝", "🔥", "👍", "💙",
  "✨", "🎯", "🗺️", "📍", "🆘", "🙏", "🎉", "🍀", "✅", "⭐"
];

function fakeTranslate(text) {
  return text.split("").reverse().join("");
}

function createMessageId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

export default function ChatWindow({ selectedUser, onClose }) {
  const [translateOn, setTranslateOn] = useState(true);
  const [input, setInput] = useState("");
  const [deeds, setDeeds] = useState({ green: 0, yellow: 0, blue: 0 });
  const [showEmoji, setShowEmoji] = useState(false);
  const [showAttach, setShowAttach] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const [messagesByPeer, setMessagesByPeer] = useState(() => {
    try {
      const raw = localStorage.getItem("chatMessages");
      if (!raw) return {};

      const parsed = JSON.parse(raw);
      const now = Date.now();

      const cleaned = {};
      for (const peer in parsed) {
        cleaned[peer] = (parsed[peer] || []).filter(
          (m) => now - (m.createdAt || m.timestamp || 0) < TTL_MS
        );
      }

      return cleaned;
    } catch {
      return {};
    }
  });

  const messages = useMemo(() => {
    return messagesByPeer[selectedUser] || [];
  }, [messagesByPeer, selectedUser]);

  const initials = useMemo(() => {
    const name = (selectedUser || "משתמש").trim();
    const parts = name.split(/\s+/);
    return (parts[0]?.[0] || "מ") + (parts[1]?.[0] || "");
  }, [selectedUser]);

  const scrollerRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraStreamRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messagesByPeer));
  }, [messagesByPeer]);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, selectedUser]);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setShowCamera(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (showCamera) stopCamera();
        else onClose?.();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCamera, stopCamera, onClose]);

  const appendMessage = useCallback(
    (message) => {
      if (!selectedUser) return;

      setMessagesByPeer((prev) => ({
        ...prev,
        [selectedUser]: [...(prev[selectedUser] || []), message],
      }));
    },
    [selectedUser]
  );

  const sendMessage = useCallback(
    (opts = {}) => {
      const text = (opts.text ?? input ?? "").trim();
      const attachments = opts.attachments || [];

      if (!text && attachments.length === 0) return;

      const base = {
        id: createMessageId(),
        from: "me",
        text,
        createdAt: Date.now(),
        attachments,
      };

      const message =
        translateOn && text
          ? { ...base, translated: `(${fakeTranslate(text)})` }
          : base;

      appendMessage(message);

      setInput("");
      setShowEmoji(false);
      setShowAttach(false);
    },
    [appendMessage, input, translateOn]
  );

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      cameraStreamRef.current = stream;
      setShowCamera(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      alert("לא ניתן להפעיל מצלמה. בדוק הרשאות מצלמה.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");

    sendMessage({
      text: "(תמונה)",
      attachments: [
        {
          type: "image",
          url: dataUrl,
          name: `photo-${Date.now()}.png`,
        },
      ],
    });

    stopCamera();
  };

  const onPickFiles = () => {
    fileInputRef.current?.click();
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const attachments = await Promise.all(
      files.map(async (file) => {
        const isImage = file.type.startsWith("image/");
        const url = await toDataUrl(file);

        return {
          type: isImage ? "image" : "file",
          url,
          name: file.name,
        };
      })
    );

    sendMessage({ text: "", attachments });
    e.target.value = "";
  };

  const addEmoji = (emoji) => {
    setInput((prev) => prev + emoji);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const markDeed = (level) => {
    setDeeds((prev) => ({
      ...prev,
      [level]: (prev[level] || 0) + 1,
    }));
  };

  const toggleEmojiPanel = () => {
    setShowEmoji((prev) => !prev);
    setShowAttach(false);
  };

  const toggleAttachPanel = () => {
    setShowAttach((prev) => !prev);
    setShowEmoji(false);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-peer">
          <div className="avatar">{initials}</div>

          <div className="peer-title">
            <b>{selectedUser || "משתמש"}</b>
            <div className="peer-sub">מחובר עכשיו</div>
          </div>
        </div>

        <div className="chat-header-actions">
          <button onClick={() => setTranslateOn((v) => !v)}>
            {translateOn ? "תרגום: פעיל" : "תרגום: כבוי"}
          </button>
          <button onClick={onClose}>סגור ✕</button>
        </div>
      </div>

      <div className="chat-messages" ref={scrollerRef}>
        {messages.length === 0 && (
          <div className="chat-empty">התחילו שיחה 👋</div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.from === "me" ? "sent" : "received"}`}
          >
            <div className="bubble">
              {message.text && <div className="bubble-text">{message.text}</div>}

              {message.translated && (
                <div className="bubble-translated">{message.translated}</div>
              )}

              {!!message.attachments?.length && (
                <div className="bubble-atts">
                  {message.attachments.map((att, i) => (
                    <AttachmentPreview key={i} att={att} />
                  ))}
                </div>
              )}

              <div className="meta">
                <span className="timestamp">
                  {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="tick">✓✓</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="composer">
        <div className="composer-tools">
          <button type="button" title="אמוג'י" onClick={toggleEmojiPanel}>
            😊
          </button>
          <button type="button" title="צרף קבצים" onClick={toggleAttachPanel}>
            📎
          </button>
          <button type="button" title="מצלמה" onClick={startCamera}>
            📷
          </button>
        </div>

        <textarea
          className="composer-input"
          placeholder="כתוב הודעה… (Enter לשליחה, Shift+Enter לשורה חדשה)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
        />

        <button
          type="button"
          className="composer-send"
          onClick={() => sendMessage()}
          disabled={!input.trim()}
        >
          ➤
        </button>
      </div>

      {showEmoji && (
        <div className="panel emoji-panel">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              className="emoji-btn"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {showAttach && (
        <div className="panel attach-panel">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={onFilesSelected}
          />
          <button type="button" onClick={onPickFiles}>
            בחר קבצים…
          </button>
          <div className="hint">
            ניתן לצרף תמונות או מסמכים; יישמרו כ-dataURL ל-MVP
          </div>
        </div>
      )}

      <div className="deeds-bar">
        <span>סמן מעשה טוב:</span>
        <button
          type="button"
          onClick={() => markDeed("green")}
          className="deed deed-green"
        >
          ✅ ירוק ({deeds.green})
        </button>
        <button
          type="button"
          onClick={() => markDeed("yellow")}
          className="deed deed-yellow"
        >
          ⭐ צהוב ({deeds.yellow})
        </button>
        <button
          type="button"
          onClick={() => markDeed("blue")}
          className="deed deed-blue"
        >
          💙 כחול ({deeds.blue})
        </button>
      </div>

      {showCamera && (
        <div
          className="camera-modal"
          role="dialog"
          aria-modal="true"
          onClick={stopCamera}
        >
          <div className="camera-box" onClick={(e) => e.stopPropagation()}>
            <video ref={videoRef} autoPlay playsInline className="camera-video" />
            <canvas ref={canvasRef} style={{ display: "none" }} />

            <div className="camera-actions">
              <button type="button" onClick={capturePhoto}>
                צלם ושלח 📸
              </button>
              <button type="button" onClick={stopCamera}>
                סגור
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}