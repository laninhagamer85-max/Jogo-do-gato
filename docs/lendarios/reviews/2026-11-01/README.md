# Revisão de gravação — não publicada

Aplicar `save-retry.patch` somente ao checkout da fonte Sites `6d39bb4c54da12d7e0f5818722a8677b4b4d355f` (Lendários1.0.17). A verificação `git apply --check` passou nessa fonte. O patch inclui a versão alvo1.0.18 e o teste de quota; não altera saves nem configurações de autenticação.

Não aplicar diretamente sobre a fonte GitHub antiga. Leia `docs/lendarios/runs/2026-11-01.md`: publicação retida por dez falhas funcionais preexistentes e defasagem da fonte GitHub. Duas falhas adicionais de timeout passaram isoladas. Fixtures de navegador não entram no pacote.

Meu Pet Virtual não é destino desta revisão. Nenhum deploy foi executado.
