import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Lock,
  Plus,
  Trash2,
  CalendarDays,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Sparkles,
} from "lucide-react";

const PASSWORD_KEY = "couple_journal_password";
const POSTS_KEY = "couple_journal_posts";
const SESSION_KEY = "couple_journal_session";

const samplePosts = [
  {
    id: 1,
    title: "Spring Light",
    date: "2026-03-09",
    text: "The sunlight felt warm, everything looked soft, and this was one of those days I never want to forget.",
    images: [
      "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: 2,
    title: "Quiet Afternoon",
    date: "2026-02-20",
    text: "Nothing big happened, but the small moments felt beautiful enough to keep forever.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

function formatDate(dateString) {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

function normalizeLegacyPosts(posts) {
  return posts.map((post) => ({
    ...post,
    images: post.images || (post.image ? [post.image] : []),
  }));
}

function ImageSlider({ images, title, onOpenGallery }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e) => setTouchStartX(e.targetTouches[0].clientX);
  const onTouchMove = (e) => setTouchEndX(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) nextSlide();
    if (distance < -50) prevSlide();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <div style={sliderWrapStyle}>
      <div
        style={{ position: "relative", height: "100%", width: "100%" }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={images[currentIndex]}
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            initial={{ opacity: 0.2, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.2, scale: 0.98 }}
            transition={{ duration: 0.35 }}
            style={sliderImageStyle}
            onClick={() => onOpenGallery(currentIndex)}
          />
        </AnimatePresence>
        <div style={imageOverlayStyle} />
      </div>

      <div style={floatingBadgeRowStyle}>
        <div style={badgeStyle}><ImageIcon size={14} style={{ marginRight: 6 }} /> {images.length} Photos</div>
        <div style={badgeStyle}><ZoomIn size={14} style={{ marginRight: 6 }} /> Open Gallery</div>
      </div>

      {images.length > 1 && (
        <>
          <button onClick={prevSlide} style={{ ...navBtnStyle, left: 18 }}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} style={{ ...navBtnStyle, right: 18 }}>
            <ChevronRight size={20} />
          </button>

          <div style={dotsWrapStyle}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  border: "none",
                  background: index === currentIndex ? "#fff" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}

      {images.length > 1 && <div style={countStyle}>{currentIndex + 1} / {images.length}</div>}
    </div>
  );
}

function GalleryModal({ images, initialIndex, title, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  const prev = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const next = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlayStyle}>
      <button onClick={onClose} style={{ ...circleBtnStyle, top: 20, right: 20, position: "absolute" }}>
        <X size={20} />
      </button>

      {images.length > 1 && (
        <button onClick={prev} style={{ ...circleBtnStyle, left: 20, top: "50%", position: "absolute", transform: "translateY(-50%)" }}>
          <ChevronLeft size={24} />
        </button>
      )}

      <div style={{ margin: "0 auto", display: "flex", maxHeight: "92vh", width: "100%", maxWidth: 1150, flexDirection: "column", gap: 16 }}>
        <div style={galleryMainImageWrapStyle}>
          <img src={images[currentIndex]} alt={`${title} ${currentIndex + 1}`} style={{ maxHeight: "72vh", width: "100%", objectFit: "contain" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ color: "#fff" }}>
            <p style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{title}</p>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "4px 0 0" }}>
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <div style={galleryThumbRowStyle}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                style={{
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: 14,
                  border: index === currentIndex ? "2px solid white" : "2px solid transparent",
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img src={img} alt={`thumb-${index}`} style={{ height: 68, width: 68, objectFit: "cover" }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <button onClick={next} style={{ ...circleBtnStyle, right: 20, top: "50%", position: "absolute", transform: "translateY(-50%)" }}>
          <ChevronRight size={24} />
        </button>
      )}
    </motion.div>
  );
}

export default function App() {
  const [password, setPassword] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState("");
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [activeTab, setActiveTab] = useState("write");

  useEffect(() => {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || "ourmemory";
    const savedPosts = localStorage.getItem(POSTS_KEY);
    const session = localStorage.getItem(SESSION_KEY) === "true";

    setPassword(savedPassword);
    setLoggedIn(session);

    if (savedPosts) {
      setPosts(normalizeLegacyPosts(JSON.parse(savedPosts)));
    } else {
      setPosts(samplePosts);
      localStorage.setItem(POSTS_KEY, JSON.stringify(samplePosts));
    }
  }, []);

  useEffect(() => {
    if (posts.length) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
  }, [posts]);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts]);

  const recentPhotos = useMemo(() => {
    return sortedPosts.flatMap((post) =>
      post.images.map((img, index) => ({
        image: img,
        title: post.title,
        date: post.date,
        postId: post.id,
        imageIndex: index,
        images: post.images,
      }))
    );
  }, [sortedPosts]);

  const handleLogin = () => {
    if (loginInput === password) {
      setLoggedIn(true);
      localStorage.setItem(SESSION_KEY, "true");
      setError("");
    } else {
      setError("Incorrect password.");
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    )
      .then((images) => {
        setImageFiles(images);
        setError("");
      })
      .catch(() => {
        setError("Failed to load images.");
      });
  };

  const handleAddPost = () => {
    if (!title || !date || !text || imageFiles.length === 0) {
      setError("Please fill in the title, date, photos, and text.");
      return;
    }

    const newPost = {
      id: Date.now(),
      title,
      date,
      text,
      images: imageFiles,
    };

    setPosts((prev) => [newPost, ...prev]);
    setTitle("");
    setDate("");
    setText("");
    setImageFiles([]);
    setError("");
    setActiveTab("memories");
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.setItem(SESSION_KEY, "false");
  };

  const handleSetPassword = () => {
    const newPassword = prompt("Enter a new password.");
    if (newPassword && newPassword.trim()) {
      localStorage.setItem(PASSWORD_KEY, newPassword.trim());
      setPassword(newPassword.trim());
      alert("Password changed.");
    }
  };

  const openGallery = (images, index, title) => {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryTitle(title);
    setGalleryOpen(true);
  };

  return (
    <div style={pageStyle}>
      <div style={ambientGlowOneStyle} />
      <div style={ambientGlowTwoStyle} />

      <div style={containerStyle}>
        {!loggedIn ? (
          <div style={loginWrapStyle}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={topBadgeStyle}>Private Memory Archive</div>
              <div style={{ marginTop: 18 }}>
                <h1 style={heroTitleStyle}>
                  Our Little
                  <span style={gradientTextStyle}>Love Journal</span>
                </h1>
                <p style={heroDescStyle}>
                  A soft private space for your favorite photos, stories, and small moments you want to keep forever.
                </p>
              </div>

              <div style={featureGridStyle}>
                <div style={featureCardStyle}><Heart size={20} style={{ marginBottom: 8 }} /><p style={featureTextStyle}>Meaningful Memories</p></div>
                <div style={featureCardStyle}><Lock size={20} style={{ marginBottom: 8 }} /><p style={featureTextStyle}>Private Access</p></div>
                <div style={featureCardStyle}><Sparkles size={20} style={{ marginBottom: 8 }} /><p style={featureTextStyle}>Soft Gallery</p></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
              <div style={loginCardStyle}>
                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <div style={lockCircleStyle}><Lock size={24} /></div>
                  <h2 style={{ fontSize: 28, margin: "10px 0 6px", color: "#35293a" }}>Login</h2>
                  <p style={{ color: "#7a6872", fontSize: 14 }}>Enter your private space.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    style={inputStyle}
                  />
                  <button onClick={handleLogin} style={primaryBtnStyle}>Enter</button>
                  {error && <p style={{ fontSize: 14, color: "#4f6fad", margin: 0 }}>{error}</p>}
                </div>

                <div style={hintBoxStyle}>
                  Default password: <strong>ourmemory</strong>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={headerCardStyle}>
              <div>
                <p style={headerMiniStyle}>PRIVATE JOURNAL</p>
                <h1 style={headerTitleStyle}>Our Lovely Archive</h1>
                <p style={headerDescStyle}>A quiet place for memories worth keeping.</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={handleSetPassword} style={secondaryBtnStyle}>Change Password</button>
                <button onClick={handleLogout} style={logoutBtnStyle}>Log Out</button>
              </div>
            </motion.div>

            <div style={mainGridStyle}>
              <div>
                <div style={formCardStyle}>
                  <div style={sectionHeaderRowStyle}>
                    <div>
                      <p style={{ margin: "0 0 6px", color: "#5e7398", fontSize: 14 }}>New Entry</p>
                      <h2 style={{ margin: 0, fontSize: 34, color: "#2f3e5c" }}>Add a Memory</h2>
                    </div>
                    <div style={tabSwitchStyle}>
                      <button onClick={() => setActiveTab("write")} style={activeTab === "write" ? activeTabBtnActiveStyle : activeTabBtnStyle}>Write</button>
                      <button onClick={() => setActiveTab("photos")} style={activeTab === "photos" ? activeTabBtnActiveStyle : activeTabBtnStyle}>Photos</button>
                    </div>
                  </div>

                  {activeTab === "write" ? (
                    <>
                      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />

                      <div style={uploadWrapStyle}>
                        <label style={uploadLabelStyle}>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                          Choose Photos
                        </label>
                        <div style={uploadHintStyle}>Upload one or more photos from your device.</div>
                        {imageFiles.length > 0 && (
                          <div style={previewGridStyle}>
                            {imageFiles.map((img, index) => (
                              <img key={index} src={img} alt={`preview-${index}`} style={previewImageStyle} />
                            ))}
                          </div>
                        )}
                      </div>

                      <textarea
                        placeholder="Write about the moment, your feelings, and what made it special"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        style={{ ...inputStyle, minHeight: 170, resize: "vertical", paddingTop: 14 }}
                      />

                      <button onClick={handleAddPost} style={primaryBtnStyle}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <Plus size={16} /> Save Memory
                        </span>
                      </button>

                      {error && <p style={{ fontSize: 14, color: "#4f6fad", margin: 0 }}>{error}</p>}

                      <div style={hintPinkStyle}>
                        This version is saved in your browser as a prototype.
                      </div>
                    </>
                  ) : (
                    <div style={photoLibraryStyle}>
                      <div style={libraryHeaderStyle}>
                        <h3 style={{ margin: 0, fontSize: 24, color: "#2f3e5c" }}>Photo Library</h3>
                        <span style={libraryCountStyle}>{recentPhotos.length} photos</span>
                      </div>
                      {recentPhotos.length > 0 ? (
                        <div style={libraryGridStyle}>
                          {recentPhotos.map((photo, index) => (
                            <button
                              key={`${photo.postId}-${photo.imageIndex}-${index}`}
                              onClick={() => openGallery(photo.images, photo.imageIndex, photo.title)}
                              style={libraryCardStyle}
                            >
                              <img src={photo.image} alt={photo.title} style={libraryImageStyle} />
                              <div style={libraryMetaStyle}>
                                <div style={libraryTitleStyle}>{photo.title}</div>
                                <div style={libraryDateStyle}>{formatDate(photo.date)}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div style={emptyLibraryStyle}>No photos yet. Add a memory to start your gallery.</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                <div style={memoriesHeaderStyle}>
                  <div>
                    <p style={{ margin: "0 0 6px", color: "#5e7398", fontSize: 14 }}>Your Collection</p>
                    <h2 style={{ margin: 0, fontSize: 30, color: "#2f3e5c" }}>Saved Memories</h2>
                  </div>
                  <button onClick={() => setActiveTab("write")} style={secondaryBtnStyle}>Add New</button>
                </div>
                {sortedPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                  >
                    <div style={postCardStyle}>
                      <div style={postGridStyle}>
                        <ImageSlider
                          images={post.images}
                          title={post.title}
                          onOpenGallery={(startIndex) => openGallery(post.images, startIndex, post.title)}
                        />

                        <div style={postBodyStyle}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                              <div>
                                <h3 style={postTitleStyle}>{post.title}</h3>
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, color: "#5c6f8f", fontSize: 14 }}>
                                  <CalendarDays size={16} />
                                  <span>{formatDate(post.date)}</span>
                                </div>
                              </div>
                              <button onClick={() => handleDelete(post.id)} style={iconGhostBtnStyle}>
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <p style={postTextStyle}>{post.text}</p>
                          </div>

                          <div style={savedRowStyle}>
                            <Heart size={16} fill="currentColor" />
                            <span>Saved in our archive</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {galleryOpen && (
        <GalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          title={galleryTitle}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

const sectionHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const tabSwitchStyle = {
  display: "flex",
  gap: 8,
  padding: 6,
  borderRadius: 999,
  background: "rgba(230, 237, 248, 0.9)",
};

const activeTabBtnStyle = {
  border: "none",
  background: "transparent",
  color: "#6b7f9d",
  padding: "10px 14px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 600,
};

const activeTabBtnActiveStyle = {
  border: "none",
  background: "white",
  color: "#36527f",
  padding: "10px 14px",
  borderRadius: 999,
  cursor: "pointer",
  fontWeight: 700,
  boxShadow: "0 6px 16px rgba(79,111,173,0.12)",
};

const photoLibraryStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const libraryHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const libraryCountStyle = {
  fontSize: 13,
  color: "#5c6f8f",
  background: "rgba(230, 237, 248, 0.9)",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 600,
};

const libraryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 12,
};

const libraryCardStyle = {
  border: "1px solid rgba(219, 230, 245, 0.95)",
  background: "rgba(255,255,255,0.95)",
  borderRadius: 18,
  overflow: "hidden",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  boxShadow: "0 12px 24px rgba(79,111,173,0.08)",
};

const libraryImageStyle = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  display: "block",
};

const libraryMetaStyle = {
  padding: 12,
};

const libraryTitleStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#2f3e5c",
  marginBottom: 4,
};

const libraryDateStyle = {
  fontSize: 12,
  color: "#6b7f9d",
};

const emptyLibraryStyle = {
  borderRadius: 18,
  padding: 20,
  background: "rgba(240,245,255,0.95)",
  color: "#5c6f8f",
  fontSize: 14,
  lineHeight: 1.7,
};

const uploadWrapStyle = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #dbe6f5",
  background: "rgba(255,255,255,0.9)",
  padding: 14,
  boxSizing: "border-box",
};

const uploadLabelStyle = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #eef4ff, #dfeafc)",
  color: "#36527f",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: 10,
};

const uploadHintStyle = {
  fontSize: 13,
  color: "#5c6f8f",
  marginBottom: 12,
};

const previewGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const previewImageStyle = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  border: "1px solid rgba(219, 230, 245, 0.95)",
};

const memoriesHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};
      </div>

      {galleryOpen && (
        <GalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          title={galleryTitle}
          onClose={() => setGalleryOpen(false)}
        />
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(180deg, #f4f7fb 0%, #eef2f7 35%, #e9edf3 70%, #f8fafc 100%)",
  color: "#2b2230",
};

const ambientGlowOneStyle = {
  position: "fixed",
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "rgba(170, 190, 230, 0.22)",
  filter: "blur(80px)",
  top: -80,
  left: -90,
  pointerEvents: "none",
};

const ambientGlowTwoStyle = {
  position: "fixed",
  width: 360,
  height: 360,
  borderRadius: "50%",
  background: "rgba(170, 200, 210, 0.24)",
  filter: "blur(80px)",
  bottom: -60,
  right: -50,
  pointerEvents: "none",
};

const containerStyle = {
  maxWidth: 1240,
  margin: "0 auto",
  padding: "36px 18px 54px",
  position: "relative",
  zIndex: 1,
};

const loginWrapStyle = {
  minHeight: "88vh",
  display: "grid",
  gridTemplateColumns: "1.06fr 0.94fr",
  gap: 34,
  alignItems: "center",
};

const topBadgeStyle = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.7)",
  border: "1px solid rgba(255,255,255,0.8)",
  fontSize: 13,
  letterSpacing: "0.18em",
  color: "#5f6f8a",
  fontWeight: 600,
  backdropFilter: "blur(10px)",
};

const heroTitleStyle = {
  fontSize: 78,
  lineHeight: 1,
  fontWeight: 700,
  margin: "0 0 18px",
  color: "#2f3e5c",
};

const gradientTextStyle = {
  display: "block",
  background: "linear-gradient(to right, #4f6fad, #6b8fd6, #3b4f80)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const heroDescStyle = {
  maxWidth: 630,
  fontSize: 18,
  lineHeight: 1.9,
  color: "#5d6f8c",
  margin: 0,
};

const featureGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
  marginTop: 28,
};

const featureCardStyle = {
  borderRadius: 26,
  border: "1px solid rgba(255,255,255,0.72)",
  background: "rgba(255,255,255,0.58)",
  boxShadow: "0 18px 34px rgba(145, 110, 126, 0.08)",
  backdropFilter: "blur(16px)",
  padding: 20,
  color: "#5e4a56",
};

const featureTextStyle = {
  margin: 0,
  fontSize: 14,
  fontWeight: 600,
};

const loginCardStyle = {
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.72)",
  background: "rgba(255,255,255,0.66)",
  boxShadow: "0 28px 60px rgba(111, 78, 93, 0.10)",
  backdropFilter: "blur(18px)",
  padding: 34,
};

const lockCircleStyle = {
  width: 60,
  height: 60,
  borderRadius: 999,
  background: "linear-gradient(135deg, #fde6ef, #f8ddd8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  color: "#4f6fad",
};

const inputStyle = {
  width: "100%",
  height: 50,
  padding: "12px 16px",
  borderRadius: 18,
  border: "1px solid #dbe6f5",
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
  background: "rgba(255,255,255,0.82)",
  color: "#2c3e57",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
};

const primaryBtnStyle = {
  height: 50,
  width: "100%",
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg, #3a2a35, #241923)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(43, 28, 38, 0.18)",
};

const secondaryBtnStyle = {
  height: 50,
  borderRadius: 18,
  border: "1px solid #e4d3db",
  background: "rgba(255,255,255,0.82)",
  color: "#3e2f39",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 20px",
};

const logoutBtnStyle = {
  height: 50,
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg, #352731, #221922)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 22px",
};

const hintBoxStyle = {
  borderRadius: 18,
  background: "rgba(236, 240, 248, 0.9)",
  padding: 16,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#866b79",
  marginTop: 16,
};

const headerCardStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.75)",
  background: "rgba(255,255,255,0.62)",
  padding: 28,
  boxShadow: "0 20px 40px rgba(128, 96, 112, 0.08)",
  backdropFilter: "blur(18px)",
};

