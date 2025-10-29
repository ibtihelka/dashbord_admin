import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestataireListComponent } from './prestataire-list.component';

describe('PrestataireListComponent', () => {
  let component: PrestataireListComponent;
  let fixture: ComponentFixture<PrestataireListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrestataireListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestataireListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
