import Phaser from 'phaser';

export class Terrain {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private segmentWidth = 50;
  private segments: { x: number, y: number }[] = [];
  private bodies: MatterJS.BodyType[] = [];
  
  private lastX = -2000;
  private lastY = 400; // Starting height

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(10); // Above background, below UI
    
    // Create initial flat terrain for spawning (from -2000 to +1000)
    for (let i = 0; i < 60; i++) {
      this.addSegment(this.lastX, 400);
      this.lastX += this.segmentWidth;
    }

    // Create an invisible back wall to prevent going backwards off the map forever
    this.scene.matter.add.rectangle(-1000, 200, 100, 2000, {
      isStatic: true,
      friction: 0.8,
      restitution: 0.1,
      render: { visible: false }
    });
  }

  public update(playerX: number) {
    // Generate new terrain far ahead (e.g., 3000 pixels) to prevent seeing the edge or falling off
    while (this.lastX < playerX + 3000) {
      this.generateNextSegment();
    }

    // Remove old terrain behind (keep plenty of segments behind so camera doesn't see cut-off)
    const cleanupThreshold = playerX - 2500;
    
    while (this.segments.length > 2 && this.segments[1].x < cleanupThreshold) {
      this.segments.shift(); // Remove point
      
      if (this.bodies.length > 0) {
        const bodyToRemove = this.bodies.shift();
        if (bodyToRemove) {
          this.scene.matter.world.remove(bodyToRemove);
        }
      }
    }

    this.draw();
  }

  private generateNextSegment() {
    // Smooth procedural generation using overlapping sine waves
    const noise = (Math.sin(this.lastX * 0.002) * 150) + 
                  (Math.sin(this.lastX * 0.005) * 80) + 
                  (Math.sin(this.lastX * 0.01) * 30);
    
    // Smooth transition
    const targetY = 400 + noise;
    const newY = Phaser.Math.Linear(this.lastY, targetY, 0.4);

    this.addSegment(this.lastX, newY);
    this.lastX += this.segmentWidth;
    this.lastY = newY;
  }

  private addSegment(x: number, y: number) {
    const point = { x, y };
    this.segments.push(point);

    if (this.segments.length > 1) {
      const p1 = this.segments[this.segments.length - 2];
      const p2 = point;
      
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      const length = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
      const angle = Phaser.Math.Angle.Between(p1.x, p1.y, p2.x, p2.y);

      // Create a rectangle body for the segment
      // Keep thickness small (50) so rotating the rectangle doesn't push the corners way above the visual line!
      const thickness = 50;
      const body = this.scene.matter.add.rectangle(cx, cy + thickness / 2, length + 2, thickness, {
        isStatic: true,
        angle: angle,
        friction: 0.8, // Basic friction
        restitution: 0.1
      });
      
      this.bodies.push(body);
    }
  }

  private draw() {
    this.graphics.clear();
    
    if (this.segments.length < 2) return;

    this.graphics.fillStyle(0x228B22, 1); // Forest Green
    this.graphics.lineStyle(4, 0x006400, 1); // Dark Green edge

    this.graphics.beginPath();
    
    // Start from bottom left
    this.graphics.moveTo(this.segments[0].x, 3000); // arbitrarily deep
    
    // Draw surface
    for (const segment of this.segments) {
      this.graphics.lineTo(segment.x, segment.y);
    }
    
    // Down to bottom right
    this.graphics.lineTo(this.segments[this.segments.length - 1].x, 3000);
    this.graphics.closePath();
    
    this.graphics.fillPath();
    this.graphics.strokePath();
  }

  public getSurfaceYAtX(x: number): number {
    for (let i = 0; i < this.segments.length - 1; i++) {
      const p1 = this.segments[i];
      const p2 = this.segments[i + 1];
      if (x >= p1.x && x <= p2.x) {
        // Interpolate
        const t = (x - p1.x) / (p2.x - p1.x);
        return p1.y + t * (p2.y - p1.y);
      }
    }
    return 400; // Default
  }
}
