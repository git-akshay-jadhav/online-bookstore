import React, { useState, useEffect } from 'react';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import BookDetails from './components/BookDetails';
import SearchFilter from './components/SearchFilter';
import BookCarousel from './components/BookCarousel';
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

  // Get featured books (latest or high stock)
  const getFeaturedBooks = () => {
    return books
      .filter(book => book.stock > 5)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);
  };

  // Get books by category
  const getBooksByCategory = (category) => {
    return books.filter(book => book.category === category).slice(0, 8);
  };

  // Fetch books from API
  const fetchBooks = async (search = '', category = '') => {
    try {
      setLoading(true);
      let url = '/api/books?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (category) url += `category=${encodeURIComponent(category)}&`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      alert('Error loading books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
          alert('Book deleted successfully!');
        } else {
          throw new Error('Failed to delete book');
        }
      } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
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

  // Handle book selection
  const handleSelectBook = (book) => {
    setSelectedBook(book);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await Promise.all([
        fetchBooks(),
        fetchCategories()
      ]);
      setLoading(false);
    };
    
    initializeApp();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your premium bookstore...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>📚 Premium Bookstore</h1>
          <p className="header-subtitle">Discover your next favorite read</p>
        </div>
        <button 
          className="add-book-btn"
          onClick={() => setIsFormOpen(true)}
        >
          <span>+</span> Add New Book
        </button>
      </header>

      {/* Book Carousels */}
      <div className="carousels-section">
        {/* Featured Books Carousel */}
        {getFeaturedBooks().length > 0 && (
          <BookCarousel 
            books={getFeaturedBooks()}
            onSelectBook={handleSelectBook}
            title="🌟 Featured Books"
            subtitle="Discover our most popular and newest additions"
          />
        )}

        {/* Category-based Carousels */}
        {categories.slice(0, 4).map(category => {
          const categoryBooks = getBooksByCategory(category);
          if (categoryBooks.length > 0) {
            const categoryEmoji = {
              'Fiction': '📖',
              'Science Fiction': '🚀',
              'Fantasy': '🐲',
              'Romance': '💝',
              'Programming': '💻',
              'Philosophy': '🤔'
            };
            
            return (
              <BookCarousel 
                key={category}
                books={categoryBooks}
                onSelectBook={handleSelectBook}
                title={`${categoryEmoji[category] || '📚'} ${category} Collection`}
                subtitle={`Explore our ${category.toLowerCase()} selection`}
              />
            );
          }
          return null;
        })}
      </div>

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
            onSelectBook={handleSelectBook}
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
