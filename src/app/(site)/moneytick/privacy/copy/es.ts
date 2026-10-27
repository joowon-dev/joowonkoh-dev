import type { Privacy } from "./types";

const es: Privacy = {
  meta: {
    title: "Sueldómetro: Política de privacidad",
    description:
      "Qué información trata la app de iOS y Android Sueldómetro, qué servicios de terceros usa para anuncios, estadísticas de uso e informes de fallos, y qué opciones tienes.",
  },
  badge: "Sueldómetro · Legal",
  title: "Sueldómetro: Política de privacidad",
  updated: "Última actualización: 22 de octubre de 2026",
  sections: [
    {
      h: "1. Resumen",
      body: [
        "Sueldómetro (la «App») es una aplicación para iOS y Android que muestra en tiempo real lo que has ganado hasta ahora a partir del sueldo que introduces. Esta política explica qué información trata la App, con qué fin y qué opciones tienes.",
        "En resumen:",
        [
          "**El sueldo, los ajustes y las fotos de deseos que introduces nunca salen de tu dispositivo.** La App no tiene cuentas ni ningún servidor que reciba tus datos.",
          "Sin embargo, la App usa servicios de Google para **mostrar anuncios**, obtener **estadísticas de uso** y enviar **informes de fallos**, y en ese proceso Google trata información como los datos del dispositivo.",
          "La App **usa un identificador publicitario para anuncios personalizados.** En iOS, el identificador publicitario (IDFA) solo se usa si lo permites en el aviso de Transparencia de Seguimiento de Apps (ATT). En Android, se usa el ID de publicidad del dispositivo (AAID) sin un aviso aparte, y puedes desactivarlo cuando quieras en los ajustes del dispositivo. En ambos casos, todas las funciones van igual.",
        ],
        "Si tienes cualquier duda, escribe a {email}.",
      ],
    },
    {
      h: "2. Información que introduces",
      body: [
        "Todo lo que introduces en la App —sueldo, horario, ajustes de visualización, personas que añades para comparar, deseos (foto, nombre y precio) y registros de «Pagado por escaquearte»— se trata así:",
        [
          "**Se guarda solo en tu dispositivo.** En iOS, la App usa un contenedor de App Group para que la App y sus widgets muestren los mismos valores; en Android, el almacenamiento privado de la App.",
          "Nadie, ni siquiera el desarrollador, puede ver esta información, porque no se envía a ningún sitio. Tu sueldo y tus fotos no se usan para anuncios ni para estadísticas (lo que registran las estadísticas está en la sección 4).",
          "Si tienes activadas las copias de seguridad, los datos de la App pueden incluirse en la copia de iCloud de Apple o en la copia de seguridad automática de Android de Google. Es el comportamiento normal del sistema operativo, no algo que pida la App.",
        ],
        "**Fotos y cámara.** Cuando añades un deseo o personalizas la pantalla StandBy (iOS), la App solo usa fotos que haces o eliges tú. El acceso a la cámara y a la fototeca se pide al usar estas funciones, y si lo rechazas el resto de la App funciona con normalidad. Quitar el fondo de las fotos de deseos se hace en tu dispositivo (Apple Vision en iOS, Google ML Kit en Android). Las fotos se guardan solo en tu dispositivo y no se suben a ningún sitio.",
        "La App no accede a tu ubicación, contactos, número de teléfono, datos de pago ni datos de salud.",
      ],
    },
    {
      h: "3. Publicidad (Google AdMob)",
      body: [
        "La App muestra anuncios mediante Google AdMob: un banner en la parte inferior de la pantalla, anuncios bonificados que eliges ver (por ejemplo, para recargar cambios de importe u ocultar el banner un rato) y anuncios intersticiales que aparecen de vez en cuando al usar algunas funciones.",
        "El identificador usado para anuncios personalizados y la forma de dar el consentimiento **dependen del sistema operativo.**",
        [
          "**iOS** — Te lo preguntamos mediante el aviso de Transparencia de Seguimiento de Apps (ATT) y **solo si lo permites** pedimos anuncios adaptados a tus intereses con el identificador publicitario (IDFA). Si no, solo se piden anuncios no personalizados y no se accede al IDFA.",
          "**Android** — Como no existe un equivalente a ATT, la App no pregunta aparte y **por defecto pide anuncios personalizados con el ID de publicidad del dispositivo (AAID).** Si eliminas el ID de publicidad en los ajustes del dispositivo, a partir de entonces solo se muestran anuncios no personalizados (ver la sección 8, Tus opciones).",
        ],
        "En todos los casos, todas las funciones de la App van igual.",
        "Sean los anuncios personalizados o no, Google puede tratar lo siguiente para servir anuncios y evitar clics fraudulentos:",
        [
          "La dirección IP y la ubicación aproximada que se deduce de ella (país o ciudad)",
          "Información del dispositivo, como el tipo de dispositivo, la versión del sistema y el idioma",
          "Interacciones con anuncios, como impresiones y clics",
          "Solo cuando se aplican anuncios personalizados, el identificador publicitario (IDFA en iOS o ID de publicidad en Android) y los intereses deducidos a partir de él",
        ],
        "En iOS, la App también admite SKAdNetwork de Apple, un método que ofrece Apple para medir el rendimiento de los anuncios sin identificar a cada usuario.",
      ],
    },
    {
      h: "4. Estadísticas de uso (Google Analytics for Firebase)",
      body: [
        "Para saber qué funciones se usan de verdad y mejorar la App, usamos Google Analytics for Firebase. Se trata lo siguiente:",
        [
          "**ID de instancia de la App** — un valor aleatorio que Firebase crea en cada instalación. No está vinculado a tu identidad (nombre, correo…) y desaparece al eliminar la App.",
          "**Información del dispositivo y del entorno** — tipo de dispositivo, versión del sistema, idioma y país.",
          "**Eventos de uso** — registros del uso de funciones, como pantallas vistas, cambios de unidad de sueldo, comparaciones, uso de widgets (iOS) y uso de Deseos y «Pagado por escaquearte». Al añadir un deseo se registra su precio (solo el número); cuando un deseo se llena, el tiempo de trabajo que costó ganarlo; y al terminar una sesión de «Pagado por escaquearte», su duración en segundos.",
        ],
        "**El importe del sueldo que introduces nunca se envía.** Solo se registra el tipo de ajuste, como qué unidad elegiste (anual, mensual, diario o por hora), no el importe en sí. Tampoco se envían las fotos ni los nombres de los deseos.",
      ],
    },
    {
      h: "5. Informes de fallos (Firebase Crashlytics)",
      body: [
        "Si la App se cierra inesperadamente, se envía un informe a Firebase Crashlytics para que podamos encontrar y corregir la causa. Incluye el punto del código donde ocurrió el error (traza de pila), el tipo de dispositivo, la versión del sistema, el estado de la memoria y del almacenamiento, la hora del fallo y un identificador aleatorio que Crashlytics crea en cada instalación.",
        "Los informes de fallos no incluyen tu sueldo, tus fotos ni los nombres de tus deseos.",
      ],
    },
    {
      h: "6. Servicios de terceros",
      body: [
        "Todo lo anterior lo proporciona Google, y esa información se trata según las políticas de Google.",
        [
          "**Google AdMob** — mostrar anuncios y medir su rendimiento",
          "**Google Analytics for Firebase** — estadísticas de uso",
          "**Firebase Crashlytics** — informes de fallos",
        ],
        "Para más detalles, consulta [Cómo utiliza Google la información de sitios web o aplicaciones que utilizan sus servicios](https://policies.google.com/technologies/partner-sites). La App no vende tu información a terceros.",
      ],
    },
    {
      h: "7. Conservación y eliminación",
      body: [
        "Como tu sueldo, tus ajustes y tus fotos solo están en tu dispositivo, se eliminan junto con la App y no se guarda ninguna copia en otro lugar. La información que Google trata para anuncios, estadísticas e informes de fallos se conserva según las políticas de Google.",
      ],
    },
    {
      h: "8. Tus opciones",
      body: [
        [
          "**iOS** — En **Ajustes > Privacidad y seguridad > Rastreo** puedes cambiar cuando quieras si la App puede rastrearte. Si lo desactivas, a partir de entonces solo se muestran anuncios no personalizados. También puedes limitar los anuncios personalizados en **Publicidad de Apple**, en el mismo menú.",
          "**Android** — En **Ajustes > Seguridad y privacidad > Privacidad > Anuncios** (o **Ajustes > Google > Todos los servicios > Anuncios** en algunos dispositivos), elige **Eliminar ID de publicidad** y, a partir de entonces, solo se mostrarán anuncios no personalizados.",
          "Puedes desactivar el acceso a la cámara y a las fotos cuando quieras en los ajustes del dispositivo.",
          "Al eliminar la App se borran los datos guardados en el dispositivo y el ID de instancia de la App.",
          "Para cualquier otra duda o solicitud, escribe a la dirección de correo indicada arriba.",
        ],
      ],
    },
    {
      h: "9. Privacidad de los menores",
      body: [
        "La App no está dirigida a menores de 14 años y no recoge información que permita identificar personalmente a los usuarios, incluida su edad.",
      ],
    },
    {
      h: "10. Cambios en esta política",
      body: [
        "Esta política puede actualizarse para reflejar cambios legales o de la App. Si cambia lo que trata la App, actualizaremos esta política y su fecha de «Última actualización» antes de publicar la versión que incluya el cambio.",
        "Esta política está disponible en varios idiomas. Si una traducción difiere de la versión coreana, prevalece la versión coreana.",
      ],
    },
  ],
};

export default es;
