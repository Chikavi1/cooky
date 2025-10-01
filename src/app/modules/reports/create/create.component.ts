import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapComponent } from "../../../shared/components/map/map.component";
import { PhoneInputComponent } from "../../../shared/phone-input/phone-input.component";
import { PaymentComponent } from '../../../shared/components/payment/payment.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../shared/services/api.service';
import { TextEditorComponent } from "../../../shared/components/text-editor/text-editor.component";
import {  ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { GeocodeService } from '../../../shared/services/geocode.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, MapComponent, PaymentComponent, PhoneInputComponent, HttpClientModule,
    ImageCropperComponent],
  providers:[ApiService,GeocodeService],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  @ViewChild('paymentComponent') paymentComponent!: PaymentComponent;

  reportForm: FormGroup;
  step = 1;
  today = '';

  instagram_story = 'http://localhost:3000/api/v1/marketing/generate-flyer?format=instagram-story&name=Firulais&species=Perro&color=Marron&lastSeen=Av.%20Principal%20123%2C%20CDMX&description=Muy%20amistoso%2C%20responde%20a%20su%20nombre&imageUrl=https://cdn0.expertoanimal.com/es/razas/9/7/5/dogo-argentino_579_0_orig.jpg'
  plan= 'premium';
  currency: string | null = 'MXN';

  prices:any = [];
  priceId:string = '';

  photoPreview: string | ArrayBuffer | null = null;
  photoFile: File | null = null;
  apiService = inject(ApiService);
  geocodeservice = inject(GeocodeService);


  transform: any = {};
  scale = 1;


  triggerPayment() {
    if (this.paymentComponent) {
      this.paymentComponent.pay();
    }
  }

   imageChangedEvent: any = '';


 imageCropped(event: any) {
  this.photoPreview = event.objectUrl; // preview directo en <img>

  const control = this.reportForm.get('step2.photo');
  control?.setValue(event.blob); // o guardas el blob en el form
  control?.markAsTouched();
  control?.updateValueAndValidity();
}


  // changeCurrency(event:any){
  //   let newCurrency = event.target.value;
  //   this.currency = newCurrency.toUpperCase();
  //   console.log('curren',this.currency)
  //   this.getPrices()
  // }

   zoomIn() {
    this.scale += 0.1;
    this.transform = { scale: this.scale };
  }

  zoomOut() {
    this.scale = Math.max(0.1, this.scale - 0.1);
    this.transform = { scale: this.scale };
  }

  dropError: string | null = null;
  onDragOver(event: DragEvent) {
    event.preventDefault(); // importante para permitir el drop
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dropError = null; // resetea el error
    const file = event.dataTransfer?.files[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.dropError = 'Solo se permiten archivos de imagen';
      return;
    }

    this.onFileSelected({ target: { files: [file] } });
  }

  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert('La imagen es demasiado grande');
    return;
  }

  this.photoFile = file;
  this.imageChangedEvent = event;
  this.zoomOut();

  const reader = new FileReader();
  reader.onload = (e) => {
    this.photoPreview = e.target?.result || null;

    // ✅ Llenar el FormControl
    const control = this.reportForm.get('step2.photo');
    control?.setValue(this.photoPreview);
    control?.markAsTouched();
    control?.updateValueAndValidity();
  };
  reader.readAsDataURL(file);
}


  uploadPhoto() {
    if (!this.photoFile) return;

    const formData = new FormData();
    formData.append('file', this.photoFile);

    this.apiService.post<{message?: string, url?: string, error?: string}>('marketing/upload', formData)
      .subscribe({
        next: res => {
          console.log("res",res)
          if (res.error) {
            alert('Imagen no válida: ' + res.error);
          } else {
            alert('Imagen subida correctamente!');
            console.log('URL:', res.url);
          }
        },
        error: err => {
          console.error(err);
          alert('Error subiendo la imagen');
        }
      });
  }

ngOnInit() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes de 2 dígitos
  const day = now.getDate().toString().padStart(2, '0'); // Día de 2 dígitos
  this.today = `${year}-${month}-${day}`;
}

 activeTab: 'facebook' | 'instagram' = 'facebook';



