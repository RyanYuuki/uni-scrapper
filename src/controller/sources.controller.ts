import {
  axios,
  cacheManager,
  ResponseHandler,
  SearchResult,
  Xprime,
} from "../index";

class StreamController {
  static async getSearch(req: any, res: any) {
    try {
      const { query } = req.body;

      if (!query) {
        return ResponseHandler.badRequest(res, "query is required");
      }

      const cleanedQuery = query.replace(/\bseasons?\b/gi, "").trim();

      let hitCached = cacheManager.get("search", cleanedQuery);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Search data retrieved successfully (Cached)"
        );
      }

      const movieUrl = `https://tmdb.hexa.watch/api/tmdb/search/movie?query=${encodeURIComponent(cleanedQuery)}&page=1&include_adult=false`;
      const tvUrl = `https://tmdb.hexa.watch/api/tmdb/search/tv?query=${encodeURIComponent(cleanedQuery)}&page=1&include_adult=false`;

      const [movieRes, tvRes] = await Promise.all([
        axios.get(movieUrl),
        axios.get(tvUrl),
      ]);

      if (movieRes.status !== 200) {
        throw new Error(`Failed to load movie data: ${movieRes.status}`);
      }
      if (tvRes.status !== 200) {
        throw new Error(`Failed to load TV data: ${tvRes.status}`);
      }

      const movies: SearchResult[] = (movieRes.data.results || []).map(
        (e: any) => ({
          id: `https://tmdb.hexa.watch/api/tmdb/movie/${e.id}`,
          title: e.title || e.name,
          poster: `https://image.tmdb.org/t/p/w500${e.poster_path || e.backdrop_path || ""}`,
        })
      );

      const series: SearchResult[] = (tvRes.data.results || []).map(
        (e: any) => ({
          id: `https://tmdb.hexa.watch/api/tmdb/tv/${e.id}`,
          title: e.title || e.name,
          poster: `https://image.tmdb.org/t/p/w500${e.poster_path || e.backdrop_path || ""}`,
        })
      );

      const mixedResults: SearchResult[] = [];
      const maxLength = Math.max(movies.length, series.length);

      for (let i = 0; i < maxLength; i++) {
        if (i < series.length) mixedResults.push(series[i]);
        if (i < movies.length) mixedResults.push(movies[i]);
      }

      cacheManager.set("search", cleanedQuery, mixedResults);

      return ResponseHandler.success(
        res,
        mixedResults,
        "Search results retrieved successfully"
      );
    } catch (error) {
      console.log("Search error:", error);
      return ResponseHandler.error(
        res,
        "Error getting search results",
        500,
        error
      );
    }
  }

  static async getDetails(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return ResponseHandler.badRequest(res, "id is required");
      }

      let hitCached = cacheManager.get("details", id);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Details data retrieved successfully (Cached)"
        );
      }

      const origin = new URL(id).origin;

      const data = (
        await axios.get(id, {
          headers: {
            Referer: origin + "/",
            origin,
          },
        })
      ).data;

      if (!data) {
        return ResponseHandler.error(res, "Error getting details", 500);
      }

      const isMovie = id.includes("movie");

      const name = data.name || data.title;
      const seasons = [];
      let content = null;

      const idMatch = id.match(/(?:movie|tv)\/(\d+)/);
      const tmdbId = idMatch?.[1];
      const imdbId = data.imdb_id;

      if (!tmdbId) throw new Error("Invalid TMDB ID in URL");

      if (isMovie) {
        const releaseDate = data.release_date || "";
        const year = releaseDate ? releaseDate.split("-")[0] : "";
        content = {
          title: "Movie",
          id: JSON.stringify({
            name,
            imdbId,
            tmdbId,
            year,
            type: "movie",
          }),
        };
      } else {
        const seasonList = data.seasons || [];

        for (const season of seasonList) {
          if (season.season_number === 0) continue;

          const currentSeason = {
            title: `Season ${season.season_number}`,
            poster: `https://image.tmdb.org/t/p/w500${season.poster_path || season.backdrop_path || ""}`,
            episodes: [],
          };

          const episodeCount = season.episode_count || 0;
          const airDate = season.air_date || "";
          const year = airDate ? airDate.split("-")[0] : "";

          for (let ep = 1; ep <= episodeCount; ep++) {
            currentSeason.episodes.push({
              title: `Episode ${ep}`,
              id: JSON.stringify({
                name,
                year,
                tmdbId,
                imdbId,
                season: season.season_number,
                episode: ep,
                type: "tv",
              }),
            });
          }

          seasons.push(currentSeason);
        }
      }

      let result = {};

      if (isMovie) {
        result = {
          id: id,
          title: name,
          poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
          seasons: [
            {
              title: "Movie",
              poster: "",
              episodes: [content],
              type: "movie",
            },
          ],
        };
      }

      result = {
        id: id,
        title: name,
        poster: `https://image.tmdb.org/t/p/w500${data.poster_path}`,
        seasons: seasons,
        type: isMovie ? "movie" : "tv",
      };

      cacheManager.set("details", id, result);

      return ResponseHandler.success(
        res,
        result,
        "Details data retrieved successfully"
      );
    } catch (error) {
      return ResponseHandler.error(res, "Error getting details", 500, error);
    }
  }

  static async getStream(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return ResponseHandler.badRequest(res, "id is required");
      }

      let hitCached = cacheManager.get("stream", id);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Stream data retrieved successfully (Cached)"
        );
      }

      const data = await new Xprime().getStreams(JSON.stringify(req.body));

      if (!data) {
        return ResponseHandler.error(res, "Error getting stream", 500);
      }

      cacheManager.set("stream", id, data);

      return ResponseHandler.success(
        res,
        data,
        "Stream data retrieved successfully"
      );
    } catch (error) {
      console.error("Error in getStream:", {
        message: error.message,
        url: req.body?.url,
        timestamp: new Date().toISOString(),
      });

      if (error.code === "ECONNABORTED") {
        return ResponseHandler.error(res, "Request timeout", 408);
      }

      if (error.response) {
        return ResponseHandler.error(
          res,
          `External service error: ${error.response.status}`,
          502
        );
      }

      if (error.request) {
        return ResponseHandler.error(
          res,
          "No response from external service",
          503
        );
      }

      return ResponseHandler.error(res, "Error getting stream", 500, error);
    }
  }
}
export default StreamController;
