import type { Copy } from "./types";

const pt: Copy = {
  appName: "Seu prato, meu prato",
  quote: ["“", "”"],
  store: { download: "Baixar" },

  landing: {
    meta: {
      title: "Seu prato, meu prato",
      description:
        "Um app para preencher sua bandeja com uma foto por refeição (café da manhã, almoço e jantar) e cuidar uns dos outros com a família ou os amigos. Página de apresentação e suporte do app “Seu prato, meu prato” para iOS e Android.",
      ogTitle: "Seu prato, meu prato — Em vez de perguntar se já comeu",
      ogDescription:
        "Um app para preencher sua bandeja com uma foto por refeição (café da manhã, almoço e jantar) e cuidar uns dos outros com a família ou os amigos.",
      ogAlt: "Imagem do app “Seu prato, meu prato”: uma bandeja branca sobre fundo amarelo-gema, com só o espaço do almoço preenchido em cor de tomate",
    },
    trayTitle: "Bandeja do app “Seu prato, meu prato”",
    greetings: [
      "O que você comeu hoje?",
      "Tá se alimentando direitinho?",
      "O almoço tava gostoso?",
      "Jantar de hoje, como se fosse juntinho",
    ],
    tagline: "Com uma foto do seu prato, divida a bandeja de hoje com a família e os amigos.",
    together: {
      title: "Uma mesa em comum",
      lead: "As bandejas de 2 a 12 pessoas, reunidas por um código de convite, ficam na mesma mesa. Sem precisar perguntar, dá pra ver quem ainda não comeu.",
    },
    featuresTitle: "O que dá pra fazer",
    features: [
      { title: "Um espaço por refeição", tail: "Tire uma foto ou escolha da galeria" },
      { title: "Você escolhe o enquadramento", tail: "Arraste e amplie pra não cortar a comida" },
      { title: "Cutucada no espaço vazio", tail: "Ainda não comeu? Dê uma cutucadinha" },
      { title: "Uma bandeja só", tail: "Envie uma vez e aparece em todos os grupos" },
      { title: "Reações · comentários", tail: "Um “que delícia” já basta" },
      { title: "Seu dia numa imagem", tail: "Salve a bandeja do dia na galeria" },
    ],
    statement: { before: "Em vez de “Já comeu?”, ", em: "o espaço vazio", after: " fala primeiro." },
    story: [
      "Pra quem mora sozinho, a comida é a primeira coisa que acaba sendo feita de qualquer jeito. O único jeito de saber é ligar e perguntar, e quase sempre a resposta é “já comi”.",
      "Por isso, em vez de perguntar, a gente deixou visível. Não é um app que automatiza a bronca, e sim um que poupa o trabalho de perguntar como a pessoa está. Por isso ele não reclama dos espaços vazios. As refeições são três, e o lanche é bônus.",
    ],
    faqTitle: "Perguntas frequentes",
    faq: [
      {
        q: "Quem pode ver minhas fotos?",
        a: "Só as pessoas que estão nos mesmos grupos que você. Essa restrição não fica nas telas do app, e sim no próprio banco de dados, então mesmo modificando o app ninguém consegue pegar as refeições dos outros. O armazenamento das fotos é privado e os links valem só por pouco tempo.",
      },
      {
        q: "Posso participar de um grupo da família e de um grupo de amigos ao mesmo tempo?",
        a: "Pode. Cada pessoa tem uma bandeja só, então, se você enviar o café da manhã uma vez, ele aparece em todos os grupos de que você faz parte. Não precisa enviar em cada grupo.",
      },
      {
        q: "Quantas cutucadas posso mandar?",
        a: "Pra não virar uma chuva de notificações, o servidor conta quantas você manda por dia. Quando acabarem, dá pra ver um anúncio curto e ganhar mais algumas, e isso também tem limite diário. O espaço do lanche é bônus, então não recebe cutucadas.",
      },
      {
        q: "Tem anúncios?",
        a: "Tem um anúncio de uma linha, desenhado pra combinar com o app, no topo das telas Câmera, Grupos e Perfil; anúncios de tela cheia que aparecem de vez em quando ao sair de uma foto ou depois de terminar um envio; e anúncios premiados que você só vê se quiser ganhar mais cutucadas. Também coletamos estatísticas de uso para melhorar o app. Os detalhes estão na política de privacidade.",
      },
      {
        q: "O que acontece se eu excluir minha conta?",
        a: "Dá pra excluir direto no app. Todas as fotos e registros que você enviou somem e não dá pra recuperar. Os grupos que você criou passam para quem está há mais tempo entre os que ficaram e, se não sobrar ninguém, o grupo também some.",
      },
    ],
    closing: {
      title: "Jantar de hoje, como se fosse juntinho",
      body: "Sugestões ou dúvidas? Mande um e-mail quando quiser.",
      privacy: "Política de privacidade",
      deleteAccount: "Como excluir a conta",
    },
  },

  join: {
    meta: {
      title: "Já comeu? · Seu prato, meu prato",
      description:
        "Você foi convidado pra mesa. Registre na bandeja o que você comeu hoje. Copie o código de convite, digite no app e você entra no grupo.",
      ogTitle: "Já comeu?",
      ogDescription: "Você foi convidado pra mesa · Registre na bandeja o que você comeu hoje",
      ogAlt: "Imagem de convite: sobre um fundo amarelo-gema claro, uma bandeja branca com os quatro espaços vazios, com uma colher cor de tomate e um garfo verde-menta dos lados",
    },
    trayTitle: "Uma bandeja vazia, ainda sem nada",
    title: "Já comeu?",
    sub: "Registre na bandeja o que você comeu hoje!",
    pill: "Convite pra mesa · Vamos encher juntos",
    step1: "Copie o código de convite",
    copyAria: "Copiar o código de convite {code}",
    noCodeAria: "Sem código de convite",
    copied: "Copiado!",
    missing: [
      "O link não tem código de convite ou foi cortado.",
      "Peça o código de novo pra quem te convidou.",
    ],
    step2: "Instale o app e digite o código",
    hint: {
      before: "Aba ",
      tab: "Grupos",
      after: " embaixo",
      add: "Adicionar grupo",
      join: "Entrar com código de convite",
    },
    openInApp: "Já tem o app? · Abrir no app",
    limit: "Até 12 pessoas por grupo. Se estiver cheio, não dá pra entrar.",
    about: "Sobre o “Seu prato, meu prato”",
    privacy: "Privacidade",
  },

  shell: {
    homeAria: "Ir para o início do “Seu prato, meu prato”",
    about: "Sobre",
    privacy: "Política de privacidade",
    terms: "Termos de uso",
    deleteAccount: "Excluir conta",
    language: "Idioma",
  },

  legal: {
    badge: "Seu prato, meu prato · Legal",
    updated: "Última atualização",
    koreanPrevails: "Esta é uma tradução; em caso de divergência, prevalece a versão em coreano.",
    koreanLink: "Ver a versão em coreano",
  },

  privacy: {
    title: "Política de privacidade – Seu prato, meu prato",
    description:
      "Informações sobre os dados tratados pelo “Seu prato, meu prato”, app para iOS e Android, quem pode ver suas fotos e registros de refeições e como excluir sua conta.",
    updatedAt: "6 de novembro de 2026",
    sections: [
      {
        h: "1. Visão geral",
        blocks: [
          {
            p: "O “Seu prato, meu prato” (네밥내밥; doravante, “o App”) é um aplicativo para iOS e Android que permite registrar com fotos as refeições do dia e compartilhá-las com as pessoas do mesmo grupo. Esta política explica quais informações o App trata, com quais finalidades e quais escolhas você tem como usuário.",
          },
          { p: "Em resumo:" },
          {
            ul: [
              "Suas fotos e registros de refeições ficam visíveis **apenas para as pessoas que estão nos mesmos grupos que você**.",
              "O App exibe **anúncios nativos, anúncios intersticiais e anúncios premiados do Google AdMob**. Os anúncios nativos aparecem como uma única linha, desenhada para combinar com as telas do App, no topo das telas Câmera, Grupos e Perfil; os intersticiais aparecem de vez em quando em tela cheia ao sair de uma foto ou depois de terminar um envio; os anúncios premiados você mesmo escolhe assistir quando suas cutucadas acabam. Para estatísticas de uso, usamos o Google Analytics for Firebase. Seu nome, e-mail, fotos e registros de refeições não são repassados a esses serviços.",
              "No iOS, depois do login, **perguntamos primeiro se você permite** o rastreamento de anúncios; mesmo que você recuse, pode usar todas as funções do App normalmente.",
              "Você pode excluir sua conta **diretamente no App**, e ao fazer isso suas fotos e registros também são apagados.",
              "No **Refeitório compartilhado** (um espaço em tempo real onde as pessoas se sentam e comem juntas, sem conversar), seu nome, seu personagem e seus movimentos ficam visíveis para as pessoas da mesma sala. No refeitório para comer sozinho, onde qualquer pessoa pode entrar, suas fotos só aparecem **se você ativar “Mostrar minha refeição”**.",
            ],
          },
          { p: "Em caso de dúvidas, entre em contato pelo [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Informações que coletamos",
        blocks: [
          {
            ul: [
              "**Endereço de e-mail**: recebido por meio do login com a Apple ou o Google. É usado apenas para identificar quem fez login.",
              "**Nome de exibição**: o nome que as pessoas dos seus grupos veem. Você mesmo escolhe e pode alterá-lo a qualquer momento.",
              "**Fotos das refeições**: fotos que você tira ou escolhe na galeria. São a própria finalidade do App.",
              "**Data e período de cada refeição**: necessários para saber a qual refeição de qual dia cada foto corresponde.",
              "**Token de notificações push do dispositivo**: armazenado para saber para onde enviar as notificações.",
              "**Comentários**: textos que você deixa nas refeições de pessoas do mesmo grupo. Só as pessoas desse grupo podem vê-los.",
              "**Foto de perfil**: uma foto que você mesmo envia. Só as pessoas dos mesmos grupos que você podem vê-la.",
              "**Registros de denúncias e bloqueios**: quem denunciou o quê e por quê, e quem bloqueou quem. São usados apenas para tratar conteúdo impróprio.",
              "**Identificador da conta**: uma sequência aleatória criada automaticamente no cadastro. Serve apenas para vincular fotos e registros ao seu dono e, ao contrário do nome ou do e-mail, não aparece na tela.",
              "**Apelidos**: nomes que você dá a pessoas dos seus grupos. Só você pode vê-los, e a pessoa apelidada não fica sabendo.",
              "**Chave do widget e token de notificações push do widget**: armazenados em cada dispositivo quando você usa o widget da tela inicial, para que o widget possa buscar as bandejas de hoje das pessoas escolhidas e se redesenhar quando uma nova refeição é enviada. São apagados quando você sai da conta ou exclui a conta.",
              "**Informações de uso do Refeitório compartilhado**: o refeitório em que você entrou, o lugar onde se sentou, por onde andou, as saudações que tocou (como “Bom apetite!”), e as refeições da bandeja que você carrega e as fotos escolhidas. São usadas apenas para mostrar às pessoas da mesma sala enquanto você estiver nela, e apagadas quando você sai da sala. Se você entrar como convidado por um navegador fora do App, um identificador de convidado aleatório é armazenado nesse dispositivo.",
            ],
          },
          { p: "Para anúncios e estatísticas de uso, são tratadas as seguintes informações." },
          {
            ul: [
              "**Informações de uso do App**: telas vistas e funções usadas, ID da instância do app, tipo de dispositivo e sistema operacional, e região aproximada. São usadas para entender quais funções são utilizadas e melhorar o App, e são tratadas pelo Google Analytics for Firebase.",
              "**Identificador de publicidade e informações de anúncios**: o IDFA no iOS ou o ID de publicidade no Android, e informações de exibição e cliques em anúncios. São usados para exibir anúncios e medir seu desempenho, e são tratados pelo Google AdMob. No iOS, se você recusar “Permitir que o app rastreie”, o IDFA não é usado e são exibidos anúncios não personalizados.",
            ],
          },
          {
            p: "O App não acessa sua localização exata, contatos, registro de chamadas, informações de saúde nem informações de pagamento.",
          },
        ],
      },
      {
        h: "3. Quem pode ver",
        blocks: [
          {
            p: "Suas fotos e registros de refeições ficam visíveis apenas para as pessoas que pertencem aos mesmos grupos que você. Essa restrição não fica nas telas do App, e sim **no próprio banco de dados** (Row Level Security), então, mesmo que alguém modifique o App ou imite diretamente a comunicação, não consegue obter as refeições dos outros.",
          },
          { p: "O armazenamento das fotos é privado, e os links para ver as fotos valem só por pouco tempo." },
          {
            p: "Os tokens de notificações push ficam em uma tabela separada que só o próprio titular pode ler. Nem as pessoas do mesmo grupo podem vê-los, porque quem conhece o token pode enviar notificações arbitrárias para aquele dispositivo.",
          },
          {
            p: "Comentários e reações ficam visíveis **apenas dentro do grupo em que foram deixados**. Mesmo sendo a mesma foto, pessoas de outros grupos não os veem. O conteúdo que você denuncia ou bloqueia deixa de aparecer para você a partir desse momento.",
          },
          {
            p: "O widget da tela inicial segue as mesmas regras das telas do App. Como os widgets também podem aparecer na tela de bloqueio, o filtro é restringido mais uma vez para que as fotos de quem bloqueou você também não apareçam.",
          },
          {
            p: "No **Refeitório compartilhado**, as pessoas da mesma sala veem em tempo real seu nome de exibição (“Convidado” para quem vem de fora do App), a cor do seu personagem, seu lugar e seus movimentos, e suas saudações. Não há chat.",
          },
          {
            ul: [
              "Na **mesa do grupo** só entram as pessoas daquele grupo. O servidor confere o login e a participação no grupo. As pessoas do grupo veem as fotos das refeições de hoje que cada um escolheu.",
              "No **refeitório para comer sozinho** qualquer pessoa pode entrar, por isso as fotos **ficam ocultas por padrão** e aparecem como desenhos de arroz, sopa e acompanhamentos. Só quando você ativa “Mostrar minha refeição para as pessoas do refeitório” as fotos escolhidas para a sua bandeja são entregues às pessoas daquela sala, por um endereço válido por apenas uma hora. Você pode desativar a qualquer momento.",
              "Você pode usar “Ocultar” para deixar de ver outras pessoas.",
            ],
          },
        ],
      },
      {
        h: "4. Serviços de terceiros",
        blocks: [
          {
            p: "O App não vende informações pessoais. Seu nome, e-mail, fotos e registros de refeições não são fornecidos a terceiros para fins de publicidade ou análise. Os serviços usados pelo App são os seguintes.",
          },
          {
            ul: [
              "**Supabase**: login e armazenamento de dados. Os servidores ficam na Coreia do Sul (Seul).",
              "**Cloudflare R2**: armazenamento das fotos das refeições e de perfil. Ficam guardadas de forma privada na região Ásia-Pacífico e, depois de verificar que você tem permissão para vê-las, são entregues por um endereço válido por apenas uma hora.",
              "**Expo**: entrega de notificações. No iOS passam pelo Apple APNs e no Android pelo Google FCM. São transmitidos o texto da notificação e o token do dispositivo.",
              "**Apple / Google**: login. Recebemos seu endereço de e-mail.",
              "**Google AdMob**: anúncios nativos, intersticiais e premiados. São transmitidos o identificador de publicidade, informações de exibição e cliques em anúncios e informações do dispositivo.",
              "**Google Analytics for Firebase**: estatísticas de uso. São transmitidos as informações de uso do App, o ID da instância do app e informações do dispositivo.",
              "**Cloudflare Workers e Durable Objects**: tela do Refeitório compartilhado e conexão em tempo real. Tratam seu nome de exibição, lugar, movimentos e saudações enquanto você está em uma sala, e os endereços das fotos que você decidiu mostrar, e os apagam quando você sai da sala. Para corrigir erros, parte dos registros de solicitações é guardada por alguns dias.",
              "**Apple APNs (widget)**: avisa o widget do iOS pelo token de notificações push do widget para que ele se redesenhe quando uma nova refeição é enviada.",
            ],
          },
          {
            p: "Você pode ver como o Google trata essas informações em [Como o Google usa as informações de sites ou apps que utilizam nossos serviços](google).",
          },
        ],
      },
      {
        h: "5. Prazo de retenção",
        blocks: [
          {
            p: "Guardamos as informações enquanto sua conta existir e as apagamos quando você exclui a conta. Não mantemos cópias separadas. As estatísticas de uso não ficam vinculadas à sua conta e são apagadas após 2 meses, conforme a configuração padrão do Google Analytics.",
          },
          {
            p: "No Refeitório compartilhado, o lugar, os movimentos, as saudações e os endereços das fotos são apagados quando você sai da sala, e fica guardado apenas quantas pessoas há em cada refeitório no momento.",
          },
        ],
      },
      {
        h: "6. Exclusão da conta",
        blocks: [
          { p: "Você pode excluí-la diretamente no App: **Perfil > Excluir conta**." },
          {
            p: "Ao excluir, são apagados por completo seu perfil e nome de exibição, sua foto de perfil, os arquivos de fotos enviados, seus registros de refeições, comentários, reações, registros de denúncias e bloqueios, sua participação em grupos, seu token de notificações push, os apelidos (os que você deu e os que deram a você), e a chave e o token de notificações push do widget, sem possibilidade de recuperação.",
          },
          {
            p: "Os grupos que você criou passam para quem está há mais tempo entre as pessoas que ficaram. Se não sobrar ninguém, o grupo também é apagado. A saída de uma pessoa não faz o grupo dos outros desaparecer.",
          },
        ],
      },
      {
        h: "7. Direitos do usuário",
        blocks: [
          {
            ul: [
              "Você pode alterar seu nome de exibição no App a qualquer momento.",
              "Você pode excluir imediatamente sua conta e todos os seus registros pelo método do item 6. Se você já desinstalou o App, consulte [Como excluir a conta](deleteAccount).",
              "Você pode desbloquear alguém a qualquer momento na aba Perfil > Pessoas bloqueadas.",
              "Você pode desativar as notificações a qualquer momento nas configurações do dispositivo.",
              "Você pode desativar o rastreamento de anúncios ou apagar o ID de publicidade a qualquer momento: no iOS, em Ajustes > Privacidade e Segurança > Rastreamento; no Android, em Configurações > Google > Anúncios.",
              "Para outras solicitações de acesso, correção ou exclusão, entre em contato pelo endereço de e-mail indicado acima.",
            ],
          },
        ],
      },
      {
        h: "8. Privacidade de crianças",
        blocks: [
          {
            p: "O App não é destinado a crianças menores de 14 anos e não coleta intencionalmente informações de usuários nessa faixa etária.",
          },
        ],
      },
      {
        h: "9. Alterações nesta política",
        blocks: [
          {
            p: "Esta política pode ser alterada para refletir mudanças na legislação ou no serviço. Se houver mudança nas informações tratadas, atualizaremos esta política antes de lançar a versão que inclui essa função e alteraremos também a data de “Última atualização”.",
          },
        ],
      },
    ],
  },

  terms: {
    title: "Termos de uso – Seu prato, meu prato",
    description:
      "Condições de uso, limites de responsabilidade e informações do responsável pelo “Seu prato, meu prato”, app para compartilhar fotos das refeições com as pessoas do seu grupo.",
    updatedAt: "6 de novembro de 2026",
    sections: [
      {
        h: "Artigo 1 (Objetivo)",
        blocks: [
          {
            p: "Estes termos têm como objetivo estabelecer as condições de uso do “Seu prato, meu prato” (doravante, “o Serviço”), aplicativo para iOS e Android oferecido pela 바리바리스튜디오 (Baribari Studio), representada por 고주원 (Joowon Koh) (doravante, “o Operador”), bem como os direitos, deveres e responsabilidades do Operador e dos usuários.",
          },
        ],
      },
      {
        h: "Artigo 2 (Conteúdo do Serviço)",
        blocks: [
          {
            ol: [
              "O Serviço permite que você registre fotos das suas refeições e compartilhe fotos, reações e comentários com as pessoas que pertencem aos mesmos grupos que você.",
              "O Serviço inclui funções como criar grupos e convidar pessoas, notificações e cutucadas, calendário de registros e colagens, widget da tela inicial e o Refeitório compartilhado (um espaço em tempo real onde as pessoas se sentam e comem juntas).",
              "O Serviço é gratuito, e são exibidos anúncios nas telas do Serviço.",
            ],
          },
        ],
      },
      {
        h: "Artigo 3 (Vigência e alteração dos termos)",
        blocks: [
          {
            ol: [
              "Estes termos entram em vigor ao serem publicados nesta página, e, ao fazer login no Serviço, considera-se que você concorda com eles.",
              "O Operador pode alterar estes termos, desde que não viole a legislação aplicável. Nesse caso, a data de vigência e o motivo serão informados nesta página a partir de 7 dias antes da data de vigência; alterações desfavoráveis ao usuário serão informadas a partir de 30 dias antes.",
              "Se você não concordar com os termos alterados, pode excluir sua conta e deixar de usar o Serviço.",
            ],
          },
        ],
      },
      {
        h: "Artigo 4 (Conta)",
        blocks: [
          {
            ol: [
              "Você usa o Serviço fazendo login com uma conta Apple ou Google.",
              "Você pode excluir sua conta a qualquer momento dentro do App. Ao excluí-la, as fotos e registros que você enviou também são apagados, sem possibilidade de recuperação. Os detalhes estão em [Como excluir a conta](deleteAccount).",
              "O tratamento de informações pessoais segue a [Política de privacidade](privacy).",
            ],
          },
        ],
      },
      {
        h: "Artigo 5 (Conteúdo publicado pelo usuário)",
        blocks: [
          {
            ol: [
              "Os direitos sobre o conteúdo que você publica, como fotos, comentários e nomes, pertencem a você.",
              "O Operador usa esse conteúdo apenas na medida necessária para prestar o Serviço (armazenar, mostrar às pessoas do mesmo grupo, criar miniaturas etc.).",
              "O conteúdo fica visível apenas para as pessoas dos mesmos grupos que você e, no Refeitório compartilhado, para as pessoas da mesma sala, dentro do que você escolheu mostrar.",
            ],
          },
        ],
      },
      {
        h: "Artigo 6 (Deveres do usuário)",
        blocks: [
          { p: "Você não deve publicar conteúdo nem praticar atos como os seguintes." },
          {
            ul: [
              "Conteúdo obsceno ou violento, ou que incite ódio ou discriminação",
              "Conteúdo que assedie ou difame outras pessoas, ou que viole os dados pessoais ou o direito de imagem de outras pessoas",
              "Conteúdo que viole direitos autorais ou outros direitos de propriedade intelectual de terceiros",
              "Atos que atrapalhem o funcionamento normal do Serviço ou que cliquem repetidamente em anúncios de forma fraudulenta",
            ],
          },
          {
            p: "Você pode denunciar ou bloquear conteúdo ou pessoas impróprias dentro do App. O Operador verifica o conteúdo denunciado e, se houver violação deste artigo, pode removê-lo ou restringir o uso do Serviço pelo usuário responsável.",
          },
        ],
      },
      {
        h: "Artigo 7 (Anúncios)",
        blocks: [
          {
            ol: [
              "Para manter o Serviço, o Operador exibe anúncios nativos, intersticiais e premiados por meio do Google AdMob.",
              "As transações de produtos ou serviços anunciados ocorrem entre você e o anunciante, e o Operador não se responsabiliza pelo conteúdo dos anúncios.",
            ],
          },
        ],
      },
      {
        h: "Artigo 8 (Alteração e interrupção do Serviço)",
        blocks: [
          {
            ol: [
              "O Serviço é oferecido no estado em que se encontra e pode ser alterado ou interrompido por necessidades operacionais ou técnicas.",
              "Se o Serviço for encerrado, avisaremos nesta página e no App, sempre que possível, com 30 dias de antecedência.",
            ],
          },
        ],
      },
      {
        h: "Artigo 9 (Limitação de responsabilidade)",
        blocks: [
          {
            ol: [
              "O Operador não se responsabiliza pelo conteúdo publicado pelos usuários nem por disputas entre usuários, exceto em caso de dolo ou culpa grave do Operador.",
              "O Operador não se responsabiliza por consequências de notificações que não chegaram por causa das configurações do dispositivo (notificações desativadas, modo silencioso, economia de bateria etc.).",
              "O Operador não se responsabiliza por interrupções do Serviço causadas por desastres naturais ou outros casos de força maior equivalentes.",
            ],
          },
        ],
      },
      {
        h: "Artigo 10 (Resolução de disputas)",
        blocks: [
          {
            ol: [
              "Se surgir uma disputa relacionada ao uso do Serviço, o Operador e o usuário buscarão resolvê-la por meio de negociação de boa-fé.",
              "Se não houver acordo, a ação poderá ser proposta no tribunal competente segundo o Código de Processo Civil da Coreia do Sul. Estes termos são regidos pelas leis da República da Coreia.",
            ],
          },
        ],
      },
      {
        h: "Informações do responsável",
        blocks: [
          {
            ul: [
              "Razão social: 바리바리스튜디오 (Baribari Studio)",
              "Representante: 고주원 (Joowon Koh)",
              "Número de registro da empresa: 895-14-03120",
              "Número de registro de vendas a distância: 2026-서울서초-3693",
              "Endereço: 서울특별시 서초구 바우뫼로 91, 2층 가2호 (91 Baumoe-ro, 2F Ga-2, Seocho-gu, Seoul, Republic of Korea)",
              "Contato: [contact@joowonkoh.com](contact)",
            ],
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Excluir sua conta – Seu prato, meu prato",
    description:
      "Como excluir sua conta do “Seu prato, meu prato” e as fotos e registros de refeições que você enviou. Dá pra excluir direto no app ou, se você não tiver o app, pedir por e-mail.",
    updatedAt: "18 de setembro de 2026",
    mailSubject: "[네밥내밥] Solicitação de exclusão de conta",
    sections: [
      {
        h: "Excluir direto no app",
        blocks: [
          { p: "É o jeito mais rápido. Não é preciso esperar uma solicitação ser processada: a conta é excluída na hora." },
          {
            ol: [
              "Abra o “Seu prato, meu prato” e toque na aba **Perfil** na parte de baixo da tela.",
              "Toque em **Excluir conta**.",
              "Para confirmar, digite **excluir** e o botão será ativado.",
            ],
          },
          {
            p: "A aba Perfil fica sempre visível, mesmo que você não faça parte de nenhum grupo. Dá pra excluir a conta mesmo que você só tenha aberto o app pela primeira vez e feito login.",
          },
        ],
      },
      {
        h: "Se você não tiver o app",
        blocks: [
          {
            p: "Se você trocou de aparelho ou já desinstalou o app, peça por e-mail. Para confirmarmos sua identidade, envie a partir do endereço de e-mail usado no cadastro.",
          },
          { p: "Para: [contact@joowonkoh.com](deleteMail)" },
          { p: "Processaremos o pedido em até 7 dias úteis e responderemos com o resultado." },
        ],
      },
      {
        h: "O que é apagado",
        blocks: [
          { p: "Os itens abaixo são apagados **imediatamente e de forma irreversível**." },
          {
            ul: [
              "A conta e os dados de login (endereço de e-mail, identificador da conta)",
              "O nome de exibição",
              "Todos os arquivos de fotos de refeições enviados",
              "Os registros de refeições e suas datas",
              "As reações que você deixou nas refeições de outras pessoas",
              "Sua participação em grupos",
              "O token de notificações push do dispositivo, salvo para receber notificações",
            ],
          },
          {
            p: "Os grupos que você criou não desaparecem. Eles passam para quem está há mais tempo entre as pessoas que ficaram e, se não sobrar ninguém, o grupo também é apagado. Os registros de outras pessoas nunca são apagados junto.",
          },
        ],
      },
      {
        h: "Por quanto tempo fica guardado",
        blocks: [
          {
            p: "Não há um prazo de retenção separado. Os dados são apagados no momento em que você toca em excluir. Cópias que restem em mídias de backup também desaparecem em até 30 dias, conforme o ciclo de backup.",
          },
        ],
      },
      {
        h: "Veja também",
        blocks: [{ p: "Quais informações coletamos e por quê está explicado na [Política de privacidade](privacy)." }],
      },
    ],
  },
};

export default pt;
