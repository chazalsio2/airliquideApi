export function login(req, res) {
  return res.json({
    success: true,
    data: {
      user: "Fabrice Payet",
    },
  });
}