onLocationSelected(coords: [number, number]) {
  console.log('Nueva ubicación seleccionada:', coords);

  this.reportForm.get('step3')?.patchValue({
    latitude: coords[0],
    longitude: coords[1]
  });
}


  getPrices(currency:string){
    this.apiService.post('reports/prices',{currency:  currency}).subscribe( (data: any) =>{
      this.prices = data;
      console.log(this.prices)
    });
  }


  constructor(private fb: FormBuilder) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(today.getDate()).padStart(2, '0');

    const formattedToday = `${year}-${month}-${day}`;

    this.reportForm = this.fb.group({
      step1: this.fb.group({
        petType: ['', Validators.required],
        gender: ['', Validators.required],
        petName: ['', Validators.required],
        breed: ['',Validators.required],
        color: [''],
      }),
      step2: this.fb.group({
            photo: ['',Validators.required]
      }),
      step3: this.fb.group({
        lastLocation: ['', Validators.required],
        disappearanceDate: [formattedToday, Validators.required],
        latitude: [],
        longitude: [],
        description: ['']
      }),
      step4: this.fb.group({
        ownerName: ['', Validators.required],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        notifications: [true]
      }),
      step5: this.fb.group({
        plan: ['']
      })
    });

  }

  // ✅ Validar y avanzar al siguiente paso
  nextStep() {
    const stepGroup = this.getCurrentStepGroup();
    console.log(this.step);

    const latitude = this.reportForm.get('step3.latitude')?.value;
    const longitude = this.reportForm.get('step3.longitude')?.value;

    if(this.step === 2){

    }

    if(this.step === 3){
      this.getCurrency(latitude,longitude);
     }

    if ( this.step === 5 || stepGroup.valid) {
      this.step++;
    } else {
      stepGroup.markAllAsTouched();
    }
  }

  // ✅ Retroceder
  prevStep() {
    if (this.step > 1) this.step--;
  }

  // ✅ Obtener el form group del paso actual
  private getCurrentStepGroup(): FormGroup {
    return this.reportForm.get(`step${this.step}`) as FormGroup;
  }

  // ✅ Enviar reporte
  createReport() {
  if (this.reportForm.invalid) {
    this.reportForm.markAllAsTouched();
    return;
  }

  this.triggerPayment();

  const payload = {
    ...this.reportForm.value.step1,
    ...this.reportForm.value.step2,
    ...this.reportForm.value.step3,
    ...this.reportForm.value.step4,
    ...this.reportForm.value.step5,
    fbAdId: '123456789',
    plan: this.plan,
    paymentId: 'pay_987654321'
  };

  console.log('📤 Payload final:', payload);

  this.apiService.post('reports', payload).subscribe({
    next: (res) => {
      this.step = 7;
    },
    error: (err) => console.error('❌ Error creating report:', err)
  });
}

selectPlan(plan:any){
  this.plan = plan;
  if(plan !== 'free'){
    this.priceId  =  this.prices.plans[plan].id;
    console.log('priceID: ',this.priceId)
  }else{
    this.priceId = "";
  }
}

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

  getCurrency(lat: number, lng: number) {

    this.apiService.getCurrencyFromLatLng(lat, lng).subscribe((currency:any) => {
      this.currency = currency;
      this.getPrices(this.currency || 'USD')

      console.log('Currency from latitude,longitude:', currency);
    });


    this.geocodeservice.reverseGeocode(lat, lng).then((data) => {
      console.log('data del niehboghod')
      console.log(data);
    });
  }


  downloadFlyer(format: string) {
  // Construir la URL de tu endpoint con query params
  const params = new URLSearchParams({
    format,
    name: 'Radi',
    species: 'dog',
    color: 'gris',
    lastSeen: '11/02/2025',
    description: 'ayudame',
    imageUrl: "https://cdn0.expertoanimal.com/es/razas/9/7/5/dogo-argentino_579_0_orig.jpg"
  });

  const url = `http://localhost:3000/api/v1/marketing/generate-flyer?${params.toString()}`;

  // Descargar como blob
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `${format}.png`;
      link.click();
      window.URL.revokeObjectURL(link.href); // liberar memoria
    })
    .catch(err => console.error("Error descargando el flyer:", err));
}

}
