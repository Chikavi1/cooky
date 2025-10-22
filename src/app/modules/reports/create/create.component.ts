import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MapComponent } from "../../../shared/components/map/map.component";
import { PhoneInputComponent } from "../../../shared/phone-input/phone-input.component";
import { PaymentComponent } from '../../../shared/components/payment/payment.component';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from '../../../shared/services/api.service';
import { TextEditorComponent } from "../../../shared/components/text-editor/text-editor.component";
import {  ImageCropperComponent, ImageTransform } from 'ngx-image-cropper';
import { GeocodeService } from '../../../shared/services/geocode.service';
import { SessionRecorderComponent } from "../../../shared/components/session-recorder/session-recorder.component";
import { SelectComponent  } from "../../../shared/components/select-autocomplete/select-autocomplete.component";
import { catBreedsOptions, dogBreedsOptions } from '../../../constants';


// import { initNps } from 'chikavi-tracking';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastComponent } from "../../../shared/components/toast/toast.component";


@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule, MapComponent, PaymentComponent, CommonModule, PhoneInputComponent, HttpClientModule,
    ImageCropperComponent, SessionRecorderComponent, SelectComponent, ToastComponent],
  providers:[ApiService,GeocodeService,],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent   implements OnInit{
    @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('paymentComponent') paymentComponent!: PaymentComponent;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

    private nps: any;

    //  initNps() {
    //   this.nps = new initNps({
    //     projectId: 'demo-123',
    //     endpoint: 'https://trackit-suite-back.onrender.com/nps',
    //     position: 'bottom-center',
    //     autoShow: false,
    //     delay: 1000
    //   });
    // }

    abrirNps() {
      this.nps.open();
    }

loading = false;
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


  readonly numberSelected = signal<any>(null);

  dogBreeds = dogBreedsOptions;
  catBreeds = catBreedsOptions;



   imageChangedEvent: any = '';


croppedBlob: Blob | null = null;

imageCropped(event: any) {
  this.photoPreview = event.objectUrl;
  this.croppedBlob = event.blob; // guardamos el recorte

  const control = this.reportForm.get('step2.photo');
  control?.setValue(event.blob);
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
  if (!this.croppedBlob) return; // <--- usamos el recorte, no el archivo original

  const formData = new FormData();
  formData.append('file', this.croppedBlob, 'cropped.png'); // nombre opcional

  this.apiService
    .post<{ message?: string; url?: string; error?: string }>(
      'reports/upload-image',
      formData
    )
    .subscribe({
      next: (res) => {
        console.log('res', res);
        if (!res.error) {
          this.reportForm.get('step2.photo')?.setValue(res.url);
          console.log('URL subida:', res.url);
        }
      },
      error: (err) => {
        console.error('Error', err);
      }
    });
}


imageLoaded = false;

onImageLoad() {
  this.imageLoaded = true;
}



ngOnInit() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes de 2 dígitos
  const day = now.getDate().toString().padStart(2, '0'); // Día de 2 dígitos
  this.today = `${year}-${month}-${day}`;

  // this.initNps();
  this.generateFakeNumbers();
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

 getImageUrlPreview(options?: {
  format?: string;
  withQr?: boolean;
}): string {
  const step1 = this.reportForm.value.step1 || {};
  const step2 = this.reportForm.value.step2 || {};
  const step3 = this.reportForm.value.step3 || {};
  const step4 = this.reportForm.value.step4 || {};

  const params = new URLSearchParams();



  // Campos del formulario
  if (step1.petName) params.set('name', step1.petName);
  if (step1.specie) params.set('species', step1.specie);
  if (step1.breed) params.set('breed', step1.breed);
  if (step1.color) params.set('color', step1.color);

  if (step3.reward) params.set('reward', step3.reward);
  if (step3.address) params.set('lastSeen', step3.address);
  if (this.primaryLineDirection) params.set('primaryLineDirection', this.primaryLineDirection);
  if (this.secondaryLineDirection) params.set('secondaryLineDirection', this.secondaryLineDirection);
  if (step3.description) params.set('description', step3.description);
  if (step3.disappearanceDate) params.set('date', step3.disappearanceDate);

  if (step4.phone) params.set('cellphone', step4.phone);

  // Imagen obligatoria
    if (step2.photo) {
      params.set('imageUrl', `http://localhost:3000${step2.photo}`);
    } else {
      params.set('imageUrl', '');
    }

  // Parámetros dinámicos
  params.set('format', options?.format || 'preview-pdf');
  if (options?.withQr !== undefined) params.set('withQr', options.withQr ? 'true' : 'false');

  return `http://localhost:3000/reports/generate-flyer?${params.toString()}`;
}

formattedDisappearanceDate = '';

formatDateInput() {
  const control = this.reportForm.get('step3.disappearanceDate');
  const value = control?.value;
  if (!value) return;

  const date = new Date(value);
  if (!isNaN(date.getTime())) {
     this.formattedDisappearanceDate = date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

  }
}



  constructor(private fb: FormBuilder ) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(today.getDate()).padStart(2, '0');


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
        disappearanceDate: [, Validators.required],
        latitude: [],
        longitude: [],
        description: [''],
        reward: [0],
      }),
      step4: this.fb.group({
        ownerName: ['', Validators.required],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        notifications: [true]
      }),
      step6: this.fb.group({
        plan: ['']
      })
    });

  }


