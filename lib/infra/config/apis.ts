/**
 * External API endpoints used by Hermod
 */

export const ExternalApis = {
  // Weather (Luxembourg Geoportail)
  WEATHER_DAILY:
    'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Daily_ASTA_avg_ta200&OUTPUTFORMAT=application/json',
  WEATHER_HOURLY:
    'https://wms.inspire.geoportail.lu/geoserver/mf/wfs?SERVICE=wfs&VERSION=2.0.0&REQUEST=GetFeature&TYPENAME=MF.PointTimeSeriesObservation_Hourly_ASTA_avg_ta200&OUTPUTFORMAT=application/json',

  // Transportation
  DATA_PUBLIC_LU: 'https://data.public.lu/api/1/datasets/',
  JCDECAUX_BIKES: 'https://api.jcdecaux.com/vls/v1/stations?contract=luxembourg',
} as const;

/**
 * Mobiliteit.lu API URL builder
 *
 * Requires accessId from environment (e.g., process.env.MOBILITEIT_KEY).
 * Access: Register via email to opendata-api@atp.etat.lu.
 * Source: https://mobiliteit.lu/en/developers/api-documentation/
 * Terms: Open access with attribution; rate limits apply (contact for details).
 */
export class MobiliteitApi {
  private readonly baseUrl = 'https://cdt.hafas.de/opendata/apiserver/';
  private readonly accessId: string;

  constructor(accessId: string) {
    this.accessId = accessId;
  }

  /**
   * Get nearby stops URL.
   * @param lat Latitude.
   * @param lon Longitude.
   * @param radius Radius in meters (default: 1000).
   * @param maxNo Max results (default: 50).
   */
  getNearbyStops(lat: number, lon: number, radius = 1000, maxNo = 50): string {
    return `${this.baseUrl}location.nearbystops?accessId=${this.accessId}&originCoordLat=${String(lat)}&originCoordLong=${String(lon)}&r=${String(radius)}&maxNo=${String(maxNo)}&format=json`;
  }

  /**
   * Get departure board URL.
   * @param id Station ID.
   * @param date Date (YYYY-MM-DD).
   * @param time Time (HH:MM).
   * @param maxJourneys Max journeys (default: 10).
   */
  getDepartureBoard(id: string, date: string, time: string, maxJourneys = 10): string {
    return `${this.baseUrl}departureBoard?accessId=${this.accessId}&id=${id}&date=${date}&time=${time}&maxJourneys=${String(maxJourneys)}&format=json`;
  }
}
