import React, { useEffect } from "react";
import "../Modal.css"; 

const Modal = ({ isOpen, onClose, title, children }) => {
  // Close the modal when clicking outside it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (event.target.id === "modalBackground") { // Close modal if clicking on the background
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleOutsideClick); // Add event listener when modal is open
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick); // Remove event listener when modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null; // Don't render anything if modal is closed

  return (
    <div id="modalBackground" className="modalBackground">
      <div className="modalContainer">
        <h2>{title}</h2>
        <button className="closeButton" onClick={onClose}>
          &times;
        </button>
        <div className="modalContent">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
