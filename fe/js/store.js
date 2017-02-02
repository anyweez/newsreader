/* Any steps that should be performed on JSON objects */
function prepare_article(raw) {
    raw.text = raw.hasOwnProperty('text') ? raw.text.split('\n') : null;

    raw.labels = Object.keys(raw.labels || {}).map(label => {
        return {
            name: label,
            values: raw.labels[label],
            // values: raw.labels[label].map(value => {
            //     return { value, correct: null };
            // }),
        };
    });

    return raw;
}

function existence_tracker() {
    const exists = new Set();

    return function (id) {
        if (exists.has(id)) return true;
        else {
            exists.add(id);
            return false;
        }
    }
}

// Check whether the specified article ID already exists in the list.
const exists = existence_tracker();

export default new Vuex.Store({
    state: {
        articles: [],
    },
    mutations: {
        add_article(state, article) {
            state.articles.push(prepare_article(article));
        },
    },

    actions: {
        /* Fetch details for a particular article */
        fetch_details({ commit }, id) {
            return new Promise((resolve, reject) => {
                fetch(`http://localhost:5000/api/details/${id}`)
                    .then(resp => resp.json())
                    .then(resp => resolve(resp));
            });
        },

        /* Fetch ALL summaries, or the # specified by 'count' */
        fetch_summaries({ commit }, count) {
            const url_param = count ? `?count=${ count }` : '';
            fetch(`http://localhost:5000/api/all${ url_param }`)
                .then(resp => resp.json())
                .then(resp => {
                    resp.forEach(article => commit('add_article', article));
                });
        }
    }
});