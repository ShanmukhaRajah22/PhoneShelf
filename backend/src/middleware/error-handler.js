function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  let statusCode = error.statusCode || 500;
  let code = error.code || "INTERNAL_SERVER_ERROR";
  let message = error.message || "An unexpected error occurred.";
  let details;

  if (error.type === "entity.parse.failed") {
    statusCode = 400;
    code = "MALFORMED_JSON";
    message = "Request body contains malformed JSON.";
  } else if (error.name === "ValidationError") {
    statusCode = 400;
    code = "DATABASE_VALIDATION_ERROR";
    message = "Phone data failed database validation.";
    details = Object.values(error.errors).map((item) => ({
      path: item.path,
      message: item.message,
    }));
  } else if (error.code === 11000) {
    statusCode = 409;
    code = "DUPLICATE_PHONE";
    message = "A phone with this brand and model already exists.";
  } else if (error.name === "CastError") {
    statusCode = 400;
    code = "INVALID_ID";
    message = "The supplied identifier is invalid.";
  } else if (error.code === "RATE_LIMIT_UNAVAILABLE") {
    statusCode = 503;
    code = "RATE_LIMIT_UNAVAILABLE";
    message =
      "Rate limiting is temporarily unavailable. Please try again later.";
  } else if (error.name === "ZodError") {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Request validation failed.";
    details = error.issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    }));
  } else if (error.code === "AI_TIMEOUT") {
    statusCode = 504;
    code = "AI_TIMEOUT";
    message = "The comparison model timed out. Please try again.";
  } else if (error.code === "AI_PROVIDER_FAILURE") {
    statusCode = 502;
    code = "AI_PROVIDER_FAILURE";
    message = "The comparison provider could not complete the request.";
  } else if (error.code === "INVALID_AI_OUTPUT") {
    statusCode = 502;
    code = "INVALID_AI_OUTPUT";
    message = "The comparison provider returned an invalid result.";
  }

  const response = {
    success: false,
    error: { code, message },
  };

  if (details) {
    response.error.details = details;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(response);
}

export default errorHandler;
