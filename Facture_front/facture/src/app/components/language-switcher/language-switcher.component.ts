import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: false,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {
  currentLanguage: string = 'fr';  // Default language
  showLanguageMenu: boolean = false; // Track if the language menu is visible

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('fr');  // Set default language to French
    this.translate.use('fr');  // Apply the default language
  }

  // Toggle language menu visibility
  toggleLanguageMenu() {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  // Switch language
  switchLanguage(language: string) {
    this.translate.use(language);  // Apply the new language
    this.currentLanguage = language;  // Update the current language
    this.showLanguageMenu = false;  // Close the language menu after selection
  }

  // Get the current language flag
  getLanguageFlag(): string {
    return this.currentLanguage === 'fr' ? 'assets/icons/square.png' : 'assets/icons/united-kingdom.png';
  }
}
