export default async function handler(req, res) {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({
        status: "error",
        message: "Number is required"
      });
    }

    const API_URL = process.env.API_URL;
    const API_KEY = process.env.API_KEY;

    if (!API_URL || !API_KEY) {
      return res.status(500).json({
        status: "error",
        message: "Server configuration missing"
      });
    }

    const response = await fetch(
      `${API_URL}?number=${encodeURIComponent(number)}`,
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}
