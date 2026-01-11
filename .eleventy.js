const { execSync } = require('child_process');

module.exports = function(eleventyConfig) {
  // Validation hook - run before build
  eleventyConfig.on('eleventy.before', async () => {
    try {
      console.log('Running validation...');
      execSync('node tools/alpha-parse/index.js validate --all', {
        stdio: 'inherit',
        cwd: __dirname
      });
      console.log('✅ Validation passed\n');
    } catch (error) {
      console.error('❌ Validation failed');
      process.exit(1);
    }
  });

  // Pass through assets
  eleventyConfig.addPassthroughCopy('src/assets');

  // Filters
  eleventyConfig.addFilter('runeList', (runes) => {
    return Array.isArray(runes) ? runes.join(' + ') : runes;
  });

  eleventyConfig.addFilter('statValue', (stat) => {
    if (typeof stat.value === 'object' && stat.value.min !== undefined) {
      return stat.value.varies
        ? `${stat.value.min}-${stat.value.max}`
        : stat.value.min;
    }
    return stat.value;
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  };
};
