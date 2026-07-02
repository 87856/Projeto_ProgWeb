module.exports = ({ env }) => ({
  // ── Swagger / OpenAPI documentation ───────────────────────────────
  // Plugin oficial do Strapi 5: @strapi/plugin-documentation
  //
  // Endpoints úteis para o nosso projecto:
  //   GET /api/documentation  → Swagger UI (HTML navegável)
  //   GET /api/documentation.json  → especificação OpenAPI em JSON
  documentation: {
    enabled: true,
    config: {
      info: {
        name: 'DroneZone API',
        description:
          'API REST do projecto DroneZone. Documenta todos os endpoints ' +
          'dos content-types Drone e Zona de Voo, incluindo operações CRUD ' +
          'e operações de autenticação do plugin Users-Permissions.',
        version: '1.0.0',
      },
    },
  },
});