nextStep() {
  const stepGroup = this.getCurrentStepGroup();

  // 🚫 Si el grupo del paso actual no es válido, marcarlo y detener
  if (stepGroup && stepGroup.invalid) {
    stepGroup.markAllAsTouched();
    return;
  }

  const latitude = this.reportForm.get('step3.latitude')?.value;
  const longitude = this.reportForm.get('step3.longitude')?.value;

  console.log('Paso actual:', this.step);
  console.log('Plan:', this.plan);

  switch (this.step) {
    case 2:
      this.uploadPhoto();
      break;

    case 3:
      this.getCurrency(latitude, longitude);
      this.formatDateInput()
      break;

    case 4:
      this.generateCaption()
      break;

    case 6:
      // Si el plan es gratuito, crear reporte directamente
      if (this.plan === 'free') {
        this.createReport();
        return;
      }
      break;
  }

  // ✅ Avanzar al siguiente paso
  this.step++;
}



   prevStep() {
    if (this.step > 1) this.step--;
  }

   private getCurrentStepGroup(): FormGroup {
    return this.reportForm.get(`step${this.step}`) as FormGroup;
  }



  async triggerPayment(): Promise<string | null> {
    if (this.paymentComponent) {
      return await this.paymentComponent.pay();
    }
    return null;
  }
caption = '';
htmlCaption = ''
 generateCaption() {
  const lines: string[] = [
    `🚨 ¡SE BUSCA a ${this.reportForm.value.step1.petName}! 🚨 🐾`,
    `${this.reportForm.value.step1.breed} ${this.reportForm.value.step1.color}`,
    `📅 Desapareció el: ${this.formattedDisappearanceDate}`,
    `📍 Zona: ${this.primaryLineDirection}, ${this.secondaryLineDirection}`,
    this.reportForm.value.step3.description ? `💔 ${this.reportForm.value.step3.description}` : '',
    this.reportForm.value.step3.reward > 0 ? `🎁 Se ofrece recompensa: ${this.reportForm.value.step3.reward}` : '',
    ` `,
    ` `,
    `📞 Si has visto a ${this.reportForm.value.step1.petName} o tienes información, contacta a ${this.reportForm.value.step4.ownerName} al`,
    `📱 Tel: ${this.reportForm.value.step4.phone}`,
    ``,
    `🙏 ¡Ayúdanos a traer a ${this.reportForm.value.step1.petName} de vuelta a casa!`,
    `🐾 #MascotaPerdida #SeBusca #${this.reportForm.value.step1.petName} #AyúdanosABuscarlo`
  ];

  // Une todo con \n y elimina líneas vacías al inicio/final
  this.caption = lines.filter(line => line.trim() !== '').join('\n');
  this.htmlCaption = this.caption.replace(/\n/g, '<br>');
}


 async createReport() {
  if (this.loading) return;
  this.loading = true;

  try {
    let paymentId: string | null = null;

    // 1️⃣ Si el plan no es free, hacemos el pago
    if (this.plan !== 'free' && this.paymentComponent) {
      paymentId = await this.paymentComponent.pay();
      if (!paymentId) {
        console.warn('⚠️ Pago fallido o cancelado, no se creará el reporte.');
        return;
      }
    }



    // 2️⃣ Construir payload del reporte
    const payload = {
      ...this.reportForm.value.step1,
      ...this.reportForm.value.step2,
      ...this.reportForm.value.step3,
      ...this.reportForm.value.step4,
      ...this.reportForm.value.step7,
      fbAdId: '123456789',
      plan: this.plan,
      paymentId,
      caption: this.caption,
      url_post_flyer: this.getImageUrlPreview({ format: 'facebook-post', withQr: false }),
      url_story_flyer: this.getImageUrlPreview({ format: 'instagram-story', withQr: false })
    };

    console.log('payload', payload);


    // 3️⃣ Enviar al backend (endpoint unificado)
    const res = await this.apiService.post('reports/create-with-payment', payload).toPromise();
    console.log('📤 Reporte creado:', res);

    // 4️⃣ Avanzar paso o mostrar mensaje
    this.step = 8;

    this.abrirNps();


  } catch (err: any) {
    console.error('❌ Error creando reporte:', err);
    alert(err?.error?.message || 'Error creando el reporte');
  } finally {
    this.loading = false;
  }
}



    priceSelected = '';

