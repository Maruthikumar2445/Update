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
              + Add Gallery
            </button>
          </div>
          <div className="gallery-grid">
            {gallery.map(g => (
              <div className="gallery-card" key={g.id}>
                <div className="gallery-image-wrapper">
                  {/* Only show image if base64 exists and is valid */}
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
            ))}
          </div>
        </div>
        {showAddGallery && (
          <div className="admin-overlay">
            <div className="admin-overlay-form">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <button className="admin-back-btn" onClick={() => setShowAddGallery(false)}>
                  ← Cancel
                </button>
                <h2 className="admin-form-title">Add Photo</h2>
                <span style={{ minWidth: 180 }}></span>
              </div>
              <form className="row g-3 mb-5" onSubmit={handleAddGallery}>
                <div className="col-md-6">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    className="form-control"
                    value={galleryForm.destination}
                    onChange={e => setGalleryForm({ ...galleryForm, destination: e.target.value })}
                    // required removed
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
              </form>
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