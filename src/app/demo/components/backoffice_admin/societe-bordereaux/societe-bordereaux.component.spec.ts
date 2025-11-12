import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteBordereauxComponent } from './societe-bordereaux.component';

describe('SocieteBordereauxComponent', () => {
  let component: SocieteBordereauxComponent;
  let fixture: ComponentFixture<SocieteBordereauxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteBordereauxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteBordereauxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
