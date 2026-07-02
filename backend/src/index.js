'use strict';

// Dados iniciais dos drones (iguais aos do site em site/js/dados.js)
const dronesSeed = [
  {
    nome: 'SkyFalcon X1',
    categoria: 'Fotografia',
    preco: 899,
    autonomia: 34,
    alcance: 10,
    velocidade: 68,
    peso: 249,
    camara: '4K / 48MP',
    imagem: 'imagens/drone-1.png',
    descricao: 'Drone leve e dobrável, perfeito para fotografia e vídeo aéreo em 4K.',
  },
  {
    nome: 'AeroScout 200',
    categoria: 'Profissional',
    preco: 1799,
    autonomia: 41,
    alcance: 15,
    velocidade: 72,
    peso: 920,
    camara: '5.4K / 50MP',
    imagem: 'imagens/drone-2.png',
    descricao: 'Drone profissional com sensores de obstáculos e câmara de cinema.',
  },
  {
    nome: 'NanoFly Mini',
    categoria: 'Iniciante',
    preco: 299,
    autonomia: 18,
    alcance: 4,
    velocidade: 36,
    peso: 89,
    camara: '2.7K',
    imagem: 'imagens/drone-3.png',
    descricao: 'Pequeno, barato e fácil de pilotar. Ideal para quem está a começar.',
  },
  {
    nome: 'StormRider FPV',
    categoria: 'Corrida',
    preco: 649,
    autonomia: 12,
    alcance: 6,
    velocidade: 140,
    peso: 410,
    camara: '4K / 60fps',
    imagem: 'imagens/drone-4.png',
    descricao: 'Drone de corrida FPV super rápido para voos de adrenalina.',
  },
  {
    nome: 'CargoLift H8',
    categoria: 'Industrial',
    preco: 4500,
    autonomia: 28,
    alcance: 12,
    velocidade: 55,
    peso: 3200,
    camara: 'Sem câmara',
    imagem: 'imagens/drone-5.png',
    descricao: 'Drone de carga capaz de transportar até 8 kg para uso industrial.',
  },
  {
    nome: 'AgroDrone Field',
    categoria: 'Agricultura',
    preco: 5200,
    autonomia: 22,
    alcance: 8,
    velocidade: 48,
    peso: 6800,
    camara: 'Multiespectral',
    imagem: 'imagens/drone-6.png',
    descricao: 'Drone agrícola para pulverização e análise de campos de cultivo.',
  },
];

// Dados iniciais das zonas de voo (usados no mapa do site - Google Maps)
// Coordenadas aproximadas em Portugal. tipo: Permitida | Restrita | Proibida
const zonasSeed = [
  {
    nome: 'Praia de Carcavelos',
    tipo: 'Permitida',
    latitude: 38.6797,
    longitude: -9.337,
    raio: 1000,
    altitudeMax: 120,
    descricao: 'Zona aberta junto à costa, boa para fotografia aérea.',
  },
  {
    nome: 'Serra da Estrela',
    tipo: 'Permitida',
    latitude: 40.3217,
    longitude: -7.6109,
    raio: 5000,
    altitudeMax: 120,
    descricao: 'Área de montanha com espaço amplo para voo recreativo.',
  },
  {
    nome: 'Parque Eduardo VII (Lisboa)',
    tipo: 'Restrita',
    latitude: 38.7286,
    longitude: -9.1536,
    raio: 1200,
    altitudeMax: 60,
    descricao: 'Zona urbana — voo permitido apenas com autorização e baixa altitude.',
  },
  {
    nome: 'Ria de Aveiro',
    tipo: 'Restrita',
    latitude: 40.6443,
    longitude: -8.6455,
    raio: 2000,
    altitudeMax: 60,
    descricao: 'Área protegida — atenção à fauna e à presença de pessoas.',
  },
  {
    nome: 'Aeroporto de Lisboa',
    tipo: 'Proibida',
    latitude: 38.7742,
    longitude: -9.1342,
    raio: 8000,
    altitudeMax: 0,
    descricao: 'Espaço aéreo controlado. Voo de drones proibido.',
  },
  {
    nome: 'Aeroporto do Porto',
    tipo: 'Proibida',
    latitude: 41.2421,
    longitude: -8.679,
    raio: 8000,
    altitudeMax: 0,
    descricao: 'Espaço aéreo controlado. Voo de drones proibido.',
  },
];

