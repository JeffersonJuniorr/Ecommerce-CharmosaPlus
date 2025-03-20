import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractAdminComponent } from './extract-admin.component';

describe('ExtractAdminComponent', () => {
  let component: ExtractAdminComponent;
  let fixture: ComponentFixture<ExtractAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtractAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
