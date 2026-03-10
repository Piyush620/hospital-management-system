/**
 * Response Formatter Middleware
 * Standardizes all API responses across the application
 */

const sendSuccess = (res, data = null, message = "Success", statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    if (Array.isArray(data)) {
      response.data = data;
    } else if (typeof data === 'object' && ('total' in data || 'page' in data || 'data' in data)) {
      // Pagination response
      response.data = data.data || [];
      response.total = data.total;
      response.page = data.page;
      response.limit = data.limit;
    } else {
      response.data = data;
    }
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message = "Internal Server Error", statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
