export default (req, res, next) => {
  const limit = req.query.limit || 20;
  const since = req.query.since;
  const page = req.query.page || 1;
  const startIndex = (page - 1) * limit;

  req.pagination = {
    limit,
    since,
    page,
    startIndex
  };

  next();
};
