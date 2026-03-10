import { supabase } from "./supabase";
import React, { useEffect, useMemo, useState } from "react";
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
  BookOpen,
  Sparkles,
} from "lucide-react";

const PASSWORD_KEY = "between_us_password";
const SESSION_KEY = "between_us_session";

const samplePosts = [
  {
    id: 1,
    title: "Soft Afternoon",
    date: "2026-03-09",
    text: "The light felt gentle, and everything about the day was quiet in the best way.",
    images: [
      "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
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

function normalizeDbPosts(posts) {
  return (posts || []).map((post) => ({
    ...post,
    images: Array.isArray(post.images)
      ? post.images
      : typeof post.images === "string"
      ? JSON.parse(post.images || "[]")
      : [],
  }));
}

function ImageSlider({ images, title, onOpenGallery, isMobile }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div style={{ ...sliderWrapStyle, minHeight: isMobile ? 280 : 360 }}>
      {images.length > 0 && (
        <img
          src={images[currentIndex]}
          alt={`${title} ${currentIndex + 1}`}
          style={{ ...sliderImageStyle, minHeight: isMobile ? 280 : 360 }}
          onClick={() => onOpenGallery(images, currentIndex, title)}
        />
      )}

      <div
        style={{
          ...floatingBadgeRowStyle,
          left: isMobile ? 12 : 18,
          top: isMobile ? 12 : 18,
        }}
      >
        <div
          style={{
            ...badgeStyle,
            padding: isMobile ? "7px 10px" : "9px 13px",
            fontSize: isMobile ? 11 : 12,
          }}
        >
          <ImageIcon size={13} style={{ marginRight: 6 }} />
          {images.length} Photos
        </div>
        <div
          style={{
            ...badgeStyle,
            padding: isMobile ? "7px 10px" : "9px 13px",
            fontSize: isMobile ? 11 : 12,
          }}
        >
          <ZoomIn size={13} style={{ marginRight: 6 }} />
          Open Gallery
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            style={{
              ...navBtnStyle,
              left: isMobile ? 10 : 18,
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
            }}
            type="button"
          >
            <ChevronLeft size={isMobile ? 18 : 20} />
          </button>
          <button
            onClick={nextSlide}
            style={{
              ...navBtnStyle,
              right: isMobile ? 10 : 18,
              width: isMobile ? 36 : 42,
              height: isMobile ? 36 : 42,
            }}
            type="button"
          >
            <ChevronRight size={isMobile ? 18 : 20} />
          </button>

          <div style={{ ...dotsWrapStyle, bottom: isMobile ? 12 : 18 }}>
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: 999,
                  border: "none",
                  background:
                    index === currentIndex
                      ? "#ffffff"
                      : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>

          <div
            style={{
              ...countStyle,
              bottom: isMobile ? 12 : 18,
              right: isMobile ? 12 : 18,
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}

function GalleryModal({ images, initialIndex, title, onClose, isMobile }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const session = localStorage.getItem("loggedIn") === "true";
    setLoggedIn(session);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === 0 ? images.length - 1 : prev - 1
        );
      }
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length, onClose]);

  const prev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const next = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div style={modalOverlayStyle}>
      <button
        onClick={onClose}
        style={{ ...circleBtnStyle, top: 20, right: 20, position: "absolute" }}
        type="button"
      >
        <X size={20} />
      </button>

      {images.length > 1 && !isMobile && (
        <button
          onClick={prev}
          style={{
            ...circleBtnStyle,
            left: 20,
            top: "50%",
            position: "absolute",
            transform: "translateY(-50%)",
          }}
          type="button"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      <div style={galleryCenterStyle}>
        <div style={galleryMainImageWrapStyle}>
          <img
            src={images[currentIndex]}
            alt={`${title} ${currentIndex + 1}`}
            style={{
              ...galleryMainImageStyle,
              maxHeight: isMobile ? "58vh" : "72vh",
            }}
          />
        </div>

        <div
          style={{
            ...galleryBottomRowStyle,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
          }}
        >
          <div style={{ color: "#ffffff" }}>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</p>
            <p
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.72)",
                margin: "4px 0 0",
              }}
            >
              {currentIndex + 1} / {images.length}
            </p>
          </div>

          <div
            style={{
              ...galleryThumbRowStyle,
              maxWidth: isMobile ? "100%" : "65%",
            }}
          >
            {images.map((img, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                style={{
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: 14,
                  border:
                    index === currentIndex
                      ? "2px solid white"
                      : "2px solid transparent",
                  padding: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <img src={img} alt={`thumb-${index}`} style={thumbStyle} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {images.length > 1 && !isMobile && (
        <button
          onClick={next}
          style={{
            ...circleBtnStyle,
            right: 20,
            top: "50%",
            position: "absolute",
            transform: "translateY(-50%)",
          }}
          type="button"
        >
          <ChevronRight size={24} />
        </button>
      )}
    </div>
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

  const [activeView, setActiveView] = useState("write");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || "ourmemory";
    const session = localStorage.getItem(SESSION_KEY) === "true";

    setPassword(savedPassword);
    setLoggedIn(session);
  }, []);

  useEffect(() => {
    async function loadPosts() {
      const { data, error } = await supabase
        .from("settings")
        .select("password")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Failed to load posts:", error);
        setPosts(samplePosts);
        return;
      }

      setPosts(normalizeDbPosts(data));
    }

    loadPosts();
  }, []);

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [posts]);

  const photoLibrary = useMemo(() => {
    return sortedPosts.flatMap((post) =>
      post.images.map((img, index) => ({
        image: img,
        title: post.title,
        date: post.date,
        images: post.images,
        imageIndex: index,
        postId: post.id,
      }))
    );
  }, [sortedPosts]);

const handleLogin = async () => {
  const { data, error } = await supabase
    .from("settings")
    .select("password")
    .eq("id", 1)
    .single();

  console.log("typed:", loginInput);
  console.log("db:", data?.password);

  if (error) {
    console.log("DB error:", error);
    alert("DB error");
    return;
  }

  if (loginInput.trim() === data.password.trim()) {
    setLoggedIn(true);
    localStorage.setItem("loggedIn", "true");
    setError("");
  } else {
    setError("Wrong password");
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

const handleAddPost = async () => {
  const newPost = {
    title,
    text,
    date,
    images: JSON.stringify(imageFiles),
  };

  const { data, error } = await supabase
    .from("posts")
    .insert([newPost])
    .select();

  console.log("save result:", data, error);

  if (error) {
    console.log(error);
    setError("저장 실패");
    return;
  }

  const savedPost = {
    ...data[0],
    images: Array.isArray(data[0].images)
      ? data[0].images
      : JSON.parse(data[0].images || "[]"),
  };

  setPosts((prev) => [savedPost, ...prev]);
  setTitle("");
  setDate("");
  setText("");
  setImageFiles([]);
  setError("");
};

  const handleDelete = async (id) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      console.error("Failed to delete post:", error);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const handleLogout = () => {
  localStorage.removeItem("loggedIn");
  setIsLoggedIn(false);
};

  const handleSetPassword = () => {
    const newPassword = prompt("Enter a new password.");
    if (newPassword && newPassword.trim()) {
      localStorage.setItem(PASSWORD_KEY, newPassword.trim());
      setPassword(newPassword.trim());
      alert("Password changed.");
    }
  };

  const openGallery = (images, index, titleText) => {
    setGalleryImages(images);
    setGalleryIndex(index);
    setGalleryTitle(titleText);
    setGalleryOpen(true);
  };

  const responsiveContainerStyle = {
    ...containerStyle,
    padding: isMobile ? "20px 14px 32px" : "36px 18px 54px",
  };

  const responsiveHeroTitleStyle = {
    ...heroTitleStyle,
    fontSize: isMobile ? 56 : 108,
    lineHeight: isMobile ? 1.02 : 0.95,
  };

  const responsiveHeroDescStyle = {
    ...heroDescStyle,
    fontSize: isMobile ? 18 : 24,
  };

  const responsiveMainGridStyle = {
    ...mainGridStyle,
    gridTemplateColumns: isMobile ? "1fr" : "420px minmax(0, 1fr)",
    gap: isMobile ? 20 : 32,
  };

  const responsivePostGridStyle = {
    ...postGridStyle,
    gridTemplateColumns: isMobile ? "1fr" : "1.02fr 0.98fr",
  };

  const responsiveHeaderTitleStyle = {
    ...headerTitleStyle,
    fontSize: isMobile ? 42 : 64,
  };

  const responsiveLoginSingleWrapStyle = {
    ...loginSingleWrapStyle,
    minHeight: isMobile ? "100vh" : "88vh",
    maxWidth: isMobile ? "100%" : 720,
  };

  const responsiveLoginCardStyle = {
    ...loginCardStyle,
    maxWidth: isMobile ? "100%" : 540,
    padding: isMobile ? 24 : 34,
  };

  const responsiveFormCardStyle = {
    ...formCardStyle,
    position: isMobile ? "static" : "sticky",
    top: isMobile ? "auto" : 24,
    padding: isMobile ? 20 : 26,
  };

  const responsivePostBodyStyle = {
    ...postBodyStyle,
    padding: isMobile ? 20 : 34,
  };

  const responsiveLibraryGridStyle = {
    ...libraryGridStyle,
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(2, minmax(0, 1fr))",
  };

  if (!loggedIn) {
    return (
      <div style={pageStyle}>
        <div style={ambientGlowOneStyle} />
        <div style={ambientGlowTwoStyle} />
        <div style={textureOverlayStyle} />

        <div style={responsiveContainerStyle}>
          <div style={responsiveLoginSingleWrapStyle}>
            <div style={loginHeroStyle}>
              <div style={topBadgeStyle}>Private Memory Archive</div>
              <h1 style={responsiveHeroTitleStyle}>Between Us</h1>
              <p style={responsiveHeroDescStyle}>
                A place to keep even the smallest moments.
              </p>
            </div>

            <div style={loginInfoCardStyle}>
              <div style={loginInfoTopStyle}>
                <Sparkles size={18} />
                <span>About this space</span>
              </div>
              <p style={loginInfoTextStyle}>
                Created as a quiet archive for the moments that feel small in
                the day, but stay with us for much longer.
              </p>
              <div style={loginInfoListStyle}>
                <div style={loginInfoItemStyle}>
                  <BookOpen size={16} />
                  <div>
                    <strong style={infoItemTitleStyle}>How to use</strong>
                    <p style={infoItemTextStyle}>
                      Write a memory, add photos, and keep each moment in one
                      place.
                    </p>
                  </div>
                </div>
                <div style={loginInfoItemStyle}>
                  <Heart size={16} />
                  <div>
                    <strong style={infoItemTitleStyle}>Why it exists</strong>
                    <p style={infoItemTextStyle}>
                      To give ordinary days a place to remain beautiful a little
                      longer.
                    </p>
                  </div>
                </div>
              </div>
              <p style={quoteStyle}>
                “Some moments become precious only after they are gently kept.”
              </p>
            </div>

            <div style={responsiveLoginCardStyle}>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={lockCircleStyle}>
                  <Lock size={24} />
                </div>
                <h2 style={loginTitleStyle}>Login</h2>
                <p style={loginSubStyle}>Enter your private space.</p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <input
                  type="password"
                  placeholder="Enter password"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  style={inputStyle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleLogin();
                  }}
                />
                <button
                  onClick={handleLogin}
                  style={primaryBtnStyle}
                  type="button"
                >
                  Enter
                </button>
                {error && <p style={errorTextStyle}>{error}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={ambientGlowOneStyle} />
      <div style={ambientGlowTwoStyle} />
      <div style={textureOverlayStyle} />

      <div style={responsiveContainerStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={headerCardStyle}>
            <div>
              <p style={headerMiniStyle}>PRIVATE JOURNAL</p>
              <h1 style={responsiveHeaderTitleStyle}>Between Us</h1>
              <p style={headerDescStyle}>
                A place to keep even the smallest moments.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={handleSetPassword}
                style={secondaryBtnStyle}
                type="button"
              >
                Change Password
              </button>
              <button
                onClick={handleLogout}
                style={logoutBtnStyle}
                type="button"
              >
                Log Out
              </button>
            </div>
          </div>

          <div style={responsiveMainGridStyle}>
            <div>
              <div style={responsiveFormCardStyle}>
                <div style={sectionHeaderRowStyle}>
                  <div>
                    <p style={smallLabelStyle}>Journal Space</p>
                    <h2 style={sectionTitleStyle}>
                      {activeView === "write"
                        ? "Write a Memory"
                        : activeView === "memories"
                        ? "Memory Notes"
                        : "Photo Library"}
                    </h2>
                  </div>

                  <div style={tabSwitchStyle}>
                    <button
                      type="button"
                      onClick={() => setActiveView("write")}
                      style={
                        activeView === "write"
                          ? activeTabBtnActiveStyle
                          : activeTabBtnStyle
                      }
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("memories")}
                      style={
                        activeView === "memories"
                          ? activeTabBtnActiveStyle
                          : activeTabBtnStyle
                      }
                    >
                      Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveView("photos")}
                      style={
                        activeView === "photos"
                          ? activeTabBtnActiveStyle
                          : activeTabBtnStyle
                      }
                    >
                      Photos
                    </button>
                  </div>
                </div>

                {activeView === "write" && (
                  <>
                    <div style={softPanelStyle}>
                      <p style={softPanelTitleStyle}>Why this journal exists</p>
                      <p style={softPanelTextStyle}>
                        A quiet place to hold the days that may seem ordinary
                        now, but become beautiful when looked back on later.
                      </p>
                    </div>

                    <input
                      placeholder="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={inputStyle}
                    />

                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={inputStyle}
                    />

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

                      <div style={uploadHintStyle}>
                        Upload one or more photos from your device.
                      </div>

                      {imageFiles.length > 0 && (
                        <div style={previewGridStyle}>
                          {imageFiles.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`preview-${index}`}
                              style={previewImageStyle}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <textarea
                      placeholder="Write about the moment, your feelings, and what made it special"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      style={textareaStyle}
                    />

                    <button
                      onClick={handleAddPost}
                      style={primaryBtnStyle}
                      type="button"
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Plus size={16} />
                        Save Memory
                      </span>
                    </button>

                    {error && <p style={errorTextStyle}>{error}</p>}
                  </>
                )}

                {activeView === "memories" && (
                  <div style={panelWrapStyle}>
                    <div style={panelHeaderStyle}>
                      <h3 style={libraryTitleHeadingStyle}>Memory Notes</h3>
                      <span style={libraryCountStyle}>
                        {sortedPosts.length} notes
                      </span>
                    </div>

                    {sortedPosts.length > 0 ? (
                      <div style={notesListStyle}>
                        {sortedPosts.map((post) => (
                          <div key={`note-${post.id}`} style={noteCardStyle}>
                            <div style={noteTitleStyle}>{post.title}</div>
                            <div style={noteDateStyle}>
                              {formatDate(post.date)}
                            </div>
                            <div style={notePreviewStyle}>{post.text}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={emptyLibraryStyle}>
                        No notes yet. Add your first memory.
                      </div>
                    )}
                  </div>
                )}

                {activeView === "photos" && (
                  <div style={photoLibraryStyle}>
                    <div style={libraryHeaderStyle}>
                      <h3 style={libraryTitleHeadingStyle}>Photo Library</h3>
                      <span style={libraryCountStyle}>
                        {photoLibrary.length} photos
                      </span>
                    </div>

                    {photoLibrary.length > 0 ? (
                      <div style={responsiveLibraryGridStyle}>
                        {photoLibrary.map((photo, index) => (
                          <button
                            key={`${photo.postId}-${photo.imageIndex}-${index}`}
                            type="button"
                            onClick={() =>
                              openGallery(
                                photo.images,
                                photo.imageIndex,
                                photo.title
                              )
                            }
                            style={libraryCardStyle}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-4px)";
                              e.currentTarget.style.boxShadow =
                                "0 18px 30px rgba(79,111,173,0.12)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 12px 24px rgba(79,111,173,0.08)";
                            }}
                          >
                            <img
                              src={photo.image}
                              alt={photo.title}
                              style={libraryImageStyle}
                            />
                            <div style={libraryMetaStyle}>
                              <div style={libraryTitleStyle}>{photo.title}</div>
                              <div style={libraryDateStyle}>
                                {formatDate(photo.date)}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div style={emptyLibraryStyle}>
                        No photos yet. Add a memory to start your gallery.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
              <div style={memoriesHeaderStyle}>
                <div>
                  <p style={smallLabelStyle}>Your Collection</p>
                  <h2 style={memoriesTitleStyle}>Saved Memories</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveView("write")}
                  style={secondaryBtnStyle}
                >
                  Add New
                </button>
              </div>              
              {sortedPosts.map((post) => (
                <div
                  key={post.id}
                  style={postCardStyle}
                  onMouseEnter={(e) => {
                    if (!isMobile) {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 28px 48px rgba(79,111,173,0.12)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 22px 42px rgba(79, 111, 173, 0.08)";
                  }}
                >
                  <div style={responsivePostGridStyle}>
                    <ImageSlider
                      images={post.images}
                      title={post.title}
                      onOpenGallery={openGallery}
                      isMobile={isMobile}
                    />

                    <div style={responsivePostBodyStyle}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                            alignItems: "flex-start",
                          }}
                        >
                          <div>
                            <h3 style={postTitleStyle}>{post.title}</h3>
                            <div style={postDateRowStyle}>
                              <CalendarDays size={16} />
                              <span>{formatDate(post.date)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDelete(post.id)}
                            style={iconGhostBtnStyle}
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <p style={postTextStyle}>{post.text}</p>
                      </div>

                      <div style={savedRowStyle}>
                        <Heart size={14} fill="currentColor" />
                        <span>Saved in archive</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {sortedPosts.length === 0 && (
                <div style={emptyLibraryStyle}>
                  No memories yet. Start with your first entry.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <GalleryModal
          images={galleryImages}
          initialIndex={galleryIndex}
          title={galleryTitle}
          onClose={() => setGalleryOpen(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(244,247,251,0.95) 0%, rgba(238,242,247,0.95) 35%, rgba(233,237,243,0.96) 70%, rgba(248,250,252,0.98) 100%)",
  color: "#2b2230",
};

const textureOverlayStyle = {
  position: "fixed",
  inset: 0,
  background:
    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.55), transparent 28%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.35), transparent 24%), radial-gradient(circle at 70% 80%, rgba(220,230,248,0.18), transparent 22%)",
  pointerEvents: "none",
};

const ambientGlowOneStyle = {
  position: "fixed",
  width: 420,
  height: 420,
  borderRadius: "50%",
  background: "rgba(170, 190, 230, 0.18)",
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
  background: "rgba(170, 200, 210, 0.18)",
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

const loginSingleWrapStyle = {
  minHeight: "88vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  gap: 28,
  maxWidth: 720,
};

const loginHeroStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const loginInfoCardStyle = {
  borderRadius: 30,
  border: "1px solid rgba(255,255,255,0.82)",
  background: "rgba(255,255,255,0.56)",
  boxShadow: "0 24px 50px rgba(79, 111, 173, 0.08)",
  backdropFilter: "blur(18px)",
  padding: 26,
  maxWidth: 720,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const loginInfoTopStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  color: "#4f6fad",
  fontSize: 14,
  fontWeight: 700,
};

const loginInfoTextStyle = {
  margin: 0,
  color: "#5d6f8c",
  fontSize: 16,
  lineHeight: 1.8,
};

const loginInfoListStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 14,
};

const loginInfoItemStyle = {
  display: "flex",
  gap: 12,
  alignItems: "flex-start",
  color: "#4f6fad",
};

const infoItemTitleStyle = {
  display: "block",
  color: "#2f3e5c",
  marginBottom: 4,
};

const infoItemTextStyle = {
  margin: 0,
  color: "#5d6f8c",
  fontSize: 14,
  lineHeight: 1.7,
};

const quoteStyle = {
  margin: 0,
  color: "#6b7f9d",
  fontSize: 15,
  lineHeight: 1.8,
  fontStyle: "italic",
};

const softPanelStyle = {
  borderRadius: 20,
  padding: 16,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.82), rgba(239,245,255,0.78))",
  border: "1px solid rgba(219,230,245,0.95)",
};

const softPanelTitleStyle = {
  margin: "0 0 6px",
  fontSize: 14,
  fontWeight: 700,
  color: "#36527f",
};

const softPanelTextStyle = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.7,
  color: "#5c6f8f",
};

const topBadgeStyle = {
  display: "inline-block",
  padding: "9px 16px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.72)",
  border: "1px solid rgba(255,255,255,0.9)",
  fontSize: 13,
  letterSpacing: "0.18em",
  color: "#5f6f8a",
  fontWeight: 600,
  backdropFilter: "blur(10px)",
  width: "fit-content",
};

const heroTitleStyle = {
  fontSize: 108,
  lineHeight: 0.95,
  fontWeight: 700,
  margin: 0,
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
  letterSpacing: "0.02em",
};

const heroDescStyle = {
  maxWidth: 680,
  fontSize: 24,
  lineHeight: 1.6,
  color: "#5d6f8c",
  margin: 0,
  fontFamily: "Inter, sans-serif",
};

const loginCardStyle = {
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.82)",
  background: "rgba(255,255,255,0.68)",
  boxShadow: "0 28px 60px rgba(79, 111, 173, 0.10)",
  backdropFilter: "blur(18px)",
  padding: 34,
  maxWidth: 540,
};

const lockCircleStyle = {
  width: 60,
  height: 60,
  borderRadius: 999,
  background: "linear-gradient(135deg, #eef4ff, #dfeafc)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto",
  color: "#4f6fad",
};

const loginTitleStyle = {
  fontSize: 28,
  margin: "10px 0 6px",
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
};

const loginSubStyle = {
  color: "#5d6f8c",
  fontSize: 14,
  margin: 0,
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
  background: "rgba(255,255,255,0.92)",
  color: "#2c3e57",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.65)",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: 170,
  resize: "vertical",
  paddingTop: 14,
  height: "auto",
};

const primaryBtnStyle = {
  height: 50,
  width: "100%",
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg, #4f6fad, #3b4f80)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(79, 111, 173, 0.18)",
};

const secondaryBtnStyle = {
  height: 50,
  borderRadius: 18,
  border: "1px solid #dbe6f5",
  background: "rgba(255,255,255,0.9)",
  color: "#36527f",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 20px",
};

const logoutBtnStyle = {
  height: 50,
  borderRadius: 18,
  border: "none",
  background: "linear-gradient(135deg, #4f6fad, #3b4f80)",
  color: "white",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
  padding: "0 22px",
};

const errorTextStyle = {
  fontSize: 14,
  color: "#4f6fad",
  margin: 0,
};

const headerCardStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  justifyContent: "space-between",
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.85)",
  background: "rgba(255,255,255,0.68)",
  padding: 28,
  boxShadow: "0 20px 40px rgba(79, 111, 173, 0.08)",
  backdropFilter: "blur(18px)",
};

const headerMiniStyle = {
  margin: "0 0 10px",
  fontSize: 12,
  letterSpacing: "0.26em",
  color: "#5e7398",
};

const headerTitleStyle = {
  fontSize: 64,
  margin: "0 0 10px",
  lineHeight: 1,
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
  letterSpacing: "0.03em",
};

const headerDescStyle = {
  color: "#6b7f9d",
  margin: 0,
  fontSize: 18,
  fontFamily: "Inter, sans-serif",
  letterSpacing: "0.04em",
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
  border: "1px solid rgba(255,255,255,0.85)",
  background: "rgba(255,255,255,0.72)",
  boxShadow: "0 20px 40px rgba(79, 111, 173, 0.08)",
  backdropFilter: "blur(18px)",
  padding: 26,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const sectionHeaderRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
  flexWrap: "wrap",
};

const smallLabelStyle = {
  margin: "0 0 6px",
  color: "#5e7398",
  fontSize: 14,
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 34,
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
};

const tabSwitchStyle = {
  display: "flex",
  gap: 8,
  padding: 6,
  borderRadius: 999,
  background: "rgba(230, 237, 248, 0.9)",
  flexWrap: "wrap",
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

const uploadWrapStyle = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #dbe6f5",
  background: "rgba(255,255,255,0.95)",
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

const panelWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
};

const notesListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const noteCardStyle = {
  border: "1px solid rgba(219, 230, 245, 0.95)",
  background: "rgba(255,255,255,0.98)",
  borderRadius: 18,
  padding: 16,
  textAlign: "left",
  boxShadow: "0 12px 24px rgba(79,111,173,0.06)",
};

const noteTitleStyle = {
  fontSize: 16,
  fontWeight: 700,
  color: "#2f3e5c",
  marginBottom: 6,
  fontFamily: "Playfair Display, serif",
};

const noteDateStyle = {
  fontSize: 12,
  color: "#6b7f9d",
  marginBottom: 8,
};

const notePreviewStyle = {
  fontSize: 13,
  color: "#5c6f8f",
  lineHeight: 1.7,
  display: "-webkit-box",
  WebkitLineClamp: 3,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
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

const libraryTitleHeadingStyle = {
  margin: 0,
  fontSize: 24,
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
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
  background: "rgba(255,255,255,0.98)",
  borderRadius: 18,
  overflow: "hidden",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
  boxShadow: "0 12px 24px rgba(79,111,173,0.08)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
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

const memoriesHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const memoriesTitleStyle = {
  margin: 0,
  fontSize: 30,
  color: "#2f3e5c",
  fontFamily: "Playfair Display, serif",
};

const postCardStyle = {
  overflow: "hidden",
  borderRadius: 34,
  border: "1px solid rgba(255,255,255,0.86)",
  background: "rgba(255,255,255,0.74)",
  boxShadow: "0 22px 42px rgba(79, 111, 173, 0.08)",
  backdropFilter: "blur(18px)",
  transition: "transform 0.22s ease, box-shadow 0.22s ease",
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
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.66), rgba(248,251,255,0.56))",
};

const postTitleStyle = {
  fontSize: 30,
  margin: 0,
  color: "#2f3e5c",
  lineHeight: 1.2,
  fontFamily: "Playfair Display, serif",
};

const postDateRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 8,
  color: "#5c6f8f",
  fontSize: 14,
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
  border: "1px solid rgba(219, 230, 245, 0.95)",
  background: "rgba(255,255,255,0.88)",
  cursor: "pointer",
  color: "#5c6f8f",
};

const savedRowStyle = {
  marginTop: 18,
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  color: "#4f6fad",
};

const sliderWrapStyle = {
  position: "relative",
  minHeight: 360,
  overflow: "hidden",
  background: "#eef3fb",
};

const sliderImageStyle = {
  width: "100%",
  height: "100%",
  minHeight: 360,
  objectFit: "cover",
  display: "block",
  cursor: "pointer",
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
  background: "rgba(255,255,255,0.86)",
  color: "#5b6f90",
  padding: "9px 13px",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid rgba(255,255,255,0.85)",
  backdropFilter: "blur(10px)",
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
  background: "rgba(59, 79, 128, 0.28)",
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
  background: "rgba(59,79,128,0.22)",
  padding: "8px 12px",
  backdropFilter: "blur(10px)",
};

const countStyle = {
  position: "absolute",
  bottom: 18,
  right: 18,
  borderRadius: 999,
  background: "rgba(59,79,128,0.32)",
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
  background: "rgba(24, 34, 54, 0.88)",
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

const galleryCenterStyle = {
  margin: "0 auto",
  display: "flex",
  maxHeight: "92vh",
  width: "100%",
  maxWidth: 1150,
  flexDirection: "column",
  gap: 16,
};

const galleryMainImageWrapStyle = {
  overflow: "hidden",
  borderRadius: 30,
  background: "rgba(255,255,255,0.05)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.35)",
};

const galleryMainImageStyle = {
  maxHeight: "72vh",
  width: "100%",
  objectFit: "contain",
  display: "block",
};

const galleryBottomRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
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

const thumbStyle = {
  height: 68,
  width: 68,
  objectFit: "cover",
  display: "block",
};