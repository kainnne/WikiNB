import matter from 'gray-matter';

// Parse YAML so quotes, comments and capitalization cannot bypass the public guard.
export function isPrivateMarkdown(content) {
  const { data } = matter(String(content).replace(/^\uFEFF/, ''));
  return String(data.visibility || '').toLowerCase() === 'private' || data.private === true;
}
