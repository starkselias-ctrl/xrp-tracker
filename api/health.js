export default function handler(req, res) {
  res.json({
    ok: true,
    apiKey: !!process.env.ANTHROPIC_API_KEY
  })
}
