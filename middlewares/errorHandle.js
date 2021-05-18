export default function (err, req, res, next) {
  return res
    .status(err.code || 500)
    .json({ success: false, reason: err.message });
}
