import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroomingDashboardComponent } from './grooming-dashboard.component';

describe('GroomingDashboardComponent', () => {
  let component: GroomingDashboardComponent;
  let fixture: ComponentFixture<GroomingDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroomingDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroomingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
