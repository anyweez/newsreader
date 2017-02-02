function onCreate() {
    this.$store
        .dispatch('fetch_details', this.$route.params.id)
        .then(resp => {

            this.$store.commit('add_article', resp);
            this.article = resp;
            // console.log(this.article)
        });
}

export default {
    name: 'news-viewer',
    component: {
        template: document.querySelector('#tpl-news-viewer'),
        data() {
            /**
             * The list of articles is store in the Vuex state object.
             */
            return {
                article: {},
            };
        },
        methods: {
            /**
             * label = 'countries'
             * text = 'Russia'
             * correct = true
             */
            feedback(label, text, correct) {
                console.log(this.article.labels);
                console.log(label, text, correct)
                // Save the update locally.
                const target = this.article.labels
                    .find(item => item.name === label).values
                    .find(v => v.text === text)

                target.correct = correct;

                // Push to server.
                fetch('/api/feedback', {
                    method: 'post',
                    body: JSON.stringify({
                        docid: this.article.id,
                        label,
                        text,
                        correct,
                    }),
                });
            },
        },

        /* When the component is initialized, fetch the article */
        created() {
            onCreate.call(this);
        },
        watch: {
            /* If we change article without changing to another route, reload */
            '$route'(to, from) {
                onCreate.call(this);
            },
        },
    },
};