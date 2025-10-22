import { ChangeDetectionStrategy, Component, input, signal, forwardRef } from '@angular/core';
import { NgClass } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';


export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'ui-select',
  standalone:true,
  templateUrl: './select-autocomplete.component.html',
  styleUrls: ['./select-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  readonly options = input.required<SelectOption[]>();
  readonly placeholder = input.required<string>();
  readonly disabled = input<boolean>(false);
  readonly error = input<boolean>(false);
  readonly label = input<string>();
  readonly open = signal(false);
  readonly dropdownDirection = signal<'up' | 'down'>('down');
  readonly value = signal<string | number | null>(null);
  readonly touched = signal(false);
  readonly searchTerm = signal<string>('');
  readonly required = input<boolean>(false);


  private onChange = (value: any) => {};
  private onTouched = () => {};

  public markAsTouched(): void {
    this.touched.set(true);
  }

  get filteredOptions(): SelectOption[] {
    const term = this.searchTerm().toLowerCase();
    return this.options().filter((opt) => opt.label.toLowerCase().includes(term));
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.open.set(true);
    if (target.value === '') {
      this.value.set(null);
      this.onChange(null);
    }
  }

  get containerClasses(): string {
    let base = '';
    if (this.disabled()) {
      base = 'border border-neutral-200 opacity-60 pointer-events-none';
    } else if (this.error() && !this.open()) {
      base = 'border-2 border-error-500';
    } else if (this.open()) {
      base = 'border-2 border-primary-400 rounded-t-md rounded-b-none';
    } else {
      base = 'border border-neutral-200 bg-white';
    }
    if (this.label()) {
      base += ' mt-2';
    }
    return base;
  }

  get buttonClasses(): string {
    const baseClasses =
      'w-full h-12 flex items-center gap-2 px-3 rounded-md focus:outline-none transition-all duration-200';

    const showError = this.error() && this.touched() && !this.open();

    if (showError) {
      return `${baseClasses} bg-error-50 border-error-500`;
    } else {
      return `${baseClasses} ${
        this.open() ? 'border-2 border-neutral-300' : 'border border-neutral-200'
      }`;
    }
  }

  get dropdownClasses(): string {
    const baseClasses =
      'absolute left-0 z-20 w-full py-2 rounded-bl-md rounded-br-md shadow-xl overflow-y-auto hide-scrollbar animate-fade-in max-h-[300px]';

    return `${baseClasses} border border-neutral-200`;
  }

  get selectedOption(): SelectOption | undefined {
    return this.options().find((opt) => opt.value === this.value());
  }

  writeValue(value: any): void {
    this.value.set(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}

  toggle(event?: Event) {
    if (!this.disabled()) {
      event?.preventDefault();
      this.open.update((v) => !v);
    }
  }

  select(opt: SelectOption) {
    if (!this.disabled()) {
      this.open.set(false);
      this.value.set(opt.value);
      this.onChange(opt.value);
      this.searchTerm.set('');
      this.touched.set(true);
      this.onTouched();
    }
  }

  onBlur() {
    setTimeout(() => {
      this.open.set(false);
      this.touched.set(true);
      this.onTouched();
    }, 120);
  }
}
