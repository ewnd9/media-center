export default (req, res, next) => {
  req.pagination = {
    limit: req.query.limit || 20,
    since: req.query.since,
    page: req.query.page || 1
  };

  next();
};
