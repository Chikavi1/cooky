import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MapComponent } from "../../../shared/components/map/map.component";

@Component({
  selector: 'app-show',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './show.component.html',
  styleUrl: './show.component.scss'
})
export class ShowComponent {

  data:any = [];



  getCenterLocation(): [number, number] {
    return [20.621378, -103.303955];
  }

   getMarkers() {
    return [
      {
        lat: 20.621378,
        lng: -103.303955,
        iconUrl: 'a',
        iconSize: [40, 40]
      },


    ];
  }

}
