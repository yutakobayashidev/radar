import sourcesData from "../../../db/sources.json";

export async function loader() {
  return new Response(JSON.stringify(sourcesData, null, 2), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
