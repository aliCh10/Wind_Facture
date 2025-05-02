import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StyleManagerService {
  private stylesSubject = new BehaviorSubject<{ [key: string]: any }>({});
  componentStyles$ = this.stylesSubject.asObservable();

 

  updateStyles(componentName: string, styles: any, callerContext: string = 'unknown') {
    const current = this.stylesSubject.getValue();
    const currentComponentStyles = current[componentName] || {};

    // Check if styles have changed
    if (!this.areStylesEqual(currentComponentStyles, styles)) {
      const newStyles = { ...current, [componentName]: { ...currentComponentStyles, ...styles } };
      this.stylesSubject.next(newStyles);
    
  }
}

  getStyles(componentName: string) {
    return this.stylesSubject.getValue()[componentName] || {};
  }

  private areStylesEqual(currentStyles: any, newStyles: any): boolean {
    const currentKeys = Object.keys(currentStyles);
    const newKeys = Object.keys(newStyles);

    if (currentKeys.length !== newKeys.length) return false;

    for (const key of currentKeys) {
      if (currentStyles[key] !== newStyles[key]) return false;
    }

    return true;
  }
}