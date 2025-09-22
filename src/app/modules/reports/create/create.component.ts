import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapComponent } from "../../../shared/components/map/map.component";
import { PhoneInputComponent } from "../../../shared/phone-input/phone-input.component";
import { PaymentComponent } from '../../../shared/components/payment/payment.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../shared/services/api.service';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent, PaymentComponent, PhoneInputComponent,HttpClientModule],
  providers:[ApiService],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  @ViewChild('paymentComponent') paymentComponent!: PaymentComponent;

  reportForm: FormGroup;
  step = 1;
  today = '';

  instagram_story = 'http://localhost:3000/api/v1/marketing/generate-flyer?format=instagram-story&name=Firulais&species=Perro&color=Marron&lastSeen=Av.%20Principal%20123%2C%20CDMX&description=Muy%20amistoso%2C%20responde%20a%20su%20nombre&imageUrl=https://cdn0.expertoanimal.com/es/razas/9/7/5/dogo-argentino_579_0_orig.jpg'

  plan='premium';

  photoPreview: string | ArrayBuffer | null = null;
  photoFile: File | null = null;
  apiService = inject(ApiService);

  triggerPayment() {
    if (this.paymentComponent) {
      this.paymentComponent.pay();
    }
  }


  onFileSelected(event: any) {
  const file: File = event.target.files[0];
  if (!file) return;

  // Limitar tamaño si quieres
  if (file.size > 10 * 1024 * 1024) { // 10MB
    alert('La imagen es demasiado grande');
    return;
  }

  this.photoFile = file;

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    this.photoPreview = e.target?.result || null; // <-- aquí
  };
  reader.readAsDataURL(file);

    this.uploadPhoto();
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
    console.log(this.step)
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
