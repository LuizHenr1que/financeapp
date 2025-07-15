import apiService from './api';

export interface CardData {
  name: string;
  type: string;
  icon: string;
  limit: string;
  closingDay: number | null;
  dueDay: number | null;
}

class CardService {
  async createCard(card: CardData, token?: string) {
    return apiService.post('/cards', card, token);
  }
}

export default new CardService();
