import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroomingHistorialComponent } from './grooming-historial.component';

describe('GroomingHistorialComponent', () => {
  let component: GroomingHistorialComponent;
  let fixture: ComponentFixture<GroomingHistorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroomingHistorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroomingHistorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
