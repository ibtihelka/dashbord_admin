import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonTelephoneComponent } from './mon-telephone.component';

describe('MonTelephoneComponent', () => {
  let component: MonTelephoneComponent;
  let fixture: ComponentFixture<MonTelephoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonTelephoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonTelephoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
