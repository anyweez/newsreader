<script type="text/template" id="tpl-news-viewer">
    <section id="news-viewer">
        <p><router-link :to="{ name: 'list' }">Back</router-link></p>
        <h2>{{ article.title }}</h2>
        <p class="source"><a :href="article.url">original</a> from {{ article.source }}, added {{ article.added | date }}</p>
        <h4>Labels</h4>
        <ul>
            <li class="labels" v-for="label in article.labels">
                <p>{{ label.name }}</p>
                <ul>
                    <li 
                        :class="{ correct: val.correct, incorrect: val.correct === false }" 
                        class="label" 
                        @click="feedback(label.name, val.text, !val.correct)"
                        v-for="val in label.values">{{ val.text }}</li>
                </ul>
            </li>
        </ul>
        <p class="body" v-for="p in article.text">{{ p }}</p>
    </section>
</script>