/**
 * Modelo de papéis (RBAC) do projecto:
 *
 *   1) Public          → sem login. Apenas pode LER (find / findOne).
 *   2) Authenticated   → login feito. Tem CRUD completo nos Drones
 *                        e nas Zonas de Voo (find/findOne/create/
 *                        update/delete). É o "papel com mais acesso".
 *
 * O bootstrap abaixo garante que ambos os papéis existem com as
 * permissões correctas à primeira execução do Strapi.
 */

// helpers internos
async function ensurePermissions(roleId, actions, scope = 'plugin::users-permissions.permission') {
  for (const action of actions) {
    const existing = await strapi
      .query(scope)
      .findOne({ where: { action, role: roleId } });

    if (!existing) {
      await strapi.query(scope).create({ data: { action, role: roleId } });
      strapi.log.info(`Permissão criada [${action}]`);
    }
  }
}

async function getRoleByType(type) {
  return strapi.query('plugin::users-permissions.role').findOne({
    where: { type },
  });
}

module.exports = {
  /** Executado antes da aplicação inicializar. */
  register(/* { strapi } */) {},

  /**
   * Executado antes da aplicação arrancar. Aqui semeamos a base de
   * dados e configuramos os papéis + permissões RBAC.
   */
  async bootstrap({ strapi }) {
    // ── 1) Semear os DRONES na primeira vez ────────────────────────
    const totalDrones = await strapi.documents('api::drone.drone').count();
    if (totalDrones === 0) {
      for (const drone of dronesSeed) {
        await strapi.documents('api::drone.drone').create({
          data: drone,
          status: 'published',
        });
      }
      strapi.log.info(`Seed concluído: ${dronesSeed.length} drones criados.`);
    }

    // ── 2) Semear as ZONAS DE VOO na primeira vez ──────────────────
    const totalZonas = await strapi.documents('api::zona-voo.zona-voo').count();
    if (totalZonas === 0) {
      for (const zona of zonasSeed) {
        await strapi.documents('api::zona-voo.zona-voo').create({
          data: zona,
          status: 'published',
        });
      }
      strapi.log.info(`Seed concluído: ${zonasSeed.length} zonas de voo criadas.`);
    }

    // ── 3) RBAC ─ Public: find/findOne (papel restrito) ──────────
    const publicRole = await getRoleByType('public');
    if (publicRole) {
      await ensurePermissions(publicRole.id, [
        'api::drone.drone.find',
        'api::drone.drone.findOne',
        'api::zona-voo.zona-voo.find',
        'api::zona-voo.zona-voo.findOne',
      ]);
      strapi.log.info('RBAC: permissões do papel "public" aplicadas.');
    }

    // ── 4) RBAC ─ Authenticated: CRUD completo (papel com mais acesso)
    const authRole = await getRoleByType('authenticated');
    if (authRole) {
      await ensurePermissions(authRole.id, [
        'api::drone.drone.find',
        'api::drone.drone.findOne',
        'api::drone.drone.create',
        'api::drone.drone.update',
        'api::drone.drone.delete',
        'api::zona-voo.zona-voo.find',
        'api::zona-voo.zona-voo.findOne',
        'api::zona-voo.zona-voo.create',
        'api::zona-voo.zona-voo.update',
        'api::zona-voo.zona-voo.delete',
      ]);
      strapi.log.info('RBAC: permissões do papel "authenticated" aplicadas.');
    }
  },
};