const headerMiniStyle = {
  margin: "0 0 10px",
  fontSize: 12,
  letterSpacing: "0.26em",
  color: "#a08592",
};

const headerTitleStyle = {
  fontSize: 62,
  margin: "0 0 8px",
  lineHeight: 1,
  color: "#2f2430",
};

const headerDescStyle = {
  color: "#79646f",
  margin: 0,
  fontSize: 18,
};

const mainGridStyle = {
  display: "grid",
  gridTemplateColumns: "420px minmax(0, 1fr)",
  gap: 32,
};

const formCardStyle = {
  position: "sticky",
  top: 24,
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.75)",
  background: "rgba(255,255,255,0.66)",
  boxShadow: "0 20px 40px rgba(128, 96, 112, 0.08)",
  backdropFilter: "blur(18px)",
  padding: 26,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const uploadWrapStyle = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #dbe6f5",
  background: "rgba(255,255,255,0.9)",
  padding: 14,
  boxSizing: "border-box",
};

const uploadLabelStyle = {
  display: "inline-block",
  padding: "10px 14px",
  borderRadius: 14,
  background: "linear-gradient(135deg, #eef4ff, #dfeafc)",
  color: "#36527f",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: 10,
};

const uploadHintStyle = {
  fontSize: 13,
  color: "#5c6f8f",
  marginBottom: 12,
};

const previewGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 10,
};

const previewImageStyle = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  borderRadius: 14,
  border: "1px solid rgba(219, 230, 245, 0.95)",
};

const hintPinkStyle = {
  borderRadius: 18,
  background: "linear-gradient(135deg, rgba(232,238,250,0.95), rgba(240,245,255,0.95))",
  padding: 16,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#5d6f8c",
};

const postCardStyle = {
  overflow: "hidden",
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.76)",
  background: "rgba(255,255,255,0.68)",
  boxShadow: "0 22px 42px rgba(128, 96, 112, 0.08)",
  backdropFilter: "blur(18px)",
};

const postGridStyle = {
  display: "grid",
  gridTemplateColumns: "1.02fr 0.98fr",
};

const postBodyStyle = {
  padding: 34,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "linear-gradient(180deg, rgba(255,255,255,0.58), rgba(255,248,250,0.46))",
};

const postTitleStyle = {
  fontSize: 30,
  margin: 0,
  color: "#2f3e5c",
  lineHeight: 1.2,
};

const postTextStyle = {
  whiteSpace: "pre-wrap",
  fontSize: 15,
  lineHeight: 1.95,
  color: "#5c6f8f",
  margin: 0,
};

const iconGhostBtnStyle = {
  width: 38,
  height: 38,
  borderRadius: 999,
  border: "1px solid rgba(223, 204, 213, 0.7)",
  background: "rgba(255,255,255,0.72)",
  cursor: "pointer",
  color: "#5c6f8f",
};

