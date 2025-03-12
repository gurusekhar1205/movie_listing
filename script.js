const apiKey = 'd271c71a3f1bc26e36d078a2fccd801b';
const baseApiUrl = 'https://api.themoviedb.org/3';
let currentPage = 1;
const moviesPerPage = 10;



// Fetch popular movies
async function fetchMovies(page = 1) {
  try {
    const response = await fetch(`${baseApiUrl}/movie/popular?api_key=${apiKey}&page=${page}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
}

// Display movies on the page
function displayMovies(movies) {
  const movieContainer = document.getElementById('movieContainer');
  movieContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movieCard';
    movieCard.addEventListener('click', () => openModal(movie));

    const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    const movieImage = document.createElement('img');
    movieImage.src = imageUrl;
    movieCard.appendChild(movieImage);

    const movieTitle = document.createElement('h2');
    movieTitle.textContent = movie.title;
    movieCard.appendChild(movieTitle);

    const movieOverview = document.createElement('p');
    movieOverview.textContent = movie.overview;
    movieCard.appendChild(movieOverview);

    movieContainer.appendChild(movieCard);
  });
}

// Handle search functionality
function handleSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchTerm = searchInput.value.toLowerCase();

  const movieCards = document.getElementsByClassName('movieCard');
  for (const card of movieCards) {
    const title = card.querySelector('h2').textContent.toLowerCase();
    if (title.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  }
}

// Render pagination
function renderPagination(totalPages) {
  const paginationContainer = document.getElementById('pagination');
  paginationContainer.innerHTML = '';

  // Add "Prev" button
  const prevButton = document.createElement('a');
  prevButton.href = '#';
  prevButton.className = 'pagination-link';
  prevButton.textContent = 'Prev';
  prevButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      loadMovies();
    }
  });
  paginationContainer.appendChild(prevButton);

  // Calculate the start and end page numbers for pagination
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + 4);
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    const paginationLink = document.createElement('a');
    paginationLink.href = '#';
    paginationLink.className = 'pagination-link';
    paginationLink.textContent = i;
    if (i === currentPage) {
      paginationLink.classList.add('active');
    }
    paginationLink.addEventListener('click', (event) => {
      event.preventDefault();
      currentPage = i;
      loadMovies();
    });
    paginationContainer.appendChild(paginationLink);
  }

  // Add "Next" button
  const nextButton = document.createElement('a');
  nextButton.href = '#';
  nextButton.className = 'pagination-link';
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      loadMovies();
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Load movies and display them
async function loadMovies() {
  const movies = await fetchMovies(currentPage);
  displayMovies(movies);

  // Fetch total pages from API response
  const totalPages = 100; // Replace with the actual total pages from the API response if available
  renderPagination(totalPages);
}

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
  loadMovies();

  // Event listener for search input
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', handleSearch);
});
