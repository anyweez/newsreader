export default {
    name: 'news-list',
    component: {
        template: document.querySelector('#tpl-news-list'),
        data() {
            /**
             * The list of articles is store in the Vuex state object.
             */
            return {
                search: '',
                news: this.$store.state.articles,
            };
        },
        computed: {
            visible_articles() {
                
                if (this.search.length === 0) return this.news;
                else {
                    const normalized_search = this.search.toLowerCase();
                    return this.news.filter(article => article.title.toLowerCase().includes(normalized_search));
                }
            }
        }
    },
};