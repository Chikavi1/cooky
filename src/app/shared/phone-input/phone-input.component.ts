import { CommonModule } from '@angular/common';
import { Component, forwardRef, HostListener, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
// @ts-ignore
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const countries: CountryData[] = [
  { code: 'mx', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'us', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'ca', name: 'Canadá', dialCode: '+1', flag: '🇨🇦' },
  { code: 'br', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'ar', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'co', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'es', name: 'España', dialCode: '+34', flag: '🇪🇸' },
  { code: 'cl', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'pe', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 've', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪' },
  { code: 'uy', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾' },
  { code: 'ec', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨' },
  { code: 'gt', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'pa', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'do', name: 'República Dominicana', dialCode: '+1', flag: '🇩🇴' },
  { code: 'hn', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'sv', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'cr', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'py', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾' },
  { code: 'bo', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴' },
  { code: 'cu', name: 'Cuba', dialCode: '+53', flag: '🇨🇺' },
  { code: 'ru', name: 'Rusia', dialCode: '+7', flag: '🇷🇺' },
  { code: 'de', name: 'Alemania', dialCode: '+49', flag: '🇩🇪' },
  { code: 'fr', name: 'Francia', dialCode: '+33', flag: '🇫🇷' },
  { code: 'it', name: 'Italia', dialCode: '+39', flag: '🇮🇹' },
  { code: 'gb', name: 'Reino Unido', dialCode: '+44', flag: '🇬🇧' },
  { code: 'pl', name: 'Polonia', dialCode: '+48', flag: '🇵🇱' },
  { code: 'ua', name: 'Ucrania', dialCode: '+380', flag: '🇺🇦' },
  { code: 'nl', name: 'Países Bajos', dialCode: '+31', flag: '🇳🇱' },
  { code: 'be', name: 'Bélgica', dialCode: '+32', flag: '🇧🇪' },
  { code: 'se', name: 'Suecia', dialCode: '+46', flag: '🇸🇪' },
  { code: 'no', name: 'Noruega', dialCode: '+47', flag: '🇳🇴' },
  { code: 'dk', name: 'Dinamarca', dialCode: '+45', flag: '🇩🇰' },
  { code: 'fi', name: 'Finlandia', dialCode: '+358', flag: '🇫🇮' },
  { code: 'ie', name: 'Irlanda', dialCode: '+353', flag: '🇮🇪' },
  { code: 'at', name: 'Austria', dialCode: '+43', flag: '🇦🇹' },
  { code: 'ch', name: 'Suiza', dialCode: '+41', flag: '🇨🇭' },
  { code: 'pt', name: 'Portugal', dialCode: '+351', flag: '🇵🇹' },
  { code: 'gr', name: 'Grecia', dialCode: '+30', flag: '🇬🇷' },
  { code: 'cz', name: 'República Checa', dialCode: '+420', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungría', dialCode: '+36', flag: '🇭🇺' },
  { code: 'ro', name: 'Rumania', dialCode: '+40', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬' },
  { code: 'sk', name: 'Eslovaquia', dialCode: '+421', flag: '🇸🇰' },
  { code: 'si', name: 'Eslovenia', dialCode: '+386', flag: '🇸🇮' },
  { code: 'hr', name: 'Croacia', dialCode: '+385', flag: '🇭🇷' },
  { code: 'lt', name: 'Lituania', dialCode: '+370', flag: '🇱🇹' },
  { code: 'lv', name: 'Letonia', dialCode: '+371', flag: '🇱🇻' },
  { code: 'ee', name: 'Estonia', dialCode: '+372', flag: '🇪🇪' },
  { code: 'is', name: 'Islandia', dialCode: '+354', flag: '🇮🇸' },
  { code: 'cy', name: 'Chipre', dialCode: '+357', flag: '🇨🇾' },
  { code: 'mt', name: 'Malta', dialCode: '+356', flag: '🇲🇹' },
  { code: 'lu', name: 'Luxemburgo', dialCode: '+352', flag: '🇱🇺' },
  { code: 'md', name: 'Moldavia', dialCode: '+373', flag: '🇲🇩' },
  { code: 'al', name: 'Albania', dialCode: '+355', flag: '🇦🇱' },
  { code: 'mk', name: 'Macedonia del Norte', dialCode: '+389', flag: '🇲🇰' },
  { code: 'ba', name: 'Bosnia y Herzegovina', dialCode: '+387', flag: '🇧🇦' },
  { code: 'rs', name: 'Serbia', dialCode: '+381', flag: '🇷🇸' },
  { code: 'me', name: 'Montenegro', dialCode: '+382', flag: '🇲🇪' },
  { code: 'kw', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'sa', name: 'Arabia Saudita', dialCode: '+966', flag: '🇸🇦' },
  { code: 'ae', name: 'Emiratos Árabes Unidos', dialCode: '+971', flag: '🇦🇪' },
  { code: 'qa', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'bh', name: 'Baréin', dialCode: '+973', flag: '🇧🇭' },
  { code: 'om', name: 'Omán', dialCode: '+968', flag: '🇴🇲' },
  { code: 'eg', name: 'Egipto', dialCode: '+20', flag: '🇪🇬' },
  { code: 'za', name: 'Sudáfrica', dialCode: '+27', flag: '🇿🇦' },
  { code: 'ng', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'ke', name: 'Kenia', dialCode: '+254', flag: '🇰🇪' },
  { code: 'gh', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'tz', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'ug', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'dz', name: 'Argelia', dialCode: '+213', flag: '🇩🇿' },
  { code: 'ma', name: 'Marruecos', dialCode: '+212', flag: '🇲🇦' },
  { code: 'tn', name: 'Túnez', dialCode: '+216', flag: '🇹🇳' },
  { code: 'sn', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'cm', name: 'Camerún', dialCode: '+237', flag: '🇨🇲' },
  { code: 'ci', name: 'Costa de Marfil', dialCode: '+225', flag: '🇨🇮' },
  { code: 'jp', name: 'Japón', dialCode: '+81', flag: '🇯🇵' },
  { code: 'kr', name: 'Corea del Sur', dialCode: '+82', flag: '🇰🇷' },
  { code: 'cn', name: 'China', dialCode: '+86', flag: '🇨🇳' },
  { code: 'in', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'id', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'my', name: 'Malasia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ph', name: 'Filipinas', dialCode: '+63', flag: '🇵🇭' },
  { code: 'th', name: 'Tailandia', dialCode: '+66', flag: '🇹🇭' },
  { code: 'vn', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
  { code: 'nz', name: 'Nueva Zelanda', dialCode: '+64', flag: '🇳🇿' },
  { code: 'au', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'sg', name: 'Singapur', dialCode: '+65', flag: '🇸🇬' }
];

@Component({
  selector: 'app-phone-input',
  standalone: true,
  imports: [
    CommonModule, FormsModule],
  templateUrl: './phone-input.component.html',
  styleUrls: ['./phone-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})

export class PhoneInputComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  phone: string = '';
  disabled = false;
  dropdownOpen = false;

  searchTerm: string = '';
  filteredCountries: CountryData[] = [];

  countries: CountryData[] = countries;

  selectedCountry: CountryData = this.countries[0];

  public onChange: (value: string) => void = () => {};
  public onTouched: () => void = () => {};

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  constructor(private hostElement: ElementRef<HTMLElement>) {}

  ngOnInit() {
    const savedCode = localStorage.getItem('country_code') || 'mx';
    this.selectedCountry = this.countries.find(c => c.code === savedCode) || this.countries[0];
    this.filteredCountries = [...this.countries];
  }

  ngAfterViewInit() {
    // Nada por ahora aquí, el foco lo ponemos cuando abrimos el dropdown
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.dropdownOpen = !this.dropdownOpen;
    if (this.dropdownOpen) {
      this.searchTerm = '';
      this.filteredCountries = [...this.countries];
      // Pequeño delay para que Angular renderice y podamos hacer foco
      setTimeout(() => {
        this.searchInput?.nativeElement.focus();
      }, 0);
    }
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    if (!this.hostElement.nativeElement.contains(target)) {
      this.dropdownOpen = false;
    }
  }

  selectCountry(country: CountryData) {
    this.selectedCountry = country;
    this.phone = '';
    this.defaultRegion = country.code.toUpperCase();
    localStorage.setItem('country_code', country.code);
    this.dropdownOpen = false;
    this.emitValue();
  }

    formattedPhone: string = '';
    isValid: boolean = true;
    phoneUtil = PhoneNumberUtil.getInstance();

    defaultRegion = 'MX';

   onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;

     const filtered = input.value.replace(/[^0-9+]/g, '');

      if (filtered !== input.value) {
        input.value = filtered;
      }

      this.phone = filtered;

      try {
        const number = this.phoneUtil.parseAndKeepRawInput(this.phone, this.selectedCountry.code);

        this.isValid = this.phoneUtil.isValidNumber(number);

        if (this.isValid) {
          this.formattedPhone = this.phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
          this.phone = this.formattedPhone;
        } else {
          this.formattedPhone = this.phone;
        }
      } catch (e) {
        this.isValid = false;
        this.formattedPhone = this.phone;
      }

       this.emitValue();
}

  onSearchChange() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredCountries = [...this.countries];
      return;
    }
    this.filteredCountries = this.countries.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.dialCode.includes(term)
    );
  }

  private emitValue() {
     this.onChange(this.phone);
  }

  writeValue(value: string): void {
    if (value) {
      const country = this.countries.find(c => value.startsWith(c.dialCode));
      if (country) {
        this.selectedCountry = country;
        this.phone = value.replace(country.dialCode, '');
      }
    } else {
      this.phone = '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
