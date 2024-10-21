import { Component, Input } from '@angular/core';
import { CheckoutService } from '../checkout.service';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { NeedBundle } from '../need-bundle';
import { NeedService } from '../need.service';
import { Need } from '../need';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css', '../dark-mode/dark-mode.component.css']
})
export class CheckoutComponent {

  //...
  @Input()
  parent:any;

  //Variables
  displayCheckout:boolean = false;
  needBundles: NeedBundle[] = [];
  
  //Constructor
  constructor(
    private checkoutService: CheckoutService,
    private needService: NeedService
    ) {

    this.checkoutService.triggerCheckoutOpen.subscribe(() => {
      this.open_checkout_panel();
      });

    }

  //Methods
  open_checkout_panel() {
    
    console.log("Opening checkout panel...");
    this.displayCheckout = true;

    }

  close_checkout_panel() {
    this.displayCheckout = false;
    }

    confirm_checkout() {
      const fundingBasket = this.needService.getFundingBasket();
    
      const updateObservables = fundingBasket.map(bundle => {
        const need = bundle.get_need_template();
        const count = bundle.get_count();
    
        need.quantity -= count;
    
        return this.needService.updateNeed(need);
      });
    
      // Use forkJoin to wait for all the updateNeed observables to complete
      forkJoin(updateObservables).subscribe(() => {
        this.close_checkout_panel();
    
        this.parent.clear_bundles();
        this.needService.refreshRecommendedNeeds();
      });
    }
  }
