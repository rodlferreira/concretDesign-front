# Verificação de segurança — 7 de novembro de 2026

- `npm audit --omit=dev`: nenhuma vulnerabilidade conhecida nas dependências de produção do frontend e da API.
- `glob` e `minimatch`, usados pelo Jest, foram fixados via overrides em versões corrigidas. Os testes foram repetidos após a atualização.
- O Jest depende de `deepmerge@4.3.1`, com o alerta de baixa gravidade [GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4), sem versão corrigida publicada nesta verificação. O npm apresenta cinco entradas de baixa gravidade pela cadeia de dependências, referentes a esta causa. É uma dependência exclusiva do ambiente de testes, usada com configuração local controlada; não integra o bundle nem o servidor em produção. Não executar configurações Jest de origem não confiável. Atualizar quando houver correção upstream.
- Os testes verificam validação estrita, origens, limites, idempotência, cifragem em disco e isolamento de IPs atrás de proxies explicitamente confiáveis.
- A configuração HTTPS/CSP do Nginx é um exemplo a aplicar no alojamento; não houve publicação nem auditoria de uma infraestrutura externa.

Ver o README da API para chaves, SMTP, proxies, retenção e backups. Nenhuma auditoria elimina a necessidade de manutenção e monitorização.
