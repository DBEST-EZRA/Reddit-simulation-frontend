import React, { useState } from "react";

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [subreddit, setSubreddit] = useState("");
  const [posts, setPosts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState(""); 
  const [messageContent, setMessageContent] = useState(""); 
  const [loggedIn, setLoggedIn] = useState(false);

  // Handle user registration
  const registerUser = async () => {
    if (!username || !password) {
      alert("Please enter username and password");
      return;
    }

    const response = await fetch(
      `http://localhost:8080/register?username=${username}&password=${password}`,
      { method: "POST" }
    );

    if (response.ok) {
      alert("User registered successfully!");
      setLoggedIn(true);
    } else {
      alert("Registration failed!");
    }
  };


  // Handle subreddit creation
  const createSubreddit = async () => {
    if (!subreddit) {
      alert("Please enter subreddit name");
      return;
    }

    if (!username) {
      alert("User is not logged in");
      return;
    }

    const response = await fetch(
      `http://localhost:8080/create_subreddit?name=${subreddit}&creator=${username}`,
      { method: "POST", credentials: "include" }
    );

    if (response.ok) {
      alert(`Subreddit "${subreddit}" created successfully by ${username}!`);
    } else {
      alert("Failed to create subreddit!");
    }
  };


  // Handle post creation
  const createPost = async () => {
    if (!subreddit || !content) {
      alert("Please enter subreddit name and content");
      return;
    }

    const response = await fetch(
      `http://localhost:8080/create_post?subreddit=${subreddit}&author=${username}&content=${content}`,
      { method: "POST", credentials: "include" }
    );

    if (response.ok) {
      alert("Post created successfully!");
    } else {
      alert("Failed to create post!");
    }
  };
  
//getfeed
  const getFeed = async () => {
    const response = await fetch(
      `http://localhost:8080/get_feed?subreddit=${subreddit}`,
      { method: "GET", credentials: "include" }
    );
  
    if (response.ok) {
      const data = await response.json();
  
      if (data.message) {
        const lines = data.message.split("\n"); // Split lines
        const postsArray = [];
        let currentPost = null;
  
        lines.forEach((line) => {
          const trimmedLine = line.trim();
  
          // Check if the line represents a post
          if (trimmedLine.startsWith("Post ID:")) {
            const postData = trimmedLine.split(" | ");
            if (postData.length === 4) {
              currentPost = {
                postID: postData[0].split(":")[1].trim(),
                author: postData[1].split(":")[1].trim(),
                votes: parseInt(postData[2].split(":")[1].trim(), 10),
                content: postData[3].split(":")[1].trim(),
                comments: [], // Initialize an empty comments array
              };
              postsArray.push(currentPost);
            }
          }
  
          // Check if the line represents a comment
          else if (trimmedLine.startsWith("Comment ID:") && currentPost) {
            const commentData = trimmedLine.split(" | ");
            if (commentData.length === 4) {
              const comment = {
                commentID: commentData[0].split(":")[1].trim(),
                author: commentData[1].split(":")[1].trim(),
                votes: parseInt(commentData[2].split(":")[1].trim(), 10),
                content: commentData[3].split(":")[1].trim(),
              };
              currentPost.comments.push(comment); // Add the comment to the current post
            }
          }
        });
  
        setPosts(postsArray);
      } else {
        alert("Invalid response format.");
      }
    } else {
      alert("Failed to fetch feed!");
    }
  };
  
  
  

  // Send message
  const sendMessage = async (recipient, messageContent) => {
    const response = await fetch(
      `http://localhost:8080/send_message?sender=${username}&recipient=${recipient}&content=${messageContent}`,
      { method: "POST", credentials: "include" }
    );

    if (response.ok) {
      alert("Message sent successfully!");
    } else {
      alert("Failed to send message!");
    }
  };

  //list messages
  const listMessages = async () => {
    const response = await fetch(
      `http://localhost:8080/list_messages?username=${username}`,
      { method: "GET", credentials: "include" }
    );
  
    if (response.ok) {
      const data = await response.json();
  
      if (data.message) {
        // Parse the message string
        const messageLines = data.message.split("\n").slice(1); // Skip the first line (header)
        const parsedMessages = messageLines
          .filter((line) => line.trim() !== "") // Remove empty lines
          .map((line) => {
            const [idAndSender, content] = line.split(":");
            const idAndSenderParts = idAndSender.trim().split(".");
            return {
              id: idAndSenderParts[0].trim(),
              sender: idAndSenderParts[1]?.replace("From", "").trim(),
              content: content?.trim() || "",
            };
          });
  
        setMessages(parsedMessages);
      } else {
        alert("Unexpected response format.");
        setMessages([]);
      }
    } else {
      alert("Failed to fetch messages!");
      setMessages([]);
    }
  };

  //upvote and downvote
  const votePost = async (postID, vote) => {
    const response = await fetch(
      `http://localhost:8080/vote_post?username=${username}&postID=${postID}&vote=${vote}`,
      { method: "POST", credentials: "include" }
    );
  
    if (response.ok) {
      alert(vote === 1 ? "Post upvoted!" : "Post downvoted!");
      getFeed(); 
    } else {
      alert("Failed to vote on post!");
    }
  };

  
  //commnent
  const handleComment = async (postID) => {
    const comment = prompt("Enter your comment:");
    if (!comment) {
      alert("Comment cannot be empty.");
      return;
    }
  
    const response = await fetch(
      `http://localhost:8080/add_comment?postID=${postID}&author=${username}&content=${comment}`,
      { method: "POST", credentials: "include" }
    );
  
    if (response.ok) {
      alert("Comment added successfully!");
    } else {
      alert("Failed to add comment!");
    }
  };
  
  

  return (
    <div>
      <h1>Reddit-like Application</h1>
      {!loggedIn ? (
        <div>
          <h2>Register</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={registerUser}>Register</button>
        </div>
      ) : (
        <div>
          <h2>Welcome, {username}!</h2>

          <div>
            <h3>Create Subreddit</h3>
            <input
              type="text"
              placeholder="Subreddit name"
              value={subreddit}
              onChange={(e) => setSubreddit(e.target.value)}
            />
            <button onClick={createSubreddit}>Create</button>
          </div>

          <div>
            <h3>Create Post</h3>
            <textarea
              placeholder="Post content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={createPost}>Create Post</button>
          </div>

          <div>
  <h3>View Feed</h3>
  <button onClick={getFeed}>Get Feed</button>
  <ul>
    {posts.map((post, index) => (
      <li key={index}>
        <strong>Post ID:</strong> {post.postID} <br />
        <strong>Content:</strong> {post.content} <br />
        <strong>Votes:</strong> {post.votes} <br />
        <button onClick={() => votePost(post.postID, 1)}>Upvote</button>
        <button onClick={() => votePost(post.postID, -1)}>Downvote</button>
        <button onClick={() => handleComment(post.postID)}>Comment</button>

        {/* Display comments */}
        {post.comments.length > 0 && (
          <ul>
            {post.comments.map((comment, idx) => (
              <li key={idx}>
                <strong>Comment ID:</strong> {comment.commentID} <br />
                <strong>Content:</strong> {comment.content} <br />
                <strong>Votes:</strong> {comment.votes} <br />
                <strong>Author:</strong> {comment.author} <br />
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</div>



          <div>
            <h3>Messages</h3>
            <div>
        <h4>Send a Message</h4>
        <input
          type="text"
          placeholder="Recipient username"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <textarea
          placeholder="Enter your message"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <button onClick={() => sendMessage(recipient, messageContent)}>Send</button>
      </div>
            <button onClick={listMessages}>List Messages</button>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg.sender} <br />{msg.content}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;