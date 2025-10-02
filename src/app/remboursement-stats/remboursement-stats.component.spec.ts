import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemboursementStatsComponent } from './remboursement-stats.component';

describe('RemboursementStatsComponent', () => {
  let component: RemboursementStatsComponent;
  let fixture: ComponentFixture<RemboursementStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemboursementStatsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemboursementStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
