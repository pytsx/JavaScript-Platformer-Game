class Player extends Sprite {
  constructor({
    position,
    collisionBlocks,
    imageSrc,
    frameRate,
    frameBuffer,
    scale = .8,
    animations,
    collisionPlatforms,
  }) {
    super({ imageSrc, frameRate, frameBuffer, scale })
    this.position = position
    this.color = 'red'
    this.velocity = {
      x: 0,
      y: 1
    }

    this.collisionBlocks = collisionBlocks
    this.collisionPlatforms = collisionPlatforms

    this.hitbox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: 10,
      height: 10
    }

    this.lastPosition = ['left']

    this.camerabox = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: 100,
      height: 50
    }

    this.animations = animations

    for (let key in animations) {
      const image = new Image()

      image.src = this.animations[key].imageSrc

      this.animations[key].image = image
    }
  }

  switchSprite(key) {
    if (this.image == this.animations[key] || !this.loaded) return
    this.image = this.animations[key].image
    this.frameBuffer = this.animations[key].frameBuffer
    this.frameRate = this.animations[key].frameRate
  }

  checkForCanvasCollision({ canvas }) {
    if (
      this.hitbox.position.x + this.hitbox.width + this.velocity.x >= canvas.width ||
      this.hitbox.position.x + this.velocity.x <= 0
    ) {
      this.velocity.x = 0
    } else if (this.hitbox.position.y + this.velocity.y <= 0) {
      this.velocity.y = 0
    }
  }

  updateCamerabox() {
    this.camerabox = {
      position: {
        x: this.position.x - 90,
        y: this.position.y - 80
      },
      width: 300,
      height: 200
    }
  }

  shouldPanCameraToTheLeft({ canvas, camera }) {
    const cameraboxRigthSide = this.camerabox.position.x + this.camerabox.width
    const scaledCanvasWidth = canvas.width / SCALA

    if (cameraboxRigthSide >= scaledCanvasWidth * SCALA) return

    if (cameraboxRigthSide >= scaledCanvasWidth + Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x
    }
  }

  shouldPanCameraToTheRight({ canvas, camera }) {
    if (this.camerabox.position.x <= 0) return

    if (this.camerabox.position.x <= Math.abs(camera.position.x)) {
      camera.position.x -= this.velocity.x
    }
  }

  shouldPanCameraDown({ canvas, camera }) {
    if (this.camerabox.position.y + this.velocity.y <= 0) return

    if (this.camerabox.position.y <= Math.abs(camera.position.y)) {
      camera.position.y -= this.velocity.y
    }
  }

  shouldPanCameraUp({ canvas, camera, backgroundImageHeight }) {
    const scaledCanvasHeight = canvas.height / SCALA

    if (this.camerabox.position.y + this.camerabox.height + this.velocity.y >= backgroundImageHeight) return

    if (this.camerabox.position.y + this.camerabox.height >= Math.abs(camera.position.y) + scaledCanvasHeight) {
      camera.position.y -= this.velocity.y
    }
  }

  update() {
    this.updateFrames()
    this.updateHitbox()
    this.updateCamerabox()

    // desenha região do camerabox
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.camerabox.position.x, this.camerabox.position.y, this.camerabox.width, this.camerabox.height)


    // desenha região da imagem
    c.fillStyle = 'rgba(0, 255, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)


    // desenha região do hitbox
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.hitbox.position.x, this.hitbox.position.y, this.hitbox.width, this.hitbox.height)

    this.draw()

    this.position.x += this.velocity.x
    this.updateHitbox()
    this.checkForHorizontalCollision()
    this.applyGravity()
    this.updateHitbox()
    this.checkForVerticalCollision()
  }

  updateHitbox() {
    this.hitbox = {
      position: {
        x: this.position.x + 72 * this.scale,
        y: this.position.y + 55 * this.scale
      },
      width: 22 * this.scale,
      height: 50 * this.scale
    }
  }



  checkForHorizontalCollision() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i]
      if (
        checkCollision({
          object1: this.hitbox,
          object2: collisionBlock
        })
      ) {
        if (this.velocity.x > 0) {
          this.velocity.x = 0
          const offset = this.hitbox.position.x - this.position.x + this.hitbox.width
          this.position.x = collisionBlock.position.x - offset - 0.01
          break
        }
        if (this.velocity.x < 0) {
          this.velocity.x = 0

          const offset = this.hitbox.position.x - this.position.x
          this.position.x = collisionBlock.position.x + collisionBlock.width - offset + 0.01
          break
        }
      }
    }
  }

  applyGravity() {
    this.velocity.y += GRAVITY
    this.position.y += this.velocity.y
  }

  checkForVerticalCollision() {
    for (let i = 0; i < this.collisionBlocks.length; i++) {
      const collisionBlock = this.collisionBlocks[i]
      if (
        checkCollision({
          object1: this.hitbox,
          object2: collisionBlock
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height

          this.position.y = collisionBlock.position.y - offset - 0.01
          break
        }
        if (this.velocity.y < 0) {
          this.velocity.y = 0
          const offset = this.hitbox.position.y - this.position.y
          this.position.y = collisionBlock.position.y + collisionBlock.height - offset + 0.01
          break
        }
      }
    }

    // check platform collision

    for (let i = 0; i < this.collisionPlatforms.length; i++) {
      const collisionPlatform = this.collisionPlatforms[i]
      if (
        checkPlatformCollision({
          object1: this.hitbox,
          object2: collisionPlatform
        })
      ) {
        if (this.velocity.y > 0) {
          this.velocity.y = 0

          const offset =
            this.hitbox.position.y - this.position.y + this.hitbox.height

          this.position.y = collisionPlatform.position.y - offset - 0.01
          break
        }

      }
    }
  }
}

