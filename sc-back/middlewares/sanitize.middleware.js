const sanitizeHtml = require('sanitize-html');

const sanitizeFields = (fields) => (req, res, next) => {
  fields.forEach(field => {
    if (req.body[field]) {
      req.body[field] = sanitizeHtml(req.body[field], {
        allowedTags: [],
        allowedAttributes: {}
      });
    }
  });
  next();
};

module.exports = { sanitizeFields };