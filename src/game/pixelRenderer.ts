export class PixelRenderer {
  public ctx: CanvasRenderingContext2D;
  private scale: number;

  constructor(canvas: HTMLCanvasElement, scale = 4) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    this.ctx = ctx;
    this.scale = scale;
    this.ctx.imageSmoothingEnabled = false;
    this.setupFont();
  }

  private setupFont(): void {
    this.ctx.font = '8px monospace';
    this.ctx.textBaseline = 'top';
    this.ctx.textAlign = 'left';
  }

  clear(color = '#0a0a1a'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawRoulette(centerX: number, centerY: number, radius: number, winningNumber?: number): void {
    const segments = 37;
    const segmentAngle = (Math.PI * 2) / segments;

    for (let i = 0; i < segments; i++) {
      const angle1 = (i * segmentAngle) - Math.PI / 2;
      const angle2 = ((i + 1) * segmentAngle) - Math.PI / 2;

      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(
        i,
      );

      this.ctx.fillStyle = i === 0 ? '#00ff00' : isRed ? '#ff3333' : '#222222';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, angle1, angle2);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.strokeStyle = '#111111';
      this.ctx.lineWidth = 1;
      this.ctx.stroke();

      this.drawNumberOnWheel(centerX, centerY, radius, i, (angle1 + angle2) / 2);
    }

    if (winningNumber !== undefined) {
      const angle = (winningNumber * segmentAngle) - Math.PI / 2 + segmentAngle / 2;
      const markerX = centerX + Math.cos(angle) * (radius + 10);
      const markerY = centerY + Math.sin(angle) * (radius + 10);

      this.ctx.fillStyle = '#ffff00';
      this.drawPixelSquare(markerX, markerY, 3);
    }
  }

  private drawNumberOnWheel(cx: number, cy: number, radius: number, number: number, angle: number): void {
    const textRadius = radius * 0.7;
    const x = cx + Math.cos(angle) * textRadius;
    const y = cy + Math.sin(angle) * textRadius;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 6px monospace';
    const text = number.toString();
    const metrics = this.ctx.measureText(text);
    this.ctx.fillText(text, x - metrics.width / 2, y - 3);
  }

  drawBettingTable(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    const cellWidth = width / 3;
    const cellHeight = height / 4;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        this.ctx.strokeRect(x + i * cellWidth, y + j * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  drawPixelSquare(x: number, y: number, size: number, color = '#ffffff'): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color = '#ffffff',
    fontSize = 8,
    align: CanvasTextAlign = 'left',
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `${fontSize}px monospace`;
    this.ctx.textAlign = align;
    this.ctx.fillText(text, x, y);
  }

  drawChip(x: number, y: number, value: number, color = '#ffcc00'): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#8b8b00';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();

    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 4px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(value.toString(), x, y);
  }

  drawButton(
    x: number,
    y: number,
    width: number,
    height: number,
    text: string,
    isHovered = false,
  ): void {
    this.ctx.fillStyle = isHovered ? '#ff6b6b' : '#444444';
    this.ctx.fillRect(x, y, width, height);

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 6px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, x + width / 2, y + height / 2);
  }

  drawBar(x: number, y: number, width: number, height: number, fillPercent: number, color = '#00ff00'): void {
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, (width - 2) * Math.max(0, Math.min(1, fillPercent)), height - 2);
  }

  drawFrame(x: number, y: number, width: number, height: number, color = '#666666'): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  getScale(): number {
    return this.scale;
  }
}
