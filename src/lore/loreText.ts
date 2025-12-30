export const INTRO_LETTER = `Bill.

No es una amenaza. Es una cuenta pendiente.
Debes dinero a la mafia albanesa. Mucho.

Esta noche no vamos a perseguirte.
Te damos una dirección.

CASINO BOYAL.

Un casino ilegal asiático. Un sitio que no existe en mapas.
Allí no juegas para ganar.
Juegas para pagar.

Ronda a ronda.
Tirada a tirada.

Si alcanzas el objetivo de la ronda, respiras.
Si fallas… la deuda se cobra de otra forma.

La casa hace trampas.
Tú también puedes.

Compra favores, soborna crupieres, marca fichas.
Dobla las probabilidades antes de que te doblen a ti.

Nos vemos al final del pasillo.

— A.`;

export type FlavorCategory = 'roundStart' | 'roundWin' | 'shop' | 'buyUpgrade' | 'gameOver' | 'spin';

export const FLAVOR_LINES: Record<FlavorCategory, string[]> = {
  roundStart: [
    'Nueva ronda. Nueva deuda.',
    'El neón parpadea. Tú también.',
    'Respira hondo, Bill. No hay marcha atrás.',
    'La ruleta ya está girando en tu cabeza.',
    'La casa sonríe primero.',
    'Hoy pagas… o desapareces.',
  ],
  roundWin: [
    'Respiras… por ahora.',
    'La deuda se encoge. Tú no.',
    'Un paso más lejos del final. O más cerca.',
    'El crupier no aplaude. Pero te deja pasar.',
    'Sigues vivo. No te acostumbres.',
    'Pagaste. La noche continúa.',
  ],
  shop: [
    'El casino no es justo. Tú tampoco deberías serlo.',
    'Favores, trucos y sonrisas falsas.',
    'Aquí se compra suerte. Y se vende conciencia.',
    'Todo tiene precio. Tú también.',
    'La casa no se rompe sola.',
    'El mercado negro siempre tiene algo para ti.',
  ],
  buyUpgrade: [
    'Una regla menos. Un favor más.',
    'El crupier mira a otro lado.',
    'Trampa nueva. Problema viejo.',
    'La suerte se alquila. La deuda no.',
    'Buen truco, Bill.',
    'Que no te pillen usándolo.',
  ],
  gameOver: [
    'La deuda no se paga sola.',
    'El casino cierra… para ti.',
    'La casa cobra. Siempre cobra.',
    'Bill dejó de deber. Dejó de ser.',
    'El 0 se ríe el último.',
    'No hubo segunda oportunidad.',
  ],
  spin: [
    'Escucha el clack. Es tu pulso.',
    'Una vuelta más.',
    'No mires el 0.',
    'La bola decide… por ahora.',
    'La casa contiene la risa.',
    'Hazlo rápido. Hazlo bien.',
  ],
};
