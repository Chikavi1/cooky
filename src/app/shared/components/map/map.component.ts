import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
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
  @Input() mode: 'view' | 'create' = 'view'; // 👈 nuevo input para controlar modo
  @Output() locationSelected = new EventEmitter<[number, number]>(); // 👈 emite lat/lng cuando se arrastra
  @Input() selectionMode: 'draggable' | 'center' = 'center'; // 👈 nuevo input

  map!: L.Map;
  markerLayers: L.Marker[] = [];
  createMarker?: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();

    // Asegúrate de actualizar tamaño después de que Angular renderiza el contenedor
    setTimeout(() => {
      this.map.invalidateSize();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && changes['markers'] && this.mode === 'view') {
      this.updateMarkers();
    }
  }

  private addCenterPin() {
    const pinIcon = L.divIcon({
      className: '',
      html: `<div style="font-size: 32px; color: red;">📍</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32]
    });

    // Marker en el centro (no draggable)
    const center = this.map.getCenter();
    const pin = L.marker(center, { icon: pinIcon, interactive: false }).addTo(this.map);

    // Cada vez que se mueve el mapa, el marker se mantiene en el centro
    this.map.on('move', () => {
      const newCenter = this.map.getCenter();
      pin.setLatLng(newCenter);
    });

    // Cuando termina de moverse, emite la ubicación seleccionada
    this.map.on('moveend', () => {
      const coords = this.map.getCenter();
      this.locationSelected.emit([coords.lat, coords.lng]);
    });
  }


  private initMap() {
  this.map = L.map('map', { zoomControl: false }).setView(this.center_location, 13);

  let language = localStorage.getItem('language')?localStorage.getItem('language'):'en';

  const  tile = 'https://mt0.google.com/vt/lyrs=m&hl='+language+'&x={x}&y={y}&z={z}&s=Ga';

  L.tileLayer(tile).addTo(this.map);

  if (this.mode === 'view') {
    this.updateMarkers();
  } else if (this.mode === 'create') {
    if (this.selectionMode === 'draggable') {
      this.addDraggableMarker();
    } else {
      this.addCenterPin();
    }
  }
}


  private updateMarkers() {
    this.markerLayers.forEach(m => m.remove());
    this.markerLayers = [];

    this.markers.forEach(m => {
      const htmlIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            display: flex;
            align-items: center;
            background-color: #eb5325ff;
            color: white;
            padding: 8px 12px;
            border-radius: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            <img src="${m.imageUrl }"
                 style="width:32px; height:32px; border-radius:50%; margin-right:8px;" />
            <div>
              <div style="font-weight:bold;">${m.title || 'Marker'}</div>
              <div style="font-size:12px;">${m.subtitle || ''}</div>
            </div>
          </div>
        `,
        iconSize: [200, 50],
        iconAnchor: [100, 25]
      });

      const marker = L.marker([m.lat, m.lng], { icon: htmlIcon }).addTo(this.map);
      if (m.popup) marker.bindPopup(m.popup);
      this.markerLayers.push(marker);
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }

  private addDraggableMarker() {
    this.createMarker = L.marker(this.center_location, {
      draggable: true
    }).addTo(this.map);

    this.createMarker.on('dragend', (e: any) => {
      const coords = e.target.getLatLng();
      this.locationSelected.emit([coords.lat, coords.lng]); // 👈 emite coords al padre
    });

    setTimeout(() => this.map.invalidateSize(), 0);
  }
}
