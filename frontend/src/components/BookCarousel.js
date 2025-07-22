import React, { useRef, useState, useEffect } from 'react';

function BookCarousel({ books, onSelectBook, title = "Featured Books", subtitle = "" }) {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons(); // Initial check
      
      return () => {
        carousel.removeEventListener('scroll', checkScrollButtons);
      };
    }
  }, [books]);

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="book-carousel">
      <div className="carousel-header">
        <div className="carousel-title-section">
          <h2>{title}</h2>
          {subtitle && <p className="carousel-subtitle">{subtitle}</p>}
        </div>
        <div className="carousel-controls">
          <button 
            className={`carousel-btn prev ${!canScrollLeft ? 'disabled' : ''}`}
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            ←
          </button>
          <button 
            className={`carousel-btn next ${!canScrollRight ? 'disabled' : ''}`}
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            →
          </button>
        </div>
      </div>
      
      <div className="carousel-container" ref={carouselRef}>
        <div className="carousel-track">
          {books.map((book) => (
            <div 
              key={book.id}
              className="carousel-book-card"
              onClick={() => onSelectBook(book)}
            >
              <div className="book-cover-wrapper">
                <img 
                  src={book.cover_url} 
                  alt={`${book.title} cover`}
                  className="book-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/200x280/667eea/white?text=${encodeURIComponent(book.title.split(' ').slice(0, 3).join(' '))}`;
                  }}
                />
                <div className="book-overlay">
                  <div className="overlay-top">
                    <span className="book-price">${book.price}</span>
                    {book.stock <= 5 && (
                      <span className="low-stock">Low Stock!</span>
                    )}
                  </div>
                  <div className="overlay-bottom">
                    <span className="book-stock">Stock: {book.stock}</span>
                    <button className="quick-view-btn">
                      👁️ View
                    </button>
                  </div>
                </div>
              </div>
              <div className="book-info">
                <h4 className="book-title">{book.title}</h4>
                <p className="book-author">by {book.author}</p>
                <span className="book-category">{book.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookCarousel;
