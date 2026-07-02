// =====================================================================
//  app/sobre/page.tsx — Página estática "Sobre"
// =====================================================================

export default function SobrePage() {
  return (
    <>
      <h1 className="dz-section-title">O que é um drone?</h1>
      <p className="dz-subtitulo">Uma explicação simples para quem nunca pilotou.</p>

      <div className="dz-card p-4 mb-3">
        <h2 className="text-info">Definição</h2>
        <p className="text-secondary">
          Um <b>drone</b> é uma aeronave que voa <b>sem piloto a bordo</b>. É controlado à
          distância por um comando ou por um telemóvel, ou pode até voar sozinho seguindo um
          percurso programado por GPS.
        </p>
        <p className="text-secondary">
          A maioria dos drones civis tem <b>quatro hélices</b> (por isso também se chamam
          "quadcópteros") e uma câmara para tirar fotos e gravar vídeo.
        </p>
      </div>

      <div className="dz-card p-4 mb-3">
        <h2 className="text-info">Para que servem?</h2>
        <p className="text-secondary">Os drones são usados em muitas áreas. Por exemplo:</p>
        <ul className="text-secondary">
          <li><b>Fotografia e vídeo</b> — imagens aéreas para cinema e turismo.</li>
          <li><b>Agricultura</b> — pulverizar e vigiar os campos de cultivo.</li>
          <li><b>Entregas</b> — transportar pequenas encomendas.</li>
          <li><b>Segurança</b> — vigilância e buscas de pessoas desaparecidas.</li>
          <li><b>Desporto</b> — corridas de drones de alta velocidade (FPV).</li>
        </ul>
      </div>

      <div className="dz-card p-4 mb-3">
        <h2 className="text-info">Partes principais</h2>
        <p className="text-secondary">Quase todos os drones têm estas partes:</p>
        <ul className="text-secondary">
          <li><b>Motores e hélices</b> — fazem o drone subir e mexer-se.</li>
          <li><b>Bateria</b> — dá energia (define quantos minutos voa).</li>
          <li><b>Câmara</b> — tira fotos e grava vídeo.</li>
          <li><b>Comando</b> — o controlo que o piloto usa no chão.</li>
        </ul>
      </div>

     
    </>
  );
}
