import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeedDetailComponent } from './need-detail.component';

describe('NeedDetailComponent', () => {
  let component: NeedDetailComponent;
  let fixture: ComponentFixture<NeedDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NeedDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NeedDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
