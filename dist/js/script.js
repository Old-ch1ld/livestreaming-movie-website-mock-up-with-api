'use strict';
let genre, country, year, sorting;
let currentRes;
let totalPages;
let currentPage = 1;

///// Render Home Page
$(() => {
  renderHomePage();
});

function renderHomePage() {
  loadGenreDropDownContent();
  loadCountryDropDownContent();
  loadYearDropDownContent();
  loadSortingDropDownContent();
  loadHomePageMovies();
}

async function loadGenreDropDownContent() {
  try {
    const resGenres = await $.get('https://api.themoviedb.org/3/genre/movie/list?api_key=0b9764ab531a410ba39332b8bfb7a808&language=vi-VN');
    for (const key in resGenres.genres) {
      $('.filter__drop-down--genres').append($('<option>', {
        value: resGenres.genres[key].id,
        text: resGenres.genres[key].name
      }));
    };
  } catch (err) {
    console.error(err);
  }
}

async function loadCountryDropDownContent() {
  try {
    const resCountries = await $.get('https://api.themoviedb.org/3/configuration/languages?api_key=0b9764ab531a410ba39332b8bfb7a808&language=vi-VN');
    for (const item of resCountries) {
      $('.filter__drop-down--countries').append($('<option>', {
        value: item.iso_639_1,
        text: item.english_name
      }));
    }
  } catch (err) {
    console.error(err);
  }
}

function loadYearDropDownContent() {
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];
  for (const item of years) {
    $('.filter__drop-down--years').append($('<option>', {
      value: item,
      text: item
    }));
  }
}

function loadSortingDropDownContent() {
  const sortingDropDown = {
    'popularity.desc': 'Ngày cập nhật',
    'primary_release_date.desc': 'Ngày phát hành',
    'vote_average.desc': 'Điểm đánh giá'
  };
  for (const key in sortingDropDown) {
    $('.filter__drop-down--sorting').append($('<option>', {
      value: key,
      text: sortingDropDown[key]
    }));
  };
}

async function loadHomePageMovies() {
  try {
    const res = await Promise.all([
      $.get('https://api.themoviedb.org/3/movie/now_playing?api_key=0b9764ab531a410ba39332b8bfb7a808&language=vi-VN'),
      $.get('https://api.themoviedb.org/3/trending/movie/day?api_key=0b9764ab531a410ba39332b8bfb7a808&language=vi-VN')
    ]);
    renderMovies(res[0], 'nominated-movies__container');
    renderMovies(res[1], 'trending-movies__container');
  } catch (err) {
    console.error(err);
  }
}

function renderMovies(movies, className) {
  let i = 0;
  for (const movie of movies.results) {
    if ((className === 'nominated-movies__container' || className === 'trending-movies__container') && i === 10) return;
    if (!movie['poster_path'] || !movie['title'] || !movie['original_title']) continue;
    const movieBox = `
      <div class="movie-box">
        <img
          src="https://www.themoviedb.org/t/p/w220_and_h330_face${movie['poster_path']}"
          alt="${movie['original_title']} MOVIE POSTER"
          class="movie-box__img"
        />
        <p class="movie-box__title--vn">${movie['title']}</p>
        <p class="movie-box__title--en">${movie['original_title']}</p>
      </div>
    `;
    $(`.${className}`).append(movieBox);
    i++;
  }
}

///// Render movies when filtering from dropdown menu
// Inline on-change function
async function filterMoviesFromDropDownMenu(filter) {
  try {
    currentPage = 1;
    if (filter === 'genre') {
      genre = $('.filter__drop-down--genres').val();
    } else if (filter === 'country') {
      country = $('.filter__drop-down--countries').val();
    } else if (filter === 'year') {
      year = $('.filter__drop-down--years').val();
    } else if (filter === 'sorting') {
      sorting = $('.filter__drop-down--sorting').val();
    }
    await callAndRenderMovies(genre, country, year, sorting, currentPage);
    renderPaginationBtns(totalPages, currentPage);
    renderPrevNextBtns();
  } catch (err) {
    console.error(err);
  }
}

async function callAndRenderMovies(genre = '', country = '', year = '', sorting = '', page) {
  try {
    const res = await $.get(`https://api.themoviedb.org/3/discover/movie?api_key=0b9764ab531a410ba39332b8bfb7a808&language=vi-VN&sort_by=${sorting}&with_genres=${genre}&with_original_language=${country}&primary_release_year=${year}&page=${page}`);
    currentRes = res;
    totalPages = res['total_pages'];
    hideHomePageMovies();
    clearFilteredMovies();
    moveScrollBarToTop();
    renderMovies(res, 'filtered-movies__container');
    return totalPages;
  } catch (err) {
    console.error(err);
  }
}

