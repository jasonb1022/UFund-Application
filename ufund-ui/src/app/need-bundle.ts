/*
    - Just holds some quantity of Need instances
    - Note that this doesn't actually store any
      copies of the Needs, just how many of each
*/


import { Need } from './need';
export class NeedBundle {

    //Variables
    private needTemplate: Need;
    private count: number = 0;

    //Constructor
    constructor(_needTemplate:Need) { 
        this.needTemplate = _needTemplate;
        }

    //Getters
    get_count(): number {
        return this.count;
        }

    get_need_template(): Need {
        return this.needTemplate;
        }

    get_cost_formatted(): string {

        //Format the cost as a currency
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            this.count * (this.needTemplate.cost / 100)
            );

        }

    is_empty(): boolean {
        return (this.count === 0);
        }

    is_valid(): boolean {
        return (this.count <= this.needTemplate.quantity);
        }

    //Functions
    need_is_compatible(needTarget:Need): boolean {

        return (
            (this.needTemplate.id === needTarget.id)
            && (this.needTemplate.name === needTarget.name)
            && (this.needTemplate.quantity === needTarget.quantity)
            && (this.needTemplate.cost === needTarget.cost)
            && (this.needTemplate.type === needTarget.type)
            );

        }

    quantity_exceeds_limit(): boolean {

        return (this.count >= this.needTemplate.quantity);

        }

    add_need_instance():void {

        //Increment the count
        this.count++;

        }

    remove_need_instance():boolean {

        if (this.count <= 0)
            return false;

        //Decrement the count
        this.count--;

        return true;

        }

    toString(): string {
        return (this.needTemplate.name + " x" + this.count);
        }

    }