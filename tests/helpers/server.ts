export { baseUrl } from "../setup";

export async function api(path: string, init?: RequestInit): Promise<Response> {
  const { baseUrl } = await import("../setup");
  return fetch(baseUrl + path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
