// geocode.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LocationInfo {
  colonia: string;
  ciudad: string;
  estado: string;
  codigoPostal?: string;
  pais?: string;
  direccionCompleta?: string;

  // 👇 nuevas variables derivadas
  direccionCorta?: string;
  ubicacionGeneral?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  private readonly mapboxUrl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  private readonly accessToken = 'pk.eyJ1IjoiY2hpa2F2aTEwIiwiYSI6ImNtZzVvOGRhbjAzcDMybG9pNjltNnUzYm4ifQ.bocgKewjQerNA61PgNtlOA';

  constructor(private http: HttpClient) {}

  async reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
    const url = `${this.mapboxUrl}/${lon},${lat}.json`;

    const params = new HttpParams()
      .set('access_token', this.accessToken)
      .set('types', 'neighborhood,locality,place,region,postcode,address')
      .set('language', 'es');

    try {
      const response: any = await firstValueFrom(
        this.http.get(url, { params })
      );

      console.log('🔎 Mapbox response completa:', response);

      if (!response.features || response.features.length === 0) {
        return this.getEmptyLocation();
      }

      return this.extractLocationInfo(response.features);

    } catch (error) {
      console.error('❌ Error en geocodificación:', error);
      return this.getEmptyLocation();
    }
  }

  private extractLocationInfo(features: any[]): LocationInfo {
    const location: LocationInfo = {
      colonia: '',
      ciudad: '',
      estado: '',
      codigoPostal: '',
      pais: '',
      direccionCompleta: ''
    };

    console.log('🔍 Analizando features:', features);

    // PRIMERO: Buscar directamente en los features principales
    features.forEach(feature => {
      const placeType = feature.place_type[0];
      const text = feature.text;

      console.log(`  📌 Feature type: ${placeType}, text: ${text}`);

      if ((placeType === 'neighborhood' || placeType === 'locality') && !location.colonia) {
        location.colonia = text;
        console.log(`  ✅ Colonia encontrada en feature: ${text}`);
      }

      if (placeType === 'place' && !location.ciudad) {
        location.ciudad = text;
      }

      if (placeType === 'region' && !location.estado) {
        location.estado = text;
      }

      if (placeType === 'postcode' && !location.codigoPostal) {
        location.codigoPostal = text;
      }

      if (placeType === 'country' && !location.pais) {
        location.pais = text;
      }
    });

    // SEGUNDO: Buscar en el context si no encontramos colonia
    if (!location.colonia) {
      console.log('  ⚠️ Colonia no encontrada en features, buscando en context...');

      for (const feature of features) {
        if (feature.context) {
          for (const ctx of feature.context) {
            const ctxType = ctx.id.split('.')[0];

            if ((ctxType === 'neighborhood' || ctxType === 'locality') && !location.colonia) {
              location.colonia = ctx.text;
              console.log(`    ✅ Colonia encontrada en context: ${ctx.text}`);
              break;
            }

            if (ctxType === 'place' && !location.ciudad) {
              location.ciudad = ctx.text;
            }

            if (ctxType === 'region' && !location.estado) {
              location.estado = ctx.text;
            }

            if (ctxType === 'postcode' && !location.codigoPostal) {
              location.codigoPostal = ctx.text;
            }

            if (ctxType === 'country' && !location.pais) {
              location.pais = ctx.text;
            }
          }

          if (location.colonia) break;
        }
      }
    }

    // Dirección completa
    if (features[0]) {
      location.direccionCompleta = features[0].place_name;
    }

    // Fallbacks
    if (!location.colonia) location.colonia = 'Sin colonia';
    if (!location.ciudad) location.ciudad = 'Sin ciudad';
    if (!location.estado) location.estado = 'Sin estado';

    // 👇 Variables derivadas para el flyer
    if (location.colonia && location.colonia !== 'Sin colonia') {
      location.direccionCorta = location.colonia;
    } else if (features[0]?.text) {
      location.direccionCorta = features[0].text;
    } else {
      location.direccionCorta = 'Ubicación aproximada';
    }

    location.ubicacionGeneral = `${location.ciudad}, ${location.estado}`;

    console.log('📍 Ubicación final extraída:', location);

    return location;
  }

  private getEmptyLocation(): LocationInfo {
    return {
      colonia: 'No disponible',
      ciudad: 'No disponible',
      estado: 'No disponible',
      codigoPostal: '',
      pais: '',
      direccionCompleta: 'No se pudo obtener la ubicación',
      direccionCorta: 'Ubicación aproximada',
      ubicacionGeneral: 'No disponible'
    };
  }
}
