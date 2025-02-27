const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");

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
  eleventyConfig.addPassthroughCopy("_headers");

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