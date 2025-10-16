import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesTelephonesComponent } from './mes-telephones.component';

describe('MesTelephonesComponent', () => {
  let component: MesTelephonesComponent;
  let fixture: ComponentFixture<MesTelephonesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesTelephonesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesTelephonesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
