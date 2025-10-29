import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireProfilComponent } from './prestataire-profil.component';

describe('PrestataireProfilComponent', () => {
  let component: PrestataireProfilComponent;
  let fixture: ComponentFixture<PrestataireProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrestataireProfilComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
