import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, Inject } from '@angular/core';
import { Need } from '../need';
import { NeedBundle } from '../need-bundle';
import { NeedService } from '../need.service';
import { CheckoutService } from '../checkout.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [ './dashboard.component.css', '../dark-mode/dark-mode.component.css', '../checkout/checkout.component.css' ],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit {

  //Variables
  needBundles: NeedBundle[] = [];
  needsRecommended:Need[] = [];
  fundingBasket: Need[] = [];
  username = localStorage.getItem('username') || '';
  totalCost:number = 0.00;

  //Constructor
  constructor(
    private needService: NeedService,
    private checkoutService: CheckoutService
  ) { }


  //Functions -- Init
  ngOnInit(): void {

    this.getNeeds();
    this.getFundingBasket(); 

    this.needService.recommendedNeedsMessage.subscribe(needsRecommendedIncoming => {
      this.needsRecommended = needsRecommendedIncoming;
      });
  
    }


  //#region  [Functions -- Checkout]

  update_total_cost(): void {

    //Reset the total cost
    this.totalCost = 0.00;

    //Sum of the total cost of the need bundles
    for(let bundle of this.needBundles) {
      this.totalCost += (bundle.get_need_template().cost * bundle.get_count());
      }

    }

  get_total_cost(): string {

    //Format the total cost as a currency
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.totalCost / 100);

    }

  get_need_bundles(): NeedBundle[] {

    return this.needBundles;

    }

  open_checkout_panel() {

    //Check if the checkout is valid
    if (this.checkout_valid()) {

      this.update_total_cost();
      this.checkoutService.open_checkout_panel();

      }

    }

  checkout_valid(): boolean {

    /*
      The following conditions must be met for a checkout to be valid:
      - The user must be logged in
      - The user must have at least one need in their funding basket
      - The Needs in the funding basket must be valid
      - The size of each bundle must be less than or equal to the quantity of the need template
    */

    //Check if the user is logged in
    if (this.username === 'admin') {
      console.log("Checkout Invalid [1] - User is admin");
      return false;
      }

    //Check if the funding basket is empty
    if (this.needBundles.length === 0) {
      console.log("Checkout Invalid [2] - Funding basket is empty");
      return false;
      }

    //Check if the Needs in the funding basket are valid
    for(let bundle of this.needBundles) {

      if (bundle.is_empty()) {
        console.log("Checkout Invalid [3.1] - Empty bundle in funding basket");
        return false;
        }

      if (!bundle.is_valid()) {
        console.log("Checkout Invalid [3.2] - Invalid bundle in funding basket");
        return false;
        }

      }

    //Successfully validated
    return true;

    }

  //#endregion


  //#region  [Functions -- Recommended Needs]

  refreshRecommendedNeeds(): void {
    this.needService.refreshRecommendedNeeds();
    }

  //#endregion


  //#region  [Functions -- Need Bundles]

  bundle_sort(): void {

    //Sort the need bundles by name
    this.needBundles.sort(
      (a,b) =>
      (a.get_need_template().name > b.get_need_template().name) ? 1 : -1
      );

    }

  quantity_exceeds_bundle_limit(needInstance:Need):boolean {

    /*
      Check if the quantity of the Need instance exceeds the bundle limit
      (i.e. adding a Need instance would exceed the quantity of the Need template)
    */

    let bundleTarget = this.needBundles.find(b => b.need_is_compatible(needInstance));
    if (bundleTarget) {
      return bundleTarget.quantity_exceeds_limit();
      }

    return (needInstance.quantity <= 0);

    }

  add_to_bundle(needInstance:Need):void {

      let bundleTarget = this.needBundles.find(b => b.need_is_compatible(needInstance));
      
      //Bundle Target already exists, add to it
      if (bundleTarget) {
        bundleTarget.add_need_instance();
        }

      //Bundle Target does not exist, create it
      else {
        let newBundle = new NeedBundle(needInstance);
        newBundle.add_need_instance();
        this.needBundles.push(newBundle);
        }
      
      //Sort the need bundles
      this.bundle_sort();

      //Add the need to the funding basket
      this.updateFundingBasketStorage();

    }

  remove_from_bundle(needInstance:Need):void {
  
    //Get the index of the bundle containing the Need instance
    let bundleIndex = this.needBundles.findIndex(b => b.need_is_compatible(needInstance));
    if (bundleIndex !== -1) {

      let bundleTarget = this.needBundles[bundleIndex];

      if (!bundleTarget.remove_need_instance()) {
        console.error("Error removing need instance", needInstance);
        }

      if (bundleTarget.is_empty()) {
        this.needBundles.splice(bundleIndex, 1);
        }

      }
    
    //Need instance not found in any bundle
    else {
      console.log("Need instance not found in any bundle!", needInstance);
      }
    
    //Sort the need bundles
    this.bundle_sort();

    }

  clear_bundles(): void {

    //Clear all need bundles
    this.needBundles = [];

    //Clear the funding basket
    this.updateFundingBasketStorage();

    }

  //#endregion


  //#region  [Functions -- Need Updates]

  is_admin(): boolean { 
  
    return (this.username === 'admin');

    }

  getNeeds(): void {

    console.log("Getting needs...");
    this.needService.getNeeds()
      .subscribe(needs => {

      //  for(let need in needs) {
      //   console.log("Need: " + need);
      //   }

      });
  
    }
  
  getFundingBasket(): void { 

    const username = localStorage.getItem('username') || '';
    if (username === 'admin')
      return;

    //this.fundingBasket = JSON.parse(localStorage.getItem('fundingBasket') || '[]');
    this.loadFundingBasketFromStorage();
    
    //Add needs from teh funding basket to the need bundles
    for(let need of this.fundingBasket) {
      this.add_to_bundle(need);
      }


    console.log("Funding Basket:", this.fundingBasket);

    // console.log("Funding Basket:");
    // for(let need of this.fundingBasket) {
    //   console.log("Need: " + need);
    // }

  }

  /**
   * Adds a need to the funding basket
   * @param need The need to add
   * @returns void
   */
  add_to_funding_basket(need: Need): void {

    const username = localStorage.getItem('username') || '';
    if (username === 'admin')
      return;

    //this.fundingBasket.push(need);
    //localStorage.setItem('fundingBasket', JSON.stringify(this.fundingBasket));

    this.add_to_bundle(need);
    
    }

  /**
   * Removes a need from the funding basket
   * @param index The index of the need to remove
   * @returns void
   */ 
  remove_from_funding_basket(index: number): void {

    const username = localStorage.getItem('username') || '';
    if (username === 'admin')
      return;

    //Find the bundle associated with the need
    const bundle = this.needBundles[index];
    if (bundle) {

      //Remove one instance from the bundle
      bundle.remove_need_instance();

      //If the bundle is empty, remove it from the Need Bundles list
      if (bundle.is_empty())
        this.needBundles.splice(index, 1);

      //Remove the need from the funding basket
      //this.fundingBasket.splice(index, 1);
      //localStorage.setItem('fundingBasket', JSON.stringify(this.fundingBasket));
      this.updateFundingBasketStorage();

      }
    else {
      console.error("Error removing need from funding basket", index);
      }

    }

  /**
   * Updates the funding basket in local storage
   * @returns void
   */
  updateFundingBasketStorage(): void {

    const storableBundles = this.needBundles
      .filter(bundle => !bundle.is_empty())
      .map(bundle => ({
        needTemplate: {
          id: bundle.get_need_template().id,
          name: bundle.get_need_template().name,
          quantity: bundle.get_need_template().quantity,
          cost: bundle.get_need_template().cost,
          type: bundle.get_need_template().type
        },

        count: bundle.get_count()
        
      })
    );
  
    localStorage.setItem('fundingBasket', JSON.stringify(storableBundles));

    }
    
  /**
   * Loads the funding basket from local storage
   * @returns void
   */      
  loadFundingBasketFromStorage(): void {
    
    const storedBundles = JSON.parse(localStorage.getItem('fundingBasket') || '[]');
    this.needBundles = [];
  
    for(let bundle in storedBundles) {

      let need = storedBundles[bundle].needTemplate;
      let count = storedBundles[bundle].count;
      let newBundle = new NeedBundle(need);
      console.log("Count: " + count);
      for(let i = 0; i < count; i++) {
        newBundle.add_need_instance();
        }

      this.needBundles.push(newBundle);

      }

    }
  
  needCostFormat(cost: number):string {

    const COST_DECIMAL_OFFSET = 100

    var formattedNumber = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      (cost / COST_DECIMAL_OFFSET),
    );

    return formattedNumber

  }

  //#endregion

}