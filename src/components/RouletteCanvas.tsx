import React, { useEffect, useRef, useState } from 'react';

const EURO_WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14,
  31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

const ANGLE_ZERO_AT = -Math.PI / 2;
const BALL_DROP_ANGLE = -Math.PI / 2;
const POCKET_SIZE = (Math.PI * 2) / 37;

interface RouletteCanvasProps {
  widthBase?: number;
  heightBase?: number;
  winningNumber: number | null;
  phase: 'idle' | 'spinning' | 'settling' | 'landed';
  onSpinComplete: (winningNumber: number) => void;
  triggerSpinToken: number;
}

export const RouletteCanvas: React.FC<RouletteCanvasProps> = ({
  widthBase = 320,
  heightBase = 320,
  winningNumber,
  onSpinComplete,
  triggerSpinToken,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const [isAnimating, setIsAnimating] = useState(false);

  const wheelAngleRef = useRef(0);
  const ballAngleRef = useRef(BALL_DROP_ANGLE);
  const wheelVelRef = useRef(0);
  const ballVelRef = useRef(0);
  const animationStartRef = useRef(0);
  const targetWheelAngleRef = useRef(0);
  const completedRef = useRef(false);
  const winningNumberRef = useRef<number | null>(null);

  const fitCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const scale = Math.max(1, Math.floor(Math.min(rect.width / widthBase, rect.height / heightBase)));

    canvas.style.width = `${widthBase * scale}px`;
    canvas.style.height = `${heightBase * scale}px`;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = widthBase * dpr;
    canvas.height = heightBase * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      fitCanvas();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawRoulette(ctx);
        }
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [widthBase, heightBase]);

  const drawRoulette = (ctx: CanvasRenderingContext2D) => {
    const centerX = widthBase / 2;
    const centerY = heightBase / 2;
    const wheelRadius = 120;

    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, widthBase, heightBase);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(wheelAngleRef.current);

    for (let i = 0; i < 37; i++) {
      const angle1 = ANGLE_ZERO_AT + i * POCKET_SIZE;
      const angle2 = ANGLE_ZERO_AT + (i + 1) * POCKET_SIZE;
      const number = EURO_WHEEL_ORDER[i];

      ctx.fillStyle =
        number === 0 ? '#00ff00' : RED_NUMBERS.includes(number) ? '#ff3333' : '#222222';

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, angle1, angle2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 1;
      ctx.stroke();

      const textAngle = angle1 + POCKET_SIZE / 2;
      const textRadius = wheelRadius * 0.7;
      const textX = Math.cos(textAngle) * textRadius;
      const textY = Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(number.toString(), 0, 0);
      ctx.restore();
    }

    ctx.restore();

    const ballRadius = wheelRadius + 15;
    const ballX = centerX + Math.cos(ballAngleRef.current) * ballRadius;
    const ballY = centerY + Math.sin(ballAngleRef.current) * ballRadius;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius + 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(centerX + Math.cos(BALL_DROP_ANGLE) * (wheelRadius + 25), centerY + Math.sin(BALL_DROP_ANGLE) * (wheelRadius + 25), 3, 0, Math.PI * 2);
    ctx.fill();
  };

  useEffect(() => {
    if (triggerSpinToken > 0 && winningNumber !== null && !isAnimating) {
      startSpin(winningNumber);
    }
  }, [triggerSpinToken, winningNumber]);

  const normalizeAngle = (angle: number): number => {
    while (angle > Math.PI) angle -= Math.PI * 2;
    while (angle < -Math.PI) angle += Math.PI * 2;
    return angle;
  };

  const startSpin = (targetNumber: number) => {
    setIsAnimating(true);
    completedRef.current = false;
    winningNumberRef.current = targetNumber;

    const targetIndex = EURO_WHEEL_ORDER.indexOf(targetNumber);
    const pocketCenterAngle = ANGLE_ZERO_AT + targetIndex * POCKET_SIZE + POCKET_SIZE / 2;

    const finalWheelAngle = BALL_DROP_ANGLE - pocketCenterAngle;

    const extraRotations = 5 + Math.floor(Math.random() * 3);
    targetWheelAngleRef.current = finalWheelAngle + extraRotations * Math.PI * 2;

    wheelVelRef.current = 0.4 + Math.random() * 0.2;
    ballVelRef.current = -0.3 - Math.random() * 0.15;
    ballAngleRef.current = BALL_DROP_ANGLE + Math.random() * Math.PI * 2;

    animationStartRef.current = Date.now();
    animate();
  };

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const elapsed = Date.now() - animationStartRef.current;
    const duration = 3500;
    const progress = Math.min(elapsed / duration, 1);

    if (progress < 0.6) {
      wheelAngleRef.current += wheelVelRef.current * 0.06;
      ballAngleRef.current += ballVelRef.current * 0.06;
    } else if (progress < 1) {
      const settleProgress = (progress - 0.6) / 0.4;
      const eased = easeOutCubic(settleProgress);

      const startWheelAngle = wheelAngleRef.current;
      const targetWheel = targetWheelAngleRef.current;

      wheelAngleRef.current = startWheelAngle * (1 - eased) + targetWheel * eased;

      wheelVelRef.current *= 0.92;
      ballVelRef.current *= 0.90;

      const ballProgress = Math.min(settleProgress * 1.5, 1);
      ballAngleRef.current =
        ballAngleRef.current * (1 - ballProgress) + BALL_DROP_ANGLE * ballProgress;
    } else {
      wheelAngleRef.current = targetWheelAngleRef.current;
      ballAngleRef.current = BALL_DROP_ANGLE;
    }

    drawRoulette(ctx);

    if (progress >= 1) {
      if (!completedRef.current && winningNumberRef.current !== null) {
        completedRef.current = true;
        setIsAnimating(false);
        setTimeout(() => onSpinComplete(winningNumberRef.current!), 300);
      }
    } else {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
