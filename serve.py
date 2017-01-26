import json, rethinkdb
from flask import Flask, jsonify, request, send_from_directory

MAX_RETURNED_ARTICLES = 2000
NEWS_PATH = '/Users/luke/git/scraper/news/{}.html.txt'

app = Flask(__name__)

## Create connection to rethinkdb
md = rethinkdb.connect('historian', 28015)

## Whitelist for fields that should make it to the frontend. 
## By default, all labels are whitelisted.
class WebView(object):
    def __init__(self, full):
        self.id = full['id']
        self.added = full['added']
        self.authors = full['authors']
        self.published = full['published']
        self.source = full['source']
        self.title = full['title']
        self.url = full['url']
        self.labels = full['labels'] if 'labels' in full else None

## Returns all (or a subset, specified by 'count' query param) news summaries known, ordered
## by most recent.
@app.route('/api/all')
def all():
    c = request.args.get('count')
    count = int(c) if c is not None else MAX_RETURNED_ARTICLES

    cursor = rethinkdb.db('news').table('metadata').order_by(index='added').limit(count).run(md)

    return jsonify([WebView(article).__dict__ for article in cursor])

## Look up all of the details, including the full text, of a particular article.
@app.route('/api/details/<string:article_id>')
def details(article_id):
    print(article_id)

    cursor = rethinkdb.db('news').table('metadata').get(article_id).run(md)

    with open(NEWS_PATH.format(cursor['filename'])) as fp:
        cursor['text'] = fp.read()

    return jsonify(cursor)

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def all_content(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run()