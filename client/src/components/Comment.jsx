import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

function CommentsSection({ recipeId }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch existing comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/comments?recipeId=${recipeId}`
        );
        const data = await response.json();
        setComments(data.comments || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();
  }, [recipeId]);

  // Post a new comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId, text: commentText }),
      });

      if (!response.ok) throw new Error("Failed to post comment.");

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]); // Add the new comment to the top
      setCommentText("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "An error occurred.");
    }
  };

  // Report a comment
  const handleReportComment = async (commentId, reason) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/comments/${commentId}/report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error("Failed to report comment.");

      const data = await response.json();
      alert(
        `Report submitted: ${data.reportCountForThisComment} reports on this comment.`
      );
    } catch (error) {
      alert(
        "Error reporting comment. " + (error.message || "Try again later.")
      );
    }
  };

  return (
    <div className="commentsSection">
      <h2>Comments</h2>
      {/* Comment Form */}
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write your comment here..."
          rows="4"
        />
        <button type="submit">Post Comment</button>
      </form>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {/* Display Comments */}
      <div className="commentList">
        {comments.map((comment) => (
          <div key={comment.id} className="commentItem">
            <p>
              <strong>{comment.user.name}</strong>: {comment.text}
            </p>
            <button
              onClick={() => {
                const reason = prompt(
                  "Enter the reason for reporting this comment:"
                );
                if (reason) handleReportComment(comment.id, reason);
              }}
            >
              Report Comment
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

CommentsSection.propTypes = {
  recipeId: PropTypes.number.isRequired,
};

export default CommentsSection;
