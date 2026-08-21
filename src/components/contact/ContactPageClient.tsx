"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, MessageSquare } from "lucide-react";
import { contactFaqs } from "@/lib/contact-faqs";

export default function ContactPageClient({
  supportEmail = "hello@mindfulpath.com",
}: {
  supportEmail?: string;
}) {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative pt-10 sm:pt-16 pb-16 border-b border-line overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-subtle border border-line text-accent text-sm font-medium mb-6">
            <MessageSquare className="w-3.5 h-3.5" /> Get In Touch
          </span>
          <h1 className="text-4xl font-bold text-heading mb-4">
            We'd Love to <span className="gradient-text">Hear From You</span>
          </h1>
          <p className="text-body leading-relaxed">
            Have a question, suggestion, or collaboration request? Reach out and we'll get back to you within 24–48 hours.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          {/* Form */}
          <div>
            {submitted ? (
              <div className="card p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-accent-subtle flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <h2 className="text-2xl font-bold text-heading mb-3">Message Sent!</h2>
                <p className="text-body">Thank you for reaching out. We'll get back to you within 24–48 hours.</p>
                <button
                  onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }); }}
                  className="mt-6 px-6 py-3 rounded-xl bg-accent-subtle text-accent font-medium text-sm hover:opacity-80 transition-opacity"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <div className="card p-8">
                <h2 className="text-xl font-bold text-heading mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-body mb-1.5">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-body mb-1.5">Email Address *</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body mb-1.5">Subject *</label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-line bg-surface-alt text-heading text-sm outline-none focus:border-accent transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Blog Topic Suggestion</option>
                      <option>Collaboration / Guest Post</option>
                      <option>Technical Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-body mb-1.5">Message *</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm disabled:opacity-70 transition-all"
                  >
                    {loading ? "Sending..." : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                  {error && (
                    <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
                      ⚠️ {error}
                    </p>
                  )}
                </form>
              </div>
            )}

            {/* Disclaimer Note (Desktop only) */}
            <div className="hidden lg:block mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                ⚠️ <strong>Not a crisis line.</strong> If you are experiencing a mental health crisis, please call your local emergency services or a mental health crisis line immediately.
              </p>
            </div>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-5">
            <div className="card p-6">
              <h3 className="font-bold text-heading mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-faint font-medium">Email</p>
                    <p className="text-sm text-body">{supportEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-faint font-medium">Based In</p>
                    <p className="text-sm text-body">Available Worldwide (Online)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-faint font-medium">Response Time</p>
                    <p className="text-sm text-body">Within 24–48 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Mini */}
            <div className="card p-6">
              <h3 className="font-bold text-heading mb-4">Quick Answers</h3>
              <div className="space-y-4">
                {contactFaqs.map((faq, i) => (
                  <div key={i}>
                    <p className="text-sm font-medium text-heading mb-1">{faq.question}</p>
                    <p className="text-xs text-body leading-relaxed">{faq.answer}</p>
                    {i < contactFaqs.length - 1 && <div className="mt-3 border-t border-line-subtle" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Disclaimer Note (Mobile only) */}
            <div className="lg:hidden p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                ⚠️ <strong>Not a crisis line.</strong> If you are experiencing a mental health crisis, please call your local emergency services or a mental health crisis line immediately.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
