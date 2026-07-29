/**
 * Curated, verified photos of famous places.
 *
 * Every imageUrl was confirmed (via the Wikipedia REST summary API) to be
 * hosted on upload.wikimedia.org/wikipedia/commons/... — Commons-hosted
 * files are freely licensed (CC/public domain) and meant for reuse, unlike
 * Wikipedia's own /wikipedia/en/... fair-use uploads, which are excluded.
 * URLs are hardcoded rather than fetched live so this never depends on
 * Wikipedia being reachable at runtime.
 */

export interface Landmark {
  title: string;
  /** Searchable place string, compatible with /api/geocode. */
  place: string;
  imageUrl: string;
}

export const LANDMARKS: Landmark[] = [
  {
    title: "Eiffel Tower",
    place: "Paris, France",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg/330px-La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg",
  },
  {
    title: "Shinjuku Skyline",
    place: "Tokyo, Japan",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/330px-Skyscrapers_of_Shinjuku_2009_January.jpg",
  },
  {
    title: "Empire State Building",
    place: "New York, United States",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg/330px-View_of_Empire_State_Building_from_Rockefeller_Center_New_York_City_dllu_%28cropped%29.jpg",
  },
  {
    title: "Machu Picchu",
    place: "Machu Picchu, Peru",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/330px-Machu_Picchu%2C_2023_%28012%29.jpg",
  },
  {
    title: "The Colosseum",
    place: "Rome, Italy",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/330px-Colosseo_2020.jpg",
  },
  {
    title: "Reykjavik",
    place: "Reykjavik, Iceland",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg/330px-Reykjav%C3%ADk%2C_view_from_Hallgr%C3%ADmskirkja_%282%29.jpg",
  },
  {
    title: "Taj Mahal",
    place: "Agra, India",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/330px-Taj_Mahal_%28Edited%29.jpeg",
  },
  {
    title: "Sydney Opera House",
    place: "Sydney, Australia",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/330px-Sydney_Australia._%2821339175489%29.jpg",
  },
  {
    title: "Venice Canals",
    place: "Venice, Italy",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Venezia_aerial_view.jpg/330px-Venezia_aerial_view.jpg",
  },
  {
    title: "The Great Wall",
    place: "Beijing, China",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/330px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
  },
  {
    title: "The Acropolis",
    place: "Athens, Greece",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg/330px-1029_Acropolis_of_Athens_in_Greece_at_night_Photo_by_Giles_Laurent.jpg",
  },
  {
    title: "Golden Gate Bridge",
    place: "San Francisco, United States",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Golden_Gate_Bridge_as_seen_from_Battery_East.jpg/330px-Golden_Gate_Bridge_as_seen_from_Battery_East.jpg",
  },
  {
    title: "Petra",
    place: "Petra, Jordan",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Al_Deir_Petra.JPG/330px-Al_Deir_Petra.JPG",
  },
  {
    title: "Marrakesh Gardens",
    place: "Marrakesh, Morocco",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Pavillon_Menarag%C3%A4rten.jpg/330px-Pavillon_Menarag%C3%A4rten.jpg",
  },
  {
    title: "Barcelona",
    place: "Barcelona, Spain",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Evening_light_over_Barcelona.jpg/330px-Evening_light_over_Barcelona.jpg",
  },
  {
    title: "Uluwatu Temple",
    place: "Bali, Indonesia",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Pura_Luhur_Uluwatu_2017-08-17_%2834%29.jpg/330px-Pura_Luhur_Uluwatu_2017-08-17_%2834%29.jpg",
  },
  {
    title: "Burj Khalifa",
    place: "Dubai, United Arab Emirates",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg/330px-Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg",
  },
  {
    title: "Great Pyramid of Giza",
    place: "Giza, Egypt",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/330px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg",
  },
];

/**
 * Resolves a Wikimedia thumbnail URL to the original uploaded file.
 *
 * Asking Wikimedia's thumb service to generate a new custom width on demand
 * (e.g. swapping "330px-" for "1600px-") turned out to be unreliable in
 * testing — it 400s/403s for sizes that aren't already cached, apparently
 * throttled more aggressively than serving an existing file. The original
 * file is always servable, and next/image already re-encodes/resizes it
 * server-side (via sharp) for whatever display size is actually needed, so
 * there's no reason to ask Wikimedia for a specific width at all.
 */
export function wikimediaOriginal(thumbUrl: string): string {
  return thumbUrl.replace(/\/thumb\/([^/]+\/[^/]+\/[^/]+)\/\d+px-[^/]+$/, "/$1");
}

const norm = (s: string) => s.trim().toLowerCase();

/** Best-effort match of a free-text search location against a curated landmark. */
export function matchLandmark(location: string): Landmark | undefined {
  const q = norm(location.split(",")[0]);
  if (!q) return undefined;
  return LANDMARKS.find((l) => {
    const city = norm(l.place.split(",")[0]);
    return city === q || city.includes(q) || q.includes(city);
  });
}
