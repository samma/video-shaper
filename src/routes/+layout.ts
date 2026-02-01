// Enable prerendering for all pages by default
// This creates static HTML files for each route during build
export const prerender = true;

// Use trailing slashes to generate /page/index.html structure
// This is required for Digital Ocean App Platform to serve clean URLs
export const trailingSlash = 'always';
