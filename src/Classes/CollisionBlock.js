class CollisionBlock {
  constructor({ position, size }) {
    this.position = position
    this.height = size.height
    this.width = size.width
  }

  draw() {
    c.fillStyle = 'rgba(255,0,0,0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }

  update() {
    this.draw()
  }
}