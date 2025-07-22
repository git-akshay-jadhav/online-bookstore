import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import BookDetails from './components/BookDetails';
import SearchFilter from './components/SearchFilter';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch books from API
  const fetchBooks = async (search = '', category = '') => {
    try {
      let url = '/api/books?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      
      const response = await fetch(url);
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Delete book
  const deleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        const response = await fetch(`/api/books/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchBooks(searchTerm, selectedCategory);
          setSelectedBook(null);
        }
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingBook(null);
    fetchBooks(searchTerm, selectedCategory);
  };

  // Handle search and filter
  const handleSearch = (search, category) => {
    setSearchTerm(search);
    setSelectedCategory(category);
    fetchBooks(search, category);
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Online Bookstore</h1>
        <button 
          className="add-book-btn"
          onClick={() => setIsFormOpen(true)}
        >
          + Add New Book
        </button>
      </header>

      <SearchFilter 
        onSearch={handleSearch}
        categories={categories}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
      />

      <div className="main-content">
        <div className="books-section">
          <BookList 
            books={books}
            onSelectBook={setSelectedBook}
            onEditBook={(book) => {
              setEditingBook(book);
              setIsFormOpen(true);
            }}
            onDeleteBook={deleteBook}
            selectedBook={selectedBook}
          />
        </div>

        {selectedBook && (
          <div className="details-section">
            <BookDetails book={selectedBook} />
          </div>
        )}
      </div>

      {isFormOpen && (
        <BookForm 
          book={editingBook}
          categories={categories}
          onClose={() => {
            setIsFormOpen(false);
            setEditingBook(null);
          }}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default App;
