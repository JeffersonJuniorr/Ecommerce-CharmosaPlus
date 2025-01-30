import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmPagesComponent } from './adm-pages.component';

describe('AdmPagesComponent', () => {
  let component: AdmPagesComponent;
  let fixture: ComponentFixture<AdmPagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmPagesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmPagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
