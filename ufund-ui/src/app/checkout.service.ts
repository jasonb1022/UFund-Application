import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
  })

export class CheckoutService {

  //Variables
  triggerCheckoutOpen: EventEmitter<void> = new EventEmitter<void>();

  //Constructor
  constructor() { }

  //Functions
  open_checkout_panel() {

    this.triggerCheckoutOpen.emit();

    }
  
  }
