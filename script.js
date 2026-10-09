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

// Display the shows
function displayShows(results) {

    gallery.replaceChildren();

    results.forEach(function (result) {

        const show = result.show;

        const card = document.createElement("div");
        card.className = "card";

        const title = document.createElement("h2");
        title.textContent = show.name;

        card.appendChild(title);
        gallery.appendChild(card);
    });
}