import type { Copy } from "./types";

const es: Copy = {
  appName: "Tu comida, mi comida",
  quote: ["“", "”"],
  store: { download: "Descargar" },

  landing: {
    meta: {
      title: "Tu comida, mi comida",
      description:
        "Una app para llenar tu bandeja con una foto por comida (desayuno, almuerzo y cena) y estar pendientes unos de otros con tu familia o amigos. Página de presentación y soporte de “Tu comida, mi comida”, la app para iOS y Android.",
      ogTitle: "Tu comida, mi comida — En vez de preguntar si ya comiste",
      ogDescription:
        "Una app para llenar tu bandeja con una foto por comida (desayuno, almuerzo y cena) y estar pendientes unos de otros con tu familia o amigos.",
      ogAlt: "Imagen de “Tu comida, mi comida”: una bandeja blanca sobre fondo amarillo yema, con solo el espacio del almuerzo lleno en color tomate",
    },
    trayTitle: "Bandeja de “Tu comida, mi comida”",
    greetings: [
      "¿Qué comiste hoy?",
      "¿Estás comiendo bien?",
      "¿Qué tal el almuerzo?",
      "Hoy cenamos juntos, aunque sea de lejos",
    ],
    tagline: "Con una foto de tu comida, comparte la bandeja de hoy con familia y amigos.",
    together: {
      title: "Una mesa compartida",
      lead: "Las bandejas de 2 a 12 personas, reunidas con un código de invitación, se sirven en una sola mesa. Sin preguntar, se ve quién todavía no ha comido.",
    },
    featuresTitle: "Esto es lo que hace",
    features: [
      { title: "Un espacio por comida", tail: "Toma una foto o elige una del álbum" },
      { title: "Tú eliges el encuadre", tail: "Mueve y amplía para no cortar la comida" },
      { title: "Un toque al espacio vacío", tail: "Si aún no ha comido, dale un toque" },
      { title: "Una sola bandeja", tail: "Súbela una vez y aparece en todos tus grupos" },
      { title: "Reacciones · comentarios", tail: "Un “¡Qué rico!” basta" },
      { title: "Tu día en una imagen", tail: "Guarda la bandeja del día en tu galería" },
    ],
    statement: { before: "En vez de “¿Ya comiste?”, ", em: "el espacio vacío", after: " habla primero." },
    story: [
      "Para quien vive solo, la comida es lo primero que se resuelve a la ligera. La única forma de saberlo es llamar y preguntar, y casi siempre la respuesta es “ya comí”.",
      "Por eso, en lugar de preguntar, lo hicimos visible. No es una app que automatiza los regaños, sino una que te ahorra el esfuerzo de preguntar cómo está alguien. Por eso no reprocha los espacios vacíos. Las comidas son tres, y el snack es un extra.",
    ],
    faqTitle: "Preguntas frecuentes",
    faq: [
      {
        q: "¿Quién puede ver mis fotos?",
        a: "Solo las personas que están en tus mismos grupos. Esta restricción no está en las pantallas de la app, sino en la propia base de datos, así que aunque alguien modifique la app no puede obtener las comidas de otros. El almacenamiento de fotos es privado y los enlaces solo valen por poco tiempo.",
      },
      {
        q: "¿Puedo estar en un grupo de familia y en uno de amigos a la vez?",
        a: "Sí. Cada persona tiene una sola bandeja, así que si subes tu desayuno una vez, se ve en todos los grupos a los que perteneces. No hace falta subirlo en cada grupo.",
      },
      {
        q: "¿Cuántos toques puedo enviar?",
        a: "Para que no se convierta en una lluvia de notificaciones, el servidor cuenta cuántos envías al día. Cuando se te acaben, puedes ver un anuncio corto para conseguir algunos más, y eso también tiene un límite diario. El espacio del snack es un extra, así que no recibe toques.",
      },
      {
        q: "¿Tiene anuncios?",
        a: "Hay un anuncio de una sola línea, diseñado para encajar con la app, en la parte superior de las pantallas Cámara, Grupos y Perfil; anuncios de pantalla completa que aparecen de vez en cuando al salir de una foto o al terminar de subir una, y anuncios con recompensa que solo ves si quieres conseguir más toques. También recopilamos estadísticas de uso para mejorar la app. Encontrarás los detalles en la política de privacidad.",
      },
      {
        q: "¿Qué pasa si elimino mi cuenta?",
        a: "Puedes eliminarla directamente desde la app. Todas las fotos y registros que subiste desaparecen y no se pueden recuperar. Los grupos que creaste pasan a la persona que lleve más tiempo entre quienes quedan, y si no queda nadie, el grupo también desaparece.",
      },
    ],
    closing: {
      title: "Hoy cenamos juntos, aunque sea de lejos",
      body: "Si tienes sugerencias o preguntas, escríbenos por correo cuando quieras.",
      privacy: "Política de privacidad",
      deleteAccount: "Cómo eliminar tu cuenta",
    },
  },

  join: {
    meta: {
      title: "¿Ya comiste? · Tu comida, mi comida",
      description:
        "Te invitaron a la mesa. Registra en tu bandeja lo que comiste hoy. Copia el código de invitación, ingrésalo en la app y entrarás al grupo.",
      ogTitle: "¿Ya comiste?",
      ogDescription: "Te invitaron a la mesa · Registra en tu bandeja lo que comiste hoy",
      ogAlt: "Imagen de invitación: sobre un fondo amarillo yema claro, una bandeja blanca con sus cuatro espacios vacíos, con una cuchara color tomate y un tenedor color menta a los lados",
    },
    trayTitle: "Una bandeja vacía, todavía sin nada",
    title: "¿Ya comiste?",
    sub: "¡Registra en tu bandeja lo que comiste hoy!",
    pill: "Te invitaron a la mesa · Llenémosla",
    step1: "Copia el código de invitación",
    copyAria: "Copiar el código de invitación {code}",
    noCodeAria: "Sin código de invitación",
    copied: "¡Copiado!",
    missing: [
      "El enlace no tiene código de invitación o está cortado.",
      "Pídele el código otra vez a quien te invitó.",
    ],
    step2: "Instala la app e ingrésalo",
    hint: { before: "Pestaña ", tab: "Grupos", after: " abajo", add: "Agregar grupo", join: "Unirse con código" },
    openInApp: "¿Tienes la app? · Abrir en la app",
    limit: "Máximo 12 personas por grupo. Si está lleno, no podrás unirte.",
    about: "Acerca de Tu comida, mi comida",
    privacy: "Privacidad",
  },

  shell: {
    homeAria: "Ir al inicio de Tu comida, mi comida",
    about: "Acerca de",
    privacy: "Política de privacidad",
    terms: "Términos de servicio",
    deleteAccount: "Eliminar cuenta",
    language: "Idioma",
  },

  legal: {
    badge: "Tu comida, mi comida · Legal",
    updated: "Última actualización",
    koreanPrevails: "Esta es una traducción; en caso de discrepancia, prevalece la versión en coreano.",
    koreanLink: "Ver la versión en coreano",
  },

  privacy: {
    title: "Política de privacidad de Tu comida, mi comida",
    description:
      "Información sobre los datos que trata “Tu comida, mi comida”, la app para iOS y Android, quién puede ver tus fotos y registros de comidas, y cómo eliminar tu cuenta.",
    updatedAt: "6 de noviembre de 2026",
    sections: [
      {
        h: "1. Resumen",
        blocks: [
          {
            p: "“Tu comida, mi comida” (네밥내밥; en adelante, “la App”) es una aplicación para iOS y Android que permite registrar con fotos las comidas del día y compartirlas con las personas de tu mismo grupo. Esta política explica qué información trata la App, con qué fines y qué opciones tienes como usuario.",
          },
          { p: "En resumen:" },
          {
            ul: [
              "Tus fotos y registros de comidas solo los ven **las personas que están en tus mismos grupos**.",
              "La App muestra **anuncios nativos, anuncios intersticiales y anuncios con recompensa de Google AdMob**. Los anuncios nativos se ven como una sola línea, diseñada para encajar con las pantallas de la App, en la parte superior de las pantallas Cámara, Grupos y Perfil; los intersticiales aparecen de vez en cuando a pantalla completa al salir de una foto o al terminar de subir una; y los anuncios con recompensa los eliges ver tú mismo cuando se te acaban los toques. Para las estadísticas de uso utilizamos Google Analytics for Firebase. Tu nombre, correo, fotos y registros de comidas no se comparten con estos servicios.",
              "En iOS, después de iniciar sesión **te preguntamos primero si permites** el rastreo publicitario; aunque lo rechaces, puedes usar todas las funciones de la App.",
              "Puedes eliminar tu cuenta **directamente desde la App**, y al hacerlo se borran también tus fotos y registros.",
              "En el **Comedor compartido** (un espacio en tiempo real donde la gente se sienta a comer junta, sin hablar), tu nombre, tu personaje y tus movimientos son visibles para las personas de la misma sala. En el comedor para comer solo, donde puede entrar cualquiera, tus fotos solo se ven **si activas “Mostrar mi comida”**.",
            ],
          },
          { p: "Para cualquier consulta, escríbenos a [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Información que recopilamos",
        blocks: [
          {
            ul: [
              "**Dirección de correo electrónico**: la recibimos a través del inicio de sesión con Apple o Google. Solo se usa para identificar quién ha iniciado sesión.",
              "**Nombre visible**: el nombre que ven las personas de tus grupos. Lo eliges tú y puedes cambiarlo cuando quieras.",
              "**Fotos de comidas**: fotos que tomas o eliges del álbum. Son el propósito mismo de la App.",
              "**Fecha y franja de cada comida**: necesarias para saber a qué comida de qué día corresponde cada foto.",
              "**Token de notificaciones push del dispositivo**: se guarda para saber a dónde enviar las notificaciones.",
              "**Comentarios**: textos que dejas en las comidas de personas de tu mismo grupo. Solo los ven las personas de ese grupo.",
              "**Foto de perfil**: una foto que subes tú. Solo la ven las personas de tus mismos grupos.",
              "**Registros de denuncias y bloqueos**: quién denunció qué y por qué, y a quién bloqueó. Solo se usan para gestionar contenido inapropiado.",
              "**Identificador de cuenta**: una cadena aleatoria que se crea automáticamente al registrarte. Solo sirve para vincular las fotos y registros con su dueño y, a diferencia del nombre o el correo, no se muestra en pantalla.",
              "**Apodos**: nombres que pones a personas de tus grupos. Solo los ves tú, y la persona a la que se lo pusiste no puede saberlo.",
              "**Clave del widget y token de notificaciones push del widget**: se guardan en cada dispositivo cuando usas el widget de la pantalla de inicio, para que el widget pueda obtener las bandejas de hoy de las personas que elegiste y volver a dibujarse cuando se sube una comida nueva. Se borran al cerrar sesión o eliminar la cuenta.",
              "**Información de uso del Comedor compartido**: el comedor al que entraste, el asiento que ocupaste, por dónde caminaste, los saludos que tocaste (como “¡Buen provecho!”), y las comidas de la bandeja que llevas y las fotos que elegiste. Solo se usa para mostrarla a las personas de la misma sala mientras estás en ella, y se borra al salir de la sala. Si entras como invitado desde un navegador fuera de la App, se guarda un identificador de invitado aleatorio en ese dispositivo.",
            ],
          },
          { p: "Para los anuncios y las estadísticas de uso se trata la siguiente información." },
          {
            ul: [
              "**Información de uso de la App**: pantallas vistas y funciones utilizadas, ID de instancia de la app, tipo de dispositivo y sistema operativo, y región aproximada. Se usa para saber qué funciones se utilizan y mejorar la App, y la trata Google Analytics for Firebase.",
              "**Identificador publicitario e información de anuncios**: el IDFA en iOS o el ID de publicidad en Android, e información de impresiones y clics de anuncios. Se usa para mostrar anuncios y medir su rendimiento, y la trata Google AdMob. En iOS, si rechazas “Permitir que la app rastree”, no se usa el IDFA y se muestran anuncios no personalizados.",
            ],
          },
          {
            p: "La App no accede a tu ubicación precisa, contactos, registro de llamadas, información de salud ni información de pago.",
          },
        ],
      },
      {
        h: "3. Quién puede verla",
        blocks: [
          {
            p: "Tus fotos y registros de comidas solo los ven las personas que pertenecen a tus mismos grupos. Esta restricción no está en las pantallas de la App, sino **en la propia base de datos** (Row Level Security), por lo que aunque alguien modifique la App o imite directamente las comunicaciones, no puede obtener las comidas de otros.",
          },
          { p: "El almacenamiento de fotos es privado, y los enlaces para ver las fotos solo son válidos por poco tiempo." },
          {
            p: "Los tokens de notificaciones push se guardan en una tabla aparte que solo puede leer su titular. Ni siquiera las personas de tu mismo grupo pueden verlos, porque quien conoce el token puede enviar notificaciones arbitrarias a ese dispositivo.",
          },
          {
            p: "Los comentarios y las reacciones **solo se ven dentro del grupo donde se dejaron**. Aunque sea la misma foto, las personas de otros grupos no los ven. El contenido que denuncias o bloqueas deja de mostrarse para ti desde ese momento.",
          },
          {
            p: "El widget de la pantalla de inicio sigue las mismas reglas que las pantallas de la App. Como los widgets también pueden aparecer en la pantalla de bloqueo, se restringe un paso más para que tampoco se vean las fotos de quienes te han bloqueado.",
          },
          {
            p: "En el **Comedor compartido**, las personas de la misma sala ven en tiempo real tu nombre visible (“Invitado” para quienes entran desde fuera de la App), el color de tu personaje, tu asiento y tus movimientos, y tus saludos. No hay chat.",
          },
          {
            ul: [
              "En la **mesa del grupo** solo pueden entrar las personas de ese grupo. El servidor comprueba el inicio de sesión y la pertenencia al grupo. Las personas del grupo ven las fotos de la comida de hoy que cada uno eligió.",
              "En el **comedor para comer solo** puede entrar cualquiera, así que las fotos **no se muestran por defecto** y en su lugar se ven dibujos de arroz, sopa y guarniciones. Solo si activas “Mostrar mi comida a la gente del comedor”, las fotos que elegiste para tu bandeja se envían a las personas de esa sala mediante una dirección válida solo por una hora. Puedes desactivarlo cuando quieras.",
              "Puedes usar “Ocultar” para dejar de ver a otras personas.",
            ],
          },
        ],
      },
      {
        h: "4. Servicios de terceros",
        blocks: [
          {
            p: "La App no vende información personal. Tu nombre, correo, fotos y registros de comidas no se ceden a terceros con fines publicitarios ni de análisis. Los servicios que usa la App son los siguientes.",
          },
          {
            ul: [
              "**Supabase**: inicio de sesión y almacenamiento de datos. Los servidores están en Corea del Sur (Seúl).",
              "**Cloudflare R2**: almacenamiento de fotos de comidas y de perfil. Se guardan de forma privada en la región de Asia-Pacífico y, tras comprobar que tienes permiso para verlas, se entregan mediante una dirección válida solo por una hora.",
              "**Expo**: envío de notificaciones. En iOS pasan por Apple APNs y en Android por Google FCM. Se transmiten el texto de la notificación y el token del dispositivo.",
              "**Apple / Google**: inicio de sesión. Recibimos tu dirección de correo electrónico.",
              "**Google AdMob**: anuncios nativos, intersticiales y con recompensa. Se transmiten el identificador publicitario, información de impresiones y clics de anuncios, e información del dispositivo.",
              "**Google Analytics for Firebase**: estadísticas de uso. Se transmiten la información de uso de la App, el ID de instancia de la app e información del dispositivo.",
              "**Cloudflare Workers y Durable Objects**: pantalla del Comedor compartido y conexión en tiempo real. Tratan tu nombre visible, asiento, movimientos y saludos mientras estás en una sala, y las direcciones de las fotos que decidiste mostrar, y los borran al salir de la sala. Para corregir errores, se conserva parte de los registros de solicitudes durante unos días.",
              "**Apple APNs (widget)**: avisa al widget de iOS mediante el token de notificaciones push del widget para que se vuelva a dibujar cuando se sube una comida nueva.",
            ],
          },
          {
            p: "Puedes consultar cómo trata Google esta información en [Cómo utiliza Google la información de sitios web y aplicaciones que usan sus servicios](google).",
          },
        ],
      },
      {
        h: "5. Plazo de conservación",
        blocks: [
          {
            p: "Conservamos la información mientras tu cuenta exista y la borramos cuando eliminas la cuenta. No guardamos copias aparte. Las estadísticas de uso no están vinculadas a tu cuenta y se borran a los 2 meses, según la configuración predeterminada de Google Analytics.",
          },
          {
            p: "En el Comedor compartido, el asiento, los movimientos, los saludos y las direcciones de las fotos se borran al salir de la sala, y solo se guarda cuántas personas hay en cada comedor en ese momento.",
          },
        ],
      },
      {
        h: "6. Eliminación de la cuenta",
        blocks: [
          { p: "Puedes eliminarla directamente desde la App: **Perfil > Eliminar cuenta**." },
          {
            p: "Al eliminarla se borran por completo tu perfil y nombre visible, tu foto de perfil, los archivos de fotos que subiste, tus registros de comidas, comentarios, reacciones, registros de denuncias y bloqueos, tu pertenencia a grupos, tu token de notificaciones push, los apodos (los que pusiste y los que te pusieron), y la clave y el token de notificaciones push del widget, y no se puede deshacer.",
          },
          {
            p: "Los grupos que creaste pasan a la persona que lleve más tiempo entre quienes quedan. Si no queda nadie, el grupo también desaparece. Que una persona se vaya no hace desaparecer el grupo de los demás.",
          },
        ],
      },
      {
        h: "7. Derechos del usuario",
        blocks: [
          {
            ul: [
              "Puedes cambiar tu nombre visible en la App cuando quieras.",
              "Puedes eliminar de inmediato tu cuenta y todos tus registros con el método del punto 6. Si ya borraste la App, consulta [Cómo eliminar tu cuenta](deleteAccount).",
              "Puedes desbloquear a alguien cuando quieras en la pestaña Perfil > Personas bloqueadas.",
              "Puedes desactivar las notificaciones cuando quieras desde los ajustes del dispositivo.",
              "Puedes desactivar el rastreo publicitario o borrar el ID de publicidad cuando quieras: en iOS, en Ajustes > Privacidad y seguridad > Rastreo; en Android, en Configuración > Google > Anuncios.",
              "Para otras solicitudes de acceso, rectificación o eliminación, escríbenos a la dirección de correo indicada arriba.",
            ],
          },
        ],
      },
      {
        h: "8. Privacidad de los menores",
        blocks: [
          {
            p: "La App no está dirigida a menores de 14 años y no recopila intencionadamente información de usuarios de esa edad.",
          },
        ],
      },
      {
        h: "9. Cambios en esta política",
        blocks: [
          {
            p: "Esta política puede modificarse para reflejar cambios legales o del servicio. Si cambia la información que tratamos, actualizaremos esta política antes de publicar la versión que incluya esa función y modificaremos también la fecha de “Última actualización”.",
          },
        ],
      },
    ],
  },

  terms: {
    title: "Términos de servicio de Tu comida, mi comida",
    description:
      "Las condiciones de uso de Tu comida, mi comida, la app para compartir fotos de tus comidas con la gente de tus grupos, el alcance de las responsabilidades y los datos del responsable del servicio.",
    updatedAt: "6 de noviembre de 2026",
    sections: [
      {
        h: "Artículo 1 (Objeto)",
        blocks: [
          {
            p: "Estos términos tienen por objeto establecer las condiciones de uso de la app para iOS y Android Tu comida, mi comida (el “Servicio”), ofrecida por 바리바리스튜디오 (Baribari Studio; representante: 고주원 (Joowon Koh); el “Responsable”), así como los derechos, obligaciones y responsabilidades del Responsable y de los usuarios.",
          },
        ],
      },
      {
        h: "Artículo 2 (Contenido del Servicio)",
        blocks: [
          {
            ol: [
              "El Servicio permite a los usuarios registrar fotos de sus comidas y compartir fotos, reacciones y comentarios con las personas de su mismo grupo.",
              "El Servicio incluye funciones como crear grupos e invitar a otras personas, notificaciones y toques, el calendario de comidas y los collages, los widgets de la pantalla de inicio y el Comedor compartido (un espacio en tiempo real donde la gente se sienta a comer junta).",
              "El Servicio es gratuito y muestra anuncios en sus pantallas.",
            ],
          },
        ],
      },
      {
        h: "Artículo 3 (Vigencia y modificación de los términos)",
        blocks: [
          {
            ol: [
              "Estos términos entran en vigor al publicarse en esta página, y se considera que el usuario los acepta al iniciar sesión en el Servicio.",
              "El Responsable puede modificar los términos dentro de lo que permita la legislación aplicable. En ese caso, anunciará en esta página la fecha de aplicación y el motivo al menos 7 días antes de esa fecha, y al menos 30 días antes si el cambio es desfavorable para los usuarios.",
              "El usuario que no esté de acuerdo con los términos modificados puede dejar de usar el Servicio eliminando su cuenta.",
            ],
          },
        ],
      },
      {
        h: "Artículo 4 (Cuenta)",
        blocks: [
          {
            ol: [
              "El usuario inicia sesión en el Servicio con una cuenta de Apple o de Google.",
              "El usuario puede eliminar su cuenta desde la App en cualquier momento. Al hacerlo se borran también las fotos y los registros que subió, y no se puede deshacer. Los detalles están en [Cómo eliminar tu cuenta](deleteAccount).",
              "El tratamiento de los datos personales se rige por la [Política de privacidad](privacy).",
            ],
          },
        ],
      },
      {
        h: "Artículo 5 (Contenido de los usuarios)",
        blocks: [
          {
            ol: [
              "Los derechos sobre el contenido que sube el usuario, como fotos, comentarios y nombres, pertenecen al usuario.",
              "El Responsable usa ese contenido solo en la medida necesaria para prestar el Servicio (guardarlo, mostrarlo a las personas del mismo grupo, crear versiones reducidas de las fotos, etc.).",
              "El contenido solo es visible para las personas del mismo grupo. En el Comedor compartido, es visible para las personas de la misma sala dentro de lo que el usuario haya elegido mostrar.",
            ],
          },
        ],
      },
      {
        h: "Artículo 6 (Obligaciones del usuario)",
        blocks: [
          { p: "El usuario no debe subir el siguiente contenido ni realizar las siguientes acciones." },
          {
            ul: [
              "Contenido obsceno o violento, o que incite al odio o a la discriminación",
              "Contenido que acose o difame a otras personas, o que vulnere sus datos personales o su derecho a la propia imagen",
              "Contenido que vulnere los derechos de autor u otros derechos de propiedad intelectual de terceros",
              "Acciones que interfieran con el funcionamiento normal del Servicio, o tocar anuncios repetidamente por medios fraudulentos",
            ],
          },
          {
            p: "El usuario puede denunciar o bloquear contenido o personas inapropiadas desde la App. El Responsable revisa el contenido denunciado y, si infringe este artículo, puede eliminarlo o restringir el uso del Servicio al usuario correspondiente.",
          },
        ],
      },
      {
        h: "Artículo 7 (Publicidad)",
        blocks: [
          {
            ol: [
              "Para mantener el Servicio, el Responsable muestra anuncios nativos, anuncios intersticiales y anuncios con recompensa a través de Google AdMob.",
              "Las transacciones de productos o servicios que aparecen en los anuncios se realizan entre el usuario y el anunciante, y el Responsable no se hace responsable de su contenido.",
            ],
          },
        ],
      },
      {
        h: "Artículo 8 (Cambios e interrupción del Servicio)",
        blocks: [
          {
            ol: [
              "El Servicio se ofrece tal cual, y su contenido puede cambiar o interrumpirse por necesidades operativas o técnicas.",
              "Si el Servicio va a cerrar, el Responsable lo anunciará en esta página y en la App, en la medida de lo posible con 30 días de antelación.",
            ],
          },
        ],
      },
      {
        h: "Artículo 9 (Limitación de responsabilidad)",
        blocks: [
          {
            ol: [
              "El Responsable no se hace responsable del contenido que suben los usuarios ni de las disputas entre usuarios, salvo en caso de dolo o culpa grave por su parte.",
              "El Responsable no se hace responsable de las consecuencias de que no lleguen notificaciones por la configuración del dispositivo (notificaciones desactivadas, modo silencio, ahorro de batería, etc.).",
              "El Responsable no se hace responsable si el Servicio se interrumpe por desastres naturales u otros casos de fuerza mayor equivalentes.",
            ],
          },
        ],
      },
      {
        h: "Artículo 10 (Resolución de disputas)",
        blocks: [
          {
            ol: [
              "Si surge una disputa relacionada con el uso del Servicio, el Responsable y el usuario procurarán resolverla de buena fe mediante el diálogo.",
              "Si no se llega a un acuerdo, podrá presentarse una demanda ante el tribunal competente según la Ley de Procedimiento Civil de la República de Corea. Estos términos se rigen por las leyes de la República de Corea.",
            ],
          },
        ],
      },
      {
        h: "Datos del responsable",
        blocks: [
          {
            ul: [
              "Nombre comercial: 바리바리스튜디오 (Baribari Studio)",
              "Representante: 고주원 (Joowon Koh)",
              "Número de registro comercial: 895-14-03120",
              "Número de registro de venta a distancia: 2026-서울서초-3693",
              "Dirección: 서울특별시 서초구 바우뫼로 91, 2층 가2호 (91 Baumoe-ro, 2F Ga-2, Seocho-gu, Seoul, Republic of Korea)",
              "Contacto: [contact@joowonkoh.com](contact)",
            ],
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Eliminar tu cuenta de Tu comida, mi comida",
    description:
      "Cómo eliminar tu cuenta de “Tu comida, mi comida” y las fotos y registros de comidas que subiste. Puedes eliminarla directamente desde la app o, si no la tienes, solicitarlo por correo.",
    updatedAt: "18 de septiembre de 2026",
    mailSubject: "[네밥내밥] Solicitud de eliminación de cuenta",
    sections: [
      {
        h: "Eliminarla desde la app",
        blocks: [
          { p: "Es la forma más rápida. No tienes que esperar a que se procese una solicitud: se elimina en el momento." },
          {
            ol: [
              "Abre “Tu comida, mi comida” y toca la pestaña **Perfil** en la parte inferior de la pantalla.",
              "Toca **Eliminar cuenta**.",
              "Para confirmar, escribe **eliminar** y el botón se activará.",
            ],
          },
          {
            p: "La pestaña Perfil siempre está visible, aunque no pertenezcas a ningún grupo. Puedes eliminar tu cuenta incluso si solo abriste la app por primera vez e iniciaste sesión.",
          },
        ],
      },
      {
        h: "Si ya no tienes la app",
        blocks: [
          {
            p: "Si cambiaste de dispositivo o ya borraste la app, solicítalo por correo. Para verificar tu identidad, envíalo desde la dirección de correo con la que te registraste.",
          },
          { p: "Destinatario: [contact@joowonkoh.com](deleteMail)" },
          { p: "Lo procesaremos en un plazo de 7 días hábiles y te responderemos con el resultado." },
        ],
      },
      {
        h: "Qué se elimina",
        blocks: [
          { p: "Los siguientes datos se eliminan **de inmediato y de forma irreversible**." },
          {
            ul: [
              "La cuenta y los datos de inicio de sesión (dirección de correo, identificador de cuenta)",
              "El nombre visible",
              "Todos los archivos de fotos de comidas que subiste",
              "Los registros de comidas y sus fechas",
              "Las reacciones que dejaste en las comidas de otras personas",
              "Tu pertenencia a grupos",
              "El token de notificaciones push del dispositivo, guardado para recibir notificaciones",
            ],
          },
          {
            p: "Los grupos que creaste no desaparecen. Pasan a la persona que lleve más tiempo entre quienes quedan, y si no queda nadie, el grupo también desaparece. Nunca se borran los registros de otras personas junto con los tuyos.",
          },
        ],
      },
      {
        h: "Cuánto tiempo se conserva",
        blocks: [
          {
            p: "No hay un plazo de conservación aparte. Se borra en el momento en que tocas eliminar. Las copias que queden en los medios de respaldo desaparecen también en un máximo de 30 días, según el ciclo de respaldo.",
          },
        ],
      },
      {
        h: "Ver también",
        blocks: [{ p: "Qué información recopilamos y por qué está explicado en la [Política de privacidad](privacy)." }],
      },
    ],
  },
};

export default es;
