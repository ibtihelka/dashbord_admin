import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocieteSidebarComponent } from './societe-sidebar.component';

describe('SocieteSidebarComponent', () => {
  let component: SocieteSidebarComponent;
  let fixture: ComponentFixture<SocieteSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SocieteSidebarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocieteSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
