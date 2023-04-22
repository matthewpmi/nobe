import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ResponsiveAppBar from "../components/Navbar/ResponsiveAppBar";
import axios from "axios";
import { useParams } from "react-router";

interface Post {
  id: string;
  body: string;
  userId: string;
  discussionId: string;
  createdAt: string;
  user: {
    firstName: string;
  }
}

function DiscussionPosts() {
  const { id } = useParams<{ id: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  // const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    async function getPosts() {
      try {
        const { data } = await axios.get(`/api/clubs/${id}/posts`);
        setPosts(data);
      } catch (error) {
        console.error(error);
      }
    }
    if (id) {
      getPosts();
    }
  }, [id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const currentDate = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
      const { data } = await axios.post(`/api/clubs/${id}/posts`, {
        userId: user.id,
        body: newPost,
        createdAt: currentDate
      });
      setPosts([...posts, data]);
      setNewPost("");
    } catch (error) {
      console.error(error);
    }
  };

  async function handleDelete(postId: string) {
    try {
      await axios.delete(`/api/clubs/${id}/posts/${postId}`);
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <ResponsiveAppBar></ResponsiveAppBar>
      <h1>Discussion Posts</h1>
      {posts?.map((post) => (
        <div key={post.id}>
          <h3>{post.body}</h3>
          {/* <p>userId: {post.userId}</p> */}
          <p>{post.user.firstName} {format(new Date(post.createdAt), "h:mm a MMMM d, yyyy")}</p>
          {post.userId === JSON.parse(localStorage.getItem("user") || "{}").id && (
            <button onClick={() => handleDelete(post.id)}>Delete</button>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <textarea
          value={newPost}
          onChange={(event) => setNewPost(event.target.value)}
          placeholder="Write a new post"
        />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}

export default DiscussionPosts;