selectPlan(plan:any,price:any){
  this.plan = plan;
  this.priceSelected = price;
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

  primaryLineDirection:any = '';
  secondaryLineDirection:any = '';

  getCurrency(lat: number, lng: number) {

    this.apiService.getCurrencyFromLatLng(lat, lng).subscribe((currency:any) => {
      this.currency = currency;
      this.getPrices(this.currency || 'USD')

      console.log('Currency from latitude,longitude:', currency);
    });


    this.geocodeservice.reverseGeocode(lat, lng).then((data) => {
      console.log('data del niehboghod')
      console.log(data);
      const value = this.reportForm.get('step3')?.get('lastLocation')?.value || '';
      this.primaryLineDirection = value.charAt(0).toUpperCase() + value.slice(1);

      this.secondaryLineDirection =   data.ubicacionGeneral;
      console.log('primary',  this.primaryLineDirection);
      console.log('seconday', this.secondaryLineDirection);

    });
  }

  fakeLikes = 0;
  fakecomments = 0;
  fakeshare = 0;
  fakeLikesIG = 0;

  generateFakeNumbers(){
    this.fakeLikes = this.randomNumber(150, 200)
    this.fakecomments = this.randomNumber(20, 50)
    this.fakeshare = this.randomNumber(30, 80)
    this.fakeLikesIG = this.randomNumber(30, 80)


  }

  randomNumber(min: number, max: number): number {
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

async downloadFlyer(format: string, withQr = false) {
  try {
     const url = this.getImageUrlPreview({ format, withQr });


      this.toast.show('Generando tu flyer...', 'info', 5000);

     console.log('url',  url)

     const response = await fetch(url);
    if (!response.ok) throw new Error('Error al generar el flyer');

    // Detectar el tipo de archivo devuelto
    const contentType = response.headers.get('Content-Type') || '';
    const blob = await response.blob();

    // Determinar la extensión automáticamente
    let extension = 'bin';
    if (contentType.includes('pdf')) extension = 'pdf';
    else if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = 'jpg';
    else if (contentType.includes('webp')) extension = 'webp';

    // Crear URL temporal y disparar descarga
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `flyer-${format}.${extension}`;
    link.click();

    // Liberar memoria
    URL.revokeObjectURL(blobUrl);

    console.log(`✅ Descarga completada: flyer-${format}.${extension}`);
  } catch (err) {
    console.error('❌ Error descargando el flyer:', err);
  }
}



allowOnlyNumbers(event: any) {
  event.target.value = event.target.value.replace(/[^0-9]/g, '');
  this.reportForm.get('reward')?.setValue(event.target.value, { emitEvent: false });
}

}
