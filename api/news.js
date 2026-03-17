export default async function handler(req, res) {
  const { categories } = req.query
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY

  try {
    const url = `https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=${encodeURIComponent(categories || 'XRP')}&sortOrder=latest&extraParams=xrp-tracker`
    const upstream = await fetch(url, {
      headers: apiKey ? { authorization: `Apikey ${apiKey}` } : {}
    })
    const json = await upstream.json()
    res.json(json)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
