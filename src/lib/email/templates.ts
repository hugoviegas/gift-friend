/**
 * Email template base for Gift Friend
 * Provides HTML email structure with styling
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Base HTML template wrapper with styling
 */
function emailTemplate(content: string, title: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .logo-emoji {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      margin: 0 0 15px 0;
      font-size: 20px;
      color: #111827;
    }
    .content p {
      margin: 0 0 15px 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .cta-button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #dc2626;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
      transition: background-color 0.3s ease;
    }
    .cta-button:hover {
      background-color: #b91c1c;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 30px 0;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 30px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #dc2626;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .highlight {
      background-color: #fef2f2;
      padding: 15px;
      border-left: 4px solid #dc2626;
      margin: 15px 0;
      border-radius: 4px;
    }
    .code-block {
      background-color: #f3f4f6;
      padding: 12px 15px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #111827;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>
  `.trim();
}

/**
 * Welcome email template (new participant join or registration)
 */
export function welcomeTemplate(locale: "pt-BR" | "en"): EmailTemplate {
  const translations = {
    "pt-BR": {
      subject: "Bem-vindo ao Gift Friend! 🎁",
      title: "Bem-vindo",
      greeting: "Olá, {name}!",
      body: "Você se inscreveu com sucesso no Gift Friend. Agora você pode criar eventos, convidar amigos e organizar seu Secret Santa.",
      features: "O que você pode fazer:",
      feature1: "Criar eventos personalizados",
      feature2: "Convidar amigos para participar",
      feature3: "Gerenciar lista de presentes",
      feature4: "Realizar o sorteio secreto",
      cta: "Começar Agora",
      thanks: "Obrigado por escolher Gift Friend!",
      footer: "© 2025 Gift Friend. Todos os direitos reservados.",
    },
    en: {
      subject: "Welcome to Gift Friend! 🎁",
      title: "Welcome",
      greeting: "Hi, {name}!",
      body: "You have successfully joined Gift Friend. Now you can create events, invite friends, and organize your Secret Santa.",
      features: "What you can do:",
      feature1: "Create custom events",
      feature2: "Invite friends to participate",
      feature3: "Manage gift wishlists",
      feature4: "Run the Secret Santa draw",
      cta: "Get Started",
      thanks: "Thank you for choosing Gift Friend!",
      footer: "© 2025 Gift Friend. All rights reserved.",
    },
  };

  const t = translations[locale];

  const html = emailTemplate(
    `
    <div class="header">
      <div class="logo-emoji">🎁</div>
      <h1>Gift Friend</h1>
    </div>
    <div class="content">
      <h2>${t.greeting}</h2>
      <p>${t.body}</p>
      
      <div class="highlight">
        <strong>${t.features}</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>${t.feature1}</li>
          <li>${t.feature2}</li>
          <li>${t.feature3}</li>
          <li>${t.feature4}</li>
        </ul>
      </div>

      <p style="text-align: center; margin-top: 30px;">
        <a href="{actionUrl}" class="cta-button">${t.cta}</a>
      </p>

      <hr class="divider">
      <p>${t.thanks}</p>
    </div>
    <div class="footer">
      <p>${t.footer}</p>
    </div>
    `,
    t.title
  );

  return {
    subject: t.subject,
    html,
  };
}

/**
 * Event draw complete email template
 */
export function drawCompleteTemplate(locale: "pt-BR" | "en"): EmailTemplate {
  const translations = {
    "pt-BR": {
      subject: "Sorteio Concluído! 🎉",
      title: "Sorteio Concluído",
      greeting: "Olá, {name}!",
      body: 'O sorteio do evento "{eventName}" foi concluído! Você agora pode visualizar a quem você deve presentear.',
      instruction: "Clique no botão abaixo para ver seu resultado secreto:",
      cta: "Ver Meu Resultado",
      reminder:
        "Lembre-se: Mantenha segredo! O nome da pessoa que você vai presentear será revelado apenas para você até a data final do evento.",
      footer: "© 2025 Gift Friend. Todos os direitos reservados.",
    },
    en: {
      subject: "Draw Complete! 🎉",
      title: "Draw Complete",
      greeting: "Hi, {name}!",
      body: 'The draw for the event "{eventName}" has been completed! You can now see who you will be giving a gift to.',
      instruction: "Click the button below to see your secret assignment:",
      cta: "View My Result",
      reminder:
        "Remember: Keep it secret! The name of the person you will gift to is revealed only to you until the event's final date.",
      footer: "© 2025 Gift Friend. All rights reserved.",
    },
  };

  const t = translations[locale];

  const html = emailTemplate(
    `
    <div class="header">
      <div class="logo-emoji">🎉</div>
      <h1>Gift Friend</h1>
    </div>
    <div class="content">
      <h2>${t.greeting}</h2>
      <p>${t.body}</p>
      
      <p>${t.instruction}</p>

      <p style="text-align: center; margin-top: 30px;">
        <a href="{actionUrl}" class="cta-button">${t.cta}</a>
      </p>

      <div class="highlight">
        <strong>💡 ${t.reminder}</strong>
      </div>

      <hr class="divider">
    </div>
    <div class="footer">
      <p>${t.footer}</p>
    </div>
    `,
    t.title
  );

  return {
    subject: t.subject,
    html,
  };
}

/**
 * Reminder email template (before event date)
 */
export function reminderTemplate(
  locale: "pt-BR" | "en",
  daysRemaining: number
): EmailTemplate {
  const translations = {
    "pt-BR": {
      subject: "{days} dias para o sorteio! 🎁",
      title: "Lembrete de Evento",
      greeting: "Olá, {name}!",
      body: 'O sorteio do evento "{eventName}" acontecerá em {days} dias!',
      prepare:
        "Se você ainda não tem sua lista de presentes pronta, preparamos este lembrete para você não esquecer de criá-la.",
      cta: "Acessar Evento",
      footer: "© 2025 Gift Friend. Todos os direitos reservados.",
    },
    en: {
      subject: "{days} days until the draw! 🎁",
      title: "Event Reminder",
      greeting: "Hi, {name}!",
      body: 'The draw for the event "{eventName}" will take place in {days} days!',
      prepare:
        "If you haven't prepared your gift wishlist yet, we're sending this reminder so you don't forget to create it.",
      cta: "Access Event",
      footer: "© 2025 Gift Friend. All rights reserved.",
    },
  };

  const t = translations[locale];

  const html = emailTemplate(
    `
    <div class="header">
      <div class="logo-emoji">⏰</div>
      <h1>Gift Friend</h1>
    </div>
    <div class="content">
      <h2>${t.greeting}</h2>
      <p>${t.body}</p>
      
      <p>${t.prepare}</p>

      <p style="text-align: center; margin-top: 30px;">
        <a href="{actionUrl}" class="cta-button">${t.cta}</a>
      </p>

      <hr class="divider">
    </div>
    <div class="footer">
      <p>${t.footer}</p>
    </div>
    `,
    t.title
  );

  return {
    subject: t.subject.replace("{days}", String(daysRemaining)),
    html,
  };
}

/**
 * Event reveal email template (after event date)
 */
export function revealTemplate(locale: "pt-BR" | "en"): EmailTemplate {
  const translations = {
    "pt-BR": {
      subject: "A Verdade Foi Revelada! 🎁✨",
      title: "Revelação Final",
      greeting: "Olá, {name}!",
      body: 'O evento "{eventName}" chegou ao fim! Agora que a data de encerramento passou, todos podem saber quem presenteou quem.',
      reveal: "Clique no botão abaixo para ver todos os resultados do sorteio:",
      cta: "Ver Resultados",
      thanks: "Obrigado por participar do Gift Friend!",
      footer: "© 2025 Gift Friend. Todos os direitos reservados.",
    },
    en: {
      subject: "The Truth Has Been Revealed! 🎁✨",
      title: "Final Reveal",
      greeting: "Hi, {name}!",
      body: 'The event "{eventName}" has ended! Now that the end date has passed, everyone can see who gifted to whom.',
      reveal: "Click the button below to see all the draw results:",
      cta: "View Results",
      thanks: "Thank you for using Gift Friend!",
      footer: "© 2025 Gift Friend. All rights reserved.",
    },
  };

  const t = translations[locale];

  const html = emailTemplate(
    `
    <div class="header">
      <div class="logo-emoji">✨</div>
      <h1>Gift Friend</h1>
    </div>
    <div class="content">
      <h2>${t.greeting}</h2>
      <p>${t.body}</p>
      
      <p>${t.reveal}</p>

      <p style="text-align: center; margin-top: 30px;">
        <a href="{actionUrl}" class="cta-button">${t.cta}</a>
      </p>

      <hr class="divider">
      <p>${t.thanks}</p>
    </div>
    <div class="footer">
      <p>${t.footer}</p>
    </div>
    `,
    t.title
  );

  return {
    subject: t.subject,
    html,
  };
}

export default {
  welcomeTemplate,
  drawCompleteTemplate,
  reminderTemplate,
  revealTemplate,
};
