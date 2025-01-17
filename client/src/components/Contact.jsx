import React, { useState } from "react";
import "../App.css"; // Optional CSS for styling

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to send message.");

      setSuccessMessage("Message sent successfully!");
      setErrorMessage("");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      setErrorMessage("Failed to send message. Please try again.");
      setSuccessMessage("");
    }
  };

  return (
    <div className="contactPage">
      <h1>Contact Us</h1>
      <p>
        Welcome to Recipe Round Table, a community-driven platform for sharing
        and exploring delicious recipes! Our goal is to bring food enthusiasts
        together to create, share, and enjoy culinary delights from around the
        world.
      </p>
      <h2>Our Team</h2>
      <ul>
        <li>
          <strong>Jackson Grant</strong> -&nbsp;
          <a
            href="https://github.com/jagman00"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Thu Yein Tun</strong> -&nbsp;
          <a
            href="https://github.com/thu1111"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>William Howard</strong> -&nbsp;
          <a
            href="https://github.com/Williamd110"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Caleb Vang Dodson</strong> -&nbsp;
          <a
            href="https://github.com/CalebDodson"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Ryan Raidt</strong> -&nbsp;
          <a
            href="https://github.com/RyanRaidt"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
      <p>
        We’d love to hear from you! Feel free to reach out to us with any
        questions, feedback, or suggestions.
      </p>

      {/* Contact Form */}
      <h2>Send Us a Message</h2>
      {successMessage && <p className="successMessage">{successMessage}</p>}
      {errorMessage && <p className="errorMessage">{errorMessage}</p>}
      <form className="contactForm" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">
            <span>Name: </span>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              required
            />
          </label>
        </div>
        <div>
          <label htmlFor="email">
            <span>Email: </span>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your Email"
              required
            />
          </label>
        </div>
        <div className="message">
          <label htmlFor="message">
            <span>Message: </span>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message"
              required
            ></textarea>
          </label>
        </div>
        <button id="submitMessageBtn" type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
