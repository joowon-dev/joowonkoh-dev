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
        a: "Hay anuncios de pantalla completa que aparecen de vez en cuando al salir de una foto o al terminar de subir una, y anuncios con recompensa que solo ves si quieres conseguir más toques. No hay banners fijos en pantalla. También recopilamos estadísticas de uso para mejorar la app. Encontrarás los detalles en la política de privacidad.",
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
    updatedAt: "16 de octubre de 2026",
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
              "La App muestra **anuncios intersticiales y anuncios con recompensa de Google AdMob**. Los intersticiales aparecen de vez en cuando a pantalla completa al salir de una foto o al terminar de subir una; los anuncios con recompensa los eliges ver tú mismo cuando se te acaban los toques. No hay banners fijos en pantalla. Para las estadísticas de uso utilizamos Google Analytics for Firebase. Tu nombre, correo, fotos y registros de comidas no se comparten con estos servicios.",
              "En iOS, después de iniciar sesión **te preguntamos primero si permites** el rastreo publicitario; aunque lo rechaces, puedes usar todas las funciones de la App.",
              "Puedes eliminar tu cuenta **directamente desde la App**, y al hacerlo se borran también tus fotos y registros.",
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
              "**Google AdMob**: anuncios intersticiales y con recompensa. Se transmiten el identificador publicitario, información de impresiones y clics de anuncios, e información del dispositivo.",
              "**Google Analytics for Firebase**: estadísticas de uso. Se transmiten la información de uso de la App, el ID de instancia de la app e información del dispositivo.",
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
        ],
      },
      {
        h: "6. Eliminación de la cuenta",
        blocks: [
          { p: "Puedes eliminarla directamente desde la App: **Perfil > Eliminar cuenta**." },
          {
            p: "Al eliminarla se borran por completo tu perfil y nombre visible, tu foto de perfil, los archivos de fotos que subiste, tus registros de comidas, comentarios, reacciones, registros de denuncias y bloqueos, tu pertenencia a grupos y tu token de notificaciones push, y no se puede deshacer.",
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
