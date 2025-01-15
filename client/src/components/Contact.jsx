import React from "react";
import "../App.css"; // Optional CSS for styling

const Contact = () => {
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
          <strong>Jackson Grant</strong> -
          <a
            href="https://github.com/jagman00"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Thu Yein Tun</strong> -
          <a
            href="https://github.com/thu1111"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>William Howard</strong> -
          <a
            href="https://github.com/Williamd110"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Caleb Vang Dodson</strong> -
          <a
            href="https://github.com/CalebDodson"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </li>
        <li>
          <strong>Ryan Raidt</strong> -
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
    </div>
  );
};

export default Contact;
