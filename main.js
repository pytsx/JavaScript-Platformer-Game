const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576


const SCALA = 2
const scaledCanvas = {
  width: canvas.width / SCALA,
  height: canvas.height / SCALA
}

const GRAVITY = 0.064

const TILE_WIDTH = 128
const TILE_HEIGHT = 96
const TILE_SIZE = 32 / 4

let collision2D = []
for (let i = 0; i < collision.length; i += TILE_WIDTH) {
  collision2D.push(collision.slice(i, i + TILE_WIDTH))
}

const backgroundImageHeight = 768

const camera = {
  position: {
    x: 0,
    y: -backgroundImageHeight + scaledCanvas.height
  },
}

let collisionBlocks = []
let collisionPlatforms = []
collision2D.forEach((row, y) => {
  row.forEach((symbol, x) => {
    if (symbol === 202) {
      collisionBlocks.push(new CollisionBlock(
        {
          position: {
            x: x * TILE_SIZE,
            y: y * TILE_SIZE
          },
          size: {
            width: TILE_SIZE,
            height: TILE_SIZE
          }
        }
      ))
    } else if (symbol === 12289) {
      collisionPlatforms.push(new CollisionBlock(
        {
          position: {
            x: x * TILE_SIZE,
            y: y * TILE_SIZE
          },
          size: {
            width: TILE_SIZE,
            height: TILE_SIZE / 2
          }
        }
      ))
    }
  })
})

const player = new Player({
  position: {
    x: 100,
    y: 600
  },
  collisionBlocks,
  collisionPlatforms,
  imageSrc: './assets/warrior/Idle.png',
  frameRate: 8,
  animations: {
    Idle: {
      imageSrc: './assets/warrior/Idle.png',
      frameRate: 8,
      frameBuffer: 10
    },
    IdleLeft: {
      imageSrc: './assets/warrior/IdleLeft.png',
      frameRate: 8,
      frameBuffer: 10
    },
    Run: {
      imageSrc: './assets/warrior/Run.png',
      frameRate: 8,
      frameBuffer: 13
    },
    RunLeft: {
      imageSrc: './assets/warrior/RunLeft.png',
      frameRate: 8,
      frameBuffer: 13
    },
    Jump: {
      imageSrc: './assets/warrior/Jump.png',
      frameRate: 2,
      frameBuffer: 10
    },
    JumpLeft: {
      imageSrc: './assets/warrior/JumpLeft.png',
      frameRate: 2,
      frameBuffer: 10
    },
    Fall: {
      imageSrc: './assets/warrior/Fall.png',
      frameRate: 2,
      frameBuffer: 5
    },
    FallLeft: {
      imageSrc: './assets/warrior/FallLeft.png',
      frameRate: 2,
      frameBuffer: 5
    }
  }
})

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './assets/bg.png',

})

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  s: {
    pressed: false
  },
}

let collidables = [...collisionBlocks, ...collisionPlatforms]

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'white'
  c.fillRect(0, 0, canvas.width, canvas.height)

  c.save()

  c.scale(SCALA, SCALA)
  c.translate(camera.position.x, camera.position.y)
  background.update()

  // não precisamos renderizar esses valores, aqui serve para renderizar, outras funções acessarão os valores normalmente
  // collidables.forEach(collidable => {
  //   collidable.update()
  // })
  //

  player.checkForCanvasCollision({ canvas })
  player.update()


  player.velocity.x = 0
  if (keys.a.pressed) {
    player.velocity.x = -1
    player.switchSprite('RunLeft')
    player.lastPosition.push('left')
    player.shouldPanCameraToTheRight({ canvas, camera })
  }
  else if (keys.d.pressed) {
    player.velocity.x = 1
    player.switchSprite('Run')
    player.lastPosition.push('right')
    player.shouldPanCameraToTheLeft({ canvas, camera })
  }
  else if (keys.w.pressed) {
    player.lastPosition.push('top')
  } else if (player.velocity.y == 0 && player.velocity.x == 0) {
    if (player.lastPosition[player.lastPosition.length - 1] == 'right') player.switchSprite('Idle')
    else player.switchSprite('IdleLeft')
  }

  if (player.velocity.y < 0) {
    player.shouldPanCameraDown({ canvas, camera })

    if (player.lastPosition[player.lastPosition.length - 1] == 'right') player.switchSprite('Jump')
    else player.switchSprite('JumpLeft')
  } else if (player.velocity.y > 0) {
    player.shouldPanCameraUp({ canvas, camera, backgroundImageHeight })

    if (player.lastPosition[player.lastPosition.length - 1] === 'right') player.switchSprite('Fall')
    else player.switchSprite('FallLeft')
  }

  c.restore()
}

animate()

let jumpDone = 0

window.addEventListener('keydown', (e) => {
  const { key } = e
  switch (key) {
    case 'a':
      keys.a.pressed = true
      break
    case 'd':
      keys.d.pressed = true
      break
    case 'w':
      if (jumpDone <= 2) {
        player.velocity.y = -5
      } if (player.velocity.y == 0) {
        jumpDone = 0
      }
      jumpDone++
      break
  }
})

window.addEventListener('keyup', (e) => {
  const { key } = e
  switch (key) {
    case 'a':
      keys.a.pressed = false
      break
    case 'd':
      keys.d.pressed = false
      break
  }
})