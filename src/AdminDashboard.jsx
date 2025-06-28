import React, { useState } from "react";
import BlogsAdmin from "./admin/BlogsAdmin";
import TestimonialsAdmin from "./admin/TestimonialsAdmin";
import GalleryAdmin from "./admin/GalleryAdmin";
import "./AdminDashboard.css";

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
				{activeSection === "blogs" && <BlogsAdmin />}
				{activeSection === "testimonials" && <TestimonialsAdmin />}
				{activeSection === "gallery" && <GalleryAdmin />}
			</main>
		</div>
	);
};

export default AdminDashboard;
