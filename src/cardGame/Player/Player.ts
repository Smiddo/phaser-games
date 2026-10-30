import { Board } from "../Board";
import { CardGameEvents, CardGameScene } from "../Game/CardGame";
import { CardView } from "../CardView";
import { IDamageable } from "../combat/Damageable";
import { IHealable } from "../combat/Healable";
import { PlayerView } from "./PlayerView";
import { Card } from "../Card";
import { IHealEvent } from "../combat/events";

export class Player implements IDamageable, IHealable {
  private resource: number;
  private health: number;
  private name: string;
  private board: Board;
  private currentCardViews: CardView[] = [];
  private cardViewGraveyard: CardView[] = [];
  private view: PlayerView;
  private tier: number;

  constructor({
    resource,
    life,
    name,
    board,
    scene,
  }: {
    resource: number;
    life: number;
    name: string;
    board: Board;
    scene: CardGameScene;
  }) {
    this.health = life;
    this.resource = resource;
    this.name = name;
    this.board = board;
    this.board.setOwner(this);
    this.view = new PlayerView(this, scene);
    this.tier = 1;
  }

  getTier() {
    return this.tier;
  }
  increaseTier() {
    this.tier++;
  }

  getLife() {
    return this.health;
  }
  addLife(value: number) {
    this.health += value;
  }

  private addCardView(view: CardView) {
    this.currentCardViews.push(view);
  }
  private removeCardView(view: CardView) {
    if (this.currentCardViews.includes(view)) {
      this.cardViewGraveyard.push(view);
      this.currentCardViews = this.currentCardViews.filter((v) => v !== view);
    }
  }
  buyCard(card: CardView) {
    CardGameEvents.emit("cardBought", card.getCard());
    this.addCardView(card);
    this.addResource(-card.getCard().getCost());
    card.update();
  }
  sellCard(card: CardView) {
    this.removeCardView(card);
    this.addResource(card.getCard().getValue());
    card.update();
  }

  canBuyCard(card: CardView) {
    return this.resource - card.getCard().getCost() >= 0;
  }

  holdsCard(card: Card): boolean {
    return this.getCardViews().some((view) => view?.getCard() === card);
  }

  isDead() {
    return this.health <= 0;
  }
  getResource() {
    return this.resource;
  }
  addResource(value: number) {
    this.resource += value;
    this.view.updateResourceDisplay(this.resource);
  }
  getName() {
    return this.name;
  }

  getCardViews() {
    return this.board.getCardViews();
  }
  getBoard() {
    return this.board;
  }
  takeDamage(value: number): void {
    this.addLife(-value);
    this.view.updateHealthDisplay();
    if (this.getLife() <= 0) {
      CardGameEvents.emit("gameOver", true);
    }
  }
  heal(value: number): void {
    this.addLife(value);
    CardGameEvents.emit("healed", {
      target: this,
      amount: value,
    } satisfies IHealEvent);
    this.view.updateHealthDisplay();
  }
}
