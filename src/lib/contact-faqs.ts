// Shared FAQ data for the contact page — kept in a neutral (non-"use client")
// module so both the server page (JSON-LD schema) and the client component
// (rendering) can import it.
export const contactFaqs = [
  { question: "How do I submit a question for the blog?", answer: "Use the contact form and select 'Blog Topic Suggestion' as the subject. We review all suggestions!" },
  { question: "Do you offer personal mental health consultations?", answer: "MindfulPath is an educational resource. For personal consultations, please seek a licensed therapist in your area." },
  { question: "How can I collaborate or write for MindfulPath?", answer: "We welcome contributions from licensed mental health professionals. Please reach out via the contact form." },
];
