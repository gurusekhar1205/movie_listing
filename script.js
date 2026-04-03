const apiKey = 'd271c71a3f1bc26e36d078a2fccd801b';
const baseApiUrl = 'https://api.themoviedb.org/3';

let currentPage = 1;
let currentQuery = '';
let totalPages = 1;
let currentFilter = 'popular'; // ✅ NEW

// Fetch movies
async function fetchMovies(page = 1, query = '') {
  try {
    showLoader();

    let url = '';

    if (query) {
      url = `${baseApiUrl}/search/movie?api_key=${apiKey}&query=${query}&page=${page}`;
    } 
    else if (currentFilter === 'top_rated') {
      url = `${baseApiUrl}/movie/top_rated?api_key=${apiKey}&page=${page}`;
    } 
    else if (currentFilter === 'upcoming') {
      url = `${baseApiUrl}/movie/upcoming?api_key=${apiKey}&page=${page}`;
    } 
    else if (currentFilter === 'trending') {
      url = `${baseApiUrl}/trending/movie/week?api_key=${apiKey}&page=${page}`;
    } 
    else if (currentFilter.startsWith('genre_')) {
      const genreId = currentFilter.split('_')[1];
      url = `${baseApiUrl}/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`;
    } 
    else {
      url = `${baseApiUrl}/movie/popular?api_key=${apiKey}&page=${page}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    totalPages = data.total_pages || 1;

    return data.results;
  } catch (error) {
    showError("Failed to fetch movies");
    console.error(error);
    return [];
  } finally {
    hideLoader();
  }
}

// Display movies
function displayMovies(movies) {
  const movieContainer = document.getElementById('movieContainer');
  movieContainer.innerHTML = '';

  if (movies.length === 0) {
    movieContainer.innerHTML = '<h2>No movies found 😢</h2>';
    return;
  }

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movieCard';

    const imageUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';

    movieCard.innerHTML = `
      <img src="${imageUrl}" alt="${movie.title}" />
      <h2>${movie.title}</h2>
      <p>⭐ ${movie.vote_average} | 📅 ${movie.release_date}</p>
      <p>${movie.overview.slice(0, 80)}...</p>
      <button class="fav-btn">❤️ Add</button>
    `;

    // Modal
    movieCard.addEventListener('click', () => openModal(movie.id));

    // Favorites
    movieCard.querySelector('.fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToFavorites(movie);
    });

    movieContainer.appendChild(movieCard);
  });
}

// Debounce
function debounce(func, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), delay);
  };
}

// Search
const handleSearch = debounce(async function () {
  const input = document.getElementById('searchInput').value.trim();

  currentQuery = input;
  currentPage = 1;

  const movies = await fetchMovies(currentPage, currentQuery);
  displayMovies(movies);
  renderPagination();
}, 500);

// Pagination
function renderPagination() {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return;

  const prev = document.createElement('button');
  prev.textContent = 'Prev';
  prev.disabled = currentPage === 1;
  prev.onclick = () => changePage(currentPage - 1);
  paginationContainer.appendChild(prev);

  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    const btn = document.createElement('button');
    btn.textContent = i;

    if (i === currentPage) btn.classList.add('active');

    btn.onclick = () => changePage(i);
    paginationContainer.appendChild(btn);
  }

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = currentPage === totalPages;
  next.onclick = () => changePage(currentPage + 1);
  paginationContainer.appendChild(next);
}

// Change page
async function changePage(page) {
  currentPage = page;
  const movies = await fetchMovies(currentPage, currentQuery);
  displayMovies(movies);
  renderPagination();
}

// Favorites
function addToFavorites(movie) {
  let fav = JSON.parse(localStorage.getItem('favorites')) || [];

  if (!fav.find(m => m.id === movie.id)) {
    fav.push(movie);
    localStorage.setItem('favorites', JSON.stringify(fav));
    alert("Added to favorites ❤️");
  } else {
    alert("Already in favorites!");
  }
}

// 🎬 Modal with Trailer
async function openModal(movieId) {
  try {
    showLoader();

    const res = await fetch(`${baseApiUrl}/movie/${movieId}?api_key=${apiKey}`);
    const movie = await res.json();

    const videoRes = await fetch(`${baseApiUrl}/movie/${movieId}/videos?api_key=${apiKey}`);
    const videoData = await videoRes.json();

    const trailer = videoData.results.find(
      v => v.type === "Trailer" && v.site === "YouTube"
    );

    let trailerHTML = trailer
      ? `<iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>`
      : "<p style='padding:20px'>No trailer available</p>";

    document.getElementById('modalTrailer').innerHTML = trailerHTML;

    document.getElementById('modalTitle').textContent = movie.title;
    document.getElementById('modalDescription').textContent = movie.overview;
    document.getElementById('modalReleaseDate').textContent = "📅 " + movie.release_date;
    document.getElementById('modalImdbRating').textContent = "⭐ " + movie.vote_average;

    document.getElementById('movieDescriptionModal').style.display = 'block';

  } catch (err) {
    console.error(err);
  } finally {
    hideLoader();
  }
}

// Close modal
document.querySelector('.close').addEventListener('click', () => {
  document.getElementById('movieDescriptionModal').style.display = 'none';
});

// Close on outside click
window.onclick = function(event) {
  const modal = document.getElementById('movieDescriptionModal');
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Loader
function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}

// Error
function showError(msg) {
  document.getElementById('movieContainer').innerHTML = `<h2>${msg}</h2>`;
}

// 🔥 SIDEBAR FILTERS
function setupSidebarFilters() {
  const links = document.querySelectorAll('.sidenav a');

  links.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();

      const text = link.textContent.trim();

      currentPage = 1;
      currentQuery = '';

      if (text === "Home") currentFilter = 'popular';
      else if (text === "Top Rated") currentFilter = 'top_rated';
      else if (text === "New Releases") currentFilter = 'upcoming';
      else if (text === "Trending") currentFilter = 'trending';

      else if (text === "Action") currentFilter = 'genre_28';
      else if (text === "Comedy") currentFilter = 'genre_35';
      else if (text === "Drama") currentFilter = 'genre_18';
      else if (text === "Horror") currentFilter = 'genre_27';
      else if (text === "Romance") currentFilter = 'genre_10749';
      else if (text === "Sci-Fi") currentFilter = 'genre_878';
      else if (text === "Thriller") currentFilter = 'genre_53';
      else if (text === "Documentary") currentFilter = 'genre_99';

      const movies = await fetchMovies(currentPage, currentQuery);
      displayMovies(movies);
      renderPagination();
    });
  });
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
  const movies = await fetchMovies();
  displayMovies(movies);
  renderPagination();

  document.getElementById('searchInput').addEventListener('input', handleSearch);

  setupSidebarFilters(); // ✅ IMPORTANT
});