import React, { useState } from "react";
import BlogsAdmin from "./admin/BlogsAdmin";
import TestimonialsAdmin from "./admin/TestimonialsAdmin";
import GalleryAdmin from "./admin/GalleryAdmin";
import "./AdminDashboard.css";
import logo from "./assets/2.png"; // Adjust path if needed

const AdminDashboard = () => {
	const [activeSection, setActiveSection] = useState("blogs");

	return (
		<div className="admin-dashboard">
			<aside className="admin-sidebar">
				<div className="admin-sidebar-header">
					<h2>
						Welcome,
						<br />
						Admin
					</h2>
				</div>
				<button
					className={`admin-sidebar-btn${
						activeSection === "blogs" ? " active" : ""
					}`}
					onClick={() => setActiveSection("blogs")}
				>
					Blogs
				</button>
				<button
					className={`admin-sidebar-btn${
						activeSection === "testimonials" ? " active" : ""
					}`}
					onClick={() => setActiveSection("testimonials")}
				>
					Testimonials
				</button>
				<button
					className={`admin-sidebar-btn${
						activeSection === "gallery" ? " active" : ""
					}`}
					onClick={() => setActiveSection("gallery")}
				>
					Gallery
				</button>
			</aside>
			<main className="admin-main-content">
				<div className="admin-hero-modern">
					<div className="admin-hero-content">
						<img
							src={logo}
							alt="Admin Logo"
							className="admin-hero-logo"
							style={{
								width: 80,
								height: 80,
								borderRadius: "50%",
								boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
								background: "#fff",
								objectFit: "cover",
								border: "4px solid #1abc9c",
								marginBottom: 18,
							}}
						/>
						<h1 className="admin-hero-title">
							Welcome to Admin Dashboard
						</h1>
						<p className="admin-hero-desc">
							Manage Blogs, Gallery, and Testimonials with a modern, clean
							interface.
						</p>
					</div>
				</div>
				{activeSection === "blogs" && <BlogsAdmin />}
				{activeSection === "testimonials" && <TestimonialsAdmin />}
				{activeSection === "gallery" && <GalleryAdmin />}
			</main>
		</div>
	);
};

export default AdminDashboard;
