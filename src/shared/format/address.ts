// docs/catalogo/paginas-publicas.md, Localização: the route to the saved
// address on Google Maps, by its Maps URLs, which need no key; on a phone the
// link opens the maps app.
const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=";

export function formatDirectionsLink(address: string): string {
  return `${DIRECTIONS_URL}${encodeURIComponent(address)}`;
}
