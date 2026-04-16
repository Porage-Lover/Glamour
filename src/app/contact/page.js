'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <>
      <Navbar dark />

      <div className="page-header" id="contact-header">
        <div className="container">
          <h1>Contact Us</h1>
          <div className="breadcrumb">
            <a href="/">Home</a><span>/</span>Contact
          </div>
        </div>
      </div>

      <section className="section" id="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <span className="section-subtitle">Get in Touch</span>
              <h3 style={{ marginBottom: '1.5rem' }}>We&apos;d Love to Hear From You</h3>

              {sent && (
                <div style={{ background: '#e8f5e9', color: 'var(--success)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  Thank you! Your message has been sent successfully.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input type="text" className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" className="form-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input type="text" className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
                </div>
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>

            <div>
              <span className="section-subtitle">Store Information</span>
              <h3 style={{ marginBottom: '2rem' }}>Visit Our Store</h3>

              <div className="contact-info-item">
                <div className="contact-info-label">Address</div>
                <div className="contact-info-value">SRMIST<br />Kattankulathur, Tamil Nadu, India — 603203</div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">Phone</div>
                <div className="contact-info-value">+91 90000 00000</div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">Email</div>
                <div className="contact-info-value">jitu@mail.com</div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-label">Working Hours</div>
                <div className="contact-info-value">Mon — Sat: 10:00 AM — 8:00 PM<br />Sunday: 11:00 AM — 6:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
