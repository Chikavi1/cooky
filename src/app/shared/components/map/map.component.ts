import { AfterViewInit, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss'
})
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() center_location: [number, number] = [0, 0];
  @Input() markers: any[] = [];

  map!: L.Map;
  markerLayers: L.Marker[] = [];

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && changes['markers'] && changes['markers'].currentValue) {
      // Actualiza solo el marker del repartidor
      const delivery = this.markers[2];
      if (this.markerLayers[2]) {
        this.markerLayers[2].setLatLng([delivery.lat, delivery.lng]);
      }
    }
  }

  private initMap() {
    this.map = L.map('map',{  zoomControl: false,}).setView(this.center_location, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateMarkers();
  }

  private updateMarkers() {
    this.markerLayers.forEach(m => m.remove());
    this.markerLayers = [];

    this.markers.forEach(m => {
      const icon = L.icon({
        iconUrl: m.iconUrl,
        iconSize: m.iconSize || [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

        // Crear marker con HTML personalizado
    const htmlIcon = L.divIcon({
      className: '', // vacío para quitar estilos por defecto
      html: `
        <div style="
          display: flex;
          align-items: center;
          background-color: #eb5325ff; /* azul */
          color: white;
          padding: 8px 12px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        ">
          <img src="https://www.bupasalud.com.mx/sites/default/files/styles/640_x_400/public/articulos/2024-09/fotos/beneficios%20de%20tener%20una%20mascota-1.jpg?itok=HfGQPxj2"
               style="width:32px; height:32px; border-radius:50%; margin-right:8px;" />
          <div>
            <div style="font-weight:bold;">Firulais</div>
            <div style="font-size:12px;">Última ubicación</div>
          </div>
        </div>
      `,
      iconSize: [200, 50],
      iconAnchor: [100, 25] // centro del icono
    });

      const marker = L.marker([m.lat, m.lng], { icon: htmlIcon }).addTo(this.map);
      if (m.popup) marker.bindPopup(m.popup);
      this.markerLayers.push(marker);
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }
}
