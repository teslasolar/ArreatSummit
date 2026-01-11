// Search functionality using Lunr.js
document.addEventListener('alpine:init', () => {
  Alpine.data('search', () => ({
    query: '',
    results: [],
    searchIndex: null,
    searchData: {},

    async init() {
      // Build search index
      await this.buildIndex();
    },

    async buildIndex() {
      // Fetch all items data
      const response = await fetch('/search-data.json');
      const data = await response.json();
      this.searchData = data.items;

      // Build Lunr index
      this.searchIndex = lunr(function() {
        this.ref('id');
        this.field('name', { boost: 10 });
        this.field('type');
        this.field('stats');
        this.field('notes');

        data.items.forEach(item => {
          this.add(item);
        });
      });
    },

    search() {
      if (!this.query || this.query.length < 2) {
        this.results = [];
        return;
      }

      try {
        const searchResults = this.searchIndex.search(this.query);
        this.results = searchResults.map(result => {
          return this.searchData.find(item => item.id === result.ref);
        }).filter(Boolean);
      } catch (error) {
        console.error('Search error:', error);
        this.results = [];
      }
    }
  }));
});