const savedRowStyle = {
  marginTop: 24,
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  color: "#4f6fad",
};

const sliderWrapStyle = {
  position: "relative",
  minHeight: 360,
  overflow: "hidden",
  background: "#eef3fb",
};

const sliderImageStyle = {
  height: "100%",
  width: "100%",
  cursor: "pointer",
  objectFit: "cover",
  display: "block",
};

const imageOverlayStyle = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.06))",
  pointerEvents: "none",
};

const floatingBadgeRowStyle = {
  position: "absolute",
  left: 18,
  top: 18,
  display: "flex",
  gap: 8,
};

const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  background: "rgba(255,255,255,0.82)",
  color: "#5b4a57",
  padding: "9px 13px",
  fontSize: 12,
  fontWeight: 600,
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.75)",
};

const navBtnStyle = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 42,
  height: 42,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.45)",
  background: "rgba(43, 32, 40, 0.28)",
  color: "white",
  cursor: "pointer",
  backdropFilter: "blur(10px)",
};

const dotsWrapStyle = {
  position: "absolute",
  bottom: 18,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 8,
  borderRadius: 999,
  background: "rgba(43,32,40,0.22)",
  padding: "8px 12px",
  backdropFilter: "blur(10px)",
};

const countStyle = {
  position: "absolute",
  bottom: 18,
  right: 18,
  borderRadius: 999,
  background: "rgba(43,32,40,0.32)",
  padding: "5px 12px",
  fontSize: 12,
  color: "white",
  backdropFilter: "blur(10px)",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(32, 22, 30, 0.88)",
  padding: 16,
  backdropFilter: "blur(10px)",
};

const circleBtnStyle = {
  width: 48,
  height: 48,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.12)",
  color: "white",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const galleryMainImageWrapStyle = {
  overflow: "hidden",
  borderRadius: 30,
  background: "rgba(255,255,255,0.05)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
};

const galleryThumbRowStyle = {
  display: "flex",
  maxWidth: "65%",
  gap: 8,
  overflowX: "auto",
  borderRadius: 18,
  background: "rgba(255,255,255,0.08)",
  padding: 8,
};
