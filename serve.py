import json, rethinkdb, hashlib
from flask import Flask, jsonify, request, send_from_directory

MAX_RETURNED_ARTICLES = 2000
NEWS_PATH = '/home/luke/git/scraper/news/{}.html.txt'

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

    cursor = rethinkdb.db('news').table('metadata').order_by(index=rethinkdb.desc('published')).limit(count).run(md)

    return jsonify([WebView(article).__dict__ for article in cursor])

## Look up all of the details, including the full text, of a particular article.
@app.route('/api/details/<string:article_id>')
def details(article_id):
    cursor = rethinkdb.db('news').table('metadata').get(article_id).run(md)

    with open(NEWS_PATH.format(cursor['filename'])) as fp:
        cursor['text'] = fp.read()

        fb = rethinkdb.db('news').table('feedback').filter({ 'docid': article_id }).run(md)

        # Mapping labels[label][value] = correct
        labels = {}
        for label in fb:
            label_name = label['label']
            label_text = label['text']
            label_correct = label['correct']

            if label_name not in labels:
                labels[label_name] = {}

            if label_text not in labels[label_name]:
                labels[label_name][label_text] = None 

            labels[label_name][label_text] = label_correct

    if 'labels' in cursor:
        # Get all labels that exist on the document
        for label, values in cursor['labels'].items():
            if label in labels:
                cursor['labels'][label] = [{ 'text': value, 'correct': labels[label][value] if value in labels[label] else None } for value in values]
            else:
                cursor['labels'][label] = [{ 'text': value, 'correct': None } for value in values]

    return jsonify(cursor)


"""
POST /api/feedback

Records feedback information about a particular label on a particular article. Can
be used for computing stats after the fact.
"""
@app.route('/api/feedback', methods=['POST'])
def feedback():
    body = request.get_json(force=True)

    hash = hashlib.md5()
    hash.update('{}-{}-{}'.format(body['docid'], body['label'], body['text']).encode('utf-8'))

    rethinkdb.db('news').table('feedback').insert({
        'id': hash.hexdigest(),
        'correct': body['correct'],
        'docid': body['docid'],
        'label': body['label'],
        'text': body['text']
    }, conflict='update').run(md)

    return ''

@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def all_content(path):
    return send_from_directory('public', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0')
