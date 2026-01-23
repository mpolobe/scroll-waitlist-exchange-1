// Simple health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "2026-01-23-v2"
  });
}
