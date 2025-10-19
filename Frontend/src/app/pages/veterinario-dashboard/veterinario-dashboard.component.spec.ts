import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinarioDashboardComponent } from './veterinario-dashboard.component';

describe('VeterinarioDashboardComponent', () => {
  let component: VeterinarioDashboardComponent;
  let fixture: ComponentFixture<VeterinarioDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinarioDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeterinarioDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
