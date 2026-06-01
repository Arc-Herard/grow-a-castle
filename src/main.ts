import Phaser from "phaser";

class mygame extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;
  private stars!: Phaser.Physics.Arcade.Group;
  private scoreText!: Phaser.GameObjects.Text;
  private score!: number;
  private bombs!: Phaser.Physics.Arcade.Group;

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", { frameWidth: 32, frameHeight: 48 });
  }

  create() {
    this.add.image(this.scale.width / 2, this.scale.height / 2, "sky").setScale(2);

    let platforms = this.physics.add.staticGroup();
    platforms.create(500, 568, "ground").setDisplaySize(1000, 100).refreshBody();
    platforms.create(400, 300, "ground");
    platforms.create(100, 100, "ground");
    platforms.create(700, 100, "ground");

    //------PLAYER---------------------------------------------------------
    this.player = this.physics.add.sprite(100, 450, "dude").setScale(2);
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    const newWidth = this.player.width * 0.7;
    const newHeight = this.player.height * 0.8;
    const offsetX = (this.player.width - newWidth) / 2;
    const offsetY = this.player.height - newHeight;

    if (this.player.body) this.player.body.setSize(newWidth, newHeight).setOffset(offsetX, offsetY); // only affects collision detection

    this.physics.add.collider(this.player, platforms);

    if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();

    //-------STARS---------------------------------------
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.getChildren().forEach((gameObject) => {
      const star = gameObject as Phaser.Physics.Arcade.Sprite;
      if (star) {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      }
    });

    this.physics.add.collider(this.stars, platforms);

    this.score = 0;
    this.scoreText = this.add.text(16, 16, "score: 0", { fontSize: "32px", color: "#000" });
    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, platforms);
    this.physics.add.collider(this.player, this.bombs, this.hitBomb, undefined, this);
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn", true);
    }

    if (this.cursors.up.isDown && this.player.body && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }

    this.physics.add.overlap(
      this.player,
      this.stars,
      (p, s) => {
        this.collectStar(p, s);
      },
      undefined,
      this,
    );
  }

  collectStar(player_: any, star_: any) {
    let star = star_ as Phaser.Physics.Arcade.Sprite;
    let player = player_ as Phaser.Physics.Arcade.Sprite;
    star.disableBody(true, true);
    this.score++;
    this.scoreText.setText(`Score: ${this.score}`);

    if (this.stars.countActive(true) === 0) {
      this.stars.getChildren().forEach((child) => {
        const star = child as Phaser.Physics.Arcade.Sprite;
        if (star.body) star.enableBody(true, star.x + Phaser.Math.Between(40, 70), 0, true, true);
      });
      let x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
      let bomb = this.bombs.create(x, 16, "bomb");
      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
  }

  private hitBomb = (player_: any, bomb_: any) => {
    let player = player_ as Phaser.Physics.Arcade.Sprite;
    let bomb = bomb_ as Phaser.Physics.Arcade.Sprite;
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play("turn");
    bomb.destroy();
    this.gameOver();
  };

  gameOver() {
    this.scene.restart();
  }
}

let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 600,
  scene: mygame,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200, x: 0 },
      debug: true,
    },
  },
};

new Phaser.Game(config);
