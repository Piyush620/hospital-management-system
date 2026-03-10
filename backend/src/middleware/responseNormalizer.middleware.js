const META_KEYS = new Set(["success", "message", "data", "total", "page", "limit"]);
const isStrictResponse = () => process.env.RESPONSE_STRICT === "true";

const normalizeSuccessResponse = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (
      body &&
      typeof body === "object" &&
      !Array.isArray(body) &&
      body.success === true &&
      body.data === undefined
    ) {
      const payloadKeys = Object.keys(body).filter((key) => !META_KEYS.has(key));

      if (payloadKeys.length === 1) {
        body.data = body[payloadKeys[0]];
      } else if (payloadKeys.length > 1) {
        const aggregated = {};
        for (const key of payloadKeys) {
          aggregated[key] = body[key];
        }
        body.data = aggregated;
      }

      if (isStrictResponse()) {
        for (const key of payloadKeys) {
          delete body[key];
        }
      }
    }

    return originalJson(body);
  };

  next();
};

module.exports = normalizeSuccessResponse;
