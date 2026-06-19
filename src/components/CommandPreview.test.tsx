import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it } from 'vitest';
import i18n from '../locales/i18n';
import CommandPreview from './CommandPreview';

async function renderCommandPreview(language: 'en' | 'es') {
  await i18n.changeLanguage(language);

  return renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <CommandPreview />
    </I18nextProvider>,
  );
}

describe('CommandPreview', () => {
  it('renders the current workflow and core commands in English', async () => {
    const html = await renderCommandPreview('en');

    expect(html).toContain('How To Use TON618');
    expect(html).toContain('Current workflow');
    expect(html).toContain('English and Spanish are chosen during onboarding');
    expect(html).toContain('The current rollout order');
    expect(html).toContain('Choose the server language');
    expect(html).toContain('Enable /ticket and /verify');
    expect(html).toContain('Run daily workflows and control');
    expect(html).toContain('Core commands');
    expect(html).toContain('/setup');
    expect(html).toContain('/ticket');
    expect(html).toContain('/verify');
    expect(html).toContain('/staff');
    expect(html).toContain('/stats');
    expect(html).toContain('/config center');
    expect(html).toContain('/audit');
    expect(html).toContain('/debug');
    expect(html).not.toContain('/help');
    expect(html).not.toContain('/poll');
    expect(html).not.toContain('/suggest');
  });

  it('renders the current workflow and role split in Spanish', async () => {
    const html = await renderCommandPreview('es');

    expect(html).toContain('Cómo Usar TON618');
    expect(html).toContain('Flujo actual');
    expect(html).toContain('El orden real del lanzamiento');
    expect(html).toContain('El inglés y el español se eligen durante la configuración inicial');
    expect(html).toContain('Elige el idioma del servidor');
    expect(html).toContain('Activa /ticket y /verify');
    expect(html).toContain('Corre el flujo diario y el control');
    expect(html).toContain('Comandos clave');
    expect(html).toContain('Equipo');
    expect(html).toContain('Administrador / Propietario');
    expect(html).not.toContain('/help');
    expect(html).not.toContain('/poll');
    expect(html).not.toContain('/suggest');
  });
});
