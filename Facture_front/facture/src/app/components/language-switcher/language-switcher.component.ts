import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  standalone: false,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {
  currentLanguage: string = 'fr';  // Langue par défaut

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('fr');  // Définir le français comme langue par défaut
    this.translate.use('fr');  // Appliquer la langue par défaut
  }

  switchLanguage(language: string) {
    this.translate.use(language);  // Applique la nouvelle langue
    this.currentLanguage = language;  // Met à jour la langue actuelle
  }

  getLanguageFlag(): string {
    // Retourne le chemin de l'image en fonction de la langue actuelle
    return this.currentLanguage === 'fr' ? 'assets/icons/france.png' : 'assets/icons/uk.png';
  }
}
