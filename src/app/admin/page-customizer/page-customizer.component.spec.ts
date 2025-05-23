import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCustomizerComponent } from './page-customizer.component';

describe('PageCustomizerComponent', () => {
  let component: PageCustomizerComponent;
  let fixture: ComponentFixture<PageCustomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageCustomizerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
