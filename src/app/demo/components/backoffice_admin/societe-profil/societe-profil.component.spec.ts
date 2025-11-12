import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteProfilComponent } from './societe-profil.component';

describe('SocieteProfilComponent', () => {
  let component: SocieteProfilComponent;
  let fixture: ComponentFixture<SocieteProfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteProfilComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
