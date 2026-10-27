import type { Privacy } from "./types";

const pt: Privacy = {
  meta: {
    title: "Salariômetro: Política de Privacidade",
    description:
      "Quais informações o app para iOS e Android Salariômetro trata, quais serviços de terceiros usa para anúncios, estatísticas de uso e relatórios de falhas, e quais são as suas escolhas.",
  },
  badge: "Salariômetro · Legal",
  title: "Salariômetro: Política de Privacidade",
  updated: "Última atualização: 22 de outubro de 2026",
  sections: [
    {
      h: "1. Visão geral",
      body: [
        "O Salariômetro (o “App”) é um aplicativo para iOS e Android que mostra em tempo real quanto você ganhou até agora com base no salário que você informa. Esta política explica quais informações o App trata, para quê e quais escolhas você tem.",
        "Em resumo:",
        [
          "**O salário, as configurações e as fotos de desejos que você informa nunca saem do seu aparelho.** O App não tem contas nem servidor que receba seus dados.",
          "O App usa, porém, serviços do Google para **exibir anúncios**, gerar **estatísticas de uso** e enviar **relatórios de falhas**, e nesse processo o Google trata informações como dados do aparelho.",
          "O App **usa um identificador de publicidade para anúncios personalizados.** No iOS, o identificador de publicidade (IDFA) só é usado se você permitir no aviso de Transparência de Rastreamento de Apps (ATT). No Android, o ID de publicidade do aparelho (AAID) é usado sem aviso separado, e você pode desativá-lo a qualquer momento nas configurações do aparelho. Em ambos os casos, todos os recursos funcionam da mesma forma.",
        ],
        "Em caso de dúvidas, escreva para {email}.",
      ],
    },
    {
      h: "2. Informações que você informa",
      body: [
        "Tudo o que você informa no App — salário, jornada, configurações de exibição, pessoas adicionadas para comparar, desejos (foto, nome e preço) e registros de “Pago para enrolar” — é tratado assim:",
        [
          "**Fica armazenado somente no seu aparelho.** No iOS, o App usa um contêiner de App Group para que o App e os widgets mostrem os mesmos valores; no Android, o armazenamento privado do App.",
          "Ninguém, nem mesmo o desenvolvedor, pode ver essas informações, porque elas não são enviadas a lugar nenhum. Seu salário e suas fotos não são usados em anúncios nem em estatísticas (o que as estatísticas registram está na seção 4).",
          "Se o backup estiver ativado, os dados do App podem ser incluídos no Backup do iCloud da Apple ou no backup automático do Android do Google. Esse é o comportamento padrão do sistema operacional, não algo que o App solicita.",
        ],
        "**Fotos e câmera.** Ao adicionar um desejo ou personalizar a tela StandBy (iOS), o App usa apenas fotos que você mesmo tira ou escolhe. O acesso à câmera e à fototeca é pedido quando você usa esses recursos, e, se você recusar, o restante do App funciona normalmente. A remoção do fundo das fotos de desejos é feita no seu aparelho (Apple Vision no iOS, Google ML Kit no Android). As fotos ficam somente no seu aparelho e não são enviadas a lugar nenhum.",
        "O App não acessa sua localização, contatos, número de telefone, dados de pagamento nem dados de saúde.",
      ],
    },
    {
      h: "3. Publicidade (Google AdMob)",
      body: [
        "O App exibe anúncios por meio do Google AdMob: um banner na parte inferior da tela, anúncios premiados que você escolhe assistir (por exemplo, para recarregar alterações de valor ou ocultar o banner por um tempo) e anúncios intersticiais que aparecem de vez em quando ao usar alguns recursos.",
        "O identificador usado para anúncios personalizados e a forma de consentimento **dependem do sistema operacional.**",
        [
          "**iOS** — Perguntamos pelo aviso de Transparência de Rastreamento de Apps (ATT) e **só se você permitir** solicitamos anúncios de acordo com seus interesses usando o identificador de publicidade (IDFA). Caso contrário, apenas anúncios não personalizados são solicitados e o IDFA não é acessado.",
          "**Android** — Como não existe um equivalente ao ATT, o App não pergunta separadamente e **por padrão solicita anúncios personalizados usando o ID de publicidade do aparelho (AAID).** Se você excluir o ID de publicidade nas configurações do aparelho, a partir daí só serão exibidos anúncios não personalizados (veja a seção 8, Suas escolhas).",
        ],
        "Em todos os casos, todos os recursos do App funcionam da mesma forma.",
        "Sejam os anúncios personalizados ou não, o Google pode tratar as seguintes informações para veicular anúncios e evitar cliques fraudulentos:",
        [
          "Endereço IP e a localização aproximada inferida a partir dele (país ou cidade)",
          "Informações do aparelho, como tipo de aparelho, versão do sistema e idioma",
          "Interações com anúncios, como impressões e cliques",
          "Somente quando há anúncios personalizados, o identificador de publicidade (IDFA no iOS ou ID de publicidade no Android) e os interesses inferidos a partir dele",
        ],
        "No iOS, o App também é compatível com o SKAdNetwork da Apple, um método oferecido pela Apple para medir o desempenho dos anúncios sem identificar usuários individualmente.",
      ],
    },
    {
      h: "4. Estatísticas de uso (Google Analytics for Firebase)",
      body: [
        "Para entender quais recursos são realmente usados e melhorar o App, usamos o Google Analytics for Firebase. São tratados os seguintes itens:",
        [
          "**ID da instância do App** — um valor aleatório que o Firebase cria para cada instalação. Não está vinculado à sua identidade (nome, e-mail etc.) e desaparece quando você exclui o App.",
          "**Informações do aparelho e do ambiente** — tipo de aparelho, versão do sistema, idioma e país.",
          "**Eventos de uso** — registros de uso de recursos, como telas vistas, mudança de unidade de salário, comparações feitas, uso de widgets (iOS) e uso de Desejos e “Pago para enrolar”. Ao adicionar um desejo, o preço (apenas o número) é registrado; quando um desejo se completa, o tempo de trabalho que levou para ganhá-lo; e ao encerrar uma sessão de “Pago para enrolar”, a duração em segundos.",
        ],
        "**O valor do salário que você informa nunca é enviado.** Só é registrado o tipo de configuração, como a unidade escolhida (anual, mensal, diário ou por hora), não o valor em si. Fotos e nomes de desejos também não são enviados.",
      ],
    },
    {
      h: "5. Relatórios de falhas (Firebase Crashlytics)",
      body: [
        "Se o App fechar inesperadamente, um relatório de falha é enviado ao Firebase Crashlytics para que possamos encontrar e corrigir a causa. O relatório inclui o ponto do código onde o erro ocorreu (stack trace), o tipo de aparelho, a versão do sistema, o estado da memória e do armazenamento, o horário da falha e um identificador aleatório que o Crashlytics cria para cada instalação.",
        "Os relatórios de falhas não incluem seu salário, suas fotos nem os nomes dos seus desejos.",
      ],
    },
    {
      h: "6. Serviços de terceiros",
      body: [
        "Todos os serviços acima são fornecidos pelo Google, e essas informações são tratadas conforme as políticas do Google.",
        [
          "**Google AdMob** — exibição de anúncios e medição de desempenho",
          "**Google Analytics for Firebase** — estatísticas de uso",
          "**Firebase Crashlytics** — relatórios de falhas",
        ],
        "Para mais detalhes, consulte [Como o Google usa informações de sites ou apps que utilizam nossos serviços](https://policies.google.com/technologies/partner-sites). O App não vende suas informações a terceiros.",
      ],
    },
    {
      h: "7. Armazenamento e exclusão",
      body: [
        "Como seu salário, suas configurações e suas fotos existem apenas no seu aparelho, eles são excluídos junto com o App, e nenhuma cópia é mantida em outro lugar. As informações tratadas pelo Google para anúncios, estatísticas e relatórios de falhas são mantidas conforme as políticas do Google.",
      ],
    },
    {
      h: "8. Suas escolhas",
      body: [
        [
          "**iOS** — Em **Ajustes > Privacidade e Segurança > Rastreamento**, você pode mudar a qualquer momento se o App pode rastreá-lo. Se desativar, a partir daí só serão exibidos anúncios não personalizados. Também é possível limitar anúncios personalizados em **Publicidade da Apple**, no mesmo menu.",
          "**Android** — Em **Configurações > Segurança e privacidade > Privacidade > Anúncios** (ou **Configurações > Google > Todos os serviços > Anúncios**, dependendo do aparelho), escolha **Excluir ID de publicidade** e, a partir daí, só serão exibidos anúncios não personalizados.",
          "Você pode desativar o acesso à câmera e às fotos a qualquer momento nas configurações do aparelho.",
          "Excluir o App remove os dados armazenados no aparelho e o ID da instância do App.",
          "Para outras dúvidas ou solicitações, escreva para o e-mail acima.",
        ],
      ],
    },
    {
      h: "9. Privacidade de crianças",
      body: [
        "O App não se destina a crianças menores de 14 anos e não coleta informações que permitam identificar pessoalmente os usuários, incluindo a idade.",
      ],
    },
    {
      h: "10. Alterações nesta política",
      body: [
        "Esta política pode ser atualizada para refletir mudanças na legislação ou no App. Se mudar o que o App trata, atualizaremos esta política e a data de “Última atualização” antes de lançar a versão com a mudança.",
        "Esta política está disponível em vários idiomas. Se uma tradução divergir da versão em coreano, prevalece a versão em coreano.",
      ],
    },
  ],
};

export default pt;
