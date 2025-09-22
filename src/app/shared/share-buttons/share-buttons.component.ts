import { Component } from '@angular/core';

@Component({
  selector: 'app-share-buttons',
  standalone: true,
  imports: [],
  templateUrl: './share-buttons.component.html',
  styleUrl: './share-buttons.component.scss'
})
export class ShareButtonsComponent {
  message = encodeURIComponent(
    'Ayúdanos a traer de vuelta a Roy a casa. ¡Comparte esta publicación y ayúdanos a encontrarlo!'
  );
  url = encodeURIComponent('https://tusitio.com/roy'); // Pon aquí la URL de tu publicación

  facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${this.url}`;
  whatsappUrl = `https://api.whatsapp.com/send?text=${this.message}%20${this.url}`;
  twitterUrl = `https://twitter.com/intent/tweet?text=${this.message}%20${this.url}`;
}
