import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreerRapportComponent } from './creer-rapport.component';

describe('CreerRapportComponent', () => {
  let component: CreerRapportComponent;
  let fixture: ComponentFixture<CreerRapportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreerRapportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreerRapportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
