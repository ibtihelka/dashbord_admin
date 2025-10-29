import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireLayoutComponent } from './prestataire-layout.component';

describe('PrestataireLayoutComponent', () => {
  let component: PrestataireLayoutComponent;
  let fixture: ComponentFixture<PrestataireLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrestataireLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
