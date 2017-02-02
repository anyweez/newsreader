import store from './store';
import router from './router';

import news_list from './components/news.list';

window.addEventListener('DOMContentLoaded', () => {
    // Fetch all news stories on page load.
    store.dispatch('fetch_summaries', 25);

    Vue.filter('date', raw => moment(raw).fromNow());

    const app = new Vue({
        el: 'main',
        store, 
        router,
        components: {
            [news_list.name]: news_list.component
        }
    });
});