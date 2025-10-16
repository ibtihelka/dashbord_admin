import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesRibsComponent } from './mes-ribs.component';

describe('MesRibsComponent', () => {
  let component: MesRibsComponent;
  let fixture: ComponentFixture<MesRibsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesRibsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesRibsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
