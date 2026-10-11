const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const message = document.getElementById("message");
const gallery = document.getElementById("gallery");

// Search TVmaze for shows
async function searchShows(query) {

    gallery.replaceChildren();
    message.textContent = "Searching...";
    try {

        const encodedQuery = encodeURIComponent(query);

        const response = await fetch(
            `https://api.tvmaze.com/search/shows?q=${encodedQuery}`
        );

        if (!response.ok) {

            if (response.status === 429) {
                throw new Error(
                    "Too many requests. Please wait and try again."
                );
            }

            throw new Error(
                `Request failed with status ${response.status}.`
            );
        }

        const results = await response.json();
        if (results.length === 0) {
            message.textContent =
                `No shows found for "${query}".`;
            return;
        }

        const shows = results.slice(0, 10);
        message.textContent =
            `Showing ${shows.length} result(s) for "${query}".`;

        displayShows(shows);

    } catch (error) {

        gallery.replaceChildren();

        message.textContent =
            `Error: ${error.message}`;
    }
}

// Handle the search form
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = searchInput.value.trim();

    if (query === "") {

        gallery.replaceChildren();

        message.textContent =
            "Please enter a show title or keyword.";

        return;
    }

    searchShows(query);
});

// Display the shows and their cast information
async function displayShows(results) {

    for (const result of results) {

        const show = result.show;

        const cast = await getCast(show.id);

        const card = createShowCard(show, cast);

        gallery.appendChild(card);
    }
}

// Get cast information from TVmaze
async function getCast(showId) {

    const response = await fetch(
        `https://api.tvmaze.com/shows/${showId}/cast`
    );

    const cast = await response.json();

    return cast;
}


// Remove HTML from the show summary
function cleanSummary(summary) {

    if (!summary) {
        return "Not available";
    }

    const temporaryElement = document.createElement("div");
    temporaryElement.innerHTML = summary;

    return temporaryElement.textContent.trim() || "Not available";
}


// Format the last updated date
function formatDate(dateString) {

    if (!dateString) {
        return "Not available";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString();
}

function createShowCard(show, cast) {

    const card = document.createElement("article");
    card.className = "card";

    // Poster
    if (show.image && show.image.medium) {

        const poster = document.createElement("img");
        poster.className = "poster";
        poster.src = show.image.medium;
        poster.alt = `${show.name} poster`;

        card.appendChild(poster);

    } else {

        const poster = document.createElement("div");
        poster.className = "poster";
        poster.textContent = "Poster not available";

        poster.style.display = "flex";
        poster.style.alignItems = "center";
        poster.style.justifyContent = "center";

        card.appendChild(poster);
    }

    const content = document.createElement("div");
    content.className = "card-content";

    // Show name
    const title = document.createElement("h2");
    title.textContent = show.name || "Not available";
    content.appendChild(title);

    // Summary
    const summary = document.createElement("p");
    summary.className = "summary";
    summary.textContent = cleanSummary(show.summary);
    content.appendChild(summary);

    // Premiere date
    const premiere = document.createElement("p");
    const premiereLabel = document.createElement("span");

    premiereLabel.className = "info-label";
    premiereLabel.textContent = "Premiere: ";

    premiere.appendChild(premiereLabel);
    premiere.appendChild(
        document.createTextNode(show.premiered || "Not available")
    );

    content.appendChild(premiere);

    // Last updated
    const updated = document.createElement("p");
    const updatedLabel = document.createElement("span");

    updatedLabel.className = "info-label";
    updatedLabel.textContent = "Last updated: ";

    updated.appendChild(updatedLabel);
    updated.appendChild(
        document.createTextNode(formatDate(show.updated))
    );

    content.appendChild(updated);

    // Genres
    const genres = document.createElement("p");
    const genresLabel = document.createElement("span");

    genresLabel.className = "info-label";
    genresLabel.textContent = "Genres: ";

    genres.appendChild(genresLabel);

    let genreText = "Not available";

    if (show.genres && show.genres.length > 0) {
        genreText = show.genres.join(", ");
    }

    genres.appendChild(document.createTextNode(genreText));
    content.appendChild(genres);

    // Rating
    const rating = document.createElement("p");
    const ratingLabel = document.createElement("span");

    ratingLabel.className = "info-label";
    ratingLabel.textContent = "Rating: ";

    rating.appendChild(ratingLabel);

    let ratingValue = "Not available";

    if (show.rating && show.rating.average !== null) {
        ratingValue = show.rating.average;
    }

    rating.appendChild(document.createTextNode(ratingValue));
    content.appendChild(rating);

    // Cast
    const castTitle = document.createElement("p");
    castTitle.className = "cast-title";
    castTitle.textContent = "Main Cast:";
    content.appendChild(castTitle);

    const castList = document.createElement("ul");
    castList.className = "cast-list";

    if (cast.length === 0) {

        const castItem = document.createElement("li");
        castItem.textContent = "Not available";
        castList.appendChild(castItem);

    } else {

        cast.slice(0, 5).forEach(function (castMember) {

            const castItem = document.createElement("li");

            let actorName = "Unknown actor";
            let characterName = "Unknown character";

            if (castMember.person && castMember.person.name) {
                actorName = castMember.person.name;
            }

            if (castMember.character && castMember.character.name) {
                characterName = castMember.character.name;
            }

            castItem.textContent =
                `${actorName} as ${characterName}`;

            castList.appendChild(castItem);
        });
    }

    content.appendChild(castList);

    // TVmaze link
    const link = document.createElement("a");
    link.className = "tvmaze-link";
    link.textContent = "View on TVmaze";
    link.href = show.url || "#";
    link.target = "_blank";
    link.rel = "noopener";

    content.appendChild(link);

    card.appendChild(content);

    return card;
}