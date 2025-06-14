import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelSelectionModalComponentComponent } from './model-selection-modal-component.component';

describe('ModelSelectionModalComponentComponent', () => {
  let component: ModelSelectionModalComponentComponent;
  let fixture: ComponentFixture<ModelSelectionModalComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelSelectionModalComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelSelectionModalComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
