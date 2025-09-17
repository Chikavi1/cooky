import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapComponent } from "../../../shared/components/map/map.component";
import { PhoneInputComponent } from "../../../shared/phone-input/phone-input.component";

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MapComponent, PhoneInputComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  reportForm: FormGroup;
  step = 4;
  today = '';

  instagram_story = 'http://localhost:3000/api/v1/marketing/generate-flyer?format=instagram-story&name=Firulais&species=Perro&color=Marron&lastSeen=Av.%20Principal%20123%2C%20CDMX&description=Muy%20amistoso%2C%20responde%20a%20su%20nombre&imageUrl=https://cdn0.expertoanimal.com/es/razas/9/7/5/dogo-argentino_579_0_orig.jpg'

  photoPreview: string | ArrayBuffer | null = null;

onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];

  // Validar tamaño si quieres
  if (file.size > 10 * 1024 * 1024) {
    alert("El archivo debe ser menor a 10MB");
    return;
  }

  // Mostrar preview
  const reader = new FileReader();
  reader.onload = () => {
    this.photoPreview = reader.result;
  };
  reader.readAsDataURL(file);

  // Actualizar el form control
  this.reportForm.get('step1.photo')?.setValue(file);

  // Subir al backend automáticamente
  this.uploadPhoto(file);
}

// Función para subir al backend
uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append('photo', file);

  // this.http.post('http://localhost:3000/api/v1/upload', formData).subscribe({
  //   next: (res: any) => {
  //     console.log("Foto subida correctamente:", res);
  //     // Si el backend devuelve la URL, la puedes guardar en el form para luego generar el flyer
  //     this.reportForm.get('step1.photo')?.setValue(res.url);
  //   },
  //   error: (err) => console.error("Error subiendo la foto:", err)
  // });
}


  ngOnInit() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes de 2 dígitos
  const day = now.getDate().toString().padStart(2, '0'); // Día de 2 dígitos
  this.today = `${year}-${month}-${day}`;
}

 activeTab: 'facebook' | 'instagram' = 'facebook';


  constructor(private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      step1: this.fb.group({
        petType: ['', Validators.required],
        gender: ['', Validators.required],
        petName: ['', Validators.required],
        breed: ['',Validators.required],
        color: [''],
        photo: ['',Validators.required]
      }),
      step2: this.fb.group({
        lastLocation: ['', Validators.required],
        disappearanceDate: ['', Validators.required],
        description: ['']
      }),
      step3: this.fb.group({
        ownerName: ['', Validators.required],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]]
      })
    });
  }

  // ✅ Validar y avanzar al siguiente paso
  nextStep() {
    const stepGroup = this.getCurrentStepGroup();
    console.log(this.step)
    if ( this.step === 4 || stepGroup.valid) {
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

    const payload = {
      ...this.reportForm.value.step1,
      ...this.reportForm.value.step2,
      ...this.reportForm.value.step3,
    };

    console.log('📤 Payload final:', payload);

    // Aquí iría tu POST al backend
    // this.http.post('/api/report', payload).subscribe(...)
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
