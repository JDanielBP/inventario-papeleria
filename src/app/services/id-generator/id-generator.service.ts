import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IdGeneratorService {

  constructor() { }

  elevenCharacterID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXZ0123456789';
    let result = '';
    for (let i = 0; i < 11; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}
