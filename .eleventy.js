const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const nunjucks = require("nunjucks");

module.exports = function(eleventyConfig) {

  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // widths: [300, 900, "auto"],
    // htmlOptions: {
		// 	imgAttributes: {
    //     sizes: "",
		// 		loading: "lazy",
		// 		decoding: "async"
		// 	}
		// }
  });

  eleventyConfig.addPassthroughCopy("_src/css");
  eleventyConfig.addPassthroughCopy("_src/js");
  eleventyConfig.addPassthroughCopy("_src/images");

  eleventyConfig.addFilter("jsonval", (value) => {
    return new nunjucks.runtime.SafeString(JSON.stringify(value));
  });
  eleventyConfig.addFilter("timestampToRfc3339", (timestamp) => {
    return new Date(timestamp * 1000).toISOString();
  });
  eleventyConfig.addFilter("postSlug", (post) => {
    const date = new Date(post.creation_timestamp * 1000);
    const dateStr = date.toISOString().slice(0, 10);
    const titleSlug = (post.title || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60)
      .replace(/-$/, "");
    const idMatch = (post.media[0] || "").match(/\/([^/]+)\.\w+$/);
    const suffix = idMatch ? idMatch[1].slice(-4) : "";
    const base = titleSlug ? `${dateStr}-${titleSlug}` : dateStr;
    return suffix ? `${base}-${suffix}` : base;
  });
  eleventyConfig.addFilter("mediaId", (url) => {
    if (!url) return null;
    const match = url.match(/\/([^/]+)\.\w+$/);
    return match ? match[1] : null;
  });
  eleventyConfig.addFilter("limit", function (arr, limit) {
    return arr.slice(0, limit);
  });
  eleventyConfig.addFilter("postDate", (timestamp) => {
    const date = new Date(timestamp * 1000);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  });
  eleventyConfig.addFilter("optimize", (url, optimizations) => {
    if (!url || !optimizations) return url; // Return the URL as is if it's invalid or no transforms are provided

    // Find the position to inject transforms
    const uploadSegment = "/upload";
    const insertPosition = url.indexOf(uploadSegment);

    if (insertPosition === -1) {
      // If "/upload" is not found, return the URL unchanged
      return url;
    }

    // Construct the new URL with the transforms injected
    const beforeUpload = url.slice(0, insertPosition + uploadSegment.length);
    const afterUpload = url.slice(insertPosition + uploadSegment.length);
    return `${beforeUpload}${optimizations}${afterUpload}`;
  });

  eleventyConfig.setServerOptions({
    showAllHosts: true,    
  });

  return {
    dir: {
      input: '_src',
      output: '_site'
    },
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  };
};