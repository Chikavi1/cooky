import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}


@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent{
  private counter = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) {
    const id = this.counter++;
    this.toasts.set([...this.toasts(), { id, message, type }]);

    setTimeout(() => {
      this.toasts.set(this.toasts().filter(t => t.id !== id));
    }, duration);
  }
}
