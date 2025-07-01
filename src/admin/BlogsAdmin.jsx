import React, { useState, useEffect } from "react";
import "../AdminDashboard.css";
import "./BlogsAdmin.css";
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
  apiKey: "AIzaSyAt2hBdvPBiq91odRqu9wGFVfdODX0wbxA",
  authDomain: "frugaltrail-7eb2c.firebaseapp.com",
  databaseURL: "https://frugaltrail-7eb2c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "frugaltrail-7eb2c",
  storageBucket: "frugaltrail-7eb2c.firebasestorage.app",
  messagingSenderId: "437021902208",
  appId: "1:437021902208:web:6da1c0d0e16adf6a2d6d65"
};
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Utility: Extract meta info from HTML string
const extractBlogMeta = (html) => {
  // Title
  const ogTitleMatch = html.match(/property=["']og:title["'] content=["']([^"']+)["']/i);
  let title = ogTitleMatch ? ogTitleMatch[1].trim() : "";
  if (!title) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    title = h1Match
      ? h1Match[1].replace(/<[^>]+>/g, "").trim()
      : "";
    if (!title) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : "";
    }
  }

  // Image
  const imgMatch = html.match(/property=["']og:image["'] content=["']([^"']+)["']/i);
  const image = imgMatch ? imgMatch[1] : "";

  // Excerpt
  const descMatch = html.match(/property=["']og:description["'] content=["']([^"']+)["']/i);
  const excerpt = descMatch ? descMatch[1] : "";

  // Category (optional)
  const catMatch = html.match(/property=["']article:section["'] content=["']([^"']+)["']/i);
  const category = catMatch ? catMatch[1] : "";

  return { title, image, excerpt, category };
};

const BlogsAdmin = ({ onBack }) => {
  const [blogs, setBlogs] = useState([]);
  const [showAddBlogOverlay, setShowAddBlogOverlay] = useState(false);
  const [blogForm, setBlogForm] = useState({ link: "" });
  const [editingBlog, setEditingBlog] = useState(null);
  const [editBlogForm, setEditBlogForm] = useState({ link: "" });
  const [firebaseBlogs, setFirebaseBlogs] = useState([]);
  const [firebaseBlogsMeta, setFirebaseBlogsMeta] = useState({});
  const [visibleCount, setVisibleCount] = useState(6);

  // Fetch blogs from Firebase
  useEffect(() => {
    const refBlogs = dbRef(database, "blogs");
    const unsubscribe = onValue(refBlogs, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setBlogs(arr.reverse());
        setFirebaseBlogs(arr.reverse());
      } else {
        setBlogs([]);
        setFirebaseBlogs([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch meta for each Firebase blog
  useEffect(() => {
    const fetchMeta = async () => {
      const metaObj = {};
      await Promise.all(
        firebaseBlogs.map(async (blog) => {
          try {
            const res = await fetch(
              `https://api.allorigins.win/get?url=${encodeURIComponent(blog.link)}`
            );
            const data = await res.json();
            const html = data.contents;
            metaObj[blog.id] = extractBlogMeta(html);
          } catch {
            metaObj[blog.id] = { title: "", image: "", excerpt: "", category: "" };
          }
        })
      );
      setFirebaseBlogsMeta(metaObj);
    };
    if (firebaseBlogs.length > 0) fetchMeta();
    else setFirebaseBlogsMeta({});
  }, [firebaseBlogs]);

  // Add Blog (store only link in Firebase)
  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.link) return;
    const refBlogs = dbRef(database, "blogs");
    const newRef = push(refBlogs);
    await set(newRef, { link: blogForm.link });
    setShowAddBlogOverlay(false);
    setBlogForm({ link: "" });
    alert("Blog added successfully!");
  };

  // Update Blog (update link in Firebase)
  const handleUpdateBlog = async (e) => {
    e.preventDefault();
    if (!editBlogForm.link || !editingBlog) return;
    await update(dbRef(database, `blogs/${editingBlog.id}`), { link: editBlogForm.link });
    setEditingBlog(null);
    setEditBlogForm({ link: "" });
    alert("Blog updated successfully!");
  };

  // Delete Blog
  const handleDeleteBlog = async (id) => {
    await remove(dbRef(database, `blogs/${id}`));
    alert("Blog deleted successfully!");
  };

  // Blog Card with dynamic meta fetch
  const BlogCard = ({ blog, meta }) => {
    return (
      <div className="blog-card" style={{ width: 370, margin: 0, opacity: 1 }}>
        <div className="blog-img-wrapper">
          {meta.image ? (
            <img src={meta.image} alt={meta.title} className="blog-img" />
          ) : (
            <div style={{ width: "100%", height: 180, background: "#eee" }} />
          )}
          <div className="blog-overlay">
            <a
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="read-more-btn"
            >
              Read More
            </a>
          </div>
        </div>
        <div style={{ padding: "1.5rem 1.5rem 1.2rem 1.5rem" }}>
          <div className="blog-title">{meta.title || "Loading..."}</div>
          <div className="blog-excerpt">{meta.excerpt}</div>
        </div>
        <div className="blog-actions">
          <button
            className="admin-update-btn"
            onClick={() => {
              setEditingBlog(blog);
              setEditBlogForm({ link: blog.link });
            }}
          >
            Update
          </button>
          <button
            className="admin-delete-btn"
            onClick={() => handleDeleteBlog(blog.id)}
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className="blog py-5" style={{ minHeight: "100vh" }}>
      <div className="blog-pattern"></div>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="section-title">All Blog Posts</h2>
          <div className="title-underline mx-auto"></div>
        </div>
        <div className="admin-main-row">
          <div className="admin-header-actions">
            {/* <button className="admin-back-btn" onClick={onBack}>
              Back to Dashboard
            </button> */}
            <button
              className="admin-action-btn"
              onClick={() => setShowAddBlogOverlay(true)}
            >
              + Add Blog
            </button>
          </div>
          <div className="blog-grid">
            {blogs.length === 0 && (
              <div style={{
                color: "#888",
                textAlign: "center",
                width: "100%",
                padding: "40px 0",
                fontSize: "1.1rem"
              }}>
                No blogs available.
              </div>
            )}
            {blogs.slice(0, visibleCount).map((blog) => (
              <BlogCard blog={blog} key={blog.id} meta={firebaseBlogsMeta[blog.id] || {}} />
            ))}
          </div>
          {visibleCount < blogs.length && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setVisibleCount(visibleCount + 6)}
              style={{ margin: "2rem auto 0 auto", display: "block" }}
            >
              Show More
            </button>
          )}
        </div>
      </div>

      {/* Add Blog Overlay */}
      {showAddBlogOverlay && (
        <div className="admin-overlay">
          <div className="admin-overlay-form">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button className="admin-back-btn" onClick={() => setShowAddBlogOverlay(false)}>
                ← Cancel
              </button>
              <h2 className="admin-form-title">Add Blog</h2>
              <span style={{ minWidth: 180 }}></span>
            </div>
            <form onSubmit={handleAddBlog}>
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label">Substack Blog Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={blogForm.link}
                    onChange={e => setBlogForm({ ...blogForm, link: e.target.value })}
                    placeholder="Paste Substack blog link here"
                    required
                  />
                </div>
              </div>
              <div className="text-end mt-4">
                <button type="submit" className="admin-action-btn" style={{ minWidth: 180 }}>
                  Add Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Blog Overlay */}
      {editingBlog && (
        <div className="admin-overlay">
          <div className="admin-overlay-form">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <button className="admin-back-btn" onClick={() => setEditingBlog(null)}>
                ← Cancel
              </button>
              <h2 className="admin-form-title">Update Blog</h2>
              <span style={{ minWidth: 180 }}></span>
            </div>
            <form onSubmit={handleUpdateBlog}>
              <div className="row g-4">
                <div className="col-md-12">
                  <label className="form-label">Substack Blog Link</label>
                  <input
                    type="url"
                    className="form-control"
                    value={editBlogForm.link}
                    onChange={e => setEditBlogForm({ ...editBlogForm, link: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="text-end mt-4">
                <button type="submit" className="admin-action-btn" style={{ minWidth: 180 }}>
                  Update Blog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogsAdmin;