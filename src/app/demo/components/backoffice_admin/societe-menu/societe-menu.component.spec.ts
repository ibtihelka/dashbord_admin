import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteMenuComponent } from './societe-menu.component';

describe('SocieteMenuComponent', () => {
  let component: SocieteMenuComponent;
  let fixture: ComponentFixture<SocieteMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
