function validate(schema, source = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: result.error.issues.map((issue) => ({
            path: issue.path,
            message: issue.message,
          })),
        },
      });
    }

    req[source] = result.data;
    next();
  };
}

export default validate;
