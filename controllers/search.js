export async function searchTerm(req, res) {
  try {
    return res.json({ success: true, data: [] });
  } catch (e) {
    return res.status(500).json({ success: false });
  }
}
