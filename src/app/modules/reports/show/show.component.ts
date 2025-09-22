import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MapComponent } from "../../../shared/components/map/map.component";
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { Meta, Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ShareButtonsComponent } from "../../../shared/share-buttons/share-buttons.component";

@Component({
  selector: 'app-show',
  standalone: true,
  providers: [ApiService],
  imports: [CommonModule, MapComponent, HttpClientModule, ShareButtonsComponent],
  templateUrl: './show.component.html',
  styleUrl: './show.component.scss'
})
export class ShowComponent implements OnInit  {
  data: any[] = [];
  filteredData: any[] = [];
  userLocation: [number, number] | null = null;
drawerOpen = false;

  searchForm = this.fb.group({
    name: [''],
    code: ['']
  });

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private fb: FormBuilder,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    // SEO básico
    this.title.setTitle('Ayudanos a encontrar a ');
    this.meta.addTags([
      { name: 'description', content: 'Visualiza reportes de mascotas desaparecidas, busca por nombre o código y encuentra información detallada.' },
      { name: 'keywords', content: 'mascotas, perdido, reporte, buscar, encontrar, código, nombre' },
      { name: 'robots', content: 'index, follow' }
    ]);

    const code = this.route.snapshot.paramMap.get('code');

    if (code) {
      // Obtener reporte por código
      this.api.get(`reports/${code}`).subscribe((report: any) => {
        this.data = [report];
        this.filteredData = [report];
      });
    }

    // Filtrado reactivo
    this.searchForm.valueChanges.subscribe((value: any) => {
      this.filterData(value.name, value.code);
    });

    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = [position.coords.latitude, position.coords.longitude];
          console.log('Ubicación del usuario:', this.userLocation);
        },
        (error) => {
          console.warn('No se pudo obtener ubicación:', error);
        }
      );
    }
  }

  filterData(name: string, code: string) {
    this.filteredData = this.data.filter(d =>
      (!name || d.name.toLowerCase().includes(name.toLowerCase())) &&
      (!code || d.code.toLowerCase().includes(code.toLowerCase()))
    );
  }

  getCenterLocation(): [number, number] {
    if (this.filteredData.length > 0) {
      return [
        Number(this.filteredData[0].latitude),
        Number(this.filteredData[0].longitude)
      ];
    }
    // Centro default si no hay reportes
    return this.userLocation || [19.432608, -99.133209];
  }

  getMarkers() {
    // Mapear filteredData y usar lat/lng, no latitude/longitude
    return this.filteredData.map(d => ({
      lat: Number(d.latitude),
      lng: Number(d.longitude),
      title:  d.name,
      subtitle: 'úlitma vez visto',
      imageUrl: 'https://www.bupasalud.com.mx/sites/default/files/styles/640_x_400/public/articulos/2024-09/fotos/beneficios%20de%20tener%20una%20mascota-1.jpg?itok=HfGQPxj2',
      iconSize: [40, 40]
    }));
  }

  // Método opcional para calcular probabilidad
  getDistanceFromUser(lat: number, lng: number): number | null {
    if (!this.userLocation) return null;

    const [userLat, userLng] = this.userLocation;

    // Fórmula Haversine
    const R = 6371; // km
    const dLat = this.deg2rad(lat - userLat);
    const dLng = this.deg2rad(lng - userLng);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(userLat)) * Math.cos(this.deg2rad(lat)) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance; // distancia en km
  }

  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }

  probability: number = 0; // 0 a 100

calculateProbability() {
  if (!this.userLocation || this.filteredData.length === 0) {
    this.probability = 0;
    return;
  }

  const pet = this.filteredData[0]; // Tomamos el primer reporte
  const distanceKm = this.getDistanceFromUser(Number(pet.latitude), Number(pet.longitude)) || 0;

  this.probability = Math.max(0, Math.min(100, 100 - (distanceKm * 10)));
}

}
