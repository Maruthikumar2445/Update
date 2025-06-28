import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./HeroSection.css";
import logo from "./assets/2.png";

const HeroSection = () => (
  <section className="hero-section d-flex align-items-center justify-content-center text-center">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <img
            src={logo}
            alt="Admin Logo"
            className="hero-logo mb-4"
            style={{
              width: 90,
              height: 90,
              borderRadius: "50%",
              boxShadow: "0 4px 24px rgba(44,62,80,0.13)",
              background: "#fff",
              objectFit: "cover",
              border: "4px solid #1abc9c"
            }}
          />
          <h1 className="display-4 fw-bold mb-3 hero-title" style={{ color: "#1abc9c" }}>
            Welcome, Admin!
          </h1>
          <p className="lead mb-4 hero-desc" style={{ color: "#444" }}>
            Effortlessly <span className="highlight">add</span>, <span className="highlight">update</span>, and <span className="highlight">delete</span> content for your <b>Gallery</b>, <b>Testimonials</b>, and <b>Blogs</b>.<br />
            Manage your website’s dynamic sections with ease and professionalism.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/blogs" className="btn btn-success btn-lg shadow-sm px-4 rounded-pill">Blogs</Link>
            <Link to="/testimonials" className="btn btn-outline-info btn-lg shadow-sm px-4 rounded-pill">Testimonials</Link>
            <Link to="/gallery" className="btn btn-outline-primary btn-lg shadow-sm px-4 rounded-pill">Gallery</Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;