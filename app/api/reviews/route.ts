export async function GET() {
  const placeId = process.env.GOOGLE_PLACE_ID;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!placeId || !apiKey) {
    return Response.json({ configured: false, reviews: [] });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("fields", "reviews,rating,user_ratings_total");
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return Response.json({ configured: true, reviews: [] }, { status: 502 });
    const data = await response.json() as { result?: { reviews?: Array<{ author_name?: string; text?: string; rating?: number }> } };
    const reviews = (data.result?.reviews ?? []).slice(0, 4).map((review) => ({
      author: review.author_name ?? "Cliente Google",
      text: review.text ?? "",
      rating: review.rating ?? 5,
    })).filter((review) => review.text);
    return Response.json({ configured: true, reviews }, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ configured: true, reviews: [] }, { status: 502 });
  }
}
