import React from 'react';

function SearchFilter({ onSearch, categories, searchTerm, selectedCategory }) {
  const handleSearchChange = (e) => {
    onSearch(e.target.value, selectedCategory);
  };

  const handleCategoryChange = (e) => {
    onSearch(searchTerm, e.target.value);
  };

  return (
    <div className="search-filter">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search books by title or author..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>
      
      <div className="filter-box">
        <select value={selectedCategory} onChange={handleCategoryChange}>
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SearchFilter;
