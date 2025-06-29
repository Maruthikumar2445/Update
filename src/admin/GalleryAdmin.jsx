import React, { useState, useEffect } from "react";
import "../AdminDashboard.css";
import "./GalleryAdmin.css";
import { initializeApp } from "firebase/app";
import { getDatabase, ref as dbRef, push, set, onValue, remove, update } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFfBeD_q7N5BHUSVUFjmp8N47ihLiMQDc",
  authDomain: "frugaltrailphotos.firebaseapp.com",
  projectId: "frugaltrailphotos",
  messagingSenderId: "387948789176",
  appId: "1:387948789176:web:2174d8a080369751de634d",
  databaseURL: "https://frugaltrailphotos-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const GalleryAdmin = ({ onBack }) => {
  const [gallery, setGallery] = useState([]);
  const [showAddGallery, setShowAddGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({ destination: "", file: null, base64: "" });
  const [galleryImagePreview, setGalleryImagePreview] = useState(null);
  const [editingGallery, setEditingGallery] = useState(null);
  const [editGalleryForm, setEditGalleryForm] = useState({
    destination: "",
    file: null,
    base64: "",
    imagePreview: ""
  });
  const [viewType, setViewType] = useState("photo"); // "photo" or "video"
  const [videoForm, setVideoForm] = useState({ url: "" });
  const [galleryVideos, setGalleryVideos] = useState([]);

  // Load gallery from Realtime Database
  useEffect(() => {
    const galleryDbRef = dbRef(database, "gallery");
    const unsubscribe = onValue(galleryDbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const images = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setGallery(images.reverse());
      } else {
        setGallery([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load videos from Realtime Database
  useEffect(() => {
    const videosDbRef = dbRef(database, "galleryVideos");
    const unsubscribe = onValue(videosDbRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const videos = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setGalleryVideos(videos.reverse());
      } else {
        setGalleryVideos([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Convert image to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Image upload handler
  const handleGalleryImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setGalleryForm({ ...galleryForm, file, base64 });
      setGalleryImagePreview(base64);
    }
  };

  // Add Gallery
  const handleAddGallery = async (e) => {
    e.preventDefault();
    if (!galleryForm.base64) return;

    try {
      const galleryDbRef = dbRef(database, "gallery");
      const newGalleryRef = push(galleryDbRef);
      await set(newGalleryRef, {
        destination: galleryForm.destination || "Untitled",
        base64: galleryForm.base64
      });

      setShowAddGallery(false);
      setGalleryForm({ destination: "", file: null, base64: "" });
      setGalleryImagePreview(null);
      alert("Added successfully!");
    } catch (error) {
      alert("Failed to upload image");
    }
  };

  // Delete Gallery
  const handleDeleteGallery = async (id) => {
    try {
      await remove(dbRef(database, `gallery/${id}`));
    } catch (error) {
      alert("Failed to delete image");
    }
  };

  // Update Gallery
  const handleUpdateGallery = async (e) => {
    e.preventDefault();
    if (!editingGallery || !editGalleryForm.destination) return;

    try {
      let base64 = editingGallery.base64;
      if (editGalleryForm.file) {
        base64 = await fileToBase64(editGalleryForm.file);
      }

      await update(dbRef(database, `gallery/${editingGallery.id}`), {
        destination: editGalleryForm.destination,
        base64
      });

      setEditingGallery(null);
      setEditGalleryForm({ destination: "", file: null, base64: "", imagePreview: "" });
    } catch (error) {
      alert("Failed to update image");
    }
  };

  // Add Video
  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!videoForm.url) return;
    try {
      const videosDbRef = dbRef(database, "galleryVideos");
      const newVideoRef = push(videosDbRef);
      await set(newVideoRef, {
        url: videoForm.url
      });
      setShowAddGallery(false);
      setVideoForm({ url: "" });
      alert("Video added successfully!");
    } catch (error) {
      alert("Failed to add video");
    }
  };

  const handleDeleteVideo = async (id) => {
    try {
      await remove(dbRef(database, `galleryVideos/${id}`));
    } catch (error) {
      alert("Failed to delete video");
    }
  };

  function getEmbedUrl(url) {
    // YouTube
    if (url.includes("youtube.com/watch?v=")) {
      const id = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (url.includes("vimeo.com/")) {
      const id = url.split("vimeo.com/")[1].split(/[?/]/)[0];
      return `https://player.vimeo.com/video/${id}`;
    }
    // Google Drive
    if (url.includes("drive.google.com")) {
      // Handles both open?id= and file/d/ links
      let id = "";
      if (url.includes("/file/d/")) {
        id = url.split("/file/d/")[1].split("/")[0];
      } else if (url.includes("id=")) {
        id = url.split("id=")[1].split("&")[0];
      }
      if (id) {
        return `https://drive.google.com/file/d/${id}/preview`;
      }
    }
    // Default: return original (may fail)
    return url;
  }

  return (
    <section className="gallery-section" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">All Gallery Photos</h2>
          <div className="title-underline mx-auto"></div>
        </div>
        <div className="admin-main-row">
          <div className="admin-header-actions">
            {/* <button className="admin-back-btn" onClick={onBack}>
              Back to Dashboard
            </button> */}
            <button
              className="admin-action-btn"
              onClick={() => setShowAddGallery(true)}
            >
              {viewType === "photo" ? "+ Add Photo" : "+ Add Video"}
            </button>
          </div>
          {/* Toggle above grid */}
          <div className="mb-4 d-flex gap-2 justify-content-center">
            <button
              className={`toggle-btn ${viewType === "photo" ? "active" : ""}`}
              onClick={() => setViewType("photo")}
            >
              Photos
            </button>
            <button
              className={`toggle-btn ${viewType === "video" ? "active" : ""}`}
              onClick={() => setViewType("video")}
            >
              Videos
            </button>
          </div>

          <div className="gallery-grid">
            {viewType === "photo" && (
              gallery.length === 0 ? (
                <div style={{
                  color: "#888",
                  textAlign: "center",
                  width: "100%",
                  padding: "40px 0",
                  fontSize: "1.1rem"
                }}>
                  No photos available.
                </div>
              ) : (
                gallery.map(g => (
                  <div className="gallery-card" key={g.id}>
                    <div className="gallery-image-wrapper">
                      {g.base64 && g.base64.startsWith("data:image") ? (
                        <img src={g.base64} alt={g.destination} />
                      ) : (
                        <div style={{color: "#888", textAlign: "center"}}>No Image</div>
                      )}
                    </div>
                    <div className="gallery-title">{g.destination}</div>
                    <div className="gallery-actions">
                      <button className="admin-update-btn" onClick={() => {
                        setEditingGallery(g);
                        setEditGalleryForm({
                          destination: g.destination,
                          file: null,
                          base64: g.base64,
                          imagePreview: g.base64
                        });
                      }}>Update</button>
                      <button 
                        className="admin-delete-btn" 
                        onClick={() => handleDeleteGallery(g.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
            {viewType === "video" && (
              galleryVideos.length === 0 ? (
                <div style={{
                  color: "#888",
                  textAlign: "center",
                  width: "100%",
                  padding: "40px 0",
                  fontSize: "1.1rem"
                }}>
                  No videos available.
                </div>
              ) : (
                galleryVideos.map(v => (
                  <div className="gallery-card" key={v.id}>
                    <div className="gallery-image-wrapper" style={{padding: 0, height: 180}}>
                      <iframe
                        src={getEmbedUrl(v.url)}
                        title="Gallery Video"
                        style={{ width: "100%", height: "100%", border: 0, borderRadius: 8 }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="gallery-title">Video</div>
                    <div className="gallery-actions">
                      {/* Optionally add update button here if you want */}
                      <button 
                        className="admin-delete-btn" 
                        onClick={() => handleDeleteVideo(v.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>
        {showAddGallery && (
          <div className="admin-overlay">
            <div className="admin-overlay-form">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="admin-back-btn" onClick={() => setShowAddGallery(false)}>
                  ← Cancel
                </button>
                <h2 className="admin-form-title">
                  Add {viewType === "photo" ? "Photo" : "Video"}
                </h2>
                <span style={{ minWidth: 180 }}></span>
              </div>
              {viewType === "photo" ? (
                <form onSubmit={handleAddGallery}>
                  <div className="row g-3 mb-5">
                    <div className="col-md-6">
                      <label className="form-label">Destination</label>
                      <input
                        type="text"
                        className="form-control"
                        value={galleryForm.destination}
                        onChange={e => setGalleryForm({ ...galleryForm, destination: e.target.value })}
                        placeholder="Optional"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        onChange={handleGalleryImageChange}
                        required
                      />
                      {galleryImagePreview && (
                        <img
                          src={galleryImagePreview}
                          alt="Preview"
                          style={{ width: "100%", marginTop: 10, borderRadius: 8, objectFit: "cover", height: 120 }}
                        />
                      )}
                    </div>
                    <div className="col-12 text-end">
                      <button type="submit" className="admin-action-btn" style={{ marginRight: 8 }}>
                        Add
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        style={{ background: "#eee", color: "#333" }}
                        onClick={() => {
                          setShowAddGallery(false);
                          setGalleryImagePreview(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddVideo}>
                  <div className="row g-3 mb-5">
                    <div className="col-md-12">
                      <label className="form-label">Video URL (YouTube/Vimeo)</label>
                      <input
                        type="url"
                        className="form-control"
                        value={videoForm.url}
                        onChange={e => setVideoForm({ url: e.target.value })}
                        required
                        placeholder="Paste video URL here"
                      />
                    </div>
                    <div className="col-12 text-end">
                      <button type="submit" className="admin-action-btn" style={{ marginRight: 8 }}>
                        Add
                      </button>
                      <button
                        type="button"
                        className="admin-action-btn"
                        style={{ background: "#eee", color: "#333" }}
                        onClick={() => {
                          setShowAddGallery(false);
                          setVideoForm({ url: "" });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Update Overlay */}
        {editingGallery && (
          <div className="admin-overlay">
            <div className="admin-overlay-form">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="admin-back-btn" onClick={() => setEditingGallery(null)}>
                  ← Cancel
                </button>
                <h2 className="admin-form-title">Update Photo</h2>
                <span style={{ minWidth: 180 }}></span>
              </div>
              <form className="row g-3 mb-5" onSubmit={handleUpdateGallery}>
                <div className="col-md-6">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editGalleryForm.destination}
                    onChange={e => setEditGalleryForm({ ...editGalleryForm, destination: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    onChange={async e => {
                      const file = e.target.files[0];
                      if (file) {
                        const base64 = await fileToBase64(file);
                        setEditGalleryForm({
                          ...editGalleryForm,
                          file,
                          base64,
                          imagePreview: base64
                        });
                      }
                    }}
                  />
                  {editGalleryForm.imagePreview && (
                    <img
                      src={editGalleryForm.imagePreview}
                      alt="Preview"
                      style={{ width: "100%", marginTop: 10, borderRadius: 8, objectFit: "cover", height: 120 }}
                    />
                  )}
                </div>
                <div className="col-12 text-end">
                  <button type="submit" className="admin-action-btn" style={{ marginRight: 8 }}>
                    Update
                  </button>
                  <button
                    type="button"
                    className="admin-action-btn"
                    style={{ background: "#eee", color: "#333" }}
                    onClick={() => setEditingGallery(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryAdmin;