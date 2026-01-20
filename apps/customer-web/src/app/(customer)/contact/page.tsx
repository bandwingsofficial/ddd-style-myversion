"use client";

import React from "react";
import Header from "@/components/customer/Header";
import Footer from "@/components/customer/Footer";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="page-wrapper">
      <Header />
      
      <main className="main-content">
        <section className="container">
          <header className="page-header">
            <h1 className="title shine-title">Get in Touch</h1>
            <p className="subtitle">Have a question or feedback? We'd love to hear from you.</p>
          </header>

          <div className="content-grid">
            {/* Contact Info Column */}
            <div className="info-column">
              <div className="info-header">
                <h3>Contact Information</h3>
                <p>Fill up the form or reach out to us directly.</p>
              </div>

              <div className="info-list">
                <div className="info-item">
                  <div className="icon-circle"><Mail size={20} /></div>
                  <div>
                    <span className="label">Email Us</span>
                    <p>support@caneandtender.com</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon-circle"><Phone size={20} /></div>
                  <div>
                    <span className="label">Call Us</span>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon-circle"><Clock size={20} /></div>
                  <div>
                    <span className="label">Working Hours</span>
                    <p>Mon - Sat: 9 AM - 8 PM</p>
                  </div>
                </div>
                <div className="info-item">
                  <div className="icon-circle"><MapPin size={20} /></div>
                  <div>
                    <span className="label">Location</span>
                    <p>Malleswaram, Bengaluru, KA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Column */}
            <div className="form-column">
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="John Doe" className="input" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="john@example.com" className="input" />
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea rows={5} placeholder="How can we help you?" className="textarea"></textarea>
                </div>
                <button type="submit" className="submit-btn">
                  Send Message <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <style jsx>{`
        .page-wrapper { background: #fff; min-height: 100vh; }
        .main-content { padding-top: 110px; padding-bottom: 80px; animation: fadeIn 0.8s ease-out; }
        .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        /* --- SHINE TITLE --- */
        .shine-title {
          background: linear-gradient(to right, #052e16 20%, #4ade80 40%, #4ade80 60%, #052e16 80%);
          background-size: 200% auto;
          color: #052e16;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 4s linear infinite;
        }
        @keyframes shine { to { background-position: 200% center; } }

        .page-header { text-align: center; margin-bottom: 60px; }
        .title { font-size: 3rem; font-weight: 800; margin-bottom: 1rem; font-family: serif; }
        .subtitle { color: #64748b; font-size: 1.15rem; }

        .content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05); border-radius: 24px; overflow: hidden; border: 1px solid #f1f5f9; }
        
        /* Info Styles */
        .info-column { background: #052e16; padding: 50px; color: white; display: flex; flex-direction: column; justify-content: center; }
        .info-header { margin-bottom: 3rem; }
        .info-header h3 { font-size: 1.8rem; margin-bottom: 0.5rem; color: #fff; }
        .info-header p { color: #bbf7d0; font-size: 1rem; }

        .info-list { display: flex; flex-direction: column; gap: 2rem; }
        .info-item { display: flex; gap: 1rem; align-items: center; }
        .icon-circle { width: 44px; height: 44px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4ade80; }
        .label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; color: #86efac; font-weight: 600; display: block; margin-bottom: 4px; }
        .info-item p { font-size: 1.1rem; color: #fff; }

        /* Form Styles */
        .form-column { background: #fff; padding: 50px; }
        .contact-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.6rem; }
        .form-group label { font-size: 0.95rem; font-weight: 600; color: #334155; }
        .input, .textarea {
          padding: 14px 18px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          background: #f8fafc;
        }
        .input:focus, .textarea:focus { border-color: #4ade80; background: #fff; box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.1); }
        
        .submit-btn {
          background: #16a34a;
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 1rem;
        }
        .submit-btn:hover { background: #15803d; transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(22, 163, 74, 0.2); }

        @media (max-width: 900px) {
          .content-grid { grid-template-columns: 1fr; }
          .info-column { padding: 40px; }
          .form-column { padding: 40px; }
        }
      `}</style>
    </div>
  );
}