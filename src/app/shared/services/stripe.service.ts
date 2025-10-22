import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe('pk_test_51QUyNoDU5nT1bn5nKumCvFFE1JfrFdUY8ZJtItM1EM4fJ51OLKDAj7M7rGFEmRr92eJHhS5QCgVhb52zy4vlJd0q00zrpkChdf');
  private baseUrl = 'http://localhost:3000'; // tu backend

  constructor(private http: HttpClient) {}

  async getStripe() {
    return this.stripePromise;
  }

  createPaymentIntent(priceId: string) {
    return firstValueFrom(
      this.http.post<{ clientSecret: string }>(`${this.baseUrl}/reports/payment`, { priceId })
    );
  }
}
