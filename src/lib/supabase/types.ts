export interface Card {
  front: string;
  back: string;
}

export interface Deck {
  id: string;
  owner_id: string;
  title: string;
  topic: string;
  cards: Card[];
  created_at: string;
}
