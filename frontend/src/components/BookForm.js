import React, { useState, useEffect } from 'react';

function BookForm({ book, categories, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    cover_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        price: book.price || '',
        description: book.description || '',
        stock: book.stock || '',
        category: book.category || '',
        cover_url: book.cover_url || ''
      });
      setPreviewUrl(book.cover_url || '');
    }
  }, [book]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'cover_url') {
      setPreviewUrl(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const method = book ? 'PUT' : 'POST';
    const url = book ? `/api/books/${book.id}` : '/api/books';
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSubmit();
        alert(book ? 'Book updated successfully!' : 'Book added successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to save book'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error saving book. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{book ? '✏️ Edit Book' : '➕ Add New Book'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="book-form">
          <div className="form-row">
            <div className="form-group">
              <label>Title *</label>
              <input
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <label>Author *</label>
              <input
                name="author"
                type="text"
                value={formData.author}
                onChange={handleInputChange}
                required
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price * ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label>Stock</label>
              <input
                name="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Fiction">Fiction</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Romance">Romance</option>
                <option value="Programming">Programming</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group cover-preview-group">
              <label>Cover Preview</label>
              {previewUrl && (
                <div className="cover-preview">
                  <img 
                    src={previewUrl}
                    alt="Book cover preview"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/150x200/667eea/white?text=Preview`;
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Book Cover URL</label>
            <input
              name="cover_url"
              type="url"
              value={formData.cover_url}
              onChange={handleInputChange}
              placeholder="https://covers.openlibrary.org/b/id/123456-L.jpg"
            />
            <small className="form-help">
              💡 Find covers at covers.openlibrary.org
            </small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              placeholder="Enter book description..."
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (book ? '💾 Update' : '➕ Add Book')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookForm;
