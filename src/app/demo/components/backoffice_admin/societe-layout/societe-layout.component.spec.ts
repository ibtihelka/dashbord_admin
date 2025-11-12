import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteLayoutComponent } from './societe-layout.component';

describe('SocieteLayoutComponent', () => {
  let component: SocieteLayoutComponent;
  let fixture: ComponentFixture<SocieteLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteLayoutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
