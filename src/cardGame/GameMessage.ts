import { Card } from "./Card";
import { CardGameScene } from "./Game/CardGame";
import { config } from "./config";

export class GameMessage {
  messageText: Phaser.GameObjects.Text;
  private container: Phaser.GameObjects.Container;
  private scene: CardGameScene;
  private timeout?: number;
  constructor(scene: CardGameScene) {
    this.scene = scene;
    this.container = this.createContainer();

    this.messageText = scene.add.text(0, 0, "", {
      fontSize: 24,
    });
    this.messageText
      .setOrigin(0.5)
      .setPosition(scene.game.canvas.width / 2, scene.game.canvas.height / 2);

    this.show();
  }

  private setText(text: string) {
    this.messageText.setText(text);
  }
  show() {
    this.messageText.setVisible(true);
    this.timeout = window.setTimeout(() => {
      this.messageText.setVisible(false);
    }, 2000);
  }

  throwErrorText(text: string) {
    clearTimeout(this.timeout);
    this.setText(text);
    this.show();
  }

  createContainer() {
    const container = this.scene.add.container(0, 0);

    container.setPosition(35, config.cardHeight + 105);
    return container;
  }

  showCard(card: Card) {
    this.container.removeAll(true);

    // Name
    this.container.add(
      this.scene.add
        .text(this.scene.game.canvas.width / 2, 0, card.getName(), {
          ...config.text.textBaseStyle,
          align: "center",
          fontStyle: "bold",
          fontFamily: "Sans Serif",
          fontSize: 26,
        })
        .setOrigin(0.5),
    );

    let y = 40;

    for (const effect of card.effects) {
      const keyword = this.scene.add
        .text(this.scene.game.canvas.width / 2, y, effect.getKeyword(), {
          ...config.text.textBaseStyle,
          ...config.text.keywords,
          align: "center",
          fontFamily: "Sans Serif",
          fontSize: 24,
        })
        .setOrigin(0.5);

      const description = this.scene.add
        .text(
          this.scene.game.canvas.width / 2,
          y + 35,
          effect.getDescription(),
          {
            ...config.text.textBaseStyle,
            align: "center",
            wordWrap: { width: 450 },
            fontSize: 22,
            fontFamily: "Sans Serif",
          },
        )
        .setOrigin(0.5);

      this.container.add([keyword, description]);

      y += 70;
    }
  }

  hide() {
    this.container.removeAll(true);
  }
}
