import { Component, ElementRef, ViewChild, AfterViewInit, Input, EventEmitter, Output } from '@angular/core';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { StripeService } from '../../services/stripe.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [HttpClientModule,CommonModule],
  providers: [StripeService],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements AfterViewInit {
  @ViewChild('cardElement') cardElement!: ElementRef;

  @Input() priceId: string = '';
  @Input() userName: string = '';
  @Input() email: string = '';

  @Output() paymentSuccess = new EventEmitter<string>();

  stripe!: Stripe | null;
  elements?: StripeElements | null;
  card?: StripeCardElement;
  clientSecret?: string;
  loading = false;
  errorMessage: string | undefined = '';

  constructor(private stripeService: StripeService) {}

  async ngAfterViewInit() {
    this.stripe = await this.stripeService.getStripe();
    if (!this.stripe) return;

    this.elements = this.stripe.elements();
    this.card = this.elements.create('card', {
      style: {
        base: {
          color: '#1a202c',
          fontFamily: '"Inter", sans-serif',
          fontSize: '16px',
          '::placeholder': { color: '#a0aec0' },
        },
        invalid: { color: '#e53e3e', iconColor: '#e53e3e' }
      },
      hidePostalCode: true
    });

    this.card.mount(this.cardElement.nativeElement);
  }

  async pay(): Promise<string | null> {
    if (!this.stripe || !this.card) return null;
    if (this.loading) return null; // Evita doble clic

    this.loading = true;
    this.errorMessage = '';

    try {
      // 1️⃣ Crear PaymentIntent si no existe
      if (!this.clientSecret) {
        const resp = await this.stripeService.createPaymentIntent(this.priceId);
        this.clientSecret = resp.clientSecret;
      }

      // 2️⃣ Confirmar pago
      const result = await this.stripe.confirmCardPayment(this.clientSecret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.userName || 'Usuario ejemplo',
            email: this.email || 'usuario@ejemplo.com'
          }
        }
      });

      if (result.error) {
        console.error('❌ Error en el pago:', result.error.message);
        this.errorMessage = result.error.message;
        return null;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        console.log('✅ Pago exitoso:', result.paymentIntent.id);
        this.paymentSuccess.emit(result.paymentIntent.id);
        return result.paymentIntent.id;
      }

      if (result.paymentIntent?.status === 'requires_action') {
        this.errorMessage = '⚠️ El pago requiere autenticación adicional';
        return null;
      }

      return null;

    } catch (err) {
      console.error('🚨 Error general en pay():', err);
      this.errorMessage = 'Error procesando el pago';
      return null;
    } finally {
      this.loading = false;
    }
  }
}
