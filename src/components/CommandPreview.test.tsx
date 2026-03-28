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
  it('renders the workflow heading and operational commands in English', async () => {
    const html = await renderCommandPreview('en');

    expect(html).toContain('How To Use TON618');
    expect(html).toContain('Current workflow');
    expect(html).toContain('Setup, tickets and verification');
    expect(html).toContain('The order teams follow today');
    expect(html).toContain('Key commands');
    expect(html).toContain('/setup');
    expect(html).toContain('/ticket');
    expect(html).toContain('/verify');
    expect(html).toContain('/staff');
    expect(html).toContain('/config center');
    expect(html).toContain('/audit');
    expect(html).toContain('/debug');
  });

  it('renders the workflow heading and role split in Spanish', async () => {
    const html = await renderCommandPreview('es');

    expect(html).toContain('Como Usar TON618');
    expect(html).toContain('Flujo actual');
    expect(html).toContain('Orden de rollout');
    expect(html).toContain('Comandos clave');
    expect(html).toContain('Quien usa que');
    expect(html).toContain('Administrador');
    expect(html).toContain('Staff');
    expect(html).toContain('Owner / operador');
  });
});
