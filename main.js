const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c';
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieResults = document.getElementById('movieResults');
const favoriteMovies = document.getElementById('favoriteMovies');
const navBtns = document.querySelectorAll('.nav-btn');

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let lastSearchResults = [];

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const section = btn.dataset.section;
    document.querySelector('.search-section').classList.toggle('active', section === 'search');
    document.querySelector('.favorites-section').classList.toggle('active', section === 'favorites');
    
    if (section === 'favorites') {
      displayFavorites();
    }
  });
});

async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  try {
    const response = await fetch(
      `${API_BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    lastSearchResults = data.results;
    displayMovies(data.results, movieResults);
  } catch (error) {
    console.error('Error searching movies:', error);
    movieResults.innerHTML = '<p>Error searching movies. Please try again.</p>';
  }
}

function displayMovies(movies, container) {
  if (!movies || !movies.length) {
    container.innerHTML = '<p>No movies found.</p>';
    return;
  }

  container.innerHTML = movies.map(movie => {
    const isFavorite = favorites.some(f => f.id === movie.id);
    return `
      <div class="movie-card" data-movie-id="${movie.id}">
        <img 
          src="${movie.poster_path 
            ? IMAGE_BASE_URL + movie.poster_path 
            : 'https://via.placeholder.com/500x750.png?text=No+Poster'}"
          alt="${movie.title}"
          onerror="this.src='https://via.placeholder.com/500x750.png?text=No+Poster'"
        >
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</p>
          <button onclick="toggleFavorite(${movie.id})" class="fav-btn">
            ${isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function displayFavorites() {
  displayMovies(favorites, favoriteMovies);
}

function toggleFavorite(movieId) {
  const index = favorites.findIndex(m => m.id === movieId);
  if (index === -1) {
    const movie = lastSearchResults.find(m => m.id === movieId);
    if (movie) {
      favorites.push(movie);
    }
  } else {
    favorites.splice(index, 1);
  }
  saveFavorites();
  displayFavorites();
  if (lastSearchResults.length > 0) {
    displayMovies(lastSearchResults, movieResults);
  }
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

window.toggleFavorite = toggleFavorite;
window.displayFavorites = displayFavorites;

displayFavorites();