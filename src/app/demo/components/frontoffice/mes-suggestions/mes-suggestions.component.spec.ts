import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesSuggestionsComponent } from './mes-suggestions.component';

describe('MesSuggestionsComponent', () => {
  let component: MesSuggestionsComponent;
  let fixture: ComponentFixture<MesSuggestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MesSuggestionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MesSuggestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
