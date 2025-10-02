import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DebugRemboursementsComponent } from './debug-remboursements.component';

describe('DebugRemboursementsComponent', () => {
  let component: DebugRemboursementsComponent;
  let fixture: ComponentFixture<DebugRemboursementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DebugRemboursementsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugRemboursementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
