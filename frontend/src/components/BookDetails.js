import React from 'react';

function BookDetails({ book }) {
  return (
    <div className="book-details">
      <h2>Book Details</h2>
      <div className="details-content">
        <h3>{book.title}</h3>
        <p><strong>Author:</strong> {book.author}</p>
        <p><strong>Price:</strong> ${book.price}</p>
        <p><strong>Category:</strong> {book.category}</p>
        <p><strong>Stock:</strong> {book.stock} copies</p>
        {book.description && (
          <div>
            <strong>Description:</strong>
            <p className="description">{book.description}</p>
          </div>
        )}
        <p><strong>Added:</strong> {new Date(book.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default BookDetails;
