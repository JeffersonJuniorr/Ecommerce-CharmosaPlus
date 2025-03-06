import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListModalComponent } from './product-list-modal.component';

describe('ProductListModalComponent', () => {
  let component: ProductListModalComponent;
  let fixture: ComponentFixture<ProductListModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
