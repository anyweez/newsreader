import news_list from './components/news.list';
import news_viewer from './components/news.viewer';

export default new VueRouter({
    routes: [
        { name: 'list', path: '', component: news_list.component },
        { name: 'details', path: '/view/:id', component: news_viewer.component },
    ],
});