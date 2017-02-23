<script type="text/template" id="tpl-news-list">
    <section>
        <h2>Most recent articles</h2>
        <input type="text" placeholder="Search titles..." v-model="search">
        <ul class="articles">
            <li class="article" v-for="article in visible_articles">
                <h2><router-link :to="{ name: 'details', params: { id: article.id } }">{{ article.title }}</a></h2>
                <p>{{ article.published | date }} from {{ article.source }}</p>
            </li>
        </ul>
    </section>
</script>