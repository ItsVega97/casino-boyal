# Casino Boyal - Flujo de Juego y Arquitectura

## Cambios Implementados

### 1. Animación Realista de Ruleta (`RouletteCanvas.tsx`)

**Características:**
- Rueda de ruleta europea con 37 números (0-36) en orden real
- Animación determinista: siempre termina en el número ganador especificado
- Bola que gira por el borde exterior y desacelera gradualmente
- Duración de animación: ~3.5 segundos
- Usa easing cubic para desaceleración realista
- Pixel art rendering con `imageSmoothingEnabled=false`
- Responsive con escalado inteligente

**Orden Real de Ruleta Europea:**
```
[0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
```

**Fases de Animación:**
1. **Spinning** (0-70%): Rueda y bola giran a velocidad máxima
2. **Settling** (70-100%): Desaceleración con easing, bola se acerca al pocket ganador
3. **Landed**: Bola se detiene en el número ganador, callback `onSpinComplete()`

### 2. Sistema de Estados con Reducer (`gameReducer.ts`)

**Máquina de Estados:**
```typescript
type Phase = 'betting' | 'spinning' | 'resolving' | 'roundEnd' | 'gameOver';
```

**Flujo de Estado:**
```
betting → spinning → resolving → (betting | roundEnd | gameOver)
                                      ↓
                               betting (nueva ronda)
```

**Acciones del Reducer:**

1. **PLACE_BET**: Usuario selecciona tipo de apuesta y monto
2. **CLEAR_BET**: Cancela apuesta actual
3. **START_SPIN**:
   - Genera número ganador (RNG)
   - Cambia fase a "spinning"
   - Incrementa triggerSpinToken para iniciar animación
4. **SPIN_FINISHED**: Animación completada, cambia a "resolving"
5. **RESOLVE_SPIN**:
   - Calcula si ganó o perdió
   - Aplica payout/pérdida
   - Descuenta 1 tirada (spinsLeft--)
   - Evalúa condiciones de fin:
     - Si chips ≥ targetChips → roundEnd
     - Si chips ≤ 0 → gameOver
     - Si spinsLeft ≤ 0 → gameOver
     - Sino → betting (permite nueva apuesta)
6. **NEXT_ROUND**: Avanza a siguiente ronda, recalcula objetivos
7. **RESET_RUN**: Reinicia el juego completo

### 3. Sistema de Apuestas y Pagos

**Tipos de Apuesta Implementados:**

| Tipo | Multiplicador | Condición |
|------|--------------|-----------|
| red, black | 1x | Color del número |
| even, odd | 1x | Paridad |
| low (1-18), high (19-36) | 1x | Rango |
| dozen1/2/3 | 2x | Docenas (1-12, 13-24, 25-36) |
| column1/2/3 | 2x | Columnas (módulo 3) |
| number | 35x | Número exacto |

**Modelo de Pago:**
- Si **pierde**: `chips -= betAmount`
- Si **gana**: `chips += betAmount * multiplier`
- Ganancia neta (no se resta apuesta al inicio)

### 4. Progresión de Rondas

**Cálculo Dinámico:**
```typescript
targetChips = 150 + round * 40
spinsAllowed = max(3, 8 - floor(round / 3))
startingChips = 75 + round * 15
```

**Ejemplo:**
- Round 1: Target $190, 8 spins, $90 inicial
- Round 2: Target $230, 8 spins, $105 inicial
- Round 5: Target $350, 6 spins, $150 inicial
- Round 10: Target $550, 5 spins, $225 inicial

### 5. Sistema de Tickets y Recompensas

- **+1 ticket** por completar ronda
- **+1 ticket adicional** si excedes objetivo × 1.5
- Tickets se usan en la tienda (funcionalidad preservada)

## Estructura de Archivos

```
src/
├── components/
│   ├── GameScreen.tsx      # Nuevo: Pantalla principal del juego
│   ├── RouletteCanvas.tsx  # Nuevo: Animación de ruleta
│   ├── GameMenu.tsx        # Menú principal (actualizado)
│   └── ShopOverlay.tsx     # Tienda de items (preservado)
├── game/
│   ├── gameReducer.ts      # Nuevo: Lógica de estado
│   ├── gameEngine.ts       # Antiguo (sin usar actualmente)
│   ├── roulette.ts         # Antiguo (sin usar actualmente)
│   └── types.ts            # Tipos compartidos
└── App.tsx                 # Integración principal
```

## Controles del Juego

### Fase de Apuestas (betting)
1. Seleccionar tipo de apuesta (RED, BLACK, ODD, EVEN)
2. Ajustar monto con botones +/-
3. Confirmar apuesta (se resalta en panel)
4. Presionar "SPIN!" para iniciar

### Durante Giro (spinning/resolving)
- UI bloqueada, animación en progreso
- Rueda y bola visibles en movimiento
- Al terminar, se muestra resultado automáticamente

### Resultado
- Panel muestra número ganador
- Indica WIN o LOST con delta de chips
- Chips y spinsLeft se actualizan
- Fase vuelve a "betting" para siguiente apuesta

### Fin de Ronda (roundEnd)
- Botón "NEXT ROUND" disponible
- Incrementa ronda, recalcula objetivos
- Reinicia spinsLeft

### Game Over (gameOver)
- Opciones: "RESTART" (nueva partida) o "BACK TO MENU"
- High score se guarda en localStorage

## Validación del Flujo

✅ **Apuestas múltiples**: Usuario puede apostar varias veces en la misma ronda
✅ **Descuento de tiradas**: spinsLeft disminuye correctamente (1 por spin)
✅ **Pagos correctos**: chips suben/bajan según resultado y multiplicador
✅ **Condiciones de fin**:
  - Alcanzar target → roundEnd
  - Sin spins → gameOver
  - Sin chips → gameOver
✅ **Animación determinista**: Siempre termina en el número ganador
✅ **Responsive**: Funciona en móvil y desktop
✅ **Pixel perfect**: Mantiene estética retro

## Mejoras Futuras Sugeridas

1. **Sistema de Items/Trampas**: Reintegrar con el nuevo reducer
2. **Más tipos de apuesta**: Split, Street, Corner (requiere UI de mesa)
3. **Sonidos sincronizados**: Audio durante animación de ruleta
4. **Estadísticas**: Tracking de números calientes/fríos
5. **Multiplayer**: Competencia por high scores
