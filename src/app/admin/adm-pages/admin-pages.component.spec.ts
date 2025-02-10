import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPagesComponent } from './admin-pages.component';

describe('AdminPagesComponent', () => {
  let component: AdminPagesComponent;
  let fixture: ComponentFixture<AdminPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
