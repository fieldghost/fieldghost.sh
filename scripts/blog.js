document.addEventListener("DOMContentLoaded", function () {
  var feedContainer = document.getElementById("blog-feed-container");
  var postContainer = document.getElementById("blog-post-container");

  // If we aren't on a page with blog elements, stop executing.
  if (!feedContainer && !postContainer) return;

  // Fetch the manifest
  fetch("/blog/entries/manifest.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (posts) {
      // Check the URL to see if we are trying to load a specific post (e.g., /blog?post=hello-world)
      var urlParams = new URLSearchParams(window.location.search);
      var postId = urlParams.get("post");

      if (postId && postContainer) {
        // --- LOAD SINGLE POST ---
        var postMeta = posts.filter(function (p) {
          return p.id === postId;
        })[0];

        if (postMeta) {
          fetch("/blog/entries/" + postMeta.file)
            .then(function (res) {
              return res.text();
            })
            .then(function (text) {
              // 'white-space: pre-wrap;' is the magic CSS that makes HTML respect the line breaks in your .txt file!
              postContainer.innerHTML =
                "<h1>" +
                postMeta.title +
                "</h1>" +
                "<span class='blog-date' style='margin-left: 0;'>" +
                postMeta.date +
                "</span>" +
                "<div class='intro-text' style='margin-top: 2rem; white-space: pre-wrap; color: var(--text-color); line-height: 1.6;'>" +
                text +
                "</div>" +
                "<a href='/blog' class='read-more' style='margin-top: 2rem; display: inline-block;'>&larr; Return to Blog</a>";
            });
        } else {
          postContainer.innerHTML = "<h1>404</h1><p>Blog post not found.</p>";
        }
      } else if (feedContainer) {
        // --- LOAD THE FEED ---
        var limit = feedContainer.getAttribute("data-limit") || posts.length;
        var html = "";

        for (var i = 0; i < limit && i < posts.length; i++) {
          html +=
            "<a href='/blog?post=" +
            posts[i].id +
            "' class='blog-card'>" +
            "<div class='blog-header'>" +
            "<h2>" +
            posts[i].title +
            "</h2>" +
            "<span class='blog-date'>" +
            posts[i].date +
            "</span>" +
            "</div>" +
            "<div class='blog-snippet'><p>" +
            posts[i].snippet +
            "</p></div>" +
            "<span class='read-more'>Read Blog Post &rarr;</span>" +
            "</a>";
        }
        feedContainer.innerHTML = html;
      }
    })
    .catch(function (error) {
      console.error("Error loading blog data:", error);
    });
});
