import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteTopbarComponent } from './societe-topbar.component';

describe('SocieteTopbarComponent', () => {
  let component: SocieteTopbarComponent;
  let fixture: ComponentFixture<SocieteTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteTopbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
