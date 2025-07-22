from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import psycopg2.extras
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Database connection function
def get_db_connection():
    conn = psycopg2.connect(
        dbname="myappdb",
        user="myappuser",
        password="StrongPassword1!",
        host="localhost",
        port=5432,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn

# Initialize database tables
def init_db():
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Create books table with cover_url
    cur.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            description TEXT,
            stock INTEGER DEFAULT 0,
            category VARCHAR(100),
            cover_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Check if cover_url column exists, if not add it
    cur.execute('''
        ALTER TABLE books 
        ADD COLUMN IF NOT EXISTS cover_url TEXT
    ''')
    
    # Insert sample data if table is empty
    cur.execute('SELECT COUNT(*) FROM books')
    count = cur.fetchone()['count']
    
    if count == 0:
        sample_books = [
            ('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, 'A classic American novel about the Jazz Age and the American Dream', 15, 'Fiction', 'https://covers.openlibrary.org/b/id/8225261-L.jpg'),
            ('To Kill a Mockingbird', 'Harper Lee', 14.99, 'A gripping tale of racial injustice and childhood innocence', 12, 'Fiction', 'https://covers.openlibrary.org/b/id/8226411-L.jpg'),
            ('1984', 'George Orwell', 13.99, 'Dystopian social science fiction novel', 20, 'Science Fiction', 'https://covers.openlibrary.org/b/id/7222246-L.jpg'),
            ('Pride and Prejudice', 'Jane Austen', 11.99, 'A romantic novel of manners', 18, 'Romance', 'https://covers.openlibrary.org/b/id/8594735-L.jpg'),
            ('The Catcher in the Rye', 'J.D. Salinger', 13.50, 'Coming-of-age story', 8, 'Fiction', 'https://covers.openlibrary.org/b/id/8194378-L.jpg'),
            ('Python Crash Course', 'Eric Matthes', 39.99, 'Learn Python programming from scratch', 25, 'Programming', 'https://covers.openlibrary.org/b/id/8531532-L.jpg'),
            ('Clean Code', 'Robert C. Martin', 34.99, 'A handbook of agile software craftsmanship', 22, 'Programming', 'https://covers.openlibrary.org/b/id/7894357-L.jpg'),
            ('The Hobbit', 'J.R.R. Tolkien', 16.99, 'A fantasy adventure about Bilbo Baggins', 16, 'Fantasy', 'https://covers.openlibrary.org/b/id/6979861-L.jpg'),
            ('Dune', 'Frank Herbert', 18.99, 'Epic science fiction on the desert planet Arrakis', 14, 'Science Fiction', 'https://covers.openlibrary.org/b/id/8074907-L.jpg'),
            ('Harry Potter', 'J.K. Rowling', 17.99, 'The boy wizard discovers his magical destiny', 28, 'Fantasy', 'https://covers.openlibrary.org/b/id/10521270-L.jpg')
        ]
        
        for book in sample_books:
            cur.execute(
                'INSERT INTO books (title, author, price, description, stock, category, cover_url) VALUES (%s, %s, %s, %s, %s, %s, %s)',
                book
            )
    
    conn.commit()
    cur.close()
    conn.close()

# Routes with /api prefix
@app.route('/')
def home():
    return jsonify({"message": "Welcome to Online Bookstore API", "status": "running"})

@app.route('/api/books', methods=['GET'])
def get_books():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Get query parameters
        category = request.args.get('category')
        search = request.args.get('search')
        
        query = 'SELECT * FROM books WHERE 1=1'
        params = []
        
        if category:
            query += ' AND category = %s'
            params.append(category)
        
        if search:
            query += ' AND (title ILIKE %s OR author ILIKE %s)'
            params.extend([f'%{search}%', f'%{search}%'])
        
        query += ' ORDER BY created_at DESC'
        
        cur.execute(query, params)
        books = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify(books)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('SELECT * FROM books WHERE id = %s', (book_id,))
        book = cur.fetchone()
        
        cur.close()
        conn.close()
        
        if book:
            return jsonify(book)
        else:
            return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books', methods=['POST'])
def add_book():
    try:
        data = request.json
        
        required_fields = ['title', 'author', 'price']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('''
            INSERT INTO books (title, author, price, description, stock, category, cover_url)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        ''', (
            data['title'],
            data['author'],
            float(data['price']),
            data.get('description', ''),
            int(data.get('stock', 0)),
            data.get('category', 'General'),
            data.get('cover_url', '')
        ))
        
        book_id = cur.fetchone()['id']
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Book added successfully", "id": book_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    try:
        data = request.json
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Check if book exists
        cur.execute('SELECT id FROM books WHERE id = %s', (book_id,))
        if not cur.fetchone():
            cur.close()
            conn.close()
            return jsonify({"error": "Book not found"}), 404
        
        # Update book
        cur.execute('''
            UPDATE books 
            SET title = %s, author = %s, price = %s, description = %s, stock = %s, category = %s, cover_url = %s
            WHERE id = %s
        ''', (
            data.get('title'),
            data.get('author'),
            float(data.get('price')),
            data.get('description'),
            int(data.get('stock')),
            data.get('category'),
            data.get('cover_url', ''),
            book_id
        ))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({"message": "Book updated successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('DELETE FROM books WHERE id = %s RETURNING id', (book_id,))
        deleted = cur.fetchone()
        
        conn.commit()
        cur.close()
        conn.close()
        
        if deleted:
            return jsonify({"message": "Book deleted successfully"})
        else:
            return jsonify({"error": "Book not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/categories', methods=['GET'])
def get_categories():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute('SELECT DISTINCT category FROM books ORDER BY category')
        categories = [row['category'] for row in cur.fetchall()]
        
        cur.close()
        conn.close()
        
        return jsonify(categories)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    init_db()  # Initialize database on startup
    app.run(host='0.0.0.0', debug=True)
