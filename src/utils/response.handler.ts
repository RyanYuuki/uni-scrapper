import dotenv from "dotenv";

dotenv.config({ path: ".env" });

class ResponseHandler {
  static success(
    res: any,
    data: any = null,
    message = "Success",
    statusCode = 200
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res: any,
    message = "Internal Server Error",
    statusCode = 500,
    error = null
  ) {
    let response = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === "development" && error) {
      const newResp = {
        error: "",
        stack: "",
      };
      newResp.error = (error as any).message;
      newResp.stack = (error as any).stack;
      response = {
        ...response,
        ...newResp,
      };
    }

    return res.status(statusCode).json(response);
  }

  static badRequest(res: any, message = "Bad Request", errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: any, message = "Unauthorized") {
    return this.error(res, message, 401);
  }

  static forbidden(res: any, message = "Forbidden") {
    return this.error(res, message, 403);
  }

  static notFound(res: any, message = "Not Found") {
    return this.error(res, message, 404);
  }

  static conflict(res: any, message = "Conflict") {
    return this.error(res, message, 409);
  }

  static validationError(res: any, errors: any) {
    return this.error(res, "Validation Error", 422, errors);
  }
}

export { ResponseHandler };
