import SourceHandler from "../handler/sources.handler";
import { cacheManager, ResponseHandler, Source } from "../index";

class StreamController {
  private sourceHandler: SourceHandler;

  constructor() {
    this.sourceHandler = new SourceHandler();
  }

  async getSearch(req: any, res: any) {
    try {
      const { query, source = Source.XPRIME } = req.body;

      if (!query) {
        return ResponseHandler.badRequest(res, "query is required");
      }

      const cacheKey = `${source}_${query}`;
      let hitCached = cacheManager.get("search", cacheKey);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Search data retrieved successfully (Cached)"
        );
      }

      const results = await this.sourceHandler.search(query);

      if (results.length === 0) {
        return ResponseHandler.error(res, "No results found", 404);
      }

      cacheManager.set("search", cacheKey, results);

      return ResponseHandler.success(
        res,
        results,
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

  async getDetails(req: any, res: any) {
    try {
      const { id, source = Source.XPRIME } = req.body;

      if (!id) {
        return ResponseHandler.badRequest(res, "id is required");
      }

      const cacheKey = `${source}_${id}`;
      let hitCached = cacheManager.get("details", cacheKey);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Details data retrieved successfully (Cached)"
        );
      }

      const result = await this.sourceHandler.getDetails(id, source);

      cacheManager.set("details", cacheKey, result);

      return ResponseHandler.success(
        res,
        result,
        "Details data retrieved successfully"
      );
    } catch (error) {
      console.log("Details error:", error);
      return ResponseHandler.error(res, "Error getting details", 500, error);
    }
  }

  async getStream(req: any, res: any) {
    try {
      const { id, source = Source.XPRIME } = req.body;

      if (!id) {
        return ResponseHandler.badRequest(res, "id is required");
      }

      const cacheKey = `${source}_${id}`;
      let hitCached = cacheManager.get("stream", cacheKey);

      if (hitCached) {
        return ResponseHandler.success(
          res,
          hitCached,
          "Stream data retrieved successfully (Cached)"
        );
      }

      const data = await this.sourceHandler.getStreams(id, source);

      if ((!data || data.length === 0) && data[0].url) {
        return ResponseHandler.error(res, "No streams found", 404);
      }

      cacheManager.set("stream", cacheKey, data);

      return ResponseHandler.success(
        res,
        data,
        "Stream data retrieved successfully"
      );
    } catch (error) {
      console.error("Error in getStream:", {
        message: error.message,
        id: req.body?.id,
        source: req.body?.source,
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

  static async getSearch(req: any, res: any) {
    const controller = new StreamController();
    return controller.getSearch(req, res);
  }

  static async getDetails(req: any, res: any) {
    const controller = new StreamController();
    return controller.getDetails(req, res);
  }

  static async getStream(req: any, res: any) {
    const controller = new StreamController();
    return controller.getStream(req, res);
  }
}

export default StreamController;
