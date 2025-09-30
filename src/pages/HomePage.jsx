
import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import ProductList from '../components/ProductList';
import './HomePage.css';

function HomePage() {
  const { navigate } = useNavigation();

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="logo"></div>
        <div className="search-bar">검색</div>
        <div className="alert-icon"></div>
        
      </header>

      <div className="category-bar">
        <button className="category-button">카테고리1</button>
        <button className="category-button">카테고리2</button>
        <button className="category-button">카테고리3</button>
      </div>

      <main className="home-main">
        <ProductList />
        <button onClick={() => navigate('/post')} className="write-button">글쓰기</button>
      </main>

    </div>
  );
}

export default HomePage;