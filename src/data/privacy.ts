// Aviso de privacidad (LFPDPPP). [[PENDIENTE]] Validación del texto por el cliente (RF-13).
export const privacy = {
  title: 'Aviso de privacidad',
  // [[PENDIENTE]] Fecha de publicación y nombre del responsable.
  updated: 'Última actualización: octubre de 2026 (borrador)',
  demo: 'Borrador. Falta: nombre completo del responsable, fecha de publicación y validación del texto por el cliente.',
  sections: [
    {
      heading: 'Responsable',
      body: [
        'El responsable (nombre por confirmar), que opera la escuela de calistenia Control Gravedad en Morelia, Michoacán, es responsable del tratamiento de tus datos personales.',
        'Correo de contacto: controlgravedad@gmail.com.',
      ],
    },
    {
      heading: 'Datos que recabamos',
      body: [
        'A través del formulario de contacto recabamos tu nombre, tu número de WhatsApp o teléfono, tu objetivo de entrenamiento y, si lo escribes, tu mensaje. No recabamos datos sensibles.',
      ],
    },
    {
      heading: 'Para qué usamos tus datos',
      body: [
        'Únicamente para contactarte, responder tus dudas y darte información sobre las clases, la clase muestra y los demás servicios de Control Gravedad.',
      ],
    },
    {
      heading: 'Con quién los compartimos',
      body: [
        'Los mensajes del formulario se envían por medio de Web3Forms, un servicio que los entrega al correo de Control Gravedad. No vendemos ni compartimos tus datos con terceros para otros fines.',
      ],
    },
    {
      heading: 'Tus derechos ARCO',
      body: [
        'Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO), así como revocar tu consentimiento, escribiendo a controlgravedad@gmail.com con tu nombre y tu solicitud. Te responderemos en un plazo máximo de 20 días hábiles.',
      ],
    },
    {
      heading: 'Cookies y analítica',
      body: [
        'Este sitio usa Google Analytics 4 para medir de forma estadística cómo se usa la página (por ejemplo, cuántas personas hacen clic en WhatsApp). Esta herramienta usa cookies. Nunca le enviamos tu nombre, tu teléfono ni el contenido del formulario. Puedes bloquear las cookies desde la configuración de tu navegador.',
      ],
    },
    {
      heading: 'Cambios a este aviso',
      body: [
        'Cualquier cambio a este aviso se publicará en esta misma página.',
      ],
    },
  ],
} as const;
