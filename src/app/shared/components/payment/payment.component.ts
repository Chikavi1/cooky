import { Component, ElementRef, ViewChild, AfterViewInit, Input, SimpleChanges } from '@angular/core';
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

  @Input() priceId: string = '';
  stripe!: Stripe | null;
  elements?: StripeElements | null;
  card?: any;
  clientSecret?: string;
  loading = false;
  amount = 4900;

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
          color: '#1a202c',
          fontFamily: '"Inter", sans-serif',
          fontSize: '16px',
          '::placeholder': { color: '#a0aec0' },
          padding: '0',
        },
        invalid: {
          color: '#e53e3e',
          iconColor: '#e53e3e'
        }
      },
      hidePostalCode: true
    });

    this.card.mount(this.cardElement!.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['priceId']) {
      console.log('🔄 priceId recibido en PaymentComponent:', this.priceId);
    }
  }



  async pay( ) {
    if (!this.stripe || !this.card) return;

    try {
      this.loading = true;

      // 1) Pedir clientSecret al backend usando priceId
      const resp = await this.stripeService.createPaymentIntent(this.priceId);
      this.clientSecret = resp.clientSecret;

      // 2) Confirmar pago
      const result = await this.stripe.confirmCardPayment(this.clientSecret!, {
        payment_method: { card: this.card }
      });

      console.log('result', result);

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
