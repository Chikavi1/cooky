import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Stripe, StripeElements } from '@stripe/stripe-js';
import { StripeService } from '../../services/stripe.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [HttpClientModule],
  providers: [StripeService],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements AfterViewInit {
  @ViewChild('cardElement') cardElement!: ElementRef;
  stripe!: Stripe | null;
  elements?: StripeElements | null;
  card?: any;
  clientSecret?: string;
  loading = false;
  amount = 1000;

  constructor(private stripeService: StripeService) {}

  async ngAfterViewInit() {
    // 1️⃣ Inicializar Stripe
    this.stripe = await this.stripeService.getStripe();
    if (!this.stripe) return;

    // 2️⃣ Crear Elements
    this.elements = this.stripe.elements();

    this.card = this.elements!.create('card', {
      style: {
        base: {
          color: '#1a202c',                 // texto
          fontFamily: '"Inter", sans-serif',
          fontSize: '16px',
          '::placeholder': { color: '#a0aec0' },
          padding: '0',                      // ⚡ Importante: quitamos padding para que se ajuste al div
        },
        invalid: {
          color: '#e53e3e',
          iconColor: '#e53e3e'
        }
      },
      hidePostalCode: true
    });
    
    this.card.mount(this.cardElement!.nativeElement);
    
    // 


  }

  async pay() {
    if (!this.stripe || !this.card) return;

    try {
      this.loading = true;

      // 1) Pedir clientSecret al backend
      const resp = await this.stripeService.createPaymentIntent(this.amount, 'mxn');
      this.clientSecret = resp.clientSecret;

      // 2) Confirmar pago
      const result = await this.stripe.confirmCardPayment(this.clientSecret!, {
        payment_method: { card: this.card }
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent?.status === 'succeeded') {
        alert('Pago realizado con éxito');
      }
    } catch (err) {
      console.error(err);
      alert('Error en el pago');
    } finally {
      this.loading = false;
    }
  }
}
