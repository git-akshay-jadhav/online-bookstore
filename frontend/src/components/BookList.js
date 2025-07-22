import React from 'react';

function BookList({ books, onSelectBook, onEditBook, onDeleteBook, selectedBook }) {
  if (books.length === 0) {
    return <div className="no-books">No books found. Add some books to get started!</div>;
  }

  return (
    <div className="book-list">
      <h2>Books ({books.length})</h2>
      <div className="books-grid">
        {books.map((book) => (
          <div 
            key={book.id}
            className={`book-card ${selectedBook?.id === book.id ? 'selected' : ''}`}
            onClick={() => onSelectBook(book)}
          >
            <h3>{book.title}</h3>
            <p className="author">by {book.author}</p>
            <p className="price">${book.price}</p>
            <p className="category">{book.category}</p>
            <p className="stock">Stock: {book.stock}</p>
            
            <div className="book-actions">
              <button 
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditBook(book);
                }}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBook(book.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BookList;