function hideHomePageMovies() {
  if ($('.home-page-movies').css('display') === 'none') return;
  $('.home-page-movies').css('display', 'none');
}

function clearFilteredMovies() {
  $('.filtered-movies__container').empty();
}

function moveScrollBarToTop() {
  window.scrollTo(0, 0);
}

function renderPaginationBtns(totalPages, curPage) {
  let btnBoxContent = '';
  let beforePage = curPage - 2;
  let afterPage = curPage + 2;
  let active;
  currentPage = curPage;

  if (curPage >= 4) {
    btnBoxContent += `<button class="btn-container__btn--num" onclick="renderPaginationBtns(totalPages, 1)">1</button>`;
    if (curPage > 4 && totalPages >= 7) {
      btnBoxContent += `<a class="btn-container__dots">...</a>`;
    }
  }

  if (totalPages >= 3) {
    if (curPage >= 5) {
      if (curPage === totalPages) {
        if (curPage > 5) {
          beforePage -= 2;
        } else {
          beforePage -= 1;
        }
      } else if (curPage === totalPages - 1) {
        beforePage -= 1;
      }
    }

    if (curPage === 1) {
      afterPage += 2;
    } else if (curPage === 2) {
      afterPage += 1;
    }
  }

  for (let btnNumber = beforePage; btnNumber <= afterPage; btnNumber++) {
    if (btnNumber > totalPages || btnNumber <= 0) continue;
    active = currentPage === btnNumber ? 'js-active' : '';
    btnBoxContent += `<button class="btn-container__btn--num ${active}" onclick="renderPaginationBtns(totalPages, ${btnNumber})">${btnNumber}</button>`;
  }

  if (totalPages >= 6 && curPage < totalPages - 2) {
    if (totalPages > 6 && curPage < totalPages - 3) {
      btnBoxContent += `<a class="btn-container__dots">...</a>`;
    }
    btnBoxContent += `<button class="btn-container__btn--num" onclick="renderPaginationBtns(totalPages, ${totalPages})">${totalPages}</button>`
  }

  $('.btn-container__btn-box-numbers').html(btnBoxContent);
  callAndRenderMovies(genre, country, year, sorting, currentPage);
}

function renderPrevNextBtns() {
  if ($('.btn-container__btn--previous').length !== 0) return;
  const btnBox = `
      <button class="btn-container__btn--previous" onclick="changePage('previous')">Trang trước</button>
      <button class="btn-container__btn--next" onclick="changePage('next')">Trang sau</button>
  `;
  $('.btn-container__btn-box-pre-next').append(btnBox);
}

function changePage(button) {
  if (button === 'previous') {
    if (currentPage === 1) return;
    currentPage--;
  } else if (button === 'next') {
    if (currentPage >= currentRes['total_pages']) return;
    currentPage++;
  }
  callAndRenderMovies(genre, country, year, sorting, currentPage);
  renderPaginationBtns(totalPages, currentPage);
  renderPrevNextBtns();
}

///// Toggle nav bar
function toggleNavBar(e) {
  if ($('.header__nav-bar--res').length !== 0) {
    $('.header__nav-bar--res').remove();
    return;
  }
  const header = $(e.target).closest('.header');
  const navBarRes = `
        <nav class="header__nav-bar--res">
          <div class="header__nav-bar-container">
            <a href="#" class="header__nav-bar-item"
              ><i class="fas fa-search"></i>Tìm kiếm</a
            >
            <a href="#" class="header__nav-bar-item">Phim Lẻ</a>
            <a href="#" class="header__nav-bar-item">Phim Bộ</a>
            <a href="#" class="header__nav-bar-item">Tất cả phim</a>
            <a href="#" class="header__nav-bar-item">FAQ</a>
          </div>
    
          <div class="header__btn-container">
            <button class="header__btn-signup">Đăng nhập</button>
          </div>
        </nav>
      `;
  header.append(navBarRes);
}

///// Keep nav bar at the top of the page when scrolling
$(window).scroll(() => {
  const scroll = $(window).scrollTop();
  if (scroll > 96) {
    $('.header').css('background-color', 'rgba(6, 18, 30, .9)');
  } else {
    $('.header').css('background-color', 'rgb(6, 18, 30)');
  }
});