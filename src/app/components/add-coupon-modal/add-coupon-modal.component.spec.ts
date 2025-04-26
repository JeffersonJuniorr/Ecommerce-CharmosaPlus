import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCouponModalComponent } from './add-coupon-modal.component';

describe('AddCouponModalComponent', () => {
  let component: AddCouponModalComponent;
  let fixture: ComponentFixture<AddCouponModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCouponModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCouponModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
