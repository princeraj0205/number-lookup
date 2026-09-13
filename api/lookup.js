export default async function handler(req, res) {
  try {
    const { number } = req.query;

    if (!number) {
      return res.status(400).json({
        status: "error",
        message: "Number is required"
      });
    }

    const API_KEY = process.env.API_KEY;
    const BASE_URL = process.env.API_URL;

    if (!API_KEY || !BASE_URL) {
      return res.status(500).json({
        status: "error",
        message: "Server configuration missing"
      });
    }

    const cleanNumber = String(number).replace(/[^0-9]/g, "");

    if (cleanNumber.length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Invalid number"
      });
    }

    const url =
      BASE_URL +
      API_KEY +
      "?Astha=" +
      encodeURIComponent(cleanNumber);

    const response = await fetch(url);

    const data = await response.json();

    return res.status(response.status).json(data);

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server error"
    });
  }
}
