import { getAllPosts, getAllTags } from "@/lib/mdx";
import BlogList from "./blog-list";

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return <BlogList posts={posts} tags={tags} />;
}
