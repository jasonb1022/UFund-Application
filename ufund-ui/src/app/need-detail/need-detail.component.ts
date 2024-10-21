import {Component, Input} from '@angular/core';
import {NgIf, UpperCasePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Need} from '../need';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { NeedService } from '../need.service';

@Component({
  standalone: true,
  selector: 'app-need-detail',
  templateUrl: './need-detail.component.html',
  styleUrls: ['./need-detail.component.css'],
  imports: [FormsModule, NgIf, UpperCasePipe],
})
export class NeedDetailComponent {
  @Input() need?: Need;
  constructor(
    private route: ActivatedRoute,
    private needService: NeedService,
    private location: Location
  ) {}
  ngOnInit(): void {
    this.getNeed();
  }
  
  getNeed(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.needService.getNeed(id)
      .subscribe(need => this.need = need);
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (this.need) {
      this.needService.updateNeed(this.need)
        .subscribe(() => this.goBack());
    }
  }
}