import {AfterViewChecked, Directive, ElementRef, HostListener, Input, Self} from '@angular/core';
import {NgControl}                                                          from '@angular/forms';
@Directive({
               selector: '[NumericInput]',
           })
export class NumericInputDirective implements AfterViewChecked {
    private init: boolean;
    private inputElement: HTMLInputElement;
    private stringRegex: RegExp;
    private alphanumericRegex: RegExp;
    private intRegex: RegExp;
    private currentValue: string;
    private rangeLengthMax: number;
    private rangeLengthMin: number;
    public precisionValue: number;
    @Input() public isInteger: boolean;
    @Input() public isPhoneNumber: boolean;
    @Input() public isMinusAllowed: boolean = false;
    @Input() public isAlphanumeric: boolean;
    @Input() public rangeMin: number = -1e+100;
    @Input() public rangeMax: number = 1e+100;
    @Input() public maxLength: number = 100;
    @Input() public uppercase: boolean = false;
    @Input()
    public set precision(value: string) {
        this.precisionValue = parseFloat(value);
    }
    @HostListener('paste')
    @HostListener('keyup')
    public inputElementChange(): void {
        let value: string = this._checkDot(this.inputElement.value);
        if (this.isPhoneNumber) {
            value = this._setPhoneNumber(value);
        }
        if (this._isInputValid(value)) {
            this.currentValue = value;
        }
        this._setValue(this.currentValue);
    }
    constructor(
        private element: ElementRef,
        @Self() private ngControl: NgControl
    ) {
        this.precisionValue = 0;
        this.stringRegex = /^[-{1}]?[a-zżźćńółęąśŻŹĆĄŚĘŁÓŃA-Z ]*$/;
        this.alphanumericRegex = /^[-{1}]?[a-zżźćńółęąśŻŹĆĄŚĘŁÓŃA-Z0-9_ ]*$/;
        this.init = false;
    }
    public ngAfterViewChecked(): void {
        this.intRegex =
            this.precisionValue ? new RegExp('^-?[0-9]{0,' + this.maxLength + '}([.,])?[0-9]{0,' + this.precisionValue + '}$', 'g')
                                : new RegExp('^-?\\d*$', 'g');
        this.rangeLengthMax = this.rangeMax.toString().length + (this.precisionValue ? this.precisionValue + 1 : 0);
        this.rangeLengthMin = this.rangeMin.toString().length;
        if (this.isMinusAllowed) {
            this.rangeLengthMin = 1;
            this.rangeLengthMax += 1;
        }
        if (!this.init) {
            this.inputElement = this.element.nativeElement;
            this.currentValue = this._checkExpresion(this.inputElement.value) ? this.inputElement.value : '';
            if (this.currentValue) {
                this.init = true;
            }
        }
    }
    private _setPhoneNumber(value: string): string {
        return value.replace(/\D/g, '');
    }
    private _checkDot(value: string): string {
        if (!value) {
            return '';
        }
        return value.replace(',', '.');
    }
    public _checkExpresion(value: string): boolean {
        const floatValue = parseFloat(value);
        if (!value) {
            return true;
        }
        let result = this.isInteger && !this.isAlphanumeric ? this.intRegex.test(value) : this.isAlphanumeric
                                                                                          ? this.alphanumericRegex.test(value)
                                                                                          : this.stringRegex.test(value);
        if (result && !this.isMinusAllowed) {
            result = value.indexOf('-') === -1;
        }
        if (this.isInteger && this.rangeMin !== -1e+100 && ((value.length === this.rangeLengthMin && value.indexOf('-') !== -1) ||
                                                            (value.length === this.rangeLengthMin && value.indexOf('.') !== -1) ||
                                                            value.length < this.rangeLengthMin)) {
        } else {
            // this.ngControl.control.setErrors(null);
        }
        if (this.isInteger && value.length >= this.rangeLengthMin && value.length <= this.rangeLengthMax &&
            (floatValue < this.rangeMin || floatValue > this.rangeMax)) {
            result = false;
        }
        return result;
    }
    private _setValue(value: string): void {
        this.inputElement.value = this.uppercase ? value.toUpperCase() : value;
        this.ngControl.viewToModelUpdate(this.inputElement.value);
    }
    public _isInputValid(value: string): boolean {
        return this._checkExpresion(value) && value.length <= this.maxLength;
    }
}
