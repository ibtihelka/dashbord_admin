import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesRapportsComponent } from './mes-rapports.component';

describe('MesRapportsComponent', () => {
  let component: MesRapportsComponent;
  let fixture: ComponentFixture<MesRapportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesRapportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesRapportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
