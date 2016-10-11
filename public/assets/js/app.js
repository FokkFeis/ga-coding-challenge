var currentlyLoadedPath;

//Listen for lifecycle/events for the webpage.  In this case I'm listening for events that would require the DOM to be re-loaded/updated.
window.onload = updateDomForHash;
window.addEventListener('hashchange', updateDomForHash);


//Very rudimentary router for this simple SPA. In the real world you would want a more robust routing function/library.
function updateDomForHash() {

  var movieMatches = window.location.hash.match(/#\/movies\/(.*)$/);
  var favMatches = window.location.hash.match(/#\/favorites(\/.*)?$/);

  if (movieMatches) {
    var movieId = movieMatches[1];

    if (!!movieId) {
      showDashboard();
      fetchMovie(movieId);
    }
  } else if (favMatches) {
    showFavorites();
    fetchFavorites();

    var favIdMatches = window.location.hash.match(/#\/favorites\/(.*)$/);

    if (favIdMatches) {
      var favId = favIdMatches[1];

      if (!!favId) {
        fetchMovie(favId);
      }
    }
  } else {
    showDashboard();
  }
}

//showDashboard() is responsible for initalizing the DOM for the dashboard/default view
function showDashboard() {
  if (currentlyLoadedPath != "dashboard") {
    document.getElementById("headerTitle").innerHTML = "Search Movies Below"
    document.getElementById("movieSearchBox").style.display = "";
    document.getElementById("searchButton").style.display = "";

    document.getElementById('movieList').innerHTML = "";
    document.getElementById('rightColumn').innerHTML = "";

    currentlyLoadedPath = "dashboard";
  }
}

//showFavorites() is responsible for initalizing the DOM for the displaying the user's favorites view
function showFavorites() {
  if (currentlyLoadedPath != "favorites") {
    document.getElementById("headerTitle").innerHTML = "Favorites"
    document.getElementById("movieSearchBox").style.display = "none";
    document.getElementById("searchButton").style.display = "none";

    document.getElementById('movieList').innerHTML = "";
    document.getElementById('rightColumn').innerHTML = "";

    currentlyLoadedPath = "favorites";
  }
}

//User interaction listeners to help my app respond to user's intentions
function favoriteClicked(name, imdbID) {
  fetchJSON('/favorites', { name: name, oid: imdbID }, function(responseData, error) {
    if (!!error) {
      console.error("Error loading data.");
    }
  }, "POST");
}

function searchMovies() {
  var searchString = document.getElementById("movieSearchBox").value;

  fetchMovies(searchString);
}

//The below "fetch" methods handle interacting with API endpoints to retrieve data needed by the app.
function fetchMovies(searchString) {
  //Use JSON fetcher method to load in movies that match the string the user input
  var searchUrl = "http://www.omdbapi.com/?s=" + searchString

  fetchJSON(searchUrl, null, function(moviesData, error) {
    if (!!error) {
      console.error("Error loading data.");
    } else {
      loadMovies(moviesData.Search);
    }
  });
}

function fetchMovie(movieId) {
  var movieUrl = "http://www.omdbapi.com/?i=" + movieId

  fetchJSON(movieUrl, null, function(movieData, error) {
    if (!!error) {
      console.error("Error loading data.");
    } else {
      loadMovie(movieData);
    }
  });
}

function fetchFavorites() {
  fetchJSON('/favorites', null, function(favsData, error) {
    if (!!error) {
      console.error("Error loading data.");
    } else {
      loadMovies(favsData, true);
    }
  });
}

//Mehtods for loading fetched data into the DOM
function loadMovies(movies, favorites = false) {
  var movieList = document.getElementById('movieList');

  //Let's clear out any other "old results" before adding the new results.
  movieList.innerHTML = "";

  var moviesListHtml = movies.forEach(function(movie) {
    var movieItem = document.createElement('a');

    if (favorites) {
      movieItem.href = "#/favorites/" + movie.oid;
      movieItem.appendChild(document.createTextNode(movie.name));
    } else {
      movieItem.href = "#/movies/" + movie.imdbID;
      movieItem.appendChild(document.createTextNode(movie.Title));
    }

    movieItem.className = "list-group-item list-group-item-action";
    movieList.appendChild(movieItem);
  });
}

function loadMovie(movie) {
  var movieDetailSource = document.getElementById("movieDetails").innerHTML;
  var template = Handlebars.compile(movieDetailSource);

  document.getElementById("rightColumn").innerHTML = template(
    {
      imdbID: movie.imdbID,
      posterUrl: movie.Poster,
      title: movie.Title,
      year: movie.Year,
      rating: movie.Rated,
      genre: movie.Genre,
      cast: movie.Actors,
      imdbRating: movie.imdbRating,
      plot: movie.Plot
    });
}

//Common use JSON fetcher.  To prevent repeating the code that actually handles fetching JSON from API endpoints I have a method which provides a consistant means for performing this task
function fetchJSON(url, body, callback, method = 'GET') {
    var httpRequest = new XMLHttpRequest();
    //Attach state listener to handle state changes in the request.
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) {
                  callback(data);
                }
            } else {
              //If we were writing a production app this would need to be way more robust to handle errors.  For now though we will be optimistic.
              if (callback) {
                callback(null, new Error("Error loading data."));
              }
            }
        }
    };

    httpRequest.open(method, url);
    if (!!body) {
      httpRequest.setRequestHeader("Content-Type", "application/json");
      httpRequest.send(JSON.stringify(body));
    } else {
      httpRequest.send();
    }
}
