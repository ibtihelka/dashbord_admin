import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesRemboursementsComponent } from './mes-remboursements.component';

describe('MesRemboursementsComponent', () => {
  let component: MesRemboursementsComponent;
  let fixture: ComponentFixture<MesRemboursementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesRemboursementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesRemboursementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
