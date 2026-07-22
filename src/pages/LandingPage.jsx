import "../styles/LandingPage.css";
import { useState, useEffect } from "react";
import {Link, useNavigate} from "react-router-dom";
function LandingPage() {

    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {

        const closeMenu = () => {
            setMenuOpen(false);
        };

        window.addEventListener("scroll", closeMenu);

        return () => {
            window.removeEventListener("scroll", closeMenu);
        };

    }, []);
    return (
        <>
            {/* NAVIGATION */}
            <header className="navbar">

                <div className="logo">

                    <img
                        src="/covira_logo.jpeg"
                        alt="Covira Logo"
                    />
                </div>

                    <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
                        <li>
                            <a href="#about" onClick={() => setMenuOpen(false)}>
                                About
                            </a>
                        </li>
                    <li>
                        <a href="#features" onClick={() => setMenuOpen(false)}>
                            Features
                        </a>
                    </li>

                    <li>
                        <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                            How It Works
                        </a>
                    </li>
                    <li>
                        <a href="#pricing" onClick={() => setMenuOpen(false)}>
                            Pricing
                        </a>
                    </li>
                    <li>
                        <a href="#contact" onClick={() => setMenuOpen(false)}>
                            Contact
                        </a>
                    </li>

                    <li>
                        <Link to="/login"> Sign In</Link>
                    </li>

                    <li>

                        <button className="primary-btn" onClick={() => navigate("/register")}>
                            Get Started Free
                        </button>
                    </li>

                </ul>
                {menuOpen && (
                    <div
                        className="menu-overlay"
                        onClick={() => setMenuOpen(false)}
                    ></div>
                )}
                <button
                    className="menu-icon"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>

            </header>
            {/* HERO */}
           <section className="hero">

                <div className="hero-left">

                    <span className="hero-tag">
                        Modern Video Interview Platform
                    </span>

                    <h1>
                        Hire Smarter
                        <br />

                        with
                        <span> Video Interviews</span>
                    </h1>

                    <p>

                        Covira enables employers to
                        streamline recruitment through
                        secure asynchronous video
                        interviews, making it easier to
                        identify the best talent while
                        providing candidates with a
                        flexible interview experience.

                    </p>

                    <div className="hero-buttons">

                        <button className="primary-btn" onClick={() => navigate("/register")}>
                            Get Started Free
                        </button>

                        <button className="secondary-btn">
                            Book Demo
                        </button>

                    </div>

                    <div className="hero-stats">

                        <div>

                            ✔ Secure

                        </div>

                        <div>

                            ✔ Remote Hiring

                        </div>

                        <div>

                            ✔ Mobile Friendly

                        </div>

                    </div>

                </div>

                <div className="hero-right">

                    <div className="dashboard-card">

                        <div className="dashboard-header">

                            <div className="dashboard-title">

                                Interview Session

                            </div>

                            <div className="live-badge">

                                ● LIVE

                            </div>

                        </div>

                        <div className="candidate-video">

                            <div className="play-circle">

                                ▶

                            </div>

                        </div>

                        <div className="question-card">

                            <small>

                                Question 2 of 5

                            </small>

                            <h3>

                                Tell us about yourself.

                            </h3>

                            <div className="timer">

                                ⏱ 01:45 Remaining

                            </div>

                        </div>

                        <div className="dashboard-footer">

                            <button className="record-btn">

                                Recording

                            </button>

                            <button className="submit-btn">

                                Submit

                            </button>

                        </div>

                    </div>

                </div>

            </section>
            {/* TRUSTED COMPANIES */}
           <section className="trusted-section">

                <p className="trusted-title">
                    Trusted by growing businesses and recruitment teams
                </p>

            </section>
            {/* ABOUT */}
            <section id="about" className="about-section">

                <div className="about-image">

                    <div className="about-card">

                        <h2>Covira</h2>

                        <p>
                            Simplifying Recruitment Through Technology
                        </p>

                    </div>

                </div>

                <div className="about-content">

                    <span>ABOUT US</span>

                    <h2>
                        Built To Transform
                        Modern Recruitment
                    </h2>

                    <p>

                        Covira is a modern video interview platform
                        developed to help employers simplify recruitment,
                        reduce scheduling delays and identify top talent
                        through asynchronous video interviews.

                    </p>

                    <p>

                        By combining secure interview links, timed responses,
                        candidate management and an intuitive employer dashboard,
                        Covira delivers a faster and more efficient hiring process.

                    </p>

                </div>

            </section>
            {/* FEATURES */}
           <section id="features" className="features">

                <div className="section-header">

                    <span>FEATURES</span>

                    <h2>
                        Everything You Need To
                        Modernize Hiring
                    </h2>

                    <p>
                        Covira simplifies every stage of the interview process,
                        allowing employers to create, manage and review interviews
                        from anywhere.
                    </p>

                </div>

                <div className="features-grid">

                    <div className="feature-card">

                        <div className="feature-icon">
                            🎥
                        </div>

                        <h3>Video Interviews</h3>

                        <p>
                            Conduct professional asynchronous
                            video interviews without scheduling conflicts.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔗
                        </div>

                        <h3>Secure Interview Links</h3>

                        <p>
                            Generate secure interview links
                            and send them to candidates instantly.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔊
                        </div>

                        <h3>Question Read Aloud</h3>

                        <p>
                            Improve accessibility using built-in
                            text-to-speech functionality.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            ⏱
                        </div>

                        <h3>Response Timer</h3>

                        <p>
                            Define answer durations and let
                            Covira manage the interview timing.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            📊
                        </div>

                        <h3>Interview Analytics</h3>

                        <p>
                            Track interview completion,
                            submissions and candidate activity.
                        </p>

                    </div>

                    <div className="feature-card">

                        <div className="feature-icon">
                            🔒
                        </div>

                        <h3>Secure Storage</h3>

                        <p>
                            Safely store interview recordings
                            and candidate responses.
                        </p>

                    </div>

                </div>

            </section>
            {/* HOW IT WORKS */}
            <section id="how-it-works" className="how-section">

                <div className="section-header">

                    <span>HOW IT WORKS</span>

                    <h2>
                        Recruit Better In Three Simple Steps
                    </h2>

                    <p>
                        Covira makes the hiring process simple,
                        efficient and accessible for both employers
                        and candidates.
                    </p>

                </div>

                <div className="steps">

                    <div className="step-card">

                        <div className="step-number">
                            1
                        </div>

                        <h3>Create an Interview</h3>

                        <p>
                            Create interview questions and define
                            how long candidates have to answer
                            each question.
                        </p>

                    </div>

                    <div className="step-card">

                        <div className="step-number">
                            2
                        </div>

                        <h3>Share Interview Link</h3>

                        <p>
                            Generate a secure interview link
                            and send it to your candidates
                            through email or messaging.
                        </p>

                    </div>

                    <div className="step-card">

                        <div className="step-number">
                            3
                        </div>

                        <h3>Review Candidate Videos</h3>

                        <p>
                            Watch recorded interviews,
                            compare candidates and make
                            informed hiring decisions.
                        </p>

                    </div>

                </div>

            </section>
            {/* WHY COVIRA */}
           <section className="why-section">

                <div className="why-left">

                    <span>WHY COVIRA</span>

                    <h2>
                        Designed For
                        Modern Recruitment
                    </h2>

                    <p>

                        Covira provides everything employers need
                        to conduct professional video interviews
                        while giving candidates a smooth and
                        flexible interview experience.

                    </p>

                    <ul className="benefits">

                        <li>✔ Faster recruitment process</li>

                        <li>✔ Save scheduling time</li>

                        <li>✔ Interview from anywhere</li>

                        <li>✔ Secure cloud storage</li>

                        <li>✔ Mobile friendly interviews</li>

                        <li>✔ Professional employer dashboard</li>

                    </ul>

                </div>

                <div className="why-right">

                    <div className="stats-card">

                        <div className="stat-box">

                            <h2>10K+</h2>

                            <p>Video Interviews</p>

                        </div>

                        <div className="stat-box">

                            <h2>500+</h2>

                            <p>Companies</p>

                        </div>

                        <div className="stat-box">

                            <h2>99%</h2>

                            <p>System Availability</p>

                        </div>

                        <div className="stat-box">

                            <h2>24/7</h2>

                            <p>Cloud Access</p>

                        </div>

                    </div>

                </div>

            </section>
            {/* PRICING */}
           <section id="pricing" className="pricing-section">

                <div className="section-header">

                    <span>PRICING</span>

                    <h2>
                        Simple Pricing For Every Business
                    </h2>

                    <p>
                        Start for free and upgrade as your hiring needs grow.
                    </p>

                </div>

                <div className="pricing-grid">

                    <div className="pricing-card">

                        <h3>Starter</h3>

                        <h1>Free</h1>

                        <p>Perfect for small businesses.</p>

                        <ul>

                            <li>✔ 10 Interviews</li>

                            <li>✔ Video Responses</li>

                            <li>✔ Interview Links</li>

                            <li>✔ Basic Dashboard</li>

                            <li>✔ Email Support</li>

                        </ul>

                        <button className="primary-btn" onClick={() => navigate("/register")}>
                            Get Started Free
                        </button>

                    </div>

                    <div className="pricing-card featured">

                        <div className="popular-tag">
                            MOST POPULAR
                        </div>

                        <h3>Professional</h3>

                        <h1>R299<span>/month</span></h1>

                        <p>Designed for growing businesses.</p>

                        <ul>

                            <li>✔ Unlimited Interviews</li>

                            <li>✔ Unlimited Candidates</li>

                            <li>✔ Analytics Dashboard</li>

                            <li>✔ Candidate Management</li>

                            <li>✔ Priority Support</li>

                            <li>✔ Cloud Storage</li>

                        </ul>

                        <button className="primary-btn">
                            Choose Plan
                        </button>

                    </div>

                </div>

            </section>

            {/* FAQ */}
            <section className="faq-section">

                <div className="section-header">

                    <span>FAQ</span>

                    <h2>Frequently Asked Questions</h2>

                    <p>
                        Everything you need to know before getting started with Covira.
                    </p>

                </div>

                <div className="faq-container">

                    <div className="faq-item">
                        <h3>Do candidates need an account?</h3>
                        <p>No. Candidates simply open the secure interview link and complete their interview.</p>
                    </div>

                    <div className="faq-item">
                        <h3>Can interviews be completed on a mobile phone?</h3>
                        <p>Yes. Covira is fully responsive and works on desktop, tablet and mobile devices.</p>
                    </div>

                    <div className="faq-item">
                        <h3>Are interview recordings secure?</h3>
                        <p>Yes. All interview videos are securely stored and accessible only to authorized employers.</p>
                    </div>

                    <div className="faq-item">
                        <h3>Can employers customise interview questions?</h3>
                        <p>Absolutely. Employers can create, edit and organise interview questions for every position.</p>
                    </div>

                </div>

            </section>
            {/* CALL TO ACTION */}
            <section className="cta-section">

                <div className="cta-content">

                    <span>READY TO START?</span>

                    <h2>
                        Transform Your Recruitment Process
                        <br />
                        With Covira
                    </h2>

                    <p>
                        Start creating professional video interviews,
                        save time, and hire smarter with one powerful platform.
                    </p>

                    <div className="hero-buttons">

                        <button className="primary-btn" onClick={() => navigate("/register")}>
                            Get Started Free
                        </button>

                        <button className="secondary-btn">
                            Contact Sales
                        </button>

                    </div>

                </div>

            </section>
            {/* FOOTER */}
            <footer id="contact" className="footer">

                <div className="footer-grid">

                    <div>
                        <div className="footer-logo-circle">
                            <img
                                src="/covira_tranperant.png"
                                alt="Covira Logo"
                                className="footer-logo"
                            />
                        </div>

                        <p>
                            Covira is a modern video interview platform designed
                            to simplify recruitment through secure and intelligent
                            hiring solutions.
                        </p>

                    </div>

                    <div>

                        <h4>Product</h4>

                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#how-it-works">How It Works</a>

                    </div>

                    <div>

                        <h4>Company</h4>

                        <a href="#about">About</a>
                        <a href="#">Careers</a>
                        <a href="#">Privacy Policy</a>

                    </div>

                    <div>

                        <h4>Contact</h4>

                        <p>info@Vhutheluresources.co.za</p>
                        <p>+27 12 345 6789</p>
                        <p>South Africa</p>

                    </div>

                </div>

                <div className="footer-bottom">

                    © 2026 Covira. All Rights Reserved.
                </div>
            </footer>
        </>
    );
}

export default LandingPage;