import React, { useState, useEffect } from "react";
import "../AdminDashboard.css";
import "./TestimonialsAdmin.css";
import bharathImg from "../assets/Bharath Kannan.png";
import vijayImg from "../assets/Vijayaraghavan Venkatadri.png";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  onValue,
  remove,
  update,
} from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBFfBeD_q7N5BHUSVUFjmp8N47ihLiMQDc",
  authDomain: "frugaltrailphotos.firebaseapp.com",
  projectId: "frugaltrailphotos",
  messagingSenderId: "387948789176",
  appId: "1:387948789176:web:2174d8a080369751de634d",
  databaseURL:
    "https://frugaltrailphotos-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const images = [bharathImg, vijayImg];

const TestimonialsAdmin = ({ onBack }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    quote: "",
    paragraph: "",
    rating: 5,
    location: "",
    image: null, // add image field
  });
  const [testimonialImagePreview, setTestimonialImagePreview] = useState(null);

  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [editTestimonialForm, setEditTestimonialForm] = useState({
    name: "",
    role: "",
    quote: "",
    paragraph: "",
    rating: 5,
    location: "",
  });

  const [expandedIds, setExpandedIds] = useState([]); // Track which testimonials are expanded

  // Load testimonials from Firebase
  useEffect(() => {
    const refTestimonials = dbRef(database, "testimonials");
    const unsubscribe = onValue(refTestimonials, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setTestimonials(arr.reverse());
      } else {
        setTestimonials([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Add Testimonial
  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (
      !testimonialForm.name ||
      !testimonialForm.quote ||
      !testimonialForm.paragraph
    )
      return;

    let photo = testimonialForm.image;
    if (!photo) {
      // fallback to random image if not uploaded
      photo = images[Math.floor(Math.random() * images.length)];
    }

    const refTestimonials = dbRef(database, "testimonials");
    const newRef = push(refTestimonials);
    await set(newRef, {
      ...testimonialForm,
      role: testimonialForm.role || "", // ensure string
      location: testimonialForm.location || "",
      image: photo,
    });
    setShowAddTestimonial(false);
    setTestimonialForm({
      name: "",
      role: "",
      quote: "",
      paragraph: "",
      rating: 5,
      location: "",
      image: null,
    });
    setTestimonialImagePreview(null);
    alert("Testimonial added!");
  };

  // Open Edit Overlay
  const handleEditClick = (t) => {
    setEditingTestimonial(t);
    setEditTestimonialForm({
      name: t.name,
      role: t.role,
      quote: t.quote,
      paragraph: t.paragraph,
      rating: t.rating,
      location: t.location,
    });
  };

  // Update Testimonial
  const handleUpdateTestimonial = async (e) => {
    e.preventDefault();
    if (!editingTestimonial) return;

    let updatedImage = editTestimonialForm.image;
    // If no new image uploaded, keep the old one
    if (!updatedImage) {
      updatedImage = editingTestimonial.image;
    }

    await update(dbRef(database, `testimonials/${editingTestimonial.id}`), {
      ...editTestimonialForm,
      image: updatedImage,
    });
    setEditingTestimonial(null);
    setEditTestimonialForm({
      name: "",
      role: "",
      quote: "",
      paragraph: "",
      rating: 5,
      location: "",
      image: null,
    });
  };

  // Delete Testimonial
  const handleDeleteTestimonial = async (id) => {
    await remove(dbRef(database, `testimonials/${id}`));
  };

  // Image upload handler for Add form
  const handleTestimonialImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTestimonialForm((prev) => ({
          ...prev,
          image: reader.result,
        }));
        setTestimonialImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Image upload handler for Edit form
  const handleEditTestimonialImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setEditTestimonialForm((prev) => ({
          ...prev,
          image: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle read more/less for a testimonial
  const handleToggleReadMore = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  };

  return (
    <section className="testimonials py-5" style={{ minHeight: "100vh" }}>
      <div className="bg-pattern"></div>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">All Testimonials</h2>
          <div className="title-underline mx-auto"></div>
        </div>
        <div className="admin-main-row">
          <div className="admin-header-actions">
            {/* <button className="admin-back-btn" onClick={onBack}>
              Back to Dashboard
            </button> */}
            <button
              className="admin-action-btn"
              onClick={() => setShowAddTestimonial(true)}
            >
              + Add Testimonial
            </button>
          </div>
          <div className="testimonials-grid">
            {testimonials.length === 0 && (
              <div
                style={{
                  color: "#888",
                  textAlign: "center",
                  width: "100%",
                  padding: "20px 0",
                }}
              >
                No testimonials available.
              </div>
            )}
            {testimonials.map((t) => {
              const isExpanded = expandedIds.includes(t.id);
              const maxLength = 180; // Number of characters to show before "Read more"
              const showReadMore = t.paragraph && t.paragraph.length > maxLength;
              const visibleText =
                showReadMore && !isExpanded
                  ? t.paragraph.slice(0, maxLength) + "..."
                  : t.paragraph;
              return (
                <div className="testimonial-card" key={t.id}>
                  <div className="testimonial-img-wrapper">
                    <img
                      src={t.image}
                      alt={t.name}
                      className="testimonial-img"
                      style={{ borderRadius: "10px", objectFit: "cover" }}
                    />
                  </div>
                  <div className="testimonial-author">{t.name}</div>
                  <div className="testimonial-role">{t.role}</div>
                  <div
                    className="testimonial-quote"
                    style={{
                      fontWeight: "bold",
                      fontFamily: "cursive",
                      color: "#1ABC9C", // Use the same teal as your site
                      fontSize: "1.15rem",
                      margin: "12px 0 8px 0",
                      lineHeight: 1.3,
                    }}
                  >
                    {t.quote}
                  </div>
                  <div
                    className="testimonial-content"
                    style={{
                      whiteSpace: "pre-line",
                      color: "#222", // Slightly darker for readability
                      fontSize: "1.01rem",
                      lineHeight: 1.7,
                      marginBottom: 8,
                      fontFamily: "inherit",
                    }}
                  >
                    {visibleText}
                    {showReadMore && (
                      <span
                        style={{
                          color: "#1ABC9C",
                          cursor: "pointer",
                          marginLeft: 4,
                          fontWeight: 500,
                        }}
                        onClick={() => handleToggleReadMore(t.id)}
                      >
                        {isExpanded ? "Read less" : "Read more"}
                      </span>
                    )}
                  </div>
                  <div
                    className="testimonial-location"
                    style={{ fontSize: "0.98rem", color: "#666" }}
                  >
                    {t.location}
                  </div>
                  <div className="testimonial-actions">
                    <button
                      className="admin-update-btn"
                      onClick={() => handleEditClick(t)}
                    >
                      Update
                    </button>
                    <button
                      className="admin-delete-btn"
                      onClick={() => handleDeleteTestimonial(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Testimonial Overlay */}
      {showAddTestimonial && (
        <div className="admin-overlay">
          <div className="admin-overlay-form">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                className="admin-back-btn"
                onClick={() => {
                  setShowAddTestimonial(false);
                  setTestimonialImagePreview(null);
                }}
              >
                ← Cancel
              </button>
              <h2 className="admin-form-title">Add Testimonial</h2>
              <span style={{ minWidth: 180 }}></span>
            </div>
            <form className="row g-3 mb-5" onSubmit={handleAddTestimonial}>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={testimonialForm.name}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Role{" "}
                  <span style={{ color: "#888" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={testimonialForm.role}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      role: e.target.value,
                    })
                  }
                  // not required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Quote (short heading)</label>
                <input
                  type="text"
                  className="form-control"
                  value={testimonialForm.quote}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      quote: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Paragraph (detailed feedback)</label>
                <textarea
                  className="form-control"
                  value={testimonialForm.paragraph}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      paragraph: e.target.value,
                    })
                  }
                  required
                  rows={5}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Location{" "}
                  <span style={{ color: "#888" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={testimonialForm.location}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      location: e.target.value,
                    })
                  }
                  // not required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Rating</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="form-control"
                  value={testimonialForm.rating}
                  onChange={(e) =>
                    setTestimonialForm({
                      ...testimonialForm,
                      rating: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">
                  Photo{" "}
                  <span style={{ color: "#888" }}>(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleTestimonialImageChange}
                />
                {testimonialImagePreview && (
                  <img
                    src={testimonialImagePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      marginTop: 10,
                      borderRadius: 8,
                      objectFit: "cover",
                      height: 120,
                    }}
                  />
                )}
              </div>
              <div className="col-12 text-end">
                <button
                  type="submit"
                  className="admin-action-btn"
                  style={{ marginRight: 8 }}
                >
                  Add
                </button>
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ background: "#eee", color: "#333" }}
                  onClick={() => {
                    setShowAddTestimonial(false);
                    setTestimonialImagePreview(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Testimonial Overlay */}
      {editingTestimonial && (
        <div className="admin-overlay">
          <div className="admin-overlay-form">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button
                className="admin-back-btn"
                onClick={() => setEditingTestimonial(null)}
              >
                ← Cancel
              </button>
              <h2 className="admin-form-title">Update Testimonial</h2>
              <span style={{ minWidth: 180 }}></span>
            </div>
            <form className="row g-3 mb-5" onSubmit={handleUpdateTestimonial}>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editTestimonialForm.name}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Role <span style={{ color: "#888" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={editTestimonialForm.role}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      role: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Quote (short heading)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editTestimonialForm.quote}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      quote: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Paragraph (detailed feedback)</label>
                <textarea
                  className="form-control"
                  value={editTestimonialForm.paragraph}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      paragraph: e.target.value,
                    })
                  }
                  required
                  rows={5}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  value={editTestimonialForm.location}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Rating</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="form-control"
                  value={editTestimonialForm.rating}
                  onChange={(e) =>
                    setEditTestimonialForm({
                      ...editTestimonialForm,
                      rating: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">
                  Photo <span style={{ color: "#888" }}>(optional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleEditTestimonialImageChange}
                />
                {(editTestimonialForm.image || editingTestimonial.image) && (
                  <img
                    src={editTestimonialForm.image || editingTestimonial.image}
                    alt="Preview"
                    style={{
                      width: "120px",
                      marginTop: 10,
                      borderRadius: 8,
                      objectFit: "cover",
                      height: 120,
                    }}
                  />
                )}
              </div>
              <div className="col-12 text-end">
                <button
                  type="submit"
                  className="admin-action-btn"
                  style={{ marginRight: 8 }}
                >
                  Update
                </button>
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ background: "#eee", color: "#333" }}
                  onClick={() => setEditingTestimonial(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default TestimonialsAdmin;