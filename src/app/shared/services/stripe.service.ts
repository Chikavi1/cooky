import { Injectable } from '@angular/core';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StripeService {
  private stripePromise = loadStripe('pk_test_51QUyNoDU5nT1bn5nKumCvFFE1JfrFdUY8ZJtItM1EM4fJ51OLKDAj7M7rGFEmRr92eJHhS5QCgVhb52zy4vlJd0q00zrpkChdf'); // coloca tu public key de prueba
   private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  async getStripe() {
    return this.stripePromise;
  }

  // Llama al backend para crear el PaymentIntent
  createPaymentIntent(amount: number, currency = 'mxn') {
    return firstValueFrom(this.http.post<{clientSecret:string}>(`${this.baseUrl}/reports/test`, { amount, currency }));
  }
}
